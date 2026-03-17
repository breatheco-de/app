import { useContext } from 'react';
import WhiteLabelContext from '../context/WhiteLabelContext';

/**
 * Custom hook to access white label features
 * @returns {Object} White label context with features and helper methods
 * @example
 * const { isWhiteLabelFeatureEnabled, features, isWhiteLabel } = useWhiteLabel();
 * // Usar claves antiguas (mapeadas automáticamente)
 * const canShowEvents = isWhiteLabelFeatureEnabled('allow_events');
 * // O usar nuevas rutas directamente
 * const canShowEvents = isWhiteLabelFeatureEnabled('events.enabled');
 */
const useWhiteLabel = () => {
  const context = useContext(WhiteLabelContext);

  if (context === undefined) {
    throw new Error('useWhiteLabel must be used within a WhiteLabelProvider');
  }

  return context;
};

export default useWhiteLabel;
