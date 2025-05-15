import React from 'react';
import PropTypes from 'prop-types';
import MktTechnologiesPills from '../../src/components/PrismicComponents/MktTechnologiesPills';

/**
 * @typedef {import("@prismicio/client").Content.TechnologiesPillsSlice} TechnologiesPillsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TechnologiesPillsSlice>} TechnologiesPillsProps
 * @param { TechnologiesPillsProps }
 */
const TechnologiesPills = ({ slice }) => (
  <MktTechnologiesPills
    id={slice?.primary?.id_key}
    technologies={slice?.primary?.technologies}
    margin={slice?.primary?.margin || '15px 0 0 0'}
    background={slice.primary.background}
    paddingTop={slice.primary.padding_top}
  />
);

TechnologiesPills.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

TechnologiesPills.defaultProps = {
  slice: {},
};

export default TechnologiesPills;
