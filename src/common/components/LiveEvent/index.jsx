import { useState } from 'react';
import {
  Box, useColorModeValue, Button,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { formatDuration, intervalToDuration } from 'date-fns';
import { es, en } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import CustomTheme from '../../../../styles/theme';
import Link from '../NextChakraLink';
import Text from '../Text';
import Icon from '../Icon';
import { isDateMoreThanAnyDaysAgo, isValidDate } from '../../../utils';
import OtherEvents from './OtherEvents';
import modifyEnv from '../../../../modifyEnv';
import MainEvent from './MainEvent';

const availableLanguages = {
  es,
  en,
};

const LiveEvent = ({
  mainClasses,
  otherEvents,
  startingSoonDelta,
  stTranslation,
  featureLabel,
  featureReadMoreUrl,
}) => {
  const { t, lang } = useTranslation('live-event');
  const [isOpen, setIsOpen] = useState(false);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const bgColor = useColorModeValue('white', 'gray.900');
  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');

  const otherEventsSorted = otherEvents?.length > 0 ? otherEvents.sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at)) : [];
  const nearestEvent = otherEventsSorted[0];
  const restOfEvents = otherEventsSorted.slice(1);

  const mainEvents = mainClasses.length === 0 && nearestEvent ? [nearestEvent] : [...mainClasses];

  const getOtherEvents = () => {
    if (mainClasses.length === 0 && nearestEvent) {
      return restOfEvents;
    }
    return otherEventsSorted;
  };

  const formatDistanceLocale = {
    en: { xMonths: '{{count}} m', xWeeks: '{{count}} w', xDays: '{{count}} d', xHours: '{{count}} hr', xMinutes: '{{count}} min' },
    es: { xMonths: '{{count}} m', xWeeks: '{{count}} sem', xDays: '{{count}} d', xHours: '{{count}} hr', xMinutes: '{{count}} min' },
  };
  const shortEnLocale = { formatDistance: (token, count) => (formatDistanceLocale[lang][token] ? formatDistanceLocale[lang][token].replace('{{count}}', count) : availableLanguages[lang]) };

  const formatTimeString = (start, isMoreThan2Days = false) => {
    const duration = intervalToDuration({
      end: new Date(),
      start,
    });

    const formated = formatDuration(duration,
      {
        format: !isMoreThan2Days ? ['months', 'weeks', 'days', 'hours', 'minutes'] : ['months', 'weeks', 'days'],
        delimiter: ', ',
        locale: shortEnLocale,
      });

    if (formated === '') return stTranslation ? stTranslation[lang]['live-event']['few-seconds'] : t('few-seconds');
    return formated;
  };

  const textTime = (start, end) => {
    const started = start - new Date() <= startingSoonDelta;
    const ended = end - new Date() <= 0;
    let formatedTime;
    const isMoreThan2Days = isDateMoreThanAnyDaysAgo(start, 2);

    if (ended) {
      formatedTime = formatTimeString(end);
      return stTranslation ? stTranslation[lang]['live-event'].ended.replace('{{time}}', formatedTime) : t('ended', { time: formatedTime });
    }
    formatedTime = formatTimeString(start, isMoreThan2Days);
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
    if (mainClasses.length === 0 && nearestEvent) {
      return nearestEvent?.icon || 'group';
    }
    if (isLiveOrStarting(new Date(event?.starting_at), new Date(event.ending_at))) {
      return 'live-event';
    }
    return 'live-event-opaque';
  };

  return (
    <Box
      padding="10px"
      background={bgColor}
      border="1px solid"
      borderColor="#DADADA"
      borderRadius="11px"
      maxWidth="100%"
      minWidth="320px"
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
      {mainEvents.length !== 0 ? (
        <Box
          background={bgColor2}
          border={mainEvents.some((event) => isLiveOrStarting(new Date(event.starting_at), new Date(event.ending_at))) && '2px solid'}
          borderColor={CustomTheme.colors.blue.default2}
          padding="10px"
          borderRadius="19px"
          width="100%"
          margin="auto"
        >
          {mainEvents.map((event, index) => (
            <MainEvent
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
              stTranslation={stTranslation}
              mainClasses={mainClasses}
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
            <Icon
              width="34px"
              height="34px"
              icon="logoModern"
              color="currentColor"
            />
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
            events={mainEvents.length !== 0 && mainClasses.length !== 0 ? otherEventsSorted : restOfEvents}
            isLiveOrStarting={isLiveOrStarting}
            isLive={isLive}
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
          {getOtherEvents().filter((e) => isLiveOrStarting(new Date(e?.starting_at), new Date(e?.ending_at)))?.length !== 0 && (
            <Box borderRadius="full" background="none" className="pulse-red" width="16px" height="16px" display="inline-block" marginRight="5px">
              <Icon width="16px" height="16px" icon="on-live" />
            </Box>
          )}
          {stTranslation ? stTranslation[lang]['live-event'].upcoming : t('upcoming')}
          {isOpen ? (<ChevronUpIcon w={6} h={7} />) : (<ChevronDownIcon w={6} h={7} />)}
        </Button>
      )}
    </Box>
  );
};

LiveEvent.propTypes = {
  mainClasses: PropTypes.arrayOf(PropTypes.any),
  otherEvents: PropTypes.arrayOf(PropTypes.any),
  stTranslation: PropTypes.objectOf(PropTypes.any),
  startingSoonDelta: PropTypes.number,
  featureLabel: PropTypes.string,
  featureReadMoreUrl: PropTypes.string,
};

LiveEvent.defaultProps = {
  mainClasses: [],
  otherEvents: [],
  stTranslation: null,
  startingSoonDelta: 30,
  featureLabel: null,
  featureReadMoreUrl: null,
};

export default LiveEvent;
