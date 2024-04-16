import { Box, Flex, Img, Link } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { intervalToDuration } from 'date-fns';
import Icon from './Icon';
import Heading from './Heading';
import TagCapsule from './TagCapsule';
import Text from './Text';
import { isValidDate, syncInterval } from '../../utils';
import useStyle from '../hooks/useStyle';
// import { parseQuerys } from '../../utils/url';
// import modifyEnv from '../../../modifyEnv';

function EventCard({ id, language, slug, title, ignoreDynamicHandler, description, host, startingAt, endingAt, technologies, stTranslation, isSmall, ...rest }) {
  const { t, lang } = useTranslation('live-event');
  const [date, setDate] = useState('');
  const { lightColor, featuredColor } = useStyle();
  const startedButNotEnded = date?.started && date?.ended === false;
  // const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  // const accessToken = getStorageItem('accessToken');

  // const linkQuery = parseQuerys({
  //   token: accessToken || undefined,
  // });

  const startingSoonDelta = 30;

  const startingAtDate = isValidDate(startingAt) && new Date(startingAt);
  const endingAtDate = isValidDate(endingAt) && new Date(endingAt);

  const intervalDurationDate = startingAtDate && endingAtDate && intervalToDuration({
    start: startingAtDate,
    end: endingAtDate,
  });
  const languageConnector = (language === 'us' || language === 'en' || language === null) ? '' : `/${language}`;

  const formatTimeString = (start) => {
    const isValidDates = isValidDate(start);
    const duration = isValidDates && intervalToDuration({
      end: new Date(),
      start,
    });

    const formatDurationString = () => {
      const { months, days, hours, minutes } = duration;
      const averageHour = hours >= 1 && minutes > 0 ? hours + 1 : hours;

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
          ? stTranslation?.[lang]?.['live-event']?.['start-hours']?.replace('{{time}}', averageHour) || t('start-hours', { time: averageHour || 0 })
          : stTranslation?.[lang]?.['live-event']?.['start-hour']?.replace('{{time}}', averageHour) || t('start-hour', { time: averageHour || 0 });
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

  const textTime = ({ start, started, end, ended }) => {
    let formatedTime;
    if (ended) {
      formatedTime = formatTimeString(end);
      return stTranslation ? stTranslation?.[lang]?.['live-event'].ended.replace('{{time}}', formatedTime) : t('ended', { time: formatedTime });
    }
    formatedTime = formatTimeString(start);
    if (started) {
      return stTranslation ? stTranslation?.[lang]?.['live-event'].started.replace('{{time}}', formatedTime) : t('started', { time: formatedTime });
    }
    return stTranslation ? stTranslation?.[lang]?.['live-event']['will-start'].replace('{{time}}', formatedTime) : t('will-start', { time: formatedTime });
  };

  const formatedTime = (start, end) => {
    const started = start - new Date() <= startingSoonDelta;
    const ended = end - new Date() <= 0;

    return {
      text: textTime({ start, started, end, ended }),
      started,
      ended,
    };
  };

  useEffect(() => {
    setDate(formatedTime(startingAtDate, endingAtDate));

    syncInterval(() => {
      setDate(formatedTime(startingAtDate, endingAtDate));
    });
  }, []);

  return (
    <Flex flexDirection="column" gridGap="16px" width={isSmall ? '310px' : 'auto'} maxWidth={{ base: '260px', sm: '310px' }} borderRadius="12px" padding="16px" border={startedButNotEnded ? '2px solid' : '1px solid'} borderColor={startedButNotEnded ? 'blue.default' : 'gray.350'} background={startedButNotEnded ? featuredColor : 'inherit'} {...rest}>
      {/* -------------------------------- head event info -------------------------------- */}
      <Flex justifyContent="space-between" alignItems="center">
        <Box color={startedButNotEnded ? 'blue.default' : lightColor} display="flex" alignItems="center" gridGap="8px">
          <Icon icon="chronometer" color="currentColor" width="20px" height="20px" />
          <Text size="12px" fontWeight={700}>
            {intervalDurationDate?.hours > 0 && (stTranslation?.[lang]?.['live-event']?.['time-duration']?.replace('{{time}}', `${intervalDurationDate?.hours}${intervalDurationDate?.hours > 1 ? 'hrs' : 'hr'}`) || t('time-duration', { time: `${intervalDurationDate?.hours}${intervalDurationDate?.hours > 1 ? 'hrs' : 'hr'}` }))}

            {intervalDurationDate?.hours === 0 && intervalDurationDate?.minutes > 0 && (stTranslation?.[lang]?.['live-event']?.['time-duration']?.replace('{{time}}', `${intervalDurationDate?.minutes}${intervalDurationDate?.minutes > 1 ? 'mins' : 'min'}`) || t('time-duration', { time: `${intervalDurationDate?.minutes}${intervalDurationDate?.minutes > 1 ? 'mins' : 'min'}` }))}
          </Text>
        </Box>
        {startedButNotEnded ? (
          <Box display="flex" alignItems="center" height={isSmall ? '24px' : 'auto'} gridGap="8px" padding="4px 10px" color="danger" background="red.light" borderRadius="18px">
            <Icon icon="dot" color="currentColor" width="9px" height="9px" />
            <Text size="12px" fontWeight={700} lineHeight="14.4px">
              {stTranslation ? stTranslation[lang]['live-event']['live-now'] : t('live-now')}
            </Text>
          </Box>
        ) : (
          <Text size="12px" color={lightColor} fontWeight={700}>
            {date?.text}
          </Text>
        )}
      </Flex>

      <Heading size={isSmall ? '14px' : '24px'} letterSpacing={isSmall && '0.05em'} fontWeight={700} style={{ margin: '0' }}>
        {title}
      </Heading>

      {technologies?.length > 0 && (
        <TagCapsule tags={technologies} fontSize="13px" lineHeight="15.6px" borderRadius="20px" fontWeight={700} padding="8px 16px" margin="-5px 0 0 0" />
      )}

      {description && (
        <Text size={isSmall ? '12px' : '14px'}>
          {description}
        </Text>
      )}

      {/* -------------------------------- host info -------------------------------- */}
      {(host !== null && host !== undefined && host.length > 5 && !isSmall) && (typeof host === 'string' ? (
        <Heading as="span" fontWeight={700} style={{ fontSize: '14px' }}>
          {host}
        </Heading>
      ) : (
        <Flex gridGap="8px">
          <Box width="35px" height="35px">
            <Img src={host?.image ? host?.image : '/static/images/4geeks.png'} alt="teacher" width="100%" height="100%" borderRadius="50px" />
          </Box>
          <Box>
            <Heading size="14px" fontWeight={700}>
              {host?.full_name}
            </Heading>
            <Text size="12px" fontWeight={700}>{host?.job_title}</Text>
            {/* <Text size="12px" fontWeight={400}>
              {host?.job_title}
            </Text> */}
          </Box>
        </Flex>
      ))}
      {ignoreDynamicHandler && (
        <Link
          margin="auto 0 0 0"
          href={`${languageConnector}/workshops/${slug}`}
          color="blue.default"
          target="_blank"
          rel="noopener noreferrer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gridGap="10px"
        >
          {(ignoreDynamicHandler || startedButNotEnded)
            ? <>{stTranslation ? stTranslation[lang]['live-event']['join-event'] : t('join-event')}</>
            : <>{stTranslation ? stTranslation[lang]['live-event']['book-place'] : t('book-place')}</>}
          <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
        </Link>
      )}
    </Flex>
  );
}

EventCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  startingAt: PropTypes.string,
  endingAt: PropTypes.string,
  technologies: PropTypes.arrayOf(PropTypes.string),
  host: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]),
  stTranslation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  id: PropTypes.number.isRequired,
  slug: PropTypes.string.isRequired,
  ignoreDynamicHandler: PropTypes.bool,
  language: PropTypes.string,
  isSmall: PropTypes.bool,
};

EventCard.defaultProps = {
  description: 'Yorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsa.',
  startingAt: '',
  endingAt: '',
  technologies: [],
  host: '',
  stTranslation: null,
  ignoreDynamicHandler: false,
  language: '',
  isSmall: false,
};

export default EventCard;
