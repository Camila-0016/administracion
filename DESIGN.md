---
name: MiningTech Inventario
description: Inventario inteligente en altura para la faena de litio
colors:
  signal-orange: "#FF5F03"
  signal-orange-hover: "#FF7A2E"
  orange-wash: "#FFF3EC"
  orange-deep: "#B43A00"
  salar-ink: "#072C2C"
  ink-dim: "#354B4A"
  ink-mute: "#5C6B6B"
  bone-field: "#EDEADE"
  field-paper: "#FFFFFF"
  field-paper-warm: "#FAF9F5"
  field-sand: "#F2EFE4"
  rule-line: "#E3E1D6"
  rule-strong: "#D9D7CB"
  critical-red: "#B42318"
  critical-wash: "#FEE4E2"
  warning-amber: "#B54708"
  warning-wash: "#FEF0C7"
  operative-green: "#067647"
  operative-wash: "#DCFCE7"
  info-blue: "#075985"
  night-canvas: "#062B2A"
  night-surface: "#0B3A39"
  night-field: "#0E4443"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(42px, 4.2vw, 58px)"
    fontWeight: 700
    lineHeight: 1.01
    letterSpacing: "-0.035em"
  display-mobile:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "50px"
    fontWeight: 700
    lineHeight: 1.01
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(32px, 3vw, 38px)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline-sm:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title-lg:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  subtitle-lg:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  subtitle:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title-sm:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  body-lg:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  body-md:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
  caption:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
  stat:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "38px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  stat-mobile:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  headline-xs:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "31px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
rounded:
  hairline: "1px"
  xxs: "4px"
  xs: "5px"
  sm: "6px"
  control: "7px"
  md: "8px"
  icon: "9px"
  lg: "10px"
  panel: "12px"
  xl: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "24px"
  xl: "36px"
  hero: "56px"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.salar-ink}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.signal-orange-hover}"
    textColor: "{colors.salar-ink}"
    rounded: "{rounded.md}"
  button-dark:
    backgroundColor: "{colors.salar-ink}"
    textColor: "{colors.bone-field}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "38px"
  input-search:
    backgroundColor: "{colors.field-paper}"
    textColor: "{colors.salar-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "38px"
  card:
    backgroundColor: "{colors.field-paper}"
    textColor: "{colors.salar-ink}"
    rounded: "{rounded.xl}"
    padding: "18px"
  chip-selected:
    backgroundColor: "{colors.salar-ink}"
    textColor: "{colors.bone-field}"
    rounded: "{rounded.pill}"
    padding: "5px 11px"
  navigation-item-active:
    backgroundColor: "{colors.salar-ink}"
    textColor: "{colors.bone-field}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
  status-badge-critical:
    backgroundColor: "{colors.critical-wash}"
    textColor: "{colors.critical-red}"
    rounded: "{rounded.pill}"
    padding: "3px 7px"
  field-photo:
    backgroundColor: "{colors.salar-ink}"
    textColor: "{colors.bone-field}"
    rounded: "{rounded.xl}"
    padding: "0"
---

# Design System: MiningTech Inventario

## Overview

**Creative North Star: "El parte de faena"**

La interfaz es el parte de turno del pañol, no un dashboard de software. Se apoya en un campo hueso, reglas de tinta y un naranja de señal que marca lo que exige atención. La jerarquía se construye con tipografía, líneas y números; no con sombras difusas ni decoración. Cada pantalla repite la misma gramática operativa: etiqueta, dato, estado y acción.

El sistema es plano y diagramático. La profundidad aparece como bloques de tinta desplazados, como una estampa sobre papel: el diagrama de abastecimiento, el KPI crítico, los modales y el drawer. El resto descansa sobre el campo. La única textura es la fotografía documental de la operación, siempre enmarcada como una placa de campo y velada cuando sostiene un titular. La tabla es densa y ordenable; el detalle abre en contexto; la navegación superior mantiene la acción de carga siempre a mano.

El modo oscuro es el mismo parte bajo el turno noche: superficies de verde profundo, texto hueso y el mismo naranja de señal. No cambia el vocabulario, solo la luz. La interfaz nunca inventa módulos: la compra es una confirmación local y la logística una simulación derivada de cobertura y lead time.

**Key Characteristics:**
- Campo hueso `#EDEADE` y superficies blancas, con tinta `#072C2C` como estructura.
- Naranja `#FF5F03` reservado para acción primaria, tránsito y riesgo.
- Etiquetas monoespaciadas en mayúsculas para datos, SKU, fechas y metadatos.
- Bordes de 2px en contenedores y 1.5px en controles.
- Tarjetas de 16px, controles de 8px y chips tipo píldora.
- Sombras duras desplazadas, sin blur, solo en piezas destacadas.
- Diagrama de abastecimiento vivo como firma de la pantalla.
- Fotografías existentes usadas como placas de campo, con marco, velo de tinta y caption mono.

