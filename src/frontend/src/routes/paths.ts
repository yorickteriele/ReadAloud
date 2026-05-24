export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  library: '/library',
  upload: '/upload',
  book: (id: number | string) => `/book/${id}`,
} as const
