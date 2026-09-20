'use strict';

/**
 * Seed de demostración — Faena de litio, Puna a 4.000 msnm.
 * Genera 10 insumos reales de operación y 30 días de movimientos
 * para que las gráficas de evolución carguen con datos desde el arranque.
 *
 * Uso:  npm run seed        (borra y recrea los datos de demo)
 */

const { db, initSchema } = require('./database');

const RESPONSABLES = [
  'M. Quispe (Pañol)',
  'J. Cardozo (Logística)',
  'S. Vilte (Mantenimiento)',
  'R. Farfán (Planta)',
  'L. Choque (Turno noche)',
];

const MOTIVOS_SALIDA = [
  'Consumo diario',
  'Mantenimiento preventivo',
  'Reemplazo correctivo',
  'Consumo planta de proceso',
];

// deseado = stock con el que debe quedar hoy (define el estado en el tablero)
const INSUMOS = [
  // --- REACTIVOS QUÍMICOS Y TRATAMIENTO DE SALMUERA ---
  {
    sku: 'REA-CAL-1000', nombre: 'Cal hidratada grado industrial',
    categoria: 'Reactivos químicos', unidad: 'kg',
    stock_minimo: 1500, consumo_diario: 420, lead_time_dias: 6, deseado: 9800,
  },
  {
    sku: 'REA-CAR-0880', nombre: 'Carbonato de sodio (soda solvay densa)',
    categoria: 'Reactivos químicos', unidad: 'kg',
    stock_minimo: 2000, consumo_diario: 610, lead_time_dias: 8, deseado: 4200,
  },
  {
    sku: 'REA-ACD-1800', nombre: 'Ácido clorhídrico 33% (desincrustante)',
    categoria: 'Reactivos químicos', unidad: 'L',
    stock_minimo: 800, consumo_diario: 120, lead_time_dias: 10, deseado: 2400,
  },
  {
    sku: 'REA-SOD-0500', nombre: 'Hidróxido de sodio en escamas (soda cáustica)',
    categoria: 'Reactivos químicos', unidad: 'kg',
    stock_minimo: 1200, consumo_diario: 180, lead_time_dias: 9, deseado: 3100,
  },
  {
    sku: 'REA-FLC-0025', nombre: 'Floculante aniónico de alto peso molecular',
    categoria: 'Reactivos químicos', unidad: 'kg',
    stock_minimo: 250, consumo_diario: 25, lead_time_dias: 14, deseado: 850,
  },
  {
    sku: 'LAB-RCT-0010', nombre: 'Kits titulación de litio y magnesio',
    categoria: 'Laboratorio de control', unidad: 'kits',
    stock_minimo: 15, consumo_diario: 1.8, lead_time_dias: 15, deseado: 22,
  },

  // --- EQUIPOS DE PROCESO Y MEMBRANAS ---
  {
    sku: 'BMB-DOS-0075', nombre: 'Bomba dosificadora de diafragma 75 L/h',
    categoria: 'Equipos de proceso', unidad: 'unidades',
    stock_minimo: 2, consumo_diario: 0.15, lead_time_dias: 21, deseado: 4.5,
  },
  {
    sku: 'REP-MEM-0040', nombre: 'Membrana de ósmosis inversa 8" (salmuera)',
    categoria: 'Equipos de proceso', unidad: 'unidades',
    stock_minimo: 4, consumo_diario: 0.35, lead_time_dias: 25, deseado: 5,
  },
  {
    sku: 'VLV-MAR-0150', nombre: 'Válvula mariposa PTFE 6" para salmuera ácida',
    categoria: 'Equipos de proceso', unidad: 'unidades',
    stock_minimo: 3, consumo_diario: 0.2, lead_time_dias: 18, deseado: 7,
  },
  {
    sku: 'SEL-MEC-0050', nombre: 'Sello mecánico carburo de silicio bomba slurry',
    categoria: 'Equipos de proceso', unidad: 'unidades',
    stock_minimo: 6, consumo_diario: 0.4, lead_time_dias: 20, deseado: 14,
  },
  {
    sku: 'SDR-LIT-0004', nombre: 'Sondas de nivel ultrasónicas para pozos',
    categoria: 'Equipos de proceso', unidad: 'unidades',
    stock_minimo: 2, consumo_diario: 0.08, lead_time_dias: 30, deseado: 3,
  },

  // --- FILTROS Y ELEMENTOS DE ALTURA ---
  {
    sku: 'FLT-ALT-2440', nombre: 'Filtro de aire de altura — motor CAT 785',
    categoria: 'Filtros y elementos', unidad: 'unidades',
    stock_minimo: 12, consumo_diario: 2.4, lead_time_dias: 7, deseado: 14,
  },
  {
    sku: 'FLT-SEP-0500', nombre: 'Filtro separador de agua/combustible Racor',
    categoria: 'Filtros y elementos', unidad: 'unidades',
    stock_minimo: 20, consumo_diario: 3.5, lead_time_dias: 10, deseado: 62,
  },
  {
    sku: 'FLT-PRN-0100', nombre: 'Telas filtrantes para filtro prensa de concentrado',
    categoria: 'Filtros y elementos', unidad: 'unidades',
    stock_minimo: 18, consumo_diario: 2.1, lead_time_dias: 16, deseado: 48,
  },
  {
    sku: 'FLT-HID-0010', nombre: 'Cartucho filtro hidráulico de alta presión 10 µm',
    categoria: 'Filtros y elementos', unidad: 'unidades',
    stock_minimo: 10, consumo_diario: 1.2, lead_time_dias: 12, deseado: 26,
  },

  // --- CINTAS Y MANIPULACIÓN DE MATERIALES ---
  {
    sku: 'CIN-BND-1200', nombre: 'Banda transportadora EP-630 1200 mm',
    categoria: 'Repuestos de cintas', unidad: 'm',
    stock_minimo: 40, consumo_diario: 3.2, lead_time_dias: 30, deseado: 110,
  },
  {
    sku: 'CIN-ROD-0159', nombre: 'Rodillo de impacto Ø159 mm',
    categoria: 'Repuestos de cintas', unidad: 'unidades',
    stock_minimo: 25, consumo_diario: 4.5, lead_time_dias: 12, deseado: 65,
  },
  {
    sku: 'CIN-GRM-0080', nombre: 'Grapas mecánicas de unión para cinta',
    categoria: 'Repuestos de cintas', unidad: 'cajas',
    stock_minimo: 10, consumo_diario: 0.8, lead_time_dias: 14, deseado: 24,
  },
  {
    sku: 'ROD-CAR-0127', nombre: 'Rodillos de carga artesonados Ø127 mm',
    categoria: 'Repuestos de cintas', unidad: 'unidades',
    stock_minimo: 30, consumo_diario: 5.2, lead_time_dias: 15, deseado: 75,
  },

  // --- COMBUSTIBLES, ENERGÍA Y LUBRICANTES ---
  {
    sku: 'CMB-GOI-0500', nombre: 'Gasoil grado 2 — generación y flota',
    categoria: 'Combustibles', unidad: 'L',
    stock_minimo: 12000, consumo_diario: 5800, lead_time_dias: 4, deseado: 46000,
  },
  {
    sku: 'CMB-GAS-4500', nombre: 'Garrafas de GLP 45 kg para campamento',
    categoria: 'Combustibles', unidad: 'unidades',
    stock_minimo: 20, consumo_diario: 4.0, lead_time_dias: 6, deseado: 38,
  },
  {
    sku: 'LUB-HID-0068', nombre: 'Aceite hidráulico ISO VG 68 — bajo cero',
    categoria: 'Lubricantes', unidad: 'L',
    stock_minimo: 600, consumo_diario: 145, lead_time_dias: 9, deseado: 2600,
  },
  {
    sku: 'LUB-MOT-1540', nombre: 'Aceite para motor 15W40 API CK-4 sintético',
    categoria: 'Lubricantes', unidad: 'L',
    stock_minimo: 800, consumo_diario: 160, lead_time_dias: 8, deseado: 1950,
  },
  {
    sku: 'LUB-GRS-0002', nombre: 'Grasa litio EP-2 para rodamientos en baja temp.',
    categoria: 'Lubricantes', unidad: 'kg',
    stock_minimo: 120, consumo_diario: 18, lead_time_dias: 10, deseado: 310,
  },
  {
    sku: 'ANT-CON-0050', nombre: 'Líquido refrigerante / anticongelante -35°C',
    categoria: 'Lubricantes', unidad: 'L',
    stock_minimo: 400, consumo_diario: 65, lead_time_dias: 7, deseado: 950,
  },

  // --- SALUD OCUPACIONAL Y EPP DE PUNA ---
  {
    sku: 'EPP-OXI-0002', nombre: 'Tubo de oxígeno medicinal 2 m³ (sala de altura)',
    categoria: 'Salud ocupacional', unidad: 'unidades',
    stock_minimo: 8, consumo_diario: 1.1, lead_time_dias: 5, deseado: 19,
  },
  {
    sku: 'EPP-MSK-0095', nombre: 'Mascarillas autofiltrantes N95 para polvo/viento',
    categoria: 'Salud ocupacional', unidad: 'unidades',
    stock_minimo: 200, consumo_diario: 45, lead_time_dias: 7, deseado: 540,
  },
  {
    sku: 'EPP-CAL-4200', nombre: 'Calzado de seguridad térmico con puntera dieléctrica',
    categoria: 'Salud ocupacional', unidad: 'pares',
    stock_minimo: 15, consumo_diario: 0.8, lead_time_dias: 14, deseado: 32,
  },
  {
    sku: 'EPP-PAR-0004', nombre: 'Parkas térmicas alta visibilidad -25°C',
    categoria: 'Salud ocupacional', unidad: 'unidades',
    stock_minimo: 12, consumo_diario: 0.5, lead_time_dias: 15, deseado: 16,
  },
  {
    sku: 'EPP-LEN-UV40', nombre: 'Anteojos de seguridad polarizados UV400 (salar)',
    categoria: 'Salud ocupacional', unidad: 'unidades',
    stock_minimo: 40, consumo_diario: 6.0, lead_time_dias: 8, deseado: 110,
  },

  // --- MANTENIMIENTO ELÉCTRICO Y DE CAMPAMENTO ---
  {
    sku: 'ELC-FUS-0250', nombre: 'Fusibles alta capacidad 250A generador diésel',
    categoria: 'Mantenimiento eléctrico', unidad: 'unidades',
    stock_minimo: 8, consumo_diario: 0.3, lead_time_dias: 20, deseado: 18,
  },
  {
    sku: 'ELC-CAB-0035', nombre: 'Cable unipolar flexible 35 mm² intemperie',
    categoria: 'Mantenimiento eléctrico', unidad: 'm',
    stock_minimo: 100, consumo_diario: 8.0, lead_time_dias: 15, deseado: 280,
  },
  {
    sku: 'REP-COR-0013', nombre: 'Correas trapezoidales sección B (compresores)',
    categoria: 'Repuestos mecánicos', unidad: 'unidades',
    stock_minimo: 16, consumo_diario: 1.5, lead_time_dias: 10, deseado: 34,
  },
  {
    sku: 'SOL-ELE-7018', nombre: 'Electrodos para soldadura AWS E7018 3.25 mm',
    categoria: 'Ferretería industrial', unidad: 'kg',
    stock_minimo: 60, consumo_diario: 8.5, lead_time_dias: 9, deseado: 160,
  },
  {
    sku: 'TUB-PAD-0110', nombre: 'Caño PEAD PN10 Ø110 mm para transporte de salmuera',
    categoria: 'Ferretería industrial', unidad: 'm',
    stock_minimo: 120, consumo_diario: 12.0, lead_time_dias: 25, deseado: 210,
  },
];

