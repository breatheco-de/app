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
    id={slice?.primary?.id_key}
    endpoint={slice?.primary?.endpoint}
    margin={slice?.primary?.margin || '20px auto 0 auto'}
  />
);

export default Technologies;
