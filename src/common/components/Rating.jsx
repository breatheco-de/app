import PropTypes from 'prop-types';
import { Flex, Text, Box, Avatar, SimpleGrid } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Icon from './Icon';

function CommentCard({ review }) {
  const roundedRating = Math.round(review.rating) || 0;

  return (
    <Flex
      direction="column"
      border="1px solid #E2E8F0"
      borderRadius="md"
      p="16px"
      bg="white"
      gap="10px"
    >
      {/* Avatar y Nombre */}
      <Flex alignItems="center" gap="10px">
        <Avatar src={review.avatar} name={review.name} size="sm" />
        <Box>
          <Text fontWeight="bold">{review.name}</Text>
          <Flex gap="10px" alignItems="center">
            <Flex gap="4px">
              {Array.from({ length: 5 }).map((_, index) => (
                index + 1 <= roundedRating ? (
                  <Icon icon="star" color="#FFB718" width="12px" />
                ) : (
                  <Icon icon="star" color="#FFFFFF" secondColor="#FFB718" width="12px" />
                )
              ))}
            </Flex>
            <Text fontSize="12px" color="gray.500">{review.date}</Text>
          </Flex>
        </Box>
      </Flex>

      <Text fontSize="14px" color="gray.700" mt="8px">
        {review.review}
      </Text>
    </Flex>
  );
}
function Rating({ variant, totalRatings, totalReviews, rating, reviews, link, ...rest }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const roundedRating = Math.round(rating) || 0;

  if (variant === 'inline') {
    return (
      <Flex alignItems="center" gap="8px" {...rest}>
        <Text fontSize="14px">{rating}</Text>
        <Flex gap="4px">
          {Array.from({ length: 5 }).map((_, index) => (
            <>
              {index + 1 <= roundedRating ? (
                <Icon icon="star" color="#FFB718" width="18px" />
              ) : (
                <Icon icon="star" color="#ffffff" secondColor="#FFB718" width="18px" />
              )}
            </>
          ))}
        </Flex>
        <Text onClick={() => router.push(link)} color="blue.default" textDecor="underline" fontWeight="bold" fontSize="14px" cursor="pointer">
          {`(${totalRatings} ${t('common:reviews')})`}
        </Text>
      </Flex>
    );
  }

  return (
    <>
      {reviews?.length > 0 && (
        <Flex direction="column" {...rest}>
          <Flex alignItems="center" gap="14px">
            <Icon icon="star" color="#FFB718" width="18px" />
            <Text fontSize="24px">{`${rating} ${t('course-rating')} ${totalReviews > 0 && `- ${totalReviews} ${t('comments')}`}`}</Text>
          </Flex>
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }} // 1 columna en móviles, 2 en tablets, 3 en desktop
            spacing="16px"
            marginTop="22px"
          >
            {reviews.map((review) => (
              <CommentCard review={review} />
            ))}
          </SimpleGrid>
        </Flex>
      )}
    </>
  );
}

Rating.propTypes = {
  variant: PropTypes.string,
  totalRatings: PropTypes.string,
  totalReviews: PropTypes.string,
  rating: PropTypes.string,
  reviews: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  link: PropTypes.string,
};

CommentCard.propTypes = {
  review: PropTypes.string.isRequired,
};

Rating.defaultProps = {
  variant: null,
  link: null,
  totalRatings: 0,
  totalReviews: 0,
  rating: 0,
  reviews: [],
};
export default Rating;
