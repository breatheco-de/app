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
import { toCapitalize, unSlugify } from '../../utils';

const Summary = ({
  formProps,
}) => {
  const { t } = useTranslation('signup');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [disableHandler, setDisableHandler] = useState(false);

  const {
    state, nextStep, setSelectedPlanCheckoutData, handleChecking, setPlanProps, handlePayment,
  } = useSignup();
  const { dateProps, checkoutData, selectedPlanCheckoutData, planProps } = state;
  const toast = useToast();

  const fontColor = useColorModeValue('gray.800', 'gray.300');
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');
  const borderColor2 = useColorModeValue('black', 'white');
  const { backgroundColor, borderColor } = useStyle();
  const router = useRouter();
  const { plan } = router.query;

  const existsAmountPerHalf = checkoutData?.amount_per_half > 0;
  const existsAmountPerMonth = checkoutData?.amount_per_month > 0;
  const existsAmountPerQuarter = checkoutData?.amount_per_quarter > 0;
  const existsAmountPerYear = checkoutData?.amount_per_year > 0;

  const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;

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

  useEffect(() => {
    const planFindedByQuery = checkoutData?.plans?.find((p) => p.slug === plan);
    if (planFindedByQuery || checkoutData?.plans[selectedIndex]) {
      // setPlanData(data[selectedIndex]);
      setSelectedPlanCheckoutData(planFindedByQuery || checkoutData?.plans[selectedIndex]);

      getPlanProps(planFindedByQuery || checkoutData?.plans[selectedIndex]);
    }
  }, [checkoutData?.plans]);

  const handleSubmit = () => {
    if (planProps?.length > 0) {
      handleChecking()
        .then((data) => {
          if (isNotTrial) {
            nextStep();
          } else {
            handlePayment(data);
          }
        })
        .catch(() => {
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
          <Box display="flex" gridGap="12px" alignItems="center">
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
            <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="0px">
              <Box display="flex" flexDirection="column" gridGap="7px">
                <Heading size="18px">
                  {/* {courseTitle} */}
                  {dateProps?.syllabus_version?.name || selectedPlanCheckoutData?.title}
                </Heading>

                {selectedPlanCheckoutData?.description && (
                  <Heading
                    size="15px"
                    textTransform="uppercase"
                    color={useColorModeValue('gray.500', 'gray.400')}
                  >
                    {selectedPlanCheckoutData?.description}
                  </Heading>
                )}
              </Box>
              <Heading
                size={selectedPlanCheckoutData?.price > 0 ? 'm' : 'xsm'}
                margin={{ base: '0', md: '0 26px 0 auto' }}
                color="blue.default"
                textTransform="uppercase"
                textAlign={{ base: 'start', md: 'end' }}
              >
                {/* {`$${selectedPlanCheckoutData?.price}`} */}
                {selectedPlanCheckoutData?.price > 0 ? `$${selectedPlanCheckoutData?.price}` : t('free-trial')}
              </Heading>
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
                return (
                  <Fragment key={`${item.slug}`}>
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
                      border={selectedPlanCheckoutData?.slug === item.slug ? '2px solid #0097CD' : '2px solid transparent'}
                      borderRadius="13px"
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        gridGap={{ base: '0', md: '4px' }}
                        minWidth={{ base: '100%', md: '288px' }}
                        height="fit-content"
                        fontWeight="400"
                      >
                        <Box fontSize="18px" fontWeight="700">
                          {title}
                        </Box>
                        <Text
                          size="md"
                          fontWeight="500"
                          mb="6px"
                          // dangerouslySetInnerHTML={{
                          //   __html: item?.description,
                          // }}
                          dangerouslySetInnerHTML={{
                            __html: item?.description,
                          }}
                        />
                      </Box>
                      <Box display="flex" alignItems="center" gridGap="10px">
                        <Heading
                          as="span"
                          size={item?.price > 0 ? 'm' : 'xsm'}
                          lineHeight="1"
                          textTransform="uppercase"
                          color="blue.default"
                        >
                          {item?.price > 0 ? `$${item?.price}` : t('free-trial')}
                        </Heading>
                      </Box>
                    </Box>
                  </Fragment>
                );
              })}
          </Box>
        </Box>
        {isNotTrial ? (
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
            {t('common:start-free-trial')}
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
