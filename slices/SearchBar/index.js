import React from 'react';
import PropTypes from 'prop-types';
import MktSearchBar from '../../src/common/components/MktSearchBar';

/**
 * @typedef {import("@prismicio/client").Content.SearchBarSlice} SearchBarSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<SearchBarSlice>} SearchBarProps
 * @param {SearchBarProps}
 */

const SearchBar = ({ slice }) => (
  <MktSearchBar
    id={slice?.primary?.id_key}
    headingTop={slice?.primary?.heading_top}
    headingBottom={slice?.primary?.heading_bottom}
    subtitle={slice?.primary?.subtitle}
    popularSearches={slice?.items}
    background={slice?.primary?.background}
  />
)

SearchBar.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

SearchBar.defaultProps = {
  slice: {},
};

export default SearchBar;
