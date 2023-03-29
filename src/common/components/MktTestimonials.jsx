import PropTypes from 'prop-types';
import {
  Box, Avatar,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Heading from './Heading';
import Text from './Text';
import useStyle from '../hooks/useStyle';

const MktTestimonials = ({
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
        })
        .catch((error) => console.log('error:', error));
    }
  }, []);

  const testimonialsArray = (testimonialsData?.length > 0 && testimonialsData) || (testimonials?.length > 0 && testimonials);

  // eslint-disable-next-line react/prop-types
  const TestimonialBox = ({ picture, name, occupation, description }) => (
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
      <Text
        fontSize="sm"
        lineHeight="12px"
        fontWeight="700"
        marginTop="15px"
        color={fontColor2}
      >
        {occupation}
      </Text>
      <Text
        marginTop="10px"
        fontSize="sm"
        fontWeight="400"
        lineHeight="14px"
        color={fontColor2}
      >
        {`“${description}”`}
      </Text>
    </Box>
  );

  return (
    <Box padding="20px 0" textAlign="center" marginBottom="20px">
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
            picture={testimonial.picture}
            name={testimonial.name}
            occupation={testimonial.occupation}
            description={testimonial.description}
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
