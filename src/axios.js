import axios from 'axios';

const axiosInstance = axios.create();
const activeRequests = []; // Array to store CancelToken instances

axiosInstance.interceptors.request.use((config) => {
  const cancelTokenSource = axios.CancelToken.source(); // store the CancelToken instance
  activeRequests.push(cancelTokenSource);

  return {
    ...config,
    cancelToken: cancelTokenSource.token,
  };
});

// Function to manually cancel the request in progress
export const cancelAllCurrentRequests = (message = 'All request was canceled') => {
  try {
    if (activeRequests && activeRequests.length > 0) {
      console.log(message);
      activeRequests.forEach((source) => {
        source.cancel(message);
      });

      activeRequests.length = 0; // Clean the CancelToken instances array
    }
  } catch (error) {
    console.error('All requests canceled:', error.message);
  }
};

export const cancelCurrentRequest = (message = 'Last request was canceled') => {
  try {
    if (activeRequests && activeRequests.length > 0) {
      console.log(message);
      activeRequests[activeRequests.length - 1].cancel(message);
      activeRequests.pop(); // Remove the last CancelToken instance from the array
    }
  } catch (error) {
    console.error('Last request canceled:', error.message);
  }
};

// Add a listener to cancel requests on page change or reload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cancelAllCurrentRequests();
  });
}

export default axiosInstance;
