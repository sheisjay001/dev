export function createClient({ baseUrl, getToken, toast, onUnauthorized }) {
  async function request(path, { method = 'GET', headers = {}, body, signal } = {}) {
    const token = getToken?.()
    const h = { 'Content-Type': 'application/json', ...headers }
    if (token) h.Authorization = `Bearer ${token}`
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: h,
        body: body ? JSON.stringify(body) : undefined,
        signal
      })
      const data = await res.json().catch(() => ({}))
      
      if (res.status === 401) {
        onUnauthorized?.()
        throw new Error('Session expired')
      }

      if (!res.ok) {
        toast?.('' + (data.error || 'Request failed'), 'error')
        const err = new Error(data.error || `HTTP ${res.status}`)
        err.status = res.status
        throw err
      }
      return data
    } catch (e) {
      if (e.message === 'Session expired') throw e
      if (!e.status) toast?.('Network error', 'error')
      throw e
    }
  }
  return {
    get: (path, opts) => request(path, opts),
    post: (path, body) => request(path, { method: 'POST', body }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    del: (path) => request(path, { method: 'DELETE' })
  }
}
