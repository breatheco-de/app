import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';
import PricingCard from './PricingCard';

function MktPricingCards({ margin, maxWidth, url, id }) {
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
    <Flex id={id} flexWrap={{ base: 'wrap', lg: 'nowrap' }} justifyContent="center" gridGap="24px" margin={margin} maxWidth={maxWidth}>
      {plans?.map((plan) => (
        <PricingCard
          key={plan?.plan_id}
        //   courseData={selectedCourseData}
          item={plan}
          width={{ base: '300px', md: '100%' }}
        />
      ))}
    </Flex>
  );
}

MktPricingCards.propTypes = {
  margin: PropTypes.string,
  maxWidth: PropTypes.string,
  url: PropTypes.string.isRequired,
  id: PropTypes.string,
};

MktPricingCards.defaultProps = {
  margin: '',
  maxWidth: '',
  id: '',
};

export default MktPricingCards;
