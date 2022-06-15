import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import styles from '../../../../styles/Home.module.css';
import Steps from '../../../common/styledComponents/Steps';
import Question from '../../../common/components/Question';
import Icon from '../../../common/components/Icon';
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
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalFooter>
              <Button colorScheme="blue" mr={3}>
                Yes
              </Button>
              <Button variant="ghost" onClick={() => setModalIsOpen(false)}>
                No
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {Array.isArray(questions) && questions.length > 0
          && (
          <div style={{ width: '80%' }}>
            <Button
              width={currentIndex > 0 ? '50%' : '100%'}
              justifyContent="flex-start"
              // colorScheme='blue'
              onClick={() => setModalIsOpen(true)}
              variant="outline"
              textAlign="left"
              position="relative"
              style={{ textAlign: 'left' }}
            >
              {currentIndex === questions.length - 1 ? t('send') : t('next')}
              <Icon
                style={{ position: 'absolute', left: '95%', top: '10' }}
                width="25px"
                height="50%"
                icon="arrowRight"
                color="blue"
              />
            </Button>
            {/* <ConfirmSend
              width={currentIndex > 0 ? "50%" : "100%"}
              lang={lang}
              label={currentIndex === questions.length - 1 ? "Send answer" : "Next"}
              onSubmit={() => {
                const q = questions[currentIndex];
                if (q.score === null || !parseInt(q.score) || q.score > 10 || q.score < 0) {
                  setMsg({ type: "danger", text: 'Please choose one score between 1 and 10' })
                }
                else {
                  sendVote({ score: q.score, comment: q.comment, id: q.id, status: 'ANSWERED' })
                    .then(() => {
                      if (questions.length - 1 > currentIndex) {
                        setcurrentIndex(currentIndex + 1);
                        setQuestions(qest => qest.map(_q => _q.id === q.id ? q : _q))
                      }
                      else setMsg({ text: "😁 Thank you for your feedback!", type: "success" })
                    })
                    .catch(error => setMsg({ text: error.message || error, type: "danger" }))

                }
              }} /> */}
          </div>
          )}
      </main>
    </div>
  );
};

// export default Survey;
export default asPrivate(Survey);
