import { Box, Flex } from '@chakra-ui/react';
import Image from 'next/image';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Text from '../Text';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';

function HeadInfo({ technologies, duration, type, date }) {
  const { t } = useTranslation('common');
  const { backgroundColor, lightColor } = useStyle();
  const startedButNotEnded = date?.started && date?.ended === false;

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
        {/* tiempo de lectura */}
        {(Number.isInteger(duration) || date?.text) && (
          <Flex alignItems="center" gridGap="4px" background={backgroundColor} padding="4px 8px" borderRadius="18px">
            <Icon icon="clock" width="14px" height="14px" />
            {date?.text ? (
              <>
                <Text size="12px" fontWeight={700}>
                  {date?.intervalDurationDate?.days > 0 ? `${date?.intervalDurationDate?.days} days duration` : (
                    <>
                      {date?.intervalDurationDate?.hours > 0 && t('live-event:time-duration', { time: `${date?.intervalDurationDate?.hours}${date?.intervalDurationDate?.hours > 1 ? 'hrs' : 'hr'}` })}

                      {date?.intervalDurationDate?.hours === 0 && date?.intervalDurationDate?.minutes > 0 && t('live-event:time-duration', { time: `${date?.intervalDurationDate?.minutes}${date?.intervalDurationDate?.minutes > 1 ? 'mins' : 'min'}` })}
                    </>
                  )}
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
        {/* fecha de inicio */}
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
