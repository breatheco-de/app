/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, Avatar,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Heading from './Heading';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import StarRating from './StarRating';
import { lengthOfString } from '../../utils';

const MktTestimonials = ({
  id,
  title,
  endpoint,
  testimonials,
}) => {
  const [testimonialsData, setTestimonialsData] = useState();
  const { fontColor2, backgroundColor } = useStyle();

  useEffect(() => {
    if (typeof endpoint === 'string' && endpoint?.length > 8) {
      axios.get(`${process.env.BREATHECODE_HOST}${endpoint}`)
        .then((response) => {
          setTestimonialsData(response?.data);
        });
    }
  }, []);

  const testimonialsArray = (testimonialsData?.length > 0 && testimonialsData) || (testimonials?.length > 0 && testimonials);

  const TestimonialBox = ({ picture, name, rating, description }) => {
    const limit = 160;
    const descriptionLength = lengthOfString(description);
    const truncatedDescription = descriptionLength > limit ? `${description?.substring(0, limit)}...` : description;

    return (
      <Box
        width="250px"
        background={backgroundColor}
        borderRadius="12px"
        padding="15px"
        textAlign="center"
      >
        <Avatar width="65px" height="65px" name={name} src={picture} />
        <Text marginTop="15px" lineHeight="16px" fontWeight="900" size="md">
          {name}
        </Text>
        <StarRating
          rating={rating / 2}
          margin="6px 0 0 0"
          justifyContent="center"
        />
        <Text
          marginTop="10px"
          fontSize="sm"
          fontWeight="400"
          lineHeight="14px"
          color={fontColor2}
          title={description}
        >
          {`“${truncatedDescription}”`}
        </Text>
      </Box>
    );
  };

  return (
    <Box id={id} padding="20px 0" textAlign="center" marginBottom="20px">
      {title && (
        <Heading as="h2" size="m" marginBottom="20px">
          {title}
        </Heading>
      )}
      <Box
        gridGap="20px"
        flexWrap="wrap"
        marginBottom="15px"
        display="flex"
        justifyContent="center"
      >
        {testimonialsArray && testimonialsArray.map((testimonial) => (
          <TestimonialBox
            key={testimonial?.id}
            picture={testimonial?.author?.profile?.avatar_url}
            name={`${testimonial?.author?.first_name} ${testimonial?.author?.last_name}`}
            rating={testimonial?.total_rating}
            description={testimonial?.comments}
          />
        ))}
      </Box>
    </Box>
  );
};

MktTestimonials.propTypes = {
  title: PropTypes.string,
  endpoint: PropTypes.string,
  testimonials: PropTypes.arrayOf(PropTypes.any),
};

MktTestimonials.defaultProps = {
  title: null,
  endpoint: '',
  testimonials: null,
};

export default MktTestimonials;
