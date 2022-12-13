import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
// import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  Box, Button, useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
// import { phone } from '../../utils/regex';
import FieldForm from '../../common/components/Forms/FieldForm';
// import NextChakraLink from '../../common/components/NextChakraLink';
// import useStyle from '../../common/hooks/useStyle';

const PaymentInfo = ({ paymentInfo, setPaymentInfo, handlePayment }) => {
  const { t } = useTranslation('signup');
  const toast = useToast();
  const [stateCard, setStateCard] = useState({
    card_number: 0,
    exp_month: 0,
    exp_year: 0,
    cvc: 0,
  });

  const infoValidation = Yup.object().shape({
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
    bc.payment().addCard2(values)
      .then((resp) => {
        if (resp) {
          handlePayment();
        }
      })
      .catch(() => {
        toast({
          title: t('alert-message:card-error'),
          description: t('alert-message:card-error-description'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      })
      .finally(() => actions.setSubmitting(false));
  };

  return (
    <>
      <Box display="flex">
        <Heading size="18px">{t('payment-info')}</Heading>
      </Box>

      <Formik
        initialValues={{
          card_number: '',
          exp: '',
          cvc: '',
        }}
        onSubmit={(values, actions) => {
          const expMonth = values.exp.split('/')[0];
          const expYear = values.exp.split('/')[1];
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
                name="card_number"
                externValue={paymentInfo.card_number}
                handleOnChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                  const newValue = value.replace(/(.{4})/g, '$1 ').trim();
                  e.target.value = newValue.slice(0, 19);
                  setPaymentInfo((prevState) => ({
                    ...prevState,
                    card_number: e.target.value,
                  }));
                  setStateCard({ ...stateCard, card_number: newValue.replaceAll(' ', '').slice(0, 16) });
                }}
                pattern="[0-9]*"
                label={t('card-number')}
              />
            </Box>
            <Box display="flex" gridGap="18px">
              <Box display="flex" gridGap="18px" flex={1}>
                <FieldForm
                  type="text"
                  name="exp"
                  externValue={paymentInfo.exp}
                  handleOnChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '').replace(/[^0-9 /]/g, '');
                    e.target.value = value.slice(0, 5);

                    if (e.target.value.length === 2) {
                      e.target.value += '/';
                    }

                    setPaymentInfo((prevState) => ({
                      ...prevState,
                      exp: e.target.value,
                    }));
                  }}
                  pattern="\d{2}/\d{2}"
                  label={t('expiration-date')}
                />
                <FieldForm
                  type="text"
                  name="cvc"
                  externValue={paymentInfo.cvc}
                  maxLength={3}
                  handleOnChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                    const newValue = value.replace(/(.{3})/g, '$1 ').trim();
                    e.target.value = newValue.slice(0, 3);
                    setPaymentInfo((prevState) => ({
                      ...prevState,
                      cvc: e.target.value,
                    }));
                  }}
                  pattern="[0-9]*"
                  label={t('cvc')}
                />
              </Box>
            </Box>
            <Button
              position="absolute"
              bottom="40px"
              width="fit-content"
              type="submit"
              variant="default"
              isLoading={isSubmitting}
              alignSelf="flex-end"
            >
              {t('next-step')}
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

PaymentInfo.propTypes = {
  paymentInfo: PropTypes.shape({
    card_number: PropTypes.string,
    exp: PropTypes.string,
    cvc: PropTypes.string,
  }),
  setPaymentInfo: PropTypes.func,
  handlePayment: PropTypes.func.isRequired,
};

PaymentInfo.defaultProps = {
  setPaymentInfo: () => {},
  paymentInfo: {
    card_number: '',
    exp: '',
    cvc: '',
  },
};

export default PaymentInfo;
