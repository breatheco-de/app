import React from 'react';
import { Box, Heading, Button } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';

const CallToAction = ({
  background, href, title, text, buttonText, width, onClick, margin,
}) => (
  <Box
    justifyContent="space-between"
    width={width}
    display="flex"
    bg={background}
    margin={margin}
    borderRadius="17px"
    paddingY="21px"
    paddingX="25px"
    flexDirection={{ base: 'column', lg: 'row' }}
  >
    <Box paddingRight="4vh">
      <Heading as="h5" fontSize="xsm" color="white" margin={0} marginBottom="11px">
        {title}
      </Heading>
      <Text color="white" size="l" margin={0}>
        {text}
      </Text>
    </Box>
    <Box padding={{ base: '24px 0 0 0', lg: '0' }} alignSelf="center">
      <Button as="a" href={href} marginY="auto" textTransform="uppercase" borderColor="white" color="white" variant="outline" onClick={onClick}>
        {buttonText}
      </Button>
    </Box>
  </Box>
);

CallToAction.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  buttonText: PropTypes.string,
  background: PropTypes.string,
  href: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  margin: PropTypes.string,
  onClick: PropTypes.func,
};

CallToAction.defaultProps = {
  title: 'What is next!',
  text: 'Your lesson today is Internet Architecture in First Time Website Module.',
  buttonText: 'Start Today\'s module',
  href: '#tasks_remain',
  background: 'blue',
  width: '100%',
  margin: '0 auto',
  onClick: () => {},
};

export default CallToAction;
