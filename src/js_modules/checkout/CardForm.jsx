/* eslint-disable no-unsafe-optional-chaining */
import { forwardRef, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, Divider, Flex, Image, Input, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import FieldForm from '../../common/components/Forms/FieldForm';
import useSignup from '../../common/store/actions/signupAction';
import 'react-datepicker/dist/react-datepicker.css';
import useStyle from '../../common/hooks/useStyle';
import ModalCardError from './ModalCardError';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';

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

function CardForm({ onSubmit, modalCardErrorProps }) {
  const { t } = useTranslation('signup');

  const {
    state, setPaymentInfo,
  } = useSignup();
  const { paymentInfo, checkoutData, selectedPlanCheckoutData, paymentStatus, isSubmittingCard, isSubmittingPayment } = state;
  const [stateCard, setStateCard] = useState({
    card_number: 0,
    exp_month: 0,
    exp_year: 0,
    cvc: 0,
  });

  const isPaymentSuccess = paymentStatus === 'success';
  const isPaymentIdle = paymentStatus === 'idle';
  const paymentStatusBgColor = isPaymentSuccess ? 'green.light' : '#ffefef';
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

  const { backgroundColor, hexColor, backgroundColor3 } = useStyle();
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

  return (
    <Box display="flex" flexDirection="column" gridGap="30px" position="relative">
      <ModalCardError
        isSubmitting={isSubmittingCard}
        {...modalCardErrorProps}
      />
      <Box display="flex" width={{ base: 'auto', lg: '490px' }} height="auto" flexDirection="column" minWidth={{ base: 'auto', md: '100%' }} background={!isPaymentIdle ? paymentStatusBgColor : backgroundColor} p={{ base: '20px 0', md: '30px 0' }} borderRadius="15px">
        <Formik
          initialValues={{
            owner_name: '',
            card_number: '',
            exp: '',
            cvc: '',
          }}
          onSubmit={(values, actions) => onSubmit(values, actions, stateCard)}
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
                      label={t('expiration-date')}
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
                  isLoading={isSubmittingPayment}
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
                  isLoading={isSubmittingPayment}
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
        {isPaymentIdle && (
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
        )}
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

CardForm.propTypes = {
  onSubmit: PropTypes.func,
  modalCardErrorProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
CardForm.defaultProps = {
  onSubmit: () => {},
  modalCardErrorProps: {},
};

export default CardForm;
