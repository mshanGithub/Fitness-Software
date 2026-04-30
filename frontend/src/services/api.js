import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required');
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('twc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const storedUser = localStorage.getItem('twc_user');
      const currentPath = window.location.pathname;
      let redirectPath = currentPath.startsWith('/admin') ? '/admin-twc-login' : '/login';

      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        if (parsedUser?.role === 'admin') {
          redirectPath = '/admin-twc-login';
        }
      } catch {
        // Ignore storage parsing issues and fall back to path-based redirect.
      }

      localStorage.removeItem('twc_token');
      localStorage.removeItem('twc_user');
      window.location.href = redirectPath;
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  getAssignedPlans: () => api.get('/user/assigned-plans'),
  updateProfile: (data) => api.put('/user/profile', data),
  getStats: () => api.get('/user/stats'),
  getWorkoutReport: () => api.get('/user/workout-report'),
  getLiveMeet: () => api.get('/user/live-meet'),
  getSessionBookingAvailability: (date) => api.get('/user/session-booking/availability', { params: { date } }),
  bookSessionSlot: (data) => api.post('/user/session-booking/book', data),
  getMySessionBookings: () => api.get('/user/session-booking/my'),
  rescheduleSessionBooking: (bookingId, data) => api.put(`/user/session-booking/reschedule/${bookingId}`, data),
  cancelSessionBooking: (bookingId) => api.delete(`/user/session-booking/${bookingId}`),
  logWorkout: (data) => api.post('/user/log-workout', data),
};

export const videoAPI = {
  getAll: () => api.get('/videos'),
};

export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: () => api.get('/admin/users'),
  getLiveMeet: () => api.get('/admin/live-meet'),
  updateLiveMeet: (data) => api.put('/admin/live-meet', data),
  getSessionBookingSettings: () => api.get('/admin/session-booking-settings'),
  updateSessionBookingSettings: (data) => api.put('/admin/session-booking-settings', data),
  getAllSessionBookings: () => api.get('/admin/session-bookings'),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  updateUserAssignments: (userId, data) => api.put(`/admin/users/${userId}/assignments`, data),

  getWorkoutPlans: () => api.get('/admin/workout-plans'),
  createWorkoutPlan: (data) => api.post('/admin/workout-plans', data),
  updateWorkoutPlan: (planId, data) => api.put(`/admin/workout-plans/${planId}`, data),
  deleteWorkoutPlan: (planId) => api.delete(`/admin/workout-plans/${planId}`),

  getFoodPlans: () => api.get('/admin/food-plans'),

  getVideoCategories: () => api.get('/admin/video-categories'),
  getVideos: () => api.get('/admin/videos'),
  createVideo: (data) => api.post('/admin/videos', data),
  updateVideo: (videoId, data) => api.put(`/admin/videos/${videoId}`, data),
  deleteVideo: (videoId) => api.delete(`/admin/videos/${videoId}`),
};

export default api;
