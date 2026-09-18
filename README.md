# Inventario Inteligente en Altura — MiningTech S.A.

Módulo de gestión de insumos para faena de litio en la Puna (4.000 msnm). El problema que resuelve
no es contar stock: es decidir **cuándo hay que despachar el camión**, porque entre que se emite el
pedido y que el insumo llega a la mina pasan entre 4 y 30 días.

Toda la interfaz gira alrededor de una sola comparación:

```
cobertura (días) = stock actual / consumo diario     vs.     lead time de transporte
```

Si la cobertura no alcanza a cubrir el viaje, el insumo entra en quiebre inminente aunque el
depósito todavía tenga existencias.

---

## 1. Puesta en marcha (3 comandos)

Requiere Node.js 18 o superior. No hace falta ningún servidor de base de datos: SQLite vive en un
archivo dentro del proyecto.

```bash
npm install          # instala express y better-sqlite3
npm run seed         # crea el esquema y carga 10 insumos + 30 días de historial
npm start            # levanta http://localhost:3000
```

Abrí `http://localhost:3000` en el navegador. Si la tabla aparece vacía, faltó el `npm run seed`.

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run dev` | Igual que `start`, pero reinicia solo al guardar cambios |
| `npm run reset` | Borra `db/inventario.db` y vuelve a sembrar datos limpios |
| `npm run demo` | Regenera `demo-standalone.html`, la versión de un solo archivo |

### Cómo probarlo

1. En la cabecera se ven los cuatro KPIs. Con los datos de demo deberían salir 3 insumos críticos.
2. Filtrá por la ficha **Críticos**: quedan los que no llegan a cubrir el lead time del camión.
3. Ordená por **Cobertura** haciendo clic en el encabezado de la columna.
4. Botón **−** en la fila del gasoil: registrá una salida de 20.000 L. El estado y los KPIs cambian.
5. Clic en cualquier fila: se abre el detalle con las dos gráficas y el historial auditable.
6. **Cargar insumo** da de alta un ítem nuevo; el stock inicial queda asentado como movimiento.

---

## 2. Arquitectura

```
server.js                 Express: estáticos + montaje de routers
db/
  schema.sql              DDL: tablas, índices y vista de criticidad
  database.js             Conexión SQLite (better-sqlite3) y creación del esquema
  seed.js                 10 insumos de minería de litio + 30 días de movimientos
  inventario.db           Se crea sola al primer arranque
services/
  inventario.js           Reglas de negocio: cobertura, punto de reorden, KPIs, series
routes/
  insumos.js              /api/insumos/*
  movimientos.js          /api/movimientos
public/
  index.html              HTML semántico
  css/styles.css          Tema oscuro slate con acentos cian/teal
  js/api.js               Cliente REST
  js/charts.js            Configuración de Chart.js
  js/app.js               Controlador de tabla, filtros, drawer y modales
  js/store-local.js       Persistencia en LocalStorage (sólo para la demo sin servidor)
build-demo.js             Empaqueta todo en demo-standalone.html
```

Las reglas de cálculo viven en `services/inventario.js` y están replicadas de forma idéntica en
`public/js/store-local.js`, para que la demo sin servidor dé exactamente los mismos números.

### Modelo de datos

**`insumos`** — `id, sku, nombre, categoria, unidad, stock_actual, stock_minimo, consumo_diario,
lead_time_dias, created_at`

**`movimientos`** — `id, insumo_id, tipo, cantidad, fecha, responsable, motivo`

El stock nunca se edita a mano desde el tablero: se mueve a través de `movimientos`, y cada
movimiento actualiza el stock dentro de una transacción. Eso mantiene el historial auditable
cuadrado contra la existencia real.

La vista `v_insumos_estado` deja la clasificación de criticidad disponible también desde SQL puro,
por si más adelante se conecta un tablero de BI.

### Cómo se clasifica un insumo

```
punto_reorden = consumo_diario × lead_time_dias + stock_minimo

QUIEBRE       stock = 0
CRITICO       cobertura ≤ lead_time            (el camión no llega a tiempo)
ADVERTENCIA   stock ≤ punto_reorden            (hay que emitir el pedido ya)
OPERATIVO     el resto
```

---

## 3. Endpoints REST

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/insumos` | Catálogo con métricas. Filtros: `?categoria=`, `?estado=`, `?q=` |
| `GET` | `/api/insumos/kpis` | Métricas de cabecera del tablero |
| `GET` | `/api/insumos/categorias` | Categorías existentes, para los filtros |
| `GET` | `/api/insumos/:id` | Un insumo con cobertura, punto de reorden y fecha de quiebre |
| `GET` | `/api/insumos/:id/historial` | Movimientos del insumo (`?limite=100`) |
| `GET` | `/api/insumos/:id/serie` | Serie de 30 días + proyección de quiebre (`?dias=30`) |
| `POST` | `/api/insumos` | Alta |
| `PUT` | `/api/insumos/:id` | Edición |
| `DELETE` | `/api/insumos/:id` | Baja (arrastra sus movimientos) |
| `GET` | `/api/movimientos` | Últimos movimientos de toda la faena (`?limite=50`) |
| `POST` | `/api/movimientos` | Registra entrada o salida y ajusta el stock |
| `GET` | `/api/health` | Verificación de servicio |

Ejemplos:

```bash
# Ingreso por remito
curl -X POST http://localhost:3000/api/movimientos \
  -H 'Content-Type: application/json' \
  -d '{"insumo_id":1,"tipo":"ENTRADA","cantidad":40,"responsable":"J. Cardozo (Logística)","motivo":"Ingreso por remito"}'

# Alta de insumo
curl -X POST http://localhost:3000/api/insumos \
  -H 'Content-Type: application/json' \
  -d '{"sku":"EPP-GUA-0900","nombre":"Guante anticorte nivel 5","categoria":"Salud ocupacional","unidad":"pares","stock_actual":180,"stock_minimo":60,"consumo_diario":9,"lead_time_dias":6}'
```

Errores previsibles devuelven `4xx` con `{ "error": "..." }`: SKU duplicado (409), salida mayor al
stock disponible (400), insumo inexistente (404).

---

## 4. Versión sin servidor

`demo-standalone.html` es el mismo tablero en un único archivo: misma interfaz, mismos cálculos,
pero la persistencia va a LocalStorage en lugar de SQLite. Se abre con doble clic, sin instalar
nada. Trae dos acciones extra en la barra: **Exportar base** (descarga el JSON completo) y
**Restablecer demo** (regenera los datos de prueba).

Sirve para mostrar el módulo en una reunión o para trabajar sin conexión. Para el sistema real usá
la versión con backend: el JSON de LocalStorage no soporta usuarios concurrentes ni auditoría seria.

---

## 5. Qué falta para producción

- Autenticación y trazabilidad de usuario real (hoy el responsable se escribe a mano).
- Consumo diario calculado del histórico móvil en vez de cargado a mano.
- Alertas automáticas al superintendente de logística cuando un insumo cruza el punto de reorden.
- Migración a PostgreSQL si entran varias faenas al mismo sistema.
