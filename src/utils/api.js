// API utility with network error handling, timeout, and retry functionality

const API_TIMEOUT = 30000; // 30 seconds

// Session expiry callback - will be set by AuthContext
let onSessionExpired = null;

export function setSessionExpiredCallback(callback) {
  onSessionExpired = callback;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408, true);
    }
    throw error;
  }
}

/**
 * Make API request with error handling
 */
export async function apiRequest(url, options = {}) {
  try {
    const response = await fetchWithTimeout(url, options);

    // Handle session expiry (401)
    if (response.status === 401) {
      // Trigger session expiry callback
      if (onSessionExpired) {
        onSessionExpired();
      }
      throw new ApiError('Session expired', 401);
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-OK responses
    if (!response.ok) {
      const message = data?.message || data || 'Request failed';
      throw new ApiError(message, response.status);
    }

    return data;
  } catch (error) {
    // Network errors (no connection, DNS failure, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Check your connection', 0, true);
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Unknown errors
    throw new ApiError(error.message || 'An unexpected error occurred', 500);
  }
}

/**
 * Make API request with retry logic
 */
export async function apiRequestWithRetry(url, options = {}, maxRetries = 1) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest(url, options);
    } catch (error) {
      lastError = error;

      // Don't retry on session expiry or client errors (4xx except 408)
      if (error.status === 401 || (error.status >= 400 && error.status < 500 && error.status !== 408)) {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError;
}

/**
 * Helper to get auth headers
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('inzu_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Helper to make authenticated API request
 */
export async function authenticatedRequest(url, options = {}) {
  return apiRequest(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders(),
    },
  });
}

/**
 * Helper to make authenticated API request with retry
 */
export async function authenticatedRequestWithRetry(url, options = {}, maxRetries = 1) {
  return apiRequestWithRetry(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders(),
    },
  }, maxRetries);
}
