import PropTypes from 'prop-types';
import { intervalToDuration } from 'date-fns';
import { useEffect, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Text from './Text';
import Heading from './Heading';
import { calculateDifferenceDays } from '../../utils';
import LoaderScreen from './LoaderScreen';

function TimeString({ string, label }) {
  return (
    <Box display="flex" flexDirection="column">
      <Heading size="l" fontWeight={700}>
        {string}
      </Heading>
      {label && (
      <Text size="15px" fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      )}
    </Box>
  );
}

function Timer({ startingAt, onFinish, autoRemove, variant, ...rest }) {
  const [timer, setTimer] = useState({});
  const [loading, setLoading] = useState(true);
  const [justFinished, setJustFinished] = useState(false);
  const { t } = useTranslation('common');

  useEffect(() => {
    let interval;
    if (justFinished === false) {
      interval = setInterval(() => {
        const now = new Date();
        const startingAtDate = new Date(startingAt);
        const intervalDurationObj = intervalToDuration({
          start: startingAtDate,
          end: now,
        });
        const { isRemainingToExpire } = calculateDifferenceDays(startingAtDate);

        if (isRemainingToExpire) {
          setLoading(false);
          setTimer({
            days: String(intervalDurationObj.days).padStart(2, '0'),
            hours: String(intervalDurationObj.hours).padStart(2, '0'),
            minutes: String(intervalDurationObj.minutes).padStart(2, '0'),
            seconds: String(intervalDurationObj.seconds).padStart(2, '0'),
          });
        }
        if (!isRemainingToExpire && !justFinished) {
          onFinish();
          setJustFinished(true);
          setLoading(false);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [justFinished]);

  if (variant === 'small') {
    return (
      <Box alignItems={loading && 'center'} minWidth="160px" display="flex" position="relative" zIndex={10} borderRadius="4px" padding={{ base: '18px 24px', md: '0 24px' }} height={{ base: 'auto', md: '177px' }} background="#FFF1D1" {...rest}>
        {loading && <Spinner margin="auto" color="blue.light" opacity={0.9} />}
        <Box filter={loading && 'blur(3px)'} display="flex" gridGap="1px" margin="0 auto" alignItems="center" fontSize="40px">
          {autoRemove && timer?.days <= 0 ? null : (
            <>
              <Heading size="18px" fontWeight={700}>
                {timer?.days}
                :
              </Heading>
            </>
          )}
          {autoRemove && timer?.hours <= 0 && timer?.days <= 0 ? null : (
            <>
              <Heading size="18px" fontWeight={700}>
                {timer?.hours}
                :
              </Heading>
            </>
          )}
          <>
            <Heading size="18px" fontWeight={700}>
              {timer?.minutes}
            </Heading>
            {autoRemove && timer?.days <= 0 && (
              <Heading size="18px" fontWeight={700}>
                :
                {timer?.seconds}
              </Heading>
            )}
          </>
        </Box>
      </Box>
    );
  }

  return (
    <Box overflowX="hidden" display="flex" position="relative" zIndex={10} borderTopRadius="16px" padding={{ base: '18px 24px', md: '0 24px' }} width="100%" height={{ base: 'auto', md: '177px' }} background="yellow.light" {...rest}>
      {loading && <LoaderScreen width="95px" height="95px" background="blue.light" opacity={0.9} />}
      <Box filter={loading && 'blur(3px)'} display="flex" gridGap="11px" margin="0 auto" alignItems="center" fontSize="40px">
        {autoRemove && timer?.days <= 0 ? null : (
          <>
            <TimeString label={t('days')} string={timer?.days} />
            <Box margin="-2rem 0 0 0">
              :
            </Box>
          </>
        )}
        {autoRemove && timer?.hours <= 0 && timer?.days <= 0 ? null : (
          <>
            <TimeString label="Hrs" string={timer?.hours} />
            <Box margin="-2rem 0 0 0">
              :
            </Box>
          </>
        )}
        {autoRemove && timer?.minutes <= 0 && timer?.hours <= 0 && timer?.days <= 0 ? null : (
          <>
            <TimeString label="Min" string={timer.minutes} />
            <Box margin="-2rem 0 0 0">
              :
            </Box>
          </>
        )}
        <TimeString label={t('short-seconds')} string={timer.seconds} />
      </Box>
    </Box>
  );
}

Timer.propTypes = {
  startingAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onFinish: PropTypes.func,
  autoRemove: PropTypes.bool,
  variant: PropTypes.string,
};
Timer.defaultProps = {
  startingAt: null,
  onFinish: () => {},
  autoRemove: false,
  variant: 'default',
};

TimeString.propTypes = {
  string: PropTypes.string,
  label: PropTypes.string,
};
TimeString.defaultProps = {
  string: '00',
  label: '',
};

export default Timer;
