import PropTypes from 'prop-types';
import { Box, Flex, Tooltip } from '@chakra-ui/react';
import { useRef } from 'react';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import useGrabToScroll from '../hooks/useGrabToScroll';
import { AnimatedContainer } from './Animated';

const DottedTimeline = ({ label, dots, helpText, width }) => {
  const { borderColor, fontColor2, tooltipBackground, backgroundColor2 } = useStyle();
  const scrollContainerRef = useRef(null);
  const { grabToScroll, isScrollable } = useGrabToScroll({ ref: scrollContainerRef, horizontal: true });

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
      <AnimatedContainer isScrollable={isScrollable} position="relative" overflow="hidden">
        <Flex ref={scrollContainerRef} alignItems="center" className="hideOverflowX__" height="25px" onMouseDown={grabToScroll} position="relative" gridGap="9px" overflowX="auto">
          {dots && dots.map((dot) => (
            <Tooltip key={dot.label} hasArrow label={dot.label} placement="top" color="gray.250" openDelay={150} closeDelay={0} fontWeight={700} fontSize="13px" padding="0 6px" bg={tooltipBackground}>
              <Box background={dot.color} borderRadius="50%" width="10px" minW="10px" height="10px" minH="10px" />
            </Tooltip>
          ))}
        </Flex>
      </AnimatedContainer>
    </Flex>
  );
};

DottedTimeline.propTypes = {
  // storySettings: PropTypes.objectOf(PropTypes.any),
  label: PropTypes.bool,
  dots: PropTypes.arrayOf(PropTypes.any),
  helpText: PropTypes.string,
  width: PropTypes.string,
};

DottedTimeline.defaultProps = {
  // storySettings: {},
  label: false,
  dots: [],
  helpText: '',
  width: '100%',
};

export default DottedTimeline;
