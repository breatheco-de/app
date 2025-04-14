import React from 'react';
import PropTypes from 'prop-types';
import MktTechnologies from '../../src/components/MktTechnologies';

/**
 * @typedef {import("@prismicio/client").Content.TechnologiesSlice} TechnologiesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TechnologiesSlice>} TechnologiesProps
 * @param { TechnologiesProps }
 */
const Technologies = ({ slice }) => (
  <MktTechnologies
    id={slice?.primary?.id_key}
    endpoint={slice?.primary?.endpoint}
    margin={slice?.primary?.margin || '20px auto 0 auto'}
  />
);

Technologies.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

Technologies.defaultProps = {
  slice: {},
};

export default Technologies;
