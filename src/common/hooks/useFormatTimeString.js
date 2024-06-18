import { intervalToDuration } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import { isValidDate } from '../../utils';

const useFormatTimeString = () => {
  const { t } = useTranslation('live-event');

  const formatTimeString = (start) => {
    const isValidDates = isValidDate(start);
    const duration = isValidDates && intervalToDuration({
      end: new Date(),
      start,
    });

    const formatDurationString = () => {
      const { months, days, hours, minutes } = duration;
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
          ? t('start-hours', { time: hours || 0 })
          : t('start-hour', { time: hours || 0 });
      }
      if (minutes >= 1 && hours === 0 && days === 0 && months === 0) {
        return minutes > 1
          ? t('start-minutes', { time: minutes || 0 })
          : t('start-minute', { time: minutes || 0 });
      }

      return '';
    };

    const formated = formatDurationString();

    if (formated === '') return t('few-seconds');
    return formated;
  };

  return { formatTimeString };
};

export default useFormatTimeString;
