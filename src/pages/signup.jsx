/* eslint-disable camelcase */
import {
  Box,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import getT from 'next-translate/getT';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Heading from '../common/components/Heading';
import Icon from '../common/components/Icon';
import { getDataContentProps } from '../utils/file';
import bc from '../common/services/breathecode';
import useAuth from '../common/hooks/useAuth';
import ContactInformation from '../js_modules/signup/ContactInformation';
import ChooseYourClass from '../js_modules/signup/ChooseYourClass';
import { getTimeProps } from '../utils';
import Summary from '../js_modules/signup/Summary';
import mockData from '../common/utils/mockData/DashboardView';
import PaymentInfo from '../js_modules/signup/PaymentInfo';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'signup');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const finance = getDataContentProps(`public/locales/${locale}`, 'finance');
  const image = t('seo.image', {
    domain: process.env.WEBSITE_URL || 'https://4geeks.com',
  });
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
  const [checkoutData, setCheckoutData] = useState(null);
  const [location, setLocation] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({});
  const [loader, setLoader] = useState({
    date: false,
  });
  const { user, isLoading } = useAuth();

  const toast = useToast();

  const {
    course, plan, plan_id, cohort,
  } = router.query;
  const planChoosed = plan || plan_id || 'trial';
  const courseChoosed = course || 'coding-introduction';
  const courseTitle = finance[courseChoosed];
  const planProps = finance.plans.find((l) => l.type === planChoosed || l.type === 'trial');

  const [formProps, setFormProps] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    confirm_email: '',
  });

  const queryCohortIdExists = cohort !== undefined && cohort?.length > 0;
  const isFirstStep = stepIndex === 0; // Contact
  const isSecondStep = stepIndex === 1; // Choose your class
  const isThirdStep = stepIndex === 2; // Payment info
  const isFourthStep = stepIndex === 3; // Summary

  const handleChooseDate = (cohortData) => {
    setLoader((prev) => ({ ...prev, date: true }));
    const { kickoffDate, weekDays, availableTime } = getTimeProps(cohortData);

    bc.payment().checking({
      type: 'PREVIEW',
      cohort: cohortData.slug,
      academy: cohortData?.academy.id,
    })
      .then((response) => {
        if (response.status < 400) {
          setCheckoutData(response.data);
          setStepIndex(2);
        }
      })
      .catch(() => {
        toast({
          title: t('alert-message:something-went-wrong-choosing-date'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      })
      .finally(() => setLoader((prev) => ({ ...prev, date: false })));

    setDateProps({
      ...cohortData,
      kickoffDate,
      weekDays,
      availableTime,
    });

    // TODO: REMOVE WHEN FINISH
    setCheckoutData(mockData.checkoutProps);
    setStepIndex(2);
  };

  useEffect(async () => {
    if (queryCohortIdExists) {
      const resp = await bc.cohort().getPublic(cohort);

      if (resp.status >= 400) {
        toast({
          title: t('alert-message:cohort-not-found'),
          type: 'warning',
          duration: 4000,
          isClosable: true,
        });
      } else {
        handleChooseDate(resp.data);
        if (user && !isLoading) {
          setStepIndex(2);
        }
      }
    }
  }, [cohort, user]);

  useEffect(() => {
    if (user && !isLoading) {
    // if queryString token exists remove it from the url
      if (router.query.token) {
        router.replace(router.pathname, router.pathname, { shallow: true });
      }
      if (!queryCohortIdExists) setStepIndex(1);
      setFormProps({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: '',
      });
    }
  }, [user, cohort]);

  return (
    <Box p="2.5rem 2rem">
      {/* Stepper */}
      <Box display="flex" gridGap="38px" justifyContent="center">
        <Box
          display="flex"
          gridGap="8px"
          alignItems="center"
          color={stepIndex !== 0 && 'gray.350'}
        >
          {(isSecondStep || isThirdStep || isFourthStep) ? (
            <Icon icon="verified" width="30px" height="30px" />
          ) : (
            <Heading
              as="span"
              size="sm"
              p={isFirstStep ? '3px 8px' : '2px 5px'}
              mr={isFirstStep && '4px'}
              background={isFirstStep && 'blue.default'}
              color={isFirstStep && 'white'}
              borderRadius="3px"
              fontWeight="700"
            >
              1.
            </Heading>
          )}
          <Heading
            size="sm"
            fontWeight={isFirstStep ? '700' : '500'}
            color={(isSecondStep || isThirdStep || isFourthStep) && 'success'}
          >
            {t('contact-information')}
          </Heading>
        </Box>
        <Box
          display="flex"
          gridGap="8px"
          alignItems="center"
          color={stepIndex !== 1 && 'gray.350'}
        >
          {(isThirdStep || isFourthStep) ? (
            <Icon icon="verified" width="30px" height="30px" />
          ) : (
            <Heading
              as="span"
              size="sm"
              p={isSecondStep ? '3px 8px' : '2px 5px'}
              mr={isSecondStep && '4px'}
              background={isSecondStep && 'blue.default'}
              color={isSecondStep && 'white'}
              borderRadius="3px"
              fontWeight="500"
            >
              2.
            </Heading>
          )}
          <Heading
            size="sm"
            fontWeight={isSecondStep ? '700' : '500'}
            color={(isThirdStep || isFourthStep) && 'success'}
          >
            {t('choose-your-class')}
          </Heading>
        </Box>
        <Box
          display="flex"
          gridGap="8px"
          alignItems="center"
          color={stepIndex !== 2 && 'gray.350'}
        >
          {isFourthStep ? (
            <Icon icon="verified" width="30px" height="30px" />
          ) : (
            <Heading
              as="span"
              size="sm"
              p={isThirdStep ? '3px 8px' : '2px 5px'}
              mr={isThirdStep && '4px'}
              background={isThirdStep && 'blue.default'}
              color={isThirdStep && 'white'}
              borderRadius="3px"
              fontWeight="500"
            >
              3.
            </Heading>
          )}
          <Heading size="sm" fontWeight={isThirdStep ? '700' : '500'}>
            {t('payment-info')}
          </Heading>
        </Box>
        <Box
          display="flex"
          gridGap="8px"
          alignItems="center"
          color={stepIndex !== 3 && 'gray.350'}
        >
          <Heading
            as="span"
            size="sm"
            p={isFourthStep ? '3px 8px' : '2px 5px'}
            mr={isFourthStep && '4px'}
            background={isFourthStep && 'blue.default'}
            color={isFourthStep && 'white'}
            borderRadius="3px"
            fontWeight="500"
          >
            4.
          </Heading>
          <Heading size="sm" fontWeight={isFourthStep ? '700' : '500'}>
            {t('summary')}
          </Heading>
        </Box>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        gridGap="20px"
        minHeight="320px"
        maxWidth={{ base: '100%', md: '800px' }}
        margin="3.5rem auto 0 auto"
      >
        {isFirstStep && (
          <ContactInformation
            stepIndex={stepIndex}
            setStepIndex={setStepIndex}
            courseChoosed={courseChoosed}
            location={location}
            queryCohortIdExists={queryCohortIdExists}
            dateProps={dateProps}
            formProps={formProps}
            setFormProps={setFormProps}
          />
        )}
        <ChooseYourClass
          isSecondStep={isSecondStep}
          courseChoosed={courseChoosed}
          handleChooseDate={handleChooseDate}
          setLocation={setLocation}
          loader={loader}
        />
        {isThirdStep && (
          <PaymentInfo
            paymentInfo={paymentInfo}
            setPaymentInfo={setPaymentInfo}
            stepIndex={stepIndex}
            setStepIndex={setStepIndex}
          />
        )}
        {/* dateProps */}
        {isFourthStep && (
          <Summary
            dateProps={dateProps}
            checkoutData={checkoutData}
            formProps={formProps}
            courseTitle={courseTitle}
            planProps={planProps}
          />
        )}

        <Box display="flex" justifyContent="space-between" mt="auto">
          {stepIndex !== 0 && (
            <Button
              variant="outline"
              borderColor="currentColor"
              color="blue.default"
              disabled={queryCohortIdExists || isSecondStep}
              onClick={() => {
                if (stepIndex > 0) {
                  setStepIndex(stepIndex - 1);
                }
              }}
            >
              {t('go-back')}
            </Button>
          )}
          {stepIndex !== 0 && !isThirdStep && !isFourthStep && (
            <Button
              variant="default"
              disabled={dateProps === null}
              onClick={() => {
                setStepIndex(stepIndex + 1);
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
