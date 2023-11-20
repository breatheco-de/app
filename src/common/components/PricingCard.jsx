/* eslint-disable react/destructuring-assignment */
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Flex, Divider } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Image } from '@chakra-ui/next-js';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Icon from './Icon';
import { parseQuerys } from '../../utils/url';
import { isWindow, slugToTitle } from '../../utils';

export default function PricingCard({ item, relatedSubscription, ...rest }) {
  const { t, lang } = useTranslation('signup');
  const { fontColor, hexColor, featuredCard } = useStyle();
  const isBootcampType = item?.planType && item?.planType.toLowerCase() === 'bootcamp';
  const utilProps = {
    already_have_it: t('pricing.already-have-plan'),
    bootcamp: {
      type: item.type,
      hookMessage: item.description,
      service_items: item.service_items,
      title: item.title,
      description: item?.['sub-description'],
      color: hexColor.black,
      featured: '',
      border: hexColor.lightColor,
      featuredFontColor: featuredCard.blueDark,
      button: {
        variant: 'default',
        color: '#fff',
        background: hexColor.blueDefault,
        title: item.button,
      },
    },

    // basic
    original: {
      type: t('pricing.basic-plan.type'),
      hookMessage: t('pricing.basic-plan.hook-message'),
      title: t('pricing.basic-plan.title'),
      description: t('pricing.basic-plan.description'),
      service_items: t('pricing.basic-plan.service_items', {}, { returnObjects: true }),
      featured_info: t('pricing.basic-plan.featured_info', {}, { returnObjects: true }),
      color: hexColor.black,
      featured: '',
      border: hexColor.lightColor,
      featuredFontColor: fontColor,
      button: {
        variant: 'default',
        color: 'white',
        borderColor: 'blue.default',
        background: 'blue.default',
        title: t('pricing.basic-plan.button-title'),
      },
    },

    // premium
    suggested: {
      type: t('pricing.premium-plan.type'),
      hookMessage: t('pricing.premium-plan.hook-message'),
      title: t('pricing.premium-plan.title'),
      description: t('pricing.premium-plan.description'),
      service_items: t('pricing.premium-plan.service_items', {}, { returnObjects: true }),
      featured_info: t('pricing.premium-plan.featured_info', {}, { returnObjects: true }),
      color: 'white',
      featured: hexColor.blueDefault,
      border: hexColor.blueDefault,
      featuredFontColor: hexColor.yellowDefault,
      button: {
        variant: 'default',
        color: 'black',
        borderColor: '',
        background: 'white',
        title: t('pricing.premium-plan.button-title'),
      },
    },
  };
  const viewProps = item.price > 0 ? utilProps.suggested : (utilProps?.[item?.planType] || utilProps.original);
  const featuredInfo = item?.featured_info ? item?.featured_info : viewProps.featured_info;
  const isOriginalPlan = item?.planType === 'original';
  const color = viewProps?.color;
  const border = viewProps?.border;
  const featured = viewProps?.featured;

  const handlePlan = () => {
    const langPath = lang === 'en' ? '' : `/${lang}`;
    const qs = parseQuerys({
      plan: item?.plan_slug,
      plan_id: item?.plan_id,
    });

    if (isWindow) {
      if (isBootcampType) {
        window.location.href = item?.button_link;
      } else {
        window.location.href = `${langPath}/checkout${qs}`;
      }
    }
  };

  const sortPriority = (a, b) => a.sort_priority - b.sort_priority;

  return (
    <Flex
      maxWidth="410px"
      flexDirection="column"
      borderRadius="11px"
      border={`2px solid ${border}`}
      width="100%"
      background={featuredCard.background}
      height="fit-content"
      color={fontColor}
      {...rest}
    >
      <Flex height="255px" position="relative" padding="8px" flexDirection="column" gridGap="16px" background={featured} borderRadius="8px 8px 0 0">
        <Box as="span" color={color} width="fit-content" fontSize="14px" fontWeight={700} borderRadius="22px">
          {viewProps.type}
        </Box>
        <Text fontSize="18px" lineHeight="21px" height="auto" fontWeight={700} color={color} textAlign="center" style={{ textWrap: 'balance' }}>
          {viewProps.hookMessage}
        </Text>
        <Box>

          {!isBootcampType ? (
            <>
              {!isOriginalPlan ? (
                <Box display="flex" alignItems="center" justifyContent="center" gridGap="4px">
                  <Box color={color} fontSize="var(--heading-xl)" fontWeight={700} textAlign="center">
                    {`$${item.price}`}
                  </Box>
                  <Box color={color} fontSize="20px" textDecoration="line-through" textAlign="center">
                    {`$${Math.floor(item.price * 1.2)}`}
                  </Box>
                </Box>
              ) : (
                <Box color={color} fontSize="var(--heading-xl)" fontWeight={700} textAlign="center">
                  {`$${item?.price}`}
                </Box>
              )}
            </>
          ) : (
            <>
              <Box display="flex" alignItems="center" justifyContent="center" gridGap="4px">
                <Box lineHeight="48px" color={color} fontSize="var(--heading-l)" fontWeight={700} textAlign="center">
                  {`${item.ask}`}
                </Box>
              </Box>
            </>
          )}
          {item.period_label && (
            <Text color={color} fontSize="14px" fontWeight={700} textAlign="center" pb="16px">
              {item.period_label}
            </Text>
          )}

          {(!isBootcampType && relatedSubscription?.invoices?.[0]?.amount === item?.price) ? (
            <Text width="100%" color={viewProps.background} textAlign="center" size="17px" fontWeight={700} padding="7.3px 24px">
              {utilProps.already_have_it}
            </Text>
          ) : (
            <>
              <Button maxWidth={{ base: '250px', lg: '320px' }} position="absolute" transform="translate(-50%, 0)" left="50%" bottom="8px" variant={viewProps.button.variant} color={viewProps.button.color} borderColor={viewProps.button.borderColor} onClick={handlePlan} display="flex" gridGap="10px" background={viewProps.button.background} fontSize="17px" width="100%" textAlign="center" padding="12px 24px">
                {!isOriginalPlan && !isBootcampType && (
                  <Icon icon="rocket" color={viewProps.button.color} width="16px" height="24px" style={{ transform: 'rotate(35deg)' }} />
                )}
                {viewProps.button.title}
              </Button>
            </>
          )}
        </Box>
      </Flex>
      <Flex padding="16px" flexDirection="column">
        <Flex gridGap="8px" flexDirection="column">
          <Text color={hexColor.fontColor2} size="l" fontWeight={700}>
            {viewProps.service_items.title}
          </Text>
          {viewProps.service_items.items.map((serviceItem) => (
            <Text gap="5px" display="flex" alignItems="center" size="14px" width="100%">
              <Icon icon="checked2" color={hexColor.blueDefault} width="15px" height="10px" />
              {serviceItem.label}
            </Text>
          ))}
        </Flex>
        <Divider margin="15px 0" border={`2px solid ${hexColor.lightColor}`} />
        <Flex display={{ base: 'none', md: 'flex' }} flexDirection="column" gridGap="16px" mt="16px">
          {featuredInfo.sort(sortPriority).map((info) => info?.service?.slug && (
            <Box display="flex" gridGap="8px">
              {info?.service?.icon_url
                ? <Image src={info.service.icon_url} width={16} height={16} style={{ objectFit: 'cover' }} alt="Icon for service item" margin="5px 0 0 0" />
                : (
                  <Icon icon={info?.service?.icon} color={hexColor.blueDefault} width="25px" height="22px" margin="5px 0 0 0" />
                )}
              <Box>
                <Text size="16px" fontWeight={700} textAlign="left">
                  {info?.service?.title || slugToTitle(info?.service?.slug)}
                </Text>
                {info.features?.length > 0 && (
                  <Text
                    size="14px"
                    textAlign="left"
                    dangerouslySetInnerHTML={{ __html: info.features?.[0]?.description }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Flex>

        <Accordion display={{ base: 'flex', md: 'none' }} allowMultiple flexDirection="column" gridGap="2px" mt="16px">
          {featuredInfo.sort(sortPriority).map((info) => info.service.slug && (
            <AccordionItem display="flex" flexDirection="column" gridGap="2px" border={0}>
              <AccordionButton padding="8px 0">
                <Box display="flex" gridGap="10px" flex="1" textAlign="left">
                  {info?.service?.icon_url
                    ? <Image src={info.service.icon_url} width={16} height={16} style={{ objectFit: 'cover' }} alt="Icon for service item" margin="5px 0 0 0" />
                    : (
                      <Icon icon={info?.service?.icon} color={hexColor.blueDefault} width="25px" height="22px" margin="5px 0 0 0" />
                    )}
                  <Text size="16px" fontWeight={700} textAlign="left">
                    {info?.service?.title || slugToTitle(info?.service?.slug)}
                  </Text>
                </Box>
                {info.features?.length > 0 && (
                  <AccordionIcon />
                )}
              </AccordionButton>
              {info.features?.length > 0 && (
                <AccordionPanel padding="0 24px 16px 24px">
                  <Text
                    size="14px"
                    textAlign="left"
                    dangerouslySetInnerHTML={{ __html: info.features?.[0]?.description }}
                  />
                </AccordionPanel>
              )}
            </AccordionItem>
          ))}
        </Accordion>
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
