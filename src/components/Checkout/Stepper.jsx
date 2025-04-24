import { Box, Divider } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Heading from '../Heading';
import Icon from '../Icon';
import useSignup from '../../hooks/useSignup';

function Stepper({ stepIndex, selectedPlanCheckoutData, isFreeTier }) {
  const { t } = useTranslation('signup');
  const { stepsEnum } = useSignup();

  const steps = [
    {
      key: 'contact',
      enum: stepsEnum.CONTACT,
      label: t('contact-information'),
      show: true,
      isCompleted: stepIndex > stepsEnum.CONTACT,
      isActive: stepIndex === stepsEnum.CONTACT,
    },
    {
      key: 'choose-class',
      enum: stepsEnum.SUMMARY,
      label: t('summary'),
      show: isFreeTier,
      isCompleted: stepIndex > stepsEnum.CHOOSE_CLASS || selectedPlanCheckoutData?.payment_success,
      isActive: stepIndex === stepsEnum.SUMMARY,
    },
    {
      key: 'payment',
      enum: stepsEnum.PAYMENT,
      label: t('payment'),
      show: !isFreeTier,
      isCompleted: selectedPlanCheckoutData?.payment_success,
      isActive: stepIndex === stepsEnum.PAYMENT,
    },
  ];

  const visibleSteps = steps.filter((step) => step.show);

  return (
    <Box display="flex" flexDirection="column" gridGap="20px" margin={{ base: '0 1rem', lg: '0 auto' }} width={{ base: 'auto', lg: '100%' }} maxWidth="490px">
      <Box display={{ base: 'none', md: 'flex' }} justifyContent="space-between" margin="2rem 0 0 0" id="container-stepper" width="auto" gridGap="38px">
        {visibleSteps.map((step) => (
          <Box
            key={step.key}
            display="flex"
            gridGap="10px"
            alignItems="center"
            color={!step.isActive && 'gray.350'}
          >
            {step.isCompleted && (
              <Icon icon="verified" width="18px" height="30px" />
            )}
            <Heading
              size="14px"
              fontWeight={step.isActive ? '700' : '500'}
              color={step.isCompleted && 'success'}
            >
              {step.label}
            </Heading>
          </Box>
        ))}
      </Box>

      <Divider maxWidth="490px" margin="0 auto" />
    </Box>
  );
}

Stepper.propTypes = {
  stepIndex: PropTypes.number.isRequired,
  isFreeTier: PropTypes.bool.isRequired,
  selectedPlanCheckoutData: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

Stepper.defaultProps = {
  selectedPlanCheckoutData: {},
};

export default Stepper;
