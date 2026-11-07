# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personal de pañol, logística y supervisión de una faena de litio en la Puna, a 4.000 msnm. Trabajan en turnos, con movimiento físico de insumos y camiones que suben desde el centro de distribución. Su tarea principal es evitar quiebres de stock, decidir reposiciones a tiempo y dejar registro de cada entrada y salida.

## Product Purpose

MiningTech · Inventario Inteligente en Altura concentra el control del pañol central: catálogo, stock, consumo, cobertura, criticidad, movimientos, alertas de reorden, tránsito de camiones y reportes. Existe para que una persona pueda saber en segundos qué insumo está en riesgo, cuántos días de cobertura quedan y qué acción tomar. El éxito es operar sin quiebres sorpresivos y con un historial confiable.

## Positioning

La cobertura se mide en días contra el lead time real del camión a la Puna, no solo contra un stock mínimo. Esa comparación —cobertura vs. viaje de reposición— ordena alertas, logística y prioridades del tablero.

## Operating Context

- Faena de litio en el Salar, a 4.000 msnm; el abastecimiento llega por camión desde un centro de distribución.
- El pañol registra entradas por remito y salidas por consumo, mantenimiento o reemplazo.
- Los turnos y responsables quedan asentados en cada movimiento; el historial es la fuente de verdad.
- La pantalla se usa para revisión operativa frecuente y para el traspaso de turno, no para lectura extensa.
- El idioma de trabajo es español rioplatense (es-AR); las unidades y fechas se muestran en ese formato.

## Capabilities and Constraints

- Tablero con KPIs: insumos en catálogo, quiebre inminente, cobertura global y próximo reaprovisionamiento.
- Catálogo con búsqueda, filtro por categoría y criticidad, orden por columnas, barra de cobertura y ajuste rápido de entrada/salida.
- Alta, edición y eliminación de insumos con validación de SKU único.
- Registro de movimientos (entrada/salida) con cantidad, responsable y motivo; historial por insumo y registro global de los últimos 50.
- Alertas de reorden para estados Crítico y Advertencia, con barra de cobertura contra lead time y generación de orden de compra.
  - La orden de compra es una confirmación en memoria del navegador: no existe todavía un módulo de compras en el backend.
- Logística con tarjetas de camiones en tránsito y etapas simuladas a partir de la cobertura y el lead time.
- Reportes con KPIs, gráficos de categorías y estados, tabla de menor margen y exportación CSV.
- Configuración local: nombre y altitud de la faena, días de historial, cantidad de camiones, autoactualización, responsables, motivos y categorías frecuentes.
- Tema claro/oscuro persistido en localStorage; el tema debe seguir existiendo.
- Stack existente: Express + SQLite (better-sqlite3) y frontend vanilla HTML/CSS/JS, Chart.js 4 por CDN.
- Sin autenticación ni multi-faena: una sola operación por instalación.
- La demo autocontenida (`npm run demo`) reemplaza la API por un store en localStorage; el rediseño debe seguir funcionando en ambos modos.

## Brand Commitments

- Nombre: MiningTech S.A. · Inventario Inteligente en Altura.
- Marca existente: isotipo de montaña/peak sobre cuadrado, usado en la navegación.
- Voz: directa, operativa, en español rioplatense; sin jerga de marketing.
- Referencia visual vinculante elegida por el usuario: plantilla Stitch de OpenDesign (https://opendesign-key.vercel.app/stitch), un lenguaje empresarial de alto contraste, fondo hueso, tinta verde profunda y acento naranja. El rediseño debe aplicar ese lenguaje, no copiar el contenido de la landing.

## Evidence on Hand

- Catálogo semilla con 35 insumos reales de una faena de litio y 30 días de movimientos (`db/seed.js`, `public/js/store-local.js`).
- Fotografías de operación en `public/img/`: `almacen.jpg`, `mina-aerea.jpg`, `planta.jpg`.
- KPIs, categorías, estados y series calculados por `services/inventario.js`.
- No hay clientes, testimonios, precios, benchmarks ni métricas de terceros: no deben inventarse.

## Product Principles

1. La cobertura contra el lead time manda: cada alerta y prioridad debe explicar ese margen.
2. Escanear primero, leer después: números, estados y acciones visibles sin abrir detalle.
3. Toda acción operativa ocurre en contexto: ajustar stock, registrar movimiento y abrir historial desde la misma fila.
4. El registro es confiable y legible: fechas, responsables, motivos y unidades sin ambigüedad.
5. La interfaz no inventa datos ni módulos: si una acción es una simulación o una confirmación local, se dice con claridad.

## Accessibility & Inclusion

- Debe conservarse la navegación por teclado, los estados de foco visibles, las etiquetas ARIA y el cierre de modales/drawer con Escape.
- Contraste alto y objetivos táctiles cómodos, aptos para uso con guantes y luz solar intensa en altura.
- Respetar `prefers-reduced-motion`.
