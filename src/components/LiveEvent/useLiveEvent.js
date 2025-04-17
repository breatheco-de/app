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
    const startDate = isValidDates ? new Date(start) : null;
    if (!startDate) return t('invalid-date');

    const duration = intervalToDuration({
      end: new Date(),
      start: startDate,
    });

    if (!duration) return t('few-seconds-ago');

    const formatDurationString = () => {
      const { months, days, hours, minutes } = duration;
      if (months >= 1) return months > 1 ? t('start-months', { time: months }) : t('start-month', { time: months });
      if (days >= 1 && months === 0) return days > 1 ? t('start-days', { time: days }) : t('start-day', { time: days });
      if (hours >= 1 && days === 0 && months === 0) return hours > 1 ? t('start-hours', { time: hours || 0 }) : t('start-hour', { time: hours || 0 });
      if (minutes >= 1 && hours === 0 && days === 0 && months === 0) return minutes > 1 ? t('start-minutes', { time: minutes || 0 }) : t('start-minute', { time: minutes || 0 });
      return '';
    };

    const formated = formatDurationString();
    return formated === '' ? t('few-seconds-ago') : formated;
  }, [t]);

  const formatTimeUntil = useCallback((start) => {
    const isValidDates = isValidDate(start);
    const startDate = isValidDates ? new Date(start) : null;
    if (!startDate) return t('invalid-date');

    if (startDate <= new Date()) {
      return t('starting-soon');
    }

    const duration = intervalToDuration({
      start: new Date(),
      end: startDate,
    });

    if (!duration) return t('starting-soon');

    const formatFutureDurationString = () => {
      const { months, days, hours, minutes } = duration;
      if (minutes >= 1 && hours === 0 && days === 0 && months === 0) return minutes > 1 ? t('will-start-minutes', { time: minutes }) : t('will-start-minute', { time: minutes });
      if (hours >= 1 && days === 0 && months === 0) return hours > 1 ? t('will-start-hours', { time: hours }) : t('will-start-hour', { time: hours });
      if (days >= 1 && months === 0) return days > 1 ? t('will-start-days', { time: days }) : t('will-start-day', { time: days });
      if (months >= 1) return months > 1 ? t('will-start-months', { time: months }) : t('will-start-month', { time: months });
      return '';
    };

    const formated = formatFutureDurationString();
    return formated === '' ? t('starting-soon') : formated;
  }, [t]);

  const textTime = useCallback((start, end) => {
    const currentTime = new Date();
    const startDate = isValidDate(start) ? new Date(start) : null;
    const endDate = isValidDate(end) ? new Date(end) : null;

    if (!startDate || !endDate) {
      return t('invalid-date');
    }

    const isAlreadyEnded = endDate <= currentTime;
    const isAlreadyStarted = startDate <= currentTime;

    if (isAlreadyEnded) {
      const endedDuration = formatTimeString(endDate);
      return t('ended', { time: endedDuration });
    }

    if (isAlreadyStarted) {
      const startedDuration = formatTimeString(startDate);
      return t('started', { time: startedDuration });
    }

    const startsInDuration = formatTimeUntil(startDate);
    return t('will-start', { time: startsInDuration });
  }, [t, formatTimeString, formatTimeUntil]);

  const isLiveOrStarting = useCallback((start, end) => {
    const isValidDates = isValidDate(start) && isValidDate(end);
    if (!isValidDates) return false;
    const currentTime = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    const ended = endDate <= currentTime;
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

    const ended = endDate <= currentTime;
    if (ended) return false;

    return startDate <= currentTime;
  }, []);

  const getLiveIcon = useCallback((event) => {
    if (!event) return 'live-event-opaque';
    const endDate = event?.ended_at || event?.ending_at;
    if (isLiveOrStarting(event?.starting_at, endDate)) {
      return 'live-event';
    }
    return 'live-event-opaque';
  }, [isLiveOrStarting]);

  const updateTimes = useCallback(() => {
    const times = {};
    const currentMainEvents = Array.isArray(mainEvents) ? mainEvents : [];
    const currentOtherEvents = Array.isArray(getOtherEventsResult) ? getOtherEventsResult : [];
    const allCurrentEvents = [...currentMainEvents, ...currentOtherEvents];

    allCurrentEvents.forEach((event) => {
      if (!event || !event.id) return;
      const endDate = event?.ended_at || event?.ending_at;
      const startsAt = event?.starting_at;
      const endsAt = endDate;
      times[event.id] = textTime(startsAt, endsAt);
    });
    setEventTimeTexts(times);
  }, [mainEvents, getOtherEventsResult, textTime]);

  useEffect(() => {
    updateTimes();
    const intervalId = setInterval(updateTimes, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [updateTimes]);

  return {
    t,
    isOpen,
    setIsOpen,
    eventTimeTexts,
    nearestEvent,
    mainEvents,
    getOtherEventsResult,
    isLiveOrStarting,
    isLive,
    getLiveIcon,
    existsWhiteLabel,
    BREATHECODE_HOST,
    logoData,
  };
};

export default useLiveEvent;
