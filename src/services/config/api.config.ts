export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  EXECUTE_CODE: 'code/execute',
  TEST: '/test/profile',
  ALL_PATTERNS: '/design/patterns',
  ALL_PRINCIPLES: '/design/principles',
  // Add more endpoints as needed
} as const;

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};
