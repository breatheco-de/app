/* eslint-disable no-unsafe-optional-chaining */
import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, Divider, Flex, Image, Input, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import signupAction from '../../store/actions/signupAction';
import 'react-datepicker/dist/react-datepicker.css';
import useStyle from '../../hooks/useStyle';
import ModalCardError from './ModalCardError';
import Icon from '../Icon';
import Text from '../Text';
import { getStripe } from '../../utils/stripe';

function CardFormContent({
  onSubmit,
  onSaveCard,
  modalCardErrorProps,
  buttonText,
}) {
  const { t } = useTranslation('signup');
  const stripe = useStripe();
  const elements = useElements();

  const {
    state, setPaymentInfo, setIsSubmittingCard, setIsSubmittingPayment,
  } = signupAction();
  const { paymentInfo, checkingData, selectedPlan, isSubmittingCard, isSubmittingPayment } = state;
  const [cardErrors, setCardErrors] = useState({});

  const isNotTrial = selectedPlan?.type !== 'TRIAL';

  const getPrice = (planProp) => {
    if (isNotTrial) {
      if (planProp?.financing_options?.length > 0 && planProp?.financing_options[0]?.monthly_price > 0) return planProp?.financing_options[0]?.monthly_price;
      if (checkingData?.amount_per_half > 0) return checkingData?.amount_per_half;
      if (checkingData?.amount_per_month > 0) return checkingData?.amount_per_month;
      if (checkingData?.amount_per_quarter > 0) return checkingData?.amount_per_quarter;
      if (checkingData?.amount_per_year > 0) return checkingData?.amount_per_year;
    }
    return t('free-trial');
  };

  const priceIsNotNumber = Number.isNaN(Number(getPrice(selectedPlan)));

  const { backgroundColor, hexColor, backgroundColor3, input, fontColor } = useStyle();
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');

  const nameValidation = Yup.object().shape({
    owner_name: Yup.string()
      .min(6, t('validators.owner_name-min'))
      .required(t('validators.owner_name-required')),
  });

  const stripeElementStyle = {
    width: '100%',
    height: '50px',
    border: '1px solid',
    borderColor: input.borderColor,
    borderRadius: '3px',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    padding: '0 16px',
  };

  const stripeElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: fontColor,
        lineHeight: '50px',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#A0AEC0',
        },
        ':-webkit-autofill': {
          backgroundColor: 'transparent',
          color: fontColor,
        },

      },
      invalid: {
        color: fontColor,
      },
    },
  };

  const handleFormSubmit = async (values, actions) => {
    setIsSubmittingPayment(true);
    if (!stripe || !elements) {
      setIsSubmittingPayment(false);
      actions.setSubmitting(false);

      if (modalCardErrorProps?.setDeclinedModalProps && modalCardErrorProps?.setOpenDeclinedModal) {
        modalCardErrorProps.setDeclinedModalProps({
          title: t('transaction-denied'),
          description: t('card-declined'),
        });
        modalCardErrorProps.setOpenDeclinedModal(true);
      }
      return;
    }

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);

      const { token, error } = await stripe.createToken(cardNumberElement, {
        name: values.owner_name,
      });

      if (error) {
        if (modalCardErrorProps?.setDeclinedModalProps && modalCardErrorProps?.setOpenDeclinedModal) {
          modalCardErrorProps.setDeclinedModalProps({
            title: t('transaction-denied'),
            description: error.message || t('card-declined'),
          });
          modalCardErrorProps.setOpenDeclinedModal(true);
        }
        setIsSubmittingPayment(false);
        setCardErrors({ cardNumber: null, expiry: null, cvc: null, card: null });
        actions.setSubmitting(false);
        return;
      }

      setCardErrors({ cardNumber: null, expiry: null, cvc: null, card: null });
      await onSubmit(token, actions);
    } catch (error) {
      console.error('Error creating token:', error);
      setIsSubmittingPayment(false);

      if (modalCardErrorProps?.setDeclinedModalProps && modalCardErrorProps?.setOpenDeclinedModal) {
        modalCardErrorProps.setDeclinedModalProps({
          title: t('alert-message.error'),
          description: error.message || t('card-declined'),
        });
        modalCardErrorProps.setOpenDeclinedModal(true);
      }

      setCardErrors((prev) => ({ ...prev, card: error.message || t('card-declined') }));
      actions.setSubmitting(false);
    }
  };

  const handleSaveCard = async () => {
    if (!onSaveCard) return;
    setIsSubmittingCard(true);
    try {
      await nameValidation.validate({ owner_name: paymentInfo.owner_name }, { abortEarly: false });
    } catch (validationError) {
      setIsSubmittingCard(false);
      if (validationError.inner && validationError.inner.length > 0) {
        const ownerNameError = validationError.inner.find((err) => err.path === 'owner_name');
        if (ownerNameError) {
          setCardErrors((prev) => ({ ...prev, owner_name: ownerNameError.message }));
        }
      }
      return;
    }

    if (!stripe || !elements) {
      setIsSubmittingCard(false);

      // Activar modal de error
      if (modalCardErrorProps?.setDeclinedModalProps && modalCardErrorProps?.setOpenDeclinedModal) {
        modalCardErrorProps.setDeclinedModalProps({
          title: t('alert-message.error'),
          description: t('card-declined'),
        });
        modalCardErrorProps.setOpenDeclinedModal(true);
      }

      setCardErrors((prev) => ({ ...prev, card: t('card-declined') }));
      return;
    }

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);

      const { token, error } = await stripe.createToken(cardNumberElement, {
        name: paymentInfo.owner_name,
      });

      if (error) {
        setIsSubmittingCard(false);
        if (modalCardErrorProps?.setOpenDeclinedModal) {
          modalCardErrorProps.setDeclinedModalProps({
            title: t('transaction-denied'),
            description: error.message || t('card-declined'),
          });
          modalCardErrorProps.setOpenDeclinedModal(true);
        }

        setCardErrors((prev) => ({ ...prev, card: error.message }));
        return;
      }

      setCardErrors((prev) => ({ ...prev, card: null }));
      await onSaveCard(token);
    } catch (error) {
      console.error('Error creating token:', error);
      setIsSubmittingCard(false);

      // Activar modal de error para errores inesperados
      if (modalCardErrorProps?.setDeclinedModalProps && modalCardErrorProps?.setOpenDeclinedModal) {
        modalCardErrorProps.setDeclinedModalProps({
          title: t('alert-message.error'),
          description: error.message || t('card-declined'),
        });
        modalCardErrorProps.setOpenDeclinedModal(true);
      }

      setCardErrors((prev) => ({ ...prev, card: error.message || t('card-declined') }));
    }
  };

  return (
    <Box display="flex" flexDirection="column" gridGap="30px" position="relative">
      <ModalCardError
        isSubmitting={isSubmittingCard}
        {...modalCardErrorProps}
      />
      <Box display="flex" width={{ base: 'auto', lg: '490px' }} height="auto" flexDirection="column" minWidth={{ base: 'auto', md: '100%' }} background={backgroundColor} p={{ base: '20px 0', md: '30px 0' }} borderRadius="15px">
        <Formik
          initialValues={{
            owner_name: paymentInfo.owner_name || '',
          }}
          onSubmit={handleFormSubmit}
          validationSchema={nameValidation}
        >
          {() => (
            <Form
              style={{
                display: 'flex',
                flexDirection: 'column',
                gridGap: '22px',
              }}
            >
              <Field name="owner_name">
                {({ field, form }) => {
                  const hasError = form.errors.owner_name && form.touched.owner_name;
                  return (
                    <Box display="flex" flexDirection="column" gridGap="8px">
                      <Input
                        {...field}
                        value={field.value}
                        placeholder={t('owner-name')}
                        height="50px"
                        borderColor={hasError ? 'red.500' : input.borderColor}
                        borderRadius="3px"
                        _placeholder={{ color: '#A0AEC0' }}
                        backgroundColor="transparent"
                        sx={{
                          '&:-webkit-autofill': {
                            WebkitBoxShadow: '0 0 0 1000px rgba(35, 35, 35, 0) inset !important',
                            transition: 'background-color 50000s ease-in-out 0s',
                          },
                          '&:-webkit-autofill:active': {
                            WebkitBoxShadow: '0 0 0 1000pxrgba(35, 35, 35, 0) inset !important',
                            boxShadow: '0 0 0 1000pxrgba(35, 35, 35, 0) inset !important',
                          },
                        }}
                        onChange={(e) => {
                          field.onChange(e);
                          setPaymentInfo('owner_name', e.target.value);
                        }}
                        _hover={{
                          borderColor: hasError ? 'red.500' : input.borderColor,
                        }}
                        _focus={{
                          borderColor: hasError ? 'red.500' : input.borderColor,
                        }}
                        pattern="[A-Za-z ]*"
                      />
                      {hasError && (
                        <Text size="12px" color="red.500">{form.errors.owner_name}</Text>
                      )}
                    </Box>
                  );
                }}
              </Field>

              <Box display="flex" flexDirection="column" gridGap="8px">
                <Box sx={{ ...stripeElementStyle, borderColor: cardErrors.cardNumber ? 'red.500' : input.borderColor }}>
                  <CardNumberElement
                    options={{
                      ...stripeElementOptions,
                      disableLink: true,
                      placeholder: t('card-number'),
                    }}
                    onChange={(e) => {
                      if (e.error) {
                        setCardErrors({ ...cardErrors, cardNumber: e.error.message });
                      } else {
                        setCardErrors({ ...cardErrors, cardNumber: null });
                      }
                    }}
                  />
                </Box>
                {cardErrors.cardNumber && (
                  <Text size="12px" color="red.500">{cardErrors.cardNumber}</Text>
                )}
              </Box>

              <Box display="flex" gridGap="18px">
                <Box display="flex" flexDirection="column" flex={0.5} gridGap="8px">
                  <Box sx={{ ...stripeElementStyle, borderColor: cardErrors.expiry ? 'red.500' : input.borderColor }}>
                    <CardExpiryElement
                      options={{
                        ...stripeElementOptions,
                        placeholder: t('expiration-date'),
                      }}
                      onChange={(e) => {
                        if (e.error) {
                          setCardErrors({ ...cardErrors, expiry: e.error.message });
                        } else {
                          setCardErrors({ ...cardErrors, expiry: null });
                        }
                      }}
                    />
                  </Box>
                  {cardErrors.expiry && (
                    <Text size="12px" color="red.500">{cardErrors.expiry}</Text>
                  )}
                </Box>

                <Box display="flex" flexDirection="column" flex={0.5} gridGap="8px">
                  <Box sx={{ ...stripeElementStyle, borderColor: cardErrors.cvc ? 'red.500' : input.borderColor }}>
                    <CardCvcElement
                      options={{
                        ...stripeElementOptions,
                        placeholder: t('cvc'),
                      }}
                      onChange={(e) => {
                        if (e.error) {
                          setCardErrors({ ...cardErrors, cvc: e.error.message });
                        } else {
                          setCardErrors({ ...cardErrors, cvc: null });
                        }
                      }}
                    />
                  </Box>
                  {cardErrors.cvc && (
                    <Text size="12px" color="red.500">{cardErrors.cvc}</Text>
                  )}
                </Box>
              </Box>
              <>
                {(isNotTrial || !priceIsNotNumber) ? (
                  <Flex justifyContent="space-between" flexDirection={{ base: 'column', md: 'row' }} mt="10px" gap="10px">
                    <Button
                      type="submit"
                      width="100%"
                      variant="default"
                      isLoading={isSubmittingPayment}
                      height="40px"
                      mt="0"
                      disabled={!stripe}
                    >
                      {buttonText || t('common:proceed-to-payment')}
                    </Button>
                    {onSaveCard && (
                      <Button
                        type="button"
                        width="100%"
                        variant="default"
                        height="40px"
                        mt="0"
                        onClick={handleSaveCard}
                        isLoading={isSubmittingCard && !isSubmittingPayment}
                        disabled={isSubmittingPayment}
                      >
                        {t('save-card-for-later')}
                      </Button>
                    )}
                  </Flex>
                ) : (
                  <Button
                    type="submit"
                    width="100%"
                    variant="outline"
                    borderColor="blue.200"
                    isLoading={isSubmittingPayment}
                    background={featuredBackground}
                    _hover={{ background: featuredBackground, opacity: 0.8 }}
                    _active={{ background: featuredBackground, opacity: 1 }}
                    color="blue.default"
                    height="40px"
                    mt="0"
                    disabled={!stripe}
                  >
                    {t('common:start-free-trial')}
                  </Button>
                )}
              </>
            </Form>
          )}
        </Formik>
        <Flex flexDirection="column" gridGap="1.5rem" margin="1.5rem 0 0 0" background={backgroundColor3} padding="1rem" borderRadius="6px">
          <Flex justifyContent="space-between" alignItems="center">
            <Flex gridGap="10px" alignItems="center">
              <Icon icon="padlock" width="20px" height="20px" color={hexColor.black} />
              <Text
                size="18px"
                letterSpacing="auto"
                dangerouslySetInnerHTML={{ __html: t('secure-checkout') }}
              />
            </Flex>
            <Image draggable={false} userSelect="none" src="/static/images/powered-by-stripe.png" width="auto" height="40px" objectFit="contain" />
          </Flex>
          <Divider />
          <Image draggable={false} userSelect="none" src="/static/images/payment-cards.png" width="100%" height="auto" objectFit="contain" />
        </Flex>
      </Box>
    </Box>
  );
}

