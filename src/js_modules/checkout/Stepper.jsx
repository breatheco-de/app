import { Box, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useStyle from '../../common/hooks/useStyle';

function Stepper({ stepIndex, checkoutData, isFirstStep, isSecondStep, isThirdStep, isFourthStep, handleGoBack }) {
  const { t } = useTranslation('signup');
  const { fontColor, disabledColor2 } = useStyle();

  return (
    <>
      <Box display={{ base: 'none', md: 'flex' }} gridGap="38px" justifyContent="center" overflow="auto">
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
          <Heading
            size="sm"
            fontWeight={isThirdStep ? '700' : '500'}
            color={(isFourthStep) && 'success'}
          >
            {t('summary')}
          </Heading>
        </Box>

        <Box
          display={(typeof checkoutData?.isTrial === 'boolean' && !checkoutData?.isTrial) ? 'flex' : 'none'}
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
            gridGap="8px"
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
              {(stepIndex + 1) || 1}
            </Text>
            /
            <Text size="24px">
              {typeof checkoutData?.isTrial === 'boolean' && !checkoutData?.isTrial ? 4 : 3}
            </Text>
          </Flex>
        </Box>
      )}
    </>
  );
}

Stepper.propTypes = {
  stepIndex: PropTypes.number.isRequired,
  checkoutData: PropTypes.shape({
    isTrial: PropTypes.bool,
  }),
  isFirstStep: PropTypes.bool.isRequired,
  isSecondStep: PropTypes.bool.isRequired,
  isThirdStep: PropTypes.bool.isRequired,
  isFourthStep: PropTypes.bool.isRequired,
  handleGoBack: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
};

Stepper.defaultProps = {
  checkoutData: {},
  handleGoBack: null,
};

export default Stepper;
