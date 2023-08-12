import { useMemo, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import bc from '../services/breathecode';
import SimpleModal from '../components/SimpleModal';
import useSignup from '../store/actions/signupAction';
import axiosInstance from '../../axios';

const useSubscribeToPlan = () => {
  const { t } = useTranslation(['common', 'alert-message']);
  const [isInProcessOfSubscription, setIsInProcessOfSubscription] = useState(false);
  const { handleChecking, handlePayment } = useSignup({ disableRedirectAfterSuccess: true });
  const toast = useToast();
  const [isCheckingSuccess, setIsCheckingSuccess] = useState(false);

  const handleSubscribeToPlan = ({ slug, accessToken }) => new Promise((resolve, reject) => {
    setIsInProcessOfSubscription(true);
    if (accessToken) {
      axiosInstance.defaults.headers.common.Authorization = `Token ${accessToken}`;
    }

    bc.payment().getPlan(slug)
      .then((plan) => {
        const data = plan?.data;
        if (data) {
          handleChecking({ plan: data, token: accessToken })
            .then((respData) => {
              handlePayment({
                ...respData,
                installments: respData?.how_many_months,
              })
                .then((respPayment) => {
                  resolve(respPayment.data);
                  if (respPayment.status < 400) {
                    setIsCheckingSuccess(true);
                  }
                })
                .catch(() => {
                  reject();
                  toast({
                    position: 'top',
                    title: t('alert-message:payment-error'),
                    status: 'error',
                    duration: 7000,
                    isClosable: true,
                  });
                });
            });
        } else {
          reject(new Error('Plan not found'));
        }
      });
  });

  const successModal = useMemo(() => (
    <SimpleModal
      isOpen={isCheckingSuccess}
      onClose={() => setIsCheckingSuccess(false)}
    >
      some content
    </SimpleModal>
  ), [isCheckingSuccess]);

  return { isInProcessOfSubscription, setIsInProcessOfSubscription, handleSubscribeToPlan, successModal };
};

export default useSubscribeToPlan;
