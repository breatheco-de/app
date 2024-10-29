import PropTypes from 'prop-types';
import { differenceInMilliseconds } from 'date-fns';
import { useEffect, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Text from './Text';
import Heading from './Heading';
import { calculateDifferenceDays } from '../../utils';
import LoaderScreen from './LoaderScreen';

function TimeString({ string, label, size, textSize }) {
  return (
    <Box display="flex" flexDirection="column">
      <Heading size={size} fontWeight={700}>
        {string}
      </Heading>
      {label && (
        <Text size={textSize} fontWeight={700} textTransform="uppercase">
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
        const differenceInMs = differenceInMilliseconds(now, startingAtDate) * -1;

        const { isRemainingToExpire } = calculateDifferenceDays(startingAtDate);

        if (isRemainingToExpire) {
          const totalSeconds = Math.floor(differenceInMs / 1000);

          const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60));
          const remainingSecondsForMonth = totalSeconds % (30 * 24 * 60 * 60);

          const days = Math.floor(remainingSecondsForMonth / (24 * 60 * 60));
          const remainingSecondsForDay = remainingSecondsForMonth % (24 * 60 * 60);

          const hours = Math.floor(remainingSecondsForDay / (60 * 60));
          const minutes = Math.floor((remainingSecondsForDay % (60 * 60)) / 60);
          const seconds = remainingSecondsForDay % 60;

          setLoading(false);

          setTimer({
            months: String(months).padStart(2, '0'),
            days: String(days).padStart(2, '0'),
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
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

  console.log(timer.months);

  if (variant === 'text') {
    if (loading) return <Spinner margin="auto" color={rest.color || 'blue.default'} />;
    return (
      <Text {...rest}>
        {/* Si queda un número exacto de meses */}
        {(timer?.months) > 1 && (timer?.days) === 0 ? (
          `${(timer?.months)} ${(timer?.months) === 1 ? t('word-connector.month') : t('word-connector.months')}`
        ) : null}

        {/* Si queda más de un mes con días restantes */}
        {(timer?.months) > 1 && (timer?.days) > 0 ? (
          `${(timer?.months)} ${(timer?.months) === 1 ? t('word-connector.month') : t('word-connector.months')} ${timer?.days} ${timer?.days === 1 ? t('word-connector.day') : t('word-connector.days')}`
        ) : null}

        {/* Si queda exactamente un mes */}
        {(timer?.months) === 1 && (timer?.days) > 0 ? (
          `${(timer?.days)} ${(timer?.days) === 1 ? t('word-connector.day') : t('word-connector.days')} ${timer?.hours} ${timer?.hours === 1 ? t('word-connector.hour') : t('word-connector.hours')}`
        ) : null}

        {/* Si queda menos de 24 horas pero no menos de 1 hora */}
        {(timer?.days) === 0 && (timer?.hours) > 1 && (timer?.minutes) === 0 ? (
          `${(timer?.hours)} ${(timer?.hours) === 1 ? t('word-connector.hour') : t('word-connector.hours')}`
        ) : null}

        {/* Si queda menos de 1 día y menos de 24 horas */}
        {(timer?.days) === 0 && (timer?.hours) > 0 && (timer?.minutes) > 0 ? (
          `${(timer?.hours)} ${(timer?.hours) === 1 ? t('word-connector.hour') : t('word-connector.hours')} ${timer?.minutes} ${timer?.minutes === 1 ? t('timer.min') : t('timer.mins')}`
        ) : null}

        {/* Si queda menos de una hora */}
        {(timer?.hours) === 0 && (timer?.minutes) > 0 && (timer?.seconds) > 0 ? (
          `${(timer?.minutes)} ${(timer?.minutes) === 1 ? t('timer.min') : t('timer.mins')} ${timer?.seconds} ${t('timer.sec')}`
        ) : null}

        {/* Si el tiempo exacto coincide con los casos definidos */}
        {((timer?.months) <= 1 && (timer?.days) === 0 && (timer?.hours) === 24) ? (
          `24 ${t('word-connector.hours')}`
        ) : null}
      </Text>
    );
  }

  if (variant === 'small') {
    return (
      <Box alignItems="center" minWidth="160px" display="flex" borderRadius="4px" background="#FFF1D1" {...rest}>
        {loading ? (
          <Spinner margin="auto" color={rest.color || 'blue.default'} />
        ) : (
          <Box display="flex" gridGap="1px" margin="0 auto" alignItems="center" fontSize="40px">
            {autoRemove && timer?.days <= 0 ? null : (
              <>
                <TimeString label={t('days')} string={timer?.days} size="xsm" textSize="9px" />
                <Box margin="-1rem 2px 0 2px">
                  :
                </Box>
              </>
            )}
            {autoRemove && timer?.hours <= 0 && timer?.days <= 0 ? null : (
              <>
                <TimeString label="Hrs" string={timer?.hours} size="xsm" textSize="10px" />
                <Box margin="-1rem 2px 0 2px">
                  :
                </Box>
              </>
            )}
            {autoRemove && timer?.minutes <= 0 && timer?.hours <= 0 && timer?.days <= 0 ? null : (
              <>
                <TimeString label="Min" string={timer.minutes} size="xsm" textSize="10px" />
                <Box margin="-1rem 2px 0 2px">
                  :
                </Box>
              </>
            )}
            <TimeString label={t('short-seconds')} string={timer.seconds} size="xsm" textSize="10px" />
          </Box>
        )}
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
  onFinish: () => { },
  autoRemove: false,
  variant: 'default',
};

TimeString.propTypes = {
  string: PropTypes.string,
  label: PropTypes.string,
  size: PropTypes.string,
  textSize: PropTypes.string,
};
TimeString.defaultProps = {
  string: '00',
  label: '',
  size: 'l',
  textSize: '15px',
};

export default Timer;
