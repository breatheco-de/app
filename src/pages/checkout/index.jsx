/* eslint-disable camelcase */
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import getT from 'next-translate/getT';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { Form, Formik } from 'formik';
import useCheckout from './useCheckout';
import { getDataContentProps } from '../../utils/file';
import bc from '../../services/breathecode';
import ContactInformation from '../../components/Checkout/ContactInformation';
import Summary from '../../components/Checkout/Summary';
import PaymentInfo from '../../components/Checkout/PaymentInfo';
import LiveClassesBanner from '../../components/Checkout/LiveClassesBanner';
import Stepper from '../../components/Checkout/Stepper';
import { removeSessionStorageItem } from '../../utils';
import signupAction from '../../store/actions/signupAction';
import LoaderScreen from '../../components/LoaderScreen';
import ModalInfo from '../../components/ModalInfo';
import useStyle from '../../hooks/useStyle';
import useSignup from '../../hooks/useSignup';
import Text from '../../components/Text';
import { ORIGIN_HOST, BREATHECODE_HOST } from '../../utils/variables';
import Icon from '../../components/Icon';
import AcordionList from '../../components/AcordionList';
import useCustomToast from '../../hooks/useCustomToast';
import { handlePriceTextWithCoupon } from '../../utils/getPriceWithDiscount';
import MarkdownParser from '../../components/MarkDownParser';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'signup');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const finance = getDataContentProps(`public/locales/${locale}`, 'finance');
  const image = t('seo.image', {
    domain: ORIGIN_HOST,
  });
  const ogUrl = {
    en: '/checkout',
    us: '/checkout',
  };

  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        locales,
        locale,
        image,
        url: ogUrl.en || `/${locale}/checkout`,
        pathConnector: '/checkout',
        keywords,
      },
      fallback: false,
      finance,
      hideDivider: true,
    },
  };
};

function getPlanPriceText(option, allCoupons, originalPlan, t) {
  const priceText = handlePriceTextWithCoupon(option.priceText, allCoupons, originalPlan.plans);
  if (option.pricePerMonthText) {
    const perMonth = handlePriceTextWithCoupon(option.pricePerMonthText, allCoupons, originalPlan.plans);
    return `${priceText} / ${option.title}, (${perMonth}${t('signup:info.per-month')})`;
  }
  return `${priceText} / ${option.title}`;
}

