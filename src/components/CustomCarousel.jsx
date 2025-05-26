import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from '@chakra-ui/react';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

const VARIATIONS = {
  DEFAULT: 'default',
  STRETCH: 'stretch',
};

function CustomCarousel({ items, renderItem, variation = VARIATIONS.DEFAULT, ...rest }) {
  const { fontColor, hexColor } = useStyle();
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

  const getLeftArrowColor = () => {
    if (variation === VARIATIONS.STRETCH) {
      return currentSlide === 0 ? '#EBEBEB' : hexColor.blueDefault;
    }
    return currentSlide === 0 ? '#EBEBEB' : fontColor;
  };

  const getRightArrowColor = () => {
    if (variation === VARIATIONS.STRETCH) {
      return currentSlide === totalSlides - 1 ? '#EBEBEB' : hexColor.blueDefault;
    }
    return currentSlide === totalSlides - 1 ? '#EBEBEB' : fontColor;
  };

  const getArrowBoxStyles = (isLeft) => {
    const isDisabled = isLeft ? currentSlide === 0 : currentSlide === totalSlides - 1;
    if (variation === VARIATIONS.STRETCH) {
      return {
        position: 'static',
        left: undefined,
        right: undefined,
        bg: isDisabled ? 'transparent' : hexColor.blueLight,
        borderRadius: '8px',
        p: 2,
      };
    }
    return {
      position: 'absolute',
      left: isLeft ? '0' : undefined,
      right: isLeft ? undefined : '0',
      bg: 'transparent',
      borderRadius: undefined,
      p: 0,
      boxShadow: undefined,
    };
  };

  const leftArrowColor = getLeftArrowColor();
  const rightArrowColor = getRightArrowColor();
  const leftBoxStyles = getArrowBoxStyles(true);
  const rightBoxStyles = getArrowBoxStyles(false);

  return (
    <Flex flexDirection="column" gridGap="16px" alignItems="center" position="relative" {...rest}>
      <Flex width="100%" alignItems="center" justifyContent="center">
        {renderItem(items[currentSlide], currentSlide)}
      </Flex>

      {totalSlides > 1 && (
        <Flex
          position="relative"
          width="100%"
          justifyContent={variation === VARIATIONS.STRETCH ? 'center' : 'space-between'}
          mt="16px"
          alignItems="center"
          gap={variation === VARIATIONS.STRETCH ? '16px' : undefined}
        >
          <Box
            {...leftBoxStyles}
            transition="background 0.2s"
            zIndex="100"
          >
            <Icon
              onClick={currentSlide === 0 ? null : prevSlide}
              aria-label="Previous Slide"
              icon="arrowLeft3"
              width="30px"
              height="30px"
              color={leftArrowColor}
              cursor={currentSlide === 0 ? undefined : 'pointer'}
              opacity={currentSlide === 0 ? 0.5 : 1}
            />
          </Box>

          {variation === VARIATIONS.DEFAULT && (
            <Flex
              height="40px"
              gridGap="8px"
              position="relative"
              alignItems="center"
              justifyContent="center"
              flex="1"
            >
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
          )}

          <Box
            {...rightBoxStyles}
            transition="background 0.2s"
          >
            <Icon
              onClick={currentSlide === totalSlides - 1 ? null : nextSlide}
              aria-label="Next Slide"
              icon="arrowRight"
              width="30px"
              height="30px"
              color={rightArrowColor}
              cursor={currentSlide === totalSlides - 1 ? undefined : 'pointer'}
              opacity={currentSlide === totalSlides - 1 ? 0.5 : 1}
            />
          </Box>
        </Flex>
      )}
    </Flex>
  );
}

CustomCarousel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  renderItem: PropTypes.func.isRequired,
  variation: PropTypes.oneOf(Object.values(VARIATIONS)),
};

CustomCarousel.defaultProps = {
  variation: VARIATIONS.DEFAULT,
};

export default CustomCarousel;