CardFormContent.propTypes = {
  onSubmit: PropTypes.func,
  onSaveCard: PropTypes.func,
  modalCardErrorProps: PropTypes.shape({
    declinedModalProps: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
    }),
    openDeclinedModal: PropTypes.bool,
    setOpenDeclinedModal: PropTypes.func,
    setDeclinedModalProps: PropTypes.func,
    handleTryAgain: PropTypes.func,
    disableClose: PropTypes.bool,
    isSubmitting: PropTypes.bool,
  }),
  buttonText: PropTypes.string,
};
CardFormContent.defaultProps = {
  onSubmit: () => { },
  onSaveCard: null,
  buttonText: '',
  modalCardErrorProps: {},
};

function CardForm({ academyId, ...props }) {
  const { t, lang } = useTranslation('signup');
  const { state } = signupAction();
  const { selectedPlan } = state;
  const [stripePromise, setStripePromise] = useState(null);
  const [stripeReady, setStripeReady] = useState(false);

  const stripeAcademyId = academyId || selectedPlan?.owner?.id;

  useEffect(() => {
    if (!stripeAcademyId) {
      console.error('CardForm: academyId is required');
      return;
    }

    const loadStripeInstance = async () => {
      try {
        const stripe = getStripe(stripeAcademyId);
        setStripePromise(stripe);

        const stripeInstance = await stripe;
        if (stripeInstance) {
          setStripeReady(true);
        }
      } catch (error) {
        console.error('Error loading Stripe:', error);
      }
    };

    loadStripeInstance();
  }, [stripeAcademyId]);

  if (!stripeReady || !stripePromise) {
    return (
      <Text>{ t('payment-method-error') }</Text>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ locale: lang }}>
      <CardFormContent {...props} />
    </Elements>
  );
}

CardForm.propTypes = {
  academyId: PropTypes.number,
  onSubmit: PropTypes.func,
  onSaveCard: PropTypes.func,
  modalCardErrorProps: PropTypes.shape({
    declinedModalProps: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
    }),
    openDeclinedModal: PropTypes.bool,
    setOpenDeclinedModal: PropTypes.func,
    setDeclinedModalProps: PropTypes.func,
    handleTryAgain: PropTypes.func,
    disableClose: PropTypes.bool,
    isSubmitting: PropTypes.bool,
  }),
  buttonText: PropTypes.string,
};

CardForm.defaultProps = {
  academyId: null,
  onSubmit: () => { },
  onSaveCard: null,
  buttonText: '',
  modalCardErrorProps: {},
};

export default CardForm;
