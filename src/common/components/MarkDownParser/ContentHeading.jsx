import PropTypes from 'prop-types';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Heading from '../Heading';
import Text from '../Text';
import Icon from '../Icon';

function ContentHeading({
  content, children, callToAction, titleRightSide,
}) {
  const { title, subtitle, assetType } = content;
  const assetTypeIcons = {
    LESSON: 'book',
    EXERCISE: 'strength',
    PROJECT: 'code',
    QUIZ: 'answer',
  };

  return content && Object.keys(content).length !== 0 && (
    <Box
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
    >
      <Box marginBottom="1.5rem">
        <Box display="flex" justifyContent="space-between" gridGap="16px" margin={{ base: '1rem 0 0 0', md: '2rem 0 0 0' }}>
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
};
ContentHeading.defaultProps = {
  content: {},
  callToAction: null,
  titleRightSide: null,
};

export default ContentHeading;
