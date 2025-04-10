import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Flex, Box, Text, Image, Badge } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import useStyle from '../../hooks/useStyle';

function CustomCarousel({ assignmentList }) {
  const { t } = useTranslation();
  const { borderColorStrong, backgroundColor, lightColor, fontColor } = useStyle();
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = assignmentList?.length;
  const slideInterval = useRef(null);
  const resetTimeout = useRef(null);

  const difficultyLevel = {
    EASY: 'green',
    BEGINNER: 'green',
    INTERMEDIATE: 'yellow',
    HARD: 'red',
  };

  const startAutoSlide = (delay = 5000) => {
    clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, delay);
  };

  const handleUserInteraction = (callback) => {
    clearInterval(slideInterval.current);
    clearTimeout(resetTimeout.current);

    callback();

    resetTimeout.current = setTimeout(() => {
      startAutoSlide();
    }, 20000);
  };

  const nextSlide = () => handleUserInteraction(() => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  });

  const prevSlide = () => handleUserInteraction(() => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  });

  useEffect(() => {
    startAutoSlide();

    return () => {
      clearInterval(slideInterval.current);
      clearTimeout(resetTimeout.current);
    };
  }, [totalSlides]);

  useEffect(() => {
    if (assignmentList && assignmentList.length) {
      assignmentList.forEach((assignment) => {
        const img = new window.Image();
        img.src = assignment.preview;
      });
    }
  }, [assignmentList]);

  return (
    <Flex flexDirection="column" gridGap="16px" alignItems="center" position="relative" minHeight="300px" maxWidth="1280px">
      <Flex width="100%" alignItems="center">
        <Flex
          flexDirection={{ base: 'column', md: 'row' }}
          width="100%"
          borderColor={borderColorStrong}
          borderRadius="10px"
          overflow="hidden"
          bg={backgroundColor}
          p="16px"
          gridGap="16px"
          alignItems="stretch"
        >
          <Box
            flex="1"
            minWidth="250px"
            maxWidth="400px"
            height="250px"
            bg={/\.gif(\?|$)/i.test(assignmentList[currentSlide]?.preview) ? 'transparent' : 'black'}
            display="flex"
            justifyContent="center"
            alignItems="center"
            alignSelf="center"
            borderRadius="10px"
          >
            <Image
              src={assignmentList[currentSlide]?.preview}
              alt={assignmentList[currentSlide]?.title}
              objectFit={/\.gif(\?|$)/i.test(assignmentList[currentSlide]?.preview) ? 'contain' : 'cover'}
              borderRadius="10px"
              width="100%"
              height="100%"
            />
          </Box>

          <Flex flex="1" flexDirection="column" gridGap="10px" justifyContent="space-between">
            <Flex gridGap="8px" justifyContent="space-between" alignItems="flex-start">
              <Flex gap="5px" flexWrap="wrap" flexGrow="1" alignItems="center">
                {assignmentList[currentSlide]?.technologies?.map((tech) => (
                  <Box key={tech?.title}>
                    {tech?.icon_url ? (
                      <Image src={tech.icon_url} width="18px" height="18px" />
                    ) : (
                      <Badge borderRadius="10px" px="8px" colorScheme="blue">{tech?.title}</Badge>
                    )}
                  </Box>
                ))}
              </Flex>

              <Flex alignItems="center">
                {assignmentList[currentSlide]?.duration && (
                  <Badge
                    borderRadius="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon icon="clock" width="14px" height="14px" color="black" />
                    <Text fontSize="12px" ml="4px">
                      {`${assignmentList[currentSlide].duration} hours`}
                    </Text>
                  </Badge>
                )}
                {assignmentList[currentSlide]?.published_at && (
                  <Text fontSize="12px" color="gray.500">
                    {new Date(assignmentList[currentSlide]?.published_at)?.toLocaleDateString()}
                  </Text>
                )}
              </Flex>
            </Flex>

            <Flex direction="column" mt="16px" gap="16px">
              <Text fontSize="20px" fontWeight="bold">{assignmentList[currentSlide]?.title}</Text>
              <Text fontSize="14px" color={lightColor}>{assignmentList[currentSlide]?.description}</Text>
            </Flex>

            <Flex alignItems="flex-end" justifyContent="space-between" mt="auto">
              <Badge
                colorScheme={assignmentList[currentSlide]?.difficulty ? difficultyLevel[assignmentList[currentSlide]?.difficulty] : 'transparent'}
                alignSelf="flex-start"
                borderRadius="10px"
                padding="3px 5px"
              >
                {assignmentList[currentSlide]?.difficulty && (
                  t(`common:${assignmentList[currentSlide]?.difficulty?.toLowerCase()}`)
                )}
              </Badge>
              <Flex gap="10px">
                <Icon icon="rigobot-avatar-tiny" width="18px" height="18px" />
                {assignmentList[currentSlide]?.learnpack_deploy_url && <Icon icon="learnpack" width="18px" height="18px" />}
                {assignmentList[currentSlide]?.template_url && <Icon icon="download" width="18px" height="18px" />}
                {assignmentList[currentSlide]?.with_video && <Icon icon="video" width="18px" height="18px" />}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Flex position="relative" width="100%" justifyContent="center">
        <Icon
          onClick={currentSlide === 0 ? null : prevSlide}
          aria-label="Previous Slide"
          icon="arrowLeft3"
          position="absolute"
          left="0"
          bottom="0"
          width="30px"
          height="30px"
          color={currentSlide === 0 ? '#EBEBEB' : fontColor}
          cursor={currentSlide === 0 ? undefined : 'pointer'}
          opacity={currentSlide === 0 ? 0.5 : 1}
        />

        <Flex height="40px" gridGap="8px" position="relative" alignItems="center">
          {assignmentList.map((_, index) => (
            <Box
              width="10px"
              height="10px"
              borderRadius="full"
              bg={index === currentSlide ? 'blue.500' : 'gray.300'}
              cursor="pointer"
              onClick={() => handleUserInteraction(() => setCurrentSlide(index))}
            />
          ))}
        </Flex>

        <Icon
          onClick={currentSlide === totalSlides - 1 ? null : nextSlide}
          aria-label="Next Slide"
          icon="arrowRight"
          position="absolute"
          right="0"
          bottom="0"
          width="30px"
          height="30px"
          color={currentSlide === totalSlides - 1 ? '#EBEBEB' : fontColor}
          cursor={currentSlide === totalSlides - 1 ? undefined : 'pointer'}
          opacity={currentSlide === totalSlides - 1 ? 0.5 : 1}
        />
      </Flex>
    </Flex>
  );
}

CustomCarousel.propTypes = {
  assignmentList: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    preview: PropTypes.string,
    description: PropTypes.string,
    difficulty: PropTypes.string,
    duration: PropTypes.number,
    published_at: PropTypes.string,
    technologies: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      icon_url: PropTypes.string,
    })),
    learnpack_deploy_url: PropTypes.string,
    template_url: PropTypes.string,
    with_video: PropTypes.bool,
  })).isRequired,
};

export default CustomCarousel;
