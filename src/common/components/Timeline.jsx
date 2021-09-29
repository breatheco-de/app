import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Flex,
} from '@chakra-ui/react';
import Icon from './Icon';
import Heading from './Heading';
import Text from './Text';

const Timeline = ({ title, lessons, width }) => (
  <Box width={width}>
    <Flex>
      <Heading size="m" color="gray.dark" fontWeight="900">WELCOME TO</Heading>
      <Heading size="m" marginLeft="10px" color="gray.dark" fontWeight="400">{title}</Heading>
    </Flex>
    <Box
      _before={{
        content: '""',
        position: 'absolute',
        width: '2px',
        height: '80%',
        bg: 'gray',
        left: '14px',
        zIndex: -15,
        top: '11%',
        bottom: '11%',
      }}
      position="relative"
    >
      {lessons.map((item, index) => (
        <Flex justifyContent="space-between" key={item.id}>
          <Box marginY="auto">
            <Box width="30px" height="30px" bg="blue.default" borderRadius="50px">
              <Text size="sm" margin={0} color="white" textAlign="center" position="relative" top="5px">{index + 1}</Text>
            </Box>
          </Box>
          <Flex borderRadius="17px" _hover={{ bg: 'blue.light' }} paddingY="7px" paddingX="9px">
            <Box padding="8px" bg="blue.default" borderRadius="50px" height="20px" margin="auto">
              <Icon width="20px" height="20px" icon={item.icon} color="white" />
            </Box>
            <Box marginLeft="12px">
              <Heading size="sm" color="gray.dark" fontWeight="900" marginY={0}>{item.title.toUpperCase()}</Heading>
              <Text size="l" color="gray.dark" fontWeight="400" marginY={0}>{item.subtitle}</Text>
            </Box>
          </Flex>
        </Flex>
      ))}
    </Box>
  </Box>
);

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
