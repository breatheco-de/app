import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { Box, Skeleton } from '@chakra-ui/react';
import ShowPrices from './ShowPrices';
import { usePersistentBySession } from '../hooks/usePersistent';
import useSignup from '../hooks/useSignup';
import { getQueryString } from '../utils';

function MktShowPrices({ id, externalPlanProps, cohortId, title, description, pricingMktInfo, plan, ...rest }) {
  const { t } = useTranslation('course');
  const { generatePlan } = useSignup();
  const router = useRouter();
  const [planProps, setPlanProps] = useState({});
  const queryCoupon = getQueryString('coupon');
  const [coupon] = usePersistentBySession('coupon', []);

  useEffect(() => {
    if (externalPlanProps) {
      setPlanProps(externalPlanProps);
    } else {
      generatePlan(plan).then(setPlanProps);
    }
  }, [router, externalPlanProps]);

  const bullets = pricingMktInfo.length > 0 ? pricingMktInfo : t('course-default-bullets', {}, { returnObjects: true });

  return planProps?.slug ? (
    <Box maxWidth="1280px" px="10px" id={id} padding="32px" {...rest}>
      <ShowPrices
        title={t('pricing-title')}
        subtitle={t('pricing-subtitle')}
        list={planProps?.paymentOptions?.length > 0 ? planProps?.paymentOptions : planProps?.consumableOptions}
        handleUpgrade={(item) => {
          const querys = new URLSearchParams({
            plan: item?.plan_slug,
            plan_id: item?.plan_id,
            cohort: cohortId,
            coupon: queryCoupon || coupon,
          }).toString();
          router.push(`/checkout?${querys}`);
        }}
        finance={planProps?.financingOptions}
        bullets={bullets}
      />
    </Box>
  ) : (
    <Box display="flex" padding="32px">
      <Skeleton height="300px" width="100%" />
    </Box>
  );
}

MktShowPrices.propTypes = {
  title: PropTypes.string,
  plan: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  id: PropTypes.string,
  cohortId: PropTypes.number,
  pricingMktInfo: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  externalPlanProps: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.any)),
};

MktShowPrices.defaultProps = {
  title: '',
  description: '',
  id: '',
  cohortId: null,
  externalPlanProps: {},
  pricingMktInfo: [],
};

export default MktShowPrices;
