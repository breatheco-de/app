import { Box, Flex } from '@chakra-ui/react';
import Image from 'next/image';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Text from '../Text';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';

const getIntervalDurationTranslation = (date) => {
  const { t } = useTranslation('common');
  const { days, hours, minutes } = date?.intervalDurationDate || {};
  const hoursText = `${hours}${hours > 1 ? 'hrs' : 'hr'}`;
  const minutesText = `${minutes}${minutes > 1 ? 'mins' : 'min'}`;

  if (days > 0) {
    return `${days} days duration`;
  }

  if (hours > 0) {
    return t('live-event:time-duration', { time: hoursText });
  }

  if (hours === 0 && minutes > 0) {
    return t('live-event:time-duration', { time: minutesText });
  }

  return null;
};

function HeadInfo({ technologies, duration, type, date }) {
  const { t } = useTranslation('common');
  const { backgroundColor, lightColor } = useStyle();
  const startedButNotEnded = date?.started && date?.ended === false;
  const intervalDurationText = getIntervalDurationTranslation(date);

  return (
    <Flex alignItems="center" justifyContent="space-between" width="100%">
      {technologies?.length > 0 ? (
        <Flex alignItems="center" gridGap="8px">
          {technologies.map((tech) => {
            if (type === 'workshop') {
              return (
                <Text alignItems="center" gridGap="4px" background={backgroundColor} padding="4px 10px" borderRadius="18px">
                  {tech.title}
                </Text>
              );
            }
            if (tech?.icon_url) {
              return (
                <Image src={tech.icon_url} width={20} height={20} />
              );
            }
            return (
              <Text alignItems="center" gridGap="4px" background={backgroundColor} padding="4px 10px" borderRadius="18px">
                {tech?.title}
              </Text>
            );
          })}
        </Flex>
      ) : <Box />}
      <Flex gridGap="10px" alignItems="center">
        {/* read time */}
        {(Number.isInteger(duration) || date?.text) && (
          <Flex alignItems="center" gridGap="4px" background={backgroundColor} padding="4px 8px" borderRadius="18px">
            <Icon icon="clock" width="14px" height="14px" />
            {date?.text ? (
              <>
                <Text size="12px" fontWeight={700}>
                  {intervalDurationText}
                </Text>
              </>
            ) : (
              <Text>
                {t('hrs-average', { number: duration })}
                {/* {`${duration} min read`} */}
              </Text>
            )}
          </Flex>
        )}
        {/* starts at date */}
        {type === 'workshop' && (
          <>
            {startedButNotEnded ? (
              <Box display="flex" alignItems="center" height="auto" gridGap="8px" padding="4px 10px" color="danger" background="red.light" borderRadius="18px">
                <Icon icon="dot" color="currentColor" width="9px" height="9px" />
                <Text size="12px" fontWeight={700} lineHeight="14.4px">
                  {t('live-now')}
                </Text>
              </Box>
            ) : (
              <Text size="12px" color={lightColor} fontWeight={700}>
                {date?.text}
              </Text>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
}

HeadInfo.propTypes = {
  technologies: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    icon_url: PropTypes.string,
  })),
  duration: PropTypes.number,
  type: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};
HeadInfo.defaultProps = {
  technologies: [],
  duration: null,
};

export default HeadInfo;
