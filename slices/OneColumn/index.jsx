/* eslint-disable react/prop-types */
import React from 'react';
import MktOneColumnKPI from '../../src/common/components/MktOneColumnKPI';

/**
 * @typedef {import("@prismicio/client").Content.OneColumnSlice} OneColumnSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<OneColumnSlice>} OneColumnProps
 * @param { OneColumnProps }
 */
function OneColumn({ slice }) {
  const items = [
    {
      title: slice?.primary?.kpi_title_1,
      description: slice?.primary?.kpi_description_1,
      color: slice?.primary?.kpi_color_1,
    },
    {
      title: slice?.primary?.kpi_title_2,
      description: slice?.primary?.kpi_description_2,
      color: slice?.primary?.kpi_color_2,
    },
    {
      title: slice?.primary?.kpi_title_3,
      description: slice?.primary?.kpi_description_3,
      color: slice?.primary?.kpi_color_3,
    },
  ].filter((item) => item?.title && item?.description);

  return (
    <MktOneColumnKPI
      id={slice?.primary?.id_key}
      slice={slice}
      title={slice.primary.title}
      subTitle={slice.primary.subtitle}
      paddingMd={slice.primary.paddingMd}
      linkButton={slice.primary.link_button}
      buttonUrl={slice?.primary?.button_url?.url || slice.primary.button_url}
      buttonLabel={slice.primary.button_label}
      kpiList={items}
      margin={slice?.primary?.margin || '5rem auto'}
    />
  );
}

export default OneColumn;
