'use strict';

const { db } = require('../db/database');

const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// ------------------------------------------------------------------
// Métricas derivadas
// ------------------------------------------------------------------

/**
 * Enriquece una fila de insumo con las métricas de decisión del almacén:
 *  - cobertura_dias : cuántos días aguanta el stock al ritmo de consumo actual
 *  - punto_reorden  : nivel a partir del cual hay que emitir el pedido
 *  - dias_hasta_pedido : margen antes de tener que despachar el camión
 *  - fecha_quiebre  : día estimado en que el insumo llega a cero
 */
function enriquecer(row) {
  const consumo = Number(row.consumo_diario) || 0;
  const stock = Number(row.stock_actual) || 0;
  const leadTime = Number(row.lead_time_dias) || 0;

  const cobertura = consumo > 0 ? stock / consumo : null;
  const puntoReorden = consumo * leadTime + Number(row.stock_minimo || 0);

  let estado = 'OPERATIVO';
  if (stock <= 0) estado = 'QUIEBRE';
  else if (cobertura !== null && cobertura <= leadTime) estado = 'CRITICO';
  else if (stock <= puntoReorden) estado = 'ADVERTENCIA';

  let fechaQuiebre = null;
  if (cobertura !== null && Number.isFinite(cobertura)) {
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(cobertura));
    fechaQuiebre = d.toISOString().slice(0, 10);
  }

  const diasHastaPedido = consumo > 0 ? Math.max(0, (stock - puntoReorden) / consumo) : null;

  return {
    ...row,
    cobertura_dias: cobertura === null ? null : round(cobertura, 1),
    punto_reorden: round(puntoReorden),
    dias_hasta_pedido: diasHastaPedido === null ? null : round(diasHastaPedido, 1),
    fecha_quiebre: fechaQuiebre,
    estado,
  };
}

function listarInsumos() {
  const rows = db.prepare('SELECT * FROM insumos ORDER BY nombre').all();
  return rows.map(enriquecer);
}

function obtenerInsumo(id) {
  const row = db.prepare('SELECT * FROM insumos WHERE id = ?').get(id);
  return row ? enriquecer(row) : null;
}

function crearInsumo(data) {
  const stmt = db.prepare(`
    INSERT INTO insumos (sku, nombre, categoria, unidad, stock_actual, stock_minimo,
                         consumo_diario, lead_time_dias)
    VALUES (@sku, @nombre, @categoria, @unidad, @stock_actual, @stock_minimo,
            @consumo_diario, @lead_time_dias)
  `);
  const info = stmt.run(normalizar(data));

  // El stock inicial cargado en el alta queda asentado como movimiento auditable.
  if (Number(data.stock_actual) > 0) {
    db.prepare(`
      INSERT INTO movimientos (insumo_id, tipo, cantidad, responsable, motivo)
      VALUES (?, 'ENTRADA', ?, ?, 'Inventario de apertura')
    `).run(info.lastInsertRowid, Number(data.stock_actual), data.responsable || 'Sistema');
  }
  return obtenerInsumo(info.lastInsertRowid);
}

function actualizarInsumo(id, data) {
  const actual = db.prepare('SELECT * FROM insumos WHERE id = ?').get(id);
  if (!actual) return null;
  const merged = normalizar({ ...actual, ...data });
  db.prepare(`
    UPDATE insumos SET sku = @sku, nombre = @nombre, categoria = @categoria, unidad = @unidad,
                       stock_actual = @stock_actual, stock_minimo = @stock_minimo,
                       consumo_diario = @consumo_diario, lead_time_dias = @lead_time_dias
     WHERE id = @id
  `).run({ ...merged, id });
  return obtenerInsumo(id);
}

function eliminarInsumo(id) {
  return db.prepare('DELETE FROM insumos WHERE id = ?').run(id).changes > 0;
}

function normalizar(d) {
  return {
    sku: String(d.sku || '').trim().toUpperCase(),
    nombre: String(d.nombre || '').trim(),
    categoria: String(d.categoria || 'Sin categoría').trim(),
    unidad: String(d.unidad || 'unidades').trim(),
    stock_actual: Math.max(0, Number(d.stock_actual) || 0),
    stock_minimo: Math.max(0, Number(d.stock_minimo) || 0),
    consumo_diario: Math.max(0, Number(d.consumo_diario) || 0),
    lead_time_dias: Math.max(0, parseInt(d.lead_time_dias, 10) || 0),
  };
}

// ------------------------------------------------------------------
// Movimientos
// ------------------------------------------------------------------

/** Registra una entrada o salida y ajusta el stock en una sola transacción. */
const registrarMovimiento = db.transaction((mov) => {
  const insumo = db.prepare('SELECT * FROM insumos WHERE id = ?').get(mov.insumo_id);
  if (!insumo) throw Object.assign(new Error('El insumo no existe'), { status: 404 });

  const cantidad = Number(mov.cantidad);
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    throw Object.assign(new Error('La cantidad debe ser mayor a cero'), { status: 400 });
  }
  const tipo = String(mov.tipo || '').toUpperCase();
  if (!['ENTRADA', 'SALIDA'].includes(tipo)) {
    throw Object.assign(new Error('El tipo debe ser ENTRADA o SALIDA'), { status: 400 });
  }

  const nuevoStock = tipo === 'ENTRADA'
    ? insumo.stock_actual + cantidad
    : insumo.stock_actual - cantidad;

  if (nuevoStock < 0) {
    throw Object.assign(
      new Error(`No hay stock suficiente: quedan ${insumo.stock_actual} ${insumo.unidad}`),
      { status: 400 },
    );
  }

  db.prepare('UPDATE insumos SET stock_actual = ? WHERE id = ?').run(round(nuevoStock), insumo.id);
  const info = db.prepare(`
    INSERT INTO movimientos (insumo_id, tipo, cantidad, responsable, motivo)
    VALUES (?, ?, ?, ?, ?)
  `).run(insumo.id, tipo, cantidad, mov.responsable || 'Sistema', mov.motivo || null);

  return {
    movimiento: db.prepare('SELECT * FROM movimientos WHERE id = ?').get(info.lastInsertRowid),
    insumo: obtenerInsumo(insumo.id),
  };
});