## Colors

Paleta de alto contraste y temperatura mineral: hueso, tinta verde profunda y un naranja industrial que funciona como baliza.

### Primary
- **Naranja de señal** (`#FF5F03`): acción primaria, tránsito activo, criticidad y foco. Nunca es un fondo extenso.
- **Naranja de hover** (`#FF7A2E`): aclarado accesible para el hover del botón primario.
- **Lavado naranja** (`#FFF3EC`): fondo del KPI crítico, del paso en tránsito y de estados de atención.
- **Naranja profundo** (`#B43A00`): texto de acento sobre fondos claros, con contraste suficiente.

### Secondary
- **Tinta Salar** (`#072C2C`): estructura, marcos, navegación activa, tarjeta destacada y texto principal.
- **Tinta media** (`#354B4A`): texto secundario y descripciones.
- **Tinta mute** (`#5C6B6B`): metadatos, ayudas y etiquetas de menor jerarquía.

### Neutral
- **Campo hueso** (`#EDEADE`): franja hero, cabeceras de tabla y fondos de iconos.
- **Papel** (`#FFFFFF`): tarjetas, tablas, drawer y modales.
- **Papel cálido** (`#FAF9F5`): toolbar, nav y superficies de apoyo.
- **Arena** (`#F2EFE4`): superficies terciarias y hover suave.
- **Línea** (`#E3E1D6`) y **línea fuerte** (`#D9D7CB`): divisores y bordes de control.
- **Noche** (`#062B2A`, `#0B3A39`, `#0E4443`): canvas, superficie y campo en modo oscuro.

### Semantic
- **Rojo crítico** (`#B42318`) con lavado (`#FEE4E2`): quiebre inminente y errores.
- **Ámbar de advertencia** (`#B54708`) con lavado (`#FEF0C7`): cobertura ajustada.
- **Verde operativo** (`#067647`) con lavado (`#DCFCE7`): stock suficiente.
- **Azul informativo** (`#075985`): notas y datos neutros.

### Named Rules
**The Orange Signal Rule.** El naranja ocupa menos del 10% de una pantalla. Si aparece en todas partes, deja de señalar.

**The Bone Field Rule.** El fondo grande es hueso o papel. No hay gradientes, glass ni fotografías de ambiente compitiendo con los datos. Las fotos entran como placas de campo con marco de 2px, no como fondo de página.

**The Field Plate Rule.** Una fotografía es evidencia de contexto, no decoración. Se enmarca, se satura hacia la paleta y se acompaña con un caption mono que aclara que es una imagen de referencia.

## Typography

**Display Font:** Space Grotesk (con Inter y system-ui como respaldo)
**Body Font:** Inter (con system-ui y Segoe UI como respaldo)
**Label/Mono Font:** JetBrains Mono (con ui-monospace y Consolas como respaldo)

**Character:** Space Grotesk aporta el filo industrial de los titulares y los números grandes; Inter mantiene la lectura rápida del cuerpo; JetBrains Mono convierte SKU, fechas, unidades y etiquetas en instrumentos de medición.

### Hierarchy
- **Display** (700, 42–58px, 1.01): titular del Tablero y cifras KPI. Tracking cerrado, máximo 16 caracteres por línea en el hero.
- **Headline** (700, 32–38px, 1.08): títulos de vista en Alertas, Logística, Reportes y Configuración.
- **Title** (700, 20px, 1.2): cabeceras de sección y títulos de tarjetas de gráfico.
- **Body** (400, 13–15px, 1.55): descripciones, ayudas y copy de formularios. Medida máxima de 65–78 caracteres.
- **Label** (600, 11px, 0.08em, mayúsculas): etiquetas de KPI, cabeceras de tabla, metadatos y estados.

### Named Rules
**The Instrument Label Rule.** El monoespaciado se usa para datos, medidas, códigos y metadatos. Nunca para párrafos ni para dar una textura técnica decorativa.

**The Two-Voice Rule.** Space Grotesk y Inter hacen la lectura; el mono hace la medición. No se agrega una tercera familia.

## Layout

El ancho máximo es 1488px con 24px de margen lateral; el contenido respira 32px arriba y 64px abajo. El shell fija la barra superior en 68px y el hero del Tablero en dos columnas: copy operativo sobre una placa fotográfica a la izquierda y diagrama de abastecimiento a la derecha, con 56px de separación. La placa del titular mide entre 180 y 210px de alto según el viewport; el titular se apoya sobre el tercio inferior. Debajo, los KPI ocupan cuatro columnas y el catálogo continúa a ancho completo.

