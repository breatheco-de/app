import {
  Box, Button, Input, useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import getT from 'next-translate/getT';
import useTranslation from 'next-translate/useTranslation';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Heading from '../common/components/Heading';
import Icon from '../common/components/Icon';
import Text from '../common/components/Text';
import PhoneInput from '../common/components/PhoneInput';
import validationSchemas from '../common/components/Forms/validationSchemas';
import FieldForm from '../common/components/Forms/FieldForm';
import { getDataContentProps } from '../utils/file';
import bc from '../common/services/breathecode';

const dates = [
  {
    title: 'Coding introduction',
    date: 'Sept 19th',
    availableDate: 'Mon/Tue/Fri',
    time: '20:00 - 22:00',
    formatTime: '(UTC-05:00) Eastern Time (US & Canada)',
  },
  {
    title: 'Coding introduction',
    date: 'Sept 19th',
    availableDate: 'Mon/Tue/Fri',
    time: '20:00 - 22:00',
    formatTime: '(UTC-05:00) Eastern Time (US & Canada)',
  },
  {
    title: 'Coding introduction',
    date: 'Sept 19th',
    availableDate: 'Mon/Tue/Fri',
    time: '20:00 - 22:00',
    formatTime: '(UTC-05:00) Eastern Time (US & Canada)',
  },
];

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'signup');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const finance = getDataContentProps(
    `public/locales/${locale}`,
    'finance',
  );
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const ogUrl = {
    en: '/signup',
    us: '/signup',
  };

  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        locales,
        locale,
        image,
        url: ogUrl.en || `/${locale}/signup`,
        pathConnector: '/signup',
        keywords,
      },
      fallback: false,
      finance,
      // data: content,
    },
  };
};

