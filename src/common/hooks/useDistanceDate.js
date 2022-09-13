import { formatDistanceStrict, format } from 'date-fns';
import { es } from 'date-fns/locale';

const useDistanceDate = (startingAt, endingAt, locale = 'en') => {
  const today = new Date();
  const eventDate = new Date(startingAt);

  const formatStart = format(new Date(startingAt), 'MM/dd/yyyy HH:MM:SS');
  const formatEnd = format(new Date(endingAt), 'MM/dd/yyyy HH:MM:SS');

  const hasStarted = new Date(formatStart) < today;
  const isExpired = new Date(formatEnd) < today;
  const startsIn30Minutes = new Date(formatStart) < new Date(today.setMinutes(today.getMinutes() + 30));

  const formatStartToLocaleDate = new Date(formatStart).toLocaleDateString();
  const formatStartToLocaleTime = new Date(formatStart).toLocaleTimeString();

  const elapsedTime = locale === 'es'
    ? formatDistanceStrict(
      eventDate,
      today,
      { addSuffix: true, locale: es },
    ) : formatDistanceStrict(
      eventDate,
      today,
      { addSuffix: true },
    );

  return {
    elapsedTime,
    hasStarted,
    isExpired,
    startsIn30Minutes,
    formatStartToLocaleDate,
    formatStartToLocaleTime,
  };
};

export default useDistanceDate;
