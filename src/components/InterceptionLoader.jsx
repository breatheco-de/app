import React, { useState, useEffect } from 'react';
import { Progress } from '@chakra-ui/react';
import axiosInstance from '../axios';
import useAuth from '../hooks/useAuth';

function InterceptionLoader() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => logout();
  useEffect(() => {
    axiosInstance.interceptors.request.use((req) => {
      setLoading(true);
      return req;
    }, (error) => {
      Promise.reject(error);
      const statusError = error.response.status;
      console.error('Error_request:', error);
      setLoading(false);
      if (statusError === 401) {
        handleLogout();
      }
    });
    axiosInstance.interceptors.response.use((res) => {
      setLoading(false);
      return res;
    }, (error) => {
      const statusError = error.response?.status;
      Promise.reject(error);
      setLoading(false);
      if (statusError === 401) {
        handleLogout();
      }
    });
    return () => {
      setLoading(false);
    };
  }, []);
  return loading && (
    <Progress
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
      }}
      color="blue.default"
      size="xs"
      isIndeterminate
    />
  );
}

export default InterceptionLoader;
