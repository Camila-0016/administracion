---
version: 1
slug: "public-index-html"
primary_target: "public/index.html"
related_targets: []
---

# Surface brief — Inventario MiningTech

## Scope

Toda la aplicación web: shell y navegación, Tablero General, Registro de Movimientos, Alertas de Reorden, Logística, Reportes, Configuración, drawer de detalle y modales. Visitante en modo Operate: personal de pañol, logística y supervisión que viene a resolver una tarea, no a leer.

## Audience, job and constraints

- Trabajan en turnos, con guantes, luz solar intensa y viento de altura; necesitan escanear estado y actuar rápido.
- Deben preservarse sin cambios el backend, los datos, las seis vistas, el ABM de insumos, los movimientos, la exportación CSV, la configuración local y el funcionamiento de la demo autocontenida.
- El tema oscuro se conserva como variante del mismo mundo visual.
- La interfaz no debe inventar módulos ni datos: la orden de compra sigue siendo una confirmación local y la logística una simulación derivada de cobertura/lead time.
- Las fotografías existentes de `public/img/` se reincorporan como placas de campo: el titular del Tablero va sobre `almacen.jpg`; Alertas lleva una banda ancha de `planta.jpg` y Logística una banda ancha de `mina-aerea.jpg`. Siempre con marco, caption de “imagen de referencia” y velo de tinta (fuerte en el hero, suave en las bandas de página). No se usan como fondo ambiental de tablas o gráficos.

## Direction contract

THESIS: Una sala de control de inventario construida como el diagrama de abastecimiento de la faena: campo hueso, tinta verde profunda y naranja de acción. Rechaza el dashboard genérico azul, la sopa de tarjetas y el chrome de sidebar como decoración.

OWN-WORLD: Lenguaje Stitch de la plantilla Tejido — hueso #EDEADE, tinta #072C2C, naranja #FF5F03, tintes #F2EFE4 / #FAF9F5 / #FFF3EC, bordes de 2px #E3E1D6 / #D9D7CB, tarjetas blancas de 16px, etiquetas monoespaciadas en mayúsculas para datos y metadatos, display Space Grotesk con pesos altos, controles estándar con radios de 6-10px y sombras duras desplazadas solo en las piezas que el sistema elige destacar: el diagrama de abastecimiento, el KPI crítico, los modales y la alerta principal.

STORY: Al entrar, la persona entiende el estado del pañol, el camino de reposición y la próxima acción; puede ajustar stock, registrar un movimiento, abrir el detalle, revisar alertas, seguir camiones y exportar reportes sin cambiar de vocabulario visual.

FIRST VIEWPORT: Barra superior de 64px con marca, navegación y estado de faena; franja hero sobre hueso con el titular operativo sobre una placa fotográfica del pañol a la izquierda y, a la derecha, una tarjeta de flujo "Centro de distribución → Camión en ruta → Pañol de faena → Consumo" alimentada con KPIs reales, con nodo actual naranja y sombra dura de 8px; debajo, cuatro indicadores en una grilla y el inicio del catálogo con búsqueda, filtros y acción primaria. Sin kicker sobre el titular; el caption de la foto va debajo de la placa.

FORM: La plantilla Stitch fijada por el usuario, traducida a una pantalla de trabajo de categoría: navegación estándar, tabla ordenable, estados semánticos y controles familiares. La firma es el diagrama de flujo de abastecimiento vivo, no un adorno.

seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
