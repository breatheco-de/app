/* eslint-disable camelcase */
import {
  Box,
  Button,
  Img,
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
import { isWindow, getStorageItem, getTimeProps, removeURLParameter } from '../utils';
import Summary from '../js_modules/signup/Summary';
import PaymentInfo from '../js_modules/signup/PaymentInfo';
import useSignup from '../common/store/actions/signupAction';
import axiosInstance from '../axios';

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
    },
  };
};

const SignUp = ({ finance }) => {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const [isPreloading, setIsPreloading] = useState(false);
  const {
    state, nextStep, prevStep, handleStep, setDateProps, handleChecking, setCohortPlans,
    isFirstStep, isSecondStep, isThirdStep, isFourthStep,
  } = useSignup();

  axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;

  const { stepIndex, dateProps, checkoutData } = state;

  const accessToken = getStorageItem('accessToken');
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

  useEffect(async () => {
    if (!dateProps?.id && queryCohortIdExists) {
      // const resp = await bc.cohort().getPublic(cohort); // returns object
      const resp = await bc.public({ id: cohort }).cohorts(); // returns array of objects

      if (resp && resp.status >= 400) {
        toast({
          title: t('alert-message:cohort-not-found'),
          type: 'warning',
          duration: 4000,
          isClosable: true,
        });
      }

      if (resp.status < 400) {
        const { kickoffDate, weekDays, availableTime } = getTimeProps(resp.data[0]);
        setDateProps({
          ...resp.data[0],
          kickoffDate,
          weekDays,
          availableTime,
        });
      }
    }
  }, [cohort, user?.id, accessToken]);

  useEffect(() => {
    if (dateProps?.id && accessToken && queryCohortIdExists) {
      setIsPreloading(true);
      bc.payment({
        cohort,
      }).getCohortPlans()
        .then(({ data }) => {
          if (data.length > 0) {
            setCohortPlans(data);
            handleChecking({ ...dateProps, plan: data[0].slug })
              .then(() => {
                handleStep(2);
                setTimeout(() => {
                  setIsPreloading(false);
                }, 650);
              });
          } else {
            setIsPreloading(false);
            handleStep(1);
            toast({
              title: t('alert-message:cohort-not-found'),
              type: 'warning',
              duration: 4000,
              isClosable: true,
            });
          }
        });
    }
  }, [dateProps?.id, accessToken, router?.locale]);

  useEffect(() => {
    if (user?.id && !isLoading) {
      // if queryString token exists clean it from the url
      if (router.query.token) {
        const cleanTokenQuery = isWindow && removeURLParameter(window.location.href, 'token');
        router.push(cleanTokenQuery);
      }
      if (!queryCohortIdExists) handleStep(1);
      setFormProps({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: '',
      });
    }
  }, [user?.id, cohort]);

  return (
    <Box p={{ base: '2.5rem 1rem', md: '2.5rem 2rem' }} position="relative" minHeight={isPreloading ? '727px' : null}>
      {isPreloading && (
        <Box display="flex" alignItems="center" position="absolute" background="white" justifyContent="center" width="100%" height="100%" style={{ zIndex: 50 }} top="0px" left="0px">
          <Img
            src="/4Geeks.ico"
            width="35px"
            height="35px"
            position="absolute"
            mt="6px"
            zIndex="40"
            boxShadow="0px 0px 16px 0px #0097cd"
            borderRadius="40px"
          />
          <Box className="loader" />
        </Box>
      )}
      {/* Stepper */}
      <Box display="flex" gridGap="38px" justifyContent="center" overflow="auto">
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

        {/* {!isPreview && (
        )} */}
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
          <Heading
            size="sm"
            fontWeight={isThirdStep ? '700' : '500'}
            color={(isFourthStep) && 'success'}
          >
            {t('summary')}
            {/* {t('payment')} */}
          </Heading>
        </Box>

        <Box
          display={checkoutData?.isTrial ? 'none' : 'flex'}
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
            {/* {!isPreview ? '4.' : '3.'} */}
            4.
          </Heading>
          <Heading size="sm" fontWeight={isFourthStep ? '700' : '500'}>
            {t('payment')}
          </Heading>
        </Box>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        gridGap={{ base: '60px', md: '20px' }}
        minHeight="320px"
        maxWidth={{ base: '100%', md: '800px' }}
        margin="3.5rem auto 0 auto"
        padding="0 10px"
      >
        {isFirstStep && (
          <ContactInformation
            courseChoosed={courseChoosed}
            formProps={formProps}
            setFormProps={setFormProps}
          />
        )}

        {/* Second step */}
        <ChooseYourClass courseChoosed={courseChoosed} />

        {isThirdStep && (
          <Summary
            formProps={formProps}
            courseTitle={courseTitle}
            planProps={planProps}
          />
        )}
        {/* Fourth step */}
        {isFourthStep && (
          <PaymentInfo />
        )}

        <Box display="flex" justifyContent="space-between" mt="auto">
          {stepIndex !== 0 && (
            <Button
              variant="outline"
              borderColor="currentColor"
              color="blue.default"
              disabled={(queryCohortIdExists && !isFourthStep) || isSecondStep}
              onClick={() => {
                if (stepIndex > 0) {
                  prevStep();
                }
              }}
            >
              {t('go-back')}
            </Button>
          )}
          {stepIndex !== 0 && !isSecondStep && !isThirdStep && !isFourthStep && (
            <Button
              variant="default"
              disabled={dateProps === null}
              onClick={() => {
                nextStep();
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