Las vistas de Alertas y Logística incluyen una placa fotográfica a sangre del ancho de contenido, entre la cabecera y los datos. Mide entre 200 y 260px de alto según el viewport y lleva el caption en una franja inferior. Es contexto visual, no un dato: no altera el ancho útil de las tarjetas, la tabla ni los gráficos.

La retícula de contenido usa 14px entre tarjetas, 24px entre bloques y 36px antes de una sección nueva. Las vistas secundarias comparten cabecera, acciones y tabla; no cambian el ritmo. En 1120px la navegación baja a una segunda fila; en 860px el hero y las cabeceras se apilan; en 640px todo pasa a una columna, los KPI se apilan, la navegación se desplaza horizontalmente y las tablas se desplazan dentro de su marco. El drawer ocupa 780px en escritorio y el ancho completo en móvil. En móvil, el historial del drawer se convierte en filas de tarjeta para no cortar columnas.

## Elevation & Depth

El sistema es plano con profundidad estructural. La elevación se representa con bloques de tinta desplazados, no con halos: una sombra dura de 8px para el diagrama y los modales, 4px para el KPI crítico y los toasts, y un borde desplazado de 10px en el canto del drawer. El modo oscuro reemplaza la tinta por negro para conservar el contraste.

Las fotografías se velan con tinta plana: `rgba(7, 44, 44, 0.62)` en claro y `rgba(2, 18, 18, 0.74)` en oscuro cuando sostienen el titular del hero. Las bandas de Alertas y Logística usan un velo más suave (`0.24` claro, `0.34` oscuro) para integrarse al campo sin perder lectura. No hay scrims degradados: el velo es siempre una capa uniforme.

### Shadow Vocabulary
- **Bloque grande** (`box-shadow: 8px 8px 0 0 #072C2C`): diagrama de abastecimiento y modales.
- **Bloque chico** (`box-shadow: 4px 4px 0 0 #072C2C`): KPI crítico y toasts.
- **Bloque naranja** (`box-shadow: 4px 4px 0 0 #FF5F03`): KPI de cobertura y piezas que el sistema elige destacar.
- **Canto de drawer** (`box-shadow: -10px 0 0 rgba(7, 44, 44, 0.14)`): separación del panel lateral.

### Named Rules
**The Stamped Block Rule.** La sombra dura pertenece a una pieza que se levanta del campo. No se aplica a todas las tarjetas ni a los controles en reposo.

**The No Halo Rule.** No hay sombras difusas, glows ni halos de color. La profundidad es un desplazamiento, no una nebulosa.

## Shapes

Los contenedores principales usan marcos de 2px y radios de 16px. Los controles usan 1.5px y 8px; la navegación y las piezas compactas usan 10px; los chips y badges son píldoras de 999px. Los números y las tablas se mantienen rectos: la curva es para la interfaz, no para los datos.

El lenguaje evita la silueta de tarjeta blanda: no hay bordes laterales de color, no hay esquinas de 24px, no hay vidrio. La firma del flujo se resolvió como una ruta plana con conectores punteados y una banda de tránsito a sangre, sin tarjetas anidadas dentro de la tarjeta.

Las placas fotográficas usan el mismo vocabulario: 16px en el hero y 12px en las cabeceras secundarias, siempre con marco de tinta de 2px. La foto puede ser rectangular y dominante; nunca se recorta con máscaras geométricas ni se convierte en silueta.

## Components

### Buttons
- **Shape:** rectángulo de 8px, altura mínima 38px (31px en la variante compacta).
- **Primary:** naranja de señal con texto tinta, peso 700. Es la acción que carga o confirma.
- **Hover / Focus:** hover a `#FF7A2E`; foco visible de 2px con offset de 2px y color tinta sobre el primario.
- **Secondary / Ghost / Danger:** botón oscuro tinta para acciones de navegación; ghost transparente para cierres; danger con borde y texto crítico.

### Chips
- **Style:** píldora de 999px, fondo papel, borde 1.5px y texto 12px.
- **State:** seleccionado en tinta con texto hueso; hover con borde más oscuro; los badges de estado usan lavados semánticos y mayúsculas mono.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** papel en el campo hueso; lavado naranja solo para criticidad.
- **Shadow Strategy:** planas en reposo; bloque duro solo en las piezas destacadas.
- **Border:** 2px de línea fuerte; 2px de tinta en el marco principal.
- **Internal Padding:** 18px en KPI y tarjetas; 14–22px en drawer y modales.

