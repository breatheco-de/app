import { useState, useEffect } from 'react';
import { email as emailRe } from '../../../utils/regex';
import { isWindow } from '../../../utils';
import bc from '../../services/breathecode';

function useValidateUser() {
  const [emailValidation, setEmailValidation] = useState({
    valid: false,
    loading: false,
    error: null,
  });
  const [emailValue, setEmailValue] = useState(null);

  const thriggerValidation = (e) => {
    setEmailValidation({
      valid: false,
      loading: false,
      error: null,
    });
    setEmailValue(e.target.value);
    return e;
  };

  const validateEmail = async (email) => {
    try {
      if (isWindow && email.toLowerCase().match(emailRe)) {
        setEmailValidation({
          valid: false,
          loading: true,
          error: null,
        });

        const response = await bc.auth().verifyEmail(email);
        console.log('response');
        console.log(response);

        if (response.status && response.status >= 400) {
          const result = await response.json();
          console.log('result');
          console.log(result);
          setEmailValidation({
            valid: false,
            loading: false,
            error: result.detail,
          });
        } else {
          setEmailValidation({
            valid: true,
            loading: false,
            error: null,
          });
        }
      }
    } catch (e) {
      console.log(e);
      setEmailValidation({
        valid: false,
        loading: false,
        error: typeof e === 'string' ? e : e.message,
      });
    }
  };

  useEffect(() => {
    if (!emailValue) return () => {};
    const timeoutId = setTimeout(() => validateEmail(emailValue), 1000);
    return () => clearTimeout(timeoutId);
  }, [emailValue]);

  return {
    thriggerValidation,
    emailValidation,
  };
}

export default useValidateUser;
