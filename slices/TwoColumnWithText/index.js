import React from 'react';
import PropTypes from 'prop-types';
import TwoColumnWithTextComponent from '../../src/components/TwoColumnWithText';

/**
 * @typedef {import("@prismicio/client").Content.TwoColumnWithTextSlice} TwoColumnWithTextSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TwoColumnWithTextSlice>} TwoColumnWithTextProps
 * @param {TwoColumnWithTextProps}
 */
function TwoColumnWithText({ slice }) {
  return (
    <TwoColumnWithTextComponent slice={slice} />
  );
}

TwoColumnWithText.propTypes = {
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

TwoColumnWithText.defaultProps = {
  slice: {},
};

export default TwoColumnWithText;
