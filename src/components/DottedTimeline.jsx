import PropTypes from 'prop-types';
import { Box, Flex, Tooltip } from '@chakra-ui/react';
import { useRef } from 'react';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import useGrabToScroll from '../hooks/useGrabToScroll';
import { AnimatedContainer } from './Animated';

function DotsScrollRow({ dots, onClickDots, emptyDotsMessage, rowKeyPrefix }) {
  const { fontColor3, tooltipBackground } = useStyle();
  const scrollContainerRef = useRef(null);
  const { grabToScroll, isScrollable } = useGrabToScroll({ ref: scrollContainerRef, horizontal: true });
  const highLightColor = 'yellow.default';

  const showEmptyMessage = Boolean(emptyDotsMessage && dots?.length === 0);
  return (
    <AnimatedContainer isScrollable={dots?.length > 0 && isScrollable} position="relative" overflow="hidden">
      <Flex
        ref={scrollContainerRef}
        alignItems="center"
        className="hideOverflowX__"
        minH="25px"
        h={showEmptyMessage ? 'auto' : '25px'}
        py={showEmptyMessage ? '2px' : 0}
        onMouseDown={grabToScroll}
        position="relative"
        gridGap="9px"
        overflowX="auto"
      >
        {dots?.length > 0 && dots.map((dot, i) => (
          <Box
            key={`${rowKeyPrefix || 'dot'}-${[dot.associated_slug, dot.slug, dot.label, dot.color, dot.borderColor].filter(Boolean).join('|')}`}
            padding="5px 0"
            borderBottom="2px solid"
            borderColor={dot.highlight ? highLightColor : 'transparent'}
          >
            <Tooltip hasArrow label={dot.label} placement="top" color="gray.250" fontWeight={700} fontSize="13px" padding="0 6px" bg={tooltipBackground}>
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
        {showEmptyMessage && (
          <Text size="sm" color={fontColor3} fontStyle="italic" lineHeight="1.35" whiteSpace="normal">
            {emptyDotsMessage}
          </Text>
        )}
      </Flex>
    </AnimatedContainer>
  );
}

DotsScrollRow.propTypes = {
  dots: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  onClickDots: PropTypes.func,
  emptyDotsMessage: PropTypes.string,
  rowKeyPrefix: PropTypes.string,
};

DotsScrollRow.defaultProps = {
  dots: [],
  onClickDots: null,
  emptyDotsMessage: '',
  rowKeyPrefix: '',
};

// we need to fix a bug that causes the tooltip re-render multiple times when the mouse is over it and ref not being updated
function DottedTimeline({
  label,
  dots,
  emptyDotsMessage,
  helpText,
  width,
  onClickDots,
  extraTimelines,
}) {
  const { borderColor, fontColor2, backgroundColor2 } = useStyle();
  const suppressMainDotsRow = extraTimelines?.length > 0 && !(dots?.length > 0);
  const help = helpText || '';

  return (
    <Flex borderRadius="17px" flexDirection="column" gridGap="4px" width={width} padding="20px 29px" border="1px solid" borderColor={borderColor} background={backgroundColor2}>
      <Flex justifyContent="space-between" fontWeight={700}>
        <Text size="15px" color={fontColor2}>
          {label && label}
        </Text>
        {help.length > 2 && (
          <Text size="md" color={fontColor2}>
            {help}
          </Text>
        )}
      </Flex>
      {!suppressMainDotsRow && (
        <DotsScrollRow dots={dots} onClickDots={onClickDots} emptyDotsMessage={emptyDotsMessage} rowKeyPrefix="main" />
      )}
      {extraTimelines?.length > 0 && extraTimelines.map((row) => (
        <Box key={row.key} pt="6px" borderTop="1px solid" borderColor={borderColor} marginTop="4px" paddingTop="10px">
          {row.label != null && row.label !== false && (
            <Flex justifyContent="space-between" alignItems="baseline" marginBottom="6px" gridGap="10px" flexWrap="wrap">
              <Text size="13px" color={fontColor2} fontWeight={600}>
                {row.label}
              </Text>
              {row.meta != null && row.meta !== '' && (
                <Text size="12px" color={fontColor2} fontWeight={500}>
                  {row.meta}
                </Text>
              )}
            </Flex>
          )}
          <DotsScrollRow dots={row.dots} onClickDots={onClickDots} emptyDotsMessage={row.emptyDotsMessage} rowKeyPrefix={row.key} />
        </Box>
      ))}
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
  extraTimelines: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([PropTypes.node]),
    meta: PropTypes.node,
    dots: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
    emptyDotsMessage: PropTypes.string,
  })),
};

DottedTimeline.defaultProps = {
  label: false,
  dots: [],
  helpText: '',
  width: '100%',
  onClickDots: null,
  emptyDotsMessage: '',
  extraTimelines: undefined,
};

export default DottedTimeline;
