/* eslint-disable react/destructuring-assignment */
import { Box, Button, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Image } from '@chakra-ui/next-js';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Icon from './Icon';
import { parseQuerys } from '../../utils/url';
import { slugToTitle } from '../../utils';

export default function PricingCard({ item, relatedSubscription, ...rest }) {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const { fontColor, hexColor, featuredCard } = useStyle();
  const utilProps = {
    already_have_it: t('pricing.already-have-plan'),
    basic: {
      type: t('pricing.basic-plan.type'),
      hookMessage: t('pricing.basic-plan.hook-message'),
      title: t('pricing.basic-plan.title'),
      description: t('pricing.basic-plan.description'),

      border: `1px solid ${hexColor.blueDefault}`,
      background: featuredCard.blue.background,
      featured: featuredCard.blue.featured,
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
      background: featuredCard.yellow.background,
      featured: featuredCard.yellow.featured,
      button: {
        variant: 'default',
        color: 'white',
        borderColor: '',
        background: featuredCard.yellow.background,
        title: t('pricing.premium-plan.button-title'),
      },
    },
  };
  const viewProps = item.price > 0 ? utilProps.premium : utilProps.basic;
  const isFree = item.price === 0;
  const border = viewProps?.border;
  const background = viewProps?.background;
  const featured = viewProps?.featured;

  const handlePlan = () => {
    const qs = parseQuerys({
      plan: item?.plan_slug,
      plan_id: item?.plan_id,
    });

    router.push(`/checkout${qs}`);
  };

  return (
    <Flex
      maxWidth="410px"
      flexDirection="column"
      borderRadius="11px"
      border={border}
      width="100%"
      background={featuredCard.background}
      height="fit-content"
      color={fontColor}
      {...rest}
    >
      <Flex padding="8px" flexDirection="column" gridGap="24px" background={featured} borderRadius="11px">
        <Box as="span" color="white" width="fit-content" padding="4px 1rem" fontSize="18px" fontWeight={700} background={background} borderRadius="22px">
          {viewProps.type}
        </Box>
        <Text fontSize="18px" height="40px" fontWeight={700} color={isFree ? '' : 'yellow.default'} textAlign="center" style={{ textWrap: 'balance' }}>
          {viewProps.hookMessage}
        </Text>
        <Box>
          {item.price > 0 ? (
            <Box display="flex" alignItems="center" justifyContent="center" gridGap="4px">
              <Box fontSize="var(--heading-xl)" fontWeight={700} textAlign="center">
                {`$${item.price}`}
              </Box>
              <Box fontSize="20px" textDecoration="line-through" textAlign="center">
                {`$${Math.floor(item.price * 1.2)}`}
              </Box>
            </Box>
          ) : (
            <Box fontSize="var(--heading-xl)" fontWeight={700} textAlign="center">
              {`$${item.price}`}
            </Box>
          )}
          <Text fontSize="14px" fontWeight={700} textAlign="center" pb="16px">
            {item.period_label}
          </Text>

          {relatedSubscription?.invoices?.[0]?.amount === item?.price ? (
            <Text width="100%" color={viewProps.background} textAlign="center" size="17px" fontWeight={700} padding="7.3px 24px">
              {utilProps.already_have_it}
            </Text>
          ) : (
            <Button variant={viewProps.button.variant} color={viewProps.button.color} borderColor={viewProps.button.borderColor} onClick={handlePlan} display="flex" gridGap="10px" background={viewProps.button.background} fontSize="17px" width="100%" textAlign="center" padding="12px 24px">
              {!isFree && (
                <Icon icon="rocket" color="white" width="16px" height="24px" style={{ transform: 'rotate(35deg)' }} />
              )}
              {viewProps.button.title}
            </Button>
          )}
        </Box>
      </Flex>
      <Flex padding="16px" flexDirection="column">
        <Flex gridGap="8px" flexDirection="column">
          <Text display="flex" justifyContent="center" size={isFree ? '18px' : '21px'} fontWeight={700} textAlign="center">
            {!isFree && (
              <Icon icon="rocket" color={hexColor.yellowDefault} width="16px" height="24px" style={{ transform: 'rotate(35deg)', alignSelf: 'center', marginRight: '10px' }} />
            )}
            {viewProps.title}
          </Text>
          <Text size="14px" textAlign="center" width="100%">
            {viewProps.description}
          </Text>
        </Flex>
        <Flex flexDirection="column" gridGap="16px" mt="16px">
          {item?.featured_info?.map((info) => info.service.slug && (
            <Box display="flex" gridGap="8px">
              {info?.service?.icon_url
                ? <Image src={info.service.icon_url} width={16} height={16} style={{ objectFit: 'cover' }} alt="Icon for service item" margin="5px 0 0 0" />
                : (
                  <Icon icon="checked2" color={hexColor.blueDefault} width="16px" height="16px" margin="5px 0 0 0" />
                )}
              <Box>
                <Text size="16px" fontWeight={700} textAlign="left">
                  {info?.service?.title || slugToTitle(info?.service?.slug)}
                </Text>
                {info.features.length > 0 && (
                  <Text size="14px" textAlign="left">
                    {info.features[0]?.description}
                  </Text>
                )}
              </Box>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}

PricingCard.propTypes = {
  item: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object])).isRequired,
  relatedSubscription: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object])),
};
PricingCard.defaultProps = {
  relatedSubscription: {},
};
