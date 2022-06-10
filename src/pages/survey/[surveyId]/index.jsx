// import Link from 'next/link';
// import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Home.module.css';
// import { getParam } from '../../../utils/url';
import bc from '../../../common/services/breathecode';
import asPrivate from '../../../common/context/PrivateRouteWrapper';

const Survey = () => {
  const router = useRouter();
  const { surveyId, attempt, token } = router.query;
  const [questions, setQuestions] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    console.log(questions);
    console.log(msg);

    if (parseInt(surveyId, 2)) {
      bc.feedback().getSurvey(surveyId)
        .then((data) => {
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

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <h2>{surveyId}</h2>
        <h2>{attempt}</h2>
        <h2>{token}</h2>
      </main>
    </div>
  );
};

// export default Survey;
export default asPrivate(Survey);
