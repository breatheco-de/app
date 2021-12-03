import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Flex, useColorMode,
} from '@chakra-ui/react';
import Icon from './Icon';
import Heading from './Heading';
import Text from './Text';

const color = {
  light: 'blue.light',
  dark: 'featuredDark',
};

const Timeline = ({
  title, assignments, width, onClickAssignment,
}) => {
  const { colorMode } = useColorMode();
  return (
    <Box width={width}>
      <Flex>
        <Heading size="m" fontWeight="900" color={colorMode === 'light' ? 'gray.dark' : 'white'}>WELCOME TO</Heading>
        <Heading size="m" marginLeft="10px" fontWeight="400" color={colorMode === 'light' ? 'gray.dark' : 'white'}>{title}</Heading>
      </Flex>
      <Box>
        {assignments.map((item, index) => (
          <Flex
            key={item.id}
            _before={{
              content: '""',
              position: 'absolute',
              width: '2px',
              height: assignments.length - 1 !== index ? '100%' : '0',
              bg: 'gray',
              left: '14px',
              zIndex: -15,
              top: '35%',
            }}
            position="relative"
            marginBottom="5px"
          >
            <Box marginY="auto">
              <Box width="30px" height="30px" bg={!item.muted ? 'blue.default' : 'gray.default'} borderRadius="50px">
                <Text size="sm" margin={0} color="white" textAlign="center" position="relative" top="5px">{index + 1}</Text>
              </Box>
            </Box>
            <Flex cursor="pointer" onClick={(e) => onClickAssignment(e, item)} borderRadius="17px" bg={!item.muted ? `${color[colorMode]}` : 'none'} paddingY="8px" paddingX="10px">
              <Box padding="8px" bg={item.muted ? 'blue.default' : 'none'} borderRadius="50px" height="36px" margin="auto">
                <Icon width="20px" height="20px" icon={item.icon} color={!item.muted ? 'white' : 'gray'} />
              </Box>
              <Box marginLeft="12px">
                <Text size="sm" color={colorMode === 'light' ? 'gray.dark' : 'gray.light'} fontWeight="900" marginY={0}>{item.title.toUpperCase()}</Text>
                <Text size="l" fontWeight="400" marginY={0} color={colorMode === 'light' ? 'gray.dark' : 'gray.light'}>{item.subtitle}</Text>
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
  assignments: PropTypes.arrayOf(PropTypes.array),
  width: PropTypes.string,
  onClickAssignment: PropTypes.func,
};

Timeline.defaultProps = {
  title: '',
  assignments: [],
  width: '100%',
  onClickAssignment: () => {
  },
};

export default Timeline;
