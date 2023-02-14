/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import {
  Box, useColorModeValue, Button, useToast, Avatar,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { formatDuration, intervalToDuration } from 'date-fns';
import { es, en } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import CustomTheme from '../../../styles/theme';
import bc from '../services/breathecode';
import Link from './NextChakraLink';
import Text from './Text';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';
import { isDateMoreThanAnyDaysAgo } from '../../utils';

const availableLanguages = {
  es,
  en,
};

const LiveEvent = ({
  // liveUrl,
  liveClassHash,
  liveStartsAt,
  liveEndsAt,
  otherEvents,
  startingSoonDelta,
  stTranslation,
  featureLabel,
  featureReadMoreUrl,
}) => {
  const { t, lang } = useTranslation('live-event');
  const { hexColor } = useStyle();
  const [isOpen, setIsOpen] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const bgColor = useColorModeValue('white', 'gray.900');
  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');

  const otherEventsSorted = otherEvents?.length > 0 ? otherEvents.sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at)) : [];
  const nearestEvent = otherEventsSorted[0];
  const restOfEvents = otherEventsSorted.slice(1);
  const featuredLiveEventStartsAt = liveStartsAt || nearestEvent?.starting_at;
  const featuredLiveEventEndsAt = liveEndsAt || nearestEvent?.ending_at;

  const liveStartsAtDate = new Date(featuredLiveEventStartsAt);
  const liveEndsAtDate = new Date(featuredLiveEventEndsAt);

  const toast = useToast();
  const getOtherEvents = () => {
    if (!liveStartsAt && nearestEvent) {
      return restOfEvents;
    }
    return otherEventsSorted;
  };

  const formatTimeString = (start, isMoreThan2Days = false) => {
    const duration = intervalToDuration({
      end: new Date(),
      start,
    });

    const formated = formatDuration(duration,
      {
        format: !isMoreThan2Days ? ['months', 'weeks', 'days', 'hours', 'minutes'] : ['months', 'weeks', 'days'],
        delimiter: ', ',
        locale: availableLanguages[lang],
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
    // initial time
    if (featuredLiveEventStartsAt) {
      setTimeAgo(textTime(liveStartsAtDate, liveEndsAtDate));
    }
    // update time every minute
    const interval = setInterval(() => {
      setTimeAgo(featuredLiveEventStartsAt ? textTime(liveStartsAtDate, liveEndsAtDate) : '');
    }, 60000);

    return () => clearInterval(interval);
  }, [featuredLiveEventStartsAt]);

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

  const getLiveIcon = () => {
    if (!liveStartsAt && nearestEvent) {
      return nearestEvent?.icon || 'group';
    }
    if (isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) {
      return 'live-event';
    }
    return 'live-event-opaque';
  };

  return (
    <Box
      padding="16px 25px"
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
      {featuredLiveEventStartsAt ? (
        <Box
          display="flex"
          alignItems="center"
          background={bgColor2}
          border={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) && '2px solid'}
          borderColor={CustomTheme.colors.blue.default2}
          padding="10px"
          borderRadius="50px"
          width="100%"
          margin="auto"
          cursor={(!liveStartsAt || isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) && 'pointer'}
          onClick={() => {
            // if (isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) window.open(liveUrl);
            if (liveStartsAt && isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) {
              bc.events().joinLiveClass(liveClassHash)
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
            if (!liveStartsAt) {
              window.open(nearestEvent?.liveUrl);
            }

            // href={featureReadMoreUrl || event?.live_url || event?.live_stream_url || '#'}
          }}
        >
          <Box
            borderRadius="full"
            width="50px"
            height="50px"
            className={
              isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
                ? `${!liveStartsAt ? 'pulse-blue' : 'pulse-red'}`
                : ''
            }
            opacity={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? '1' : '0.5'}
          >
            <Icon
              width="50px"
              height="50px"
              icon={getLiveIcon()}
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
              {liveStartsAt ? (
                <>
                  {stTranslation ? stTranslation[lang]['live-event']['live-class'] : t('live-class')}
                </>
              ) : (
                <>
                  {nearestEvent?.title}
                </>
              )}
            </Text>
            <Text
              fontSize="12px"
              lineHeight="18px"
              fontWeight="700"
              color={textGrayColor}
              margin="0"
            >
              {timeAgo}
            </Text>
          </Box>
        </Box>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          background={bgColor2}
          // border={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) && '2px solid'}
          borderColor=""
          padding="10px"
          borderRadius="50px"
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
        <Box marginTop="10px">
          {(liveStartsAt ? otherEventsSorted : restOfEvents).map((event) => {
            const startsAt = event?.starting_at && new Date(event.starting_at);
            const endsAt = event?.ending_at && new Date(event.ending_at);
            return (
              <Box
                display="flex"
                padding="10px"
                borderBottom="1px solid"
                width="100%"
                margin="auto"
                borderColor="#DADADA"
              >
                <Box width="37px" height="37px" className={isLiveOrStarting(startsAt, endsAt) ? 'pulse-blue' : ''} borderRadius="full">
                  {event?.icon_url ? (
                    <Avatar src={event?.icon_url} name="icon url" width="37px" height="37px" />
                  ) : (
                    <Icon fill={event.fill || hexColor.greenLight} color={event.color} style={{ flexShrink: 0 }} width="37px" height="37px" icon={event.icon || 'group'} />
                  )}
                </Box>
                <Box
                  display="flex"
                  justifyContent="center"
                  flexDirection="column"
                  marginLeft="10px"
                >
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={featureReadMoreUrl || event?.live_url || event?.live_stream_url || '#'}
                    color={textColor}
                    fontSize="md"
                    lineHeight="18px"
                    fontWeight="700"
                    letterSpacing="0.05em"
                    marginBottom="5px"
                    marginTop="0"
                    locale="en"
                    fontFamily="Lato, Sans-serif"
                    // onClick={(e) => {
                    //   e?.preventDefault();

                    //   bc.payment({ academy: event?.academy }).getEvent(event.id)
                    //     .then(({ data }) => {
                    //       if (data?.live_stream_url) {
                    //         window.open(data?.live_stream_url);
                    //       } else {
                    //         toast({
                    //           title: t('inactive-event'),
                    //           status: 'info',
                    //           duration: 5000,
                    //           isClosable: true,
                    //         });
                    //       }
                    //     })
                    //     .catch(() => {
                    //       toast({
                    //         title: t('no-access'),
                    //         status: 'error',
                    //         duration: 5000,
                    //         isClosable: true,
                    //       });
                    //     });
                    // }}
                  >
                    {event.title}
                  </Link>
                  <Text
                    fontSize="12px"
                    lineHeight="18px"
                    fontWeight="500"
                    color={textGrayColor}
                    marginBottom="0"
                    marginTop="0"
                  >
                    {startsAt ? textTime(startsAt, endsAt) : ''}
                  </Text>
                </Box>
              </Box>
            );
          })}
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
  liveStartsAt: PropTypes.instanceOf(Date).isRequired,
  liveEndsAt: PropTypes.instanceOf(Date).isRequired,
  otherEvents: PropTypes.arrayOf(PropTypes.any),
  stTranslation: PropTypes.objectOf(PropTypes.any),
  startingSoonDelta: PropTypes.number,
  // liveUrl: PropTypes.string.isRequired,
  featureLabel: PropTypes.string,
  featureReadMoreUrl: PropTypes.string,
  liveClassHash: PropTypes.string,
};

LiveEvent.defaultProps = {
  otherEvents: [],
  stTranslation: null,
  startingSoonDelta: 30,
  featureLabel: null,
  featureReadMoreUrl: null,
  liveClassHash: null,
};

export default LiveEvent;
