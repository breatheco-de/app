import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

function StarRating({ rating, ...rest }) {
  const getRate = (index, rate) => {
    if (Math.round(rate) === index && rate % 1 !== 0) {
      return 'middle';
    }
    if (index <= rate) {
      return 'on';
    }
    return 'off';
  };
  return (
    <Box
      display="flex"
      flexDirection="row"
      gap="8px"
      className="star-rating"
      {...rest}
    >
      {[...Array(5)].map((_, index) => {
        let newIndex = index;
        newIndex += 1;
        return (
          <Box key={newIndex} className={getRate(newIndex, rating)}>
            <span className="star">&#9733;</span>
          </Box>
        );
      })}
    </Box>
  );
}

StarRating.propTypes = {
  rating: PropTypes.number,
};

StarRating.defaultProps = {
  rating: 0,
};

export default StarRating;
