(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const num = (v) => (v === null || v === undefined ? '—' : nf.format(v));

  const ESTADOS = {
    QUIEBRE:     { texto: 'Sin stock',   clase: 'critical' },
    CRITICO:     { texto: 'Crítico',     clase: 'critical' },
    ADVERTENCIA: { texto: 'Advertencia', clase: 'warn' },
    OPERATIVO:   { texto: 'Operativo',   clase: 'ok' },
  };

  const VISTAS = ['tablero', 'movimientos', 'alertas', 'logistica', 'reportes', 'configuracion'];

  let vistaActual = 'tablero';
  let cargado = new Set(); // vistas que ya trajeron datos al menos una vez

  // ---------- utilidades compartidas ----------

  function toast(mensaje, tipo = 'ok') {
    const el = document.createElement('div');
    el.className = `toast ${tipo}`;
    el.textContent = mensaje;
    $('#toasts').append(el);
    setTimeout(() => el.remove(), 4200);
  }

  function fechaCorta(iso) {
    if (!iso) return '—';
    // Mismo fix que en app.js: el backend guarda en UTC sin "Z".
    const d = new Date(iso.replace(' ', 'T') + 'Z');
    return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  // ---------- router ----------

  function irA(vista, { forzar = false } = {}) {
    if (!VISTAS.includes(vista)) return;
    vistaActual = vista;

    $$('.view').forEach((s) => { s.hidden = true; });
    $(`#view-${vista}`).hidden = false;

    $$('.nav-item').forEach((b) => {
      const activo = b.dataset.view === vista;
      if (activo) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });

    const boton = $(`.nav-item[data-view="${vista}"]`);
    $('#pageTitle').textContent = boton ? boton.dataset.title : 'Tablero General';

    // Cada vista trae sus propios datos la primera vez que se abre; luego
    // queda al día por el evento "inventario:actualizado" que dispara app.js.
    if (forzar || !cargado.has(vista)) {
      if (vista === 'movimientos') cargarMovimientos();
      if (vista === 'alertas') cargarAlertas();
      if (vista === 'logistica') cargarLogistica();
      if (vista === 'reportes') cargarReportes();
      if (vista === 'configuracion') cargarConfiguracion();
      cargado.add(vista);
    }
  }

  // ---------- Vista: Registro de movimientos ----------

  async function cargarMovimientos() {
    try {
      const movs = await API.movimientos(50);
      $('#vacioMovimientos').hidden = movs.length > 0;
      $('#tbodyMovimientos').innerHTML = movs.map((m) => `
        <tr>
          <td class="mono">${fechaCorta(m.fecha)}</td>
          <td>
            <div class="name">${m.insumo_nombre}</div>
            <div class="sku mono">${m.sku}</div>
          </td>
          <td><span class="badge ${m.tipo === 'ENTRADA' ? 'ok' : 'neutral'}">${m.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}</span></td>
          <td class="num mono">${m.tipo === 'ENTRADA' ? '+' : '−'}${num(m.cantidad)} <span style="color:var(--text-mute)">${m.unidad}</span></td>
          <td>${m.responsable}</td>
          <td style="color:var(--text-dim)">${m.motivo || '—'}</td>
        </tr>`).join('');
    } catch (err) {
      toast(`No se pudo cargar el registro de movimientos: ${err.message}`, 'err');
    }
  }

  // ---------- Vista: Alertas de reorden ----------

  // Insumos con orden de compra ya generada en esta sesión (no hay módulo de
  // compras en el backend todavía, así que se trackea en memoria del navegador).
  const ordenesGeneradas = new Set();

  function tarjetaAlerta(i) {
    const e = ESTADOS[i.estado];
    const lead = Math.max(1, i.lead_time_dias);
    const cobertura = i.cobertura_dias ?? 0;
    // La barra compara cobertura contra 2x el lead time, para que "llegar justo"
    // se vea a mitad de barra y el excedente real de margen quede a la derecha.
    const ratio = Math.min(1, cobertura / (lead * 2));
    const marcaLead = Math.min(100, (lead / (lead * 2)) * 100);
    const yaGenerada = ordenesGeneradas.has(i.id);

    return `
      <article class="alert-card ${e.clase}">
        <div class="alert-card-head">
          <div>
            <div class="name">${i.nombre}</div>
            <div class="sku mono">${i.sku} · ${i.categoria}</div>
          </div>
          <span class="badge ${e.clase}">${e.texto}</span>
        </div>

        <div class="alert-stats">
          <div><span class="label">Stock</span><span class="mono">${num(i.stock_actual)} ${i.unidad}</span></div>
          <div><span class="label">Cobertura</span><span class="mono">${num(i.cobertura_dias)} d</span></div>
          <div><span class="label">Lead time</span><span class="mono">${i.lead_time_dias} d</span></div>
        </div>

        <div class="alert-bar" title="Cobertura vs. lead time del camión">
          <div class="alert-bar-track">
            <i class="alert-bar-fill ${e.clase}" style="width:${ratio * 100}%"></i>
            <i class="alert-bar-mark" style="left:${marcaLead}%"></i>
          </div>
          <div class="alert-bar-labels">
            <span>0 d</span>
            <span class="mono">lead time ${lead} d</span>
          </div>
        </div>

        ${yaGenerada
          ? `<button class="btn btn-sm alert-cta alert-cta-hecho" disabled>✓ Orden generada</button>`
          : `<button class="btn btn-primary btn-sm alert-cta" data-orden="${i.id}">Generar orden de compra</button>`}
      </article>`;
  }

  async function cargarAlertas() {
    try {
      const insumos = await API.insumos();
      const criticos = insumos.filter((i) => ['CRITICO', 'QUIEBRE'].includes(i.estado));
      const advertencia = insumos.filter((i) => i.estado === 'ADVERTENCIA');
      const lista = [...criticos, ...advertencia].sort((a, b) => (a.cobertura_dias ?? 0) - (b.cobertura_dias ?? 0));

      // Un insumo que dejó de estar en alerta (se repuso) libera su marca,
      // para permitir una nueva orden si vuelve a caer en crítico más adelante.
      const idsEnAlerta = new Set(lista.map((i) => i.id));
      [...ordenesGeneradas].forEach((id) => { if (!idsEnAlerta.has(id)) ordenesGeneradas.delete(id); });

      $('#vacioAlertas').hidden = lista.length > 0;
      $('#alertGrid').innerHTML = lista.map(tarjetaAlerta).join('');
      actualizarBadge(criticos.length + advertencia.length);
    } catch (err) {
      toast(`No se pudieron cargar las alertas de reorden: ${err.message}`, 'err');
    }
  }

  function generarOrden(id) {
    return async () => {
      try {
        const insumo = await API.insumo(id);
        const sugerido = Math.max(
          insumo.punto_reorden - insumo.stock_actual,
          insumo.consumo_diario * insumo.lead_time_dias,
        );
        // No existe todavía un módulo de compras en el backend: esta es la
        // confirmación visual de la intención de reponer, a resolver contra
        // el proveedor fuera del sistema.
        toast(`Orden de compra generada: ${insumo.nombre} · ${num(Math.max(1, Math.round(sugerido)))} ${insumo.unidad}.`);
        ordenesGeneradas.add(Number(id));
        await cargarAlertas();
      } catch (err) {
        toast(`No se pudo generar la orden: ${err.message}`, 'err');
      }
    };
  }

  // ---------- Vista: Logística y camiones en tránsito ----------

  const ETAPAS = ['Despachado en SMT', 'En ruta (Quebrada)', 'Llegada a faena'];

  function tarjetaCamion(i, numero) {
    // La posición en ruta se simula a partir de qué tan justo llega el camión:
    // cuanto menor es la cobertura frente al lead time, más avanzado se supone
    // el despacho (la faena reacciona a la urgencia dispachando antes).
    const ratio = i.lead_time_dias > 0 ? (i.cobertura_dias ?? 0) / i.lead_time_dias : 1;
    let etapa = 0;
    if (ratio <= 0.7) etapa = 2;
    else if (ratio <= 1.1) etapa = 1;

    const diasRestantes = etapa === 2 ? 0 : etapa === 1
      ? Math.max(1, Math.round(i.lead_time_dias * 0.4))
      : Math.max(1, Math.round(i.lead_time_dias * 0.85));
    const etiquetaLlegada = etapa === 2
      ? 'Llegada estimada hoy'
      : `Llegada estimada a faena (${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} restantes)`;

    return `
      <article class="truck-card">
        <div class="truck-head">
          <span class="mono truck-id">Camión #${numero}</span>
          <span class="badge ${etapa === 2 ? 'ok' : 'neutral'}">${ETAPAS[etapa]}</span>
        </div>
        <div class="truck-cargo">${i.nombre}</div>
        <div class="truck-sub mono">${i.sku} · destino: pañol central</div>

        <div class="truck-steps">
          ${ETAPAS.map((nombre, idx) => `
            <div class="truck-step ${idx <= etapa ? 'done' : ''} ${idx === etapa ? 'current' : ''}">
              <i></i><span>${nombre}</span>
            </div>`).join('<div class="truck-step-line"></div>')}
        </div>

        <div class="truck-foot">${etiquetaLlegada}</div>
      </article>`;
  }

  async function cargarLogistica() {
    try {
      const insumos = await API.insumos();
      const cantidad = Config.camionesLogistica();
      const enTransito = insumos
        .filter((i) => i.consumo_diario > 0 && i.lead_time_dias > 0)
        .sort((a, b) => (a.cobertura_dias / a.lead_time_dias) - (b.cobertura_dias / b.lead_time_dias))
        .slice(0, cantidad);

      $('#vacioLogistica').hidden = enTransito.length > 0;
      $('#truckGrid').innerHTML = enTransito
        .map((i, idx) => tarjetaCamion(i, 104 + idx * 4))
        .join('');
    } catch (err) {
      toast(`No se pudo cargar la vista de logística: ${err.message}`, 'err');
    }
  }

  // ---------- Vista: Reportes ----------

  const PALETA_CATEGORIAS = ['#0ea5e9', '#06b6d4', '#818cf8', '#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#94a3b8'];

  function coloresTema() {
    const cs = getComputedStyle(document.documentElement);
    const v = (nombre, fallback) => (cs.getPropertyValue(nombre).trim() || fallback);
    return {
      text: v('--text-dim', '#94a3b8'),
      grid: 'rgba(148, 163, 184, 0.22)',
      surface: v('--surface', '#0f172a'),
      estado: {
        OPERATIVO: v('--ok', '#10b981'),
        ADVERTENCIA: v('--warn', '#f59e0b'),
        CRITICO: v('--critical', '#f43f5e'),
        QUIEBRE: v('--critical', '#f43f5e'),
      },
    };
  }

  let chartCategorias = null;
  let chartEstados = null;

  function margenRelativo(i) {
    return i.lead_time_dias > 0 ? (i.cobertura_dias ?? 0) / i.lead_time_dias : null;
  }

  function renderReportKpis(insumos, movimientos) {
    const entradas = movimientos.filter((m) => m.tipo === 'ENTRADA').length;
    const salidas = movimientos.filter((m) => m.tipo === 'SALIDA').length;
    const prioritarios = insumos
      .map((i) => ({ i, r: margenRelativo(i) }))
      .filter((x) => x.r !== null)
      .sort((a, b) => a.r - b.r);
    const top = prioritarios[0];

    $('#reportKpis').innerHTML = `
      <div class="kpi">
        <div class="label">Categorías activas</div>
        <div class="value">${new Set(insumos.map((i) => i.categoria)).size}</div>
        <div class="foot">${insumos.length} insumos en el catálogo</div>
      </div>
      <div class="kpi">
        <div class="label">Entradas registradas</div>
        <div class="value">${entradas}</div>
        <div class="foot">de los últimos ${movimientos.length} movimientos</div>
      </div>
      <div class="kpi">
        <div class="label">Salidas registradas</div>
        <div class="value">${salidas}</div>
        <div class="foot">de los últimos ${movimientos.length} movimientos</div>
      </div>
      <div class="kpi ${top && top.r < 1 ? 'is-critical' : ''}">
        <div class="label">Insumo con menor margen</div>
        <div class="value" style="font-size:16px">${top ? top.i.nombre : '—'}</div>
        <div class="foot">${top ? `cobertura ${num(top.i.cobertura_dias)} d vs. lead time ${top.i.lead_time_dias} d` : 'sin datos suficientes'}</div>
      </div>`;
  }

  function renderChartCategorias(insumos) {
    const C = coloresTema();
    const conteo = new Map();
    insumos.forEach((i) => conteo.set(i.categoria, (conteo.get(i.categoria) || 0) + 1));
    const entradas = [...conteo.entries()].sort((a, b) => b[1] - a[1]);

    chartCategorias?.destroy();
    chartCategorias = new Chart($('#chartCategorias'), {
      type: 'bar',
      data: {
        labels: entradas.map(([cat]) => cat),
        datasets: [{
          data: entradas.map(([, n]) => n),
          backgroundColor: entradas.map((_, idx) => PALETA_CATEGORIAS[idx % PALETA_CATEGORIAS.length]),
          borderRadius: 3,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { color: C.text, stepSize: 1 }, grid: { color: C.grid } },
          y: { ticks: { color: C.text }, grid: { display: false } },
        },
      },
    });
  }

  function renderChartEstados(insumos) {
    const C = coloresTema();
    const orden = ['OPERATIVO', 'ADVERTENCIA', 'CRITICO', 'QUIEBRE'];
    const conteo = orden.map((e) => insumos.filter((i) => i.estado === e).length);

    chartEstados?.destroy();
    chartEstados = new Chart($('#chartEstados'), {
      type: 'doughnut',
      data: {
        labels: ['Operativo', 'Advertencia', 'Crítico', 'Sin stock'],
        datasets: [{
          data: conteo,
          backgroundColor: orden.map((e) => C.estado[e]),
          borderColor: C.surface,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 14, color: C.text } } },
      },
    });
  }

  function renderTablaPrioridad(insumos) {
    const filas = insumos
      .map((i) => ({ i, r: margenRelativo(i) }))
      .filter((x) => x.r !== null)
      .sort((a, b) => a.r - b.r)
      .slice(0, 5);

    $('#tbodyPrioridad').innerHTML = filas.map(({ i, r }) => {
      const e = ESTADOS[i.estado];
      return `<tr>
        <td><div class="name">${i.nombre}</div><div class="sku mono">${i.sku}</div></td>
        <td>${i.categoria}</td>
        <td class="num mono">${num(i.cobertura_dias)} d</td>
        <td class="num mono">${i.lead_time_dias} d</td>
        <td class="num mono">${r.toFixed(2)}×</td>
        <td><span class="badge ${e.clase}">${e.texto}</span></td>
      </tr>`;
    }).join('');
  }

  function descargarArchivo(nombre, contenido, tipo) {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportarCSV(insumos) {
    const columnas = ['sku', 'nombre', 'categoria', 'unidad', 'stock_actual', 'stock_minimo',
      'consumo_diario', 'lead_time_dias', 'cobertura_dias', 'punto_reorden', 'estado'];
    const encabezado = columnas.join(';');
    const filas = insumos.map((i) => columnas.map((c) => String(i[c] ?? '').replace(/;/g, ',')).join(';'));
    const csv = [encabezado, ...filas].join('\n');
    const nombre = `miningtech-reporte-insumos-${new Date().toISOString().slice(0, 10)}.csv`;
    try {
      descargarArchivo(nombre, csv, 'text/csv;charset=utf-8');
      toast('Reporte exportado como CSV.');
    } catch (err) {
      toast(`No se pudo exportar el reporte: ${err.message}`, 'err');
    }
  }

  let ultimosInsumosReporte = [];

  async function cargarReportes() {
    try {
      const [insumos, movimientos] = await Promise.all([API.insumos(), API.movimientos(50)]);
      ultimosInsumosReporte = insumos;
      renderReportKpis(insumos, movimientos);
      renderChartCategorias(insumos);
      renderChartEstados(insumos);
      renderTablaPrioridad(insumos);
    } catch (err) {
      toast(`No se pudieron cargar los reportes: ${err.message}`, 'err');
    }
  }

  // ---------- Vista: Configuración ----------

  /** Las tres listas "frecuentes" (responsables, motivos, categorías) comparten
   *  el mismo patrón de chips removibles, así que usan un único renderer. */
  function renderChipsFrecuentes(contenedorId, valores, vacioTexto) {
    $(`#${contenedorId}`).innerHTML = valores.map((v) => `
      <span class="chip chip-removable">
        ${v}
        <button type="button" data-quitar="${v}" aria-label="Quitar ${v}">×</button>
      </span>`).join('') || `<span class="hint">${vacioTexto}</span>`;
  }

  function renderTodosLosChips(cfg) {
    renderChipsFrecuentes('responsablesChips', cfg.responsables, 'Todavía no cargaste responsables frecuentes.');
    renderChipsFrecuentes('motivosChips', cfg.motivos, 'Todavía no cargaste motivos frecuentes.');
    renderChipsFrecuentes('categoriasChips', cfg.categorias, 'Todavía no cargaste categorías frecuentes.');
  }

  function cargarConfiguracion() {
    const cfg = Config.get();
    $('#cfg-nombre').value = cfg.faenaNombre;
    $('#cfg-altitud').value = cfg.faenaAltitud;
    $('#cfg-dias').value = cfg.diasHistorial;
    $('#cfg-camiones').value = cfg.camionesLogistica;
    $('#cfg-auto').value = String(cfg.autoRefreshSegundos);
    renderTodosLosChips(cfg);
  }

  // ---------- Eventos ----------

  function conectarEventosReportes() {
    $('#btnRefrescarReportes').addEventListener('click', cargarReportes);
    $('#btnExportarReporte').addEventListener('click', () => exportarCSV(ultimosInsumosReporte));
  }

  /** Conecta el input + botón "Agregar" y el click de "quitar" de una lista frecuente. */
  function conectarListaFrecuente({ inputId, btnAgregarId, chipsId, agregar, quitar }) {
    $(`#${btnAgregarId}`).addEventListener('click', () => {
      const input = $(`#${inputId}`);
      if (!input.value.trim()) return;
      const cfg = agregar(input.value);
      input.value = '';
      renderTodosLosChips(cfg);
    });

    $(`#${inputId}`).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); $(`#${btnAgregarId}`).click(); }
    });

    $(`#${chipsId}`).addEventListener('click', (e) => {
      const btn = e.target.closest('[data-quitar]');
      if (!btn) return;
      const cfg = quitar(btn.dataset.quitar);
      renderTodosLosChips(cfg);
    });
  }

  function conectarEventosConfiguracion() {
    $('#btnGuardarFaena').addEventListener('click', () => {
      const nombre = $('#cfg-nombre').value.trim() || 'Faena Salar';
      const altitud = Math.max(0, Number($('#cfg-altitud').value) || 0);
      Config.set({ faenaNombre: nombre, faenaAltitud: altitud });
      toast('Datos de la faena actualizados.');
    });

    $('#btnGuardarDias').addEventListener('click', () => {
      const dias = Math.min(90, Math.max(7, Number($('#cfg-dias').value) || 30));
      $('#cfg-dias').value = dias;
      Config.set({ diasHistorial: dias });
      toast(`Las gráficas de detalle ahora muestran ${dias} días.`);
    });

    $('#btnGuardarCamiones').addEventListener('click', () => {
      const cantidad = Math.min(8, Math.max(2, Number($('#cfg-camiones').value) || 4));
      $('#cfg-camiones').value = cantidad;
      Config.set({ camionesLogistica: cantidad });
      toast(`Logística ahora muestra ${cantidad} camiones.`);
    });

    $('#btnGuardarAuto').addEventListener('click', () => {
      const segundos = Number($('#cfg-auto').value) || 0;
      Config.set({ autoRefreshSegundos: segundos });
      toast(segundos > 0 ? `Actualización automática cada ${segundos} segundos.` : 'Actualización automática desactivada.');
    });

    conectarListaFrecuente({
      inputId: 'cfg-nuevo-responsable', btnAgregarId: 'btnAgregarResponsable', chipsId: 'responsablesChips',
      agregar: (v) => Config.agregarResponsable(v), quitar: (v) => Config.quitarResponsable(v),
    });
    conectarListaFrecuente({
      inputId: 'cfg-nuevo-motivo', btnAgregarId: 'btnAgregarMotivo', chipsId: 'motivosChips',
      agregar: (v) => Config.agregarMotivo(v), quitar: (v) => Config.quitarMotivo(v),
    });
    conectarListaFrecuente({
      inputId: 'cfg-nueva-categoria', btnAgregarId: 'btnAgregarCategoria', chipsId: 'categoriasChips',
      agregar: (v) => Config.agregarCategoria(v), quitar: (v) => Config.quitarCategoria(v),
    });
  }

  // ---------- Badge de alertas en el sidebar ----------

  async function actualizarBadge(valorConocido = null) {
    try {
      let n = valorConocido;
      if (n === null) {
        const k = await API.kpis();
        n = k.criticos + k.advertencia;
      }
      const b = $('#badgeAlertas');
      b.textContent = n;
      b.hidden = n === 0;
    } catch (_) { /* el badge es un detalle secundario, no interrumpe el resto */ }
  }

  // ---------- Eventos ----------

  function conectarEventos() {
    $('#navList').addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item');
      if (btn) irA(btn.dataset.view);
    });

    $('#btnRefrescarMov')?.addEventListener('click', cargarMovimientos);

    $('#alertGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-orden]');
      if (btn) generarOrden(btn.dataset.orden)();
    });

    conectarEventosReportes();
    conectarEventosConfiguracion();

    // Cuando el Tablero recarga datos (alta, edición o movimiento), refrescamos
    // en silencio la vista de alertas si es la que está abierta, y el badge siempre.
    window.addEventListener('inventario:actualizado', () => {
      actualizarBadge();
      if (vistaActual === 'alertas') cargarAlertas();
      if (vistaActual === 'logistica') cargarLogistica();
      if (vistaActual === 'reportes') cargarReportes();
    });

    // Los gráficos de Chart.js no se repintan solos con el CSS: si cambia el
    // tema y Reportes está abierto, hay que reconstruirlos con los colores nuevos.
    window.addEventListener('config:actualizada', (e) => {
      if (vistaActual === 'reportes' && ultimosInsumosReporte.length) {
        renderChartCategorias(ultimosInsumosReporte);
        renderChartEstados(ultimosInsumosReporte);
      }
      if (vistaActual === 'logistica') cargarLogistica();
    });
  }

  conectarEventos();
  actualizarBadge();
  irA('tablero');
})();