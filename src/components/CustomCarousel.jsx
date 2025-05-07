import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from '@chakra-ui/react';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function CustomCarousel({ items, renderItem }) {
  const { fontColor } = useStyle();
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = items?.length;
  const slideInterval = useRef(null);
  const resetTimeout = useRef(null);

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
    if (totalSlides > 1) {
      startAutoSlide();
    }
    return () => {
      clearInterval(slideInterval.current);
      clearTimeout(resetTimeout.current);
    };
  }, [totalSlides]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Flex flexDirection="column" gridGap="16px" alignItems="center" position="relative">
      <Flex width="100%" alignItems="center" justifyContent="center">
        {renderItem(items[currentSlide], currentSlide)}
      </Flex>

      {totalSlides > 1 && (
        <Flex position="relative" width="100%" justifyContent="center" mt="16px">
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
            {items.map((item, index) => (
              <Box
                key={item?.id || `carousel-dot-${index}`}
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
      )}
    </Flex>
  );
}

CustomCarousel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  renderItem: PropTypes.func.isRequired,
};

export default CustomCarousel;
