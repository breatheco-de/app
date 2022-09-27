/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
import { useState } from 'react';
import {
  Box, useColorModeValue, Image, Button,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { formatDuration, intervalToDuration } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import CustomTheme from '../../../styles/theme';
import Link from './NextChakraLink';
import Text from './Text';
import Icon from './Icon';

const LiveEvent = ({ startsAt, otherEvents }) => {
  const { t } = useTranslation('live-event');
  const [isOpen, setIsOpen] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.900');
  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');

  const formatTimeString = (start) => {
    const duration = intervalToDuration({
      end: new Date(),
      start,
    });

    return formatDuration(duration,
      { format: ['months', 'weeks', 'days', 'hours', 'minutes'], delimiter: ', ' });
  };

  const isStartedOrStarting = (start) => {
    const interval = intervalToDuration({ end: new Date(), start });
    const {
      days, months, hours, years, minutes,
    } = interval;
    const totalTime = days + months + hours + years + minutes;
    return start - new Date() <= 0 || (totalTime === minutes && minutes <= 30);
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
      <Text
        fontSize="md"
        lineHeight="19px"
        fontWeight="700"
        color={textColor}
        textAlign="center"
        marginBottom="15px"
      >
        {t('title')}
        {' '}
        <Link
          // target="_blank"
          rel="noopener noreferrer"
          href="#"
          color={useColorModeValue('blue.default', 'blue.300')}
          display="inline-block"
          letterSpacing="0.05em"
          locale="en"
          fontFamily="Lato, Sans-serif"
        >
          {t('learn-more')}
        </Link>
      </Text>
      <Box
        display="flex"
        alignItems="center"
        background={bgColor2}
        border={startsAt - new Date() <= 30 && '2px solid'}
        borderColor={CustomTheme.colors.blue.default2}
        padding="5px"
        borderRadius="50px"
        width="90%"
        margin="auto"
      >
        <Box
          borderRadius="full"
          width="50px"
          height="50px"
          className={startsAt - new Date() <= 30 ? 'pulse-red' : ''}
        >
          <Icon width="50px" height="50px" icon="youtube" color={startsAt - new Date() >= 30 && CustomTheme.colors.gray[350]} />
        </Box>
        {/* <Image
          className={startsAt - new Date() <= 30 ? 'pulse-red' : ''}
          borderRadius="full"
          src={startsAt - new Date() <= 30 ? '/static/images/live-event.png' : '/static/images/non-live-event.png'}
        /> */}
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
          >
            {t('live-class')}
          </Text>
          <Text
            fontSize="md"
            lineHeight="18px"
            fontWeight="700"
            color={textGrayColor}
          >
            {startsAt - new Date() <= 30 ? t('started', { time: formatTimeString(startsAt) }) : t('will-start', { time: formatTimeString(startsAt) })}
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
                <Text
                  fontSize="md"
                  lineHeight="18px"
                  fontWeight="700"
                  color={textColor}
                  marginBottom="5px"
                >
                  {event.title}
                </Text>
                <Text
                  fontSize="md"
                  lineHeight="18px"
                  fontWeight="500"
                  color={textGrayColor}
                >
                  {event.starts_at - new Date() <= 0 ? t('started', { time: formatTimeString(event.starts_at) }) : t('will-start', { time: formatTimeString(event.starts_at) })}
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
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          {otherEvents.filter((e) => isStartedOrStarting(e.starts_at)).length !== 0 && (
            <Icon width="16px" height="16px" icon="on-live" style={{ display: 'inline-block', marginRight: '5px' }} />
          )}
          {t('upcoming')}
          {isOpen ? (<ChevronUpIcon w={6} h={7} />) : (<ChevronDownIcon w={6} h={7} />)}
        </Button>
      )}
    </Box>
  );
};

LiveEvent.propTypes = {
  startsAt: PropTypes.instanceOf(Date).isRequired,
  otherEvents: PropTypes.arrayOf(PropTypes.any),
};

LiveEvent.defaultProps = {
  otherEvents: [],
};

export default LiveEvent;
