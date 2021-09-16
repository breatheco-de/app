import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  useColorMode,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

const CallToAction = (props) => {
  const {
    background, title, text, width,
  } = props;
  const { colorMode } = useColorMode();
  return (
    <Box justifyContent="space-between" width={width} display="flex" bg={colorMode === 'light' ? background || 'blue.light' : 'featuredDark'} borderRadius="17px" paddingY="21px" paddingX="25px">
      <Box>
        <Heading Heading as="h5" fontSize="22px" color="white" margin={0} marginBottom="11px">
          {title}
        </Heading>
        <Text color="white" fontSize="15px" margin={0}>
          {text}
        </Text>
      </Box>
      <Box alignSelf="center">
        <Button marginY="auto" borderColor="white" color="white" variant="outline">START TODAY’S MODULE</Button>
      </Box>
    </Box>
  );
};

CallToAction.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  background: PropTypes.string,
  width: PropTypes.string,
};
CallToAction.defaultProps = {
  title: 'Todays lessons',
  text: 'Your lesson today is Internet Architecture in First Time Website Module.',
  background: 'blue',
  width: '100%',
};

export default CallToAction;
