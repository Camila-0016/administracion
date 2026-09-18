'use strict';

const path = require('path');
const express = require('express');

const { isEmpty, DB_FILE } = require('./db/database');
const insumosRouter = require('./routes/insumos');
const movimientosRouter = require('./routes/movimientos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/insumos', insumosRouter);
app.use('/api/movimientos', movimientosRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true, db: DB_FILE }));

// 404 de API
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint inexistente' }));

// Manejador de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`\n  MiningTech · Inventario Inteligente en Altura`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Base de datos: ${DB_FILE}`);
  if (isEmpty()) console.log('  Catálogo vacío — ejecutá "npm run seed" para cargar datos de demo.\n');
  else console.log('');
});
