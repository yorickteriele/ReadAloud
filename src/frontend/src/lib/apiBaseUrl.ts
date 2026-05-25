function getDefaultApiBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:5101'
  }

  const { protocol, hostname, port } = window.location

  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port !== '5101') {
    return `${protocol}//${hostname}:5101`
  }

  return `${protocol}//${hostname}${port ? `:${port}` : ''}`
}

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL?.trim() || getDefaultApiBaseUrl()).replace(/\/$/, '')
