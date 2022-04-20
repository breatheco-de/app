import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import {
  Box, Flex, useColorMode, useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
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
  const { t } = useTranslation('syllabus');
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { cohortSlug, lessonSlug } = router.query;
  const fontColor1 = useColorModeValue('gray.dark', 'white');
  const fontColor2 = useColorModeValue('gray.dark', 'gray.light');

  // scroll scrollIntoView for id when lessonSlug changes
  const scrollIntoView = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  useEffect(() => {
    scrollIntoView(lessonSlug);
  }, []);

  return (
    <Box width={width}>
      <Flex width="100%" marginBottom="1.5rem">
        <Text size="l" fontWeight="900" color={fontColor1}>{title && title.toUpperCase()}</Text>
        {technologies.length >= 1 && (
          <Text
            size="l"
            textTransform="uppercase"
            display="flex"
            marginLeft="10px"
            fontWeight="400"
            color={fontColor1}
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
        {assignments.length > 0 ? assignments.map((item, index) => {
          const mapIndex = index;
          const assignmentPath = `/syllabus/${cohortSlug}/${item.type.toLowerCase()}/${item.slug}`;
          const muted = assignmentPath !== router.asPath;
          return (
            <Flex
              key={`${item?.id}-${mapIndex}`}
              id={item.slug}
              // href={`#${item.slug}`}
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
                  <Text size="sm" color={fontColor2} fontWeight="900" marginY={0}>{item.type}</Text>
                  <Text size="l" fontWeight="400" marginY={0} color={fontColor2}>{item.title}</Text>
                </Box>
              </Flex>
            </Flex>
          );
        }) : (
          <Text size="sm" margin={0} color={fontColor2} textAlign="left">
            {t('module-not-started')}
          </Text>
        )}
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

export default memo(Timeline);
