import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Flex, useColorMode,
} from '@chakra-ui/react';
import Icon from './Icon';
import Heading from './Heading';
import Text from './Text';

const Timeline = ({ title, lessons, width }) => {
  const { colorMode } = useColorMode();
  return (
    <Box width={width}>
      <Flex>
        <Heading size="m" fontWeight="900" color={colorMode === 'light' ? 'gray.dark' : 'white'}>WELCOME TO</Heading>
        <Heading size="m" marginLeft="10px" fontWeight="400" color={colorMode === 'light' ? 'gray.dark' : 'white'}>{title}</Heading>
      </Flex>
      <Box>
        {lessons.map((item, index) => (
          <Flex
            key={item.id}
            _before={{
              content: '""',
              position: 'absolute',
              width: '2px',
              height: '100%',
              bg: 'gray',
              left: '14px',
              zIndex: -15,
              top: '23%',
            }}
            position="relative"
          >
            <Box marginY="auto">
              <Box width="30px" height="30px" bg="blue.default" borderRadius="50px">
                <Text size="sm" margin={0} color="white" textAlign="center" position="relative" top="5px">{index + 1}</Text>
              </Box>
            </Box>
            <Flex borderRadius="17px" _hover={{ bg: colorMode === 'light' ? 'blue.light' : 'featuredDark' }} paddingY="7px" paddingX="9px">
              <Box padding="8px" bg="blue.default" borderRadius="50px" height="36px" margin="auto">
                <Icon width="20px" height="20px" icon={item.icon} color="white" />
              </Box>
              <Box marginLeft="12px">
                <Heading size="sm" color={colorMode === 'light' ? 'gray.dark' : 'white'} fontWeight="900" marginY={0}>{item.title.toUpperCase()}</Heading>
                <Text size="l" fontWeight="400" marginY={0} color={colorMode === 'light' ? 'gray.dark' : 'white'}>{item.subtitle}</Text>
              </Box>
            </Flex>
          </Flex>
        ))}
      </Box>
    </Box>
  );
};

Timeline.propTypes = {
  title: PropTypes.string,
  lessons: PropTypes.arrayOf(PropTypes.array),
  width: PropTypes.string,
};
Timeline.defaultProps = {
  title: '',
  lessons: [],
  width: '100%',
};

export default Timeline;
