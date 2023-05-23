import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  Box, Button, Flex, useToast,
} from '@chakra-ui/react';
import { useRef } from 'react';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
// import { phone } from '../../utils/regex';
import FieldForm from '../../common/components/Forms/FieldForm';
import PhoneInput from '../../common/components/PhoneInput';
import { getQueryString, setStorageItem } from '../../utils';
import NextChakraLink from '../../common/components/NextChakraLink';
import useStyle from '../../common/hooks/useStyle';
import useCustomToast from '../../common/hooks/useCustomToast';
import modifyEnv from '../../../modifyEnv';
import useSignup from '../../common/store/actions/signupAction';

function ContactInformation({
  courseChoosed,
  formProps, setFormProps,

}) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { t } = useTranslation('signup');
  const {
    state, nextStep,
  } = useSignup();
  const { stepIndex, dateProps, location } = state;
  const plan = getQueryString('plan');
  const planFormated = plan && encodeURIComponent(plan);
  const router = useRouter();
  const toast = useToast();
  const toastIdRef = useRef();
  const { backgroundColor, featuredColor } = useStyle();

  const { syllabus } = router.query;

  const { createToast } = useCustomToast({
    toastIdRef,
    status: 'info',
    title: t('alert-message.title'),
    content: (
      <Box>
        {t('alert-message.message1')}
        {' '}
        <NextChakraLink variant="default" color="blue.200" href="/">4Geeks.com</NextChakraLink>
        .
        <br />
        {t('alert-message.message2')}
        {' '}
        <NextChakraLink variant="default" color="blue.200" href="/login" redirectAfterLogin>{t('alert-message.click-here-to-login')}</NextChakraLink>
        {' '}
        {t('alert-message.or-click-here')}
        {' '}
        <NextChakraLink variant="default" color="blue.200" href="#">{t('alert-message.message3')}</NextChakraLink>
        .
      </Box>
    ),
  });

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
    phone: Yup.string(),
    // .matches(phone, t('validators.invalid-phone')),
    confirm_email: Yup.string()
      .oneOf([Yup.ref('email'), null], t('validators.confirm-email-not-match'))
      .required(t('validators.confirm-email-required')),
  });

  const handleSubmit = async (actions, allValues) => {
    const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(allValues),
    });
    const data = await resp.json();

    const respPlan = await bc.payment().getPlan(planFormated);
    const dataOfPlan = respPlan?.data;

    if (dataOfPlan?.has_waiting_list === true) {
      setStorageItem('subscriptionId', data.id);
      router.push('/thank-you');
    }

    if (resp.status < 400) {
      // setStorageItem('subscriptionId', data.id);

      if (data?.access_token) {
        router.push({
          query: {
            ...router.query,
            token: data.access_token,
          },
        });
        nextStep();
      }
      // else {
      //   router.push('/thank-you');
      // }
    }
    if (resp.status >= 400 && !data?.phone) {
      toast({
        title: t('alert-message:email-already-subscribed'),
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
    }
    if (resp.status >= 400 && data?.phone) {
      toast({
        title: data?.phone[0],
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
    }
    if (resp.status === 409) {
      createToast();
    }
    actions.setSubmitting(false);
  };

  return (
    <Box background={backgroundColor} p={{ base: '20px 22px', md: '26px 23px' }} height="100%" borderRadius="15px">
      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
          confirm_email: '',
        }}
        onSubmit={(values, actions) => {
          const allValues = {
            ...values,
            phone: values?.phone.includes('undefined') ? '' : values?.phone,
            course: courseChoosed,
            country: location?.country,
            cohort: dateProps?.id,
            syllabus,
            plan,
            city: location?.city,
            language: router.locale,
          };

          if (stepIndex !== 2) {
            handleSubmit(actions, allValues);
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
            <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }}>
              <Heading size="18px">{t('about-you')}</Heading>
              <Flex fontSize="13px" ml={{ base: '0', sm: '1rem' }} mt={{ base: '10px', sm: '0' }} width="fit-content" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
                {t('already-have-account')}
                {' '}
                <NextChakraLink href="/login" redirectAfterLogin fontSize="12px" variant="default">{t('login-here')}</NextChakraLink>
              </Flex>
            </Box>
            <Box display="flex" gridGap="18px" flexDirection={{ base: 'column', md: 'row' }}>
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
                  required={false}
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
    </Box>
  );
}

ContactInformation.propTypes = {
  courseChoosed: PropTypes.string,
  formProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setFormProps: PropTypes.func,
};

ContactInformation.defaultProps = {
  courseChoosed: '',
  setFormProps: () => {},
};

export default ContactInformation;
