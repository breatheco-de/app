import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../Heading';
import bc from '../../services/breathecode';
import signupAction from '../../store/actions/signupAction';
import 'react-datepicker/dist/react-datepicker.css';
import useStyle from '../../hooks/useStyle';
import useAuth from '../../hooks/useAuth';
import { reportDatalayer } from '../../utils/requests';
import { getBrowserInfo } from '../../utils';
import useSignup from '../../hooks/useSignup';
import { SILENT_CODE } from '../../utils/variables';
import CardForm from './CardForm';
import Text from '../Text';
import AcordionList from '../AcordionList';
import LoaderScreen from '../LoaderScreen';
import NextChakraLink from '../NextChakraLink';

function PaymentMethods({ setShowPaymentDetails, onPaymentSuccess }) {
  const { t } = useTranslation('signup');
  const { isAuthenticated } = useAuth();

  const {
    state, setIsSubmittingCard, setIsSubmittingPayment, setPaymentStatus, setPaymentInfo,
  } = signupAction();
  const { handlePayment, getPaymentMethods } = useSignup();
  const {
    selectedPlan,
    paymentMethods,
    loader,
    isSubmittingCard,
  } = state;
  const [openDeclinedModal, setOpenDeclinedModal] = useState(false);
  const [declinedModalProps, setDeclinedModalProps] = useState({
    title: '',
    description: '',
  });
  const { fontColor, hexColor } = useStyle();

  useEffect(() => {
    if (selectedPlan?.owner?.id) getPaymentMethods(selectedPlan.owner.id);
  }, [isAuthenticated]);

  const handlePaymentErrors = (data, actions = {}, callback = () => { }) => {
    const silentCode = data?.silent_code;
    setIsSubmittingPayment(false);
    actions?.setSubmitting(false);
    callback();

    if (!silentCode) {
      setOpenDeclinedModal(true);
      console.log("wulululuku", data?.detail);
      setDeclinedModalProps({
        title: t('transaction-denied'),
        description: data?.detail || t('payment-not-processed'),
      });
      return;
    }

    if (silentCode === SILENT_CODE.CARD_ERROR) {
      setOpenDeclinedModal(true);
      setDeclinedModalProps({
        title: t('transaction-denied'),
        description: t('card-declined'),
      });
    }
    if (SILENT_CODE.LIST_PROCESSING_ERRORS.includes(silentCode)) {
      setOpenDeclinedModal(true);
      setDeclinedModalProps({
        title: t('transaction-denied'),
        description: t('payment-not-processed'),
      });
    }
    if (silentCode === SILENT_CODE.UNEXPECTED_EXCEPTION) {
      setOpenDeclinedModal(true);
      setDeclinedModalProps({
        title: t('transaction-denied'),
        description: t('payment-error'),
      });
    }
  };

  const handleSubmit = async (actions, values) => {
    const resp = await bc.payment().addCard({ ...values, academy: selectedPlan.owner.id });
    const { data } = resp;
    setIsSubmittingCard(false);

    if (data.status === 'ok') {
      try {
        const respPayment = await handlePayment({}, true);
        if (respPayment.status === 'FULFILLED') {
          setPaymentStatus('success');
          setIsSubmittingPayment(false);
          onPaymentSuccess();
          setShowPaymentDetails(false);
        } else {
          setPaymentStatus('error');
          handlePaymentErrors(respPayment, actions);
        }
      } finally {
        actions.setSubmitting(false);
      }
      const currency = selectedPlan?.currency?.code;
      reportDatalayer({
        dataLayer: {
          event: 'add_payment_info',
          path: '/checkout',
          value: selectedPlan?.price,
          currency,
          payment_type: 'Credit card',
          plan: selectedPlan?.plan_slug,
          period_label: selectedPlan?.period_label,
          agent: getBrowserInfo(),
        },
      });
    } else {
      setPaymentStatus('error');
      setPaymentInfo('cvc', '');
      handlePaymentErrors(data, actions);
    }
  };

  const onSubmitCard = (values, actions, stateCard) => {
    setIsSubmittingPayment(true);
    setIsSubmittingCard(true);
    const monthAndYear = values.exp?.split('/');
    const expMonth = monthAndYear[0];
    const expYear = monthAndYear[1];

    const allValues = {
      card_number: stateCard.card_number,
      exp_month: expMonth,
      exp_year: expYear,
      cvc: values.cvc,
    };

    handleSubmit(actions, allValues);
  };

  const handleTryAgain = () => {
    setOpenDeclinedModal(false);
  };

  return (
    <>
      <Heading size="18px">{t('payment-methods')}</Heading>
      <Box
        as="hr"
        width="20%"
        margin="12px 0 18px 0"
        border="0px"
        h="1px"
        background={fontColor}
      />
      {loader.paymentMethods && (
        <LoaderScreen />
      )}
      <Flex flexDirection="column" gridGap="4px" width="100%" mt="1rem">
        <AcordionList
          width="100%"
          list={paymentMethods.map((method) => {
            if (!method.is_credit_card) {
              return {
                ...method,
                onClick: (e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                },
                description: (
                  <Box padding="0 17px">
                    <Text
                      size="md"
                      className="method-description"
                      sx={{
                        a: {
                          color: hexColor.blueDefault,
                        },
                        'a:hover': {
                          opacity: 0.7,
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: method.description }}
                    />
                    {method.third_party_link && (
                      <Text mt="10px" color={hexColor.blueDefault}>
                        <NextChakraLink target="_blank" href={method.third_party_link}>
                          {t('click-here')}
                        </NextChakraLink>
                      </Text>
                    )}
                  </Box>
                ),
              };
            }
            return {
              ...method,
              description: (
                <CardForm
                  modalCardErrorProps={{
                    declinedModalProps,
                    openDeclinedModal,
                    setOpenDeclinedModal,
                    handleTryAgain,
                    disableClose: true,
                    isSubmitting: isSubmittingCard,
                  }}
                  onSubmit={onSubmitCard}
                />
              ),
            };
          })}
          paddingButton="10px 17px"
          unstyled
          gridGap="0"
          containerStyles={{
            gridGap: '8px',
            allowToggle: true,
          }}
          descriptionStyle={{ padding: '10px 0 0 0' }}
          defaultIndex={paymentMethods?.findIndex((method) => method.is_credit_card)}
        />
      </Flex>
    </>
  );
}

PaymentMethods.propTypes = {
  setShowPaymentDetails: PropTypes.func,
  onPaymentSuccess: PropTypes.func,
};

PaymentMethods.defaultProps = {
  setShowPaymentDetails: () => { },
  onPaymentSuccess: () => { },
};

export default PaymentMethods;
