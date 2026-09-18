'use strict';

const express = require('express');
const inv = require('../services/inventario');

const router = express.Router();

// GET /api/insumos — catálogo con métricas de cobertura y criticidad
router.get('/', (req, res) => {
  let data = inv.listarInsumos();
  const { categoria, estado, q } = req.query;

  if (categoria) data = data.filter((i) => i.categoria === categoria);
  if (estado) data = data.filter((i) => i.estado === String(estado).toUpperCase());
  if (q) {
    const t = String(q).toLowerCase();
    data = data.filter((i) => i.nombre.toLowerCase().includes(t) || i.sku.toLowerCase().includes(t));
  }
  res.json(data);
});

// GET /api/insumos/kpis — métricas de cabecera del tablero
router.get('/kpis', (_req, res) => res.json(inv.kpis()));

// GET /api/insumos/categorias — para los filtros rápidos
router.get('/categorias', (_req, res) => res.json(inv.categorias()));

// GET /api/insumos/:id
router.get('/:id', (req, res) => {
  const insumo = inv.obtenerInsumo(req.params.id);
  if (!insumo) return res.status(404).json({ error: 'Insumo no encontrado' });
  res.json(insumo);
});

// GET /api/insumos/:id/historial — libro auditable de movimientos
router.get('/:id/historial', (req, res) => {
  if (!inv.obtenerInsumo(req.params.id)) {
    return res.status(404).json({ error: 'Insumo no encontrado' });
  }
  res.json(inv.historial(req.params.id, Number(req.query.limite) || 100));
});

// GET /api/insumos/:id/serie — serie de stock de 30 días + proyección de quiebre
router.get('/:id/serie', (req, res) => {
  const serie = inv.serieStock(req.params.id, Number(req.query.dias) || 30);
  if (!serie) return res.status(404).json({ error: 'Insumo no encontrado' });
  res.json(serie);
});

// POST /api/insumos — alta
router.post('/', (req, res, next) => {
  try {
    if (!req.body.sku || !req.body.nombre) {
      return res.status(400).json({ error: 'El SKU y el nombre son obligatorios' });
    }
    res.status(201).json(inv.crearInsumo(req.body));
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ya existe un insumo con ese SKU' });
    }
    next(err);
  }
});

// PUT /api/insumos/:id — edición
router.put('/:id', (req, res, next) => {
  try {
    const actualizado = inv.actualizarInsumo(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Insumo no encontrado' });
    res.json(actualizado);
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ya existe un insumo con ese SKU' });
    }
    next(err);
  }
});

// DELETE /api/insumos/:id
router.delete('/:id', (req, res) => {
  if (!inv.eliminarInsumo(req.params.id)) {
    return res.status(404).json({ error: 'Insumo no encontrado' });
  }
  res.status(204).end();
});

module.exports = router;
