import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Avatar, Box, Button, Checkbox, Flex, useToast } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Heading from '../Heading';
import NextChakraLink from '../NextChakraLink';
import FieldForm from './FieldForm';
import PhoneInput from '../PhoneInput';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import useSession from '../../hooks/useSession';
import { BASE_PLAN, BREATHECODE_HOST } from '../../../utils/variables';
import { SILENT_CODE } from '../../../lib/types';
import { setStorageItem } from '../../../utils';
import { startSignup, typeError } from '../../handlers/signup';
import ModalInfo from '../../../js_modules/moduleMap/modalInfo';
import useSubscribeToPlan from '../../hooks/useSubscribeToPlan';
import { generatePlan } from '../../handlers/subscriptions';

function SignupView({ planSlug, onClose, onSubscribed, onWaitingList, externalLoginLink, containerGap }) {
  const { userSession } = useSession();
  const { t, lang } = useTranslation('signup');
  const { featuredColor } = useStyle();
  const [isChecked, setIsChecked] = useState(false);
  const { handleSubscribeToPlan } = useSubscribeToPlan({ enableRedirectOnCTA: false, onClose });
  const [showAlreadyMember, setShowAlreadyMember] = useState(false);
  const [formProps, setFormProps] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    confirm_email: '',
  });
  const toast = useToast();
  const router = useRouter();

  const defaultPlanSlug = planSlug || BASE_PLAN;
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
  });

  const handleSubmit = async (actions, allValues) => {
    const data = await startSignup({ ...allValues, conversion_info: userSession }, lang);

    if (data?.access_token) {
      handleSubscribeToPlan({
        slug: defaultPlanSlug,
        accessToken: data?.access_token,
        onSubscribedToPlan: (generatedPlan) => {
          onSubscribed(generatedPlan);
        },
      })
        .finally(() => {
          actions.setSubmitting(false);
        });

      router.push({
        query: {
          token: data.access_token,
        },
      });
    } else {
      generatePlan(defaultPlanSlug)
        .then((generatedPlan) => {
          onWaitingList(generatedPlan);
        });
      actions.setSubmitting(false);
    }

    if (data.silent_code === SILENT_CODE.USER_EXISTS) {
      setShowAlreadyMember(true);
    }
    if (data.error_type === typeError.common) {
      toast({
        position: 'top',
        title: data?.detail,
        status: 'error',
        isClosable: true,
        duration: 6000,
      });
    }
    setStorageItem('subscriptionId', data?.id);

    if (data.error_type === typeError.phone) {
      toast({
        position: 'top',
        title: data?.phone[0],
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
    }
    // handleSubmit(actions, allValues);
  };

  return (
    <>
      {/* {successModal} */}
      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
        }}
        onSubmit={(values, actions) => {
          const allValues = {
            ...values,
            phone: values?.phone.includes('undefined') ? '' : values?.phone,
            plan: defaultPlanSlug,
          };
          handleSubmit(actions, allValues);
        }}
        validationSchema={signupValidation}
      >
        {({ isSubmitting }) => (
          <Form
            style={{
              display: 'flex',
              flexDirection: 'column',
              gridGap: containerGap,
            }}
          >
            <Box display="flex" flexDirection="column" maxWidth="430px" margin="0 auto" gridGap="24px">
              <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} justifyContent="space-between">
                <Heading size="21px">{t('about-you')}</Heading>
                <Flex fontSize="13px" ml={{ base: '0', sm: '1rem' }} mt={{ base: '10px', sm: '0' }} width="fit-content" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
                  {t('already-have-account')}
                  {' '}
                  {externalLoginLink || (
                    <NextChakraLink href="/login" redirectAfterLogin fontSize="13px" variant="default">{t('login-here')}</NextChakraLink>
                  )}
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
              width="100%"
              type="submit"
              variant="default"
              isDisabled={isChecked === false}
              isLoading={isSubmitting}
              alignSelf="flex-end"
            >
              {t('create-account')}
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
          router.push('/login');
          setShowAlreadyMember(false);
        }}
        handlerText={t('common:login')}
      />
    </>

  );
}

SignupView.propTypes = {
  onClose: PropTypes.func,
  planSlug: PropTypes.string,
  onWaitingList: PropTypes.func,
  onSubscribed: PropTypes.func,
  externalLoginLink: PropTypes.node,
  containerGap: PropTypes.string,
};
SignupView.defaultProps = {
  onClose: () => {},
  planSlug: '',
  onWaitingList: () => {},
  onSubscribed: () => {},
  externalLoginLink: null,
  containerGap: '24px',
};

export default SignupView;