const DIAS_HISTORIAL = 30;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const jitter = (v, pct) => v * (1 + (Math.random() * 2 - 1) * pct);
const round = (v) => Math.round(v * 100) / 100;

function fechaISO(diasAtras, hora, minuto) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(hora, minuto, 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/** Construye la secuencia de movimientos de los últimos 30 días para un insumo. */
function generarMovimientos(insumo) {
  const movs = [];

  for (let d = DIAS_HISTORIAL; d >= 1; d--) {
    // Salida de consumo: casi todos los días, con variación operativa.
    if (insumo.consumo_diario > 0 && Math.random() > 0.12) {
      const cantidad = round(Math.max(0.01, jitter(insumo.consumo_diario, 0.35)));
      movs.push({
        tipo: 'SALIDA',
        cantidad,
        fecha: fechaISO(d, 6 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60)),
        responsable: pick(RESPONSABLES),
        motivo: pick(MOTIVOS_SALIDA),
      });
    }
    // Ingreso por remito: llega un camión cada ~lead time.
    if (d % Math.max(3, insumo.lead_time_dias) === 0) {
      const cantidad = round(Math.max(1, insumo.consumo_diario * insumo.lead_time_dias * jitter(1.1, 0.2)));
      movs.push({
        tipo: 'ENTRADA',
        cantidad,
        fecha: fechaISO(d, 9, 30),
        responsable: 'J. Cardozo (Logística)',
        motivo: 'Ingreso por remito',
      });
    }
  }

  movs.sort((a, b) => a.fecha.localeCompare(b.fecha));
  return movs;
}

