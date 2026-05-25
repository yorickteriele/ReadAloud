import { BooksApiClient } from './generated/api-client'
import { API_BASE_URL } from '../../../lib/apiBaseUrl'

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

    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
    if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
      window.location.href = '/'
    }
  }

  return response
}

export const booksApiClient = new BooksApiClient(API_BASE_URL, {
  fetch: authenticatedFetch,
})
