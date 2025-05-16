import { useEffect } from 'react';
import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import signupAction from '../../store/actions/signupAction';
import 'react-datepicker/dist/react-datepicker.css';
import useStyle from '../../hooks/useStyle';
import useSignup from '../../hooks/useSignup';
import { reportDatalayer } from '../../utils/requests';
import { getBrowserInfo } from '../../utils';
import PaymentMethods from './PaymentMethods';

function PaymentInfo({ setShowPaymentDetails }) {
  const { stepsEnum } = useSignup();

  const {
    state, handleStep,
  } = signupAction();
  const {
    paymentStatus,
  } = state;
  const { backgroundColor } = useStyle();

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_payment_info_rendered',
        value: state?.selectedPlanCheckoutData?.price,
        agent: getBrowserInfo(),
      },
    });
  }, []);

  const onPaymentSuccess = () => {
    handleStep(stepsEnum.SUMMARY);
  };

  return (
    <Box display="flex" height="100%" flexDirection="column" gridGap="30px" margin={{ base: paymentStatus === 'success' ? '' : '0 1rem', lg: '0 auto' }} position="relative">
      <Box display="flex" width={{ base: 'auto', lg: '490px' }} height="auto" flexDirection="column" minWidth={{ base: 'auto', md: '100%' }} background={backgroundColor} p={{ base: '20px 0', md: '30px 0' }} borderRadius="15px">
        {paymentStatus !== 'success' && (
          <PaymentMethods onPaymentSuccess={onPaymentSuccess} setShowPaymentDetails={setShowPaymentDetails} />
        )}
      </Box>
    </Box>
  );
}

PaymentInfo.propTypes = {
  setShowPaymentDetails: PropTypes.func,
};

PaymentInfo.defaultProps = {
  setShowPaymentDetails: () => { },
};

export default PaymentInfo;
