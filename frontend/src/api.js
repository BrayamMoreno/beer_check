const json = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error ${res.status} al consultar ${url}`)
  return res.json()
}

export const api = {
  config: () => json('/api/config/'),
  tipos: () => json('/api/tipos/'),
  licores: (tipoId) => json(`/api/licores/${tipoId ? `?tipo=${tipoId}` : ''}`),
  ph: (licorId) => json(`/api/licores/${licorId}/ph/`),
}
