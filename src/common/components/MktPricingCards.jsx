import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Flex, Heading } from '@chakra-ui/react';
import PricingCard from './PricingCard';

function MktPricingCards({ margin, maxWidth, url, id, title, fontSize, fontWeight, lineHeight, marginBottom }) {
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    if (!url) return;

    fetch(`/${url}.json`)
      .then((response) => response.json())
      .then((data) => {
        setPlans(data);
      })
      .catch((error) => console.error('Error al cargar el JSON:', error));
  }, [url]);

  return (
    <>
      <Heading
        as="h2"
        size="sm"
        textAlign="center"
        mb={marginBottom || '1rem'}
        // weight={weight}
        lineHeight={lineHeight}
        style={{ fontSize, fontWeight }}
        mt="80px"
      >
        {title}
      </Heading>
      <Flex id={id} flexWrap={{ base: 'wrap', lg: 'nowrap' }} justifyContent="center" gridGap="24px" margin={margin} maxWidth={maxWidth}>
        {plans?.map((plan) => (
          <PricingCard
            title={title}
            key={plan?.plan_id}
        //   courseData={selectedCourseData}
            item={plan}
            width={{ base: '300px', md: '100%' }}
          />
        ))}
      </Flex>
    </>
  );
}

MktPricingCards.propTypes = {
  margin: PropTypes.string,
  maxWidth: PropTypes.string,
  url: PropTypes.string.isRequired,
  id: PropTypes.string,
  title: PropTypes.string,
  fontSize: PropTypes.string,
  fontWeight: PropTypes.string,
  lineHeight: PropTypes.string,
  marginBottom: PropTypes.string,
};

MktPricingCards.defaultProps = {
  margin: '',
  maxWidth: '',
  id: '',
  title: '',
  fontSize: '',
  fontWeight: '',
  lineHeight: '',
  marginBottom: '',
};

export default MktPricingCards;
