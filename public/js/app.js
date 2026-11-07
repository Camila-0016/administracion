/* ==========================================================
   Inventario Inteligente en Altura — controlador de la UI
   ========================================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const estado = {
    insumos: [],
    filtros: { q: '', categoria: '', estado: '' },
    orden: { campo: 'cobertura_dias', dir: 'asc' },
    detalleId: null,
    tipoMov: 'ENTRADA',
  };

  const ESTADOS = {
    QUIEBRE:     { texto: 'Sin stock',   clase: 'critical' },
    CRITICO:     { texto: 'Crítico',     clase: 'critical' },
    ADVERTENCIA: { texto: 'Advertencia', clase: 'warn' },
    OPERATIVO:   { texto: 'Operativo',   clase: 'ok' },
  };

  // ---------- utilidades de formato ----------

  const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const num = (v) => (v === null || v === undefined ? '—' : nf.format(v));
  const fechaCorta = (iso) => {
    if (!iso) return '—';
    // El backend guarda las fechas en UTC sin indicador de zona ("YYYY-MM-DD HH:MM:SS").
    // Sin la "Z", el navegador las interpretaría como si ya fueran hora local.
    const d = new Date(iso.replace(' ', 'T') + 'Z');
    return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };
  const fechaLarga = (iso) => (iso
    ? new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—');

  function toast(mensaje, tipo = 'ok') {
    const el = document.createElement('div');
    el.className = `toast ${tipo}`;
    el.textContent = mensaje;
    $('#toasts').append(el);
    setTimeout(() => el.remove(), 4200);
  }

  // ---------- KPIs ----------

  const ICONO = {
    caja: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
    alerta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20z"/><path d="M12 10v5M12 18v.5"/></svg>',
    medidor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16a8 8 0 1 1 16 0"/><path d="m12 16 4-5"/></svg>',
    reloj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  };

  async function renderKpis() {
    const k = await API.kpis();
    const prox = k.proximo_reaprovisionamiento;
    const cuando = prox
      ? (prox.dias <= 0 ? 'Pedido vencido: emitir hoy' : `En ${num(prox.dias)} días`)
      : 'Sin pendientes';
    const alertas = k.criticos + k.advertencia;
    const camiones = window.Config ? window.Config.camionesLogistica() : 4;

    $('#kpis').innerHTML = `
      <div class="kpi">
        <span class="kpi-ico">${ICONO.caja}</span>
        <div class="label">Insumos en catálogo</div>
        <div class="value">${k.total_insumos}</div>
        <div class="foot">${k.operativos} operativos · ${k.advertencia} en advertencia</div>
      </div>
      <div class="kpi ${k.criticos ? 'is-critical' : ''}">
        <span class="kpi-ico">${ICONO.alerta}</span>
        <div class="label">Quiebre inminente</div>
        <div class="value">${k.criticos}</div>
        <div class="foot">La cobertura no alcanza a cubrir el viaje del camión</div>
      </div>
      <div class="kpi is-accent">
        <span class="kpi-ico">${ICONO.medidor}</span>
        <div class="label">Cobertura global</div>
        <div class="value">${num(k.cobertura_global)}%</div>
        <div class="meter" role="presentation"><i style="width:${Math.min(100, k.cobertura_global)}%"></i></div>
      </div>
      <div class="kpi">
        <span class="kpi-ico">${ICONO.reloj}</span>
        <div class="label">Próximo reaprovisionamiento</div>
        <div class="value value-sm">${cuando}</div>
        <div class="foot">${prox ? `${prox.nombre} · lead time ${prox.lead_time_dias} d` : '—'}</div>
      </div>`;

    // La tarjeta de flujo y el hero se alimentan de los mismos KPIs que la grilla,
    // así no hay dos verdades distintas en pantalla.
    $('#flowTotal').textContent = num(k.total_insumos);
    $('#flowCriticos').textContent = num(k.criticos);
    $('#flowCobertura').textContent = `${num(k.cobertura_global)}%`;
    $('#flowCamiones').textContent = `${camiones} en tránsito`;
    $('#flowProximo').textContent = prox ? `${cuando} · ${prox.nombre}` : 'Sin pedidos pendientes';
    $('#heroCobertura').textContent = num(k.cobertura_global);
    $('#heroAlertasCount').textContent = alertas;
  }

  // ---------- Tabla ----------

  function ordenar(lista) {
    const { campo, dir } = estado.orden;
    const signo = dir === 'asc' ? 1 : -1;
    return [...lista].sort((a, b) => {
      let x = a[campo];
      let y = b[campo];
      if (x === null) x = Infinity;
      if (y === null) y = Infinity;
      if (typeof x === 'string') return signo * x.localeCompare(y, 'es');
      return signo * (x - y);
    });
  }

  function barraCobertura(insumo) {
    if (insumo.cobertura_dias === null) return '<span class="mono">—</span>';
    const lead = Math.max(1, insumo.lead_time_dias);
    const ratio = Math.min(1, insumo.cobertura_dias / (lead * 2));
    const color = insumo.estado === 'CRITICO' || insumo.estado === 'QUIEBRE'
      ? 'var(--critical)'
      : insumo.estado === 'ADVERTENCIA' ? 'var(--warn)' : 'var(--ok)';
    return `<div class="cobertura">
        <span class="mono">${num(insumo.cobertura_dias)} d</span>
        <span class="bar"><i style="width:${ratio * 100}%;background:${color}"></i></span>
      </div>`;
  }

  function filtrar() {
    const { q, categoria, estado: est } = estado.filtros;
    const t = q.trim().toLowerCase();
    return estado.insumos.filter((i) => {
      if (categoria && i.categoria !== categoria) return false;
      if (est === 'CRITICO' && !['CRITICO', 'QUIEBRE'].includes(i.estado)) return false;
      if (est && est !== 'CRITICO' && i.estado !== est) return false;
      if (t && !`${i.nombre} ${i.sku}`.toLowerCase().includes(t)) return false;
      return true;
    });
  }

  function renderTabla() {
    const filas = ordenar(filtrar());
    $('#vacio').hidden = filas.length > 0;
    $('#tabla').hidden = filas.length === 0;
    $('#resultCount').textContent = filas.length === estado.insumos.length
      ? `${estado.insumos.length} insumos`
      : `${filas.length} de ${estado.insumos.length} insumos`;

    $('#tbody').innerHTML = filas.map((i) => {
      const e = ESTADOS[i.estado];
      return `<tr data-id="${i.id}" tabindex="0">
        <td>
          <div class="name">${i.nombre}</div>
          <div class="sku mono">${i.sku}</div>
        </td>
        <td>${i.categoria}</td>
        <td class="num mono">${num(i.stock_actual)} <span class="unit">${i.unidad}</span></td>
        <td class="num mono">${num(i.stock_minimo)}</td>
        <td class="num mono">${num(i.consumo_diario)}</td>
        <td class="num mono">${i.lead_time_dias} d</td>
        <td class="num">${barraCobertura(i)}</td>
        <td><span class="badge ${e.clase}">${e.texto}</span></td>
        <td class="num">
          <div class="row-actions">
            <button class="icon-btn" data-mov="ENTRADA" data-id="${i.id}" title="Registrar entrada" aria-label="Registrar entrada de ${i.nombre}">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9"/></svg>
            </button>
            <button class="icon-btn" data-mov="SALIDA" data-id="${i.id}" title="Registrar salida" aria-label="Registrar salida de ${i.nombre}">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8h9"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');

    $$('#tabla thead th[data-sort]').forEach((th) => {
      const activo = th.dataset.sort === estado.orden.campo;
      th.querySelector('.arrow')?.remove();
      if (activo) {
        const s = document.createElement('span');
        s.className = `arrow ${estado.orden.dir}`;
        s.setAttribute('aria-hidden', 'true');
        th.append(s);
        th.setAttribute('aria-sort', estado.orden.dir === 'asc' ? 'ascending' : 'descending');
      } else {
        th.setAttribute('aria-sort', 'none');
      }
    });
  }

  async function recargar() {
    estado.insumos = await API.insumos();
    renderTabla();
    await renderKpis();
    await renderCategorias();
    // Otras vistas (Alertas, Logística) escuchan este evento para no quedar desactualizadas
    // cuando se registra un movimiento o se edita un insumo desde el Tablero.
    window.dispatchEvent(new CustomEvent('inventario:actualizado', { detail: { insumos: estado.insumos } }));
  }

  async function renderCategorias() {
    const cats = await API.categorias();
    const sel = $('#filtroCategoria');
    const actual = sel.value;
    sel.innerHTML = '<option value="">Todas las categorías</option>'
      + cats.map((c) => `<option>${c}</option>`).join('');
    sel.value = actual;

    // El datalist del alta/edición suma las categorías configuradas en
    // Configuración, así se sugieren aunque todavía ningún insumo las use.
    const configuradas = window.Config ? window.Config.get().categorias : [];
    const combinadas = [...new Set([...cats, ...configuradas])].sort((a, b) => a.localeCompare(b, 'es'));
    $('#categoriasList').innerHTML = combinadas.map((c) => `<option>${c}</option>`).join('');
  }

  // ---------- Drawer de detalle ----------

  async function abrirDetalle(id) {
    estado.detalleId = id;
    const dias = window.Config ? window.Config.diasHistorial() : 30;
    const [serie, historial] = await Promise.all([API.serie(id, dias), API.historial(id)]);
    const i = serie.insumo;
    const e = ESTADOS[i.estado];

    $('#drawerTitulo').textContent = i.nombre;
    $('#drawerSub').innerHTML = `<span>${i.sku} · ${i.categoria}</span><span class="badge ${e.clase}">${e.texto}</span>`;

    $('#drawerBody').innerHTML = `
      <div class="stat-row">
        <div class="stat"><div class="label">Stock actual</div><div class="value">${num(i.stock_actual)} <span class="unit">${i.unidad}</span></div></div>
        <div class="stat"><div class="label">Cobertura</div><div class="value">${num(i.cobertura_dias)} d</div></div>
        <div class="stat"><div class="label">Lead time</div><div class="value">${i.lead_time_dias} d</div></div>
        <div class="stat"><div class="label">Punto de reorden</div><div class="value">${num(i.punto_reorden)}</div></div>
        <div class="stat"><div class="label">Quiebre estimado</div><div class="value value-sm">${fechaLarga(i.fecha_quiebre)}</div></div>
      </div>

      <div class="chart-card">
        <h3>Nivel de stock, últimos ${dias} días</h3>
        <p class="cap">La línea punteada proyecta el stock si el consumo se mantiene igual.</p>
        <div class="chart-box"><canvas id="chartEvolucion"></canvas></div>
      </div>

      <div class="chart-card">
        <h3>Consumo diario y runway</h3>
        <p class="cap">Promedio observado en la ventana: <span class="mono">${num(serie.consumo_observado)} ${i.unidad}/día</span>. Al ritmo de referencia el stock llega a cero el <strong>${fechaLarga(i.fecha_quiebre)}</strong>.</p>
        <div class="chart-box"><canvas id="chartConsumo"></canvas></div>
      </div>

      <div class="section-head">
        <h2>Historial de movimientos</h2>
        <span class="hint">${historial.length} asientos</span>
        <div class="head-actions">
          <button class="btn btn-sm" data-mov="ENTRADA" data-id="${i.id}">Registrar entrada</button>
          <button class="btn btn-sm" data-mov="SALIDA" data-id="${i.id}">Registrar salida</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="hist-table">
          <thead><tr>
            <th>Fecha</th><th>Responsable</th><th>Tipo</th>
            <th class="num">Cantidad</th><th>Observaciones</th>
          </tr></thead>
          <tbody>${historial.map((m) => `
            <tr>
              <td class="mono">${fechaCorta(m.fecha)}</td>
              <td>${m.responsable}</td>
              <td><span class="badge ${m.tipo === 'ENTRADA' ? 'ok' : 'neutral'}">${m.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}</span></td>
              <td class="num mono">${m.tipo === 'ENTRADA' ? '+' : '−'}${num(m.cantidad)}</td>
              <td class="motive">${m.motivo || '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    Charts.destruir();
    Charts.evolucion($('#chartEvolucion'), serie);
    Charts.consumo($('#chartConsumo'), serie);

    $('#drawer').classList.add('open');
    $('#drawer').setAttribute('aria-hidden', 'false');
    $('#overlay').hidden = false;
  }

  function cerrarDrawer() {
    Charts.destruir();
    $('#drawer').classList.remove('open');
    $('#drawer').setAttribute('aria-hidden', 'true');
    if ($('#modalInsumo').hidden && $('#modalMov').hidden) $('#overlay').hidden = true;
    estado.detalleId = null;
  }

  // ---------- Modal de insumo ----------

  function abrirModalInsumo(insumo = null) {
    const f = $('#formInsumo');
    f.reset();
    $('#errorInsumo').hidden = true;
    $('#modalTitulo').textContent = insumo ? 'Editar insumo' : 'Cargar insumo';
    $('#btnEliminar').hidden = !insumo;
    f.registro_id.value = insumo ? insumo.id : '';
    if (insumo) {
      ['sku', 'nombre', 'categoria', 'unidad', 'stock_actual', 'stock_minimo', 'consumo_diario', 'lead_time_dias']
        .forEach((k) => { f[k].value = insumo[k]; });
    }
    $('#modalInsumo').hidden = false;
    $('#overlay').hidden = false;
    $('#f-nombre').focus();
  }

  function cerrarModalInsumo() {
    $('#modalInsumo').hidden = true;
    if (!$('#drawer').classList.contains('open') && $('#modalMov').hidden) $('#overlay').hidden = true;
  }

  async function guardarInsumo() {
    const f = $('#formInsumo');
    if (!f.reportValidity()) return;
    const body = Object.fromEntries(new FormData(f).entries());
    const id = body.registro_id;
    delete body.registro_id;
    try {
      if (id) {
        await API.actualizar(id, body);
        toast('Insumo actualizado.');
      } else {
        await API.crear(body);
        toast('Insumo cargado en el catálogo.');
      }
      cerrarModalInsumo();
      await recargar();
      if (estado.detalleId) await abrirDetalle(estado.detalleId);
    } catch (err) {
      $('#errorInsumo').textContent = err.message;
      $('#errorInsumo').hidden = false;
    }
  }

  // ---------- Modal de movimiento ----------

  function abrirModalMov(id, tipo) {
    const insumo = estado.insumos.find((i) => String(i.id) === String(id));
    const f = $('#formMov');
    f.reset();
    $('#errorMov').hidden = true;
    f.insumo_id.value = id;
    setTipoMov(tipo);
    $('#modalMovTitulo').textContent = `Movimiento · ${insumo ? insumo.nombre : ''}`;
    $('#m-motivo').value = tipo === 'ENTRADA' ? 'Ingreso por remito' : 'Consumo diario';
    $('#modalMov').hidden = false;
    $('#overlay').hidden = false;
    $('#m-cantidad').focus();
  }

  function setTipoMov(tipo) {
    estado.tipoMov = tipo;
    $$('#segTipo button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tipo === tipo)));
  }

  function cerrarModalMov() {
    $('#modalMov').hidden = true;
    if (!$('#drawer').classList.contains('open')) $('#overlay').hidden = true;
  }

  async function guardarMov() {
    const f = $('#formMov');
    if (!f.reportValidity()) return;
    const body = Object.fromEntries(new FormData(f).entries());
    body.tipo = estado.tipoMov;
    try {
      const { insumo } = await API.movimiento(body);
      toast(`${estado.tipoMov === 'ENTRADA' ? 'Entrada' : 'Salida'} registrada. Stock: ${num(insumo.stock_actual)} ${insumo.unidad}.`);
      cerrarModalMov();
      await recargar();
      if (estado.detalleId) await abrirDetalle(estado.detalleId);
    } catch (err) {
      $('#errorMov').textContent = err.message;
      $('#errorMov').hidden = false;
    }
  }

  // ---------- Eventos ----------

  function conectarEventos() {
    $('#buscar').addEventListener('input', (e) => {
      estado.filtros.q = e.target.value;
      renderTabla();
    });

    $('#filtroCategoria').addEventListener('change', (e) => {
      estado.filtros.categoria = e.target.value;
      renderTabla();
    });

    $('#filtroEstado').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      estado.filtros.estado = chip.dataset.estado;
      $$('#filtroEstado .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      renderTabla();
    });

    $('#btnLimpiar').addEventListener('click', () => {
      estado.filtros = { q: '', categoria: '', estado: '' };
      $('#buscar').value = '';
      $('#filtroCategoria').value = '';
      $$('#filtroEstado .chip').forEach((c, idx) => c.setAttribute('aria-pressed', String(idx === 0)));
      renderTabla();
    });

    $('#tabla thead').addEventListener('click', (e) => {
      const th = e.target.closest('th[data-sort]');
      if (!th) return;
      const campo = th.dataset.sort;
      estado.orden = {
        campo,
        dir: estado.orden.campo === campo && estado.orden.dir === 'asc' ? 'desc' : 'asc',
      };
      renderTabla();
    });

    $('#tbody').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mov]');
      if (btn) { abrirModalMov(btn.dataset.id, btn.dataset.mov); return; }
      const tr = e.target.closest('tr[data-id]');
      if (tr) abrirDetalle(tr.dataset.id);
    });

    $('#tbody').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const tr = e.target.closest('tr[data-id]');
      if (tr) abrirDetalle(tr.dataset.id);
    });

    $('#drawerBody').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mov]');
      if (btn) abrirModalMov(btn.dataset.id, btn.dataset.mov);
    });

    $('#btnNuevo').addEventListener('click', () => abrirModalInsumo());
    $('#btnCerrarDrawer').addEventListener('click', cerrarDrawer);
    $('#overlay').addEventListener('click', () => {
      if (!$('#modalInsumo').hidden) cerrarModalInsumo();
      else if (!$('#modalMov').hidden) cerrarModalMov();
      else cerrarDrawer();
    });

    $('#btnEditarDrawer').addEventListener('click', () => {
      const insumo = estado.insumos.find((i) => String(i.id) === String(estado.detalleId));
      if (insumo) abrirModalInsumo(insumo);
    });

    $('#btnGuardarInsumo').addEventListener('click', guardarInsumo);
    $('#btnCancelarInsumo').addEventListener('click', cerrarModalInsumo);
    $('#btnCerrarModal').addEventListener('click', cerrarModalInsumo);
    $('#formInsumo').addEventListener('submit', (e) => { e.preventDefault(); guardarInsumo(); });

    $('#btnEliminar').addEventListener('click', async () => {
      const id = $('#formInsumo').registro_id.value;
      if (!id || !confirm('Se elimina el insumo y todo su historial de movimientos. ¿Continuar?')) return;
      await API.eliminar(id);
      toast('Insumo eliminado del catálogo.');
      cerrarModalInsumo();
      cerrarDrawer();
      await recargar();
    });

    $('#segTipo').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-tipo]');
      if (b) setTipoMov(b.dataset.tipo);
    });
    $('#btnGuardarMov').addEventListener('click', guardarMov);
    $('#btnCancelarMov').addEventListener('click', cerrarModalMov);
    $('#btnCerrarMov').addEventListener('click', cerrarModalMov);
    $('#formMov').addEventListener('submit', (e) => { e.preventDefault(); guardarMov(); });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('#modalMov').hidden) cerrarModalMov();
      else if (!$('#modalInsumo').hidden) cerrarModalInsumo();
      else cerrarDrawer();
    });

    // Chart.js no repinta solo con el CSS: si cambia el tema y el drawer de
    // detalle está abierto, hay que reconstruir sus gráficos con los colores nuevos.
    // También hay que re-mezclar el datalist de categorías (real + configuradas)
    // y releer el intervalo de actualización automática por si cambió.
    window.addEventListener('config:actualizada', () => {
      if (estado.detalleId) abrirDetalle(estado.detalleId);
      renderCategorias();
      renderKpis();
      configurarAutoRefresh(window.Config.get().autoRefreshSegundos);
    });
  }

  function reloj() {
    const tick = () => {
      $('#clock').textContent = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };
    tick();
    setInterval(tick, 30000);
  }

  /** Permite ampliar el drawer de detalle arrastrando su borde izquierdo. */
  function conectarResizeDrawer() {
    const resizer = $('#drawerResizer');
    const drawer = $('#drawer');
    if (!resizer || !drawer) return;

    const ANCHO_MIN = 340;
    const anchoMax = () => Math.round(window.innerWidth * 0.92);
    let arrastrando = false;

    function aplicarAncho(clientX) {
      const nuevo = Math.min(anchoMax(), Math.max(ANCHO_MIN, window.innerWidth - clientX));
      drawer.style.width = `${nuevo}px`;
    }

    function iniciarArrastre() {
      arrastrando = true;
      document.body.classList.add('resizing-drawer');
    }

    function detenerArrastre() {
      if (!arrastrando) return;
      arrastrando = false;
      document.body.classList.remove('resizing-drawer');
    }

    resizer.addEventListener('mousedown', (e) => { iniciarArrastre(); e.preventDefault(); });
    resizer.addEventListener('touchstart', iniciarArrastre, { passive: true });

    document.addEventListener('mousemove', (e) => { if (arrastrando) aplicarAncho(e.clientX); });
    document.addEventListener('touchmove', (e) => {
      if (arrastrando && e.touches[0]) aplicarAncho(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('mouseup', detenerArrastre);
    document.addEventListener('touchend', detenerArrastre);

    // Accesibilidad: ← / → también amplían o reducen el panel con el resizer enfocado.
    resizer.addEventListener('keydown', (e) => {
      const actual = drawer.getBoundingClientRect().width;
      if (e.key === 'ArrowLeft') {
        drawer.style.width = `${Math.min(anchoMax(), actual + 24)}px`;
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        drawer.style.width = `${Math.max(ANCHO_MIN, actual - 24)}px`;
        e.preventDefault();
      }
    });
  }

  /** Refresca el inventario solo cada tantos segundos (0 = desactivado).
   *  Se salta el ciclo si hay un modal abierto, para no interrumpir una carga en curso. */
  let intervaloAutoRefresh = null;
  function configurarAutoRefresh(segundos) {
    if (intervaloAutoRefresh) {
      clearInterval(intervaloAutoRefresh);
      intervaloAutoRefresh = null;
    }
    if (segundos > 0) {
      intervaloAutoRefresh = setInterval(() => {
        if ($('#modalInsumo').hidden && $('#modalMov').hidden) recargar();
      }, segundos * 1000);
    }
  }

  // ---------- Arranque ----------

  (async function iniciar() {
    conectarEventos();
    conectarResizeDrawer();
    reloj();
    configurarAutoRefresh(window.Config ? window.Config.get().autoRefreshSegundos : 0);
    try {
      await recargar();
    } catch (err) {
      toast(`No se pudo cargar el inventario: ${err.message}`, 'err');
    }
  })();
})();