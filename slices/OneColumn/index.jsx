/* eslint-disable react/prop-types */
import React from 'react';
import MktOneColumn from '../../src/common/components/MktOneColumn';

/**
 * @typedef {import("@prismicio/client").Content.OneColumnSlice} OneColumnSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<OneColumnSlice>} OneColumnProps
 * @param { OneColumnProps }
 */
const OneColumn = ({ slice }) => {
  console.log('slice', slice);
  const items = [
    {
      title: slice.primary.kpi_title_1,
      description: slice.primary.kpi_description_1,
      color: slice.primary.kpi_color_1,
    },
    {
      title: slice.primary.kpi_title_2,
      description: slice.primary.kpi_description_2,
      color: slice.primary.kpi_color_2,
    },
    {
      title: slice.primary.kpi_title_3,
      description: slice.primary.kpi_description_3,
      color: slice.primary.kpi_color_3,
    },
  ].filter((item) => item?.title && item?.description);

  return (
    <MktOneColumn
      id={slice?.primary?.id_key}
      slice={slice}
      title={slice.primary.title}
      subTitle={slice.primary.subtitle}
      linkButton={slice.primary.link_button}
      buttonUrl={slice.primary.button_url.url}
      buttonLabel={slice.primary.button_label}
      kpiList={items}
    />
  );
};

export default OneColumn;
