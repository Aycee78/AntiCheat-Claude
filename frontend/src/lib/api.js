// One place for all backend calls. Usage: const data = await api('/ping')
const BASE = (import.meta.env.VITE_API_URL || 'http://backend.test').replace(/\/$/, '')

// Thrown for every failed request. `status` is 0 when the server could not be reached.
export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.errors = data?.errors ?? null // Laravel validation errors: { field: [messages] }
  }
}

export async function api(path, { body, headers, ...options } = {}) {
  let res
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Cannot reach the server. Please check your connection.', { status: 0 })
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // empty or non-JSON body
  }

  if (!res.ok) {
    const firstFieldError = data?.errors ? Object.values(data.errors).flat()[0] : null
    const message =
      res.status >= 500
        ? 'The server had a problem. Please try again.'
        : firstFieldError || data?.message || `Request failed (${res.status})`
    throw new ApiError(message, { status: res.status, data })
  }
  return data
}