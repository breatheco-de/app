import React from 'react';
import PropTypes from 'prop-types';
import MktEventCards from '../../src/components/MktEventCards';

/**
 * @typedef {import("@prismicio/client").Content.EventCardsSlice} EventCardsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<EventCardsSlice>} EventCardsProps
 * @param { EventCardsProps }
 */
const EventCards = ({ slice }) => (
  <MktEventCards
    id={slice?.primary?.id_key}
    title={slice?.primary?.title}
    endpoint={slice?.primary?.endpoint}
    techFilter={slice?.primary?.tech_filtered}
    searchSensitive={slice?.primary?.search_sensitive}
    showCheckedInEvents={slice?.primary?.show_checked_in_events}
    margin={slice?.primary?.margin || '40px auto'}
  />
);
EventCards.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

EventCards.defaultProps = {
  slice: {},
};

export default EventCards;
