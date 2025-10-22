import { useContext } from 'react';
import WhiteLabelContext from '../context/WhiteLabelContext';

/**
 * Custom hook to access white label features
 * @returns {Object} White label context with features and helper methods
 * @example
 * const { isWhiteLabelFeatureEnabled, features, isWhiteLabel } = useWhiteLabel();
 * const canShowEvents = isWhiteLabelFeatureEnabled('allow_events');
 */
const useWhiteLabel = () => {
  const context = useContext(WhiteLabelContext);

  if (context === undefined) {
    throw new Error('useWhiteLabel must be used within a WhiteLabelProvider');
  }

  return context;
};

export default useWhiteLabel;
