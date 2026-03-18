import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useAuth from './useAuth';
import bc from '../services/breathecode';
import useCustomToast from './useCustomToast';
import { isWindow } from '../utils';

export const useSurveyToken = () => {
  // 1. State Declarations
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Context Usage
  const router = useRouter();
  const { token, callback } = router.query;
  const { t } = useTranslation('survey');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { createToast } = useCustomToast({ toastId: 'survey-token' });

  // 3. Effects
  useEffect(() => {
    const loadSurvey = async () => {
      if (!token || authLoading) return;

      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await bc.feedback().getSurveyByToken(token);

        if (response.status >= 400) {
          throw new Error(response.data?.detail || 'Survey not found');
        }

        setSurvey(response.data);
      } catch (err) {
        console.error('Error loading survey:', err);
        const errorMessage = err.response?.data?.detail || err.message || t('error.survey-not-found');
        setError(errorMessage);
        createToast({
          position: 'top',
          status: 'error',
          title: errorMessage,
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [token, isAuthenticated, authLoading, t, createToast]);

  // 4. Functions
  const handleLoginSuccess = () => {
    // After login, the useEffect will trigger and load the survey
    // No need to do anything here
  };

  const handleSurveyComplete = () => {
    // Redirect based on callback or default to dashboard
    if (callback && typeof callback === 'string' && callback.length > 0 && isWindow) {
      try {
        const decodedCallback = decodeURIComponent(callback);
        // Validate that it's a relative URL or same origin
        if (decodedCallback.startsWith('/') || decodedCallback.startsWith(window.location.origin)) {
          router.push(decodedCallback);
        } else {
          router.push('/choose-program');
        }
      } catch (e) {
        console.error('Error decoding callback URL:', e);
        router.push('/choose-program');
      }
    } else {
      router.push('/choose-program');
    }
  };

  // 5. Variables and Computed Values
  const isLoading = authLoading || loading;

  // 6. Return object
  return {
    // States
    survey,
    loading: isLoading,
    error,

    // Context values
    isAuthenticated,
    authLoading,

    // Functions
    handleLoginSuccess,
    handleSurveyComplete,

    // Computed values
    t,
  };
};
