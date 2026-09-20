-- ============================================================
--  MiningTech S.A. — Inventario Inteligente en Altura
--  Esquema relacional (SQLite)
-- ============================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ------------------------------------------------------------
-- Insumos: catálogo maestro del almacén de altura (4.000 msnm)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS insumos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    sku             TEXT    NOT NULL UNIQUE,
    nombre          TEXT    NOT NULL,
    categoria       TEXT    NOT NULL,
    unidad          TEXT    NOT NULL DEFAULT 'unidades',
    stock_actual    REAL    NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo    REAL    NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    consumo_diario  REAL    NOT NULL DEFAULT 0 CHECK (consumo_diario >= 0),
    lead_time_dias  INTEGER NOT NULL DEFAULT 1 CHECK (lead_time_dias >= 0),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_insumos_categoria ON insumos (categoria);

-- ------------------------------------------------------------
-- Movimientos: libro auditable de entradas y salidas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimientos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    insumo_id   INTEGER NOT NULL REFERENCES insumos (id) ON DELETE CASCADE,
    tipo        TEXT    NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA')),
    cantidad    REAL    NOT NULL CHECK (cantidad > 0),
    fecha       TEXT    NOT NULL DEFAULT (datetime('now')),
    responsable TEXT    NOT NULL DEFAULT 'Sistema',
    motivo      TEXT
);

CREATE INDEX IF NOT EXISTS idx_mov_insumo_fecha ON movimientos (insumo_id, fecha DESC);

-- ------------------------------------------------------------
-- Vista de cálculo: cobertura, punto de reorden y criticidad
--   cobertura_dias  = stock_actual / consumo_diario
--   punto_reorden   = consumo_diario * lead_time_dias + stock_minimo
--   estado          = QUIEBRE | CRITICO | ADVERTENCIA | OPERATIVO
-- ------------------------------------------------------------
CREATE VIEW IF NOT EXISTS v_insumos_estado AS
SELECT
    i.*,
    CASE WHEN i.consumo_diario > 0
         THEN i.stock_actual / i.consumo_diario
         ELSE NULL END                                        AS cobertura_dias,
    (i.consumo_diario * i.lead_time_dias) + i.stock_minimo    AS punto_reorden,
    CASE
        WHEN i.stock_actual <= 0 THEN 'QUIEBRE'
        WHEN i.consumo_diario > 0
             AND (i.stock_actual / i.consumo_diario) <= i.lead_time_dias THEN 'CRITICO'
        WHEN i.stock_actual <= (i.consumo_diario * i.lead_time_dias) + i.stock_minimo THEN 'ADVERTENCIA'
        ELSE 'OPERATIVO'
    END                                                       AS estado
FROM insumos i;