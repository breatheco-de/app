import { useState } from 'react';
import PropTypes from 'prop-types';
import { Flex, Box, Text, Image, Badge, IconButton } from '@chakra-ui/react';
import Icon from './Icon';

function CustomCarousel({ assignmentList }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = assignmentList.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const difficultyLevel = {
    EASY: 'green',
    INTERMEDIATE: 'yellow',
    HARD: 'red',
  };

  return (
    <>
      <Flex position="relative" width="100%" maxWidth="800px" alignItems="center">
        <IconButton
          onClick={prevSlide}
          aria-label="Previous Slide"
          icon={<Icon icon="arrowLeft" width="16px" />}
          position="absolute"
          left="0"
          top="50%"
          transform="translateY(-50%)"
          bg="white"
          boxShadow="md"
          borderRadius="full"
        />

        <Flex
          flexDirection="row"
          width="100%"
          border="1px solid #E2E8F0"
          borderRadius="10px"
          overflow="hidden"
          bg="white"
          boxShadow="md"
          p="16px"
          gridGap="16px"
          alignItems="center"
        >
          <Box flex="1" minWidth="250px" maxWidth="400px">
            <Image
              src={assignmentList[currentSlide].preview}
              alt={assignmentList[currentSlide].title}
              objectFit="cover"
              borderRadius="10px"
              width="100%"
              height="100%"
            />
          </Box>

          <Flex flex="1" flexDirection="column" gridGap="10px">
            <Flex gridGap="8px">
              {assignmentList[currentSlide].technologies.map((tech) => (
                <Badge colorScheme="blue">{tech.title}</Badge>
              ))}
            </Flex>

            <Text fontSize="20px" fontWeight="bold">{assignmentList[currentSlide].title}</Text>
            <Text fontSize="14px" color="gray.600">{assignmentList[currentSlide].description}</Text>

            <Flex alignItems="center" gridGap="16px" mt="8px">
              <Flex alignItems="center" gridGap="8px">
                <Icon icon="clock" width="16px" />
                <Text fontSize="14px">{`${assignmentList[currentSlide].duration} hours`}</Text>
              </Flex>
              <Text fontSize="14px" color="gray.500">{new Date(assignmentList[currentSlide].published_at).toLocaleDateString()}</Text>
            </Flex>

            <Badge
              colorScheme={difficultyLevel[assignmentList[currentSlide].difficulty]}
              mt="8px"
              alignSelf="flex-start"
            >
              {assignmentList[currentSlide].difficulty.charAt(0) + assignmentList[currentSlide].difficulty.slice(1).toLowerCase()}
            </Badge>
          </Flex>
        </Flex>

        <IconButton
          onClick={nextSlide}
          aria-label="Next Slide"
          icon={<Icon icon="arrowRight" width="16px" />}
          position="absolute"
          right="0"
          top="50%"
          transform="translateY(-50%)"
          bg="white"
          boxShadow="md"
          borderRadius="full"
        />
      </Flex>

      <Flex mt="16px" gridGap="8px">
        {assignmentList.map((_, index) => (
          <Box
            width="10px"
            height="10px"
            borderRadius="full"
            bg={index === currentSlide ? 'blue.500' : 'gray.300'}
            cursor="pointer"
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </Flex>
    </>
  );
}

// ✅ PropTypes para validar datos
CustomCarousel.propTypes = {
  assignmentList: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    preview: PropTypes.string,
    description: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    published_at: PropTypes.string.isRequired,
    technologies: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
    })),
  })).isRequired,
};

export default CustomCarousel;
