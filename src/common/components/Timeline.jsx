import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import {
  Box, Flex, useColorMode,
} from '@chakra-ui/react';
import Icon from './Icon';
// import Heading from './Heading';
import Text from './Text';

const color = {
  light: 'blue.light',
  dark: 'featuredDark',
};

const Timeline = ({
  title, assignments, technologies, width, onClickAssignment,
}) => {
  const { colorMode } = useColorMode();
  const router = useRouter();

  return (
    <Box width={width}>
      <Flex width="100%" marginBottom="1.5rem">
        <Text size="l" fontWeight="900" color={colorMode === 'light' ? 'gray.dark' : 'white'}>{title && title.toUpperCase()}</Text>
        {technologies.length >= 1 && (
          <Text
            size="l"
            textTransform="uppercase"
            display="flex"
            marginLeft="10px"
            fontWeight="400"
            color={colorMode === 'light' ? 'gray.dark' : 'white'}
          >
            {'<'}
            {technologies && technologies.map((tech, index) => {
              const techIndex = index;
              return (
                <Box key={techIndex}>
                  {tech}

                  {index < technologies.length - 1 && (
                    <Box as="span" userSelect="none" fontSize="15px" mx="0.3rem">
                      /
                    </Box>
                  )}
                </Box>
              );
            })}
            {'>'}
          </Text>
        )}
      </Flex>
      <Box>
        {assignments && assignments.map((item, index) => {
          const mapIndex = index;
          const { cohortSlug } = router.query;
          const assignmentPath = `/syllabus/${cohortSlug}/${item.type.toLowerCase()}/${item.slug}`;
          const muted = assignmentPath !== router.asPath;
          return (
            <Flex
              key={`${item?.id}-${mapIndex}`}
              _before={{
                content: '""',
                position: 'absolute',
                width: '2px',
                height: assignments.length - 1 !== index ? '100%' : '0',
                bg: 'gray',
                left: '14px',
                zIndex: -15,
                top: '55%',
              }}
              position="relative"
              marginBottom="5px"
              width="100%"
            >
              <Box marginY="auto">
                <Box width="30px" height="30px" bg={!muted ? 'blue.default' : 'gray.default'} borderRadius="50px">
                  <Text size="sm" margin={0} color="white" textAlign="center" position="relative" top="5px">{index + 1}</Text>
                </Box>
              </Box>
              <Flex cursor="pointer" onClick={(e) => onClickAssignment(e, item)} borderRadius="17px" bg={!muted ? color[colorMode] : 'none'} paddingY="8px" paddingX="12px" marginLeft="1.5rem">
                <Box padding="8px" bg={!muted ? 'blue.default' : 'none'} borderRadius="50px" height="36px" margin="auto">
                  <Icon width="20px" height="20px" icon={item && item?.icon} color={muted ? 'gray' : 'white'} />
                </Box>
                <Box marginLeft="12px">
                  <Text size="sm" color={colorMode === 'light' ? 'gray.dark' : 'gray.light'} fontWeight="900" marginY={0}>{item.type}</Text>
                  <Text size="l" fontWeight="400" marginY={0} color={colorMode === 'light' ? 'gray.dark' : 'gray.light'}>{item.title}</Text>
                </Box>
              </Flex>
            </Flex>
          );
        })}
      </Box>
    </Box>
  );
};

Timeline.propTypes = {
  title: PropTypes.string,
  assignments: PropTypes.arrayOf(PropTypes.any),
  technologies: PropTypes.arrayOf(PropTypes.object),
  width: PropTypes.string,
  onClickAssignment: PropTypes.func,
};

Timeline.defaultProps = {
  title: '',
  assignments: [],
  technologies: [],
  width: '100%',
  onClickAssignment: () => {},
};

export default Timeline;
