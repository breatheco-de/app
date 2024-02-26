import axios from 'axios';
import { useState, useEffect } from 'react';
import { isWindow } from '../../utils';

const useGoogleMaps = (apiKey, libraries = 'places') => {
  const [gmapStatus, setGmapStatus] = useState({
    loaded: false,
    error: false,
  });

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://maps.google.com/maps/api/js?key=${apiKey}&libraries=${libraries}`;
      const headScript = document.getElementsByTagName('script')[0];
      headScript.parentNode.insertBefore(script, headScript);
      script.addEventListener('load', () => {
        setGmapStatus({
          loaded: true,
          error: false,
        });
      });
      script.addEventListener('error', () => {
        setGmapStatus({
          loaded: true,
          error: true,
        });
      });
    } else {
      setGmapStatus({
        loaded: true,
        error: false,
      });
    }
  }, [apiKey, libraries]);

  // geocode expects location: { lat: 123, lng: 321 }
  const geocode = (request) => {
    if (isWindow && gmapStatus.loaded) {
      const { google } = window;
      const geocoder = new google.maps.Geocoder();
      return new Promise((resolve, reject) => {
        geocoder.geocode(request, (result, geocodeStatus) => {
          if (geocodeStatus === google.maps.GeocoderStatus.OK) {
            resolve(result);
          } else {
            reject(result);
          }
        });
      });
    }
    return null;
  };

  const getNearestLocation = (key) => {
    if (gmapStatus.loaded && key) {
      // Get nearest user location
      return new Promise((resolve, reject) => {
        axios.post(`https://www.googleapis.com/geolocation/v1/geolocate?key=${key}`)
          .then((result) => resolve(result))
          .catch((err) => reject(err));
      });
    }
    return null;
  };

  const getUserLocation = async (setCoords = () => {}) => {
    const userLocation = localStorage.getItem('user-location');
    if (gmapStatus.loaded && apiKey && !userLocation) {
      const { data } = await getNearestLocation(apiKey);
      if (data) {
        setCoords({
          latitude: data.location.lat,
          longitude: data.location.lng,
        });
      }

      const results = await geocode({ location: data.location });
      const loc = {};

      results[0].address_components.forEach((comp) => {
        if (comp.types.includes('locality')) loc.city = comp.long_name;
        if (comp.types.includes('country')) {
          loc.country = comp.long_name;
          loc.countryShort = comp.short_name;
        }
      });
      localStorage.setItem('user-location', JSON.stringify(loc));

      return loc;
    } if (userLocation) {
      return JSON.parse(userLocation);
    }
    return null;
  };

  return { gmapStatus, geocode, getNearestLocation, getUserLocation };
};

export default useGoogleMaps;
