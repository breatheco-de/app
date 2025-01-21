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
      borderRadius={slice?.primary?.border_radius}
      fontFamily={slice?.primary?.font_family}
      title={slice.primary.title}
      subTitle={slice.primary.subtitle}
      paddingMd={slice.primary.paddingMd}
      linkButton={slice.primary.link_button}
      buttonUrl={slice?.primary?.button_url?.url || slice.primary.button_url}
      buttonLabel={slice.primary.button_label}
      buttonBackgroundColor={slice?.primary?.button_background_color}
      buttonFontColor={slice?.primary?.button_font_color}
      buttonFontSize={slice?.primary?.button_font_size}
      justifyItems={slice?.primary?.justify_items}
      kpiList={items}
      margin={slice?.primary?.margin || '5rem auto'}
      marginTop={slice?.primary?.margin_top}
      marginBottom={slice?.primary?.margin_bottom}
      maxWidth={slice?.primary?.max_width}
      titleFontSize={slice?.primary?.title_font_size}
      descriptionFontSize={slice?.primary?.description_font_size}
      descriptionTextAlign={slice?.primary?.description_text_align}
      descriptionJustifyItems={slice?.primary?.description_justify_items}
      descriptionLineHeight={slice?.primary?.description_line_height}
    />
  );
}

export default OneColumn;
