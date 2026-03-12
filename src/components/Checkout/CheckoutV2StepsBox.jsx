import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
} from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import signupAction from '../../store/actions/signupAction';
import useSignup from '../../hooks/useSignup';
import useSession from '../../hooks/useSession';
import useCustomToast from '../../hooks/useCustomToast';
import useStyle from '../../hooks/useStyle';
import axiosInstance from '../../axios';
import Text from '../Text';
import NextChakraLink from '../NextChakraLink';
import PhoneInput from '../PhoneInput';
import PaymentMethods from './PaymentMethods';
import bc from '../../services/breathecode';
import { BASE_PLAN, SILENT_CODE } from '../../utils/variables';
import { getQueryString } from '../../utils';

function CheckoutV2StepsBox({ courseChoosed, setShowPaymentDetails, setVerifyEmailProps }) {
  const { t, lang } = useTranslation('signup');
  const router = useRouter();
  const { userSession, location } = useSession();
  const { input } = useStyle();
  const { createToast } = useCustomToast({ toastId: 'checkout-v2-user-form' });
  const { state, handleStep } = signupAction();
  const { stepsEnum } = useSignup();
  const { stepIndex } = state;
  const [userData, setUserData] = useState(null);

  const isStepOneExpanded = stepIndex === stepsEnum.CONTACT;
  const isStepTwoExpanded = stepIndex >= stepsEnum.PAYMENT;

  const signupValidation = Yup.object().shape({
    first_name: Yup.string().min(2, t('validators.short-input')).required(t('validators.first-name-required')),
    last_name: Yup.string().min(2, t('validators.short-input')).required(t('validators.last-name-required')),
    email: Yup.string().email(t('validators.invalid-email')).required(t('validators.email-required')),
    phone: Yup.string().required(t('validators.invalid-phone')),
    accept_terms: Yup.boolean().oneOf([true], t('agree-terms-and-conditions')),
  });

  const handleContinue = async (values, actions) => {
    const plan = getQueryString('plan') || BASE_PLAN;
    const planFormated = plan ? encodeURIComponent(plan) : BASE_PLAN;
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      course: courseChoosed,
      country: location?.country,
      city: location?.city,
      syllabus: router.query?.syllabus,
      plan: planFormated,
      language: lang,
      has_marketing_consent: true,
      conversion_info: userSession,
    };

    try {
      const resp = await bc.auth().subscribe(payload);
      const { data } = resp;

      if (data?.silent_code === SILENT_CODE.USER_EXISTS) {
        createToast({
          status: 'info',
          title: t('already-have-account'),
          description: t('login-here'),
          position: 'top',
        });
        actions.setSubmitting(false);
        return;
      }

      if (resp.status >= 400 || !data?.access_token) {
        createToast({
          status: 'error',
          title: data?.detail || t('alert-message.error-signup'),
          position: 'top',
        });
        actions.setSubmitting(false);
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.access_token);
      }
      axiosInstance.defaults.headers.common.Authorization = `Token ${data.access_token}`;
      setVerifyEmailProps({
        data: {
          ...payload,
          ...data,
        },
        state: true,
      });

      setUserData(payload);
      handleStep(stepsEnum.PAYMENT);

      router.replace({
        query: {
          ...router.query,
          token: data.access_token,
        },
      }, undefined, {
        shallow: true,
        scroll: false,
      }).catch(() => {});
    } catch (error) {
      createToast({
        status: 'error',
        title: t('alert-message.error-signup'),
        position: 'top',
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <>
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="16px"
        overflow="hidden"
        width="100%"
        maxWidth="490px"
        mx={{ base: '10px', md: 'auto' }}
      >
        <Box borderBottom="1px solid" borderColor="gray.200">
          <Flex px="20px" py="14px" alignItems="center" gap="8px">
            <Box
              width="20px"
              height="20px"
              borderRadius="full"
              background={isStepOneExpanded ? 'blue.default' : 'gray.200'}
              color={isStepOneExpanded ? 'white' : 'gray.600'}
              fontSize="11px"
              fontWeight="700"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              1
            </Box>
            <Text size="18px" fontWeight={isStepOneExpanded ? '700' : '500'}>{t('about-you')}</Text>
          </Flex>
          <Collapse in={isStepOneExpanded} animateOpacity>
            <Box px="20px" pb="20px">
              <Formik
                initialValues={{
                  first_name: userData?.first_name || '',
                  last_name: userData?.last_name || '',
                  email: userData?.email || '',
                  phone: userData?.phone || '',
                  accept_terms: false,
                }}
                validationSchema={signupValidation}
                onSubmit={handleContinue}
              >
                {({
                  values, errors, touched, isSubmitting, handleChange, setFieldValue,
                }) => (
                  <Form>
                    <Flex direction={{ base: 'column', md: 'row' }} gap="12px">
                      <FormControl isInvalid={touched.first_name && errors.first_name}>
                        <Input
                          name="first_name"
                          value={values.first_name}
                          onChange={handleChange}
                          placeholder={t('common:first-name')}
                          height="50px"
                          borderColor={input.borderColor}
                          borderRadius="3px"
                          _placeholder={{ color: 'gray.400' }}
                        />
                        <FormErrorMessage>{errors.first_name}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={touched.last_name && errors.last_name}>
                        <Input
                          name="last_name"
                          value={values.last_name}
                          onChange={handleChange}
                          placeholder={t('common:last-name')}
                          height="50px"
                          borderColor={input.borderColor}
                          borderRadius="3px"
                          _placeholder={{ color: 'gray.400' }}
                        />
                        <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                      </FormControl>
                    </Flex>

                    <FormControl mt="12px" isInvalid={touched.phone && errors.phone}>
                      <Box
                        sx={{
                          '.react-tel-input .flag-dropdown': {
                            border: `1px solid ${input.borderColor} !important`,
                            borderRight: `1px solid ${input.borderColor} !important`,
                            borderTopLeftRadius: '3px',
                            borderBottomLeftRadius: '3px',
                            borderTopRightRadius: '0',
                            borderBottomRightRadius: '0',
                            backgroundColor: '#fff',
                          },
                          '.react-tel-input .selected-flag': {
                            border: `1px solid ${input.borderColor} !important`,
                            borderRight: `1px solid ${input.borderColor}`,
                            borderTopLeftRadius: '3px',
                            borderBottomLeftRadius: '3px',
                            boxSizing: 'border-box',
                            backgroundColor: '#fff',
                          },
                        }}
                      >
                        <PhoneInput
                          containerStyle={{ width: '100%' }}
                          inputStyle={{
                            width: '100%',
                            height: '50px',
                            borderColor: input.borderColor,
                            borderRadius: '3px',
                            paddingLeft: '62px',
                          }}
                          buttonStyle={{
                            width: '52px',
                            height: '50px',
                            margin: '0',
                            backgroundColor: '#fff',
                            border: `1px solid ${input.borderColor}`,
                            borderRight: `1px solid ${input.borderColor}`,
                            borderColor: input.borderColor,
                            borderTopLeftRadius: '3px',
                            borderBottomLeftRadius: '3px',
                            borderTopRightRadius: '0',
                            borderBottomRightRadius: '0',
                          }}
                          formData={values}
                          setVal={(nextForm) => {
                            setFieldValue('phone', nextForm?.phone || '');
                          }}
                          placeholder={t('common:phone')}
                          sessionContextLocation={location}
                        />
                      </Box>
                      <FormErrorMessage>{errors.phone}</FormErrorMessage>
                    </FormControl>

                    <FormControl mt="12px" isInvalid={touched.email && errors.email}>
                      <Input
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder={t('common:email')}
                        height="50px"
                        borderColor={input.borderColor}
                        borderRadius="3px"
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    <FormControl mt="14px" isInvalid={touched.accept_terms && errors.accept_terms}>
                      <Checkbox name="accept_terms" isChecked={values.accept_terms} onChange={handleChange}>
                        <Text size="10px">{t('validators.receive-information')}</Text>
                      </Checkbox>
                      <FormErrorMessage>{errors.accept_terms}</FormErrorMessage>
                    </FormControl>

                    <Text size="10px" mt="8px">
                      {t('agree-terms-and-conditions')}
                      {' '}
                      <NextChakraLink variant="default" fontSize="10px" href={t('common:terms-and-conditions-link')} target="_blank">
                        {t('common:terms-and-conditions')}
                      </NextChakraLink>
                      {' '}
                      {t('common:word-connector.and')}
                      {' '}
                      <NextChakraLink variant="default" fontSize="10px" href={t('common:privacy-policy-link')} target="_blank">
                        {t('common:privacy-policy')}
                      </NextChakraLink>
                      .
                    </Text>

                    <Button mt="14px" width="100%" type="submit" variant="default" isLoading={isSubmitting}>
                      {t('common:continue')}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Box>
          </Collapse>
        </Box>

        <Box>
          <Flex px="20px" py="14px" alignItems="center" gap="8px">
            <Box
              width="20px"
              height="20px"
              borderRadius="full"
              background={isStepTwoExpanded ? 'blue.default' : 'gray.200'}
              color={isStepTwoExpanded ? 'white' : 'gray.600'}
              fontSize="11px"
              fontWeight="700"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              2
            </Box>
            <Text size="18px" fontWeight={isStepTwoExpanded ? '700' : '500'}>{t('payment')}</Text>
          </Flex>
          <Collapse in={isStepTwoExpanded} animateOpacity>
            <Box px="20px" pb="20px">
              <PaymentMethods
                onPaymentSuccess={() => handleStep(stepsEnum.SUMMARY)}
                setShowPaymentDetails={setShowPaymentDetails}
                hideSectionTitle
              />
            </Box>
          </Collapse>
        </Box>
      </Box>
    </>
  );
}

CheckoutV2StepsBox.propTypes = {
  courseChoosed: PropTypes.string,
  setShowPaymentDetails: PropTypes.func,
  setVerifyEmailProps: PropTypes.func,
};

CheckoutV2StepsBox.defaultProps = {
  courseChoosed: '',
  setShowPaymentDetails: () => {},
  setVerifyEmailProps: () => {},
};

export default CheckoutV2StepsBox;
