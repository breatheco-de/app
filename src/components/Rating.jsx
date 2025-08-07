import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Flex, Text, Box, Avatar, SimpleGrid, Button, useBreakpointValue, AvatarGroup } from '@chakra-ui/react';
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
      <Flex alignItems="center" gap="10px">
        <Avatar src={review.avatar} name={review.name} size="sm" />
        <Box>
          <Text fontWeight="bold" color={fontColor}>{review.name}</Text>
          <Flex gap="10px" alignItems="center">
            <Flex gap="4px">
              {Array.from({ length: 5 }).map((_, index) => (
                <Icon icon="star" color={index + 1 <= roundedRating ? '#FFB718' : '#FFFFFF'} secondColor="#FFB718" width="12px" />
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

function Rating({ variant, totalRatings, totalReviews, rating, reviews, link, cardStyles, trustText, ratingUsers, ...rest }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const roundedRating = Math.round(parseFloat(rating)) || 0;
  const { navbarBackground, fontColor } = useStyle();

  const initialVisibleCount = useBreakpointValue({ base: 3, md: 6 });
  const [visibleReviewCount, setVisibleReviewCount] = useState(initialVisibleCount);

  useEffect(() => {
    setVisibleReviewCount(initialVisibleCount);
  }, [initialVisibleCount]);

  const handleLoadMore = () => {
    setVisibleReviewCount(reviews.length);
  };

  if (variant === 'inline') {
    return (
      <Flex gap="8px" alignItems="center">
        {ratingUsers && ratingUsers.length > 0 && (
          <AvatarGroup size="sm" max={5} spacing="-8px">
            {ratingUsers.slice(0, 4).map((userImage, index) => (
              <Avatar
                src={userImage}
                alt={`User ${index + 1}`}
                name={`User ${index + 1}`}
                border="1px solid"
                borderColor={navbarBackground}
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
              />
            ))}
          </AvatarGroup>
        )}

        <Flex direction="column" gap="8px">
          <Flex alignItems="center" gap="8px" {...rest}>
            {(parseFloat(rating) > 0 && roundedRating > 0) && (
              <>
                <Text fontSize="14px" color={fontColor}>{rating}</Text>
                <Flex gap="4px">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const isFullStar = index + 1 <= Math.floor(parseFloat(rating));
                    const isHalfStar = index === Math.floor(parseFloat(rating)) && parseFloat(rating) % 1 >= 0.5;

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
                {`(${totalRatings} ${t('reviews')})`}
              </Text>
            )}
          </Flex>
          {trustText && (
            <Text fontSize="14px" color={fontColor}>
              {trustText}
            </Text>
          )}
        </Flex>
      </Flex>
    );
  }

  const reviewsToShow = reviews.slice(0, visibleReviewCount);
  const showLoadMoreButton = visibleReviewCount < reviews.length;

  return (
    <>
      {reviews?.length > 0 && (
        <Flex direction="column" {...rest}>
          <Flex alignItems="center" gap="14px" mb={4}>
            <Icon icon="star" color="#FFB718" width="18px" />
            <Text fontSize="24px" color={fontColor}>
              {`${parseFloat(rating) > 0 ? rating : ''} ${t('course-rating')} ${totalReviews > 0 ? `- ${totalReviews} ${t('comments')}` : ''}`}
            </Text>
          </Flex>
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing="16px"
            marginTop="22px"
          >
            {reviewsToShow.map((reviewItem) => (
              <CommentCard review={reviewItem} {...cardStyles} />
            ))}
          </SimpleGrid>
          {showLoadMoreButton && (
            <Flex justifyContent="center" mt={8}>
              <Button onClick={handleLoadMore} variant="outline" borderColor="blue.default" color="blue.default" fontWeight="700">
                {t('load-more')}
              </Button>
            </Flex>
          )}
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
  reviews: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    rating: PropTypes.number,
    date: PropTypes.string,
    review: PropTypes.string,
  })),
  link: PropTypes.string,
  cardStyles: PropTypes.objectOf(PropTypes.string),
  trustText: PropTypes.string,
  ratingUsers: PropTypes.arrayOf(PropTypes.string),
};

CommentCard.propTypes = {
  review: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    rating: PropTypes.number,
    date: PropTypes.string,
    review: PropTypes.string,
  }).isRequired,
};

Rating.defaultProps = {
  variant: null,
  link: null,
  totalRatings: 0,
  totalReviews: 0,
  rating: 0,
  reviews: [],
  cardStyles: {},
  trustText: null,
  ratingUsers: [],
};

export default Rating;
