import { useEffect, useState, useRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Flex, Button, RadioGroup, Stack, Radio, Image,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../Heading';
import ModalCardError from './ModalCardError';
import bc from '../../services/breathecode';
import signupAction from '../../store/actions/signupAction';
import 'react-datepicker/dist/react-datepicker.css';
import useStyle from '../../hooks/useStyle';
import useAuth from '../../hooks/useAuth';
import { reportDatalayer } from '../../utils/requests';
import { getBrowserInfo } from '../../utils';
import useSignup from '../../hooks/useSignup';
import { SILENT_CODE } from '../../utils/variables';
import useCustomToast from '../../hooks/useCustomToast';
import CardForm from './CardForm';
import Text from '../Text';
import AcordionList from '../AcordionList';
import LoaderScreen from '../LoaderScreen';
import NextChakraLink from '../NextChakraLink';
import Icon from '../Icon';

function PaymentMethods({
  setShowPaymentDetails,
  onPaymentSuccess,
  handleRenewalPayment,
  handleCoinbaseRenewalPayment,
}) {
  const { t } = useTranslation('signup');
  const { isAuthenticated } = useAuth();

  const {
    state, setIsSubmittingCard, setIsSubmittingPayment, setPaymentStatus, setPaymentInfo, setLoader,
  } = signupAction();
  const { isSubmittingPayment, paymentInfo } = state;

  const { handlePayment, handleCoinbasePayment, getPaymentMethods, getSavedCard } = useSignup();

  const isRenewalContext = typeof window !== 'undefined' && window.location.pathname.includes('/renew');

  // Use renewal handlers if provided (from props), otherwise use regular signup handlers
  const paymentHandler = handleRenewalPayment || handlePayment;
  const coinbaseHandler = handleCoinbaseRenewalPayment || handleCoinbasePayment;
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
  const { createToast } = useCustomToast({ toastId: 'payment-methods' });

  const [selectedCard, setSelectedCard] = useState('newCard');
  const [savedCard, setSavedCard] = useState(null);
  const [isCoinbaseLoading, setIsCoinbaseLoading] = useState(false);

  const CARD_ICONS = {
    visa: 'https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg',
    mastercard: 'https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg',
    amex: 'https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg',
    discover: 'https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg',
    diners: 'https://js.stripe.com/v3/fingerprinted/img/diners-fbcbd3360f8e3f629cdaa80e93abdb8b.svg',
    jcb: 'https://js.stripe.com/v3/fingerprinted/img/jcb-271fd06e6e7a2c52692ffa91a95fb64f.svg',
    unionpay: 'https://js.stripe.com/v3/fingerprinted/img/unionpay-8a10aefc7295216c338ba4e1224627a1.svg',
  };

  const processedErrorRef = useRef(false);

  useEffect(() => {
    if (selectedPlan?.owner?.id && isAuthenticated) {
      getPaymentMethods(selectedPlan.owner.id);
    }
  }, [selectedPlan?.owner?.id, isAuthenticated]);

  useEffect(() => {
    const fetchSavedCard = async () => {
      if (!selectedPlan?.owner?.id || !isAuthenticated) {
        setLoader('savedCard', false);
        return;
      }
      setLoader('savedCard', true);
      try {
        const fetchedCard = await getSavedCard(selectedPlan.owner.id);
        setSavedCard(fetchedCard);
      } catch (error) {
        console.error('Error fetching saved card:', error);
      } finally {
        setLoader('savedCard', false);
      }
    };
    fetchSavedCard();
  }, [selectedPlan?.owner?.id, isAuthenticated]);

  useEffect(() => {
    if (!openDeclinedModal) {
      processedErrorRef.current = false;
    }
  }, [openDeclinedModal]);

  const handlePaymentErrors = (data, actions = {}, callback = () => { }) => {
    const silentCode = data?.silent_code;
    setIsSubmittingPayment(false);
    actions?.setSubmitting(false);
    callback();

    if (!silentCode) {
      setOpenDeclinedModal(true);
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
        const respPayment = await paymentHandler({}, true);
        if (respPayment.status === 'FULFILLED') {
          setPaymentStatus('success');
          setIsSubmittingPayment(false);
          setShowPaymentDetails(false);
          onPaymentSuccess();
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
          path: isRenewalContext ? '/renew' : '/checkout',
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

  const handleSaveCardForLater = async () => {
    if (!paymentInfo.card_number || !paymentInfo.exp || !paymentInfo.cvc) {
      createToast({
        position: 'top',
        title: t('error'),
        description: t('please-fill-all-fields'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmittingCard(true);

    try {
      const monthAndYear = paymentInfo.exp.split('/');
      const expMonth = monthAndYear[0];
      const expYear = monthAndYear[1];

      const cardData = {
        card_number: paymentInfo.card_number,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: paymentInfo.cvc,
      };

      const resp = await bc.payment().addCard({ ...cardData, academy: selectedPlan.owner.id });

      if (resp.data.status === 'ok') {
        const currency = selectedPlan?.currency?.code;
        reportDatalayer({
          dataLayer: {
            event: 'add_payment_info',
            path: isRenewalContext ? '/renew' : '/checkout',
            value: selectedPlan?.price,
            currency,
            payment_type: 'Credit card',
            plan: selectedPlan?.plan_slug,
            period_label: selectedPlan?.period_label,
            agent: getBrowserInfo(),
          },
        });
        createToast({
          position: 'top',
          title: t('success'),
          description: t('card-saved-successfully'),
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setIsSubmittingCard(false);

        getPaymentMethods(selectedPlan.owner.id);
        const updatedCard = await getSavedCard(selectedPlan.owner.id);
        setSavedCard(updatedCard);

        setShowPaymentDetails(false);
      } else {
        setPaymentStatus('error');
        handlePaymentErrors(resp.data, { setSubmitting: () => setIsSubmittingCard(false) });
      }
    } catch (error) {
      console.error('Error saving card:', error);
      setIsSubmittingCard(false);
      setPaymentStatus('error');
      handlePaymentErrors(error.response?.data || { detail: t('error-saving-card') }, { setSubmitting: () => setIsSubmittingCard(false) });
    }
  };

  const handleCoinbaseCharge = async () => {
    setIsCoinbaseLoading(true);

    const result = await coinbaseHandler();
    const { data } = result;
    if (result?.status < 400) {
      if (data?.hosted_url) {
        window.location.href = data.hosted_url;
      }
    } else {
      setPaymentStatus('error');
      setIsCoinbaseLoading(false);
      handlePaymentErrors(data, { setSubmitting: () => {} });
    }
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
      {(loader.paymentMethods || loader.savedCard) && (
        <LoaderScreen />
      )}
      <Flex flexDirection="column" gridGap="4px" width="100%" mt="1rem">
        <AcordionList
          width="100%"
          list={paymentMethods.map((method) => {
            if (!method.is_credit_card && !method.is_coinbase) {
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
            if (method.is_coinbase) {
              return {
                ...method,
                description: (
                  <Box padding="0 17px">
                    <Text size="md" mb="1rem">
                      {method.description}
                    </Text>
                    <Button
                      onClick={handleCoinbaseCharge}
                      width="100%"
                      variant="default"
                      height="40px"
                      mt="0"
                      isLoading={isCoinbaseLoading}
                    >
                      {t('pay-with-coinbase')}
                    </Button>
                  </Box>
                ),
              };
            }
            return {
              ...method,
              description: (
                <>
                  <RadioGroup onChange={setSelectedCard} value={selectedCard} marginBottom="10px">
                    <Stack>
                      {savedCard && (
                        <Box
                          border="1px solid"
                          borderColor={selectedCard === 'userCard' ? hexColor.blueDefault : hexColor.borderColor}
                          backgroundColor={selectedCard === 'userCard' ? hexColor.blueLight : 'transparent'}
                          padding="10px"
                          borderRadius="5px"
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          {savedCard && (
                          <Radio value="userCard" width="100%">
                            <Box display="flex">
                              <Image src={CARD_ICONS[savedCard.brand]} alt={savedCard.brand} width="24px" height="18px" marginRight="8px" />
                              <Text>
                                ••••
                                {' '}
                                {savedCard.last4}
                              </Text>
                            </Box>
                            <Text marginTop="4px" color="gray.500">
                              {t('expires')}
                              {' '}
                              {savedCard.exp_month}
                              /
                              {savedCard.exp_year}
                            </Text>
                          </Radio>
                          )}
                        </Box>
                      )}
                      <Box
                        border="1px solid"
                        borderColor={selectedCard === 'newCard' ? hexColor.blueDefault : hexColor.borderColor}
                        backgroundColor={selectedCard === 'newCard' ? hexColor.blueLight : 'transparent'}
                        padding="10px"
                        borderRadius="5px"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Radio value="newCard" width="100%">
                          <Flex>
                            <Icon icon="card" width="24px" height="18px" color={fontColor} />
                            <Text marginLeft="8px">{t('new-card')}</Text>
                          </Flex>
                        </Radio>
                      </Box>
                    </Stack>
                  </RadioGroup>
                  {
                    selectedCard === 'userCard' ? (
                      <>
                        <ModalCardError
                          isSubmitting={isSubmittingCard}
                          declinedModalProps={declinedModalProps}
                          openDeclinedModal={openDeclinedModal}
                          setOpenDeclinedModal={setOpenDeclinedModal}
                          handleTryAgain={handleTryAgain}
                          disableClose
                        />
                        <Button
                          width="100%"
                          variant="default"
                          height="40px"
                          mt="0"
                          isLoading={isSubmittingPayment}
                          onClick={async () => {
                            setIsSubmittingPayment(true);
                            try {
                              const respPayment = await paymentHandler({}, true);
                              if (respPayment?.status === 'FULFILLED') {
                                setPaymentStatus('success');
                                setIsSubmittingPayment(false);
                                onPaymentSuccess();
                                setShowPaymentDetails(false);
                              } else {
                                setPaymentStatus('error');
                                handlePaymentErrors(respPayment, { setSubmitting: () => setIsSubmittingPayment(false) });
                              }
                            } catch (error) {
                              console.error('Error processing payment with saved card:', error);
                              setIsSubmittingPayment(false);
                              setPaymentStatus('error');
                              handlePaymentErrors(error.response?.data, { setSubmitting: () => setIsSubmittingPayment(false) });
                            }
                          }}
                        >
                          {t('common:proceed-to-payment')}
                        </Button>
                      </>
                    ) : (
                      <>
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
                          customButtons={(
                            <Flex justifyContent="space-between" mt="10px" gap="10px">
                              <Button
                                type="submit"
                                variant="default"
                                width="100%"
                                height="40px"
                                mt="0"
                                isLoading={isSubmittingPayment}
                              >
                                {t('pay-now')}
                              </Button>
                              <Button
                                type="button"
                                variant="default"
                                width="100%"
                                height="40px"
                                mt="0"
                                onClick={handleSaveCardForLater}
                                isLoading={isSubmittingCard && !isSubmittingPayment}
                                disabled={isSubmittingPayment}
                              >
                                {t('save-card-for-later')}
                              </Button>
                            </Flex>
                          )}
                        />
                      </>
                    )
                  }
                </>
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
          defaultIndex={paymentMethods.length === 1 && paymentMethods?.findIndex((method) => method.is_credit_card)}
        />
      </Flex>
    </>
  );
}

PaymentMethods.propTypes = {
  setShowPaymentDetails: PropTypes.func,
  onPaymentSuccess: PropTypes.func,
  handleRenewalPayment: PropTypes.func,
  handleCoinbaseRenewalPayment: PropTypes.func,
};

PaymentMethods.defaultProps = {
  setShowPaymentDetails: () => { },
  onPaymentSuccess: () => { },
  handleRenewalPayment: null,
  handleCoinbaseRenewalPayment: null,
};

export default PaymentMethods;
