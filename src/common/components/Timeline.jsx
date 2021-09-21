import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Heading, Flex, VStack, Text,
} from '@chakra-ui/react';
import Icon from './Icon';

const Timeline = ({ title, lessons, width }) => {
  const test = 0;
  return (
    <Box>
      <Flex>
        <Heading fontSize="22px" color="gray.dark" fontWeight="900">WELCOME</Heading>
        <Heading fontSize="22px" marginLeft="10px" color="gray.dark" fontWeight="400">{title}</Heading>
      </Flex>
      <VStack>
        <Flex justifyContent="space-between">
          <Box padding="10px" bg="blue.default" borderRadius="50px" height="20px">
            <Icon width="20px" height="20px" icon="book" color="white" />
          </Box>
          <Box marginLeft="12px">
            <Heading fontSize="18px" color="gray.dark" fontWeight="900" marginY={0}>READ</Heading>
            <Text fontSize="15px" color="gray.dark" fontWeight="400" marginY={0}>Introduction to the prework</Text>
          </Box>
        </Flex>
      </VStack>
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
  width: '100',
};

export default Timeline;
