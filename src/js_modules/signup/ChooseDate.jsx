import { Box, Button } from '@chakra-ui/react';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Text from '../../common/components/Text';
import useSignup from '../../common/store/actions/signupAction';

const ChooseDate = ({ date }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { handleChecking, nextStep } = useSignup();
  const { t } = useTranslation('signup');

  const kickoffDate = {
    en:
      date?.kickoff_date
      && format(new Date(date.kickoff_date), 'MMM do'),
    es:
      date?.kickoff_date
      && format(new Date(date.kickoff_date), 'MMM d', {
        locale: es,
      }),
  };

  return (
    <Box display="flex" gridGap="30px">
      <Text size="18px" flex={0.35}>
        {date.syllabus_version.name}
      </Text>
      <Box
        display="flex"
        flexDirection="column"
        gridGap="5px"
        flex={0.2}
        textTransform="capitalize"
      >
        <Text size="18px">
          {kickoffDate[router.locale]}
        </Text>
        {date?.shortWeekDays[router.locale].length > 0 && (
          <Text size="14px" color="gray.default">
            {date?.shortWeekDays[router.locale].map(
              (day, index) => `${day}${index < date?.shortWeekDays[router.locale].length - 1 ? '/' : ''}`,
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
        <Text size="18px">{date?.availableTime}</Text>
        <Text size="14px" color="gray.default">
          {date?.timezone}
        </Text>
      </Box>
      <Button
        variant="outline"
        isLoading={isLoading}
        onClick={() => {
          setIsLoading(true);
          handleChecking(date)
            .then(() => {
              setIsLoading(false);
              nextStep();
            });
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
  date: PropTypes.objectOf(PropTypes.any),
};

ChooseDate.defaultProps = {
  date: {},
};

export default ChooseDate;
