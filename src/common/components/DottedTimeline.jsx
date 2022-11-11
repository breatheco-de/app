import PropTypes from 'prop-types';
import { Box, Flex, Tooltip } from '@chakra-ui/react';
import { useRef } from 'react';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import useGrabToScroll from '../hooks/useGrabToScroll';
// import Icon from './Icon';

const DottedTimeline = ({ storySettings, label, dots, helpText }) => {
  const { borderColor, fontColor2, tooltipBackground } = useStyle();
  console.log('storySettings:::', storySettings);
  const scrollContainerRef = useRef(null);
  const { grabToScroll, isScrollable } = useGrabToScroll({ ref: scrollContainerRef, horizontal: true });
  // useGrabToScroll(scrollContainerRef);
  console.log('isScrollable:::', isScrollable);
  return (
    <Flex borderRadius="17px" flexDirection="column" gridGap="14px" padding="20px 29px" border="1px solid" borderColor={borderColor}>
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
      <Box position="relative" className={isScrollable && 'with-shadow'}>
        <Flex ref={scrollContainerRef} className="hideOverflowX__" onMouseDown={grabToScroll} position="relative" gridGap="9px" overflowX="auto">
          {dots && dots.map((dot) => (
            <Tooltip key={dot.label} hasArrow label={dot.label} placement="top" color="gray.250" openDelay={150} closeDelay={0} fontWeight={700} fontSize="13px" padding="0 6px" bg={tooltipBackground}>
              <Box background={dot.color} borderRadius="50%" width="10px" minW="10px" height="10px" minH="10px" />
            </Tooltip>
          ))}
        </Flex>
        {/* {isScrollable && (
          <Box style={{ position: 'absolute', top: '0px', right: '0px' }}>
            <Icon icon="arrowLeft" width="22px" height="22px" />
          </Box>
        )} */}
      </Box>
    </Flex>
  );
};

DottedTimeline.propTypes = {
  storySettings: PropTypes.objectOf(PropTypes.any),
  label: PropTypes.bool,
  dots: PropTypes.arrayOf(PropTypes.any),
  helpText: PropTypes.string,
};

DottedTimeline.defaultProps = {
  storySettings: {},
  label: false,
  dots: [],
  helpText: '',
};

export default DottedTimeline;
