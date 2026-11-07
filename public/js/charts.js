/* Gráficos del drawer de detalle (Chart.js 4). */
window.Charts = (() => {
  const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  const css = (nombre, fallback) => {
    const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
    return valor || fallback;
  };

  /** Lee el tema en cada render: app.js reconstruye los gráficos al cambiarlo. */
  function tema() {
    return {
      text: css('--text-mute', '#5c6b6b'),
      strong: css('--text', '#072c2c'),
      grid: css('--chart-grid', 'rgba(7, 44, 44, 0.12)'),
      accent: css('--accent', '#ff5f03'),
      warn: css('--warn', '#b54708'),
      critical: css('--critical', '#b42318'),
      featureBg: css('--feature-bg', '#072c2c'),
      featureText: css('--feature-text', '#edeade'),
      mono: css('--mono', "'JetBrains Mono', monospace"),
      sans: css('--sans', "'Inter', system-ui, sans-serif"),
    };
  }

  /** Convierte #rrggbb a rgba para rellenos suaves sobre canvas. */
  function alfa(color, opacidad) {
    const hex = color.replace('#', '');
    if (hex.length !== 6) return color;
    const n = parseInt(hex, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
  }

  const vivos = new Map();

  function destruir() {
    vivos.forEach((ch) => ch.destroy());
    vivos.clear();
  }

  const dia = (iso) => {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
  };

  const ejes = (unidad, C) => ({
    x: {
      grid: { color: C.grid, drawTicks: false },
      border: { display: false },
      ticks: {
        color: C.text,
        font: { family: C.mono, size: 10 },
        maxRotation: 0,
        autoSkipPadding: 18,
      },
    },
    y: {
      beginAtZero: true,
      grid: { color: C.grid },
      border: { display: false },
      title: {
        display: !!unidad,
        text: unidad,
        color: C.text,
        font: { family: C.mono, size: 10 },
      },
      ticks: { color: C.text, font: { family: C.mono, size: 10 } },
    },
  });

  const leyenda = (C) => ({
    position: 'bottom',
    labels: {
      color: C.strong,
      usePointStyle: true,
      pointStyle: 'rectRounded',
      boxWidth: 8,
      boxHeight: 8,
      padding: 14,
      font: { family: C.sans, size: 10 },
    },
  });

  const tooltip = (C, unidad) => ({
    backgroundColor: C.featureBg,
    titleColor: C.featureText,
    bodyColor: C.featureText,
    borderColor: C.accent,
    borderWidth: 1,
    padding: 10,
    cornerRadius: 6,
    displayColors: true,
    boxWidth: 8,
    boxHeight: 8,
    usePointStyle: true,
    titleFont: { family: C.mono, size: 10, weight: '600' },
    bodyFont: { family: C.mono, size: 10 },
    callbacks: {
      label: (ctx) => ` ${ctx.dataset.label}: ${nf.format(ctx.parsed.y)} ${unidad}`,
    },
  });

  // Chart.js no lee variables CSS: se fijan una vez para las fuentes y el color
  // base; cada gráfico vuelve a leer el tema al construirse.
  const inicial = tema();
  Chart.defaults.color = inicial.text;
  Chart.defaults.font.family = inicial.mono;
  Chart.defaults.font.size = 10;

  /** Evolución de stock a N días + proyección, contra mínimo y punto de reorden. */
  function evolucion(canvas, serie) {
    const C = tema();
    const { insumo, historico, proyeccion } = serie;
    const labelsHist = historico.map((p) => p.fecha);
    const labelsProy = proyeccion.slice(1).map((p) => p.fecha);
    const labels = [...labelsHist, ...labelsProy];

    const real = [...historico.map((p) => p.stock), ...labelsProy.map(() => null)];
    const proy = [
      ...labelsHist.slice(0, -1).map(() => null),
      ...proyeccion.map((p) => p.stock),
    ];

    const ch = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.map(dia),
        datasets: [
          {
            label: 'Stock real',
            data: real,
            borderColor: C.accent,
            backgroundColor: alfa(C.accent, 0.1),
            fill: true,
            tension: 0.24,
            pointRadius: 0,
            borderWidth: 2.2,
          },
          {
            label: 'Proyección al ritmo actual',
            data: proy,
            borderColor: C.strong,
            borderDash: [5, 4],
            tension: 0,
            pointRadius: 0,
            borderWidth: 1.5,
          },
          {
            label: 'Punto de reorden',
            data: labels.map(() => insumo.punto_reorden),
            borderColor: C.warn,
            borderDash: [2, 3],
            pointRadius: 0,
            borderWidth: 1.2,
          },
          {
            label: 'Stock de seguridad',
            data: labels.map(() => insumo.stock_minimo),
            borderColor: C.critical,
            borderDash: [2, 3],
            pointRadius: 0,
            borderWidth: 1.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: ejes(insumo.unidad, C),
        plugins: {
          legend: leyenda(C),
          tooltip: tooltip(C, insumo.unidad),
        },
      },
    });
    vivos.set('evolucion', ch);
    return ch;
  }

  /** Consumo diario observado contra el promedio usado para proyectar el quiebre. */
  function consumo(canvas, serie) {
    const C = tema();
    const datos = serie.consumo_por_dia;
    const promedio = serie.insumo.consumo_diario;

    const ch = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: datos.map((p) => dia(p.fecha)),
        datasets: [
          {
            label: 'Consumo registrado',
            data: datos.map((p) => p.consumo),
            backgroundColor: alfa(C.accent, 0.55),
            borderColor: C.accent,
            borderWidth: 1,
            borderRadius: 2,
            order: 2,
          },
          {
            type: 'line',
            label: 'Consumo diario de referencia',
            data: datos.map(() => promedio),
            borderColor: C.strong,
            borderWidth: 1.5,
            borderDash: [5, 4],
            pointRadius: 0,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: ejes(`${serie.insumo.unidad} / día`, C),
        plugins: {
          legend: leyenda(C),
          tooltip: tooltip(C, serie.insumo.unidad),
        },
      },
    });
    vivos.set('consumo', ch);
    return ch;
  }

  return { evolucion, consumo, destruir };
})();
