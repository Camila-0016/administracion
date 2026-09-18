'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'inventario.db');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

const db = new Database(DB_FILE);
db.pragma('foreign_keys = ON');

/** Crea tablas, índices y vistas si todavía no existen. */
function initSchema() {
  db.exec(fs.readFileSync(SCHEMA_FILE, 'utf8'));
}

/** true si el catálogo está vacío (sirve para decidir si hay que sembrar datos). */
function isEmpty() {
  return db.prepare('SELECT COUNT(*) AS n FROM insumos').get().n === 0;
}

initSchema();

module.exports = { db, initSchema, isEmpty, DB_FILE };
