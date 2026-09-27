window.Config = (() => {
  'use strict';

  const KEY = 'miningtech.config.v1';

  const DEFAULTS = {
    faenaNombre: 'Faena Salar',
    faenaAltitud: 4000,
    diasHistorial: 30,
    tema: 'dark',
    camionesLogistica: 4,
    autoRefreshSegundos: 0,
    responsables: [
      'M. Quispe (Pañol)',
      'J. Cardozo (Logística)',
      'S. Vilte (Mantenimiento)',
      'R. Farfán (Planta)',
      'L. Choque (Turno noche)',
    ],
    motivos: [
      'Consumo diario',
      'Mantenimiento preventivo',
      'Reemplazo correctivo',
      'Ingreso por remito',
      'Devolución a pañol',
      'Ajuste por inventario físico',
    ],
    categorias: [
      'Reactivos químicos',
      'Laboratorio de control',
      'Equipos de proceso',
      'Filtros y elementos',
      'Repuestos de cintas',
      'Combustibles',
      'Lubricantes',
      'Salud ocupacional',
      'Mantenimiento eléctrico',
      'Repuestos mecánicos',
      'Ferretería industrial',
    ],
  };

  // Las tres listas "frecuentes" (responsables, motivos, categorías) siguen
  // exactamente el mismo patrón: leer, agregar sin duplicar y quitar.
  const LISTAS = {
    responsables: 'responsablesList',
    motivos: 'motivosList',
    categorias: 'categoriasList',
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

  function aplicarADatalists(cfg) {
    Object.entries(LISTAS).forEach(([clave, idDatalist]) => {
      const dl = document.getElementById(idDatalist);
      if (dl) dl.innerHTML = cfg[clave].map((v) => `<option>${v}</option>`).join('');
    });
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
    aplicarADatalists(nuevo);
    aplicarTema(nuevo);
    window.dispatchEvent(new CustomEvent('config:actualizada', { detail: nuevo }));
    return nuevo;
  }

  /** Agrega un valor a una de las tres listas frecuentes, sin duplicar (case-insensitive). */
  function agregarALista(clave, valor) {
    const limpio = String(valor || '').trim();
    if (!limpio) return leer();
    const actual = leer();
    if (actual[clave].some((v) => v.toLowerCase() === limpio.toLowerCase())) return actual;
    return set({ [clave]: [...actual[clave], limpio] });
  }

  /** Quita un valor de una de las tres listas frecuentes. */
  function quitarDeLista(clave, valor) {
    const actual = leer();
    return set({ [clave]: actual[clave].filter((v) => v !== valor) });
  }

  // El script se carga al final del documento: los nodos de la cabecera
  // y los datalist ya existen en el DOM, así que se aplica de inmediato.
  const inicial = leer();
  aplicarATopbar(inicial);
  aplicarADatalists(inicial);
  aplicarTema(inicial);

  const btnTema = document.getElementById('btnTema');
  if (btnTema) btnTema.addEventListener('click', alternarTema);

  return {
    get: leer,
    set,
    diasHistorial: () => leer().diasHistorial,
    camionesLogistica: () => leer().camionesLogistica,

    agregarResponsable: (v) => agregarALista('responsables', v),
    quitarResponsable: (v) => quitarDeLista('responsables', v),
    agregarMotivo: (v) => agregarALista('motivos', v),
    quitarMotivo: (v) => quitarDeLista('motivos', v),
    agregarCategoria: (v) => agregarALista('categorias', v),
    quitarCategoria: (v) => quitarDeLista('categorias', v),

    alternarTema,
  };
})();