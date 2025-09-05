import PropTypes from 'prop-types';
import React from 'react';
import MktEventToast from '../../src/components/PrismicComponents/MktEventToast';

/**
 * @typedef {import("@prismicio/client").Content.EventToastSlice} EventToastSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<EventToastSlice>} EventToastProps
 * @param {EventToastProps}
 */
function EventToast({ slice }) {
  return (
    <MktEventToast
      title={slice?.primary?.title}
      description={slice?.primary?.description}
      colorLight={slice?.primary?.toast_color_light_mode}
      colorDark={slice?.primary?.toast_color_dark_mode}
      academy={slice?.primary?.academy}
      status={slice?.primary?.status}
      type={slice?.primary?.type}
      margin={slice?.primary?.margin || '20px auto'}
      px={{ base: '20px', md: '0px' }}
      maxWidth={slice?.primary?.max_width || '420px'}
      hostImage={slice?.primary?.host_image}
      hostGroupImages={slice?.items?.map((item) => item?.host_group_image)}
    />
  );
}

EventToast.propTypes = {
  slice: PropTypes.shape({
    primary: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      academy: PropTypes.string,
      status: PropTypes.string,
      type: PropTypes.string,
      margin: PropTypes.string,
      maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    }),
  }),
};

EventToast.defaultProps = {
  slice: {},
};

export default EventToast;
