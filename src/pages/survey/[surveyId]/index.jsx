import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  Flex,
  Step,
  StepIcon,
  StepIndicator,
  StepSeparator,
  StepStatus,
  Stack,
  Stepper,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import useTranslation from 'next-translate/useTranslation';
import Question from '../../../common/components/Question';
import Text from '../../../common/components/Text';
import bc from '../../../common/services/breathecode';
import asPrivate from '../../../common/context/PrivateRouteWrapper';
import { log } from '../../../utils/logging';
import useCustomToast from '../../../common/hooks/useCustomToast';

function Survey() {
  const router = useRouter();
  const { t } = useTranslation('survey');
  const { surveyId } = router.query;
  const [questions, setQuestions] = useState([]);
  const [msg, setMsg] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentIndex, setcurrentIndex] = useState(0);
  const { createToast } = useCustomToast({ toastId: 'questions-toast' });

  const handleSurvey = async () => {
    try {
      const res = await bc.feedback().getSurvey(surveyId);

      console.log('res', res);

      if (!res || res.status >= 400) {
        setMsg({ text: 'expired', type: 'error' });
        return;
      }

      const { data } = res;
      log('suyver_data:', data);
      setQuestions(data.map((q) => ({ message: q.title, ...q })));
      setMsg(null);
    } catch (error) {
      log('error_survey:', error);
      setMsg({ text: error.message || error, type: 'error' });
      setQuestions([]);
    }
  };

  useEffect(() => {
    if (surveyId) {
      handleSurvey();
    }
  }, []);

  useEffect(() => {
    if (msg) {
      createToast({
        title: t(msg.text),
        status: msg.type,
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      setMsg(null);
    }
  }, [msg]);

  const confirmSend = async () => {
    const q = questions[currentIndex];
    if (q.score === null || !parseInt(q.score, 10) || q.score > 10 || q.score < 0) {
      setMsg({ type: 'error', text: 'valdiation' });
      setModalIsOpen(false);
      return;
    }

    try {
      await bc.feedback().sendVote({
        score: q.score,
        comment: q.comment,
        entity_id: q.id,
      });

      setModalIsOpen(false);
      if (questions.length - 1 > currentIndex) {
        setcurrentIndex(currentIndex + 1);
        setQuestions((qest) => qest.map((_q) => (_q.id === q.id ? q : _q)));
      } else {
        setMsg({ text: t('thanks'), type: 'success' });
      }
    } catch (error) {
      setMsg({ text: error.message || error, type: 'error' });
    }
  };

  const activeStepText = questions[currentIndex]?.label;

  return (
    <Container maxW="1280px">
      <Box>
        <Stack>
          <Stepper size="sm" index={currentIndex} gap="0">
            {questions.map(({ label }) => (
              <Step key={label} gap="0">
                <StepIndicator>
                  <StepStatus complete={<StepIcon />} />
                </StepIndicator>
                <StepSeparator _horizontal={{ ml: '0' }} />
              </Step>
            ))}
          </Stepper>
          <Text>
            {activeStepText}
          </Text>
        </Stack>
        {Array.isArray(questions) && questions.length > 0
          && (
            <Question
              key={currentIndex}
              question={questions[currentIndex]}
              onChange={(q) => {
                setQuestions((qest) => qest.map((_q) => (_q.id === q.id ? q : _q)));
                setMsg(null);
              }}
            />
          )}
        <Modal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('confirm')}</ModalHeader>
            <ModalCloseButton />
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={confirmSend}>
                {t('yes')}
              </Button>
              <Button variant="ghost" onClick={() => setModalIsOpen(false)}>
                {t('no')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {Array.isArray(questions) && questions.length > 0
          && (
            <Flex width="80%" justifyContent="space-between">
              {currentIndex > 0
                && (
                  <Button
                    colorScheme="gray"
                    justifyContent="flex-start"
                    onClick={() => setcurrentIndex(currentIndex - 1)}
                    width="49%"
                    leftIcon={<ArrowBackIcon />}
                  >
                    {t('previous')}
                  </Button>
                )}
              <Button
                width={currentIndex > 0 ? '49%' : '100%'}
                justifyContent="space-between"
                onClick={() => setModalIsOpen(true)}
                variant="outline"
                textAlign="left"
                position="relative"
                style={{ textAlign: 'left' }}
              >
                {currentIndex === questions.length - 1 ? t('send') : t('next')}
                <ArrowForwardIcon />
              </Button>
            </Flex>
          )}
      </Box>
    </Container>
  );
}

export default asPrivate(Survey);
