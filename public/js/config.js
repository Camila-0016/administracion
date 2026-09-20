/* ==========================================================
   Configuración de la aplicación — persistida en LocalStorage.
   No depende del backend: son preferencias de esta terminal/
   navegador, aplicadas de inmediato a la cabecera, al modal de
   movimientos y a las gráficas de detalle del Tablero General.
   ========================================================== */
window.Config = (() => {
  'use strict';

  const KEY = 'miningtech.config.v1';

  const DEFAULTS = {
    faenaNombre: 'Faena Salar',
    faenaAltitud: 4000,
    diasHistorial: 30,
    tema: 'dark',
    responsables: [
      'M. Quispe (Pañol)',
      'J. Cardozo (Logística)',
      'S. Vilte (Mantenimiento)',
      'R. Farfán (Planta)',
      'L. Choque (Turno noche)',
    ],
  };

  function leer() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch (_) { /* almacenamiento bloqueado: se trabaja con los valores por defecto */ }
    return { ...DEFAULTS };
  }

  function persistir(cfg) {
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (_) { /* sólo en memoria */ }
  }

  function aplicarATopbar(cfg) {
    const n = document.getElementById('faenaNombre');
    const a = document.getElementById('faenaAltitud');
    if (n) n.textContent = cfg.faenaNombre;
    if (a) a.textContent = `${Number(cfg.faenaAltitud).toLocaleString('es-AR')} msnm`;
    document.title = `${cfg.faenaNombre} · Inventario Inteligente en Altura`;
  }

  function aplicarADatalist(cfg) {
    const dl = document.getElementById('responsablesList');
    if (dl) dl.innerHTML = cfg.responsables.map((r) => `<option>${r}</option>`).join('');
  }

  function aplicarTema(cfg) {
    document.documentElement.setAttribute('data-theme', cfg.tema);
    const btn = document.getElementById('btnTema');
    if (btn) btn.setAttribute('aria-label', cfg.tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }

  function alternarTema() {
    const actual = leer();
    return set({ tema: actual.tema === 'dark' ? 'light' : 'dark' });
  }

  function set(parcial) {
    const nuevo = { ...leer(), ...parcial };
    persistir(nuevo);
    aplicarATopbar(nuevo);
    aplicarADatalist(nuevo);
    aplicarTema(nuevo);
    window.dispatchEvent(new CustomEvent('config:actualizada', { detail: nuevo }));
    return nuevo;
  }

  function agregarResponsable(nombre) {
    const limpio = String(nombre || '').trim();
    if (!limpio) return leer();
    const actual = leer();
    if (actual.responsables.some((r) => r.toLowerCase() === limpio.toLowerCase())) return actual;
    return set({ responsables: [...actual.responsables, limpio] });
  }

  function quitarResponsable(nombre) {
    const actual = leer();
    return set({ responsables: actual.responsables.filter((r) => r !== nombre) });
  }

  // El script se carga al final del documento: los nodos de la cabecera
  // y el datalist ya existen en el DOM, así que se aplica de inmediato.
  const inicial = leer();
  aplicarATopbar(inicial);
  aplicarADatalist(inicial);
  aplicarTema(inicial);

  const btnTema = document.getElementById('btnTema');
  if (btnTema) btnTema.addEventListener('click', alternarTema);

  return {
    get: leer,
    set,
    diasHistorial: () => leer().diasHistorial,
    agregarResponsable,
    quitarResponsable,
    alternarTema,
  };
})();