import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import bc from '../services/breathecode';
import { WHITE_LABEL_ACADEMY, isWhiteLabelAcademy } from '../utils/variables';

const initialState = {
  isLoading: true,
  features: null,
  isWhiteLabel: false,
};

const WhiteLabelContext = createContext(initialState);

const CACHE_KEY = 'white-label-features-cache';
const CACHE_VERSION = '1.0'; // Increment this to invalidate cache

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const { features, isWhiteLabel } = action.payload;
      return {
        ...state,
        isLoading: false,
        features,
        isWhiteLabel,
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

  const isWhiteLabelFeatureEnabled = (featureKey) => {
    if (!state.isWhiteLabel || !state.features?.features) {
      return true;
    }
    return state.features.features[featureKey] !== false;
  };

  const getCachedFeatures = () => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.version === CACHE_VERSION && parsed.academy === WHITE_LABEL_ACADEMY) {
          return parsed.data;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const setCachedFeatures = (features) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        version: CACHE_VERSION,
        academy: WHITE_LABEL_ACADEMY,
        data: features,
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

    const cachedFeatures = getCachedFeatures();
    if (cachedFeatures) {
      dispatch({
        type: 'INIT',
        payload: {
          features: cachedFeatures,
          isWhiteLabel: true,
        },
      });
      return;
    }

    try {
      const { data } = await bc.admissions().getAcademy(WHITE_LABEL_ACADEMY);

      const features = data?.white_label_features || null;

      if (features) {
        setCachedFeatures(features);
      }

      dispatch({
        type: 'INIT',
        payload: {
          features,
          isWhiteLabel: features !== null,
        },
      });
    } catch (error) {
      console.error('Failed to fetch white label features:', error);
      dispatch({
        type: 'INIT',
        payload: {
          features: null,
          isWhiteLabel: false,
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
