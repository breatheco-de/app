import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../../hooks/useStyle';
import Heading from '../Heading';
import LikertScaleQuestion from './LikertScaleQuestion';
import OpenQuestion from './OpenQuestion';
import bc from '../../services/breathecode';
import useCustomToast from '../../hooks/useCustomToast';
import useAuth from '../../hooks/useAuth';

function SurveyModal({ isOpen, survey, onClose }) {
  const { t } = useTranslation('survey');
  const { modal, borderColor2, fontColor2 } = useStyle();
  const { createToast } = useCustomToast({ toastId: 'survey-submit' });
  const { cohorts } = useAuth();
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Get cohort name from slug
  const cohortName = useMemo(() => {
    if (!survey?.trigger_context?.cohort_slug || !cohorts) {
      return null;
    }
    const cohort = cohorts.find((c) => c.slug === survey.trigger_context.cohort_slug);
    return cohort?.name || null;
  }, [survey?.trigger_context?.cohort_slug, cohorts]);

  // Reset state when survey changes
  useEffect(() => {
    if (survey) {
      setAnswers({});
      setErrors({});
      setSubmitting(false);
    }
  }, [survey]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error for this question when user starts answering
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateAnswers = () => {
    const newErrors = {};
    let isValid = true;

    if (!survey?.questions) return false;

    survey.questions.forEach((question) => {
      if (question.required) {
        const answer = answers[question.id];
        if (answer === undefined || answer === null || answer === '') {
          newErrors[question.id] = t('validation.required');
          isValid = false;
        } else if (question.type === 'likert_scale') {
          const scale = question.config?.scale || 5;
          if (typeof answer !== 'number' || answer < 1 || answer > scale) {
            newErrors[question.id] = t('validation.likert-invalid', { scale });
            isValid = false;
          }
        } else if (question.type === 'open_question') {
          const maxLength = question.config?.max_length;
          if (maxLength && answer.length > maxLength) {
            newErrors[question.id] = t('validation.max-length', { max: maxLength });
            isValid = false;
          }
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      createToast({
        position: 'top',
        status: 'error',
        title: t('validation.please-fix-errors'),
        duration: 3000,
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await bc.feedback().submitSurveyAnswer(survey.survey_response_id, answers);

      if (response.status === 200 || response.status === 201) {
        createToast({
          position: 'top',
          status: 'success',
          title: t('success.thank-you'),
          duration: 3000,
        });
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || t('error.submit-failed');
      const errorSlug = error.response?.data?.slug;

      // Handle specific error cases
      if (errorSlug === 'survey-already-answered') {
        createToast({
          position: 'top',
          status: 'info',
          title: t('error.already-answered'),
          duration: 3000,
        });
        onClose();
      } else if (errorSlug === 'missing-required-answer') {
        createToast({
          position: 'top',
          status: 'error',
          title: errorMessage || t('validation.required'),
          duration: 3000,
        });
      } else {
        createToast({
          position: 'top',
          status: 'error',
          title: errorMessage,
          duration: 3000,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (!survey) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered closeOnOverlayClick={!submitting} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent background={modal.background2} maxWidth="600px" maxHeight="90vh" display="flex" flexDirection="column">
        <ModalHeader
          borderBottom={1}
          borderStyle="solid"
          borderColor={borderColor2}
          paddingBottom="16px"
          flexShrink={0}
        >
          <Heading size="md" color={fontColor2}>
            {t('title')}
          </Heading>
        </ModalHeader>
        {!submitting && <ModalCloseButton />}
        <ModalBody padding="24px" overflowY="auto" flex="1">
          {survey.trigger_context && survey.trigger_context.trigger_type && (
            <Box
              marginBottom="20px"
              padding="12px"
              borderRadius="8px"
              backgroundColor="blue.50"
              border="1px solid"
              borderColor="blue.200"
            >
              <Text size="14px" color="blue.700">
                {t('context.completion-message', {
                  asset: cohortName || survey.trigger_context.asset_slug || survey.trigger_context.cohort_slug || t('context.asset'),
                })}
              </Text>
            </Box>
          )}

          <Flex direction="column" gridGap="24px">
            {survey.questions?.map((question) => {
              let QuestionComponent = null;
              if (question.type === 'likert_scale') {
                QuestionComponent = LikertScaleQuestion;
              } else if (question.type === 'open_question') {
                QuestionComponent = OpenQuestion;
              }

              if (!QuestionComponent) {
                return null;
              }

              return (
                <QuestionComponent
                  key={question.id}
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  error={errors[question.id]}
                />
              );
            })}
          </Flex>

          <Flex marginTop="32px" justifyContent="flex-end" gridGap="12px" flexShrink={0}>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              {t('actions.close')}
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={submitting}
              isLoading={submitting}
              loadingText={t('actions.submitting')}
            >
              {t('actions.submit')}
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

SurveyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  survey: PropTypes.shape({
    survey_response_id: PropTypes.number.isRequired,
    questions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        required: PropTypes.bool,
        config: PropTypes.shape({
          scale: PropTypes.number,
          labels: PropTypes.objectOf(PropTypes.string),
          max_length: PropTypes.number,
        }),
      }),
    ).isRequired,
    trigger_context: PropTypes.shape({
      trigger_type: PropTypes.string,
      trigger_action: PropTypes.string,
      asset_slug: PropTypes.string,
      cohort_slug: PropTypes.string,
      completion_rate: PropTypes.number,
      completed_at: PropTypes.string,
    }),
  }),
  onClose: PropTypes.func.isRequired,
};

SurveyModal.defaultProps = {
  survey: null,
};

export default SurveyModal;
