import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from './Heading';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import Icon from './Icon';
import TagCapsule from './TagCapsule';
import Link from './NextChakraLink';
import DraggableContainer from './DraggableContainer';

function SmallCardsCarousel({ title, cards, boxStyle, ...rest }) {
  const { hexColor } = useStyle();

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
            <Box
              key={card.title}
              width="350px"
              border="1px solid"
              borderColor={hexColor.borderColor}
              borderRadius="10px"
              padding="16px"
              flexShrink="0"
              // cursor="pointer"
              minHeight="135px"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              style={{ ...boxStyle }}
            >
              <Box alignItems="center" display="flex" justifyContent="space-between" marginBottom="10px" overflow="hidden">
                <TagCapsule
                  padding="0"
                  margin="0"
                  gap="10px"
                  tags={card.upperTags?.slice(0, 3) || []}
                  variant="rounded"
                  width="100%"
                  whiteSpace="nowrap"
                />
                {card.rightCornerElement && (
                  <>
                    {typeof card.rightCornerElement === 'string' ? (
                      <Text margin="0 !important" width="100%" fontWeight="400" color={hexColor.fontColor2} lineHeight="18px" textAlign="right">
                        {card.rightCornerElement}
                      </Text>
                    ) : card.rightCornerElement}
                  </>
                )}
              </Box>
              <Link color={hexColor.black} href={card.url} locale={card.lang}>
                <Box display="flex" alignItems="center" gap="5px" justifyContent="space-between">
                  <Text color={hexColor.black} size="md" fontWeight="700">
                    {card.title}
                  </Text>
                  <Icon icon="arrowRight" color={hexColor.blueDefault} width="20px" height="14px" />
                </Box>
              </Link>
              {card?.lowerTags && (
                <TagCapsule
                  padding="0"
                  margin="0"
                  gap="10px"
                  tags={card.lowerTags.slice(0, 3) || []}
                  variant="rounded"
                  width="100%"
                  color={hexColor.green}
                  background="green.light"
                  fontWeight="900"
                  textTransform="capitalize"
                  marginTop="10px"
                />
              )}
            </Box>
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
