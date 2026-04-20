const isProd = !window.location.hostname.includes("localhost");
const basePath = isProd ? '/VitaCate-Telemed/' : '/';

export const CONFIG = {
  SUPABASE_URL: 'https://xyxgldkldowixuqnbopm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eGdsZGtsZG93aXh1cW5ib3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzgxNTcsImV4cCI6MjA5MjIxNDE1N30.TtuZDigxP_V_YVJq0I9_BGfexE_9IE5WPYheMr031Ds',
  APP_NAME: "VitaCare",
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  BASE_URL: `${window.location.origin}${basePath}`,
};
