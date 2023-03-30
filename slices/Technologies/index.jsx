/* eslint-disable linebreak-style */
/* eslint-disable react/prop-types */
import React from 'react';
import MktTechnologies from '../../src/common/components/MktTechnologies';

/**
 * @typedef {import("@prismicio/client").Content.TechnologiesSlice} TechnologiesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TechnologiesSlice>} TechnologiesProps
 * @param { TechnologiesProps }
 */
const Technologies = ({ slice }) => (
  <MktTechnologies
    endpoint={slice.primary.endpoint}
  />
);

export default Technologies;
