import { useState, useEffect } from 'react';
import { BREATHECODE_HOST } from '../../../utils/variables';
import { email as emailRe } from '../../../utils/regex';
import { isWindow } from '../../../utils';
import bc from '../../services/breathecode';

function useEmailValidation() {
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
  };

  const validateEmail = async (email) => {
    try {
      if (isWindow && email.toLowerCase().match(emailRe)) {
        setEmailValidation({
          valid: false,
          loading: true,
          error: null,
        });
        const cacheEmail = sessionStorage.getItem(email);
        let result;
        if (cacheEmail) {
          result = JSON.parse(cacheEmail);
        } else {
          const response = await bc.post(`${BREATHECODE_HOST}/v1/marketing/app/validateemail`, { email });
          result = await response.json();
        }

        sessionStorage.setItem(email, JSON.stringify(result));

        if (result.status_code && result.status_code >= 400) {
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

export default useEmailValidation;
