/* eslint-disable react/jsx-no-useless-fragment */
import { useState } from 'react';
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
  ...rest
}) {
  const { t, lang } = useTranslation('live-event');
  const [isOpen, setIsOpen] = useState(false);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const bgColor = useColorModeValue('white', 'gray.900');
  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');
  const whiteLabelAcademy = WHITE_LABEL_ACADEMY;
  const existsWhiteLabel = typeof whiteLabelAcademy === 'string' && whiteLabelAcademy.length > 0;

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
              key={event.id}
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
              mainClasses={mainClasses}
              limitOfText={54}
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
                src={logoData?.logo_url}
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
            events={mainEvents.length !== 0 && mainClasses.length !== 0 ? otherEventsSorted : restOfEvents}
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
          {getOtherEvents().filter((e) => isLiveOrStarting(new Date(e?.starting_at), new Date(e?.ending_at)))?.length !== 0 ? (
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
  );
}

LiveEvent.propTypes = {
  mainClasses: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  otherEvents: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  stTranslation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
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
