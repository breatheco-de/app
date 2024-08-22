import PropTypes from 'prop-types';
import { Box, useColorModeValue } from '@chakra-ui/react';
import useStyle from '../../hooks/useStyle';
import Heading from '../Heading';
import Text from '../Text';
import Icon from '../Icon';

function ContentHeading({
  content, children, callToAction, titleRightSide, isGuidedExperience, currentData,
}) {
  const { backgroundColor4 } = useStyle();
  const { title, subtitle, assetType } = content;
  const assetTypeIcons = {
    LESSON: 'book',
    EXERCISE: 'strength',
    PROJECT: 'code',
    QUIZ: 'answer',
  };
  console.log(assetType);

  if (assetType === 'PROJECT' && isGuidedExperience) {
    return (
      <Box
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <Box marginBottom="1.5rem">
          <Box
            background={backgroundColor4}
            margin={{ base: '0px -10px', md: '0px -2rem' }}
            borderRadius="11px 11px 0 0"
            padding="15px"
            borderBottom="1px solid #BBE5FE"
          >
            <Box display="flex" width={{ base: 'auto', md: 'calc(100% - 182px)' }} gridGap="16px" alignItems="center">
              <Icon icon={assetTypeIcons[assetType] || 'book'} height="30px" color="#0097CD" width="28px" style={{ margin: 'auto', marginRight: '0.4rem' }} />
              <Heading size="sm" display="inline-flex" gridGap="10px" margin="0 0 0 0 !important">
                {title}
              </Heading>
            </Box>
            {currentData?.description && (
              <Text size="l" marginTop="0.5rem">
                {currentData.description}
              </Text>
            )}
            {children}
          </Box>
        </Box>
      </Box>
    );
  }

  return content && Object.keys(content).length !== 0 && (
    <Box
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
    >
      <Box marginBottom="1.5rem">
        <Box
          display="flex"
          justifyContent="space-between"
          gridGap="16px"
          background={isGuidedExperience && backgroundColor4}
          margin={isGuidedExperience ? { base: '0px -10px', md: '0px -2rem' } : { base: '1rem 0 0 0', md: '2rem 0 0 0' }}
          borderRadius={isGuidedExperience && '11px 11px 0 0'}
          padding={isGuidedExperience && '15px'}
          borderBottom={isGuidedExperience && '1px solid #BBE5FE'}
        >
          <Box display="flex" width={{ base: 'auto', md: 'calc(100% - 182px)' }} gridGap="16px" alignItems="center">
            <Icon icon={assetTypeIcons[assetType] || 'book'} height="30px" color="#0097CD" width="28px" style={{ margin: 'auto', marginRight: '0.4rem' }} />
            <Heading size="m" display="inline-flex" gridGap="10px" margin="0 0 0 0 !important">
              {title}
            </Heading>
          </Box>
          {titleRightSide}
        </Box>
        {callToAction}
        {subtitle && (
          <Text size="l" marginTop="0.5rem">
            {subtitle}
          </Text>
        )}
      </Box>
      {children}
    </Box>
  );
}

ContentHeading.propTypes = {
  content: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  callToAction: PropTypes.node,
  titleRightSide: PropTypes.node,
  isGuidedExperience: PropTypes.bool,
  currentData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
ContentHeading.defaultProps = {
  content: {},
  callToAction: null,
  titleRightSide: null,
  isGuidedExperience: false,
  currentData: null,
};

export default ContentHeading;
