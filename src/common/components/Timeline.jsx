import React, {
  useEffect, memo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import {
  Box,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import Text from './Text';

function Timeline({
  title, assignments, technologies, width, onClickAssignment, showPendingTasks,
}) {
  const { t, lang } = useTranslation('syllabus');
  const router = useRouter();
  const { lessonSlug } = router.query;
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const fontColor1 = useColorModeValue('gray.dark', 'white');
  const fontColor2 = useColorModeValue('gray.dark', 'gray.light');
  const bgColor = useColorModeValue('blue.light', 'featuredDark');

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
    if (assignments?.length > 0) {
      const assignmentFound = assignments.find((item) => (
        item?.translations?.us?.slug === lessonSlug
        || item?.translations?.es?.slug === lessonSlug
        || item?.slug === lessonSlug
      ));
      setCurrentAssignment(assignmentFound);
    }
  }, [lessonSlug, assignments]);

  useEffect(() => {
    if (currentAssignment?.slug) {
      scrollIntoView(currentAssignment.slug);
    }
  }, [currentAssignment]);
  const handleClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    onClickAssignment(e, item);
  };

  const getAssignmentTitle = (item) => {
    if (!item?.translations) return item?.title;

    return lang === 'en' ? (item?.translations?.en?.title || item?.translations?.us?.title)
      : (item?.translations?.[lang]?.title || item?.title);
  };

  return (
    <>
      <Flex width={width} marginBottom="1.5rem">
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
          const muted = item?.slug !== currentAssignment?.slug;
          const assignmentTitle = getAssignmentTitle(item);

          return (
            <Box
              key={`${item?.id}-${mapIndex}`}
              id={item.slug}
              display="grid"
              gridTemplateColumns="2px 1fr"
              position="relative"
              gridGap={{ base: '2.4rem', md: '2.8rem' }}
              width="100%"
            >
              <Box position="relative" background={index === assignments.length - 1 ? useColorModeValue('white', 'darkTheme') : 'gray'} left="14px" top="12px">
                <Box position="relative" right="14px">
                  <Box width="30px" height="30px" bg={!muted ? 'blue.default' : 'gray.default'} borderRadius="50px">
                    <Text size="sm" margin={0} color="white" textAlign="center" position="relative" top="5px">{index + 1}</Text>
                  </Box>
                </Box>
              </Box>
              <Flex cursor="pointer" onClick={(e) => handleClick(e, item)} width="100%" borderRadius="17px" bg={!muted ? bgColor : 'none'} paddingY="10.5px" paddingX="12px">
                <Box padding="8px" bg={!muted ? 'blue.default' : 'none'} borderRadius="50px" height="36px" margin="0">
                  <Icon width="20px" height="20px" icon={item && item?.icon} color={muted ? 'gray' : 'white'} />
                </Box>
                <Box marginLeft="12px">
                  <Text size="sm" color={fontColor2} fontWeight="900" marginY={0}>{item.type}</Text>
                  <Text size="l" fontWeight="400" marginY={0} color={fontColor2}>{assignmentTitle}</Text>
                </Box>
              </Flex>
            </Box>
          );
        }) : (
          <Text size="sm" margin={0} color={fontColor2} textAlign="left">
            {showPendingTasks ? t('no-modules-to-show') : t('module-not-started')}
          </Text>
        )}
      </Box>
    </>
  );
}

Timeline.propTypes = {
  title: PropTypes.string,
  assignments: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  technologies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  width: PropTypes.string,
  onClickAssignment: PropTypes.func,
  showPendingTasks: PropTypes.bool,
};

Timeline.defaultProps = {
  title: '',
  assignments: [],
  technologies: [],
  width: '100%',
  onClickAssignment: () => {},
  showPendingTasks: false,
};

export default memo(Timeline);
