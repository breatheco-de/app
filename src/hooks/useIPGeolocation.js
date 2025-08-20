import axios from 'axios';
import { useState, useEffect } from 'react';
import { isWindow } from '../utils';
import { IP_API_KEY } from '../utils/variables';

const useIPGeolocation = () => {
  const [status, setStatus] = useState({
    loaded: false,
    error: false,
  });

  const IP_API_URL = 'https://pro.ip-api.com/json';

  useEffect(() => {
    if (isWindow) {
      setStatus({
        loaded: true,
        error: false,
      });
    }
  }, []);

  const reverseGeocode = async (coordinates) => {
    if (isWindow && status.loaded) {
      try {
        const response = await axios.get(`${IP_API_URL}?lat=${coordinates.lat}&lon=${coordinates.lng}&key=${IP_API_KEY}`);
        return response.data;
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw error;
      }
    }
    return null;
  };

  const getCurrentLocation = async () => {
    if (status.loaded) {
      try {
        const response = await axios.get(`${IP_API_URL}?key=${IP_API_KEY}`);
        return response.data;
      } catch (error) {
        console.error('Geolocation error:', error);
        throw error;
      }
    }
    return null;
  };

  const getUserLocation = async (setCoords = () => {}) => {
    const userLocation = localStorage.getItem('user-location');
    localStorage.clear();

    if (status.loaded && !userLocation) {
      try {
        const data = await getCurrentLocation();
        console.log('data', data);
        const loc = {};

        if (data && data.status === 'success') {
          setCoords({
            latitude: data.lat,
            longitude: data.lon,
          });

          loc.coordinates = {
            latitude: data.lat,
            longitude: data.lon,
          };

          loc.city = data.city;
          loc.country = data.country;
          loc.countryShort = data.countryCode;
          loc.region = data.regionName;
          loc.regionShort = data.region;
          loc.timezone = data.timezone;
          loc.isp = data.isp;
          loc.ip = data.query;

          localStorage.setItem('user-location', JSON.stringify(loc));
          return loc;
        }
      } catch (error) {
        console.error('Error getting user location:', error);
        setStatus((prev) => ({ ...prev, error: true }));
        return null;
      }
    } else if (userLocation) {
      try {
        return JSON.parse(userLocation);
      } catch (error) {
        console.error('Error parsing stored location:', error);
        localStorage.removeItem('user-location');
        return null;
      }
    }

    return null;
  };

  const getLocationByIP = async (ip) => {
    if (status.loaded && ip) {
      try {
        const response = await axios.get(`${IP_API_URL}/${ip}?key=${IP_API_KEY}`);
        return response.data;
      } catch (error) {
        console.error('Error getting location by IP:', error);
        throw error;
      }
    }
    return null;
  };

  const getUserIP = async () => {
    if (status.loaded) {
      try {
        const response = await axios.get(`${IP_API_URL}?key=${IP_API_KEY}`);
        return response.data.query;
      } catch (error) {
        console.error('Error getting user IP:', error);
        throw error;
      }
    }
    return null;
  };

  return {
    status,
    reverseGeocode,
    getCurrentLocation,
    getUserLocation,
    getLocationByIP,
    getUserIP,
  };
};

export default useIPGeolocation;
