export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CODE_FLOW: '/code-flow',
  ABOUT: '/about',
  AUTH_CALLBACK: '/auth/callback'
} as const

export const PROTECTED_ROUTES = [
  ROUTES.CODE_FLOW
]

export const PUBLIC_ONLY_ROUTES = [
  ROUTES.LOGIN
]
