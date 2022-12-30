import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, Input, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
import FieldForm from '../../common/components/Forms/FieldForm';
import useSignup from '../../common/store/actions/signupAction';
import Icon from '../../common/components/Icon';
import 'react-datepicker/dist/react-datepicker.css';
import useStyle from '../../common/hooks/useStyle';
import DatePickerField from '../../common/components/Forms/DateField';
import { number2DIgits } from '../../utils';

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

const PaymentInfo = () => {
  const { t } = useTranslation('signup');
  const toast = useToast();

  const {
    state, setPaymentInfo, handlePayment,
  } = useSignup();
  const { paymentInfo, checkoutData, planProps, dateProps, selectedPlanCheckoutData } = state;
  const [stateCard, setStateCard] = useState({
    card_number: 0,
    exp_month: 0,
    exp_year: 0,
    cvc: 0,
  });

  const isNotTrial = !checkoutData?.isTrial;

  const { borderColor, fontColor } = useStyle();
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');

  const infoValidation = Yup.object().shape({
    owner_name: Yup.string()
      .min(6)
      .required(t('validators.owner_name-required')),
    card_number: Yup.string()
      .min(16)
      .max(20)
      .required(t('validators.card_number-required')),
    exp: Yup.string()
      .min(4)
      .required(t('validators.exp-required')),
    cvc: Yup.string()
      .min(3)
      .max(3)
      .required(t('validators.cvc-required')),
  });

  const handleSubmit = (actions, values) => {
    bc.payment().addCard(values)
      .then((resp) => {
        if (resp) {
          handlePayment()
            .finally(() => actions.setSubmitting(false));
        }
      })
      .catch(() => {
        actions.setSubmitting(false);
        toast({
          title: t('alert-message:card-error'),
          description: t('alert-message:card-error-description'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  };

  return (
    <>
      <Box display="flex" gridGap="35px" flexDirection={{ base: 'column-reverse', md: 'row' }} position="relative">
        <Box display="flex" flexDirection="column" flex={0.5}>
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
              const expMonth = number2DIgits(values.exp?.getMonth() + 1);
              const expYear = number2DIgits(values.exp?.getFullYear() - 2000);

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
            {({ isSubmitting }) => (
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
                      <DatePickerField
                        type="text"
                        name="exp"
                        wrapperClassName="datePicker"
                        onChange={(date) => {
                          setPaymentInfo('exp', date);
                        }}
                        customInput={<CustomDateInput />}
                        dateFormat="MM/yy"
                        showMonthYearPicker
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
                        const newValue = value.replace(/(.{3})/g, '$1 ').trim();
                        e.target.value = newValue.slice(0, 3);

                        setPaymentInfo('cvc', e.target.value);
                      }}
                      pattern="[0-9]*"
                      label={t('cvc')}
                    />
                  </Box>
                </Box>
                <Box position="absolute" bottom="-100px" right="0">
                  {isNotTrial && (
                    <Button
                      type="submit"
                      variant="default"
                      isLoading={isSubmitting}
                      height="40px"
                      mt="0"
                    >
                      {t('common:proceed-to-payment')}
                    </Button>
                  )}
                  {!isNotTrial && (
                    <Button
                      type="submit"
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
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          flex={0.5}
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
              margin="0 26px 0 auto"
              color="blue.default"
              textTransform="uppercase"
              textAlign="end"
            >
              {selectedPlanCheckoutData?.price > 0 ? `$${selectedPlanCheckoutData?.price}` : t('free-trial')}
            </Heading>
          </Box>
          <Box
            as="hr"
            width="100%"
            margin="0"
            h="1px"
            borderColor={borderColor}
          />
          {planProps?.length > 0 && (
            <Box fontSize="14px" fontWeight="700" color="blue.default">
              {t('what-you-will-get')}
            </Box>
          )}
          <Box
            as="ul"
            style={{ listStyle: 'none' }}
            display="flex"
            flexDirection="column"
            gridGap="12px"
          >
            {planProps?.length > 0 && planProps?.map((bullet) => (
              <>
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
              </>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

CustomDateInput.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
};
CustomDateInput.defaultProps = {
  value: '',
  onClick: () => {},
};

export default PaymentInfo;
