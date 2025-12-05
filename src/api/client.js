import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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