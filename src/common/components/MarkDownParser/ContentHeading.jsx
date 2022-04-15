import PropTypes from 'prop-types';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Heading from '../Heading';
import Text from '../Text';
import Icon from '../Icon';

const ContentHeading = ({ content, children, callToAction }) => {
  const { title, subtitle, assetType } = content;
  const assetTypeIcons = {
    LESSON: 'book',
    EXERCISE: 'strength',
    PROJECT: 'code',
    QUIZ: 'answer',
  };

  return (
    <Box
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
      paddingBottom="2rem"
      marginBottom="2rem"
    >
      {content && (
      <Box marginBottom="1.2rem">
        <Heading size="m" display="inline-flex" marginTop="1.5rem">
          <Icon icon={assetTypeIcons[assetType] || 'book'} height="30px" color="#0097CD" width="28px" style={{ margin: 'auto', marginRight: '0.4rem' }} />
          {' '}
          {title}
        </Heading>
        {callToAction}
        <Text size="l" marginTop="0.5rem">
          {subtitle}
        </Text>
      </Box>
      )}
      {children}
    </Box>
  );
};

ContentHeading.propTypes = {
  content: PropTypes.objectOf(PropTypes.any),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  callToAction: PropTypes.node,
};
ContentHeading.defaultProps = {
  content: {},
  callToAction: null,
};

export default ContentHeading;
