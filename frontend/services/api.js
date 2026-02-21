/**
 * API Service for College Entry System
 * Uses modern fetch with async/await
 * Configure via NEXT_PUBLIC_API_URL environment variable
 */

// Base URL from environment variable or default to localhost:5001
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Get authentication token from localStorage
 * @returns {string|null} Token or null
 */
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Set authentication token in localStorage
 * @param {string} token - JWT token
 */
const setToken = (token) => {
  if (typeof window !== 'undefined' && token) {
    localStorage.setItem('token', token);
  }
};

/**
 * Remove authentication token from localStorage
 */
const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network error', 0, null);
  }
};

// ============================================
// Authentication API Methods
// ============================================

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User data with token
 */
export const login = async (email, password) => {
  const data = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store token
  if (data.token) {
    setToken(data.token);
  }
  
  // Return user data without token (token stored separately)
  const { token, ...userData } = data;
  return userData;
};

/**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} User data with token
 */
export const register = async (userData) => {
  const data = await fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  // Store token
  if (data.token) {
    setToken(data.token);
  }
  
  const { token, ...userInfo } = data;
  return userInfo;
};

/**
 * Verify current token and get user data
 * @returns {Promise<object>} User data
 */
export const verifyToken = async () => {
  return await fetchApi('/auth/verify', {
    method: 'GET',
  });
};

/**
 * Logout user (clear local token)
 */
export const logout = () => {
  removeToken();
};

// ============================================
// Generic API Methods
// ============================================

/**
 * GET request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<object>} Response data
 */
export const get = async (endpoint) => {
  return await fetchApi(endpoint, {
    method: 'GET',
  });
};

/**
 * POST request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise<object>} Response data
 */
export const post = async (endpoint, data = {}) => {
  return await fetchApi(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise<object>} Response data
 */
export const put = async (endpoint, data = {}) => {
  return await fetchApi(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<object>} Response data
 */
export const del = async (endpoint) => {
  return await fetchApi(endpoint, {
    method: 'DELETE',
  });
};

// ============================================
// Specialized API Methods
// ============================================

/**
 * Get health status
 * @returns {Promise<object>} Health data
 */
export const getHealth = () => get('/health');

/**
 * Get all users (admin)
 * @returns {Promise<object>} List of users
 */
export const getUsers = () => get('/auth/users');

// ============================================
// Export default API object for convenience
// ============================================

export default {
  login,
  register,
  verifyToken,
  logout,
  get,
  post,
  put,
  delete: del,
  getHealth,
  getUsers,
  API_BASE_URL,
};

