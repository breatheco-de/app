import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box, Button, Checkbox, Flex, useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
// import { phone } from '../../utils/regex';
import FieldForm from '../../common/components/Forms/FieldForm';
import PhoneInput from '../../common/components/PhoneInput';
import { getQueryString, setStorageItem } from '../../utils';
import NextChakraLink from '../../common/components/NextChakraLink';
import useStyle from '../../common/hooks/useStyle';
import modifyEnv from '../../../modifyEnv';
import useSignup from '../../common/store/actions/signupAction';
import ModalInfo from '../moduleMap/modalInfo';
import Text from '../../common/components/Text';
import { SILENT_CODE } from '../../lib/types';

const ContactInformation = ({
  courseChoosed, formProps, setFormProps, setVerifyEmailProps,
}) => {
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
  const [showAlreadyMember, setShowAlreadyMember] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { backgroundColor, featuredColor } = useStyle();

  const { syllabus } = router.query;

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
    // confirm_email: Yup.string()
    //   .oneOf([Yup.ref('email'), null], t('validators.confirm-email-not-match'))
    //   .required(t('validators.confirm-email-required')),
  });

  const handleSubmit = async (actions, allValues) => {
    const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': router?.locale || 'en',
      },
      body: JSON.stringify(allValues),
    });
    const data = await resp.json();
    if (data.silent_code === SILENT_CODE.USER_EXISTS) {
      setShowAlreadyMember(true);
    }
    if (resp?.status >= 400) {
      toast({
        position: 'top',
        title: data?.detail,
        status: 'error',
        isClosable: true,
        duration: 6000,
      });
    }
    setStorageItem('subscriptionId', data?.id);

    const respPlan = await bc.payment().getPlan(planFormated);
    const dataOfPlan = respPlan?.data;
    if (resp.status < 400 && typeof data?.id === 'number') {
      if (dataOfPlan?.has_waiting_list === true) {
        setStorageItem('subscriptionId', data.id);
        router.push('/thank-you');
      }

      if (data?.access_token && !dataOfPlan?.has_waiting_list) {
        setVerifyEmailProps({
          data: {
            ...allValues,
            ...data,
          },
          state: true,
        });
        router.push({
          query: {
            ...router.query,
            token: data.access_token,
          },
        });
        nextStep();
      }
    }

    if (resp.status >= 400 && data?.phone) {
      toast({
        position: 'top',
        title: data?.phone[0],
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
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
          // confirm_email: '',
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
              gridGap: '62px',
            }}
          >
            <Box display="flex" flexDirection="column" maxWidth="430px" margin="0 auto" gridGap="22px">
              <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }}>
                <Heading size="18px">{t('about-you')}</Heading>
                <Flex fontSize="13px" ml={{ base: '0', sm: '1rem' }} mt={{ base: '10px', sm: '0' }} width="fit-content" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
                  {t('already-have-account')}
                  {' '}
                  <NextChakraLink href="/login" redirectAfterLogin fontSize="12px" variant="default">{t('login-here')}</NextChakraLink>
                </Flex>
              </Box>
              <Box display="flex" gridGap="18px" flexDirection={{ base: 'column', md: 'row' }}>
                <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} gridGap="18px" flex={1}>
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
              </Box>
              <Box
                display="flex"
                flex={1}
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
              <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} gridGap="18px">
                <Box
                  display="flex"
                  flex={1}
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
              </Box>
              <Checkbox size="md" spacing="8px" colorScheme="green" isChecked={isChecked} onChange={() => setIsChecked(!isChecked)}>
                <Text size="10px">
                  {t('validators.termns-and-conditions-required')}
                  {' '}
                  <NextChakraLink variant="default" fontSize="10px" href="/privacy-policy" target="_blank">
                    {t('common:privacy-policy')}
                  </NextChakraLink>
                  .
                </Text>
              </Checkbox>
            </Box>
            <Button
              width="fit-content"
              type="submit"
              variant="default"
              disabled={isChecked === false}
              isLoading={isSubmitting}
              alignSelf="flex-end"
            >
              {t('next-step')}
            </Button>
          </Form>
        )}
      </Formik>
      <ModalInfo
        isOpen={showAlreadyMember}
        headerStyles={{ textAlign: 'center' }}
        onClose={() => setShowAlreadyMember(false)}
        title={t('signup:alert-message.title')}
        childrenDescription={(
          <Box display="flex" flexDirection="column" alignItems="center" gridGap="17px">
            <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-7.png`} border="3px solid #0097CD" width="91px" height="91px" borderRadius="50px" />
            <Text
              size="14px"
              textAlign="center"
              dangerouslySetInnerHTML={{ __html: t('signup:alert-message.description') }}
            />
          </Box>
        )}
        closeButtonVariant="outline"
        closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
        buttonHandlerStyles={{ variant: 'default' }}
        actionHandler={() => {
          setStorageItem('redirect', router?.asPath);
          router.push('/login?tab=login');
          setShowAlreadyMember(false);
        }}
        handlerText={t('common:login')}
      />
    </Box>
  );
};

ContactInformation.propTypes = {
  courseChoosed: PropTypes.string,
  formProps: PropTypes.objectOf(PropTypes.any).isRequired,
  setFormProps: PropTypes.func,
  setVerifyEmailProps: PropTypes.func.isRequired,
};

ContactInformation.defaultProps = {
  courseChoosed: '',
  setFormProps: () => {},
};

export default ContactInformation;
