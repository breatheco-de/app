/* eslint-disable linebreak-style */
/**
 * @typedef {import("@prismicio/client").Content.OutcomesSlice} OutcomesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<OutcomesSlice>} OutcomesProps
 * @param {OutcomesProps}
 */
import React from 'react';
import PropTypes from 'prop-types';
import MktOutcomes from '../../src/components/MktOutcomes';

function Outcomes({ slice }) {
  return <MktOutcomes slice={slice} />;
}

Outcomes.propTypes = {
  slice: PropTypes.shape({
    slice_type: PropTypes.string,
    variation: PropTypes.string,
    primary: PropTypes.object,
    items: PropTypes.array,
  }).isRequired,
};

export default Outcomes;