function Checkout() {
  const { t, lang } = useTranslation('signup');
  const router = useRouter();
  const {
    setCouponError,
    getDiscountValue,
    renderPlanDetails,
    calculateTotalPrice,
    handleCoupon,
    setDiscountCode,
    setUserSelectedPlan,
    setDiscountCoupon,
    couponError,
    checkInfoLoader,
    processedPrice,
    allCoupons,
    originalPlan,
    discountCode,
    currencySymbol,
    couponValue,
    planFormated,
    planId,
    fixedCouponExist,
    discountCoupon,
    liveClassCohorts,
    liveClassServiceItem,
    isLiveClassSelected,
    toggleLiveClassSelection,
    liveClassPrice,
    liveClassesCopy,
    removeManualCoupons,
  } = useCheckout();
  const { query } = router;
  const [showPaymentDetails, setShowPaymentDetails] = useState(true);
  const [verifyEmailProps, setVerifyEmailProps] = useState({});
  const {
    state, toggleIfEnrolled,
  } = signupAction();
  const {
    isFirstStep, isSecondStep, isThirdStep,
  } = useSignup();
  const { stepIndex, checkingData, paymentStatus, selectedPlan, alreadyEnrolled, loader } = state;
  const flexRef = useRef(null);
  const [menuWidth, setMenuWidth] = useState('auto');
  const [isOpenned, setIsOpenned] = useState(false);
  const { backgroundColor3, hexColor, backgroundColor } = useStyle();

  const { createToast } = useCustomToast({ toastId: 'coupon-plan-email-detail' });
  const { course } = query;
  const [prereqModalOpen, setPrereqModalOpen] = useState(false);
  const [currentPrereqIndex, setCurrentPrereqIndex] = useState(0);
  const [prerequisites, setPrerequisites] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');

  const isPaymentSuccess = paymentStatus === 'success';
  const currencyCode = selectedPlan?.currency?.code || originalPlan?.currency?.code || '';
  const formatMoney = (amount) => {
    if (!Number.isFinite(amount)) return `${currencySymbol}${amount}`;
    const suffix = currencyCode ? ` ${currencyCode}` : '';
    return `${currencySymbol}${amount.toFixed(2)}${suffix}`;
  };
  const baseSubtotalValue = Number(selectedPlan?.price) || 0;
  const formattedBaseSubtotal = selectedPlan?.price <= 0
    ? selectedPlan?.priceText || formatMoney(0)
    : formatMoney(baseSubtotalValue);
  const formattedAddonSubtotal = liveClassPrice > 0 ? formatMoney(liveClassPrice) : null;
  const totalNowAmount = (() => {
    if (selectedPlan?.price <= 0) {
      if (liveClassPrice > 0) return formatMoney(liveClassPrice);
      return selectedPlan?.priceText || formatMoney(0);
    }
    return formatMoney((processedPrice?.price ?? baseSubtotalValue) + liveClassPrice);
  })();
  let originalTotalAmount = null;
  if (selectedPlan?.price <= 0) {
    if (liveClassPrice > 0) {
      originalTotalAmount = formatMoney(liveClassPrice);
    }
  } else {
    originalTotalAmount = formatMoney(baseSubtotalValue + liveClassPrice);
  }

  useEffect(() => {
    const shouldShowPrereq = () => {
      if (!course) return false;
      if (typeof window === 'undefined') return false;
      return sessionStorage.getItem(`prereq_seen_${course}_${lang}`) !== 'true';
    };

    const fetchPrerequisites = async () => {
      try {
        if (!course) return;
        const cacheKey = `prereq_cache_${course}_${lang}`;
        const now = Date.now();
        const ttlMs = 60 * 60 * 1000;
        try {
          const cachedRaw = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && Array.isArray(cached.mdList) && (now - (cached.ts || 0) < ttlMs)) {
              setPrerequisites(cached.mdList);
              if (cached.title) setCourseTitle(cached.title);
              setCurrentPrereqIndex(0);
              if (shouldShowPrereq() && cached.mdList.length > 0) setPrereqModalOpen(true);
              return;
            }
          }
        } catch (err) {
          console.log(err);
        }

        const { data: courseData } = await bc.marketing({ lang }).getCourse(course);
        const raw = Array.isArray(courseData?.course_translation?.prerequisite)
          ? courseData.course_translation.prerequisite
          : [];
        const mdList = raw
          .map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') return item.content || item.description || item.md || '';
            return '';
          })
          .filter((md) => typeof md === 'string' && md.trim().length > 0);

        setPrerequisites(mdList);
        setCourseTitle(courseData?.course_translation?.title || '');
        setCurrentPrereqIndex(0);

        try {
          if (typeof window !== 'undefined') sessionStorage.setItem(cacheKey, JSON.stringify({ mdList, ts: now, title: courseData?.course_translation?.title || '' }));
        } catch (e) {
          console.log(e);
        }

        if (shouldShowPrereq() && mdList.length > 0) {
          setPrereqModalOpen(true);
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchPrerequisites();
  }, [course, lang]);
  const handleClosePrereq = () => {
    if (course && typeof window !== 'undefined') sessionStorage.setItem(`prereq_seen_${course}_${lang}`, 'true');
    setPrereqModalOpen(false);
  };

  useEffect(() => {
    const updateWidth = () => {
      if (flexRef.current) {
        setMenuWidth(`${flexRef.current.offsetWidth}px`);
      }
    };
    updateWidth();
    const handleResize = () => {
      updateWidth();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpenned]);

  return (
    <Box p={{ base: '0 0', md: '0' }} background={backgroundColor3} position="relative" minHeight={loader.plan ? '727px' : 'auto'}>
      <Modal isOpen={prereqModalOpen} onClose={handleClosePrereq} isCentered size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent marginX="10px">
          <ModalBody pt={2}>
            <Box maxH={{ base: '60vh', md: '70vh' }} overflowY="auto" pr={2}>
              {prerequisites.length > 0 && (
                <MarkdownParser
                  content={prerequisites[currentPrereqIndex]}
                />
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Flex width="100%" justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" gap={3}>
                {currentPrereqIndex > 0 && (
                  <Button
                    onClick={() => setCurrentPrereqIndex((idx) => (idx > 0 ? idx - 1 : 0))}
                    variant="default"
                  >
                    {t('signup:prereq-modal.go-to-page', { page: currentPrereqIndex })}
                  </Button>
                )}
                <Text fontSize="sm" color="gray.500">
                  {`${currentPrereqIndex + 1} / ${prerequisites.length}`}
                </Text>
              </Flex>
              <Button
                onClick={() => {
                  const hasSecond = prerequisites.length > 1;
                  const onFirst = currentPrereqIndex === 0;
                  if (hasSecond && onFirst) {
                    setCurrentPrereqIndex(1);
                  } else {
                    handleClosePrereq();
                  }
                }}
                variant="default"
              >
                {currentPrereqIndex === 0 && prerequisites.length > 1
                  ? t('signup:prereq-modal.go-to-page', { page: 2 })
                  : t('signup:prereq-modal.continue-registration')}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {loader.plan && (
        <LoaderScreen />
      )}
      <ModalInfo
        headerStyles={{ textAlign: 'center' }}
        title={t('signup:alert-message.validate-email-title')}
        footerStyle={{ flexDirection: 'row-reverse' }}
        closeButtonVariant="outline"
        closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
        childrenDescription={(
          <Box display="flex" flexDirection="column" alignItems="center" gridGap="17px">
            <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-1.png`} border="3px solid #0097CD" width="91px" height="91px" borderRadius="50px" />
            <Text
              size="14px"
              textAlign="center"
              dangerouslySetInnerHTML={{ __html: t('signup:alert-message.validate-email-description', { email: verifyEmailProps?.data?.email }) }}
            />
          </Box>
        )}
        isOpen={(verifyEmailProps.state) || (planFormated && verifyEmailProps.state)}
        buttonHandlerStyles={{ variant: 'default' }}
        actionHandler={async () => {
          const inviteId = verifyEmailProps?.data?.id;
          const resp = await bc.auth().resendConfirmationEmail(inviteId);

          const data = resp?.data;
          if (data === undefined) {
            createToast({
              position: 'top',
              status: 'info',
              title: t('signup:alert-message.email-already-sent'),
              isClosable: true,
              duration: 6000,
            });
          } else {
            createToast({
              position: 'top',
              status: 'success',
              title: t('signup:alert-message.email-sent-to', { email: data?.email }),
              isClosable: true,
              duration: 6000,
            });
          }
        }}
        handlerText={t('signup:resend')}
        forceHandlerAndClose
        onClose={() => {
          setVerifyEmailProps({
            ...verifyEmailProps,
            state: false,
          });
        }}
      />

      <ModalInfo
        isOpen={alreadyEnrolled}
        forceHandler
        disableCloseButton
        title={t('already-adquired-plan-title')}
        isReadonly
        description={t('already-adquired-plan-description')}
        closeButtonVariant="outline"
        disableInput
        handlerText={t('subscriptions')}
        actionHandler={() => {
          if (window !== undefined) {
            toggleIfEnrolled(false);
            router.push('/profile/subscriptions');
          }
        }}
      />

      <Flex
        display="flex"
        flexDirection={{
          base: 'column-reverse',
          md: 'row',
        }}
        minHeight={{ base: '320px', md: '85vh' }}
        maxWidth="1640px"
        margin="0 auto"
      >
        <Flex
          display="flex"
          flexDirection="column"
          gridGap="20px"
          background={backgroundColor}
          padding={{ base: '2rem 20px', md: '2rem 0 0 0' }}
          flex={{ base: '1', md: '0.5' }}
          style={{ flexShrink: 0, flexGrow: 1 }}
          maxWidth={{ base: '100%', md: '50%' }}
          overflow="auto"
        >
          {/* Stepper */}
          <Stepper
            stepIndex={stepIndex}
            isFreeTier={Boolean(checkingData?.isTrial || checkingData?.isTotallyFree || selectedPlan?.isFreeTier)}
          />
          {isFirstStep && (
            <ContactInformation
              courseChoosed={course}
              setVerifyEmailProps={setVerifyEmailProps}
            />
          )}

          {isSecondStep && (
            <PaymentInfo setShowPaymentDetails={setShowPaymentDetails} />
          )}

          {isThirdStep && (
            <Summary />
          )}
        </Flex>
        <Flex
          flexDirection="column"
          alignItems="center"
          padding={{ base: '0 auto', md: '0 3rem' }}
          position="relative"
          flex={{ base: '1', md: '0.5' }}
          style={{ flexShrink: 0, flexGrow: 1 }}
          overflow="auto"
          overflowX="hidden"
          maxWidth={{ base: '100%', md: '50%' }}
        >
          {checkInfoLoader
            ? <LoaderScreen background={backgroundColor3} />
            : (
              <Flex display={{ base: isPaymentSuccess ? 'none' : 'flex', md: 'flex' }} flexDirection="column" width={{ base: 'auto', md: '100%' }} maxWidth="490px" margin={{ base: '2rem 10px 2rem 10px', md: isThirdStep ? '4rem 0' : '6.2rem 0' }} height="100%" zIndex={10}>
                {originalPlan?.title ? (
                  <Flex alignItems="start" flexDirection="column" gridGap="10px" padding="16px" borderRadius="22px" background={isThirdStep ? 'transparent' : backgroundColor}>
                    <Text size="18px">
                      {t('you-are-getting')}
                    </Text>
                    <Flex gridGap="7px" width="full">
                      <Flex flexDirection="column" gridGap="7px" justifyContent="center" width="100%" ref={flexRef}>
                        <Heading fontSize={isThirdStep ? '38px' : '24px'} display="flex" alignItems="center" gap="10px">
                          {!isThirdStep && <Icon icon="4Geeks-avatar" width="35px" height="35px" maxHeight="35px" borderRadius="50%" background="blue.default" />}
                          {originalPlan?.title.split(' ').map((word) => {
                            const firstLetter = word.match(/[a-zA-Z]/);
                            if (!firstLetter) return word;
                            const { index } = firstLetter;
                            return word.slice(0, index) + word.charAt(index).toUpperCase() + word.slice(index + 1);
                          }).join(' ')}
                        </Heading>
                        {selectedPlan?.description && isThirdStep && (
                          <Text fontSize="16px" py="10px">{selectedPlan.description}</Text>
                        )}
                        <Flex justifyContent="space-between" width="full" alignItems="center">
                          {showPaymentDetails && renderPlanDetails() && (
                            <Text size="16px" color="green.400">
                              {renderPlanDetails()}
                            </Text>
                          )}
                          {!planId && selectedPlan?.type !== 'FREE' && (originalPlan?.financingOptions.length > 0 || originalPlan?.hasSubscriptionMethod) && showPaymentDetails && (
                            <Flex flexDirection="column" gap="4px">
                              <Heading as="h3" size="sm" width="100%" position="relative">
                                <Menu>
                                  <MenuButton
                                    as={Button}
                                    background={useColorModeValue('#eefaf8', 'blue.400')}
                                    _hover={{ backgroundColor: useColorModeValue('blue.50', 'blue.1000') }}
                                    _active="none"
                                    padding="8px"
                                    borderRadius="md"
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    onClick={() => setIsOpenned(true)}
                                  >
                                    <Box as="span" display="flex" alignItems="center" flex="1" fontSize="16px" textAlign="left">
                                      <Text size="md" color={useColorModeValue('blue.1000', '#eefaf8')}>{t('see-financing-opt')}</Text>
                                      <Icon icon="arrowDown" color={useColorModeValue('', '#eefaf8')} />
                                    </Box>
                                  </MenuButton>
                                  <MenuList
                                    boxShadow="lg"
                                    borderRadius="lg"
                                    zIndex="10"
                                    padding="0"
                                    width={menuWidth}
                                    border="none"
                                  >
                                    {originalPlan.plans.map((option) => (
                                      <MenuItem
                                        key={option.plan_id}
                                        onClick={() => setUserSelectedPlan(option)}
                                        fontSize="md"
                                        color="auto"
                                        background={option.plan_id === selectedPlan?.plan_id && useColorModeValue('green.50', 'green.200')}
                                        _hover={option.plan_id === selectedPlan?.plan_id ? { backgrorund: useColorModeValue('green.50', 'green.200') } : { background: 'none' }}
                                        padding="10px"
                                      >
                                        <Flex justifyContent="space-between" alignItems="center" width="100%">
                                          <Text fontSize="md" flex="1" color={option.plan_id === selectedPlan?.plan_id ? useColorModeValue('#25BF6C', 'green') : 'auto'}>
                                            {originalPlan.hasSubscriptionMethod
                                              ? getPlanPriceText(option, allCoupons, originalPlan, t)
                                              : `${handlePriceTextWithCoupon(option.priceText, allCoupons, originalPlan.plans)} / ${option.title}`}
                                          </Text>
                                          {option.plan_id === selectedPlan?.plan_id
                                            && (
                                              <Icon icon="checked2" width="12px" height="12" color={useColorModeValue('#25BF6C', 'green')} />
                                            )}
                                        </Flex>
                                      </MenuItem>
                                    ))}
                                  </MenuList>
                                </Menu>
                              </Heading>
                            </Flex>
                          )}
                        </Flex>

                      </Flex>
                    </Flex>
                    <Divider borderBottomWidth="2px" />
                    <Flex flexDirection="column" gridGap="4px" width="100%" mt={!prerequisites.length > 0 && '1rem'}>
                      {prerequisites.length > 0 && (
                        <Button
                          size="xs"
                          variant="inline"
                          onClick={() => { setCurrentPrereqIndex(0); setPrereqModalOpen(true); }}
                          leftIcon={<Icon icon="warning" width="13px" height="13px" marginBottom="2px" />}
                          alignSelf="flex-start"
                          fontSize="13px"
                          fontWeight="400"
                          padding="0"
                          color="yellow.500"
                        >
                          {t('signup:view-course-warning', { courseName: courseTitle || '' })}
                        </Button>
                      )}
                      {originalPlan?.accordionList?.length > 0 && (
                        <AcordionList
                          list={originalPlan?.accordionList}
                          leftIcon="checked2"
                          iconColor={hexColor.blueDefault}
                          border="none"
                          containerStyles={{ _hover: 'none' }}
                        />
                      )}
                      {liveClassCohorts?.length > 0 && (
                        <LiveClassesBanner
                          cohorts={liveClassCohorts}
                          serviceItem={liveClassServiceItem}
                          isSelected={isLiveClassSelected}
                          onToggle={toggleLiveClassSelection}
                          locale={lang}
                          copy={liveClassesCopy}
                        />
                      )}
                    </Flex>
                    {isSecondStep && (
                      <>
                        <Flex justifyContent="space-between" width="100%" padding="3rem 0px 0">
                          <Text size="18px" color="currentColor" lineHeight="normal">
                            Subtotal:
                          </Text>
                          <Text size="18px" color="currentColor" lineHeight="normal">
                            {formattedBaseSubtotal}
                          </Text>
                        </Flex>
                        {formattedAddonSubtotal && (
                          <Flex justifyContent="space-between" width="100%" marginTop="8px">
                            <Text size="sm" color="gray.500">
                              {liveClassesCopy?.summaryLabel}
                            </Text>
                            <Text size="sm" color="gray.500">
                              {formattedAddonSubtotal}
                            </Text>
                          </Flex>
                        )}
                        <Divider margin="6px 0" />
                        {showPaymentDetails && (
                          <Formik
                            initialValues={{ coupons: couponValue || '' }}
                            onSubmit={(_, actions) => {
                              setCouponError(false);
                              handleCoupon(discountCode, actions);
                            }}
                          >
                            {({ isSubmitting }) => (
                              <Form style={{ display: isPaymentSuccess ? 'none' : 'block', width: '100%' }}>
                                <Flex gridGap="15px" width="100%">
                                  <InputGroup size="md">
                                    <Input
                                      value={discountCode}
                                      borderColor={couponError ? 'red.light' : 'inherit'}
                                      disabled={discountCoupon?.slug || isPaymentSuccess}
                                      width="100%"
                                      _disabled={{
                                        borderColor: discountCoupon?.slug ? 'success' : 'inherit',
                                        opacity: 1,
                                      }}
                                      letterSpacing="0.05em"
                                      placeholder="Discount code"
                                      onChange={(e) => {
                                        const { value } = e.target;
                                        const couponInputValue = value.replace(/[^a-zA-Z0-9-\s]/g, '');
                                        setDiscountCode(couponInputValue.replace(/\s/g, '-'));
                                        if (value === '') {
                                          setDiscountCoupon(null);
                                          setCouponError(false);
                                        }
                                      }}
                                    />
                                    {discountCoupon?.slug && (
                                      <InputRightElement width="35px">
                                        <Button
                                          variant="unstyled"
                                          aria-label="Remove coupon"
                                          minWidth="auto"
                                          padding="10px"
                                          height="auto"
                                          onClick={() => {
                                            setDiscountCode('');
                                            removeSessionStorageItem('coupon');
                                            setDiscountCoupon(null);
                                            removeManualCoupons();
                                          }}
                                        >
                                          <Icon icon="close" color="currentColor" width="10px" height="10px" />
                                        </Button>
                                      </InputRightElement>
                                    )}
                                  </InputGroup>
                                  {!discountCoupon?.slug && !isPaymentSuccess && (
                                    <Button
                                      width="auto"
                                      type="submit"
                                      isLoading={isSubmitting}
                                      height="auto"
                                      variant="outline"
                                      fontSize="17px"
                                    >
                                      {`+ ${t('add')}`}
                                    </Button>
                                  )}
                                </Flex>
                              </Form>
                            )}
                          </Formik>
                        )}
                        {couponError && (
                          <Text
                            paddingStart="3px"
                            size="sm"
                            color="red"
                            dangerouslySetInnerHTML={{
                              __html: t('coupon-not-valid', {
                                plan: originalPlan?.title.split(' ').map((word) => {
                                  const firstLetter = word.match(/[a-zA-Z]/);
                                  if (!firstLetter) return word;
                                  const { index } = firstLetter;
                                  return word.slice(0, index) + word.charAt(index).toUpperCase() + word.slice(index + 1);
                                }).join(' '),
                              }),
                            }}
                          />
                        )}

                        {allCoupons?.length > 0
                          && allCoupons.map((coup) => (
                            <Flex direction="row" justifyContent="space-between" w="100%" marginTop="10px">
                              <Text size="lg">{coup?.slug}</Text>
                              <Box borderRadius="4px" padding="5px" background={getDiscountValue(coup) ? hexColor.greenLight2 : ''}>
                                <Text color={hexColor.green} fontWeight="700">
                                  {getDiscountValue(coup)}
                                </Text>
                              </Box>
                            </Flex>
                          ))}

                        <Divider margin="6px 0" />
                        <Flex justifyContent="space-between" width="100%">
                          <Text size="18px" color="currentColor" lineHeight="normal">
                            {selectedPlan?.period !== 'ONE_TIME' ? t('total-now') : t('total')}
                          </Text>
                          <Flex gridGap="1rem">
                            {allCoupons?.length > 0 && originalTotalAmount && (
                              <Text size="18px" color="currentColor" textDecoration="line-through" opacity="0.5" lineHeight="normal">
                                {originalTotalAmount}
                              </Text>
                            )}
                            <Text size="18px" color="currentColor" lineHeight="normal">
                              {totalNowAmount}
                            </Text>
                          </Flex>
                        </Flex>
                        {selectedPlan?.period !== 'ONE_TIME' && selectedPlan?.price > 0 && (
                          <Flex justifyContent="space-between" width="100%">
                            <Text size="18px" color="currentColor" lineHeight="normal">
                              {t('after-all-payments')}
                            </Text>
                            <Text size="18px" color="currentColor" lineHeight="normal">
                              {selectedPlan.price <= 0
                                ? selectedPlan.priceText
                                : `${currencySymbol}${calculateTotalPrice()} ${selectedPlan.currency?.code}`}
                            </Text>
                          </Flex>
                        )}
                        {fixedCouponExist && (
                          <Text fontWeight="300" size="xs" marginTop="10px">
                            {t('fixed-price-disclaimer')}
                          </Text>
                        )}
                      </>
                    )}
                  </Flex>
                ) : (
                  <Skeleton height="350px" width="490px" borderRadius="11px" zIndex={10} opacity={1} />
                )}
              </Flex>
            )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Checkout;
