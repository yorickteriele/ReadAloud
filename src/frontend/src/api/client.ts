import { ReadAloudApiClient } from './generated/api-client'
import { API_BASE_URL } from '../lib/apiBaseUrl'

const authenticatedFetch: typeof fetch = async (input, init) => {
  const token = localStorage.getItem('token')
  const headers = new Headers(init?.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return response
}

export const readAloudApiClient = new ReadAloudApiClient(API_BASE_URL, {
  fetch: authenticatedFetch,
})
