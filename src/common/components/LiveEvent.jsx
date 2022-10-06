/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import {
  Box, useColorModeValue, Button,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { formatDuration, intervalToDuration } from 'date-fns';
import { es, en } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import CustomTheme from '../../../styles/theme';
import Link from './NextChakraLink';
import Text from './Text';
import Icon from './Icon';

const LiveEvent = ({
  liveUrl, liveStartsAt, otherEvents, startingSoonDelta, stTranslation, featureLabel, featureReadMoreUrl,
}) => {
  const { t, lang } = useTranslation('live-event');
  const [isOpen, setIsOpen] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.900');
  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');

  const availableLanguages = {
    es,
    en,
  };

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

  const isStartedOrStarting = (start) => {
    const interval = intervalToDuration({ end: new Date(), start });
    const {
      days, months, hours, years, minutes,
    } = interval;
    const totalTime = days + months + hours + years + minutes;
    return start - new Date() <= 0 || (totalTime === minutes && minutes <= startingSoonDelta);
  };

  const textStarted = (start) => {
    const started = start - new Date() <= startingSoonDelta;
    const formatedTime = formatTimeString(start);
    if (started) {
      return stTranslation ? stTranslation[lang]['live-event'].started.replace('{{time}}', formatedTime) : t('started', { time: formatedTime });
    }
    return stTranslation ? stTranslation[lang]['live-event']['will-start'].replace('{{time}}', formatedTime) : t('will-start', { time: formatedTime });
  };

  return (
    <Box
      padding="16px 10px"
      background={bgColor}
      border="1px solid"
      borderColor="#DADADA"
      borderRadius="11px"
      maxWidth="345px"
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
      <Box
        display="flex"
        alignItems="center"
        background={bgColor2}
        border={isStartedOrStarting(liveStartsAt) && '2px solid'}
        borderColor={CustomTheme.colors.blue.default2}
        padding="10px"
        borderRadius="50px"
        width="90%"
        margin="auto"
        cursor={isStartedOrStarting(liveStartsAt) && 'pointer'}
        onClick={() => {
          if (isStartedOrStarting(liveStartsAt)) window.open(liveUrl);
        }}
      >
        <Box
          borderRadius="full"
          width="50px"
          height="50px"
          className={isStartedOrStarting(liveStartsAt) ? 'pulse-red' : ''}
        >
          <Icon
            width="50px"
            height="50px"
            icon={isStartedOrStarting(liveStartsAt) ? 'live-event' : 'live-event-opaque'}
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
            fontSize="md"
            lineHeight="18px"
            fontWeight="700"
            color={textGrayColor}
            margin="0"
          >
            {textStarted(liveStartsAt)}
          </Text>
        </Box>
      </Box>
      {isOpen && (
        <Box marginTop="10px">
          {otherEvents.map((event) => (
            <Box
              display="flex"
              padding="10px"
              borderBottom="1px solid"
              width="90%"
              margin="auto"
              borderColor="#DADADA"
            >
              <Box width="37px" height="37px" className={isStartedOrStarting(event.starts_at) ? 'pulse-blue' : ''} borderRadius="full">
                <Icon fill={event.fill} color={event.color} style={{ flexShrink: 0 }} width="37px" height="37px" icon={event.icon} />
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
                  href={featureReadMoreUrl}
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
                    e.preventDefault();
                    window.open(event.liveUrl);
                  }}
                >
                  {event.title}
                </Link>
                <Text
                  fontSize="md"
                  lineHeight="18px"
                  fontWeight="500"
                  color={textGrayColor}
                  marginBottom="0"
                  marginTop="0"
                >
                  {textStarted(event.starts_at)}
                </Text>
              </Box>
            </Box>
          ))}
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
          {otherEvents.filter((e) => isStartedOrStarting(e.starts_at)).length !== 0 && (
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
  otherEvents: PropTypes.arrayOf(PropTypes.any),
  stTranslation: PropTypes.objectOf(PropTypes.any),
  startingSoonDelta: PropTypes.number,
  liveUrl: PropTypes.string.isRequired,
  featureLabel: PropTypes.string,
  featureReadMoreUrl: PropTypes.string,
};

LiveEvent.defaultProps = {
  otherEvents: [],
  stTranslation: null,
  startingSoonDelta: 30,
  featureLabel: null,
  featureReadMoreUrl: null,
};

export default LiveEvent;
