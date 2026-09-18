'use strict';

const express = require('express');
const { db } = require('../db/database');
const inv = require('../services/inventario');

const router = express.Router();

// GET /api/movimientos — últimos movimientos de toda la faena
router.get('/', (req, res) => {
  const limite = Number(req.query.limite) || 50;
  const rows = db.prepare(`
    SELECT m.*, i.sku, i.nombre AS insumo_nombre, i.unidad
      FROM movimientos m JOIN insumos i ON i.id = m.insumo_id
     ORDER BY m.fecha DESC, m.id DESC LIMIT ?
  `).all(limite);
  res.json(rows);
});

// POST /api/movimientos — registrar entrada (+) o salida (−)
router.post('/', (req, res, next) => {
  try {
    const { movimiento, insumo } = inv.registrarMovimiento(req.body);
    res.status(201).json({ movimiento, insumo });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

module.exports = router;
