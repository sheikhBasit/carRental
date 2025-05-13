// utils/api.js
import axios from 'axios';
import { getAuthToken } from './auth';

const BASE_URL = 'https://car-rental-backend-black.vercel.app/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login on 401
    }
    return Promise.reject(error);
  }
);

const fetchWithRetry = async (url, retries = 1, delay = 500) => {
  try {
    return await axiosInstance.get(url);
  } catch (error) {
    if (retries <= 0 || (error.response && error.response.status === 401)) {
      throw error;
    }
    
    console.log(`Retrying ${url}, attempts left: ${retries-1}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, retries - 1, delay * 1.5);
  }
};

export const api = {
  getVehicles: (companyId) => fetchWithRetry(`/vehicles/company?company=${companyId}`),
  getDrivers: (companyId) => fetchWithRetry(`/drivers/company?company=${companyId}`),
  getBookings: (companyId) => fetchWithRetry(`/bookings/companyBookings?company=${companyId}`),
  addVehicle: (data) => axiosInstance.post('/vehicles', data),
  addDriver: (data) => axiosInstance.post('/drivers', data),
  deleteVehicle: (id, companyId) => axiosInstance.delete(`/vehicles/${id}`, { params: { company: companyId } }),
  deleteDriver: (id, companyId) => axiosInstance.delete(`/drivers/${id}`, { params: { company: companyId } })
};