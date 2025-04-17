import { useState, useEffect, useMemo, useCallback } from 'react';
import { intervalToDuration } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import { isValidDate } from '../../utils';
import { WHITE_LABEL_ACADEMY, BREATHECODE_HOST } from '../../utils/variables';
import logoData from '../../../public/logo.json';

const useLiveEvent = ({
  mainClasses = [],
  otherEvents = [],
  startingSoonDelta = 30,
}) => {
  const { t } = useTranslation('live-event');
  const [isOpen, setIsOpen] = useState(false);
  const [eventTimeTexts, setEventTimeTexts] = useState({});

  const whiteLabelAcademy = WHITE_LABEL_ACADEMY;
  const existsWhiteLabel = typeof whiteLabelAcademy === 'string' && whiteLabelAcademy.length > 0;

  const liveEvent = useMemo(() => ({
    main: mainClasses,
    other: otherEvents,
  }), [mainClasses, otherEvents]);

  const otherEventsSorted = useMemo(() => (liveEvent.other?.length > 0
    ? [...liveEvent.other].sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at))
    : []), [liveEvent.other]);

  const nearestEvent = useMemo(() => (otherEventsSorted.length > 0 ? otherEventsSorted[0] : null), [otherEventsSorted]);

  const restOfEvents = useMemo(() => (otherEventsSorted.length > 1 ? otherEventsSorted.slice(1) : []), [otherEventsSorted]);

  const mainEvents = useMemo(() => (liveEvent.main.length === 0 && nearestEvent ? [nearestEvent] : [...liveEvent.main]), [liveEvent.main, nearestEvent]);

  const getOtherEventsResult = useMemo(() => {
    if (liveEvent.main.length === 0 && nearestEvent) {
      return restOfEvents;
    }
    return otherEventsSorted;
  }, [liveEvent.main, nearestEvent, restOfEvents, otherEventsSorted]);

  const formatTimeString = useCallback((start) => {
    const isValidDates = isValidDate(start);
    const duration = isValidDates && intervalToDuration({
      end: new Date(),
      start,
    });

    if (!duration) return t('few-seconds');

    const formatDurationString = () => {
      const {
        months, days, hours, minutes,
      } = duration;
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
  }, [t]);

  const textTime = useCallback((start, end) => {
    const currentTime = new Date();
    const started = start - currentTime <= startingSoonDelta * 60 * 1000;
    const ended = end - currentTime <= 0;
    let formatedTime;

    if (ended) {
      formatedTime = formatTimeString(end);
      return t('ended', { time: formatedTime });
    }
    formatedTime = formatTimeString(start);
    if (started) {
      return t('started', { time: formatTimeString(start) });
    }
    return t('will-start', { time: formatTimeString(start) });
  }, [startingSoonDelta, t, formatTimeString]);

  const isLiveOrStarting = useCallback((start, end) => {
    const isValidDates = isValidDate(start) && isValidDate(end);
    if (!isValidDates) return false;
    const currentTime = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    const ended = endDate - currentTime <= 0;
    if (ended) return false;

    const startDiffMillis = startDate - currentTime;

    return startDiffMillis <= 0 || startDiffMillis <= startingSoonDelta * 60 * 1000;
  }, [startingSoonDelta]);

  const isLive = useCallback((start, end) => {
    const isValidDates = isValidDate(start) && isValidDate(end);
    if (!isValidDates) return false;
    const currentTime = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    const ended = endDate - currentTime <= 0;
    if (ended) return false;

    return startDate - currentTime <= 0;
  }, []);

  const getLiveIcon = useCallback((event) => {
    const endDate = event?.ended_at || event?.ending_at;
    if (isLiveOrStarting(new Date(event?.starting_at), new Date(endDate))) {
      return 'live-event';
    }
    return 'live-event-opaque';
  }, [isLiveOrStarting]);

  const updateTimes = useCallback(() => {
    const mainTimeEventsText = {};
    const otherTimeEventsText = {};

    if (mainEvents?.length > 0) {
      mainEvents.forEach((event) => {
        const endDate = event?.ended_at || event?.ending_at;
        const startsAt = isValidDate(event?.starting_at) ? new Date(event.starting_at) : null;
        const endsAt = isValidDate(endDate) ? new Date(endDate) : null;
        if (startsAt && endsAt) {
          mainTimeEventsText[event.id] = textTime(startsAt, endsAt);
        }
      });
    }

    const otherEventsList = getOtherEventsResult;
    if (otherEventsList?.length > 0) {
      otherEventsList.forEach((event) => {
        const endDate = event?.ended_at || event?.ending_at;
        const startsAt = isValidDate(event?.starting_at) ? new Date(event.starting_at) : null;
        const endsAt = isValidDate(endDate) ? new Date(endDate) : null;
        if (startsAt && endsAt) {
          otherTimeEventsText[event.id] = textTime(startsAt, endsAt);
        }
      });
    }
    setEventTimeTexts({
      ...mainTimeEventsText,
      ...otherTimeEventsText,
    });
  }, [mainEvents, getOtherEventsResult, textTime]);

  useEffect(() => {
    updateTimes();

    const intervalId = setInterval(updateTimes, 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [updateTimes]);

  return {
    t,
    isOpen,
    setIsOpen,
    eventTimeTexts,
    liveEvent,
    otherEventsSorted,
    nearestEvent,
    restOfEvents,
    mainEvents,
    getOtherEventsResult,
    formatTimeString,
    textTime,
    isLiveOrStarting,
    isLive,
    getLiveIcon,
    existsWhiteLabel,
    BREATHECODE_HOST,
    logoData,
  };
};

export default useLiveEvent;
