import axios from 'axios';

// API base URL pointing to the FastAPI backend
const API_BASE_URL = 'http://127.0.0.1:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to headers automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartevent_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated sessions (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('smartevent_token');
      localStorage.removeItem('smartevent_user');
      window.dispatchEvent(new Event('auth_logout'));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getActivitySummary: () => api.get('/auth/profile/summary'),
};

export const eventsApi = {
  getEvents: (params) => api.get('/events', { params }),
  getEventDetail: (id) => api.get(`/events/${id}`),
  getCategories: () => api.get('/events/meta/categories'),
  getCities: () => api.get('/events/meta/cities'),
  getLiveSeats: (id) => api.get(`/events/${id}/live-seats`),
};

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  getWishlistIds: () => api.get('/wishlist/ids'),
  toggleWishlist: (eventId) => api.post(`/wishlist/${eventId}`),
  removeFromWishlist: (eventId) => api.delete(`/wishlist/${eventId}`),
};

export const updatesApi = {
  getEventUpdates: (eventId) => api.get(`/events/${eventId}/updates`),
  postEventUpdate: (eventId, message) => api.post(`/events/${eventId}/updates`, { message }),
};

export const recommendationsApi = {
  getRecommendations: (limit = 8) => api.get('/recommendations', { params: { limit } }),
  getTrending: (limit = 8) => api.get('/recommendations/trending', { params: { limit } }),
  recordView: (eventId) => api.post(`/recommendations/events/${eventId}/view`),
};

export const chatbotApi = {
  sendMessage: (payload) => api.post('/chatbot/message', payload),
};

export const bookingsApi = {
  createBooking: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings'),
  getBookingDetail: (id) => api.get(`/bookings/${id}`),
  getBooking: (id) => api.get(`/bookings/${id}`),
};

export const paymentsApi = {
  processPayment: (data) => api.post('/payments/process', data),
  getBookingPayment: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};

export const couponsApi = {
  validateCoupon: (data) => api.post('/coupons/validate', data),
  getActiveCoupons: () => api.get('/coupons/active'),
};

export const reviewsApi = {
  getEventReviews: (eventId) => api.get(`/events/${eventId}/reviews`),
  submitReview: (eventId, data) => api.post(`/events/${eventId}/reviews`, data),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

export const ticketsApi = {
  getUserTickets: () => api.get('/tickets'),
  verifyTicket: (code) => api.get(`/tickets/verify/${code}`),
  checkInTicket: (code) => api.post(`/tickets/verify/${code}/check-in`),
};

export const notificationsApi = {
  getUserNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};

// --- Organizer API endpoints ---
export const organizerApi = {
  getEvents: () => api.get('/organizer/events'),
  getEventDetail: (id) => api.get(`/organizer/events/${id}`),
  createEvent: (data) => api.post('/organizer/events', data),
  updateEvent: (id, data) => api.put(`/organizer/events/${id}`, data),
  cancelEvent: (id) => api.patch(`/organizer/events/${id}/cancel`),
  getEventBookings: (id) => api.get(`/organizer/events/${id}/bookings`),
  getAnalytics: () => api.get('/organizer/analytics'),
};

// --- Admin API endpoints ---
export const adminApi = {
  getOverview: () => api.get('/admin/overview'),
  getSalesTrends: () => api.get('/admin/analytics/sales-trends'),
  getPopularEvents: () => api.get('/admin/analytics/popular-events'),
  getAllUsers: () => api.get('/admin/users'),
  getAllEvents: () => api.get('/admin/events'),
  getAllBookings: () => api.get('/admin/bookings'),
};

export default api;

