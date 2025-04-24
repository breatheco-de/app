import PropTypes from 'prop-types';
import { Flex, Text, Box, Avatar, SimpleGrid } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useStyle from '../hooks/useStyle';
import Icon from './Icon';

function CommentCard({ review, ...rest }) {
  const { backgroundColor, fontColor, borderColor, lightColor } = useStyle();
  const roundedRating = Math.round(review.rating) || 0;

  return (
    <Flex
      direction="column"
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      p="16px"
      bg={backgroundColor}
      gap="10px"
      {...rest}
    >
      {/* Avatar y Nombre */}
      <Flex alignItems="center" gap="10px">
        <Avatar src={review.avatar} name={review.name} size="sm" />
        <Box>
          <Text fontWeight="bold" color={fontColor}>{review.name}</Text>
          <Flex gap="10px" alignItems="center">
            <Flex gap="4px">
              {Array.from({ length: 5 }).map((_, index) => (
                index + 1 <= roundedRating ? (
                  // eslint-disable-next-line react/no-array-index-key
                  <Icon key={`${index}-${review.id}`} icon="star" color="#FFB718" width="12px" />
                ) : (
                  // eslint-disable-next-line react/no-array-index-key
                  <Icon key={`${index}-${review.id}`} icon="star" color="#FFFFFF" secondColor="#FFB718" width="12px" />
                )
              ))}
            </Flex>
            <Text fontSize="12px" color="gray.500">{review.date}</Text>
          </Flex>
        </Box>
      </Flex>

      <Text fontSize="14px" color={lightColor} mt="8px">
        {review.review}
      </Text>
    </Flex>
  );
}
function Rating({ variant, totalRatings, totalReviews, rating, reviews, link, cardStyles, ...rest }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const roundedRating = Math.round(rating) || 0;

  if (variant === 'inline') {
    return (
      <Flex alignItems="center" gap="8px" {...rest}>
        {(rating > 0 && roundedRating > 0) && (
          <>
            <Text fontSize="14px">{rating}</Text>
            <Flex gap="4px">
              {Array.from({ length: 5 }).map((_, index) => {
                const isFullStar = index + 1 <= Math.floor(rating);
                const isHalfStar = index === Math.floor(rating) && rating % 1 >= 0.5;

                return (
                  <Icon
                    icon="star"
                    color={isFullStar ? '#FFB718' : '#ffffff'}
                    secondColor="#FFB718"
                    width="18px"
                    fill={isHalfStar ? 'half' : undefined}
                  />
                );
              })}
            </Flex>
          </>
        )}

        {totalRatings > 0 && (
          <Text onClick={() => router.push(link)} color="blue.default" textDecor="underline" fontWeight="bold" fontSize="14px" cursor="pointer">
            {`(${totalRatings} ${t('common:reviews')})`}
          </Text>
        )}
      </Flex>
    );
  }

  return (
    <>
      {reviews?.length > 0 && (
        <Flex direction="column" {...rest}>
          <Flex alignItems="center" gap="14px">
            <Icon icon="star" color="#FFB718" width="18px" />
            <Text fontSize="24px">{`${rating > 0 && rating} ${t('course-rating')} ${totalReviews > 0 && `- ${totalReviews} ${t('comments')}`}`}</Text>
          </Flex>
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing="16px"
            marginTop="22px"
          >
            {reviews.map((review) => (
              <CommentCard review={review} {...cardStyles} />
            ))}
          </SimpleGrid>
        </Flex>
      )}
    </>
  );
}

Rating.propTypes = {
  variant: PropTypes.string,
  totalRatings: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  totalReviews: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reviews: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  link: PropTypes.string,
  cardStyles: PropTypes.objectOf(PropTypes.string),
};

CommentCard.propTypes = {
  review: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

Rating.defaultProps = {
  variant: null,
  link: null,
  totalRatings: 0,
  totalReviews: 0,
  rating: 0,
  reviews: [],
  cardStyles: {},
};
export default Rating;
