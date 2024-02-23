import PropTypes from 'prop-types';
import React from 'react';
import IntroductionSection from '../../src/js_modules/landing/introductionSection';

/**
 * @typedef {import("@prismicio/client").Content.TitleIntroductionSlice} TitleIntroductionSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TitleIntroductionSlice>} TitleIntroductionProps
 * @param { TitleIntroductionProps }
 */
const TitleIntroduction = ({ slice }) => (
  <IntroductionSection
    slice={slice}
    margin={slice?.primary?.margin || '0 auto'}
    gridGap={slice?.primary?.grid_gap || '24px'}
    maxWidth="1280px"
    fontFamily={slice?.primary?.fontFamily}
  />
);
TitleIntroduction.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

TitleIntroduction.defaultProps = {
  slice: {},
};

export default TitleIntroduction;
