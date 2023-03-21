import { Box, Button, useToast } from '@chakra-ui/react';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Text from '../../common/components/Text';
import useSignup from '../../common/store/actions/signupAction';
import bc from '../../common/services/breathecode';

const ChooseDate = ({ cohort }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { handleChecking, nextStep, setCohortPlans } = useSignup();
  const { t } = useTranslation('signup');

  const kickoffDate = {
    en:
      cohort?.kickoff_date
      && format(new Date(cohort.kickoff_date), 'MMM do'),
    es:
      cohort?.kickoff_date
      && format(new Date(cohort.kickoff_date), "d 'de' MMMM", {
        locale: es,
      }),
  };

  return (
    <Box display="flex" gridGap="30px">
      <Text size="18px" fontWeight="400" flex={0.35} textTransform="capitalize">
        {cohort?.name}
        <Text size="13px" fontWeight="700" textTransform="capitalize">
          {cohort?.syllabus_version?.name}
        </Text>
      </Text>
      <Box
        display="flex"
        flexDirection="column"
        gridGap="5px"
        flex={0.2}
      >
        <Text size="18px">
          {kickoffDate[router.locale]}
        </Text>
        {cohort?.shortWeekDays[router.locale].length > 0 && (
          <Text size="14px" color="gray.default">
            {cohort?.shortWeekDays[router.locale].map(
              (day, i) => `${day}${i < cohort?.shortWeekDays[router.locale].length - 1 ? '/' : ''}`,
            )}
          </Text>
        )}
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        gridGap="5px"
        flex={0.3}
      >
        <Text size="18px">{cohort?.availableTime}</Text>
        <Text size="14px" color="gray.default">
          {cohort?.timezone}
        </Text>
      </Box>
      <Button
        variant="outline"
        isLoading={isLoading}
        onClick={() => {
          setIsLoading(true);
          bc.payment({
            cohort: cohort.id,
          }).getCohortPlans()
            .then(({ data }) => {
              if (data.length === 0) {
                toast({
                  title: t('alert-message:no-plan-configuration'),
                  status: 'info',
                  duration: 6000,
                  isClosable: true,
                });
              }
              setCohortPlans(data);
              handleChecking({ ...cohort, plan: data[0] })
                .then(() => {
                  nextStep();
                });
            })
            .finally(() => setIsLoading(false));
        }}
        borderColor="currentColor"
        color="blue.default"
        flex={0.15}
      >
        {t('choose-date')}
      </Button>
    </Box>
  );
};

ChooseDate.propTypes = {
  cohort: PropTypes.objectOf(PropTypes.any),
};

ChooseDate.defaultProps = {
  cohort: {},
};

export default ChooseDate;
