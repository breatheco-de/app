/* eslint-disable no-restricted-globals */
import { Box, Button, useColorModeValue, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Fragment, useState, useEffect } from 'react';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useStyle from '../../common/hooks/useStyle';
import useSignup from '../../common/store/actions/signupAction';
import bc from '../../common/services/breathecode';
import { getQueryString, toCapitalize, unSlugify } from '../../utils';

const Summary = ({
  formProps,
}) => {
  const { t } = useTranslation('signup');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [disableHandler, setDisableHandler] = useState(false);

  const {
    state, nextStep, setSelectedPlanCheckoutData, handleChecking, setPlanProps, handlePayment, getPaymentText,
  } = useSignup();
  const { dateProps, checkoutData, selectedPlanCheckoutData, planProps } = state;
  const toast = useToast();

  const fontColor = useColorModeValue('gray.800', 'gray.300');
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');
  const borderColor2 = useColorModeValue('black', 'white');
  const { backgroundColor, borderColor, lightColor } = useStyle();
  const router = useRouter();
  const planId = getQueryString('plan_id');

  const isNotTrial = !['FREE', 'TRIAL'].includes(selectedPlanCheckoutData?.type);

  const periodText = {
    FREE: t('info.free'),
    WEEK: t('info.trial-week'),
    MONTH: t('info.monthly'),
    YEAR: t('info.yearly'),
    FINANCING: t('info.financing'),
  };

  const getPlanProps = (selectedPlan) => {
    bc.payment().getPlanProps(encodeURIComponent(selectedPlan.slug))
      .then((resp) => {
        if (!resp) {
          setDisableHandler(true);
        } else {
          setDisableHandler(false);
          setPlanProps(resp.data);
        }
      })
      .catch(() => {
        setDisableHandler(true);
      });
  };
  const getPrice = () => {
    if (isNotTrial) {
      if (selectedPlanCheckoutData?.financing_options?.length > 0 && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0) return selectedPlanCheckoutData?.financing_options[0]?.monthly_price;
      if (checkoutData?.amount_per_half > 0) return checkoutData?.amount_per_half;
      if (checkoutData?.amount_per_month > 0) return checkoutData?.amount_per_month;
      if (checkoutData?.amount_per_quarter > 0) return checkoutData?.amount_per_quarter;
      if (checkoutData?.amount_per_year > 0) return checkoutData?.amount_per_year;
    }
    return t('free-trial');
  };

  const priceIsNotNumber = Number.isNaN(Number(getPrice()));

  useEffect(() => {
    if (planId?.length > 0) {
      const findPlan = checkoutData?.plans?.find((plan) => plan.plan_id === planId);
      setSelectedPlanCheckoutData(findPlan);
      getPlanProps(findPlan);
    }

    if (!planId && checkoutData?.plans[selectedIndex]) {
      setSelectedPlanCheckoutData(checkoutData?.plans[selectedIndex]);

      getPlanProps(checkoutData?.plans[selectedIndex]);
    }
  }, [checkoutData?.plans]);

  const handleSubmit = () => {
    if (planProps?.length > 0) {
      handleChecking({
        plan: selectedPlanCheckoutData?.slug,
      })
        .then((data) => {
          if (isNotTrial || !priceIsNotNumber) {
            nextStep();
          } else {
            handlePayment({
              ...data,
              installments: selectedPlanCheckoutData?.how_many_months,
            })
              .catch(() => {
                toast({
                  title: t('alert-message:payment-error'),
                  status: 'error',
                  duration: 7000,
                  isClosable: true,
                });
              });
          }
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: 'Something went wrong choosing plan',
            status: 'error',
            duration: 6000,
            isClosable: true,
          });
        });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      gridGap="30px"
      mb="1rem"
    >
      <Box display="flex" flexDirection="column" flex={0.5} gridGap="3rem">
        <Box display="flex" flexDirection="column" gridGap="10px">
          <Heading size="18px" textTransform="uppercase">
            {t('cohort-details')}
          </Heading>
          <Box
            as="hr"
            width="30%"
            margin="0 0 10px 0"
            h="1px"
            borderColor={borderColor2}
          />
          <Box display="flex" flexDirection="column" gridGap="10px">
            <Text size="md" fontWeight="700">
              {t('cohort-name')}
            </Text>
            <Text size="md" fontWeight="400" color={fontColor} textTransform="capitalize">
              {dateProps?.name}
              <Text size="sm" fontWeight="700" textTransform="capitalize" color={fontColor}>
                {dateProps?.syllabus_version?.name}
              </Text>
            </Text>
          </Box>

          <Box
            as="hr"
            width="100%"
            margin="0 0"
            h="1px"
            borderColor={borderColor}
          />

          <Box display="flex" flexDirection="column" gridGap="10px">
            <Text size="md" fontWeight="700">
              {t('start-date')}
            </Text>
            <Text size="md" fontWeight="400" color={fontColor}>
              {dateProps?.kickoffDate[router.locale]}
            </Text>
          </Box>

          <Box
            as="hr"
            width="100%"
            margin="0 0"
            h="1px"
            borderColor={borderColor}
          />

          <Box display="flex" flexDirection="column" gridGap="10px">
            {dateProps?.weekDays[router.locale].length > 0 && (
              <>
                <Text size="md" fontWeight="700">
                  {t('days-and-hours')}
                </Text>
                <Text size="md" fontWeight="400" color={fontColor}>
                  {dateProps?.weekDays[router.locale].map(
                    // eslint-disable-next-line no-nested-ternary
                    (day, i) => `${i !== 0 ? i < dateProps?.weekDays[router.locale].length - 1 ? ',' : ` ${t('common:and')}` : ''} ${day}`,
                  )}
                </Text>
              </>
            )}
            <Text size="md" fontWeight="400" color={fontColor}>
              {dateProps?.availableTime}
            </Text>
            <Text size="md" fontWeight="400" color={fontColor}>
              {/* {dateProps?.formatTime} */}
              {dateProps?.timezone}
            </Text>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" gridGap="10px">
          <Heading size="18px" textTransform="uppercase">
            {t('profile-details')}
          </Heading>
          <Box
            as="hr"
            width="30%"
            margin="0 0 10px 0"
            h="1px"
            borderColor={borderColor2}
          />
          <Box display="flex" flexDirection="column" gridGap="10px">
            <Text size="md" fontWeight="700">
              {t('your-name')}
            </Text>
            <Text size="md" fontWeight="400" color={fontColor}>
              {`${formProps?.first_name} ${formProps?.last_name}`}
            </Text>
          </Box>
          <Box
            as="hr"
            width="100%"
            margin="0 0"
            h="1px"
            borderColor={borderColor}
          />
          <Box display="flex" flexDirection="row" gridGap="10px">
            {formProps?.phone && (
              <Box display="flex" flexDirection="column" gridGap="10px">
                <Text size="md" fontWeight="700">
                  {t('phone-number')}
                </Text>
                <Text size="md" fontWeight="400" color={fontColor}>
                  {formProps?.phone}
                </Text>
              </Box>
            )}
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
      <Box display="flex" flexDirection="column" flex={0.5}>
        <Box
          display="flex"
          flexDirection="column"
          background={featuredBackground}
          w="100%"
          height="fit-content"
          p="11px 14px"
          gridGap="12px"
          borderRadius="14px"
        >
          <Heading size="15px" color="blue.default" textTransform="uppercase">
            {t('signing-for')}
          </Heading>
          <Box display="flex" gridGap="12px">
            <Box display="flex" flexDirection="column">
              <Box
                p="16px"
                background="blue.default"
                borderRadius="7px"
                width="fit-content"
              >
                <Icon icon="coding" width="48px" height="48px" color="#fff" />
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" gridGap="7px">
              <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="0px" alignItems="center">
                <Box display="flex" width={{ base: '100%', md: '' }} flexDirection="column" gridGap="7px">
                  <Heading size="18px">
                    {dateProps?.syllabus_version?.name || selectedPlanCheckoutData?.title}
                  </Heading>
                </Box>
                <Heading
                  size={selectedPlanCheckoutData?.price > 0 ? 'm' : 'xsm'}
                  margin={{ base: '0', md: '0 26px 0 auto' }}
                  color="blue.default"
                  textAlign={{ base: 'start', md: 'end' }}
                  width="100%"
                >
                  {selectedPlanCheckoutData?.price <= 0
                    ? selectedPlanCheckoutData?.priceText
                    : `$${selectedPlanCheckoutData?.price}`}
                </Heading>
              </Box>
              {getPaymentText()?.length > 0 && (
                <Text
                  size="14px"
                  color={useColorModeValue('gray.700', 'gray.400')}
                >
                  {getPaymentText()}
                </Text>
              )}
            </Box>
          </Box>
          <Box
            as="hr"
            width="100%"
            margin="0"
            h="1px"
            borderColor={borderColor}
          />
          {planProps?.length > 0 && (
            <Box fontSize="14px" fontWeight="700" color="blue.default">
              {t('what-you-will-get')}
            </Box>
          )}
          <Box
            as="ul"
            style={{ listStyle: 'none' }}
            display="flex"
            flexDirection="column"
            gridGap="12px"
          >
            {planProps?.length > 0 && planProps?.map((bullet) => (
              <Box
                as="li"
                key={bullet?.features[0]?.description}
                display="flex"
                flexDirection="row"
                lineHeight="24px"
                gridGap="8px"
              >
                <Icon
                  icon="checked2"
                  color="#38A56A"
                  width="13px"
                  height="10px"
                  style={{ margin: '8px 0 0 0' }}
                />
                <Box
                  fontSize="14px"
                  fontWeight="600"
                  letterSpacing="0.05em"
                  dangerouslySetInnerHTML={{ __html: bullet?.description }}
                />
                {bullet?.features[0]?.description}
              </Box>
            ))}
          </Box>
        </Box>
        <Box background={backgroundColor} pt="22px">
          <Heading
            size="xsm"
            p="0 0 12px 0"
          >
            {t('select-payment-plan')}
          </Heading>
          <Box display="flex" flexDirection="column" gridGap="10px">
            {/* {cohortPlans */}
            {checkoutData?.plans
              .filter((l) => l.status === 'ACTIVE')
              .map((item, i) => {
                const title = item?.title ? item?.title : toCapitalize(unSlugify(String(item?.slug)));
                const isSelected = selectedPlanCheckoutData?.period !== 'FINANCING'
                  ? selectedPlanCheckoutData?.period === item?.period
                  : selectedPlanCheckoutData?.financingId === item?.financingId;
                return (
                  <Fragment key={`${item?.slug}-${item?.title}`}>
                    <Box
                      display="flex"
                      onClick={() => {
                        setSelectedIndex(i);
                        // setPlanData(item);
                        getPlanProps(item);
                        setSelectedPlanCheckoutData(item);
                      }}
                      flexDirection={{ base: 'column', md: 'row' }}
                      width="100%"
                      justifyContent="space-between"
                      // p={selectedIndex === i ? '22px 18px' : '26px 22px'}
                      p={{ base: '8px 14px', md: '22px 18px' }}
                      gridGap={{ base: '0', md: '12px' }}
                      cursor="pointer"
                      // background={selectedIndex !== i && featuredColor}
                      border={isSelected ? '2px solid #0097CD' : '2px solid transparent'}
                      borderRadius="13px"
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        gridGap={{ base: '0', md: '4px' }}
                        minWidth={{ base: '100%', md: '228px' }}
                        height="fit-content"
                        fontWeight="400"
                      >
                        <Box fontSize="18px" fontWeight="700">
                          {title}
                        </Box>
                        <Text fontSize="14px" color={isSelected ? 'blue.default' : lightColor} fontWeight={isSelected ? 700 : 400}>
                          {periodText[item?.period] || t('info.trial')}
                        </Text>
                      </Box>
                      <Box display="flex" minWidth="90px" alignItems="center" gridGap="10px">
                        <Heading
                          as="span"
                          size={(item?.period !== 'FINANCING' && !['FREE', 'TRIAL'].includes(item?.type)) ? 'm' : 'xsm'}
                          lineHeight="1"
                          color="blue.default"
                          width="100%"
                          textAlign="end"
                        >
                          {item?.priceText}
                        </Heading>
                      </Box>
                    </Box>
                  </Fragment>
                );
              })}
          </Box>
        </Box>
        {(isNotTrial || !priceIsNotNumber) ? (
          <Button
            variant="default"
            onClick={handleSubmit}
            isDisabled={disableHandler}
            height="45px"
            mt="12px"
          >
            {t('common:proceed-to-payment')}
          </Button>
        ) : (
          <Button
            variant="outline"
            borderColor="blue.200"
            onClick={handleSubmit}
            isDisabled={disableHandler}
            background={featuredBackground}
            _hover={{ background: featuredBackground, opacity: 0.8 }}
            _active={{ background: featuredBackground, opacity: 1 }}
            color="blue.default"
            height="45px"
            mt="12px"
          >
            {selectedPlanCheckoutData?.type === 'FREE' ? t('start-free-course') : t('common:start-free-trial')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

Summary.propTypes = {
  formProps: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Summary;
