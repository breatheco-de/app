import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';
import Heading from '../Heading';
import GridContainer from '../GridContainer';
import PrismicTextComponent from '../PrismicTextComponent';
import { parseProp } from '../../utils';

import BannerVariation from './BannerVariation';
import WithKPIsVariation from './WithKPIsVariation';

function MktOneColumnSection({
  slice,
  variation: variationProp = 'default',
  title: titleProp,
  subTitle: subtitleProp,
  description: descriptionProp,
  kpiList: kpiListProp = [],
  buttonUrl: buttonUrlProp,
  buttonLabel: buttonLabelProp,
  buttonBackgroundColor: buttonBackgroundColorProp,
  buttonFontColor: buttonFontColorProp,
  buttonFontSize: buttonFontSizeProp,
  fontFamily = 'Lato',
  marginBottom,
  marginTop,
  maxWidth = '1280px',
  padding = '24px',
  justifyItems = 'center',
  ...rest
}) {
  let variation = 'default';
  let sectionTitle = null;
  let sectionSubtitle = null;
  let sectionDescription = null;
  let kpiListData = [];
  let sectionButtonUrl = null;
  let sectionButtonLabel = null;
  let sectionBackground = null;
  let sectionFontColor = null;
  let borderRadius = null;
  let sectionTitleFontSize = null;
  let sectionDescriptionFontSize = null;
  let sectionButtonBackgroundColor = null;
  let sectionButtonFontColor = null;
  let sectionButtonFontSize = null;

  if (slice) {
    variation = slice.variation || 'default';
    sectionTitle = slice.primary?.title;
    sectionSubtitle = slice.primary?.subTitle;
    sectionDescription = slice.primary?.description;
    kpiListData = slice.items || [];
    sectionButtonUrl = slice.primary?.button_url;
    sectionButtonLabel = slice.primary?.button_label;
    sectionBackground = slice.primary?.background;
    sectionFontColor = slice.primary?.font_color;
    borderRadius = slice.primary?.border_radius;
    sectionTitleFontSize = slice.primary?.title_font_size;
    sectionDescriptionFontSize = slice.primary?.description_font_size;
    sectionButtonBackgroundColor = slice.primary?.button_background_color;
    sectionButtonFontColor = slice.primary?.button_font_color;
    sectionButtonFontSize = slice.primary?.button_font_size;
  } else {
    variation = variationProp;
    sectionTitle = titleProp;
    sectionSubtitle = subtitleProp;
    sectionDescription = descriptionProp;
    kpiListData = kpiListProp;
    sectionButtonUrl = buttonUrlProp;
    sectionButtonLabel = buttonLabelProp;
    sectionButtonBackgroundColor = buttonBackgroundColorProp;
    sectionButtonFontColor = buttonFontColorProp;
    sectionButtonFontSize = buttonFontSizeProp;
  }

  const commonVariationProps = {
    description: sectionDescription,
    kpiList: kpiListData,
    buttonUrl: sectionButtonUrl,
    buttonLabel: sectionButtonLabel,
    fontFamily,
    fontColor: sectionFontColor,
    descriptionFontSize: sectionDescriptionFontSize,
    descriptionTextAlign: slice?.primary?.description_text_align || 'center',
    buttonBackgroundColor: sectionButtonBackgroundColor,
    buttonFontColor: sectionButtonFontColor,
    buttonFontSize: sectionButtonFontSize,
  };

  const finalTitleSize = parseProp(sectionTitleFontSize, '3xl');

  const renderSectionTitle = (content, size, as = 'h2') => {
    if (!content) return null;

    if (Array.isArray(content)) {
      return (
        <PrismicTextComponent
          field={content}
          as={as}
          fontSize={size}
          fontWeight="bold"
          color={sectionFontColor || null}
          fontFamily={fontFamily}
          marginBottom="4"
        />
      );
    }
    return (
      <Heading
        as={as}
        fontSize={size}
        fontWeight="bold"
        color={sectionFontColor || null}
        fontFamily={fontFamily}
        marginBottom="4"
      >
        {content}
      </Heading>
    );
  };

  const renderVariation = () => {
    switch (variation) {
      case 'oneColumnWithKpIs':
        return <WithKPIsVariation {...commonVariationProps} />;
      case 'default':
      default:
        return <BannerVariation {...commonVariationProps} />;
    }
  };

  return (
    <Box
      maxWidth={maxWidth}
      margin={`${marginTop || '0px'} auto ${marginBottom || '40px'} auto`}
      borderRadius={borderRadius}
      {...rest}
    >
      <GridContainer
        gridTemplateColumns="repeat(1, 1fr)"
        gridColumn="1 / span 10"
        background={sectionBackground}
        borderRadius={borderRadius}
        width="100%"
      >
        <Box
          display="grid"
          padding={padding}
          fontFamily={fontFamily}
          justifyItems={justifyItems}
          gridGap="14px"
          color={sectionFontColor || null}
        >
          {renderSectionTitle(sectionTitle, finalTitleSize, 'h2')}
          {renderSectionTitle(sectionSubtitle, 'md', 'h4')}

          {renderVariation()}
        </Box>
      </GridContainer>
    </Box>
  );
}

MktOneColumnSection.propTypes = {
  slice: PropTypes.shape({
    variation: PropTypes.string,
    primary: PropTypes.shape({
      title: PropTypes.string,
      subTitle: PropTypes.string,
      description: PropTypes.string,
      button_url: PropTypes.string,
      button_label: PropTypes.string,
      background: PropTypes.string,
      font_color: PropTypes.string,
      border_radius: PropTypes.string,
      title_font_size: PropTypes.string,
      description_font_size: PropTypes.string,
      description_text_align: PropTypes.string,
      button_background_color: PropTypes.string,
      button_font_color: PropTypes.string,
      button_font_size: PropTypes.string,
    }),
    items: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      color: PropTypes.string,
    })),
  }),
  variation: PropTypes.oneOf(['default', 'oneColumnWithKPIs']),
  title: PropTypes.string,
  subTitle: PropTypes.string,
  description: PropTypes.string,
  kpiList: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    color: PropTypes.string,
  })),
  buttonUrl: PropTypes.string,
  buttonLabel: PropTypes.string,
  buttonBackgroundColor: PropTypes.string,
  buttonFontColor: PropTypes.string,
  buttonFontSize: PropTypes.string,
  fontFamily: PropTypes.string,
  marginBottom: PropTypes.string,
  marginTop: PropTypes.string,
  maxWidth: PropTypes.string,
  gridColumn: PropTypes.string,
  padding: PropTypes.string,
  justifyItems: PropTypes.string,
};

MktOneColumnSection.defaultProps = {
  slice: null,
  variation: 'default',
  title: null,
  subTitle: null,
  description: null,
  kpiList: [],
  buttonUrl: null,
  buttonLabel: null,
  buttonBackgroundColor: null,
  buttonFontColor: null,
  buttonFontSize: null,
  fontFamily: 'Lato',
  marginTop: '0px',
  marginBottom: '40px',
  maxWidth: '1280px',
  gridColumn: '2 / span 8',
  padding: '50px',
  justifyItems: 'center',
};

export default MktOneColumnSection;
