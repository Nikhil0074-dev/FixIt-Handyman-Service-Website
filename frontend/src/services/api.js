import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/users/profile', data);

// Services
export const getServices = (params) => API.get('/services', { params });
export const getServiceById = (id) => API.get(`/services/${id}`);
export const createService = (data) => API.post('/services', data);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);
export const getProviders = () => API.get('/providers');

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings');
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const updateBookingStatus = (id, status) => API.patch(`/bookings/${id}/status`, { status });
export const getProviderBookings = () => API.get('/provider/bookings');

// Payments
export const createPayment = (data) => API.post('/payments', data);
export const getPaymentByBooking = (bookingId) => API.get(`/payments/booking/${bookingId}`);

// Reviews
export const createReview = (data) => API.post('/reviews', data);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationsRead = () => API.patch('/notifications/read');

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAllUsers = () => API.get('/admin/users');
export const toggleUserStatus = (id) => API.patch(`/admin/users/${id}/toggle`);
export const getAllBookings = (params) => API.get('/admin/bookings', { params });
export const getPendingProviders = () => API.get('/admin/providers/pending');
export const approveProvider = (id) => API.patch(`/admin/providers/${id}/approve`);

export default API;
