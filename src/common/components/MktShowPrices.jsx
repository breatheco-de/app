/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { Box, Flex, LinkBox } from '@chakra-ui/react';
import { PrismicRichText } from '@prismicio/react';
import ShowPrices from './ShowPrices';
import { parseQuerys } from '../../utils/url';
import Text from './Text';
import Icon from './Icon';
import Heading from './Heading';
import GridContainer from './GridContainer';
import { generatePlan, getTranslations } from '../handlers/subscriptions';
import { usePersistentBySession } from '../hooks/usePersistent';
import { getQueryString } from '../../utils';

function Paragraph({ children }, index) {
  return (
    <Text key={index} size="md">
      {children}
    </Text>
  );
}

function BulletComponent({ bullet, isString }) {
  return (bullet?.description || bullet?.features[0]?.description) && (
    <LinkBox
      as="li"
      key={isString ? bullet : bullet?.features[0]?.description}
      display="flex"
      flexDirection="row"
      lineHeight="24px"
      gridGap="8px"
    >
      <Icon
        icon="checked2"
        color="#38A56A"
        width="13px"
        height="10px"
        style={{ margin: '8px 0 0 0' }}
      />
      {bullet?.description && (
      <Box
        fontSize="18px"
        fontWeight="600"
        letterSpacing="0.05em"
        dangerouslySetInnerHTML={{ __html: bullet?.description }}
      />
      )}
      {isString ? bullet : bullet?.features[0]?.description}
    </LinkBox>
  );
}

function MktShowPrices({ id, externalPlanProps, cohortId, title, gridColumn1, gridColumn2, description, plan, bullets, externalSelection, ...rest }) {
  const { t } = useTranslation('profile');
  const router = useRouter();
  const [planProps, setPlanProps] = useState({});
  const [selectedBulletForPlan, setSelectedBulletForPlan] = useState(null);
  const translationsObj = getTranslations(t);
  const queryCoupon = getQueryString('coupon');
  const [coupon] = usePersistentBySession('coupon', []);
  const featuredInfoList = selectedBulletForPlan !== null ? selectedBulletForPlan : planProps?.featured_info;

  const handleGetPlan = async () => {
    const data = await generatePlan(plan, translationsObj).then((finalData) => finalData);
    setPlanProps(data);
  };

  useEffect(() => {
    if (externalPlanProps) {
      setPlanProps(externalPlanProps);
    } else {
      handleGetPlan();
    }
  }, [router, externalPlanProps]);

  const isTotallyFree = planProps?.isTotallyFree === true;

  const getDefaultFinanceIndex = () => {
    if (planProps?.paymentOptions?.length > 0) return 0;
    if (planProps?.financingOptions?.length > 0) return 1;
    return 0;
  };

  return planProps?.slug ? (
    <GridContainer
      maxWidth="1280px"
      px="10px"
      id={id}
      padding="32px"
      flexDirection={{ base: 'column', lg: 'row' }}
      {...rest}
    >
      <Flex gridColumn={gridColumn1} flexDirection="column" margin="1rem 0 1rem 0" gridGap="8px">
        {title && (
          <Heading as="h2" size="l" margin="0 0 1.5rem 0">
            {title}
          </Heading>
        )}
        {typeof description !== 'string' ? (
          <PrismicRichText
            field={description}
            components={{
              paragraph: Paragraph,
            }}
          />
        ) : (
          <Text
            size="md"
            fontSize="18px"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {(bullets?.length > 0 || featuredInfoList?.length > 0) && (
          <Box display="flex" flexDirection="column" gridGap="15px">
            <Text fontSize="18px" textTransform="uppercase" color="blue.default" fontWeight="700" lineHeight="31px">
              {t('subscription.what-you-will-get')}
            </Text>

            <Box
              as="ul"
              style={{ listStyle: 'none' }}
              display="flex"
              flexDirection="column"
              gridGap="12px"
              margin="0 0 0 5px"
            >
              {bullets?.length > 0
                ? (
                  <PrismicRichText
                    field={bullets}
                    components={{
                      listItem: ({ children }, index) => BulletComponent({ key: index, bullet: children, isString: true }),
                      // listItem: ({ children }, index) => <BulletComponent key={index} bullet={children} isString />,
                    }}
                  />
                )
                : featuredInfoList.map((bullet) => (
                  <BulletComponent key={bullet?.features[0]?.description} bullet={bullet} />
                ))}
            </Box>
          </Box>
        )}
      </Flex>
      <Box gridColumn={gridColumn2}>
        <ShowPrices
          cohortId={cohortId}
          title={planProps?.outOfConsumables
            ? t('subscription.upgrade-modal.choose_how_much')
            : t('subscription.upgrade-modal.choose_your_plan')}
          notReady={t('subscription.upgrade-modal.not_ready_to_commit')}
          defaultFinanceIndex={getDefaultFinanceIndex()}
          externalSelection={externalSelection}
          onSelect={(item) => {
            setSelectedBulletForPlan(item?.featured_info);
          }}
          list={planProps?.paymentOptions?.length > 0 ? planProps?.paymentOptions : planProps?.consumableOptions}
          onePaymentLabel={t('subscription.upgrade-modal.one_payment')}
          financeTextLabel={t('subscription.upgrade-modal.finance')}
          handleUpgrade={(item) => {
            const period = item?.period;

            const querys = parseQuerys({
              plan: item?.plan_slug,
              plan_id: item?.plan_id,
              price: item?.price,
              period,
              cohort: cohortId,
              coupon: queryCoupon || coupon,
            });
            router.push(`/checkout${querys}`);
          }}
          finance={planProps?.financingOptions}
          outOfConsumables={planProps?.outOfConsumables}
          isTotallyFree={isTotallyFree}
        />
      </Box>
    </GridContainer>
  ) : (
    <span>
      loading...
    </span>
  );
}

MktShowPrices.propTypes = {
  title: PropTypes.string,
  plan: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string]),
  id: PropTypes.string,
  gridColumn1: PropTypes.string,
  gridColumn2: PropTypes.string,
  cohortId: PropTypes.number,
  externalSelection: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  externalPlanProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
MktShowPrices.defaultProps = {
  title: '',
  description: '',
  id: '',
  gridColumn1: '2 / span 4',
  gridColumn2: '6 / span 4',
  cohortId: null,
  externalSelection: {},
  externalPlanProps: {},
};

BulletComponent.propTypes = {
  bullet: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string]).isRequired,
  isString: PropTypes.bool,
};

BulletComponent.defaultProps = {
  isString: false,
};

export default MktShowPrices;
