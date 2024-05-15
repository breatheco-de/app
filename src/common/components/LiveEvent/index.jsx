/* eslint-disable react/jsx-no-useless-fragment */
import { useEffect, useState } from 'react';
import {
  Box, useColorModeValue, Button,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { intervalToDuration } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import CustomTheme from '../../../../styles/theme';
import Link from '../NextChakraLink';
import Text from '../Text';
import Icon from '../Icon';
import { isValidDate } from '../../../utils';
import OtherEvents from './OtherEvents';
import modifyEnv from '../../../../modifyEnv';
import MainEvent from './MainEvent';
import logoData from '../../../../public/logo.json';
import { WHITE_LABEL_ACADEMY } from '../../../utils/variables';

function LiveEvent({
  mainClasses,
  otherEvents,
  startingSoonDelta,
  stTranslation,
  featureLabel,
  featureReadMoreUrl,
  cohorts,
  ...rest
}) {
  const { t, lang } = useTranslation('live-event');
  const [isOpen, setIsOpen] = useState(false);
  // const [openFilter, setOpenFilter] = useState(false);
  const [eventTimeTexts, setEventTimeTexts] = useState({});
  // const [filterSelection, setFilterSelection] = useState({
  //   lang: '',
  //   eventType: '',
  // });
  // const [filterValues, setFilterValues] = useState({
  //   langs: [],
  //   eventTypes: [],
  // });
  const [liveEvent, setLiveEvent] = useState({
    main: [],
    other: [],
  });
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');
  // const { bordercolor, fontColor, backgroundColor } = useStyle();
  const whiteLabelAcademy = WHITE_LABEL_ACADEMY;
  const existsWhiteLabel = typeof whiteLabelAcademy === 'string' && whiteLabelAcademy.length > 0;

  const otherEventsSorted = liveEvent.other?.length > 0 ? liveEvent.other.sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at)) : [];
  const nearestEvent = otherEventsSorted[0];
  const restOfEvents = otherEventsSorted.slice(1);
  const now = new Date();
  const secondsToNextMinute = 60 - now.getSeconds();

  const mainEvents = liveEvent.main.length === 0 && nearestEvent ? [nearestEvent] : [...liveEvent.main];

  const getOtherEvents = () => {
    if (liveEvent.main.length === 0 && nearestEvent) {
      return restOfEvents;
    }
    return otherEventsSorted;
  };

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

  const textTime = (start, end) => {
    const started = start - new Date() <= startingSoonDelta;
    const ended = end - new Date() <= 0;
    let formatedTime;

    if (ended) {
      formatedTime = formatTimeString(end);
      return stTranslation ? stTranslation[lang]['live-event'].ended.replace('{{time}}', formatedTime) : t('ended', { time: formatedTime });
    }
    formatedTime = formatTimeString(start);
    if (started) {
      return stTranslation ? stTranslation[lang]['live-event'].started.replace('{{time}}', formatedTime) : t('started', { time: formatedTime });
    }
    return stTranslation ? stTranslation[lang]['live-event']['will-start'].replace('{{time}}', formatedTime) : t('will-start', { time: formatedTime });
  };

  const isLiveOrStarting = (start, end) => {
    const isValidDates = isValidDate(start) && isValidDate(end);
    const ended = end - new Date() <= 0;
    if (ended) return false;

    const interval = isValidDates && intervalToDuration({ end: new Date(), start: new Date(start) });
    const {
      days, months, hours, years, minutes,
    } = interval;
    const totalTime = days + months + hours + years + minutes;
    return start - new Date() <= 0 || (totalTime === minutes && minutes <= startingSoonDelta);
  };

  const isLive = (start, end) => {
    const ended = end - new Date() <= 0;
    if (ended) return false;

    return start - new Date() <= 0;
  };

  const getLiveIcon = (event) => {
    const endDate = event?.ended_at || event?.ending_at;
    if (liveEvent.main.length === 0 && nearestEvent) {
      return nearestEvent?.icon || 'group';
    }
    if (isLiveOrStarting(new Date(event?.starting_at), new Date(endDate))) {
      return 'live-event';
    }
    return 'live-event-opaque';
  };

  useEffect(() => {
    if (mainClasses?.length > 0 || otherEvents?.length > 0) {
      setLiveEvent({
        main: mainClasses,
        other: otherEvents,
      });
      // recopilate all lang and event_type values from events main and other objects
      // const allLangs = [...new Set([
      //   ...mainClasses.map((event) => (event?.lang !== null ? event?.lang : undefined)),
      //   ...otherEvents.map((event) => (event?.lang !== null ? event?.lang : undefined)),
      // ])];
      // const allEventTypes = [...new Set([
      //   ...mainClasses.map((event) => ({
      //     title: event.event_type.name,
      //     slug: event.event_type.slug,
      //   })),
      //   ...otherEvents.map((event) => ({
      //     title: event.event_type.name,
      //     slug: event.event_type.slug,
      //   })),
      // ])];

      // setFilterValues({
      //   langs: allLangs,
      //   eventTypes: allEventTypes,
      // });
    }
  }, [mainClasses, otherEvents]);

  // const applyFilters = () => {
  //   const eventTyleHasSelected = filterSelection.eventType.length > 0;
  //   const langHasSelected = filterSelection.lang.length > 0;

  //   const filteredMainEvents = mainClasses?.length > 0 ? mainClasses?.filter((item) => (
  //     eventTyleHasSelected ? item.event_type.slug === filterSelection.eventType : true)
  //     && (langHasSelected ? item.lang === filterSelection.lang : true)) : [];

  //   const filteredOtherEvents = otherEvents?.length > 0 ? otherEvents?.filter((item) => (
  //     eventTyleHasSelected ? item.event_type.slug === filterSelection.eventType : true)
  //     && (langHasSelected ? item.lang === filterSelection.lang : true)) : [];

  //   setOpenFilter(false);
  //   setLiveEvent({
  //     main: filteredMainEvents,
  //     other: filteredOtherEvents,
  //   });
  // };
  const updateTimes = () => {
    const otherEventsList = mainEvents.length !== 0 && liveEvent.main.length !== 0 ? otherEventsSorted : restOfEvents;
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
  };

  useEffect(() => {
    let intervalVar;
    // applyFilters();
    updateTimes();

    setTimeout(() => {
      updateTimes();
      intervalVar = setInterval(updateTimes(), 60 * 1000);
    }, secondsToNextMinute * 1000);
    return () => {
      clearInterval(intervalVar);
    };
  }, [mainClasses, otherEvents]);

  return (
    <Box>
      <Box
        background="yellow.light"
        padding="6px 8px"
        color="black"
        textAlign="center"
        borderRadius="17px"
        mb="10px"
        fontWeight={700}
      >
        {t('choose-program:sidebar.live-events-title')}

        {/* <Popover
          isOpen={openFilter}
          onOpen={() => setOpenFilter(true)}
          onClose={() => setOpenFilter(false)}
          placement="bottom-start"
        >
          {(mainClasses?.length > 0 || otherEvents?.length > 0) && (
            <PopoverTrigger>
              <IconButton size="sm" background="transparent" border="0" icon={<Icon icon="filter" width="20px" height="20px" />} />
            </PopoverTrigger>
          )}
          <PopoverContent display="flex" flexDirection="column" gridGap="10px" p={5} background={backgroundColor}>
            {filterValues.langs?.length > 0 && (
              <Box color={fontColor} display="flex" alignItems="center" gridGap="14px">
                <Text size="14px" style={{ flexShrink: 0 }}>
                  {t('filters.language')}
                </Text>
                <Select color={fontColor} border="0px" padding="0" onChange={(ev) => setFilterSelection((prev) => ({ ...prev, lang: ev.target.value }))} placeholder="Choose language">
                  {filterValues.langs.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </Select>
              </Box>
            )}
            {filterValues.eventTypes?.length > 0 && (
              <Box color={fontColor} display="flex" alignItems="center" gridGap="14px">
                <Text size="14px" style={{ flexShrink: 0 }}>
                  {t('filters.event-type')}
                </Text>
                <Select color={fontColor} border="0px" padding="0" onChange={(ev) => setFilterSelection((prev) => ({ ...prev, eventType: ev.target.value }))} placeholder="Select event type">
                  {filterValues.eventTypes.map((item) => (
                    <option key={item} value={item.slug}>{item?.title}</option>
                  ))}
                </Select>
              </Box>
            )}
            <Divider borderColor={bordercolor} my="7px" />
            <Flex justifyContent="space-between" gridGap="10px">
              <Button variant="unstyled" color="blue.default" onClick={() => setOpenFilter(false)}>
                {t('common:cancel')}
              </Button>
              <Button variant="default" onClick={() => applyFilters()}>
                {t('common:apply-filters')}
              </Button>
            </Flex>
          </PopoverContent>
        </Popover> */}
      </Box>

      <Box
        padding="10px"
        maxWidth="100%"
        {...rest}
      >
        {(featureLabel || featureReadMoreUrl) && (
          <Text
            fontSize="sm"
            lineHeight="19px"
            fontWeight="700"
            color={textColor}
            textAlign="center"
            marginBottom="15px"
            marginTop="0"
          >
            {featureLabel}
            {' '}
            {featureReadMoreUrl && (
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={featureReadMoreUrl}
                color={useColorModeValue('blue.default', 'blue.300')}
                display="inline-block"
                letterSpacing="0.05em"
                locale="en"
                fontFamily="Lato, Sans-serif"
              >
                {stTranslation ? stTranslation[lang]['live-event']['learn-more'] : t('learn-more')}
              </Link>
            )}
          </Text>
        )}
        {mainEvents.length > 0 ? (
          <Box
            background={bgColor2}
            border={mainEvents.some((event) => isLiveOrStarting(new Date(event?.starting_at), new Date((event?.ended_at || event?.ending_at)))) && '2px solid'}
            borderColor={CustomTheme.colors.blue.default2}
            padding="10px"
            borderRadius="19px"
            width="100%"
            margin="auto"
          >
            {mainEvents.map((event, index) => (
              <MainEvent
                key={event.id}
                currentDateText={eventTimeTexts?.[event.id]}
                index={index}
                event={event}
                mainEvents={mainEvents}
                getOtherEvents={getOtherEvents}
                isLiveOrStarting={isLiveOrStarting}
                getLiveIcon={getLiveIcon}
                host={BREATHECODE_HOST}
                nearestEvent={nearestEvent}
                isLive={isLive}
                textTime={textTime}
                isWorkshop={!event?.hash}
                subLabel={event?.hash ? t('master-class') : t('workshop')}
                stTranslation={stTranslation}
                mainClasses={liveEvent.main}
                limitOfText={54}
                cohorts={cohorts}
              />
            ))}
          </Box>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            background={bgColor2}
            borderColor=""
            padding="10px"
            borderRadius="19px"
            width="100%"
            margin="auto"
          >
            <Box
              borderRadius="full"
              background="featuredLigth"
              opacity="0.5"
              padding="10px"
            >
              {existsWhiteLabel ? (
                <Image
                  src={logoData?.logo_url || '/static/images/4geeks.png'}
                  width={40}
                  height={40}
                  style={{
                    maxHeight: '40px',
                    minHeight: '40px',
                    objectFit: 'contain',
                  }}
                  alt={logoData?.name ? `${logoData.name} logo` : '4Geeks logo'}
                />
              ) : (
                <Icon
                  width="34px"
                  height="34px"
                  icon="logoModern"
                  color="currentColor"
                />
              )}
            </Box>
            <Box
              display="flex"
              justifyContent="center"
              flexDirection="column"
              marginLeft="10px"
            >
              <Text
                fontSize="md"
                lineHeight="18px"
                fontWeight="900"
                color={textColor}
                marginBottom="5px"
                marginTop="0"
              >
                {stTranslation ? stTranslation[lang]['live-event']['live-class'] : t('live-class')}
              </Text>
              <Text
                fontSize="12px"
                lineHeight="18px"
                fontWeight="700"
                color={textGrayColor}
                margin="0"
              >
                {stTranslation ? stTranslation[lang]['live-event']['no-live-class'] : t('no-live-class')}
              </Text>
            </Box>
          </Box>
        )}
        {isOpen && (
          <Box marginTop="10px" maxHeight="450px" overflow="auto">
            <OtherEvents
              events={mainEvents.length !== 0 && liveEvent.main.length !== 0 ? otherEventsSorted : restOfEvents}
              dateTextObj={eventTimeTexts}
              isLiveOrStarting={isLiveOrStarting}
              isLive={isLive}
              subLabel={t('workshop')}
              textTime={textTime}
              stTranslation={stTranslation}
            />
          </Box>
        )}
        {getOtherEvents()?.length > 0 && getOtherEvents() !== null && (
          <Button
            variant="ghost"
            height="auto"
            margin="auto"
            padding="5px"
            marginTop="5px"
            display="flex"
            alignItems="center"
            fontWeight="500"
            border="none"
            background="none"
            cursor="pointer"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {getOtherEvents().filter((e) => isLiveOrStarting(new Date(e?.starting_at), new Date((e?.ended_at || e?.ending_at))))?.length !== 0 ? (
              <>
                <Box borderRadius="full" background="none" className="pulse-red" width="16px" height="16px" display="inline-block" marginRight="5px">
                  <Icon width="16px" height="16px" icon="on-live" />
                </Box>
                {stTranslation ? stTranslation[lang]['live-event']?.['other-live-events-now'] : t('other-live-events-now')}
              </>
            ) : (
              <>
                {stTranslation ? stTranslation[lang]['live-event'].upcoming : t('upcoming')}
              </>
            )}
            {isOpen ? (<ChevronUpIcon w={6} h={7} />) : (<ChevronDownIcon w={6} h={7} />)}
          </Button>
        )}
      </Box>
    </Box>
  );
}

LiveEvent.propTypes = {
  mainClasses: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  otherEvents: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  stTranslation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  startingSoonDelta: PropTypes.number,
  featureLabel: PropTypes.string,
  featureReadMoreUrl: PropTypes.string,
  cohorts: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

LiveEvent.defaultProps = {
  mainClasses: [],
  otherEvents: [],
  stTranslation: null,
  startingSoonDelta: 30,
  featureLabel: null,
  featureReadMoreUrl: null,
  cohorts: [],
};

export default LiveEvent;
