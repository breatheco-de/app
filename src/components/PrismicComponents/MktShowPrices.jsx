import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { Box, Skeleton, SkeletonText, Flex } from '@chakra-ui/react';
import ShowPrices from '../ShowPrices';
import { usePersistentBySession } from '../../hooks/usePersistent';
import useSignup from '../../hooks/useSignup';
import { getQueryString } from '../../utils';

function MktShowPrices({
  id,
  externalPlanProps,
  cohortId,
  title,
  subtitle,
  paymentSwitchPlacement,
  description,
  pricingMktInfo,
  plan,
  course,
  onBeforeCheckout,
  ...rest
}) {
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
    <Box
      maxWidth="1280px"
      px="10px"
      id={id}
      padding="32px"
      {...rest}
    >
      <ShowPrices
        title={title}
        subtitle={subtitle}
        list={planProps?.paymentOptions?.length > 0 ? planProps?.paymentOptions : planProps?.consumableOptions}
        handleUpgrade={(item) => {
          const querys = new URLSearchParams({
            plan: item?.plan_slug,
            plan_id: item?.plan_id,
            cohort: cohortId,
            coupon: queryCoupon || coupon,
            course,
          }).toString();
          const doPush = () => router.push(`/checkout?${querys}`);
          if (typeof onBeforeCheckout === 'function') {
            onBeforeCheckout(doPush);
          } else {
            doPush();
          }
        }}
        finance={planProps?.financingOptions}
        bullets={bullets}
        paymentSwitchPlacement={paymentSwitchPlacement}
      />
    </Box>
  ) : (
    <Flex
      maxWidth="1280px"
      width="100%"
      direction="column"
      gap="16px"
      padding="32px"
      borderRadius="10px"
      margin="0 auto"
    >
      <SkeletonText noOfLines={1} skeletonHeight="20px" width="500px" borderRadius="10px" />
      <SkeletonText noOfLines={1} skeletonHeight="20px" width="300px" borderRadius="10px" />
      <Skeleton height="400px" width="100%" borderRadius="10px" margin="0 auto" />
    </Flex>
  );
}

MktShowPrices.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  plan: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  id: PropTypes.string,
  cohortId: PropTypes.number,
  pricingMktInfo: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  externalPlanProps: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  course: PropTypes.string,
  paymentSwitchPlacement: PropTypes.oneOf(['outer', 'inner']),
  onBeforeCheckout: PropTypes.func,
};

MktShowPrices.defaultProps = {
  title: '',
  subtitle: '',
  description: '',
  id: '',
  cohortId: null,
  externalPlanProps: {},
  pricingMktInfo: [],
  course: '',
  paymentSwitchPlacement: 'outer',
  onBeforeCheckout: null,
};

export default MktShowPrices;