const SignUp = ({ finance }) => {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [dateProps, setDateProps] = useState(null);
  const [coords, setCoords] = useState(null);
  const [availableDates, setAvailableDates] = useState(null);
  const GOOGLE_KEY = 'AIzaSyB6NEbEyhDU_U1z_XoyRwEu0Rc1XXeZK6c';

  const fontColor = useColorModeValue('gray.800', 'gray.300');
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');
  const borderColor = useColorModeValue('black', 'white');

  const { course, plan } = router.query;
  const planChoosed = plan || 'trial';
  const courseChoosed = course || 'coding-introduction';
  const courseTitle = finance[courseChoosed];
  const planProps = finance.plans.find((l) => l.type === planChoosed);

  const [formProps, setFormProps] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    confirmEmail: '',
  });

  const handleChooseDate = (date) => {
    setDateProps(date);
    setStepIndex(2);
  };

  useEffect(async () => {
    console.log('Calculating nearest location...');
    const response = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    );
    const data = (await response.json()) || null;
    if (data && data.location) {
      setCoords({
        latitude: data.location.lat,
        longitude: data.location.lng,
      });
    }
  }, []);

  useEffect(() => {
    if (coords !== null) {
      // coordinates=<latitude>,<longitude>&saas=true&course=<course_slug>&upcoming=true
      bc.public({
        coordinates: `${coords.latitude}, ${coords.longitude}`,
        saas: true,
        course: courseChoosed,
        upcoming: true,
      }).cohorts()
        .then(({ data }) => setAvailableDates({ data }))
        .catch((error) => console.log('Cohorts error:', error));
    }
  }, []);

  const isFirstStep = stepIndex === 0;
  const isSecondStep = stepIndex === 1;
  const isThirdStep = stepIndex === 2;

  return (
    <Box p="2.5rem 2rem">
      {/* Stepper */}
      <Box display="flex" gridGap="38px" justifyContent="center">
        <Box display="flex" gridGap="8px" alignItems="center" color={stepIndex !== 0 && 'gray.350'}>
          {(isSecondStep || isThirdStep) ? (
            <Icon icon="verified" width="30px" height="30px" />
          ) : (
            <Heading as="span" size="sm" p={isFirstStep ? '3px 8px' : '2px 5px'} mr={isFirstStep && '4px'} background={isFirstStep && 'blue.default'} color={isFirstStep && 'white'} borderRadius="3px" fontWeight="700">
              1.
            </Heading>
          )}
          <Heading size="sm" fontWeight={isFirstStep ? '700' : '500'} color={(isSecondStep || isThirdStep) && 'success'}>
            {t('contact-information')}
          </Heading>
        </Box>
        <Box display="flex" gridGap="8px" alignItems="center" color={stepIndex !== 1 && 'gray.350'}>
          {(isThirdStep) ? (
            <Icon icon="verified" width="30px" height="30px" />
          ) : (
            <Heading as="span" size="sm" p={isSecondStep ? '3px 8px' : '2px 5px'} mr={isSecondStep && '4px'} background={isSecondStep && 'blue.default'} color={isSecondStep && 'white'} borderRadius="3px" fontWeight="500">
              2.
            </Heading>
          )}
          <Heading size="sm" fontWeight={isSecondStep ? '700' : '500'} color={isThirdStep && 'success'}>
            {t('choose-your-class')}
          </Heading>
        </Box>
        <Box display="flex" gridGap="8px" alignItems="center" color={stepIndex !== 2 && 'gray.350'}>
          <Heading as="span" size="sm" p={isThirdStep ? '3px 8px' : '2px 5px'} mr={isThirdStep && '4px'} background={isThirdStep && 'blue.default'} color={isThirdStep && 'white'} borderRadius="3px" fontWeight="500">
            3.
          </Heading>
          <Heading size="sm" fontWeight={isThirdStep ? '700' : '500'}>
            {t('summary')}
          </Heading>
        </Box>
      </Box>
      {/* Form */}
      <Box display="flex" flexDirection="column" gridGap="20px" minHeight="320px" maxWidth={{ base: '100%', md: '800px' }} margin="3.5rem auto 0 auto">
        {isFirstStep && (
          <>
            <Heading size="18px">
              {t('about-you')}
            </Heading>

            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                confirmEmail: '',
              }}
              onSubmit={(values, actions) => {
                if (stepIndex !== 2) {
                  setTimeout(() => {
                    actions.setSubmitting(false);
                    setStepIndex(stepIndex + 1);
                  }, 300);
                }
              }}
              validationSchema={validationSchemas.signup}
            >
              {({ isSubmitting }) => (
                <Form style={{ display: 'flex', flexDirection: 'column', gridGap: '22px' }}>
                  <Box display="flex" gridGap="18px">
                    <Box display="flex" gridGap="18px" flex={0.5}>
                      <FieldForm
                        type="text"
                        name="firstName"
                        label={t('common:first-name')}
                        formProps={formProps}
                        setFormProps={setFormProps}
                      />
                      <FieldForm
                        type="text"
                        name="lastName"
                        label={t('common:last-name')}
                        formProps={formProps}
                        setFormProps={setFormProps}
                      />
                    </Box>
                    <Box display="flex" flex={0.5} flexDirection="column" fontSize="12px" color="blue.default2" gridGap="4px">
                      <PhoneInput
                        inputStyle={{ height: '50px' }}
                        setVal={setFormProps}
                        placeholder={t('common:phone')}
                        formData={formProps}
                        errorMsg="Please specify a valid phone number"
                      />
                      {t('phone-info')}
                    </Box>
                  </Box>
                  <Box display="flex" gridGap="18px">
                    <Box display="flex" flex={0.5} flexDirection="column" fontSize="12px" color="blue.default2" gridGap="4px">
                      <FieldForm
                        type="email"
                        name="email"
                        label={t('common:email')}
                        formProps={formProps}
                        setFormProps={setFormProps}
                      />

                      {t('email-info')}
                    </Box>

                    <FieldForm
                      style={{ flex: 0.5 }}
                      type="email"
                      name="confirmEmail"
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
        )}
        {isSecondStep && (
          <>
            <Heading size="18px">
              {t('your-address')}
            </Heading>
            <Box display="flex" gridGap="18px" alignItems="center" mt="10px">
              <Input type="text" placeholder="Where do you live?" height="50px" />
              <Button variant="default">
                {t('search-dates')}
              </Button>
            </Box>
            <Box display="flex" flex={1} flexDirection="column" fontSize="12px" color="blue.default2" mt="-12px" w="80%">
              {t('addres-info')}
            </Box>
            <Heading size="18px" m="1rem 0 1rem 0">
              {t('available-dates')}
            </Heading>
            <Box display="flex" flexDirection="column" mb="2rem" gridGap="40px" p="0 1rem">
              {(availableDates || dates).map((date, i) => {
                const dateIndex = i;

                return (
                  <Box display="flex" gridGap="30px" key={dateIndex}>
                    <Text size="18px" flex={0.35}>
                      {date.title}
                    </Text>
                    <Box display="flex" flexDirection="column" gridGap="5px" flex={0.2}>
                      <Text size="18px">
                        {date.date}
                      </Text>
                      <Text size="14px" color="gray.default">
                        {date.availableDate}
                      </Text>
                    </Box>
                    <Box display="flex" flexDirection="column" gridGap="5px" flex={0.3}>
                      <Text size="18px">
                        {date.time}
                      </Text>
                      <Text size="14px" color="gray.default">
                        {date.formatTime}
                      </Text>
                    </Box>
                    <Button variant="outline" onClick={() => handleChooseDate(date)} borderColor="currentColor" color="blue.default" flex={0.15}>
                      {t('choose-date')}
                    </Button>
                  </Box>
                );
              })}
            </Box>
            <Box as="hr" width="100%" margin="10px 0" />
          </>
        )}
        {/* dateProps */}
        {isThirdStep && (
          <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="30px" mb="1rem">
            <Box display="flex" flexDirection="column" flex={0.5} gridGap="3rem">
              <Box display="flex" flexDirection="column" gridGap="10px">
                <Heading size="18px" textTransform="uppercase">
                  {t('cohort-details')}
                </Heading>
                <Box as="hr" width="30%" margin="0 0 10px 0" h="1px" borderColor={borderColor} />
                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Text size="md" fontWeight="700">
                    {t('cohort-name')}
                  </Text>
                  <Text size="md" fontWeight="400" color={fontColor}>
                    {dateProps?.title}
                  </Text>
                </Box>

                <Box as="hr" width="100%" margin="0 0" h="1px" borderColor="gray.default" />

                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Text size="md" fontWeight="700">
                    {t('start-date')}
                  </Text>
                  <Text size="md" fontWeight="400" color={fontColor}>
                    {`${dateProps?.date} 2022`}
                  </Text>
                </Box>

                <Box as="hr" width="100%" margin="0 0" h="1px" borderColor="gray.default" />

                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Text size="md" fontWeight="700">
                    {t('days-and-hours')}
                  </Text>
                  <Text size="md" fontWeight="400" color={fontColor}>
                    {dateProps?.availableDate}
                  </Text>
                  <Text size="md" fontWeight="400" color={fontColor}>
                    {dateProps?.time}
                  </Text>
                  <Text size="md" fontWeight="400" color={fontColor}>
                    {dateProps?.formatTime}
                  </Text>
                </Box>
              </Box>

              <Box display="flex" flexDirection="column" gridGap="10px">
                <Heading size="18px" textTransform="uppercase">
                  {t('profile-details')}
                </Heading>
                <Box as="hr" width="30%" margin="0 0 10px 0" h="1px" borderColor={borderColor} />
                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Text size="md" fontWeight="700">
                    {t('your-name')}
                  </Text>
                  <Text size="md" fontWeight="400" color={fontColor}>
                    {`${formProps?.firstName} ${formProps?.lastName}`}
                  </Text>
                </Box>
                <Box as="hr" width="100%" margin="0 0" h="1px" borderColor="gray.default" />
                <Box display="flex" flexDirection="row" gridGap="10px">
                  <Box display="flex" flexDirection="column" gridGap="10px">
                    <Text size="md" fontWeight="700">
                      {t('phone-number')}
                    </Text>
                    <Text size="md" fontWeight="400" color={fontColor}>
                      {formProps?.phone}
                    </Text>
                  </Box>
                  <Box display="flex" flexDirection="column" gridGap="10px">
                    <Text size="md" fontWeight="700">
                      {t('email')}
                    </Text>
                    <Text size="md" fontWeight="400" color={fontColor}>
                      {formProps?.email}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" flex={0.6}>
              <Box display="flex" flexDirection="column" background={featuredBackground} w="100%" height="fit-content" p="11px 14px" gridGap="12px" borderRadius="14px">
                <Heading size="15px" color="blue.default" textTransform="uppercase">
                  {t('signing-for')}
                </Heading>
                <Box display="flex" gridGap="12px">
                  <Box display="flex" flexDirection="column">
                    <Box p="16px" background="blue.default" borderRadius="7px" width="fit-content">
                      <Icon icon="coding" width="48px" height="48px" color="#fff" />
                    </Box>
                  </Box>
                  <Box display="flex" flexDirection="column" gridGap="7px">
                    <Heading size="18px">
                      {courseTitle}
                    </Heading>
                    {planProps?.payment && (
                      <Heading size="15px" textTransform="uppercase" color={useColorModeValue('gray.500', 'gray.400')}>
                        {planProps?.payment}
                      </Heading>
                    )}
                  </Box>
                  {planProps?.price && (
                    <Heading size="sm" color="blue.default" textTransform="uppercase" textAlign="end">
                      {planProps?.price}
                    </Heading>
                  )}

                </Box>
                <Box as="hr" width="100%" margin="0" h="1px" borderColor={borderColor} />
                {planProps?.bullets?.title && (
                  <Box fontSize="14px" fontWeight="700" color="blue.default">
                    {planProps?.bullets?.title}
                  </Box>
                )}
                <Box as="ul" style={{ listStyle: 'none' }} display="flex" flexDirection="column" gridGap="12px">
                  {planProps?.bullets?.list?.map((bullet) => (
                    <Box as="li" key={bullet?.title} display="flex" flexDirection="row" lineHeight="24px" gridGap="8px">
                      <Icon icon="checked2" color="#38A56A" width="13px" height="10px" style={{ margin: '8px 0 0 0' }} />
                      <Box
                        fontSize="14px"
                        fontWeight="600"
                        letterSpacing="0.05em"
                        dangerouslySetInnerHTML={{ __html: bullet?.title }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
              {!planProps.type.includes('trial') && (
                <Button variant="default" height="45px" mt="12px">
                  Proceed to payment
                </Button>
              )}
              {planProps.type.includes('trial') && (
                <Button variant="outline" borderColor="blue.200" background={featuredBackground} _hover={{ background: featuredBackground, opacity: 0.8 }} _active={{ background: featuredBackground, opacity: 1 }} color="blue.default" height="45px" mt="12px">
                  Start free trial
                </Button>
              )}
            </Box>
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" mt="auto">
          {stepIndex !== 0 && (
            <Button
              variant="outline"
              borderColor="currentColor"
              color="blue.default"
              onClick={() => {
                if (stepIndex > 0) {
                  setStepIndex(stepIndex - 1);
                }
              }}
            >
              {t('go-back')}
            </Button>

          )}
          {stepIndex !== 0 && stepIndex !== 2 && (
            <Button
              variant="default"
              disabled={dateProps === null}
              onClick={() => {
                if (stepIndex !== 2) {
                  setStepIndex(stepIndex + 1);
                }
              }}
            >
              {t('next-step')}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

SignUp.propTypes = {
  finance: PropTypes.objectOf(PropTypes.any),
};

SignUp.defaultProps = {
  finance: {},
};

export default SignUp;
