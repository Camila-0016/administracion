/* Gráficos del drawer de detalle (Chart.js 4). */
window.Charts = (() => {
  const C = {
    text: '#94a3b8',
    grid: 'rgba(51, 65, 85, 0.35)',
    accent: '#0ea5e9',
    accent2: '#06b6d4',
    warn: '#f59e0b',
    critical: '#f43f5e',
    ok: '#10b981',
  };

  Chart.defaults.color = C.text;
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.font.size = 11;

  const vivos = new Map();

  function destruir() {
    vivos.forEach((ch) => ch.destroy());
    vivos.clear();
  }

  const dia = (iso) => {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
  };

  const ejes = (unidad) => ({
    x: { grid: { color: C.grid, drawTicks: false }, ticks: { maxRotation: 0, autoSkipPadding: 18 } },
    y: {
      beginAtZero: true,
      grid: { color: C.grid },
      title: { display: !!unidad, text: unidad, color: C.text },
      ticks: { font: { family: "'JetBrains Mono', monospace" } },
    },
  });

  const tooltip = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    padding: 10,
    titleColor: '#e2e8f0',
    bodyColor: '#cbd5e1',
    bodyFont: { family: "'JetBrains Mono', monospace" },
  };

  /** Evolución de stock a 30 días + proyección, contra mínimo y punto de reorden. */
  function evolucion(canvas, serie) {
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
            backgroundColor: 'rgba(14,165,233,.12)',
            fill: true,
            tension: 0.25,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Proyección al ritmo actual',
            data: proy,
            borderColor: C.accent2,
            borderDash: [5, 4],
            tension: 0,
            pointRadius: 0,
            borderWidth: 1.6,
          },
          {
            label: 'Punto de reorden',
            data: labels.map(() => insumo.punto_reorden),
            borderColor: C.warn,
            borderDash: [3, 3],
            pointRadius: 0,
            borderWidth: 1.2,
          },
          {
            label: 'Stock de seguridad',
            data: labels.map(() => insumo.stock_minimo),
            borderColor: C.critical,
            borderDash: [3, 3],
            pointRadius: 0,
            borderWidth: 1.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: ejes(insumo.unidad),
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 14 } },
          tooltip,
        },
      },
    });
    vivos.set('evolucion', ch);
    return ch;
  }

  /** Consumo diario observado contra el promedio usado para proyectar el quiebre. */
  function consumo(canvas, serie) {
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
            backgroundColor: 'rgba(6,182,212,.45)',
            borderColor: C.accent2,
            borderWidth: 1,
            borderRadius: 2,
            order: 2,
          },
          {
            type: 'line',
            label: 'Consumo diario de referencia',
            data: datos.map(() => promedio),
            borderColor: C.warn,
            borderWidth: 1.6,
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
        scales: ejes(`${serie.insumo.unidad} / día`),
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 14 } },
          tooltip,
        },
      },
    });
    vivos.set('consumo', ch);
    return ch;
  }

  return { evolucion, consumo, destruir };
})();
