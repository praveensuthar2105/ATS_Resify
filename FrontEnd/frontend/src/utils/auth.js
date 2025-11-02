// Auth utility functions

/**
 * Get the stored authentication token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get the stored user information
 */
export const getUserInfo = () => {
  const name = localStorage.getItem('userName');
  const email = localStorage.getItem('userEmail');
  const role = localStorage.getItem('userRole');
  
  if (name && email) {
    return { name, email, role: role || 'USER' };
  }
  return null;
};

/**
 * Check if user is logged in
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  const role = localStorage.getItem('userRole');
  return role === 'ADMIN';
};

/**
 * Decode JWT token to extract claims
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get role from JWT token
 */
export const getRoleFromToken = () => {
  const token = getAuthToken();
  if (token) {
    const decoded = decodeToken(token);
    return decoded?.role || 'USER';
  }
  return null;
};

/**
 * Get authorization headers for API calls
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Clear authentication data (for logout)
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
};
