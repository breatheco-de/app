import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  Avatar,
  Tooltip,
  Box, Button, Checkbox, Flex, Image, Skeleton, useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
// import { phone } from '../../utils/regex';
import FieldForm from '../../common/components/Forms/FieldForm';
import PhoneInput from '../../common/components/PhoneInput';
import { getQueryString, getStorageItem, setStorageItem, slugToTitle } from '../../utils';
import NextChakraLink from '../../common/components/NextChakraLink';
import useStyle from '../../common/hooks/useStyle';
import useSession from '../../common/hooks/useSession';
import modifyEnv from '../../../modifyEnv';
import useSignup from '../../common/store/actions/signupAction';
import ModalInfo from '../moduleMap/modalInfo';
import Text from '../../common/components/Text';
import { SILENT_CODE } from '../../lib/types';
import Icon from '../../common/components/Icon';
import { reportDatalayer } from '../../utils/requests';

function ContactInformation({
  courseChoosed, defaultPlanData, formProps, setFormProps, setVerifyEmailProps,
}) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { t } = useTranslation('signup');
  const { userSession } = useSession();
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
  const { backgroundColor, featuredColor, hexColor } = useStyle();
  const redirectStorage = getStorageItem('redirect');
  const redirectStorageAlreadyExists = typeof redirectStorage === 'string' && redirectStorage.length > 0;

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

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_contact_info',
      },
    });
  }, []);

  const handleSubmit = async (actions, allValues) => {
    const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': router?.locale || 'en',
      },
      body: JSON.stringify({ ...allValues, conversion_info: userSession }),
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
    } else {
      reportDatalayer({
        dataLayer: {
          event: 'sign_up',
          method: 'native',
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          plan: planFormated,
          user_id: data.user,
          course: allValues.course,
          country: allValues.country,
          city: data.city,
          syllabus: allValues.syllabus,
          cohort: allValues.cohort,
          conversion_info: userSession,
        },
      });
    }
    setStorageItem('subscriptionId', data?.id);

    const respPlan = await bc.payment().getPlan(planFormated);
    const dataOfPlan = respPlan?.data;
    if (resp.status < 400 && typeof data?.id === 'number') {
      if (dataOfPlan?.has_waiting_list === true || data?.status === 'WAITING_LIST') {
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
    <Box display="flex" height="100%" maxWidth="1336px" width="100%" margin={{ base: 'inherit', md: '1rem auto 1rem auto', '2xl': '4rem auto 4rem auto' }}>
      <Box display="flex" gridGap="10px" height="100%" width="100%">
        <Box background={featuredColor} p={{ base: '0', md: '26px 23px' }} flex={{ base: 1, md: 0.5 }} borderRadius="15px">
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
                  gridGap: '24px',
                  padding: '24px',
                  backgroundColor: hexColor.backgroundColor,
                  width: 'fit-content',
                  margin: '3rem auto',
                }}
              >
                <Box display="flex" flexDirection="column" maxWidth="430px" margin="0 auto" gridGap="22px">
                  <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }}>
                    <Heading size="18px">{t('about-you')}</Heading>
                    <Flex fontSize="13px" ml={{ base: '0', sm: '1rem' }} mt={{ base: '10px', sm: '0' }} width="fit-content" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
                      {t('already-have-account')}
                      {' '}
                      <NextChakraLink href="/login" redirectAfterLogin={!redirectStorageAlreadyExists} fontSize="12px" variant="default">{t('login-here')}</NextChakraLink>
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
        </Box>

        <Flex display={{ base: 'none', md: 'flex' }} flexDirection="column" alignItems="center" flex={0.5} position="relative">
          <Flex flexDirection="column" width="400px" justifyContent="center" height="100%" zIndex={10}>
            {defaultPlanData?.title ? (
              <Flex alignItems="start" flexDirection="column" gridGap="10px" padding="25px" borderRadius="11px" background={backgroundColor}>
                <Heading size="26px">
                  {t('checkout.title')}
                </Heading>
                <Text size="16px">
                  {t('checkout.description')}
                  {' '}
                  <NextChakraLink textDecoration="underline" href={t('checkout.read-more-link')} target="_blank">
                    {t('checkout.read-more')}
                  </NextChakraLink>
                </Text>
                {/* <Text size="16px" color="blue.default">
                  {t('what-includes')}
                </Text> */}
                <Flex flexDirection="column" gridGap="12px" mt="1rem">
                  {defaultPlanData?.featured_info?.length > 0
                    && defaultPlanData?.featured_info.map((info) => info?.service?.slug && (
                      <Box display="flex" gridGap="8px" alignItems="center">
                        {info?.service?.icon_url
                          ? <Image src={info.service.icon_url} width={16} height={16} style={{ objectFit: 'cover' }} alt="Icon for service item" margin="5px 0 0 0" />
                          : (
                            <Icon icon="checked2" color={hexColor.blueDefault} width="16px" height="16px" margin="5px 0 0 0" />
                          )}
                        <Box>
                          <Text size="16px" fontWeight={700} textAlign="left">
                            {info?.service?.title || slugToTitle(info?.service?.slug)}
                          </Text>
                          {/* {info.features.length > 0 && (
                            <Text size="14px" textAlign="left">
                              {info.features[0]?.description}
                            </Text>
                          )} */}
                        </Box>
                        <Tooltip label={info.features[0]?.description} placement="top">
                          <Box>
                            <Icon icon="help" width="15px" height="15px" style={{ alignItems: 'center' }} />
                          </Box>
                        </Tooltip>
                      </Box>
                    ))}
                </Flex>
              </Flex>
            ) : (
              <Skeleton height="270px" width="400px" borderRadius="11px" zIndex={10} opacity={1} />
            )}
          </Flex>
          <Image
            position="absolute"
            top={0}
            left={0}
            src="/static/images/happy-meeting-3.webp"
            alt="Get Access"
            height="631px"
            style={{ objectFit: 'cover' }}
            // margin={withoutSpacing && '2rem 0 0 0'}
            borderBottomLeftRadius="6px"
          />
        </Flex>
      </Box>
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
    </Box>
  );
}

ContactInformation.propTypes = {
  courseChoosed: PropTypes.string,
  formProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setFormProps: PropTypes.func,
  setVerifyEmailProps: PropTypes.func.isRequired,
  defaultPlanData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ContactInformation.defaultProps = {
  courseChoosed: '',
  setFormProps: () => {},
  defaultPlanData: {},
};

export default ContactInformation;
