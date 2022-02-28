import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import { Progress } from '@chakra-ui/react';
import axiosInstance from '../../axios';

const Loading = () => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    axiosInstance.interceptors.request.use((req) => {
      setLoading(true);
      return req;
    }, (error) => Promise.reject(error));
    axiosInstance.interceptors.response.use((res) => {
      setLoading(false);
      return res;
    }, (error) => Promise.reject(error));
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
};

export default Loading;
