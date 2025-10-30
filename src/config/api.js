const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    GET_BY_ID: (id) => `/api/users/${id}`,
    UPDATE: (id) => `/api/users/${id}`
  },
  DEPARTMENTS: { LIST: '/api/departments' }
};

export const buildUrl = (endpoint, params = {}) => {
  const url = new URL(API_BASE_URL + endpoint);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.append(key, value);
  });
  return url.toString();
};

export default API_BASE_URL;