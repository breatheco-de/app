import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import bc from '../services/breathecode';
import { WHITE_LABEL_ACADEMY, isWhiteLabelAcademy } from '../utils/variables';

const initialState = {
  isLoading: true,
  features: null,
  isWhiteLabel: false,
  whiteLabelParams: null,
};

const WhiteLabelContext = createContext(initialState);

const CACHE_KEY = 'white-label-features-cache';
const CACHE_VERSION = '1.2';

const featureFlagMapping = {
  allow_referral_program: 'marketing.referral_program.enabled',
  allow_events: 'events.enabled',
  allow_mentoring: 'mentorship.enabled',
  allow_feedback_widget: 'feedback.widget.enabled',
  allow_community_widget: 'community.widget.enabled',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const { features, isWhiteLabel, whiteLabelParams } = action.payload;
      return {
        ...state,
        isLoading: false,
        features,
        isWhiteLabel,
        whiteLabelParams,
      };
    }
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    default:
      return state;
  }
};

function WhiteLabelProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Get a nested value from an object using a dot-notation path
   * @param {Object} obj - The object to search
   * @param {string} path - The dot-notation path (e.g., 'events.enabled')
   * @returns {any} The value at the path, or undefined if not found
   */
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const isWhiteLabelFeatureEnabled = (featureKey) => {
    if (!state.isWhiteLabel || !state.features) {
      return true;
    }

    // Mapear la clave antigua a la nueva ruta si existe
    const mappedKey = featureFlagMapping[featureKey] || featureKey;

    if (mappedKey.includes('.')) {
      const value = getNestedValue(state.features, mappedKey);
      return value !== false;
    }

    if (state.features.features) {
      return state.features.features[featureKey] !== false;
    }

    return true;
  };

  const parseWhiteLabelParams = (params) => {
    if (!params) return null;
    if (typeof params === 'string') {
      try {
        return JSON.parse(params);
      } catch (e) {
        console.error('Error parsing white_label_params:', e);
        return null;
      }
    }
    return params;
  };

  const getCachedFeatures = () => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.version === CACHE_VERSION && parsed.academy === WHITE_LABEL_ACADEMY) {
          return {
            features: parsed.data,
            whiteLabelParams: parsed.whiteLabelParams || null,
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const setCachedFeatures = (features, whiteLabelParams) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        version: CACHE_VERSION,
        academy: WHITE_LABEL_ACADEMY,
        data: features,
        whiteLabelParams,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to cache white label features:', error);
    }
  };

  const fetchWhiteLabelFeatures = async () => {
    if (!isWhiteLabelAcademy || !WHITE_LABEL_ACADEMY) {
      dispatch({
        type: 'INIT',
        payload: {
          features: null,
          isWhiteLabel: false,
        },
      });
      return;
    }

    const cachedData = getCachedFeatures();
    if (cachedData) {
      dispatch({
        type: 'INIT',
        payload: {
          features: cachedData.features,
          isWhiteLabel: true,
          whiteLabelParams: cachedData.whiteLabelParams,
        },
      });
      return;
    }

    try {
      const { data } = await bc.admissions().getAcademy(WHITE_LABEL_ACADEMY);

      const features = data?.academy_features || null;
      const whiteLabelParams = parseWhiteLabelParams(data?.white_label_params);

      if (features) {
        setCachedFeatures(features, whiteLabelParams);
      }

      dispatch({
        type: 'INIT',
        payload: {
          features,
          isWhiteLabel: features !== null,
          whiteLabelParams,
        },
      });
    } catch (error) {
      console.error('Failed to fetch white label features:', error);
      dispatch({
        type: 'INIT',
        payload: {
          features: null,
          isWhiteLabel: false,
          whiteLabelParams: null,
        },
      });
    }
  };

  useEffect(() => {
    fetchWhiteLabelFeatures();
  }, []);

  const value = useMemo(() => ({
    ...state,
    isWhiteLabelFeatureEnabled,
    showMarketingNavigation: state.features?.navigation?.show_marketing_navigation !== false,
    customLinks: state.features?.navigation?.custom_links || [],
    whiteLabelParams: state.whiteLabelParams,
  }), [state]);

  return (
    <WhiteLabelContext.Provider value={value}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

WhiteLabelProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { WhiteLabelProvider };
export default WhiteLabelContext;
