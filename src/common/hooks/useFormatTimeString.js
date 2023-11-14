import { intervalToDuration } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import { isValidDate } from '../../utils';

const useFormatTimeString = (stTranslation) => {
  const { t, lang } = useTranslation('live-event');

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
          ? stTranslation?.[lang]?.['live-event']?.['start-months']?.replace('{{time}}', months) || t('start-months', { time: months })
          : stTranslation?.[lang]?.['live-event']?.['start-month']?.replace('{{time}}', months) || t('start-month', { time: months });
      }
      if (days >= 1 && months === 0) {
        return days > 1
          ? stTranslation?.[lang]?.['live-event']?.['start-days']?.replace('{{time}}', days) || t('start-days', { time: days })
          : stTranslation?.[lang]?.['live-event']?.['start-day']?.replace('{{time}}', days) || t('start-day', { time: days });
      }
      if (hours >= 1 && days === 0 && months === 0) {
        return hours > 1
          ? stTranslation?.[lang]?.['live-event']?.['start-hours']?.replace('{{time}}', hours) || t('start-hours', { time: hours || 0 })
          : stTranslation?.[lang]?.['live-event']?.['start-hour']?.replace('{{time}}', hours) || t('start-hour', { time: hours || 0 });
      }
      if (minutes >= 1 && hours === 0 && days === 0 && months === 0) {
        return minutes > 1
          ? stTranslation?.[lang]?.['live-event']?.['start-minutes']?.replace('{{time}}', minutes) || t('start-minutes', { time: minutes || 0 })
          : stTranslation?.[lang]?.['live-event']?.['start-minute']?.replace('{{time}}', minutes) || t('start-minute', { time: minutes || 0 });
      }

      return '';
    };

    const formated = formatDurationString();

    if (formated === '') return stTranslation ? stTranslation[lang]['live-event']['few-seconds'] : t('few-seconds');
    return formated;
  };

  return { formatTimeString };
};

export default useFormatTimeString;
