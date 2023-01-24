/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import {
  Box, useColorModeValue, Button, useToast,
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
  const liveStartsAtDate = new Date(liveStartsAt);
  const liveEndsAtDate = new Date(liveEndsAt);
  const { hexColor } = useStyle();

  const toast = useToast();

  const formatTimeString = (start) => {
    const duration = intervalToDuration({
      end: new Date(),
      start,
    });

    const formated = formatDuration(duration,
      {
        format: ['months', 'weeks', 'days', 'hours', 'minutes'],
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

  const [isOpen, setIsOpen] = useState(false);
  const [timeAgo, setTimeAgo] = useState(liveStartsAt ? textTime(liveStartsAtDate, liveEndsAtDate) : '');
  const bgColor = useColorModeValue('white', 'gray.900');
  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(liveStartsAt ? textTime(liveStartsAtDate, liveEndsAtDate) : '');
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <Box
      padding="16px 10px"
      background={bgColor}
      border="1px solid"
      borderColor="#DADADA"
      borderRadius="11px"
      maxWidth="320"
      minWidth="320px"
    >
      {(featureLabel || featureReadMoreUrl) && (
      <Text
        fontSize="md"
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
      {liveStartsAt ? (
        <Box
          display="flex"
          alignItems="center"
          background={bgColor2}
          border={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) && '2px solid'}
          borderColor={CustomTheme.colors.blue.default2}
          padding="10px"
          borderRadius="50px"
          width="90%"
          margin="auto"
          cursor={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) && 'pointer'}
          onClick={() => {
            // if (isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) window.open(liveUrl);
            if (isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) {
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
          }}
        >
          <Box
            borderRadius="full"
            width="50px"
            height="50px"
            className={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? 'pulse-red' : ''}
          >
            <Icon
              width="50px"
              height="50px"
              icon={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? 'live-event' : 'live-event-opaque'}
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
              fontSize="sm"
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
          width="90%"
          margin="auto"
          // cursor={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) && 'pointer'}
        >
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
              fontSize="md"
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
          {otherEvents.map((event) => {
            const startsAt = event?.starting_at && new Date(event.starting_at);
            const endsAt = event?.ending_at && new Date(event.ending_at);
            return (
              <Box
                display="flex"
                padding="10px"
                borderBottom="1px solid"
                width="90%"
                margin="auto"
                borderColor="#DADADA"
              >
                <Box width="37px" height="37px" className={isLiveOrStarting(startsAt, endsAt) ? 'pulse-blue' : ''} borderRadius="full">
                  <Icon fill={event.fill || hexColor.greenLight} color={event.color} style={{ flexShrink: 0 }} width="37px" height="37px" icon={event.icon || 'group'} />
                </Box>
                <Box
                  display="flex"
                  justifyContent="center"
                  flexDirection="column"
                  marginLeft="10px"
                >
                  <Link
                    // target="_blank"
                    // rel="noopener noreferrer"
                    // href={featureReadMoreUrl || event?.liveUrl || '#'}
                    href={featureReadMoreUrl || '#'}
                    color={textColor}
                    fontSize="md"
                    lineHeight="18px"
                    fontWeight="700"
                    letterSpacing="0.05em"
                    marginBottom="5px"
                    marginTop="0"
                    locale="en"
                    fontFamily="Lato, Sans-serif"
                    onClick={(e) => {
                      e?.preventDefault();

                      bc.payment({ academy: event?.academy }).getEvent(event.id)
                        .then(({ data }) => {
                          if (data?.live_stream_url) {
                            window.open(data?.live_stream_url);
                          } else {
                            toast({
                              title: t('inactive-event'),
                              status: 'info',
                              duration: 5000,
                              isClosable: true,
                            });
                          }
                        });
                      // .catch(() => {
                      //   toast({
                      //     title: t('no-access'),
                      //     status: 'error',
                      //     duration: 5000,
                      //     isClosable: true,
                      //   });
                      // });
                    }}
                  >
                    {event.title}
                  </Link>
                  <Text
                    fontSize="sm"
                    lineHeight="18px"
                    fontWeight="500"
                    color={textGrayColor}
                    marginBottom="0"
                    marginTop="0"
                  >
                    {liveStartsAt ? textTime(startsAt, endsAt) : ''}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
      {otherEvents.length !== 0 && (
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
          {otherEvents.filter((e) => isLiveOrStarting(new Date(e.starting_at), new Date(e.ending_at))).length !== 0 && (
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
