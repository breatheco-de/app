import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from './Heading';
import DraggableContainer from './DraggableContainer';
import DynamicContentCard from './DynamicContentCard';

function SmallCardsCarousel({ title, cards, boxStyle, ...rest }) {
  if (cards.length === 0) return null;

  return (
    <Box mt="20px" mb="31px" {...rest}>
      {title && (
        <Heading size="m" fontWeight={700} mb="20px !important">
          {title}
        </Heading>
      )}
      <DraggableContainer>
        <Box gap="16px" display="flex">
          {cards.map((card) => (
            <DynamicContentCard
              key={card.slug}
              data={card}
              type={card.type}
            />
          ))}
        </Box>
      </DraggableContainer>
    </Box>
  );
}

SmallCardsCarousel.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  title: PropTypes.string,
  boxStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
SmallCardsCarousel.defaultProps = {
  cards: [],
  title: null,
  boxStyle: {},
};

export default SmallCardsCarousel;
