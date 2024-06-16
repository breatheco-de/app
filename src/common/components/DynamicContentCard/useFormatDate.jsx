import { intervalToDuration } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import { isValidDate } from '../../../utils';

const useFormatDate = () => {
  const { t } = useTranslation('live-event');
  const startingSoonDelta = 30;

  const formatDurationString = (duration) => {
    const { months, days, hours, minutes } = duration;
    const averageHour = hours >= 1 && minutes > 0 ? hours + 1 : hours;

    if (months >= 1) {
      return months > 1
        ? t('start-months', { time: months })
        : t('start-month', { time: months });
    }
    if (days >= 1 && months === 0) {
      return days > 1
        ? t('start-days', { time: days })
        : t('start-day', { time: days });
    }
    if (hours >= 1 && days === 0 && months === 0) {
      return hours > 1
        ? t('start-hours', { time: averageHour || 0 })
        : t('start-hour', { time: averageHour || 0 });
    }
    if (minutes >= 1 && hours === 0 && days === 0 && months === 0) {
      return minutes > 1
        ? t('start-minutes', { time: minutes || 0 })
        : t('start-minute', { time: minutes || 0 });
    }

    return '';
  };

  const formatTimeString = (start) => {
    if (!isValidDate(start)) return t('invalid-date');

    const duration = intervalToDuration({
      end: new Date(),
      start,
    });

    const formatted = formatDurationString(duration);

    if (formatted === '') return t('few-seconds');
    return formatted;
  };

  const textTime = ({ start, started, end, ended }) => {
    let formattedTime;
    if (ended) {
      formattedTime = formatTimeString(end);
      return t('ended', { time: formattedTime });
    }
    formattedTime = formatTimeString(start);
    if (started) {
      return t('started', { time: formattedTime });
    }
    return t('will-start', { time: formattedTime });
  };

  const formattedTime = (start, end) => {
    const started = start - new Date() <= startingSoonDelta;
    const ended = end - new Date() <= 0;

    const intervalDurationDate = start && end && intervalToDuration({
      start,
      end,
    });

    return {
      text: textTime({ start, started, end, ended }),
      started,
      ended,
      intervalDurationDate,
    };
  };

  return {
    formattedTime,
    formatTimeString,
  };
};

export default useFormatDate;
