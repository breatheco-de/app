/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import {
  Box, useColorModeValue, Button, useToast, Tag, TagLabel, Divider,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { formatDuration, intervalToDuration } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import CustomTheme from '../../../../styles/theme';
import bc from '../../services/breathecode';
import Link from '../NextChakraLink';
import Text from '../Text';
import Icon from '../Icon';
import { getStorageItem, isDateMoreThanAnyDaysAgo } from '../../../utils';
import OtherEvents from './OtherEvents';
import useStyle from '../../hooks/useStyle';
import useTruncatedText from '../../hooks/useTruncatedText';
import modifyEnv from '../../../../modifyEnv';

const LiveEvent = ({
  // liveUrl,
  // liveClassHash,
  // liveStartsAt,
  // liveEndsAt,
  mainClasses,
  otherEvents,
  startingSoonDelta,
  stTranslation,
  featureLabel,
  featureReadMoreUrl,
}) => {
  const { t, lang } = useTranslation('live-event');
  const { hexColor, disabledColor, backgroundColor2 } = useStyle();
  const [isOpen, setIsOpen] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const accessToken = getStorageItem('accessToken');
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const bgColor = useColorModeValue('white', 'gray.900');
  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');

  const otherEventsSorted = otherEvents?.length > 0 ? otherEvents.sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at)) : [];
  const nearestEvent = otherEventsSorted[0];
  const restOfEvents = otherEventsSorted.slice(1);

  const mainEvents = mainClasses.length === 0 && nearestEvent ? [nearestEvent] : [...mainClasses];

  const textLimit = 35;

  const toast = useToast();
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
  const shortEnLocale = { formatDistance: (token, count) => formatDistanceLocale[lang][token].replace('{{count}}', count) };

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

  useEffect(() => {
    // This code is necessary to make the time messages update in real time
    // initial time
    let featuredLiveEventStartsAt;
    let featuredLiveEventEndsAt;
    if (mainEvents.length > 0) {
      featuredLiveEventStartsAt = new Date(mainEvents[0].starting_at);
      featuredLiveEventEndsAt = new Date(mainEvents[0].ending_at);
      setTimeAgo(textTime(featuredLiveEventStartsAt, featuredLiveEventEndsAt));

      // update time every minute
      const interval = setInterval(() => {
        setTimeAgo(featuredLiveEventStartsAt ? textTime(featuredLiveEventStartsAt, featuredLiveEventEndsAt) : '');
      }, 60000);

      return () => clearInterval(interval);
    }
    return null;
  }, [mainEvents]);

  const isLiveOrStarting = (start, end) => {
    const ended = end - new Date() <= 0;
    if (ended) return false;

    const interval = intervalToDuration({ end: new Date(), start });
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
    if (isLiveOrStarting(new Date(event.starting_at), new Date(event.ending_at))) {
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
          {mainEvents.map((event, index) => {
            const liveStartsAtDate = new Date(event.starting_at);
            const liveEndsAtDate = new Date(event.ending_at);

            const [truncatedText, handleMouseOver, handleMouseOut] = useTruncatedText(event?.title, textLimit);
            return (
              <>
                <Box
                  display="flex"
                  alignItems="center"
                  cursor={
                    (!event.liveClassHash
                      || isLiveOrStarting(liveStartsAtDate, liveEndsAtDate))
                    && 'pointer'
                  }
                  onClick={() => {
                    if (
                      event.liveClassHash
                      && isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
                    ) {
                      bc.events()
                        .joinLiveClass(event.liveClassHash)
                        .then((resp) => {
                          if (resp.data?.url) {
                            window.open(resp.data?.url);
                          } else {
                            toast({
                              title: t('alert-message:no-link-exist'),
                              status: 'info',
                              duration: 4000,
                              isClosable: true,
                            });
                          }
                        })
                        .catch(() => {
                          toast({
                            title: t('alert-message:something-went-wrong'),
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                          });
                        });
                    }
                    if (!event.liveClassHash) {
                      window.open(
                        `${BREATHECODE_HOST}/v1/events/me/event/${nearestEvent?.id}/join?token=${accessToken}`,
                      );
                    }
                  }}
                >
                  <Box
                    borderRadius="full"
                    width="50px"
                    height="50px"
                    className={
                      isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
                        ? `${
                          mainClasses.length === 0
                            ? 'pulse-blue'
                            : 'pulse-red'
                        }`
                        : ''
                    }
                    opacity={
                      isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
                        ? '1'
                        : '0.5'
                    }
                    position="relative"
                  >
                    {mainEvents.length <= 1
                      && getOtherEvents().filter((e) => isLiveOrStarting(
                        new Date(e?.starting_at),
                        new Date(e?.ending_at),
                      ))?.length !== 0 && (
                        <Box
                          borderRadius="full"
                          width="17px"
                          height="17px"
                          background={CustomTheme.colors.danger}
                          position="absolute"
                          color={CustomTheme.colors.white}
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          left="75%"
                        >
                          <Text
                            linHeight="18px"
                            textAlign="center"
                            fontSize="14px"
                            fontWeight="900"
                          >
                            {
                              getOtherEvents().filter((e) => isLiveOrStarting(
                                new Date(e?.starting_at),
                                new Date(e?.ending_at),
                              )).length
                            }
                          </Text>
                        </Box>
                    )}
                    <Icon
                      width="50px"
                      height="50px"
                      icon={getLiveIcon(event)}
                    />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="center"
                    flexDirection="column"
                    marginLeft="10px"
                    width="100%"
                  >
                    <Text
                      size="15px"
                      lineHeight="18px"
                      fontWeight="900"
                      color={textColor}
                      opacity={
                        isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
                          ? 1
                          : 0.5
                      }
                      marginBottom="5px"
                      marginTop="0"
                      onMouseOver={handleMouseOver}
                      onMouseOut={handleMouseOut}
                    >
                      {truncatedText ? (
                        <>{truncatedText}</>
                      ) : (
                        <>
                          {stTranslation
                            ? stTranslation[lang]['live-event']['live-class']
                            : t('live-class')}
                        </>
                      )}
                    </Text>
                    <Box display="flex" justifyContent="space-between">
                      {(event.subLabel || event.type) && (
                        <Tag
                          size="sm"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="green"
                          width="fit-content"
                          background={backgroundColor2}
                          height="20px"
                        >
                          <TagLabel
                            fontWeight="700"
                            color={hexColor.blueDefault}
                            opacity={
                              isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
                                ? 1
                                : 0.5
                            }
                          >
                            {event.subLabel || event.type}
                          </TagLabel>
                        </Tag>
                      )}
                      {isLive(liveStartsAtDate, liveEndsAtDate) ? (
                        <Tag
                          size="sm"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="green"
                          width="fit-content"
                          background={CustomTheme.colors.red.light}
                        >
                          <TagLabel
                            fontWeight="700"
                            color={CustomTheme.colors.danger}
                          >
                            {stTranslation ? `• ${stTranslation[lang]['live-event']['live-now']}` : `• ${t('live-now')}`}
                          </TagLabel>
                        </Tag>
                      ) : (
                        <Text
                          fontSize="14px"
                          lineHeight="18px"
                          fontWeight={500}
                          color={disabledColor}
                          marginBottom="0"
                          marginTop="0"
                        >
                          {timeAgo}
                        </Text>

                      )}
                    </Box>
                  </Box>
                </Box>
                {index !== mainEvents.length - 1 && <Divider margin="10px 0" />}
              </>
            );
          })}
        </Box>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          background={bgColor2}
          // border={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) && '2px solid'}
          borderColor=""
          padding="10px"
          borderRadius="19px"
          width="100%"
          margin="auto"
        // cursor={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) && 'pointer'}
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
  // liveClassHash: PropTypes.string,
  // liveStartsAt: PropTypes.instanceOf(Date).isRequired,
  // liveEndsAt: PropTypes.instanceOf(Date).isRequired,
  mainClasses: PropTypes.arrayOf(PropTypes.any),
  otherEvents: PropTypes.arrayOf(PropTypes.any),
  stTranslation: PropTypes.objectOf(PropTypes.any),
  startingSoonDelta: PropTypes.number,
  // liveUrl: PropTypes.string.isRequired,
  featureLabel: PropTypes.string,
  featureReadMoreUrl: PropTypes.string,
};

LiveEvent.defaultProps = {
  // liveClassHash: null,
  mainClasses: [],
  otherEvents: [],
  stTranslation: null,
  startingSoonDelta: 30,
  featureLabel: null,
  featureReadMoreUrl: null,
};

export default LiveEvent;
