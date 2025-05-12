/**
 * @typedef {import("@prismicio/client").Content.RatingsSlice} RatingsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<RatingsSlice>} RatingsProps
 * @param {RatingsProps}
 */
import PropTypes from 'prop-types';
import MktRating from '../../src/components/MktRating';

function Ratings({ slice }) {
  return <MktRating slice={slice} />;
}

Ratings.propTypes = {
  slice: PropTypes.shape({}).isRequired,
};

export default Ratings;
