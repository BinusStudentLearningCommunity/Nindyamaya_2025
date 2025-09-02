import axios from 'axios';

// Set the default base URL for all API requests
axios.defaults.baseURL = '/'; // Or your backend URL

// Create an interceptor to handle responses
axios.interceptors.response.use(
  // If the response is successful, just return it
  (response) => response,
  // If there's an error in the response
  (error) => {
    // Check if the error is a 401 (Unauthorized) or 403 (Forbidden)
    if (error.response && [401, 403].includes(error.response.status)) {
      // Clear the invalid token and user data from storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect the user to the login page
      // We check to make sure we're not already on the login page to avoid a loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Return the error to be handled by the component that made the request
    return Promise.reject(error);
  }
);

export default axios;