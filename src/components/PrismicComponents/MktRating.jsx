import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Heading as ChakraHeading,
} from '@chakra-ui/react';
import { PrismicRichText } from '@prismicio/react';
import Rating from '../Rating';

function RichTextTitleH2({ children }) {
  return (
    <ChakraHeading as="h2" size="lg" textAlign="center" mb={{ base: 6, md: 8 }}>
      {children}
    </ChakraHeading>
  );
}
RichTextTitleH2.propTypes = { children: PropTypes.node };
RichTextTitleH2.defaultProps = { children: null };

function RichTextParagraphAsTitle({ children }) {
  return (
    <ChakraHeading as="h2" size="lg" textAlign="center" mb={{ base: 6, md: 8 }}>
      {children}
    </ChakraHeading>
  );
}
RichTextParagraphAsTitle.propTypes = { children: PropTypes.node };
RichTextParagraphAsTitle.defaultProps = { children: null };

const prismicTitleComponents = {
  heading2: RichTextTitleH2,
  paragraph: RichTextParagraphAsTitle,
};

function MktRating({ slice }) {
  if (!slice) {
    return null;
  }

  const sectionTitleField = slice.primary?.section_title;

  if (slice.variation === 'default' || !slice.variation) {
    const overallRating = slice.primary?.rating;
    const totalRatings = slice.primary?.total_ratings;
    const totalReviews = slice.primary?.reviews_numbers;

    const formattedReviews = slice.items?.map((item) => ({
      avatar: item.avatar?.url,
      name: item.name,
      rating: item.rating,
      date: item.date,
      review: item.review,
    })) || [];

    if (!overallRating && formattedReviews.length === 0) {
      return null;
    }

    return (
      <Box maxW="1280px" mx="auto">
        {sectionTitleField && sectionTitleField.length > 0 && (
          <PrismicRichText field={sectionTitleField} components={prismicTitleComponents} />
        )}
        <Rating
          variant={undefined}
          rating={overallRating ? String(overallRating) : '0'}
          totalRatings={totalRatings ? String(totalRatings) : '0'}
          totalReviews={totalReviews ? String(totalReviews) : '0'}
          reviews={formattedReviews}
        />
      </Box>
    );
  }

  if (slice.variation === 'inlineSummary' || slice.variation === 'inline') {
    const overallRating = slice.primary?.rating;
    const totalRatings = slice.primary?.total_ratings;

    if (!overallRating) {
      return null;
    }

    return (
      <Box py={{ base: 2, md: 4 }} px={{ base: 4, md: 0 }}>
        {sectionTitleField && sectionTitleField.length > 0 && (
          <PrismicRichText field={sectionTitleField} components={prismicTitleComponents} />
        )}
        <Rating
          variant="inline"
          rating={overallRating ? String(overallRating) : '0'}
          totalRatings={totalRatings ? String(totalRatings) : '0'}
        />
      </Box>
    );
  }

  return null;
}

MktRating.propTypes = {
  slice: PropTypes.shape({
    variation: PropTypes.string,
    primary: PropTypes.shape({
      section_title: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
      rating: PropTypes.number,
      total_ratings: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      reviews_numbers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        avatar: PropTypes.shape({ url: PropTypes.string }),
        name: PropTypes.string,
        rating: PropTypes.number,
        date: PropTypes.string,
        review: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))]),
      }),
    ),
  }),
};

MktRating.defaultProps = {
  slice: null,
};

export default MktRating;
