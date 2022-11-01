import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  Box, Button, Flex, useToast,
} from '@chakra-ui/react';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
import { phone } from '../../utils/regex';
import FieldForm from '../../common/components/Forms/FieldForm';
import PhoneInput from '../../common/components/PhoneInput';
import { setStorageItem } from '../../utils';
import NextChakraLink from '../../common/components/NextChakraLink';
import useStyle from '../../common/hooks/useStyle';

const ContactInformation = ({
  stepIndex, setStepIndex, courseChoosed, location, queryCohortIdExists, dateProps,
  formProps, setFormProps,

}) => {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const toast = useToast();
  const { featuredColor } = useStyle();

  const signupValidation = Yup.object().shape({
    first_name: Yup.string()
      .min(2, t('validators.short-input'))
      .max(50, t('validators.long-input'))
      .required(t('validators.first-name-required')),
    last_name: Yup.string()
      .min(2, t('validators.short-input'))
      .max(50, t('validators.long-input'))
      .required(t('validators.last-name-required')),
    email: Yup.string()
      .email(t('validators.invalid-email'))
      .required(t('validators.email-required')),
    phone: Yup.string()
      .matches(phone, t('validators.invalid-phone'))
      .required(t('validators.phone-required')),
    confirm_email: Yup.string()
      .oneOf([Yup.ref('email'), null], t('validators.confirm-email-not-match'))
      .required(t('validators.confirm-email-required')),
  });

  return (
    <>
      <Box display="flex">
        <Heading size="18px">{t('about-you')}</Heading>
        <Flex fontSize="13px" ml="1rem" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
          {t('already-have-account')}
          {' '}
          <NextChakraLink href="/login" redirectAfterLogin fontSize="12px" variant="default">{t('login-here')}</NextChakraLink>
        </Flex>
      </Box>

      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
          confirm_email: '',
        }}
        onSubmit={(values, actions) => {
          if (stepIndex !== 2) {
            const allValues = {
              ...values,
              course: courseChoosed,
              country: location?.country,
              city: location?.city,
              language: router.locale,
            };
            bc.auth()
              .subscribe(allValues)
              .then(({ data }) => {
                setStorageItem('subscriptionId', data.id);
                if (queryCohortIdExists && dateProps) {
                  setStepIndex(2);
                } else {
                  setStepIndex(stepIndex + 1);
                }
              })
              .catch(() => {
                toast({
                  title: t('alert-message:email-already-subscribed'),
                  status: 'warning',
                  duration: 6000,
                  isClosable: true,
                });
              })
              .finally(() => actions.setSubmitting(false));
          }
        }}
        validationSchema={signupValidation}
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
              <Box display="flex" gridGap="18px" flex={0.5}>
                <FieldForm
                  type="text"
                  name="first_name"
                  label={t('common:first-name')}
                  formProps={formProps}
                  setFormProps={setFormProps}
                />
                <FieldForm
                  type="text"
                  name="last_name"
                  label={t('common:last-name')}
                  formProps={formProps}
                  setFormProps={setFormProps}
                />
              </Box>
              <Box
                display="flex"
                flex={0.5}
                flexDirection="column"
                fontSize="12px"
                color="blue.default2"
                gridGap="4px"
              >
                <PhoneInput
                  inputStyle={{ height: '50px' }}
                  setVal={setFormProps}
                  placeholder={t('common:phone')}
                  formData={formProps}
                  sessionContextLocation={location}
                />
                {t('phone-info')}
              </Box>
            </Box>
            <Box display="flex" gridGap="18px">
              <Box
                display="flex"
                flex={0.5}
                flexDirection="column"
                fontSize="12px"
                gridGap="4px"
              >
                <FieldForm
                  type="email"
                  name="email"
                  label={t('common:email')}
                  formProps={formProps}
                  setFormProps={setFormProps}
                />
                <Box color="blue.default2">{t('email-info')}</Box>
              </Box>

              <FieldForm
                style={{ flex: 0.5 }}
                type="email"
                name="confirm_email"
                label={t('common:confirm-email')}
                formProps={formProps}
                setFormProps={setFormProps}
              />
            </Box>
            <Button
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

ContactInformation.propTypes = {
  stepIndex: PropTypes.number.isRequired,
  setStepIndex: PropTypes.func,
  courseChoosed: PropTypes.string.isRequired,
  location: PropTypes.objectOf(PropTypes.any),
  queryCohortIdExists: PropTypes.bool,
  dateProps: PropTypes.objectOf(PropTypes.any),
  formProps: PropTypes.objectOf(PropTypes.any).isRequired,
  setFormProps: PropTypes.func,
};

ContactInformation.defaultProps = {
  dateProps: {},
  setStepIndex: () => {},
  queryCohortIdExists: false,
  setFormProps: () => {},
  location: {},
};

export default ContactInformation;
