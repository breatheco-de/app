/* eslint-disable react/no-array-index-key */
/* eslint-disable react/destructuring-assignment */
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Image, Box, Button, Flex, Divider, Skeleton, SkeletonText } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import useStyle from '../hooks/useStyle';
import useSignup from '../store/actions/signupAction';
import Text from './Text';
import Icon from './Icon';
import { parseQuerys } from '../../utils/url';
import { getQueryString, isWindow, slugToTitle } from '../../utils';
import { usePersistentBySession } from '../hooks/usePersistent';

export default function PricingCard({ item, courseData, isFetching, relatedSubscription, ...rest }) {
  const { t, lang } = useTranslation('signup');
  const { getPriceWithDiscount, state } = useSignup();
  const { selfAppliedCoupon } = state;
  const { fontColor, hexColor, featuredCard, featuredColor, backgroundColor6 } = useStyle();
  const [selectedFinancing, setSelectedFinancing] = useState({});
  const [accordionState, setAccordionState] = useState(false);
  const isBootcampOrCustomType = item?.planType && (item?.planType.toLowerCase() === 'bootcamp' || item?.planType.toLowerCase() === 'custom');
  const queryCoupon = getQueryString('coupon');
  const [coupon] = usePersistentBySession('coupon', []);

  const courseCoupon = selfAppliedCoupon?.plan === item?.plan_slug && selfAppliedCoupon;

  const priceProcessed = getPriceWithDiscount(selectedFinancing?.price || item?.optionList?.[0]?.price, courseCoupon);
  const discountApplied = priceProcessed?.originalPrice && priceProcessed.price !== priceProcessed.originalPrice;

  const premiumColor = () => (courseCoupon ? hexColor.green : hexColor.blueDefault);

  const utilProps = {
    already_have_it: t('pricing.already-have-plan'),

    custom: {
      type: item?.type,
      hookMessage: item?.title,
      heading_description: item?.description,
      service_items: item?.service_items,
      added_features: item?.added_features,
      title: item?.title,
      description: item?.['sub-description'],
      color: item?.featured_card ? 'white' : hexColor.black,
      featured: item?.featured_card?.color || '',
      border: item?.featured_card?.color || hexColor.lightColor,
      button: {
        variant: item?.button?.variant || 'default',
        color: item?.button?.color || '#fff',
        background: item?.button?.background || hexColor.blueDefault,
        title: item?.button?.title || item?.button,
      },
    },

    bootcamp: {
      type: item?.type,
      hookMessage: item?.description,
      service_items: item?.service_items,
      title: item?.title,
      description: item?.['sub-description'],
      color: hexColor.black,
      featured: '',
      border: hexColor.lightColor,
      button: {
        variant: 'default',
        color: '#fff',
        background: hexColor.blueDefault,
        title: item?.button,
      },
    },

    // basic
    basic: {
      type: t('pricing.basic-plan.type'),
      hookMessage: t('pricing.basic-plan.hook-message'),
      title: t('pricing.basic-plan.title'),
      description: t('pricing.basic-plan.description'),
      service_items: t('pricing.basic-plan.service_items', {}, { returnObjects: true }),
      featured_info: t('pricing.basic-plan.featured_info', {}, { returnObjects: true }),
      color: hexColor.black,
      featured: '',
      border: hexColor.lightColor,
      button: {
        variant: 'default',
        color: 'white',
        borderColor: 'blue.default',
        background: 'blue.default',
        title: t('pricing.basic-plan.button-title'),
      },
    },

    // premium
    premium: {
      type: t('pricing.premium-plan.type'),
      hookMessage: t('pricing.premium-plan.hook-message'),
      title: t('pricing.premium-plan.title'),
      description: t('pricing.premium-plan.description'),
      service_items: t('pricing.premium-plan.service_items', {}, { returnObjects: true }),
      featured_info: t('pricing.premium-plan.featured_info', {}, { returnObjects: true }),
      color: 'white',
      featured: courseCoupon ? hexColor.green : hexColor.blueDefault,
      border: isFetching ? hexColor.lightColor : premiumColor(),
      button: {
        variant: 'default',
        color: hexColor.black,
        borderColor: 'white',
        background: featuredCard.background,
        title: t('pricing.premium-plan.button-title'),
      },
    },
  };
  const viewProps = item?.price > 0 ? utilProps.premium : (utilProps?.[item?.planType] || utilProps.basic);
  const featuredInfo = item?.featured_info ? item?.featured_info : viewProps.featured_info;
  const isOriginalPlan = item?.planType === 'original';
  const color = viewProps?.color;
  const border = viewProps?.border;
  const featured = viewProps?.featured;
  const existsOptionList = item?.optionList?.length > 1;
  const manyMonths = selectedFinancing?.how_many_months || item?.optionList?.[0]?.how_many_months;
  const isPayable = item?.price > 0;
  const isTotallyFree = item?.type === 'FREE';
  const alreadyHaveIt = relatedSubscription?.plans?.[0]?.slug === item?.plan_slug;

  const handlePlan = () => {
    const langPath = lang === 'en' ? '' : `/${lang}`;
    const qs = parseQuerys({
      plan: selectedFinancing?.plan_slug || item?.plan_slug,
      plan_id: selectedFinancing?.plan_id || item?.plan_id,
      coupon: coupon || queryCoupon,
      cohort: courseData?.cohort?.id,
    });

    if (isWindow) {
      if (isBootcampOrCustomType) {
        window.location.href = item?.button_link;
      } else {
        window.location.href = `${langPath}/checkout${qs}`;
      }
    }
  };
  const toggleAccordion = () => setAccordionState(!accordionState);
  const sortPriority = (a, b) => a.sort_priority - b.sort_priority;

  function calculateCouponOnFinancing(price, discountValue, discountType) {
    if (typeof price !== 'number' || typeof discountValue !== 'number') {
      return price || 0;
    }

    const discountCalculators = {
      PERCENT_OFF: () => price - (price * discountValue),
      FIXED_PRICE: () => Math.max(price - discountValue, 0),
    };

    const discount = (discountCalculators[discountType]?.() || 0);

    return Math.round(discount * 100) / 100;
  }

  return (
    <Flex
      maxWidth="410px"
      flexDirection="column"
      borderRadius="11px"
      border="2px solid"
      borderColor={border}
      width="100%"
      background={featuredCard.background}
      height="fit-content"
      color={fontColor}
      position="relative"
      {...rest}
    >
      {discountApplied && (
        <Box position="absolute" right="20px" top="-20px">
          <Box
            borderRadius="55px"
            background={hexColor.green}
            padding="2px 8px"
            position="relative"
            zIndex="10"
          >
            <Box
              top="-9px"
              left="-37px"
              display="flex"
              justifyContent="center"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              width="44px"
              height="44px"
              fontSize="24px"
              position="absolute"
              borderRadius="41px"
              padding="10px"
              border="2px solid"
              borderColor="#03823E"
              background={hexColor.green}
            >
              🔥
            </Box>
            <Text fontSize="15px" color="#FFF">
              {t('discount', { discount: priceProcessed.discount })}
            </Text>
          </Box>
        </Box>
      )}
      <Flex height="auto" position="relative" padding="8px" paddingTop={discountApplied && '14px'} flexDirection="column" gridGap="16px" background={isFetching ? hexColor.lightColor : featured} borderRadius="8px 8px 0 0">
        <Text fontSize="18px" lineHeight="21px" height="auto" fontWeight={700} color={color} textAlign="center">
          {viewProps.hookMessage}
        </Text>
        <Box>
          {!isBootcampOrCustomType ? (
            <>
              {!isOriginalPlan ? (
                <Box display="flex" height="75px" alignItems="center" justifyContent="center" gridGap="4px">
                  {isFetching ? (
                    <Skeleton height="48px" width="10rem" borderRadius="4px" />
                  ) : (
                    <Flex gridGap="8px" alignItems="center">
                      <Box color={color} textAlign="center">
                        {existsOptionList
                          ? (
                            <>
                              {priceProcessed.originalPrice && (
                                <s style={{ fontSize: '16px' }}>
                                  {`$${priceProcessed.originalPrice}`}
                                </s>
                              )}
                              <Text fontSize="64px" fontFamily="Space Grotesk Variable" fontWeight={700} lineHeight="70px">
                                {`$${priceProcessed.price || item.price}`}
                              </Text>
                            </>
                          )
                          : (
                            <Text fontSize="64px" fontFamily="Space Grotesk Variable" fontWeight={700} lineHeight="70px">
                              {item?.price_text || item?.priceText}
                            </Text>
                          )}
                      </Box>
                      {existsOptionList && manyMonths > 1 && (
                        <Text size="36px" fontFamily="Space Grotesk Variable" color={color} letterSpacing="normal" fontWeight="700">
                          {`x ${manyMonths}`}
                        </Text>
                      )}
                    </Flex>
                  )}
                  {!isFetching && item?.discount_text && (
                    <Box color={color} fontFamily="Space Grotesk Variable" fontSize="20px" textDecoration="line-through" textAlign="center">
                      {item.discount_text}
                    </Box>
                  )}
                </Box>
              ) : (
                <>
                  {isFetching ? (
                    <Skeleton height="48px" margin="0.85rem auto 1.4rem auto" width="10rem" borderRadius="4px" />
                  ) : (
                    <Box color={color} width={(isPayable || !isTotallyFree) ? 'auto' : '80%'} fontFamily="Space Grotesk Variable" margin={(!isPayable && !isTotallyFree) ? '0' : '2rem auto 2.5rem auto'} fontSize={isPayable ? 'var(--heading-xl)' : '38px'} fontWeight={700} textAlign="center">
                      {isPayable && `$${item?.price}`}
                      {isTotallyFree && item?.period_label}
                      {!isPayable && !isTotallyFree && item?.priceText}
                    </Box>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <Flex alignItems="center" justifyContent="center" flexDirection="column" margin={item?.planType.toLowerCase() === 'custom' ? '0.5rem 0 1rem 0' : '2rem 0 3rem 0'} gridGap="4px">
                <Text lineHeight="48px" fontFamily="Space Grotesk Variable" color={color} fontSize="38px" fontWeight={item?.planType.toLowerCase() === 'custom' ? 500 : 700} textAlign="center">
                  {item?.planType.toLowerCase() === 'custom' ? item.price : item.ask}
                </Text>
                {item?.planType.toLowerCase() === 'custom' && item.description && (
                  <Text color={color} fontSize="14px" lineHeight="16.8px" fontWeight="400" fontFamily="Lato" textAlign="center">{viewProps.heading_description}</Text>
                )}
              </Flex>
            </>
          )}
          {isFetching ? (
            <SkeletonText margin="8px auto 0 auto" width="6rem" pb="16px" noOfLines={1} spacing="4" />
          ) : (
            <>
              {!isBootcampOrCustomType && item?.title && !isTotallyFree && (
                <Text color={color} fontSize="14px" fontWeight={700} textAlign="center" padding="10px 0">
                  {isPayable ? selectedFinancing?.title || item?.title : item?.period_label}
                </Text>
              )}
            </>
          )}

          {(!isBootcampOrCustomType && alreadyHaveIt) ? (
            <Text width="100%" textAlign="center" size="17px" fontWeight={700} padding="7.3px 24px">
              {utilProps.already_have_it}
            </Text>
          ) : (
            <>
              <Button isLoading={isFetching} margin={isBootcampOrCustomType ? '16px auto auto' : '0 auto'} variant={viewProps.button.variant} color={viewProps.button.color} borderColor={viewProps.button.borderColor} onClick={handlePlan} display="flex" gridGap="10px" background={viewProps.button.background} fontSize="17px" width="100%" textAlign="center" padding="0 24px">
                {!isOriginalPlan && !isBootcampOrCustomType && (
                  <Icon icon="graduationCap" color={viewProps.button.color} width="24px" height="24px" />
                )}
                {viewProps.button.title}
              </Button>
            </>
          )}
          {!isFetching && existsOptionList && !alreadyHaveIt && (
            <Accordion index={accordionState ? 0 : -1} allowMultiple>
              <AccordionItem variant="unstyled" border={0}>
                <h3>
                  <AccordionButton
                    width="100%"
                    border="1px solid"
                    mt="16px"
                    fontSize="17px"
                    padding="8px 0 8px 16px"
                    textAlign="center"
                    color={color}
                    onClick={toggleAccordion}
                    fontWeight={700}
                    height="40px"
                    borderRadius="3px"
                  >
                    <Box as="span" flex="1" textAlign="center">
                      {t('common:see-financing-options')}
                    </Box>
                    <Box borderLeft="1px solid" height="40px" padding="0 10px">
                      <AccordionIcon height="100%" />
                    </Box>

                  </AccordionButton>
                </h3>
                <AccordionPanel p={0} border={0}>
                  {item?.optionList.map(
                    (financing, i) => (
                      <Button
                        key={financing?.plan_id}
                        width="100%"
                        borderBottom={i === item.optionList.length - 1 ? '0' : '1px solid'}
                        borderColor={hexColor.borderColor}
                        background={featuredColor}
                        _hover={{ opacity: 0.9 }}
                        _active={{ opacity: 1 }}
                        fontSize="15px"
                        letterSpacing="0.05em"
                        textAlign="center"
                        fontWeight={500}
                        height="40px"
                        borderRadius={i === item.optionList.length - 1 ? '0 0 3px 3px' : '0'}
                        onClick={() => {
                          setSelectedFinancing(financing);
                          toggleAccordion();
                        }}
                      >
                        {`$${calculateCouponOnFinancing(financing?.price, courseCoupon?.discount_value, courseCoupon?.discount_type)} / ${financing?.title}`}
                      </Button>
                    ),
                  )}
                </AccordionPanel>
              </AccordionItem>
              {courseCoupon?.discount_type === 'FIXED_PRICE' && selectedFinancing?.period === 'FINANCING' && (
                <Text textAlign="center" fontWeight="300" size="xs" marginTop="10px" color="white">
                  {t('fixed-price-disclaimer')}
                </Text>
              )}
            </Accordion>
          )}
        </Box>
      </Flex>
      <Flex padding="16px" flexDirection="column">
        <Flex gridGap="8px" flexDirection="column">
          <Flex gap={2} alignItems="center">
            {viewProps.service_items.title_icon && <Icon icon={viewProps.service_items.title_icon} fill={hexColor.blueDefault} color={viewProps.service_items.title_color || hexColor.blueDefault} margin="5px 0 0 0" width="30px" height="30px" />}
            <Text color={viewProps.service_items.title_color || hexColor.fontColor2} size={viewProps.service_items.title_size || 'l'} fontWeight={700}>
              {viewProps.service_items.title}
            </Text>
          </Flex>
          {viewProps.service_items.items.map((serviceItem) => (
            <Text key={serviceItem.label} gap="5px" display="flex" alignItems="center" size="14px" width="100%">
              {serviceItem.icon === null ? '' : <Icon icon="checked2" color={hexColor.blueDefault} width="15px" height="10px" />}
              {serviceItem.label}
            </Text>
          ))}
        </Flex>
        <Divider margin="15px 0" border={`2px solid ${hexColor.lightColor}`} />
        <Flex display={{ base: 'none', md: 'flex' }} flexDirection="column" gridGap="16px" mt="16px">
          {isFetching ? Array.from({ length: 3 }).map((_, index) => {
            const randomWidth = Math.floor(Math.random() * 100) + 100;
            const randomTextLines = Math.floor(Math.random() * 4) + 1;
            return (
              <Flex flexDirection="column" gridGap="8px" mb={index !== 2 && '10px'}>
                <Skeleton key={index} height="10px" width={randomWidth} borderRadius="4px" />
                <SkeletonText key={index} margin="0 0 0 2rem" noOfLines={randomTextLines} />
              </Flex>
            );
          }) : (
            <>
              {featuredInfo.sort(sortPriority).map((info) => info?.service?.slug && (
                <Box key={info.service.slug} display="flex" gridGap="8px">
                  {info?.service?.icon_url
                    ? <Image src={info.service.icon_url} width={16} height={16} style={{ objectFit: 'cover' }} alt="Icon for service item" margin="5px 0 0 0" />
                    : (
                      <Icon icon={info.service.icon} fill={hexColor.blueDefault} color={info.service.icon_color || hexColor.blueDefault} width="25px" height="22px" margin="5px 0 0 0" />
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
            </>
          )}
        </Flex>

        <Accordion display={{ base: 'flex', md: 'none' }} allowMultiple flexDirection="column" gridGap="2px" mt="16px">
          {featuredInfo.sort(sortPriority).map((info) => info.service.slug && (
            <AccordionItem key={`responsive-${info.service.slug}`} display="flex" flexDirection="column" gridGap="2px" border={0}>
              <AccordionButton padding="8px 0">
                <Box display="flex" gridGap="10px" flex="1" textAlign="left">
                  {info?.service?.icon_url
                    ? <Image src={info.service.icon_url} width={16} height={16} style={{ objectFit: 'cover' }} alt="Icon for service item" margin="5px 0 0 0" />
                    : (
                      <Icon icon={info?.service?.icon} fill={hexColor.blueDefault} color={hexColor.blueDefault} width="25px" height="22px" margin="5px 0 0 0" />
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
      {viewProps.added_features && (
        <Flex flexDirection="column" borderBottomRadius="11px" background={backgroundColor6} padding="16px" gap="16px">
          <Text size="18px" lineHeight="21.6px" fontWeight="400">{t('added-features-title')}</Text>
          <Flex direction="column" gap="8px">
            {viewProps.added_features.items?.map((addedFeatureItem) => (
              <Flex justifyContent="space-between" width="100%" alignItems="center">
                <Text fontSize="14px">{addedFeatureItem.label}</Text>
                <Text fontSize="14px">{addedFeatureItem.price}</Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

PricingCard.propTypes = {
  item: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object])).isRequired,
  relatedSubscription: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object])),
  isFetching: PropTypes.bool,
  courseData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object])),
};
PricingCard.defaultProps = {
  relatedSubscription: {},
  isFetching: false,
  courseData: {},
};
