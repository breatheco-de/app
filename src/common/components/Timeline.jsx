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
  title, technologies, lessons, practice, code, answer, width, onClickAssignment,
}) => {
  const { colorMode } = useColorMode();
  const router = useRouter();
  // console.log(router.query.lessonSlug);
  const updatedLessons = lessons.map((el) => ({
    ...el,
    subtitle: 'Read',
    icon: 'book',
    task_type: 'LESSON',
    muted: el.slug !== router.query.lessonSlug,
  }));
  const updatedPractice = practice.map((el) => ({
    ...el,
    subtitle: 'Practice',
    icon: 'strength',
    task_type: 'EXERCISE',
    muted: el.slug !== router.query.lessonSlug,
  }));
  const updatedCode = code.map((el) => ({
    ...el,
    subtitle: 'Code',
    icon: 'code',
    task_type: 'PROJECT',
    muted: el.slug !== router.query.lessonSlug,
  }));
  const updatedAnswer = answer.map((el) => ({
    ...el,
    subtitle: 'Answer',
    icon: 'answer',
    task_type: 'QUIZ',
    muted: el.slug !== router.query.lessonSlug,
  }));

  const assignments = [...updatedLessons, ...updatedPractice, ...updatedCode, ...updatedAnswer];
  return (
    <Box width={width}>
      <Flex width="100%" marginBottom="1.5rem">
        <Text size="l" fontWeight="900" color={colorMode === 'light' ? 'gray.dark' : 'white'}>{title && title.toUpperCase()}</Text>
        <Text size="l" marginLeft="10px" fontWeight="400" color={colorMode === 'light' ? 'gray.dark' : 'white'}>
          {technologies && technologies.join(',').toUpperCase()}
        </Text>
      </Flex>
      <Box>
        {assignments && assignments.map((item, index) => {
          const mapIndex = index;
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
                <Box width="30px" height="30px" bg={item && !item?.muted ? 'blue.default' : 'gray.default'} borderRadius="50px">
                  <Text size="sm" margin={0} color="white" textAlign="center" position="relative" top="5px">{index + 1}</Text>
                </Box>
              </Box>
              <Flex cursor="pointer" onClick={(e) => onClickAssignment(e, item)} borderRadius="17px" bg={item && !item?.muted ? color[colorMode] : 'none'} paddingY="8px" paddingX="12px" marginLeft="1.5rem">
                <Box padding="8px" bg={item && !item?.muted ? 'blue.default' : 'none'} borderRadius="50px" height="36px" margin="auto">
                  <Icon width="20px" height="20px" icon={item && item?.icon} color={item?.muted ? 'gray' : 'white'} />
                </Box>
                <Box marginLeft="12px">
                  <Text size="sm" color={colorMode === 'light' ? 'gray.dark' : 'gray.light'} fontWeight="900" marginY={0}>{item && item?.subtitle?.toUpperCase()}</Text>
                  <Text size="l" fontWeight="400" marginY={0} color={colorMode === 'light' ? 'gray.dark' : 'gray.light'}>{item && item?.title}</Text>
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
  lessons: PropTypes.arrayOf(PropTypes.object),
  code: PropTypes.arrayOf(PropTypes.object),
  practice: PropTypes.arrayOf(PropTypes.object),
  answer: PropTypes.arrayOf(PropTypes.object),
  technologies: PropTypes.arrayOf(PropTypes.object),
  width: PropTypes.string,
  onClickAssignment: PropTypes.func,
};

Timeline.defaultProps = {
  title: '',
  lessons: [],
  code: [],
  practice: [],
  answer: [],
  technologies: [],
  width: '100%',
  onClickAssignment: () => {
  },
};

export default Timeline;
