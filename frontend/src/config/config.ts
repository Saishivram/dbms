export const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  HEALTH_CHECK_URL: process.env.REACT_APP_HEALTH_CHECK_URL || 'http://localhost:5000/health'
}; 