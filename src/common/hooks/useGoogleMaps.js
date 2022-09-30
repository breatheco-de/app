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
  const geocode = (req) => {
    if (isWindow && gmapStatus.loaded) {
      const { google } = window;
      const geocoder = new google.maps.Geocoder();
      return new Promise((resolve, reject) => {
        geocoder.geocode(req, (result, geocodeStatus) => {
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

  return { gmapStatus, geocode, getNearestLocation };
};

export default useGoogleMaps;