function historial(insumoId, limite = 100) {
  return db.prepare(`
    SELECT * FROM movimientos WHERE insumo_id = ? ORDER BY fecha DESC, id DESC LIMIT ?
  `).all(insumoId, limite);
}

/**
 * Reconstruye el nivel de stock día a día hacia atrás desde el stock actual,
 * y proyecta el runway hacia adelante hasta la fecha estimada de quiebre.
 */
function serieStock(insumoId, dias = 30) {
  const insumo = obtenerInsumo(insumoId);
  if (!insumo) return null;

  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const desdeISO = desde.toISOString().slice(0, 10);

  const movs = db.prepare(`
    SELECT tipo, cantidad, date(fecha) AS dia FROM movimientos
     WHERE insumo_id = ? AND date(fecha) >= ? ORDER BY fecha ASC, id ASC
  `).all(insumoId, desdeISO);

  // Neto por día
  const netoPorDia = new Map();
  for (const m of movs) {
    const delta = m.tipo === 'ENTRADA' ? m.cantidad : -m.cantidad;
    netoPorDia.set(m.dia, (netoPorDia.get(m.dia) || 0) + delta);
  }

  // Caminar hacia atrás desde hoy
  const historico = [];
  let stock = insumo.stock_actual;
  for (let i = 0; i <= dias; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    historico.push({ fecha: key, stock: round(Math.max(0, stock)) });
    stock -= netoPorDia.get(key) || 0;
  }
  historico.reverse();

  // Proyección hasta el quiebre (máx. 45 días vista)
  const proyeccion = [];
  const consumo = insumo.consumo_diario;
  if (consumo > 0) {
    const horizonte = Math.min(45, Math.ceil(insumo.stock_actual / consumo) + 1);
    for (let i = 0; i <= horizonte; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      proyeccion.push({
        fecha: d.toISOString().slice(0, 10),
        stock: round(Math.max(0, insumo.stock_actual - consumo * i)),
      });
    }
  }

  // Consumo promedio realmente observado en la ventana
  const salidas = movs.filter((m) => m.tipo === 'SALIDA');
  const consumoObservado = salidas.length
    ? round(salidas.reduce((a, m) => a + m.cantidad, 0) / dias)
    : 0;

  return {
    insumo,
    historico,
    proyeccion,
    consumo_observado: consumoObservado,
    consumo_por_dia: agruparConsumoDiario(movs, dias),
  };
}

function agruparConsumoDiario(movs, dias) {
  const mapa = new Map();
  for (const m of movs) {
    if (m.tipo !== 'SALIDA') continue;
    mapa.set(m.dia, round((mapa.get(m.dia) || 0) + m.cantidad));
  }
  const out = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ fecha: key, consumo: mapa.get(key) || 0 });
  }
  return out;
}

// ------------------------------------------------------------------
// KPIs de cabecera
// ------------------------------------------------------------------

function kpis() {
  const insumos = listarInsumos();
  const total = insumos.length;
  const criticos = insumos.filter((i) => i.estado === 'CRITICO' || i.estado === 'QUIEBRE').length;
  const advertencia = insumos.filter((i) => i.estado === 'ADVERTENCIA').length;

  // Cobertura global: promedio de stock sobre punto de reorden, topeado al 100 %.
  const ratios = insumos
    .filter((i) => i.punto_reorden > 0)
    .map((i) => Math.min(1, i.stock_actual / i.punto_reorden));
  const cobertura = ratios.length
    ? round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100, 1)
    : 100;

  // Próximo reaprovisionamiento: el insumo al que primero se le acaba el margen.
  const pendientes = insumos
    .filter((i) => i.dias_hasta_pedido !== null)
    .sort((a, b) => a.dias_hasta_pedido - b.dias_hasta_pedido);
  const proximo = pendientes[0] || null;

  return {
    total_insumos: total,
    criticos,
    advertencia,
    operativos: total - criticos - advertencia,
    cobertura_global: cobertura,
    proximo_reaprovisionamiento: proximo && {
      id: proximo.id,
      sku: proximo.sku,
      nombre: proximo.nombre,
      dias: proximo.dias_hasta_pedido,
      lead_time_dias: proximo.lead_time_dias,
    },
  };
}

function categorias() {
  return db.prepare('SELECT DISTINCT categoria FROM insumos ORDER BY categoria').all()
    .map((r) => r.categoria);
}

module.exports = {
  listarInsumos, obtenerInsumo, crearInsumo, actualizarInsumo, eliminarInsumo,
  registrarMovimiento, historial, serieStock, kpis, categorias,
};
