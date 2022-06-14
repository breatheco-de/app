// import Link from 'next/link';
// import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Home.module.css';
import Steps from '../../../common/styledComponents/Steps';
import Question from '../../../common/components/Question';
import bc from '../../../common/services/breathecode';
import asPrivate from '../../../common/context/PrivateRouteWrapper';

const Survey = () => {
  const router = useRouter();
  const { surveyId } = router.query;
  const [questions, setQuestions] = useState(null);
  const [msg, setMsg] = useState(null);
  const [currentIndex, setcurrentIndex] = useState(0);

  useEffect(() => {
    console.log(msg);

    if (surveyId) {
      bc.feedback().getSurvey(surveyId)
        .then(({data}) => {
          console.log(data);
          setQuestions(data.map((q) => ({ message: q.title, ...q })));
          setMsg(null);
        })
        .catch((error) => {
          setMsg({ text: error.message || error, type: 'danger' });
          setQuestions([]);
        });
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

  // const lang = Array.isArray(questions) && typeof(questions[currentIndex]) !== "undefined" ? questions[currentIndex].lang.toLowerCase() : "en";
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div style={{margin:'25px 0'}}>
          <Steps 
            currentIndex={currentIndex} 
            steps={!Array.isArray(questions) ? [] : questions.map((q,i) => ({ label: i }))} 
          />
        </div>
        { Array.isArray(questions) && questions.length > 0 &&
            <Question key={currentIndex} question={questions[currentIndex]} onChange={q => {
                setQuestions(qest => qest.map(_q => _q.id === q.id ? q : _q))
                setMsg(null)
            }} />
        }
      </main>
    </div>
  );
};

// export default Survey;
export default asPrivate(Survey);
