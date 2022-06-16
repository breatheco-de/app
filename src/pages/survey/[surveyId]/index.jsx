import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  // ModalBody,
  ModalCloseButton,
  Flex,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import useTranslation from 'next-translate/useTranslation';
import styles from '../../../../styles/Home.module.css';
import Steps from '../../../common/styledComponents/Steps';
import Question from '../../../common/components/Question';
import bc from '../../../common/services/breathecode';
import asPrivate from '../../../common/context/PrivateRouteWrapper';

const Survey = () => {
  const router = useRouter();
  const { t } = useTranslation('survey');
  const { surveyId } = router.query;
  const [questions, setQuestions] = useState(null);
  const [msg, setMsg] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [currentIndex, setcurrentIndex] = useState(0);

  useEffect(async () => {
    console.log(msg);

    if (surveyId) {
      try {
        const { data } = await bc.feedback().getSurvey(surveyId);
        console.log(data);
        setQuestions(data.map((q) => ({ message: q.title, ...q })));
        setMsg(null);
      } catch (error) {
        setMsg({ text: error.message || error, type: 'danger' });
        setQuestions([]);
      }
      // bc.feedback().getSurvey(surveyId)
      //   .then(({ data }) => {
      //     console.log(data);
      //     setQuestions(data.map((q) => ({ message: q.title, ...q })));
      //     setMsg(null);
      //   })
      //   .catch((error) => {
      //     setMsg({ text: error.message || error, type: 'danger' });
      //     setQuestions([]);
      //   });
    }
    // else if (parseInt(answer_id)) getQuestion(answer_id)
    //   .then(q => {
    //     setQuestions([({ message: q.title, ...q })])
    //     setMsg(null)
    //   })
    //   .catch(error => {
    //     setMsg({ text: error.message || error, type: "danger" })
    //     setQuestions([])
    //   })
    // }
  }, []);

  const confirmSend = () => {
    const q = questions[currentIndex];
    if (q.score === null || !parseInt(q.score, 10) || q.score > 10 || q.score < 0) {
      setMsg({ type: 'danger', text: 'Please choose one score between 1 and 10' });
    } else {
      bc.feedback().sendVote({
        score: q.score, comment: q.comment, entity_id: q.id,
      })
        .then(() => {
          setModalIsOpen(false);
          if (questions.length - 1 > currentIndex) {
            setcurrentIndex(currentIndex + 1);
            setQuestions((qest) => qest.map((_q) => (_q.id === q.id ? q : _q)));
          } else setMsg({ text: '😁 Thank you for your feedback!', type: 'success' });
        })
        .catch((error) => setMsg({ text: error.message || error, type: 'danger' }));
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div>
          <Steps
            currentIndex={currentIndex}
            steps={!Array.isArray(questions) ? [] : questions.map((q, i) => ({ label: i }))}
          />
        </div>
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
            {/* <ModalBody>
              {t('confirm')}
            </ModalBody> */}
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
                // colorScheme='blue'
                onClick={() => setModalIsOpen(true)}
                variant="outline"
                textAlign="left"
                position="relative"
                style={{ textAlign: 'left' }}
                // rightIcon={<ArrowForwardIcon />}
              >
                {currentIndex === questions.length - 1 ? t('send') : t('next')}
                <ArrowForwardIcon />
              </Button>
            </Flex>
          )}
      </main>
    </div>
  );
};

// export default Survey;
export default asPrivate(Survey);
