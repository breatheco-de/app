/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, Flex,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Heading from './Heading';
import Text from './Text';
import DraggableContainer from './DraggableContainer';
import useStyle from '../hooks/useStyle';
import StarRating from './StarRating';
import { lengthOfString } from '../../utils';
import axios from '../../axios';
import { BREATHECODE_HOST } from '../../utils/variables';

function TestimonialBox({ picture, name, rating, description, version }) {
  const { fontColor2, backgroundColor, hexColor } = useStyle();
  const limit = 160;
  const descriptionLength = lengthOfString(description);
  const truncatedDescription = descriptionLength > limit ? `${description?.substring(0, limit)}...` : description;

  const styles = {
    v1: {
      box: {
        background: backgroundColor,
        border: '1px solid',
        width: '250px',
      },
      textName: {
        fontWeight: '900',
        lineHeight: '16px',
      },
      imageStyles: {
        borderRadius: '50%',
        margin: '0 auto',
      },
    },
    v2: {
      textName: {
        height: '62px',
        fontSize: '18px',
        backgroundColor: '#CFEEFF',
        pt: '24px',
        pb: '16px',
        borderRadius: '8px 8px 0 0',
        fontWeight: 400,
        lineHeight: '21.6px',
        marginTop: '70px',
      },
      box: {
        width: '306px',
        position: 'relative',
        padding: '0px',
      },
      imageStyles: {
        border: '2px solid #00041A',
        position: 'absolute',
        borderRadius: '50%',
        top: '25px',
        left: 'calc(50% - 35px)',
      },
      imageBrand: {
        border: '2px solid none',
        borderRadius: '16px',
        margin: '10px auto',
        width: '59px',
        height: '19px',
        position: 'absolute',
        bottom: '175px',
        left: '166px',
        padding: '4px',
        backgroundColor: '#EEF9FE',
      },
      textDescription: {
        height: '130px',
        backgroundColor: '#FFFFFF',
        borderRadius: '0 0 8px 8px',
        padding: '0px 8px 0px 8px',
        width: '306px',
        fontSize: '12px',
        textAlign: 'center',
        lineHeight: '14.4px',
      },
    },
  };
  console.log('**********', styles[version]);
  return (
    <Box
      height={{ md: '270px', base: '320px' }}
      display="flex"
      justifyContent="space-between"
      flexDirection="column"
      borderRadius="12px"
      padding="15px"
      textAlign="center"
      borderColor={hexColor.borderColor}
      backgroundColor="red"
      flexShrink="0"
      {...styles[version]?.box}
    >
      <Image name={name} alt={`${name} picture`} src={picture} width={65} height={65} style={styles[version]?.imageStyles} />
      {version === 'v2' ? (
        <Image
          name={`${name}-2`}
          alt={`${name} picture 2`}
          src={picture}
          width={65}
          height={65}
          style={styles[version]?.imageBrand}
        />
      ) : null }
      <Text
        marginTop="15px"
        size="md"
        {...styles[version]?.textName}
      >
        {name}
      </Text>
      {version === 'v1' ? (
        <StarRating
          rating={rating}
          margin="6px 0 0 0"
          justifyContent="center"
        />
      ) : null}
      <Text
        marginTop="10px"
        fontSize="var(--chakra-fontSizes-xs)"
        fontWeight="400"
        lineHeight="14px"
        color={fontColor2}
        title={description}
        style={styles[version]?.textDescription}
      >
        {`“${truncatedDescription}”`}
      </Text>
    </Box>
  );
}

function MktTestimonials({
  id,
  title,
  endpoint,
  testimonials,
  version = 'v1',
  ...rest
}) {
  const [testimonialsData, setTestimonialsData] = useState();
  const router = useRouter();
  const defaultEndpoint = `${BREATHECODE_HOST}/v1/feedback/review?lang=${router?.locale}`;

  const getTestimonials = async () => {
    try {
      const response = await axios.get(endpoint || defaultEndpoint);

      const data = response?.data;

      if (typeof data === 'string') {
        setTestimonialsData([]);
      } else {
        setTestimonialsData(data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getTestimonials();
  }, []);

  const testimonialsArray = (testimonialsData?.length > 0 && testimonialsData) || (testimonials?.length > 0 && testimonials);

  const stylesBox = {
    v2: {
      titlesStyles: {
        fontSize: '38px',
        lineHeight: '45.6px',
        fontWeight: 400,
      },
    },
  };

  return testimonialsArray && (
    <Flex
      flexDirection="column"
      maxWidth="1280px"
      py="20px"
      id={id}
      width="100%"
      {...rest}
    >
      {title && (
        <Heading textAlign="center" as="h2" size="sm" marginBottom="20px" style={stylesBox[version]?.titlesStyles}>
          {title}
        </Heading>
      )}
      <DraggableContainer>
        <Box
          gridGap="20px"
          flexDirection="row"
          marginBottom="15px"
          display="flex"
          justifyContent={{ base: 'inherit', md: 'space-between' }}
          px={{ base: '10px', md: '2rem' }}
        >
          {testimonialsArray && testimonialsArray.map((testimonial) => (
            <TestimonialBox
              key={`${testimonial?.author?.first_name}-${testimonial?.author?.last_name}`}
              picture={testimonial?.author?.profile?.avatar_url}
              name={`${testimonial?.author?.first_name} ${testimonial?.author?.last_name}`}
              rating={testimonial?.total_rating}
              description={testimonial?.comments}
              version={version}
            />
          ))}
        </Box>
      </DraggableContainer>
    </Flex>
  );
}

MktTestimonials.propTypes = {
  version: PropTypes.string,
  title: PropTypes.string,
  endpoint: PropTypes.string,
  testimonials: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

MktTestimonials.defaultProps = {
  version: 'v1',
  title: null,
  endpoint: '',
  testimonials: null,
};

export default MktTestimonials;
