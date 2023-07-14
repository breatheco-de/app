import React from 'react';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import quoteImg from '../../img/quote.png';

const Quote = ({ children, ...props }) => {
  const { id, ...rest } = props;

  const quote = children.split('--')[0];
  const author = children.split('--')[1];

  return (
    <Box {...rest} className="quote-container" display="flex" justifyContent="center">

      <Box className="quote-img" width="32px" mr="5" mt="3">

        <img src={quoteImg.src} alt="quoteImg" />
      </Box>
      <Box className="quote-content" width="38%">
        <Box className="quote-paragraph">
          {quote}
          &quot;
        </Box>
        <Box className="quote-author" fontSize="sm" margin="1.5%" color="#0097CF">
          --
          {author}
        </Box>
      </Box>
    </Box>
  );
};
Quote.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
Quote.defaultProps = {
  children: '',
  id: '',
};
export default Quote;
