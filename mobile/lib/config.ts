/**
 * API base URL. Set EXPO_PUBLIC_API_URL in mobile/.env (the app never holds
 * third-party keys — only this public base URL).
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
