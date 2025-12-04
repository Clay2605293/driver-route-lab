import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://routeplannerback.onrender.com';

const client = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  res => res,
  err => {
    const error = err.response
      ? { status: err.response.status, data: err.response.data, message: err.message }
      : { message: err.message };
    return Promise.reject(error);
  }
);

export default client;