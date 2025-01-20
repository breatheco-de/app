import { useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import PricingCard from './PricingCard';

function MktPricingCards() {
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    fetch('/plans-info.json')
      .then((response) => response.json())
      .then((data) => setPlans(data))
      .catch((error) => console.error('Error al cargar el JSON:', error));
  }, []);

  return (
    <Flex flexWrap={{ base: 'wrap', lg: 'nowrap' }} justifyContent="center" gridGap="24px" margin="0 auto">
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
};

MktPricingCards.defaultProps = {
  id: '',
  title: null,
  url: '',
};

export default MktPricingCards;
