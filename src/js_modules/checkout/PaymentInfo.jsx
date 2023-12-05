/* eslint-disable no-unsafe-optional-chaining */
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, Flex, Input, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
import FieldForm from '../../common/components/Forms/FieldForm';
import useSignup from '../../common/store/actions/signupAction';
import Icon from '../../common/components/Icon';
import 'react-datepicker/dist/react-datepicker.css';
import useStyle from '../../common/hooks/useStyle';
import { reportDatalayer } from '../../utils/requests';
import { getStorageItem } from '../../utils';
import Text from '../../common/components/Text';
import { getAllMySubscriptions } from '../../common/handlers/subscriptions';
import { SILENT_CODE } from '../../lib/types';
import SimpleModal from '../../common/components/SimpleModal';

const CustomDateInput = forwardRef(({ value, onClick, ...rest }, ref) => {
  const { t } = useTranslation('signup');
  const { input } = useStyle();
  const inputBorderColor = input.borderColor;

  return (
    <Input
      {...rest}
      placeholder={t('expiration-date')}
      onClick={onClick}
      height="50px"
      borderRadius="3px"
      borderColor={inputBorderColor}
      ref={ref}
      value={value}
    />
  );
});

function PaymentInfo() {
  const { t } = useTranslation('signup');
  const toast = useToast();

  const {
    state, setPaymentInfo, handlePayment, getPaymentText,
  } = useSignup();
  const { paymentInfo, checkoutData, planProps, dateProps, selectedPlanCheckoutData, cohortPlans } = state;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDeclinedModal, setOpenDeclinedModal] = useState(false);
  const [declinedModalProps, setDeclinedModalProps] = useState({
    title: '',
    description: '',
  });
  const [readyToRefetch, setReadyToRefetch] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [stateCard, setStateCard] = useState({
    card_number: 0,
    exp_month: 0,
    exp_year: 0,
    cvc: 0,
  });
  const redirect = getStorageItem('redirect');
  const redirectedFrom = getStorageItem('redirected-from');
  const router = useRouter();

  const isNotTrial = selectedPlanCheckoutData?.type !== 'TRIAL';

  const getPrice = (planProp) => {
    if (isNotTrial) {
      if (planProp?.financing_options?.length > 0 && planProp?.financing_options[0]?.monthly_price > 0) return planProp?.financing_options[0]?.monthly_price;
      if (checkoutData?.amount_per_half > 0) return checkoutData?.amount_per_half;
      if (checkoutData?.amount_per_month > 0) return checkoutData?.amount_per_month;
      if (checkoutData?.amount_per_quarter > 0) return checkoutData?.amount_per_quarter;
      if (checkoutData?.amount_per_year > 0) return checkoutData?.amount_per_year;
    }
    return t('free-trial');
  };

  const priceIsNotNumber = Number.isNaN(Number(getPrice(selectedPlanCheckoutData)));

  const { backgroundColor, borderColor, fontColor } = useStyle();
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');

  const infoValidation = Yup.object().shape({
    owner_name: Yup.string()
      .min(6, t('validators.owner_name-min'))
      .required(t('validators.owner_name-required')),
    card_number: Yup.string()
      .min(16)
      .max(20)
      .required(t('validators.card_number-required')),
    exp: Yup.string()
      .min(5, t('validators.exp-min'))
      .required(t('validators.exp-required')),
    cvc: Yup.string()
      .min(3)
      .max(4)
      .required(t('validators.cvc-required')),
  });

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_complete_purchase',
      },
    });
    setOpenDeclinedModal(true);
    setDeclinedModalProps({
      title: t('transaction-denied'),
      description: t('payment-not-processed'),
    });
  }, []);

  useEffect(() => {
    let interval;
    if (readyToRefetch && timeElapsed < 10) {
      interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
        getAllMySubscriptions()
          .then((subscriptions) => {
            const isPurchasedPlanFound = subscriptions?.length > 0 && subscriptions.some(
              (subscription) => checkoutData?.plans[0].slug === subscription.plans[0]?.slug,
            );

            if (isPurchasedPlanFound) {
              clearInterval(interval);
              if ((redirect && redirect?.length > 0) || (redirectedFrom && redirectedFrom.length > 0)) {
                router.push(redirect || redirectedFrom);
                localStorage.removeItem('redirect');
                localStorage.removeItem('redirected-from');
              } else {
                router.push('/choose-program');
              }
            }
          });
      }, 1500);
    }
    if (readyToRefetch === false) {
      setTimeElapsed(0);
      clearInterval(interval);
    }
  }, [readyToRefetch]);

  const handleSubmit = (actions, values) => {
    bc.payment().addCard(values)
      .then((resp) => {
        if (resp) {
          const currency = cohortPlans[0]?.plan?.currency?.code;
          reportDatalayer({
            dataLayer: {
              event: 'add_payment_info',
              path: '/checkout',
              value: state?.selectedPlanCheckoutData?.price,
              currency,
              payment_type: 'Credit card',
              plan: state?.selectedPlanCheckoutData?.slug,
              period_label: state?.selectedPlanCheckoutData?.period_label,
            },
          });
          handlePayment({}, true)
            .then((respPayment) => {
              const silentCode = respPayment?.silent_code;
              if (silentCode) {
                setReadyToRefetch(false);

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
              }

              if (respPayment.status === 'FULFILLED') {
                setReadyToRefetch(true);
              }
            })
            .finally(() => {
              actions.setSubmitting(false);
            });
        }
        if (resp.status >= 400) {
          toast({
            position: 'top',
            title: t('alert-message:card-error'),
            description: t('alert-message:card-error-description'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        }
      })
      .catch(() => {
        setIsSubmitting(false);
        actions.setSubmitting(false);
        toast({
          position: 'top',
          title: t('alert-message:card-error'),
          description: t('alert-message:card-error-description'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  };

  return (
    <Box display="flex" gridGap="30px" flexDirection={{ base: 'column', md: 'row' }} position="relative">
      <SimpleModal
        isOpen={openDeclinedModal}
        headerStyles={{
          padding: '0 0 16px 0',
          textAlign: 'center',
        }}
        maxWidth="510px"
        onClose={() => setOpenDeclinedModal(false)}
        title={declinedModalProps.title}
        padding="16px 0"
        gridGap="24px"
        bodyStyles={{
          display: 'flex',
          gridGap: '24px',
          padding: '0',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image src="/static/images/avatar-for-transaction-failed.png" width={80} height={80} />

        <Text fontSize="18px" fontWeight="700" textAlign="center">
          {declinedModalProps.description}
        </Text>

        <Flex gridGap="24px">
          <Button variant="outline" onClick={() => setOpenDeclinedModal(false)} borderColor="blue.default" color="blue.default">
            {t('common:close')}
          </Button>
          <Button
            isLoading={isSubmitting}
            variant="default"
            onClick={() => {
              setIsSubmitting(true);
              handlePayment({}, true)
                .then((resp) => {
                  if (resp.status === 'FULFILLED') {
                    setReadyToRefetch(true);
                  }
                })
                .catch(() => {
                  setIsSubmitting(false);
                });
            }}
          >
            {t('common:try-again')}
          </Button>
        </Flex>
      </SimpleModal>
      <Box background={backgroundColor} flex={0.5} p={{ base: '20px 22px', md: '14px 23px' }} height="100%" borderRadius="15px">
        <Box
          display="flex"
          flexDirection="column"
          background={featuredBackground}
          w="100%"
          height="fit-content"
          p="11px 14px"
          gridGap="12px"
          borderRadius="14px"
        >
          <Heading size="15px" color="blue.default" textTransform="uppercase">
            {t('signing-for')}
          </Heading>
          <Box display="flex" gridGap="12px">
            <Box display="flex" flexDirection="column">
              <Box
                p="16px"
                background="blue.default"
                borderRadius="7px"
                width="fit-content"
              >
                <Icon icon="coding" width="48px" height="48px" color="#fff" />
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" gridGap="7px">
              <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="0px" alignItems="center">
                <Box display="flex" width="100%" flexDirection="column" gridGap="7px">
                  <Heading size="18px">{dateProps?.syllabus_version?.name || selectedPlanCheckoutData?.title}</Heading>
                  {selectedPlanCheckoutData?.description && (
                  <Heading
                    size="15px"
                    textTransform="uppercase"
                    color={useColorModeValue('gray.500', 'gray.400')}
                  >
                    {selectedPlanCheckoutData?.description}
                  </Heading>
                  )}
                </Box>
                <Heading
                  size={selectedPlanCheckoutData?.price > 0 ? 'm' : 'xsm'}
                  margin="0 16px 0 10px"
                  color="blue.default"
                  width={{ base: '100%', md: 'fit-content' }}
                  textAlign={{ base: 'start', md: 'end' }}
                >
                  {selectedPlanCheckoutData?.price <= 0
                    ? t('free-trial')
                    : `$${selectedPlanCheckoutData?.price}`}
                </Heading>
              </Box>

              <Text fontSize="14px" color={useColorModeValue('gray.700', 'gray.400')}>
                {getPaymentText()}
              </Text>
            </Box>
          </Box>
          {planProps?.length > 0 && (
          <>
            <Box
              as="hr"
              width="100%"
              margin="0"
              h="1px"
              borderColor={borderColor}
            />
            <Box fontSize="14px" fontWeight="700" color="blue.default">
              {t('what-you-will-get')}
            </Box>
          </>
          )}
          {planProps?.length > 0 && (
          <Box
            as="ul"
            style={{ listStyle: 'none' }}
            display="flex"
            flexDirection="column"
            gridGap="12px"
          >
            {planProps?.map((bullet) => (
              <Box
                as="li"
                key={bullet?.features[0]?.description}
                display="flex"
                flexDirection="row"
                lineHeight="24px"
                gridGap="8px"
              >
                <Icon
                  icon="checked2"
                  color="#38A56A"
                  width="13px"
                  height="10px"
                  style={{ margin: '8px 0 0 0' }}
                />
                <Box
                  fontSize="14px"
                  fontWeight="600"
                  letterSpacing="0.05em"
                  dangerouslySetInnerHTML={{ __html: bullet?.description }}
                />
                {bullet?.features[0]?.description}
              </Box>
            ))}
          </Box>
          )}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" flex={0.5} minWidth={{ base: 'auto', md: '385px' }} background={backgroundColor} p={{ base: '20px 22px', md: '30px 40px' }} height="100%" borderRadius="15px">
        <Heading size="18px">{t('payment-info')}</Heading>
        <Box
          as="hr"
          width="20%"
          margin="12px 0 18px 0"
          border="0px"
          h="1px"
          background={fontColor}
        />

        <Formik
          initialValues={{
            owner_name: '',
            card_number: '',
            exp: '',
            cvc: '',
          }}
          onSubmit={(values, actions) => {
            setIsSubmitting(true);
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
          }}
          validationSchema={infoValidation}
        >
          {() => (
            <Form
              style={{
                display: 'flex',
                flexDirection: 'column',
                gridGap: '22px',
              }}
            >
              <Box display="flex" gridGap="18px">
                <FieldForm
                  type="text"
                  name="owner_name"
                  externValue={paymentInfo.owner_name}
                  handleOnChange={(e) => {
                    setPaymentInfo('owner_name', e.target.value);
                    setStateCard({ ...stateCard, owner_name: e.target.value });
                  }}
                  pattern="[A-Za-z ]*"
                  label={t('owner-name')}
                />
              </Box>
              <Box display="flex" gridGap="18px">
                <FieldForm
                  type="text"
                  name="card_number"
                  externValue={paymentInfo.card_number}
                  handleOnChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                    const newValue = value.replace(/(.{4})/g, '$1 ').trim();
                    e.target.value = newValue.slice(0, 19);
                    setPaymentInfo('card_number', e.target.value);
                    setStateCard({ ...stateCard, card_number: newValue.replaceAll(' ', '').slice(0, 16) });
                  }}
                  pattern="[0-9]*"
                  label={t('card-number')}
                />
              </Box>
              <Box display="flex" gridGap="18px">
                <Box display="flex" gridGap="18px" flex={1}>
                  <Box display="flex" flexDirection="column" flex={0.5}>
                    <FieldForm
                      style={{ flex: 0.5 }}
                      type="text"
                      name="exp"
                      externValue={paymentInfo.exp}
                      maxLength={3}
                      handleOnChange={(e) => {
                        let { value } = e.target;
                        if ((value.length === 2 && paymentInfo.exp?.length === 1)) {
                          value += '/';
                        } else if (value.length === 2 && paymentInfo.exp?.length === 3) {
                          value = value.slice(0, 1);
                        }
                        value = value.substring(0, 5);

                        setPaymentInfo('exp', value);
                      }}
                      pattern="[0-9]*"
                      label={t('exp')}
                    />
                  </Box>
                  <FieldForm
                    style={{ flex: 0.5 }}
                    type="text"
                    name="cvc"
                    externValue={paymentInfo.cvc}
                    maxLength={3}
                    handleOnChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                      const newValue = value.replace(/(.{4})/g, '$1 ').trim();
                      e.target.value = newValue.slice(0, 4);

                      setPaymentInfo('cvc', e.target.value);
                    }}
                    pattern="[0-9]*"
                    label={t('cvc')}
                  />
                </Box>
              </Box>
              {(isNotTrial || !priceIsNotNumber) ? (
                <Button
                  type="submit"
                  width="100%"
                  variant="default"
                  isLoading={isSubmitting}
                  height="40px"
                  mt="0"
                >
                  {t('common:proceed-to-payment')}
                </Button>
              ) : (
                <Button
                  type="submit"
                  width="100%"
                  variant="outline"
                  borderColor="blue.200"
                  isLoading={isSubmitting}
                  background={featuredBackground}
                  _hover={{ background: featuredBackground, opacity: 0.8 }}
                  _active={{ background: featuredBackground, opacity: 1 }}
                  color="blue.default"
                  height="40px"
                  mt="0"
                >
                  {t('common:start-free-trial')}
                </Button>
              )}
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
}

CustomDateInput.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
};
CustomDateInput.defaultProps = {
  value: '',
  onClick: () => {},
};

export default PaymentInfo;
