/* Ensambla public/ en un único archivo HTML autocontenido (demo sin servidor). */
'use strict';

const fs = require('fs');
const path = require('path');

const P = (f) => path.join(__dirname, 'public', f);
const read = (f) => fs.readFileSync(P(f), 'utf8');

let html = read('index.html');
const css = read('css/styles.css');

// 1. Inlinear CSS
// (se usa una función de reemplazo: en un string literal, "$$" se colapsaría a "$")
html = html.replace(
  '<link rel="stylesheet" href="./css/styles.css">',
  () => `<style>\n${css}\n</style>`,
);

// 2. Chart.js desde cdnjs (permitido en páginas publicadas)
html = html.replace(
  '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>',
);

// 3. Reemplazar el cliente REST por el store local e inlinear el resto
html = html.replace(
  '<script src="./js/api.js"></script>',
  () => `<script>\n${read('js/store-local.js')}\n</script>`,
);
html = html.replace(
  '<script src="./js/charts.js"></script>',
  () => `<script>\n${read('js/charts.js')}\n</script>`,
);
html = html.replace(
  '<script src="./js/app.js"></script>',
  () => `<script>\n${read('js/app.js')}\n</script>`,
);

// 4. Acciones exclusivas de la demo
html = html.replace(
  '<button class="btn btn-primary" id="btnNuevo">Cargar insumo</button>',
  () => `<button class="btn btn-ghost" id="btnExportar">Exportar base</button>
    <button class="btn btn-ghost" id="btnReiniciar">Restablecer demo</button>
    <button class="btn btn-primary" id="btnNuevo">Cargar insumo</button>`,
);

html = html.replace('</body>', () => `<script>
(() => {
  const $ = (s) => document.querySelector(s);

  $('#btnReiniciar').addEventListener('click', () => {
    if (!confirm('Se descartan los cambios y se vuelve a generar el inventario de demostración. ¿Continuar?')) return;
    API.reiniciar();
    location.reload();
  });

  $('#btnExportar').addEventListener('click', async () => {
    const json = API.exportar();
    const nombre = 'miningtech-inventario-' + new Date().toISOString().slice(0, 10) + '.json';
    let guardado = false;
    try {
      const downloads = window.claude && await window.claude.use('downloads');
      if (downloads) { await downloads.save({ filename: nombre, data: json }); guardado = true; }
    } catch (_) { /* el visor puede rechazar la descarga */ }
    if (!guardado) {
      try {
        const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url; a.download = nombre; a.click();
        URL.revokeObjectURL(url);
        guardado = true;
      } catch (_) { /* descarga bloqueada */ }
    }
    if (!guardado) {
      await navigator.clipboard.writeText(json).catch(() => {});
      alert('La base se copió al portapapeles en formato JSON.');
    }
  });
})();
</script>
</body>`);

const salida = path.join(__dirname, 'demo-standalone.html');
fs.writeFileSync(salida, html, 'utf8');
console.log(`Demo autocontenida generada: ${salida} (${(html.length / 1024).toFixed(0)} KB)`);