### Inputs / Fields
- **Style:** fondo papel, borde 1.5px, radio 8px, altura 38px.
- **Focus:** borde naranja y anillo de 3px con `rgba(255, 95, 3, 0.12)`.
- **Error / Disabled:** error con lavado y borde crítico; deshabilitado con opacidad 0.55 y cursor bloqueado.

### Navigation
- **Style:** barra superior blanca de 68px, navegación en píldora sobre papel cálido, ítem activo en tinta con texto hueso.
- **Mobile:** la navegación se convierte en una fila desplazable; la marca, el tema y la acción de carga quedan siempre visibles.

### KPI Cards
- **Style:** cuatro columnas, 142px mínimo, etiqueta mono de 11px, valor display de 38px, icono en caja de 36px.
- **Variants:** crítico con lavado naranja y sombra naranja; cobertura con fondo tinta y texto hueso; próximo reaprovisionamiento con valor de 18px.

### Flow Card
- **Style:** tarjeta hueso con marco de tinta y sombra de 8px; cuatro pasos separados por conectores punteados; el paso en tránsito se marca con una banda naranja a sangre, índice naranja y tag de tránsito.
- **Behavior:** los datos se alimentan de los KPI reales; no es una ilustración. El pie enlaza a Logística.

### Field Photo Plates
- **Hero plate:** ocupa el ancho de la columna de copy, mínimo 180–210px de alto, radio 16px y marco de tinta de 2px. La fotografía se cubre con `object-fit: cover` y un velo de tinta uniforme; el titular en hueso se apoya abajo a la izquierda con 26px de padding.
- **Page plate:** ancho completo del contenido, entre 200 y 260px de alto, radio 16px, velo suave de tinta y caption mono en una franja de papel. Se coloca entre la cabecera y los datos de Alertas o Logística; es una banda de contexto, no una miniatura lateral.
- **Caption:** siempre visible, en mono de 11px y mayúsculas: “imagen de referencia”. Un cuadrado naranja de 5px antecede a cada caption.
- **Rules:** solo fotografías existentes de la operación. Nunca dentro de tablas, gráficos, tarjetas de datos, modales ni como fondo de párrafos.

### Tables
- **Style:** cabecera hueso con etiquetas mono de 11px, filas separadas por 1px, números alineados a la derecha y unidad junto al valor.
- **Scroll:** el marco conserva el borde de 2px y la tabla se desplaza horizontalmente en pantallas angostas.

### Drawer & Modals
- **Drawer:** 780px, fondo papel, cabecera con SKU, categoría y badge; estadísticas, gráficos e historial. En móvil ocupa el ancho completo y el historial se convierte en filas de tarjeta.
- **Modal:** 640px, radio 16px, sombra de 8px, cabecera/cuerpo/pie separados por reglas; cierre con Escape y botón visible.

## Do's and Don'ts

### Do:
- **Do** mantener el campo hueso y el papel como superficies dominantes; la tinta estructura, el naranja señala.
- **Do** usar 2px en marcos principales y 1.5px en controles, con radios de 16px y 8px respectivamente.
- **Do** reservar el mono para datos, códigos, fechas, unidades y etiquetas.
- **Do** usar sombras duras solo en el diagrama, el KPI crítico, los modales, los toasts y el canto del drawer.
- **Do** conservar el foco visible, el contraste alto, la navegación por teclado y `prefers-reduced-motion`.
- **Do** adaptar la tabla del drawer a filas de tarjeta en móvil para no esconder columnas.
- **Do** mantener la acción de carga de insumo visible en la barra superior.
- **Do** usar las fotografías existentes como placas de campo: marco de tinta, saturación contenida y caption de “imagen de referencia”.
- **Do** velar la foto del hero con tinta plana para que el titular mantenga contraste AA.

### Don't:
- **Don't** anidar tarjetas dentro de tarjetas. Los pasos del flujo son filas planas, no tarjetas.
- **Don't** usar gradientes, glass, blur decorativo, texturas ni fotografías como fondo ambiental detrás de datos, tablas o párrafos.
- **Don't** recortar fotos con máscaras geométricas ni convertirlas en siluetas decorativas.
- **Don't** aplicar sombras difusas o halos; la profundidad es un bloque desplazado.
- **Don't** extender el naranja a fondos grandes, párrafos o controles secundarios.
- **Don't** convertir todos los controles en píldoras; la píldora es para chips y badges.
- **Don't** introducir módulos, métricas o testimonios que el producto no tiene.
- **Don't** usar emojis o glifos como iconos; el sistema usa SVG de trazo consistente.
- **Don't** romper el modo oscuro: es una inversión de luz, no una paleta distinta.