function run() {
  initSchema();

  const tx = db.transaction(() => {
    db.exec('DELETE FROM movimientos; DELETE FROM insumos; DELETE FROM sqlite_sequence WHERE name IN (\'insumos\',\'movimientos\');');

    const insInsumo = db.prepare(`
      INSERT INTO insumos (sku, nombre, categoria, unidad, stock_actual, stock_minimo,
                           consumo_diario, lead_time_dias, created_at)
      VALUES (@sku, @nombre, @categoria, @unidad, @stock_actual, @stock_minimo,
              @consumo_diario, @lead_time_dias, @created_at)
    `);
    const insMov = db.prepare(`
      INSERT INTO movimientos (insumo_id, tipo, cantidad, fecha, responsable, motivo)
      VALUES (@insumo_id, @tipo, @cantidad, @fecha, @responsable, @motivo)
    `);

    for (const base of INSUMOS) {
      const movs = generarMovimientos(base);
      const salidas = movs.filter((m) => m.tipo === 'SALIDA').reduce((a, m) => a + m.cantidad, 0);
      const entradas = movs.filter((m) => m.tipo === 'ENTRADA').reduce((a, m) => a + m.cantidad, 0);

      // Stock inicial tal que, aplicando el historial, hoy quede en el valor deseado.
      const stockInicial = round(Math.max(0, base.deseado + salidas - entradas));

      const { lastInsertRowid } = insInsumo.run({
        sku: base.sku,
        nombre: base.nombre,
        categoria: base.categoria,
        unidad: base.unidad,
        stock_actual: round(base.deseado),
        stock_minimo: base.stock_minimo,
        consumo_diario: base.consumo_diario,
        lead_time_dias: base.lead_time_dias,
        created_at: fechaISO(DIAS_HISTORIAL + 1, 8, 0),
      });

      // Asiento de apertura del período, para que el historial cierre contra el stock actual.
      insMov.run({
        insumo_id: lastInsertRowid,
        tipo: 'ENTRADA',
        cantidad: stockInicial || 0.01,
        fecha: fechaISO(DIAS_HISTORIAL + 1, 8, 0),
        responsable: 'Sistema',
        motivo: 'Inventario de apertura',
      });

      for (const m of movs) insMov.run({ ...m, insumo_id: lastInsertRowid });
    }
  });

  tx();

  const n = db.prepare('SELECT COUNT(*) AS n FROM insumos').get().n;
  const m = db.prepare('SELECT COUNT(*) AS n FROM movimientos').get().n;
  console.log(`Seed listo: ${n} insumos y ${m} movimientos cargados.`);
}

if (require.main === module) run();

module.exports = { run };