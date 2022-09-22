import {
  Box, Button, Input,
} from '@chakra-ui/react';
import { useState } from 'react';
import getT from 'next-translate/getT';
import useTranslation from 'next-translate/useTranslation';
import { Form, Formik } from 'formik';
import Heading from '../common/components/Heading';
import Icon from '../common/components/Icon';
import Text from '../common/components/Text';
import PhoneInput from '../common/components/PhoneInput';
import validationSchemas from '../common/components/Forms/validationSchemas';
import FieldForm from '../common/components/Forms/FieldForm';

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
      // data: content,
    },
  };
};

const SignUp = () => {
  const { t } = useTranslation('signup');
  const [stepIndex, setStepIndex] = useState(0);
  const [dateProps, setDateProps] = useState(null);

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

  // console.log('formProps:::', formProps);

  return (
    <Box p="2.5rem 2rem">
      {/* Stepper */}
      <Box display="flex" gridGap="38px" justifyContent="center">
        <Box display="flex" gridGap="8px" alignItems="center" color={stepIndex !== 0 && 'gray.350'}>
          <Heading as="span" size="sm" p={stepIndex === 0 ? '3px 8px' : '2px 5px'} mr={stepIndex === 0 && '4px'} background={stepIndex === 0 && 'blue.default'} color={stepIndex === 0 && 'white'} borderRadius="3px" fontWeight="700">
            1.
          </Heading>
          <Heading size="sm" fontWeight={stepIndex === 0 ? '700' : '500'}>
            Contact information
          </Heading>
        </Box>
        <Box display="flex" gridGap="8px" alignItems="center" color={stepIndex !== 1 && 'gray.350'}>
          <Heading as="span" size="sm" p={stepIndex === 1 ? '3px 8px' : '2px 5px'} mr={stepIndex === 1 && '4px'} background={stepIndex === 1 && 'blue.default'} color={stepIndex === 1 && 'white'} borderRadius="3px" fontWeight="500">
            2.
          </Heading>
          <Heading size="sm" fontWeight={stepIndex === 1 ? '700' : '500'}>
            Choose your class
          </Heading>
        </Box>
        <Box display="flex" gridGap="8px" alignItems="center" color={stepIndex !== 2 && 'gray.350'}>
          <Heading as="span" size="sm" p={stepIndex === 2 ? '3px 8px' : '2px 5px'} mr={stepIndex === 2 && '4px'} background={stepIndex === 2 && 'blue.default'} color={stepIndex === 2 && 'white'} borderRadius="3px" fontWeight="500">
            3.
          </Heading>
          <Heading size="sm" fontWeight={stepIndex === 2 ? '700' : '500'}>
            Summary
          </Heading>
        </Box>
      </Box>
      {/* Form */}
      <Box display="flex" flexDirection="column" gridGap="20px" minHeight="320px" maxWidth={{ base: '100%', md: '740px' }} margin="3.5rem auto 0 auto">
        {stepIndex === 0 && (
          <>
            <Heading size="18px">
              About you
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
                    <Box display="flex" flex={0.5} flexDirection="column" fontSize="12px" color="blue.default2" lineHeight="24px">
                      <PhoneInput
                        inputStyle={{ height: '50px' }}
                        setVal={setFormProps}
                        placeholder={t('common:phone')}
                        formData={formProps}
                        errorMsg="Please specify a valid phone number"
                      />
                      We will contact you via phone call only if necessary.
                    </Box>
                  </Box>
                  <Box display="flex" gridGap="18px">
                    <Box display="flex" flex={0.5} flexDirection="column" fontSize="12px" color="blue.default2" lineHeight="24px">
                      <FieldForm
                        type="email"
                        name="email"
                        label={t('common:email')}
                        formProps={formProps}
                        setFormProps={setFormProps}
                      />

                      We will use it to give you access to your account.
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
                    Next Step
                  </Button>
                </Form>
              )}
            </Formik>
          </>
        )}
        {stepIndex === 1 && (
          <>
            <Heading size="18px">
              Give us your address to find your new class
            </Heading>
            <Box display="flex" gridGap="18px" alignItems="center" mt="10px">
              <Input type="text" placeholder="Where do you live?" height="50px" />
              <Button variant="default">
                Search dates
              </Button>
            </Box>
            <Box display="flex" flex={1} flexDirection="column" fontSize="12px" color="blue.default2" lineHeight="24px" mt="-15px" w="80%">
              We are not storing your address, but we will use this information to offer the best possible dates and schedules to study.
            </Box>
            <Heading size="18px" m="1rem 0 1rem 0">
              Available Dates
            </Heading>
            <Box display="flex" flexDirection="column" mb="2rem" gridGap="40px" p="0 1rem">
              {dates.map((date, i) => {
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
                      Choose date
                    </Button>
                  </Box>
                );
              })}
            </Box>
            <Box as="hr" width="100%" margin="10px 0" />
          </>
        )}
        {/* dateProps */}
        {stepIndex === 2 && (
          <Box display="flex" gridGap="30px" mb="1rem">
            <Box display="flex" flexDirection="column" flex={0.3} gridGap="3rem">
              <Box display="flex" flexDirection="column" gridGap="10px">
                <Heading size="18px" textTransform="uppercase">
                  Cohort Details
                </Heading>
                <Box as="hr" width="30%" margin="0 0 10px 0" h="1px" background="black" />
                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Text size="md" fontWeight="700">
                    Cohort Name
                  </Text>
                  <Text size="md" fontWeight="400" color="gray.600">
                    {dateProps?.title}
                  </Text>
                </Box>

                <Box as="hr" width="100%" margin="0 0" h="1px" borderColor="gray.default" />

                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Text size="md" fontWeight="700">
                    Start Date
                  </Text>
                  <Text size="md" fontWeight="400" color="gray.600">
                    {`${dateProps?.date} 2022`}
                  </Text>
                </Box>

                <Box as="hr" width="100%" margin="0 0" h="1px" borderColor="gray.default" />

                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Text size="md" fontWeight="700">
                    Days and hours
                  </Text>
                  <Text size="md" fontWeight="400" color="gray.600">
                    {dateProps?.availableDate}
                  </Text>
                  <Text size="md" fontWeight="400" color="gray.600">
                    {dateProps?.time}
                  </Text>
                  <Text size="md" fontWeight="400" color="gray.600">
                    {dateProps?.formatTime}
                  </Text>
                </Box>
              </Box>

              <Box display="flex" flexDirection="column" gridGap="10px">
                <Heading size="18px" textTransform="uppercase">
                  Profile Details
                </Heading>
                <Box as="hr" width="30%" margin="0 0 10px 0" h="1px" background="black" />
                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Text size="md" fontWeight="700">
                    Your name
                  </Text>
                  <Text size="md" fontWeight="400" color="gray.600">
                    {`${formProps?.firstName} ${formProps?.lastName}`}
                  </Text>
                </Box>
                <Box as="hr" width="100%" margin="0 0" h="1px" borderColor="gray.default" />
                <Box display="flex" flexDirection="row" gridGap="10px">
                  <Box display="flex" flexDirection="column" gridGap="10px">
                    <Text size="md" fontWeight="700">
                      Phone number
                    </Text>
                    <Text size="md" fontWeight="400" color="gray.600">
                      {formProps?.phone}
                    </Text>
                  </Box>
                  <Box display="flex" flexDirection="column" gridGap="10px">
                    <Text size="md" fontWeight="700">
                      Mail
                    </Text>
                    <Text size="md" fontWeight="400" color="gray.600">
                      {formProps?.email}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" flex={0.7} background="blue.light" w="100%" p="11px 14px" gridGap="12px" borderRadius="12px">
              <Heading size="15px" color="blue.default">
                You are signing up for
              </Heading>
              <Box display="flex" gridGap="12px">
                <Box display="flex" flexDirection="column">
                  <Box p="14px 12px" background="blue.default" borderRadius="7px" width="fit-content">
                    <Icon icon="code" width="38px" height="38px" color="#fff" />
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gridGap="7px">
                  <Heading size="18px">
                    data title
                  </Heading>
                  <Heading size="15px" textTransform="uppercase" color="gray.600">
                    selected props title
                  </Heading>
                </Box>
                <Heading size="sm" color="blue.default" textTransform="uppercase">
                  selected props price
                </Heading>

              </Box>
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
              Go Back
            </Button>

          )}
          {stepIndex !== 0 && stepIndex !== 2 && (
            <Button
              variant="default"
              onClick={() => {
                if (stepIndex !== 2) {
                  setStepIndex(stepIndex + 1);
                }
              }}
            >
              Next Step
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;
