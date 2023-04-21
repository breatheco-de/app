/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { Box, Flex } from '@chakra-ui/react';
import { PrismicRichText } from '@prismicio/react';
import profileHandlers from '../../js_modules/profile/Subscriptions/handlers';
import ShowPrices from './ShowPrices';
import { parseQuerys } from '../../utils/url';
import Text from './Text';
import Icon from './Icon';
import Heading from './Heading';
import GridContainer from './GridContainer';

const BulletComponent = ({ bullet, isString }) => (
  <Box
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
        fontSize="14px"
        fontWeight="600"
        letterSpacing="0.05em"
        dangerouslySetInnerHTML={{ __html: bullet?.description }}
      />
    )}
    {isString ? bullet : bullet?.features[0]?.description}
  </Box>
);

const MktShowPrices = ({ id, title, description, plan, bullets, ...rest }) => {
  const { t } = useTranslation('profile');
  const router = useRouter();
  const [offerProps, setOfferProps] = useState({});
  const {
    getPlan,
  } = profileHandlers({});

  useEffect(async () => {
    const data = await getPlan({ slug: plan, disableRedirects: true, withCurrentPlan: true }).then((res) => res);
    setOfferProps(data);
  }, []);

  const isTotallyFree = offerProps?.isTotallyFree === true;

  const getDefaultFinanceIndex = () => {
    if (offerProps?.paymentOptions?.length > 0) return 0;
    if (offerProps?.financingOptions?.length > 0) return 1;
    return 0;
  };

  return offerProps?.slug ? (
    <GridContainer
      maxWidth="1280px"
      px="10px"
      id={id}
      padding="32px"
      flexDirection={{ base: 'column', lg: 'row' }}
      {...rest}
    >
      <Flex gridColumn="2 / span 4" flexDirection="column" margin="1rem 0 1rem 0" gridGap="8px">
        {title && (
          <Heading as="h2" size="l" margin="0 0 1.5rem 0">
            {title}
          </Heading>
        )}
        {description && (
          <PrismicRichText
            field={description}
            components={{
              paragraph: ({ children }, index) => (
                <Text key={index} size="md">
                  {children}
                </Text>
              ),
            }}
          />
        )}

        {(bullets?.length > 0 || offerProps?.bullets?.length > 0) && (
          <Box display="flex" flexDirection="column" gridGap="15px">
            <Text fontSize="14px" textTransform="uppercase" color="blue.default" fontWeight="700" lineHeight="31px">
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
                      listItem: ({ children }, index) => (
                        <BulletComponent key={index} bullet={children} isString />
                      ),
                    }}
                  />
                )
                : offerProps?.bullets.map((bullet) => (
                  <BulletComponent key={bullet?.features[0]?.description} bullet={bullet} />
                ))}
            </Box>
          </Box>
        )}
      </Flex>
      <Box gridColumn="6 / span 4">
        <ShowPrices
          title={offerProps?.outOfConsumables
            ? t('subscription.upgrade-modal.choose_how_much')
            : t('subscription.upgrade-modal.choose_your_plan')}
          planSlug={offerProps?.slug}
          notReady={t('subscription.upgrade-modal.not_ready_to_commit')}
          defaultFinanceIndex={getDefaultFinanceIndex()}
          list={offerProps?.paymentOptions?.length > 0 ? offerProps?.paymentOptions : offerProps?.consumableOptions}
          onePaymentLabel={t('subscription.upgrade-modal.one_payment')}
          financeTextLabel={t('subscription.upgrade-modal.finance')}
          handleUpgrade={(item) => {
            const hasAvailableCohorts = item?.suggested_plan?.has_available_cohorts;
            const period = item?.period;

            const querys = parseQuerys({
              plan: item?.suggested_plan?.slug,
              plan_id: item?.plan_id,
              has_available_cohorts: hasAvailableCohorts,
              price: item?.price,
              period,
            });
            router.push(`/checkout${querys}`);
          }}
          finance={offerProps?.financingOptions}
          outOfConsumables={offerProps?.outOfConsumables}
          isTotallyFree={isTotallyFree}
        />
      </Box>
    </GridContainer>
  ) : 'loading...';
};

MktShowPrices.propTypes = {
  title: PropTypes.string,
  plan: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string]),
  id: PropTypes.string,
};
MktShowPrices.defaultProps = {
  title: '',
  description: '',
  id: '',
};

BulletComponent.propTypes = {
  bullet: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string]).isRequired,
  isString: PropTypes.bool,
};

BulletComponent.defaultProps = {
  isString: false,
};

export default MktShowPrices;
