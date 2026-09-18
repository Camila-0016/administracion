/* Cliente REST — única puerta de entrada del frontend al backend. */
window.API = (() => {
  const BASE = '/api';

  async function req(path, options = {}) {
    const res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Falló la petición (${res.status})`);
    return data;
  }

  const qs = (params) => {
    const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    return s.toString() ? `?${s}` : '';
  };

  return {
    kpis:        ()            => req('/insumos/kpis'),
    categorias:  ()            => req('/insumos/categorias'),
    insumos:     (f = {})      => req(`/insumos${qs(f)}`),
    insumo:      (id)          => req(`/insumos/${id}`),
    crear:       (body)        => req('/insumos', { method: 'POST', body: JSON.stringify(body) }),
    actualizar:  (id, body)    => req(`/insumos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    eliminar:    (id)          => req(`/insumos/${id}`, { method: 'DELETE' }),
    historial:   (id)          => req(`/insumos/${id}/historial`),
    serie:       (id, d = 30)  => req(`/insumos/${id}/serie?dias=${d}`),
    movimiento:  (body)        => req('/movimientos', { method: 'POST', body: JSON.stringify(body) }),
  };
})();
