import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const OFFLINE_CACHE_PREFIX = 'innova_offline_cache:';
const CACHEABLE_GET_PATHS = ['/customers', '/inventory/products', '/service-orders'];
const CRITICAL_MUTATION_PATHS = ['/sales', '/cash', '/purchases', '/inventory/products', '/service-orders', '/quick-service-sales'];

export const httpClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('innova_access_token');
  const method = config.method?.toUpperCase() ?? 'GET';
  const url = config.url ?? '';

  if (!navigator.onLine && method !== 'GET' && CRITICAL_MUTATION_PATHS.some((path) => url.includes(path))) {
    return Promise.reject(new Error('Estas sin conexion. Esta operacion critica requiere internet.'));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase() ?? 'GET';
    const url = response.config.url ?? '';

    if (method === 'GET' && CACHEABLE_GET_PATHS.some((path) => url.includes(path))) {
      localStorage.setItem(`${OFFLINE_CACHE_PREFIX}${url}`, JSON.stringify(response.data));
    }

    return response;
  },
  (error) => {
    const method = error.config?.method?.toUpperCase() ?? 'GET';
    const url = error.config?.url ?? '';

    if (error.response?.status === 401) {
      localStorage.removeItem('innova_access_token');
    }

    if (!navigator.onLine && method === 'GET' && CACHEABLE_GET_PATHS.some((path) => url.includes(path))) {
      const cached = localStorage.getItem(`${OFFLINE_CACHE_PREFIX}${url}`);
      if (cached) {
        return Promise.resolve({ data: JSON.parse(cached), status: 200, statusText: 'Offline cache', headers: {}, config: error.config });
      }
    }

    const message =
      error.response?.data?.message ?? 'No se pudo completar la solicitud.';
    return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
  },
);
