import { Box, Divider, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useStyle from '../../common/hooks/useStyle';

function Stepper({ stepIndex, selectedPlanCheckoutData, isFreeTier, hideIndexList, isFirstStep, isSecondStep, isThirdStep, isFourthStep, handleGoBack }) {
  const { t } = useTranslation('signup');
  const { fontColor, disabledColor2 } = useStyle();
  const maxItemsCount = typeof isFreeTier === 'boolean' && !isFreeTier ? 4 : 3;
  const totalCountListBasedInHidenList = maxItemsCount - hideIndexList.length;
  const position = stepIndex > totalCountListBasedInHidenList ? totalCountListBasedInHidenList : stepIndex;

  return (
    <>
      <Box display={{ base: 'none', md: 'flex' }} maxWidth="490px" justifyContent="space-between" margin="2rem auto 0 auto" id="container-stepper" width="100%" gridGap="38px" overflowY="hidden" overflowX="auto">
        {!hideIndexList.includes(0) && (
          <Box
            display="flex"
            gridGap="10px"
            alignItems="center"
            color={stepIndex !== 0 && 'gray.350'}
          >
            {(isSecondStep || isThirdStep || isFourthStep) && (
              <Icon icon="verified" width="18px" height="30px" />
            )}
            <Heading
              size="14px"
              fontWeight={isFirstStep ? '700' : '500'}
              color={(isSecondStep || isThirdStep || isFourthStep) && 'success'}
            >
              {t('contact-information')}
            </Heading>
          </Box>
        )}

        {/* {!hideIndexList.includes(1) && (
          <Box
            display="flex"
            gridGap="10px"
            alignItems="center"
            color={stepIndex !== 1 && 'gray.350'}
          >
            {(isThirdStep || isFourthStep) && (
              <Icon icon="verified" width="18px" height="30px" />
            )}
            <Heading
              size="14px"
              fontWeight={isSecondStep ? '700' : '500'}
              color={(isThirdStep || isFourthStep) && 'success'}
            >
              {t('choose-your-class')}
            </Heading>
          </Box>
        )} */}

        {!hideIndexList.includes(2) && (
          <Box
            display={typeof isFreeTier === 'boolean' && isFreeTier ? 'flex' : 'none'}
            gridGap="10px"
            alignItems="center"
            color={stepIndex !== 2 && 'gray.350'}
          >
            {(isFourthStep || selectedPlanCheckoutData?.payment_success) && (
              <Icon icon="verified" width="18px" height="30px" />
            )}
            <Heading
              size="14px"
              fontWeight={isThirdStep ? '700' : '500'}
              color={(isFourthStep || selectedPlanCheckoutData?.payment_success) && 'success'}
            >
              {t('summary')}
            </Heading>
          </Box>
        )}

        {(!hideIndexList.includes(3)) && (
          <Box
            display={typeof isFreeTier === 'boolean' && isFreeTier === false ? 'flex' : 'none'}
            gridGap="10px"
            alignItems="center"
            color={stepIndex !== 3 && 'gray.350'}
          >
            {selectedPlanCheckoutData?.payment_success && (
              <Icon icon="verified" width="18px" height="30px" />
            )}
            <Heading
              size="14px"
              fontWeight={isFourthStep ? '700' : '500'}
              color={selectedPlanCheckoutData?.payment_success && 'success'}
            >
              {t('payment')}
            </Heading>
          </Box>
        )}
      </Box>

      {typeof handleGoBack === 'function' && (
        <Box display={{ base: 'flex', md: 'none' }} gridGap="20px" justifyContent="space-between" overflow="auto" padding="0 20px">
          {!handleGoBack().must_hidde && handleGoBack().isNotAvailable === false ? (
            <Box display="flex" onClick={() => handleGoBack().func()} alignItems="center" padding="10px 0px">
              <Icon icon="arrowRight" width="10px" height="20px" style={{ transform: 'rotate(180deg)' }} />
            </Box>
          ) : (
            <Box padding="10px 0px" />
          )}
          <Box
            display="flex"
            gridGap="10px"
            alignItems="center"
            color={stepIndex !== 0 && 'gray.350'}
          >
            <Heading
              size="sm"
              fontWeight="700"
              color={fontColor}
            >
              {isFirstStep && t('contact-information')}
              {isSecondStep && t('choose-your-class')}
              {isThirdStep && t('summary')}
              {isFourthStep && t('payment')}
            </Heading>
          </Box>
          <Flex fontSize="24px" gridGap="3px" color={disabledColor2} fontWeight={700}>
            <Text size="24px" color="blue.default">
              {(position) || 1}
            </Text>
            /
            <Text size="24px">
              {totalCountListBasedInHidenList}
            </Text>
          </Flex>
        </Box>
      )}
      <Divider maxWidth="490px" margin="0 auto" />
    </>
  );
}

Stepper.propTypes = {
  stepIndex: PropTypes.number.isRequired,
  isFreeTier: PropTypes.bool.isRequired,
  isFirstStep: PropTypes.bool.isRequired,
  isSecondStep: PropTypes.bool.isRequired,
  isThirdStep: PropTypes.bool.isRequired,
  isFourthStep: PropTypes.bool.isRequired,
  handleGoBack: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  hideIndexList: PropTypes.arrayOf(PropTypes.number),
  selectedPlanCheckoutData: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

Stepper.defaultProps = {
  handleGoBack: null,
  hideIndexList: [],
  selectedPlanCheckoutData: {},
};

export default Stepper;
