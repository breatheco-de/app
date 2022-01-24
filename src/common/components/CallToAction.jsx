import React from 'react';
import { Box, Heading, Button } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';

const CallToAction = (props) => {
  const {
    background, title, text, width, onClick,
  } = props;
  return (
    <Box
      justifyContent="space-between"
      width={width}
      display="flex"
      bg={background}
      borderRadius="17px"
      paddingY="21px"
      paddingX="25px"
      flexDirection={{ base: 'column', lg: 'row' }}
    >
      <Box>
        <Heading as="h5" fontSize="22px" color="white" margin={0} marginBottom="11px">
          {title}
        </Heading>
        <Text color="white" size="l" margin={0}>
          {text}
        </Text>
      </Box>
      <Box padding={{ base: '24px 0 0 0', lg: '0' }} alignSelf="center">
        <Button marginY="auto" borderColor="white" color="white" variant="outline" onClick={onClick}>
          START TODAY’S MODULE
        </Button>
      </Box>
    </Box>
  );
};

CallToAction.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  background: PropTypes.string,
  width: PropTypes.string,
  onClick: PropTypes.func,
};

CallToAction.defaultProps = {
  title: 'What is next!',
  text: 'Your lesson today is Internet Architecture in First Time Website Module.',
  background: 'blue',
  width: '100%',
  onClick: () => {},
};

export default CallToAction;
