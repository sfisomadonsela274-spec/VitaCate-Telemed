const isProd = !window.location.hostname.includes('localhost');
const BASE_URL = isProd ? 'https://vitacare-api-production.up.railway.app' : 'http://localhost:8000';

export const CONFIG = {
  API_BASE: `${BASE_URL}/api`,
  WS_BASE: `${BASE_URL.replace('http', 'ws')}/ws`,
  APP_NAME: 'VitaCare',
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 5
};
