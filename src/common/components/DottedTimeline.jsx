import PropTypes from 'prop-types';
import { Box, Flex, Tooltip } from '@chakra-ui/react';
import { useRef } from 'react';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import useGrabToScroll from '../hooks/useGrabToScroll';
import { AnimatedContainer } from './Animated';

// we need to fix a bug that causes the tooltip re-render multiple times when the mouse is over it and ref not being updated
function DottedTimeline({ label, dots, emptyDotsMessage, helpText, width, onClickDots }) {
  const { borderColor, fontColor3, fontColor2, tooltipBackground, backgroundColor2 } = useStyle();
  const scrollContainerRef = useRef(null);
  const { grabToScroll, isScrollable } = useGrabToScroll({ ref: scrollContainerRef, horizontal: true });
  const highLightColor = 'yellow.default';

  return (
    <Flex borderRadius="17px" flexDirection="column" gridGap="4px" width={width} padding="20px 29px" border="1px solid" borderColor={borderColor} background={backgroundColor2}>
      <Flex justifyContent="space-between" fontWeight={700}>
        <Text size="15px" color={fontColor2}>
          {label && label}
        </Text>
        {helpText.length > 2 && (
          <Text size="md" color={fontColor2}>
            {helpText}
          </Text>
        )}
      </Flex>
      <AnimatedContainer isScrollable={dots?.length > 0 && isScrollable} position="relative" overflow="hidden">
        <Flex ref={scrollContainerRef} alignItems="center" className="hideOverflowX__" height="25px" onMouseDown={grabToScroll} position="relative" gridGap="9px" overflowX="auto">
          {dots?.length > 0 && !emptyDotsMessage && dots.map((dot, i) => (
            <Box padding="5px 0" borderBottom="2px solid" borderColor={dot.highlight ? highLightColor : 'transparent'}>
              <Tooltip key={dot.label} hasArrow label={dot.label} placement="top" color="gray.250" fontWeight={700} fontSize="13px" padding="0 6px" bg={tooltipBackground}>
                <Box
                  onClick={() => onClickDots && onClickDots(dot, i)}
                  cursor={onClickDots && 'pointer'}
                  background={dot.color}
                  border={dot.borderColor && '2px solid'}
                  borderColor={dot.borderColor}
                  borderRadius="50%"
                  width="10px"
                  minW="10px"
                  height="10px"
                  minH="10px"
                />
              </Tooltip>
            </Box>
          ))}
          {emptyDotsMessage && dots?.length === 0 && (
            <Text size="md" color={fontColor3}>
              {emptyDotsMessage}
            </Text>
          )}
        </Flex>
      </AnimatedContainer>
    </Flex>
  );
}

DottedTimeline.propTypes = {
  // storySettings: PropTypes.objectOf(PropTypes.any),
  label: PropTypes.bool,
  dots: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  helpText: PropTypes.string,
  width: PropTypes.string,
  onClickDots: PropTypes.func,
  emptyDotsMessage: PropTypes.string,
};

DottedTimeline.defaultProps = {
  // storySettings: {},
  label: false,
  dots: [],
  helpText: '',
  width: '100%',
  onClickDots: null,
  emptyDotsMessage: '',
};

export default DottedTimeline;
