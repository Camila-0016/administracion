/* ==========================================================
   Persistencia local (LocalStorage) para la demo sin servidor.
   Expone exactamente la misma interfaz que js/api.js, de modo
   que app.js y charts.js funcionan sin un solo cambio.
   ========================================================== */
window.API = (() => {
  'use strict';

  const KEY = 'miningtech.inventario.v1';
  const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
  const hoy = () => new Date();

  function ts(d) { return d.toISOString().slice(0, 19).replace('T', ' '); }

  // ---------------- semilla ----------------

  const RESPONSABLES = [
    'M. Quispe (Pañol)', 'J. Cardozo (Logística)', 'S. Vilte (Mantenimiento)',
    'R. Farfán (Planta)', 'L. Choque (Turno noche)',
  ];
  const MOTIVOS = ['Consumo diario', 'Mantenimiento preventivo', 'Reemplazo correctivo', 'Consumo planta de proceso'];

  const CATALOGO = [
    { sku: 'FLT-ALT-2440', nombre: 'Filtro de aire de altura — motor CAT 785', categoria: 'Filtros y elementos', unidad: 'unidades', stock_minimo: 12, consumo_diario: 2.4, lead_time_dias: 7, deseado: 14 },
    { sku: 'BMB-DOS-0075', nombre: 'Bomba dosificadora de diafragma 75 L/h', categoria: 'Equipos de proceso', unidad: 'unidades', stock_minimo: 2, consumo_diario: 0.15, lead_time_dias: 21, deseado: 4.5 },
    { sku: 'REA-CAL-1000', nombre: 'Cal hidratada grado industrial', categoria: 'Reactivos químicos', unidad: 'kg', stock_minimo: 1500, consumo_diario: 420, lead_time_dias: 6, deseado: 9800 },
    { sku: 'REA-CAR-0880', nombre: 'Carbonato de sodio (soda solvay)', categoria: 'Reactivos químicos', unidad: 'kg', stock_minimo: 2000, consumo_diario: 610, lead_time_dias: 8, deseado: 4200 },
    { sku: 'CMB-GOI-0500', nombre: 'Gasoil grado 2 — generación y flota', categoria: 'Combustibles', unidad: 'L', stock_minimo: 12000, consumo_diario: 5800, lead_time_dias: 4, deseado: 46000 },
    { sku: 'CIN-BND-1200', nombre: 'Banda transportadora EP-630 1200 mm', categoria: 'Repuestos de cintas', unidad: 'm', stock_minimo: 40, consumo_diario: 3.2, lead_time_dias: 30, deseado: 110 },
    { sku: 'CIN-ROD-0159', nombre: 'Rodillo de impacto Ø159 mm', categoria: 'Repuestos de cintas', unidad: 'unidades', stock_minimo: 25, consumo_diario: 4.5, lead_time_dias: 12, deseado: 65 },
    { sku: 'EPP-OXI-0002', nombre: 'Tubo de oxígeno medicinal 2 m³ (sala de altura)', categoria: 'Salud ocupacional', unidad: 'unidades', stock_minimo: 8, consumo_diario: 1.1, lead_time_dias: 5, deseado: 19 },
    { sku: 'LUB-HID-0068', nombre: 'Aceite hidráulico ISO VG 68 — bajo cero', categoria: 'Lubricantes', unidad: 'L', stock_minimo: 600, consumo_diario: 145, lead_time_dias: 9, deseado: 2600 },
    { sku: 'REP-MEM-0040', nombre: 'Membrana de ósmosis inversa 8" (salmuera)', categoria: 'Equipos de proceso', unidad: 'unidades', stock_minimo: 4, consumo_diario: 0.35, lead_time_dias: 25, deseado: 5 },
  ];

  const DIAS = 30;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const jitter = (v, p) => v * (1 + (Math.random() * 2 - 1) * p);

  function fecha(diasAtras, hora, minuto) {
    const d = hoy();
    d.setDate(d.getDate() - diasAtras);
    d.setHours(hora, minuto, 0, 0);
    return ts(d);
  }

  function semilla() {
    const insumos = [];
    const movimientos = [];
    let idIns = 0;
    let idMov = 0;

    CATALOGO.forEach((base) => {
      idIns += 1;
      const movs = [];
      for (let d = DIAS; d >= 1; d--) {
        if (base.consumo_diario > 0 && Math.random() > 0.12) {
          movs.push({
            tipo: 'SALIDA',
            cantidad: round(Math.max(0.01, jitter(base.consumo_diario, 0.35))),
            fecha: fecha(d, 6 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60)),
            responsable: pick(RESPONSABLES),
            motivo: pick(MOTIVOS),
          });
        }
        if (d % Math.max(3, base.lead_time_dias) === 0) {
          movs.push({
            tipo: 'ENTRADA',
            cantidad: round(Math.max(1, base.consumo_diario * base.lead_time_dias * jitter(1.1, 0.2))),
            fecha: fecha(d, 9, 30),
            responsable: 'J. Cardozo (Logística)',
            motivo: 'Ingreso por remito',
          });
        }
      }
      movs.sort((a, b) => a.fecha.localeCompare(b.fecha));

      const salidas = movs.filter((m) => m.tipo === 'SALIDA').reduce((a, m) => a + m.cantidad, 0);
      const entradas = movs.filter((m) => m.tipo === 'ENTRADA').reduce((a, m) => a + m.cantidad, 0);
      const apertura = round(Math.max(0, base.deseado + salidas - entradas));

      insumos.push({
        id: idIns,
        sku: base.sku,
        nombre: base.nombre,
        categoria: base.categoria,
        unidad: base.unidad,
        stock_actual: round(base.deseado),
        stock_minimo: base.stock_minimo,
        consumo_diario: base.consumo_diario,
        lead_time_dias: base.lead_time_dias,
        created_at: fecha(DIAS + 1, 8, 0),
      });

      idMov += 1;
      movimientos.push({
        id: idMov, insumo_id: idIns, tipo: 'ENTRADA', cantidad: apertura || 0.01,
        fecha: fecha(DIAS + 1, 8, 0), responsable: 'Sistema', motivo: 'Inventario de apertura',
      });
      movs.forEach((m) => {
        idMov += 1;
        movimientos.push({ id: idMov, insumo_id: idIns, ...m });
      });
    });

    return { insumos, movimientos, seq: { insumo: idIns, movimiento: idMov } };
  }

  // ---------------- almacenamiento ----------------

  let cache = null;

  function leer() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { cache = JSON.parse(raw); return cache; }
    } catch (_) { /* almacenamiento bloqueado: se trabaja en memoria */ }
    cache = semilla();
    guardar();
    return cache;
  }

  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (_) { /* sólo en memoria */ }
  }

  function reiniciar() {
    cache = semilla();
    guardar();
  }

  // ---------------- métricas (espejo de services/inventario.js) ----------------

  function enriquecer(row) {
    const consumo = Number(row.consumo_diario) || 0;
    const stock = Number(row.stock_actual) || 0;
    const lead = Number(row.lead_time_dias) || 0;
    const cobertura = consumo > 0 ? stock / consumo : null;
    const puntoReorden = consumo * lead + Number(row.stock_minimo || 0);

    let estado = 'OPERATIVO';
    if (stock <= 0) estado = 'QUIEBRE';
    else if (cobertura !== null && cobertura <= lead) estado = 'CRITICO';
    else if (stock <= puntoReorden) estado = 'ADVERTENCIA';

    let fechaQuiebre = null;
    if (cobertura !== null && Number.isFinite(cobertura)) {
      const d = hoy();
      d.setDate(d.getDate() + Math.floor(cobertura));
      fechaQuiebre = d.toISOString().slice(0, 10);
    }

    return {
      ...row,
      cobertura_dias: cobertura === null ? null : round(cobertura, 1),
      punto_reorden: round(puntoReorden),
      dias_hasta_pedido: consumo > 0 ? round(Math.max(0, (stock - puntoReorden) / consumo), 1) : null,
      fecha_quiebre: fechaQuiebre,
      estado,
    };
  }

  const normalizar = (d) => ({
    sku: String(d.sku || '').trim().toUpperCase(),
    nombre: String(d.nombre || '').trim(),
    categoria: String(d.categoria || 'Sin categoría').trim(),
    unidad: String(d.unidad || 'unidades').trim(),
    stock_actual: Math.max(0, Number(d.stock_actual) || 0),
    stock_minimo: Math.max(0, Number(d.stock_minimo) || 0),
    consumo_diario: Math.max(0, Number(d.consumo_diario) || 0),
    lead_time_dias: Math.max(0, parseInt(d.lead_time_dias, 10) || 0),
  });

  const dev = (v) => Promise.resolve(JSON.parse(JSON.stringify(v)));
  const err = (m) => Promise.reject(new Error(m));

  // ---------------- API pública ----------------

  function listar() {
    return leer().insumos.map(enriquecer).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  function buscar(id) {
    return leer().insumos.find((i) => String(i.id) === String(id)) || null;
  }

  function serie(id, dias = 30) {
    const base = buscar(id);
    if (!base) return null;
    const insumo = enriquecer(base);

    const desde = hoy();
    desde.setDate(desde.getDate() - dias);
    const desdeISO = desde.toISOString().slice(0, 10);

    const movs = leer().movimientos
      .filter((m) => String(m.insumo_id) === String(id) && m.fecha.slice(0, 10) >= desdeISO)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const neto = new Map();
    movs.forEach((m) => {
      const dia = m.fecha.slice(0, 10);
      neto.set(dia, (neto.get(dia) || 0) + (m.tipo === 'ENTRADA' ? m.cantidad : -m.cantidad));
    });

    const historico = [];
    let stock = insumo.stock_actual;
    for (let i = 0; i <= dias; i++) {
      const d = hoy();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      historico.push({ fecha: key, stock: round(Math.max(0, stock)) });
      stock -= neto.get(key) || 0;
    }
    historico.reverse();

    const proyeccion = [];
    if (insumo.consumo_diario > 0) {
      const h = Math.min(45, Math.ceil(insumo.stock_actual / insumo.consumo_diario) + 1);
      for (let i = 0; i <= h; i++) {
        const d = hoy();
        d.setDate(d.getDate() + i);
        proyeccion.push({
          fecha: d.toISOString().slice(0, 10),
          stock: round(Math.max(0, insumo.stock_actual - insumo.consumo_diario * i)),
        });
      }
    }

    const consumoPorDia = [];
    const mapaConsumo = new Map();
    movs.filter((m) => m.tipo === 'SALIDA').forEach((m) => {
      const dia = m.fecha.slice(0, 10);
      mapaConsumo.set(dia, round((mapaConsumo.get(dia) || 0) + m.cantidad));
    });
    for (let i = dias - 1; i >= 0; i--) {
      const d = hoy();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      consumoPorDia.push({ fecha: key, consumo: mapaConsumo.get(key) || 0 });
    }

    const salidas = movs.filter((m) => m.tipo === 'SALIDA');
    return {
      insumo,
      historico,
      proyeccion,
      consumo_observado: salidas.length ? round(salidas.reduce((a, m) => a + m.cantidad, 0) / dias) : 0,
      consumo_por_dia: consumoPorDia,
    };
  }

  const api = {
    kpis() {
      const insumos = listar();
      const criticos = insumos.filter((i) => ['CRITICO', 'QUIEBRE'].includes(i.estado)).length;
      const advertencia = insumos.filter((i) => i.estado === 'ADVERTENCIA').length;
      const ratios = insumos.filter((i) => i.punto_reorden > 0)
        .map((i) => Math.min(1, i.stock_actual / i.punto_reorden));
      const cobertura = ratios.length
        ? round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100, 1) : 100;
      const prox = insumos.filter((i) => i.dias_hasta_pedido !== null)
        .sort((a, b) => a.dias_hasta_pedido - b.dias_hasta_pedido)[0];
      return dev({
        total_insumos: insumos.length,
        criticos,
        advertencia,
        operativos: insumos.length - criticos - advertencia,
        cobertura_global: cobertura,
        proximo_reaprovisionamiento: prox
          ? { id: prox.id, sku: prox.sku, nombre: prox.nombre, dias: prox.dias_hasta_pedido, lead_time_dias: prox.lead_time_dias }
          : null,
      });
    },

    categorias() {
      return dev([...new Set(leer().insumos.map((i) => i.categoria))].sort((a, b) => a.localeCompare(b, 'es')));
    },

    insumos() { return dev(listar()); },

    insumo(id) {
      const i = buscar(id);
      return i ? dev(enriquecer(i)) : err('Insumo no encontrado');
    },

    crear(body) {
      const d = leer();
      const datos = normalizar(body);
      if (!datos.sku || !datos.nombre) return err('El SKU y el nombre son obligatorios');
      if (d.insumos.some((i) => i.sku === datos.sku)) return err('Ya existe un insumo con ese SKU');
      d.seq.insumo += 1;
      const nuevo = { id: d.seq.insumo, ...datos, created_at: ts(hoy()) };
      d.insumos.push(nuevo);
      if (nuevo.stock_actual > 0) {
        d.seq.movimiento += 1;
        d.movimientos.push({
          id: d.seq.movimiento, insumo_id: nuevo.id, tipo: 'ENTRADA', cantidad: nuevo.stock_actual,
          fecha: ts(hoy()), responsable: 'Sistema', motivo: 'Inventario de apertura',
        });
      }
      guardar();
      return dev(enriquecer(nuevo));
    },

    actualizar(id, body) {
      const d = leer();
      const idx = d.insumos.findIndex((i) => String(i.id) === String(id));
      if (idx < 0) return err('Insumo no encontrado');
      const datos = normalizar({ ...d.insumos[idx], ...body });
      if (d.insumos.some((i) => i.sku === datos.sku && String(i.id) !== String(id))) {
        return err('Ya existe un insumo con ese SKU');
      }
      d.insumos[idx] = { ...d.insumos[idx], ...datos };
      guardar();
      return dev(enriquecer(d.insumos[idx]));
    },

    eliminar(id) {
      const d = leer();
      d.insumos = d.insumos.filter((i) => String(i.id) !== String(id));
      d.movimientos = d.movimientos.filter((m) => String(m.insumo_id) !== String(id));
      guardar();
      return dev(null);
    },

    historial(id) {
      return dev(leer().movimientos
        .filter((m) => String(m.insumo_id) === String(id))
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
        .slice(0, 100));
    },

    serie(id, dias = 30) {
      const s = serie(id, dias);
      return s ? dev(s) : err('Insumo no encontrado');
    },

    movimiento(body) {
      const d = leer();
      const insumo = d.insumos.find((i) => String(i.id) === String(body.insumo_id));
      if (!insumo) return err('El insumo no existe');
      const cantidad = Number(body.cantidad);
      if (!Number.isFinite(cantidad) || cantidad <= 0) return err('La cantidad debe ser mayor a cero');
      const tipo = String(body.tipo).toUpperCase();
      const nuevo = tipo === 'ENTRADA' ? insumo.stock_actual + cantidad : insumo.stock_actual - cantidad;
      if (nuevo < 0) return err(`No hay stock suficiente: quedan ${insumo.stock_actual} ${insumo.unidad}`);

      insumo.stock_actual = round(nuevo);
      d.seq.movimiento += 1;
      const mov = {
        id: d.seq.movimiento, insumo_id: insumo.id, tipo, cantidad,
        fecha: ts(hoy()), responsable: body.responsable || 'Sistema', motivo: body.motivo || null,
      };
      d.movimientos.push(mov);
      guardar();
      return dev({ movimiento: mov, insumo: enriquecer(insumo) });
    },

    // Extras propios de la demo
    exportar() { return JSON.stringify(leer(), null, 2); },
    reiniciar() { reiniciar(); },
  };

  return api;
})();
