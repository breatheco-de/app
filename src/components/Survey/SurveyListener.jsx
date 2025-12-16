import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import usePusher from '../../hooks/usePusher';
import SurveyModal from './SurveyModal';

function SurveyListener({ userId }) {
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('[SurveyListener] Component mounted/updated, userId:', userId);
  }, [userId]);

  const handleSurveyReceived = useCallback((surveyData) => {
    console.log('[SurveyListener] Survey received:', surveyData);
    // Set the survey data and open the modal
    setCurrentSurvey(surveyData);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Clear survey after a delay to allow modal close animation
    setTimeout(() => {
      setCurrentSurvey(null);
    }, 300);
  };

  // Initialize Pusher connection when userId is available
  usePusher({
    userId,
    onSurveyReceived: handleSurveyReceived,
  });

  return (
    <SurveyModal
      isOpen={isModalOpen}
      survey={currentSurvey}
      onClose={handleCloseModal}
    />
  );
}

SurveyListener.propTypes = {
  userId: PropTypes.number,
};

SurveyListener.defaultProps = {
  userId: null,
};

export default SurveyListener;
