/* eslint-disable react/destructuring-assignment */
import { Box, Button, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Icon from './Icon';
import { parseQuerys } from '../../utils/url';
import { slugToTitle } from '../../utils';

export default function PricingCard({ item }) {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const { hexColor } = useStyle();
  const planColors = {
    basic: {
      type: t('pricing.basic-plan.type'),
      hookMessage: t('pricing.basic-plan.hook-message'),
      title: t('pricing.basic-plan.title'),
      description: t('pricing.basic-plan.description'),

      border: `1px solid ${hexColor.blueDefault}`,
      background: 'blue.default',
      featured: 'blue.light',
      button: {
        variant: 'outline',
        color: 'blue.default',
        borderColor: 'blue.default',
        background: '',
        title: t('pricing.basic-plan.button-title'),
      },
    },
    premium: {
      type: t('pricing.premium-plan.type'),
      hookMessage: t('pricing.premium-plan.hook-message'),
      title: t('pricing.premium-plan.title'),
      description: t('pricing.premium-plan.description'),

      border: `1px solid ${hexColor.yellowDefault}`,
      background: 'yellow.default',
      featured: 'yellow.light',
      button: {
        variant: 'default',
        color: 'white',
        borderColor: '',
        background: 'yellow.default',
        title: t('pricing.premium-plan.button-title'),
      },
    },
  };
  const viewProps = item.price > 0 ? planColors.premium : planColors.basic;
  const isFree = item.price === 0;
  const border = viewProps?.border;
  const background = viewProps?.background;
  const featured = viewProps?.featured;

  const handlePlan = (plan) => {
    const qs = parseQuerys({
      plan: item?.plan,
      plan_id: plan?.plan_id,
    });
    console.log('clicked:plan:', `/checkout${qs}`);
    // TODO: Remove this after finished
    if (plan === 'a') {
      router.push(`/checkout${qs}`);
    }
  };

  const isTotallyFree = item.type === 'FREE';
  const freeTrialLabel = isTotallyFree ? 'Free forever' : `Free trial for ${item.trial_duration} ${item.trial_duration_unit}`;

  return (
    <Flex
      maxWidth="410px"
      flexDirection="column"
      borderRadius="11px"
      border={border}
      width="100%"
      background="white"
      color="black"
    >
      <Flex padding="8px" flexDirection="column" gridGap="24px" background={featured} borderRadius="11px">
        <Box as="span" color="white" width="fit-content" padding="4px 1rem" fontSize="18px" fontWeight={700} background={background} borderRadius="22px">
          {viewProps.type}
        </Box>
        <Text fontSize="18px" height="40px" fontWeight={700} color={isFree ? '' : 'yellow.default'} textAlign="center" style={{ textWrap: 'balance' }}>
          {viewProps.hookMessage}
        </Text>
        <Box>
          <Box fontSize="var(--heading-xl)" color="black" fontWeight={700} textAlign="center">
            {`$${item.price}`}
          </Box>
          <Text fontSize="14px" fontWeight={700} textAlign="center" pb="16px">
            {/* TODO: depende de "period" */}
            {isFree ? freeTrialLabel : 'Monthly '}
          </Text>

          <Button variant={viewProps.button.variant} color={viewProps.button.color} borderColor={viewProps.button.borderColor} onClick={() => handlePlan(item)} display="flex" gridGap="10px" background={viewProps.button.background} fontSize="17px" width="100%" textAlign="center" padding="12px 24px">
            {!isFree && (
              <Icon icon="rocket" color="white" width="16px" height="24px" style={{ transform: 'rotate(35deg)' }} />
            )}
            {viewProps.button.title}
          </Button>
        </Box>
      </Flex>
      <Flex padding="16px" flexDirection="column">
        <Flex gridGap="8px" flexDirection="column">
          <Text size={isFree ? '18px' : '21px'} fontWeight={700} textAlign="center">
            {viewProps.title}
          </Text>
          <Text size="14px" textAlign="center" width="100%">
            {viewProps.description}
          </Text>
        </Flex>
        <Flex flexDirection="column" gridGap="16px" mt="16px">
          {item?.featured_info?.map((info) => info.service.slug && (
            <Box>
              <Text size="16px" fontWeight={700} textAlign="left">
                {slugToTitle(info.service.slug)}
              </Text>
              {info.features.length > 0 && (
                <Text size="14px" textAlign="left">
                  {info.features[0]?.description}
                </Text>
              )}
            </Box>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}

PricingCard.propTypes = {
  item: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object])).isRequired,
};
