import { Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useStyle from '../../hooks/useStyle';
import Text from '../Text';
import Icon from '../Icon';

function FeatureIndicator({ data, type }) {
  const { backgroundColor } = useStyle();
  const lang = data?.lang;
  const langData = {
    en: {
      title: 'Eng',
      icon: 'usaFlag',
    },
    us: {
      title: 'Eng',
      icon: 'usaFlag',
    },
    es: {
      title: 'Esp',
      icon: 'spainFlag',
    },
  };
  return (
    <Flex id="feature_indicator" _empty={{ display: 'none' }} margin="0 0 0 auto" gridGap="10px" alignItems="center">
      {type === 'workshop' ? (
        <Flex display={langData?.[lang]?.title ? 'flex' : 'none'} alignItems="center" gridGap="8px" background={backgroundColor} padding="4px 10px" borderRadius="18px">
          <Text size="12px" textTransform="uppercase">
            {langData?.[lang]?.title}
          </Text>
          <Icon icon={langData?.[lang]?.icon} width="15px" height="15px" />
        </Flex>
      ) : (
        <>
          {(['project', 'exercise'].includes(type)) && (
            <>
              <Icon icon="rigobot-avatar-tiny" width="20px" height="18px" />
              {data?.interactive && (
                <>
                  <Icon icon="learnpack" width="18px" height="18px" />
                  {data?.solution_url && (
                    <Icon icon="download" color="currentColor" width="18px" height="14px" />
                  )}
                </>
              )}
            </>
          )}
          {data?.intro_video_url && (
            <Icon icon="tv-live" width="18px" height="18px" />
          )}
        </>
      )}
    </Flex>
  );
}

FeatureIndicator.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.objectOf(PropTypes.oneOfType(PropTypes.any)).isRequired,
};

export default FeatureIndicator;
