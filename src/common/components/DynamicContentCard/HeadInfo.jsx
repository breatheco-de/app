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

  if (days > 0) {
    return t('live-event:day', { count: days });
  }

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  }

  if (hours === 0 && minutes > 0) {
    return t('live-event:minute', { count: minutes });
  }

  return null;
};

function HeadInfo({ technologies, duration, type, date }) {
  const { t } = useTranslation('common');
  const { backgroundColor, featuredLight, lightColor } = useStyle();
  const startedButNotEnded = date?.started && date?.ended === false;
  const intervalDurationText = getIntervalDurationTranslation(date);
  const existsDuration = intervalDurationText || duration;
  const isWorkshop = type === 'workshop';
  const shouldDisplay = technologies?.length > 0 || existsDuration || isWorkshop;

  return (
    <Flex display={shouldDisplay ? 'flex' : 'none'} alignItems="center" justifyContent="space-between" width="100%">
      {technologies?.length > 0 ? (
        <Flex alignItems="center" gridGap="8px">
          {technologies.filter((tech) => tech.icon_url).map((tech) => {
            if (tech?.icon_url) {
              return (
                <Image src={tech?.icon_url} width={20} height={20} />
              );
            }
            return (
              <Text alignItems="center" gridGap="4px" background={featuredLight} padding="4px 10px" borderRadius="18px">
                {tech?.title}
              </Text>
            );
          })}
        </Flex>
      ) : <Box />}
      <Flex display={date?.ended ? 'none' : 'flex'} gridGap="10px" padding={isWorkshop ? '4px 0 0 0' : 'auto'} alignItems="center">
        {/* <--------------- Average time duration ---------------> */}
        {(Number.isInteger(duration) || date?.text) && (
          <Flex display={existsDuration ? 'flex' : 'none'} alignItems="center" gridGap="4px" background={backgroundColor} borderRadius="18px">
            <Icon icon="clock" width="14px" height="14px" />
            {intervalDurationText ? (
              <Text size="12px" fontWeight={700}>
                {intervalDurationText}
              </Text>
            ) : duration && (
              <Text>
                {t('hrs-average', { number: duration })}
                {/* {`${duration} min read`} */}
              </Text>
            )}
          </Flex>
        )}
        {/* <--------------- Time to start ---------------> */}
        {isWorkshop && (
          <>
            {startedButNotEnded ? (
              <Box display="flex" alignItems="center" height="auto" gridGap="8px" padding="4px 10px" color="danger" background="red.light" borderRadius="18px">
                <Icon icon="dot" color="currentColor" width="9px" height="9px" />
                <Text size="12px" fontWeight={700} lineHeight="14.4px">
                  {t('live-now')}
                </Text>
              </Box>
            ) : date?.text && (
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
