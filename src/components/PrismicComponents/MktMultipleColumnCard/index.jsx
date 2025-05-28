import React from 'react';
import PropTypes from 'prop-types';
import { Box, Heading } from '@chakra-ui/react';
import useStyle from '../../../hooks/useStyle';
import { parseProp } from '../../../utils';

import DefaultVariation from './DefaultVariation';
import StatsCardVariation from './StatsCardVariation';
import SmallImageAndLinkVariation from './SmallImageAndLinkVariation';
import SideTagFeatureVariation from './SideTagFeatureVariation';

// Generic highlight rendering function
const renderHighlightedText = (text, highlightWord) => {
  if (!text) return null;
  if (!highlightWord || !text.includes(highlightWord)) {
    return text;
  }
  const parts = text.split(highlightWord);
  return (
    <>
      {parts[0]}
      <Box as="span" color="blue.default">{highlightWord}</Box>
      {parts.slice(1).join(highlightWord)}
    </>
  );
};

function MktMultipleColumnCard({
  slice,
  variation: variationProp = 'default',
  title: titleProp,
  subtitle: subtitleProp,
  columns: columnsProp = [],
  titleHighlightWord: titleHighlightWordProp,
  subtitleHighlightWord: subtitleHighlightWordProp,
  headingFontWeight: headingFontWeightProp = '700',
  sectionTitleFontSize: sectionTitleFontSizeProp,
  fontFamily = 'Lato',
  marginBottom,
  marginTop,
  ...rest
}) {
  let variation = 'default';
  let sectionTitle = null;
  let sectionSubtitle = null;
  let columnsData = [];
  let titleHighlightWord = null;
  let subtitleHighlightWord = null;
  let fontWeight = '700';
  let sectionTitleFontSize = null;

  if (slice) {
    variation = slice.variation || 'default';
    sectionTitle = slice.primary?.title;
    sectionSubtitle = slice.primary?.subtitle;
    columnsData = slice.items || [];
    titleHighlightWord = slice.primary?.title_highlight_word;
    subtitleHighlightWord = slice.primary?.subtitle_highlight_word;
    fontWeight = slice.primary?.heading_font_weight || '700';
    sectionTitleFontSize = slice.primary?.heading_font_size;
  } else {
    variation = variationProp;
    sectionTitle = titleProp;
    sectionSubtitle = subtitleProp;
    columnsData = columnsProp;
    titleHighlightWord = titleHighlightWordProp;
    subtitleHighlightWord = subtitleHighlightWordProp;
    fontWeight = headingFontWeightProp;
    sectionTitleFontSize = sectionTitleFontSizeProp;
  }

  const finalTitleSize = parseProp(sectionTitleFontSize, '34px !important');
  const finalMarginTop = parseProp(marginTop);
  const finalMarginBottom = parseProp(marginBottom);

  const limitedColumns = columnsData.slice(0, 6);
  const { navbarBackground } = useStyle();

  const commonVariationProps = {
    columns: limitedColumns,
    fontFamily,
    navbarBackground,
  };

  // --- Render Correct Variation ---
  const renderVariation = () => {
    switch (variation) {
      case 'statsCard':
        return <StatsCardVariation {...commonVariationProps} />;
      case 'smallImageAndLink':
        return <SmallImageAndLinkVariation {...commonVariationProps} />;
      case 'sideTagFeature':
        return <SideTagFeatureVariation {...commonVariationProps} />;
      case 'default':
      default:
        return <DefaultVariation {...commonVariationProps} />;
    }
  };

  return (
    <Box
      maxWidth="1280px"
      textAlign="center"
      margin="auto"
      marginTop={finalMarginTop}
      marginBottom={finalMarginBottom}
      {...rest}
    >
      {sectionTitle && (
        <Heading
          as="h2"
          fontSize={finalTitleSize}
          fontWeight={fontWeight}
          mb={!sectionSubtitle && 8}
          fontFamily={fontFamily}
        >
          {renderHighlightedText(sectionTitle, titleHighlightWord)}
        </Heading>
      )}
      {sectionSubtitle && (
        <Heading
          as="h2"
          fontSize={finalTitleSize}
          fontWeight={fontWeight}
          mb={8}
          fontFamily={fontFamily}
        >
          {renderHighlightedText(sectionSubtitle, subtitleHighlightWord)}
        </Heading>
      )}
      {renderVariation()}

    </Box>
  );
}

MktMultipleColumnCard.propTypes = {
  slice: PropTypes.shape({
    variation: PropTypes.string,
    primary: PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      title_highlight_word: PropTypes.string,
      subtitle_highlight_word: PropTypes.string,
      heading_font_weight: PropTypes.string,
      heading_font_size: PropTypes.string,
    }),
    items: PropTypes.arrayOf(PropTypes.shape({
      side_tag_color: PropTypes.string,
    })),
  }),
  variation: PropTypes.oneOf(['default', 'statsCard', 'smallImageAndLink', 'sideTagFeature']),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.shape({})),
  titleHighlightWord: PropTypes.string,
  subtitleHighlightWord: PropTypes.string,
  headingFontWeight: PropTypes.string,
  sectionTitleFontSize: PropTypes.string,
  fontFamily: PropTypes.string,
  marginBottom: PropTypes.string,
  marginTop: PropTypes.string,
};

MktMultipleColumnCard.defaultProps = {
  slice: null,
  variation: 'default',
  title: null,
  subtitle: null,
  columns: [],
  titleHighlightWord: null,
  subtitleHighlightWord: null,
  headingFontWeight: '700',
  sectionTitleFontSize: null,
  fontFamily: 'Lato',
  marginTop: '80px',
  marginBottom: '40px',
};

export default MktMultipleColumnCard;
