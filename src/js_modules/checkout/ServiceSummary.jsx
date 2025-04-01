/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Link, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import bc from '../../common/services/breathecode';
import useSignup from '../../common/store/actions/signupAction';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';
import useAuth from '../../common/hooks/useAuth';
import Text from '../../common/components/Text';
import AcordionList from '../../common/components/AcordionList';
import NextChakraLink from '../../common/components/NextChakraLink';
import LoaderScreen from '../../common/components/LoaderScreen';
import { formatPrice, getStorageItem, getBrowserInfo } from '../../utils';
import ModalInfo from '../../common/components/ModalInfo';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import CardForm from './CardForm';
import { SILENT_CODE } from '../../lib/types';
import { reportDatalayer } from '../../utils/requests';
import { BREATHECODE_HOST } from '../../utils/variables';

function ServiceSummary({ service }) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('signup');
  const {
    state, setSelectedService, setIsSubmittingCard, setIsSubmittingPayment, getPaymentMethods, setPaymentStatus,
  } = useSignup();
  const { selectedService, paymentMethods, paymentStatus, loader } = state;
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const { state: cohortState } = useCohortHandler();
  const { cohortSession } = cohortState;
  const { backgroundColor, lightColor, hexColor, backgroundColor3 } = useStyle();
  const [openDeclinedModal, setOpenDeclinedModal] = useState(false);
  const [declinedModalProps, setDeclinedModalProps] = useState({
    title: '',
    description: '',
  });

  const redirectedFrom = getStorageItem('redirected-from');
  const isPaymentSuccess = paymentStatus === 'success';

  const dataToAssign = {
    service: service?.service?.slug,
    academy: service?.academy?.id,
    how_many: selectedService?.qty,
    mentorship_service_set: service.serviceInfo.type === 'mentorship' ? service.serviceInfo.id : undefined,
    event_type_set: service.serviceInfo.type === 'event' ? service.serviceInfo.id : undefined,
  };

  const handlePayConsumable = () => {
    bc.payment().service().payConsumable(dataToAssign)
      .then((res) => {
        if (res && res?.status < 400) {
          reportDatalayer({
            dataLayer: {
              event: 'purchase',
              ecommerce: {
              // transaction_id: '12345',
                affiliation: '4Geeks',
                value: selectedService.priceDiscounted,
                currency: 'USD',
                items: [{
                  item_name: selectedService.title,
                  item_id: selectedService?.id,
                  price: selectedService.priceDiscounted,
                  item_brand: '4Geeks',
                  item_category: service.serviceInfo.type,
                  quantity: 1,
                }],
              },
              agent: getBrowserInfo(),
            } });
          setPaymentStatus('success');
          setConfirmationOpen(false);
        }
      })
      .catch(() => {});
  };

  const handlePaymentErrors = (data, actions = {}, callback = () => {}) => {
    const silentCode = data?.silent_code;
    setIsSubmittingPayment(false);
    actions?.setSubmitting(false);
    callback();
    if (silentCode === SILENT_CODE.CARD_ERROR) {
      setOpenDeclinedModal(true);
      setDeclinedModalProps({
        title: t('transaction-denied'),
        description: t('card-declined'),
      });
    }
    if (SILENT_CODE.LIST_PROCESSING_ERRORS.includes(silentCode)) {
      setOpenDeclinedModal(true);
      setDeclinedModalProps({
        title: t('transaction-denied'),
        description: t('payment-not-processed'),
      });
    }
    if (silentCode === SILENT_CODE.UNEXPECTED_EXCEPTION) {
      setOpenDeclinedModal(true);
      setDeclinedModalProps({
        title: t('transaction-denied'),
        description: t('payment-error'),
      });
    }
  };

  const handleSubmit = async (_, values) => {
    if (selectedService?.id) {
      reportDatalayer({
        dataLayer: {
          event: 'select_item',
          item_list_name: service.serviceInfo.slug,
          ecommerce: {
            currency: 'USD',
            items: [{
              item_name: selectedService.title,
              item_id: selectedService?.id,
              price: selectedService.priceDiscounted,
              item_brand: '4Geeks',
              item_category: service.serviceInfo.type,
              quantity: selectedService?.qty,
            }],
          },
          agent: getBrowserInfo(),
        },
      });
    }
    const resp = await bc.payment().addCard(values);
    const data = await resp.json();
    setIsSubmittingCard(false);
    if (resp.ok) {
      reportDatalayer({
        dataLayer: {
          event: 'add_payment_info',
          item_list_name: service.serviceInfo.slug,
          ecommerce: {
            currency: 'USD',
            payment_type: 'Credit Card',
            items: [
              {
                item_id: selectedService?.id,
                item_name: selectedService?.title,
                item_brand: '4Geeks',
                item_category: service.serviceInfo.type,
                price: selectedService?.priceDiscounted,
                quantity: selectedService?.qty,
              },
            ],
          },
          agent: getBrowserInfo(),
        } });
      setConfirmationOpen(true);
    } else {
      setOpenDeclinedModal(true);
      handlePaymentErrors(data, _);
    }
  };

  const handleSelectService = (item) => {
    setSelectedService(item);
  };

  useEffect(() => {
    if (service?.academy) getPaymentMethods(service.academy.id);
  }, [isAuthenticated]);

  useEffect(() => {
    if (service?.list?.length === 1) {
      handleSelectService(service.list[0]);
    }
    if (service?.list?.length > 0) {
      reportDatalayer({
        dataLayer: {
          event: 'view_item_list',
          item_list_name: service.serviceInfo.slug,
          ecommerce: {
            currency: 'USD',
            items: service?.list.map((item) => ({
              item_name: item?.title,
              item_id: item?.id,
              price: item?.priceDiscounted,
              item_brand: '4Geeks',
              item_category: service?.serviceInfo?.type,
              quantity: item?.qty,
            })),
          },
          agent: getBrowserInfo(),
        } });
    }
  }, [service]);

  const onSubmitCard = (values, actions, stateCard) => {
    setIsSubmittingPayment(true);
    setIsSubmittingCard(true);
    const monthAndYear = values.exp?.split('/');
    const expMonth = monthAndYear[0];
    const expYear = monthAndYear[1];

    const allValues = {
      card_number: stateCard.card_number,
      exp_month: expMonth,
      exp_year: expYear,
      cvc: values.cvc,
    };
    handleSubmit(actions, allValues);
  };

  return (
    <Box mb="1rem">

      {isPaymentSuccess ? (
        <Box display="flex" justifyContent="center" flexDirection="column" gridGap="24px">
          <Box display="flex" flexDirection="column" gridGap="12px" alignItems="center" padding="14px 23px" background={backgroundColor} borderRadius="15px">
            <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-8.png`} border="3px solid #25BF6C" width="91px" height="91px" borderRadius="50px" />
            <Box fontSize="26px" fontWeight={700} width={{ base: 'auto', md: '75%' }} textAlign="center">
              {t('consumables.purchase-completed-title')}
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" gridGap="10px" padding="14px 10%" background={backgroundColor} borderRadius="15px">
            <Box display="flex" flexDirection="column" gridGap="12px">
              <Box color="yellow.default" fontSize="16px" textTransform="uppercase" fontWeight={900}>
                {t('consumables.you-have-received')}
              </Box>
              <Box display="flex" alignItems="center" gridGap="12px">
                <Box>
                  <Box background="yellow.default" minWidth="50px" borderRadius="50px" width="fit-content" padding="10px">
                    <Icon icon="idea" width="40px" height="40px" />
                  </Box>
                </Box>
                <Box fontSize="21px" fontWeight={700}>
                  {t(`${service.serviceInfo.type}-bundle-title`)}
                </Box>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="center" gridGap="0px" fontWeight={700} lineHeight="32px" background="blue.default" alignItems="center" padding="10px 15px" borderRadius="11px" color="white">
              <Box fontSize="38px">{selectedService?.qty}</Box>
              <Box fontSize="28px">
                {service.serviceInfo.type === 'mentorship' ? 'sessions' : 'events'}
              </Box>
            </Box>
          </Box>
          <Box display="flex" gridGap="12px" margin="2rem auto 0 auto" alignItems="center">
            <Link variant="default" onClick={() => localStorage.removeItem('redirected-from')} href={redirectedFrom || cohortSession?.selectedProgramSlug || ''}>
              {t('common:go-back')}
            </Link>
            <Icon icon="longArrowRight" width="24px" height="10px" color={hexColor.blueDefault} />
          </Box>
        </Box>
      ) : (
        <>
          <Box display="flex" flexDirection="column" gridGap="3rem" background={backgroundColor} p={{ base: '20px 22px', md: '14px 23px' }} borderRadius="15px">
            <Box
              display="flex"
              flexDirection="column"
              w="100%"
              height="fit-content"
              p="11px 14px"
              gridGap="8px"
              borderRadius="14px"
            >
              <Heading size="16px" fontWeight={900} color="yellow.default" textTransform="uppercase">
                {t('getting-for')}
              </Heading>
              <Box display="flex" gridGap="12px" alignItems="center">
                <Box display="flex" flexDirection="column">
                  <Box
                    background="yellow.default"
                    borderRadius="50px"
                    width="fit-content"
                    padding="10px"
                  >
                    <Icon icon="idea" width="40px" height="40px" color="#fff" />
                  </Box>
                </Box>
                <Box display="flex" width="100%" flexDirection="column" gridGap="7px">
                  <Heading size="21px" width="70%">
                    {t(`${service.serviceInfo.type}-bundle-title`)}
                  </Heading>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection={{ base: 'column', md: 'row' }}
            gridGap="30px"
            justifyContent="center"
          >
            <Box display="flex" flexDirection="column" flex={0.5} gridGap="24px">
              {service?.list?.length > 0 && (
                <Box display="flex" flexDirection="column" gridGap="10px" padding="14px 23px" background={backgroundColor} borderRadius="15px">
                  <Box height="40px" display="flex" flexDirection={{ base: 'column', sm: 'row' }} margin={{ base: '0 0 30px 0', sm: '0' }} justifyContent="space-between" alignItems="center">
                    <Heading as="span" size="xsm">
                      {t('consumables.select-bundle')}
                    </Heading>
                    {selectedService?.id && service.list.length > 1 && (
                      <Button fontSize="14px" variant="link" onClick={() => handleSelectService({})}>
                        {t('consumables.change-my-selection')}
                      </Button>
                    )}
                  </Box>
                  {!selectedService?.id
                    ? service.list.map((item) => {
                      const isSelected = item?.id === selectedService?.id;
                      return (
                        <Box
                          key={`${item?.slug}-${item?.title}`}
                          display="flex"
                          onClick={() => {
                            handleSelectService(item);
                          }}
                          flexDirection="row"
                          width="100%"
                          justifyContent="space-between"
                          p={{ base: '14px', sm: '22px 18px' }}
                          gridGap={{ base: '12px', md: '20px' }}
                          cursor="pointer"
                          border={isSelected ? '2px solid #0097CD' : `2px solid ${hexColor.featuredColor}`}
                          borderRadius="13px"
                          alignItems="center"
                        >
                          <Box
                            display="flex"
                            flexDirection="column"
                            gridGap={{ base: '0', md: '4px' }}
                            // minWidth={{ base: 'auto', md: '228px' }}
                            height="fit-content"
                            fontWeight="400"
                          >
                            <Box fontSize={{ base: '16px', md: '18px' }} fontWeight="700">
                              {service.serviceInfo.type === 'mentorship'
                                ? t('consumables.qty-mentorship-sessions', { qty: item.qty })
                                : t('consumables.qty-events-to-consume', { qty: item.qty })}
                            </Box>
                            <Text fontSize="14px" color={isSelected ? 'blue.default' : lightColor} fontWeight={isSelected ? 700 : 400}>
                              {service.serviceInfo.type === 'mentorship'
                                ? t('consumables.price-mentorship-per-qty', { price: formatPrice(item.pricePerUnit, true) })
                                : t('consumables.price-event-per-qty', { price: formatPrice(item.pricePerUnit, true) })}
                            </Text>
                          </Box>
                          <Box position="relative" display="flex" alignItems="center" height="fit-content" gridGap="10px">
                            <Heading
                              as="span"
                              size={{ base: '20px', md: '30px' }}
                              lineHeight="1"
                              color="blue.default"
                              width="auto"
                              textAlign="end"
                            >
                              {item?.priceText}
                            </Heading>
                            {item?.price !== item?.priceDiscounted && (
                              <Heading
                                as="span"
                                position="absolute"
                                bottom="-18px"
                                right="0px"
                                size="16px"
                                lineHeight="1"
                                color="#999"
                                textDecorationLine="line-through"
                                // text-decoration-line
                                width="auto"
                                textAlign="end"
                              >
                                {`${formatPrice(item?.price, true)}`}
                              </Heading>
                            )}
                          </Box>
                        </Box>
                      );
                    }) : (
                      <Box
                        display="flex"
                        flexDirection="row"
                        width="100%"
                        justifyContent="space-between"
                        // p={selectedIndex === i ? '22px 18px' : '26px 22px'}
                        p={{ base: '14px', sm: '22px 18px' }}
                        gridGap={{ base: '12px', md: '20px' }}
                        cursor="pointer"
                        // background={selectedIndex !== i && featuredColor}
                        border="2px solid #0097CD"
                        alignItems="center"
                        borderRadius="13px"
                      >
                        <Box
                          display="flex"
                          flexDirection="column"
                          gridGap={{ base: '0', md: '4px' }}
                          // minWidth={{ base: 'auto', md: '228px' }}
                          height="fit-content"
                          fontWeight="400"
                        >
                          <Box fontSize="18px" fontWeight="700">
                            {selectedService?.title}
                          </Box>
                          <Text fontSize="14px" color="blue.default" fontWeight={700}>
                            {service.serviceInfo.type === 'mentorship'
                              ? t('consumables.price-mentorship-per-qty', { price: formatPrice(selectedService.pricePerUnit, true) })
                              : t('consumables.price-event-per-qty', { price: formatPrice(selectedService.pricePerUnit, true) })}
                          </Text>
                        </Box>
                        <Box position="relative" display="flex" height="fit-content" alignItems="center" gridGap="10px">
                          <Heading
                            as="span"
                            size={{ base: '20px', md: '30px' }}
                            lineHeight="1"
                            color="blue.default"
                            width="auto"
                            textAlign="end"
                          >
                            {selectedService?.priceText}
                          </Heading>
                          {selectedService?.priceDiscounted !== selectedService?.price && (
                            <Heading
                              as="span"
                              position="absolute"
                              bottom="-18px"
                              right="0px"
                              size="16px"
                              lineHeight="1"
                              color="#999"
                              textDecorationLine="line-through"
                              width="auto"
                              textAlign="end"
                            >
                              {`${formatPrice(selectedService?.price, true)}`}
                            </Heading>
                          )}
                        </Box>
                      </Box>
                    )}
                </Box>
              )}
            </Box>
            <Box display="flex" flexDirection="column" flex={0.5}>
              {loader.paymentMethods ? (
                <LoaderScreen />
              ) : (
                <Box background={backgroundColor} p={{ base: '22px', md: '14px 23px' }} borderRadius="15px">
                  <Heading size="xsm">
                    {t('payment-methods')}
                  </Heading>
                  <Flex flexDirection="column" gridGap="4px" width="100%" mt="1rem">
                    <AcordionList
                      width="100%"
                      list={paymentMethods.map((method) => {
                        if (!method.is_credit_card) {
                          return {
                            ...method,
                            onClick: (e) => {
                              setTimeout(() => {
                                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 100);
                            },
                            description: (
                              <Box padding="0 17px">
                                <Text
                                  size="md"
                                  className="method-description"
                                  sx={{
                                    a: {
                                      color: hexColor.blueDefault,
                                    },
                                    'a:hover': {
                                      opacity: 0.7,
                                    },
                                  }}
                                  dangerouslySetInnerHTML={{ __html: method.description }}
                                />
                                {method.third_party_link && (
                                  <Text mt="10px" color={hexColor.blueDefault}>
                                    <NextChakraLink target="_blank" href={method.third_party_link}>
                                      {t('click-here')}
                                    </NextChakraLink>
                                  </Text>
                                )}
                              </Box>
                            ),
                          };
                        }
                        return {
                          ...method,
                          description: (
                            <CardForm
                              modalCardErrorProps={{
                                disableTryAgain: true,
                                openDeclinedModal,
                                setOpenDeclinedModal,
                                declinedModalProps,
                              }}
                              onSubmit={onSubmitCard}
                            />
                          ),
                        };
                      })}
                      paddingButton="10px 17px"
                      unstyled
                      gridGap="0"
                      containerStyles={{
                        gridGap: '8px',
                        allowToggle: true,
                      }}
                      descriptionStyle={{ padding: '10px 0 0 0' }}
                    />
                  </Flex>
                </Box>
              )}
            </Box>
            <ModalInfo
              isOpen={confirmationOpen}
              headerStyles={{
                fontSize: '16px',
                textAlign: 'center',
                fontWeight: 900,
                textTransform: 'uppercase',
              }}
              maxWidth="lg"
              // footerStyle={{ flexDirection: 'row-reverse' }}
              title={t('consumables.confirm-purchase')}
              childrenDescription={(
                <Box display="flex" flexDirection="column" gridGap="24px">
                  <Box margin="16px auto 0 auto" fontSize="18px" fontWeight={700}>
                    {t('consumables.confirm-purchase-connector')}
                  </Box>

                  <Box display="flex" justifyContent="space-between" gridGap="10px">
                    <Box display="flex" gridGap="12px">
                      <Box>
                        <Box background="yellow.default" minWidth="50px" borderRadius="50px" width="fit-content" padding="10px">
                          <Icon icon="idea" width="40px" height="40px" />
                        </Box>
                      </Box>
                      <Box size="xsm" fontWeight={700}>
                        {t(`${service.serviceInfo.type}-bundle-title`)}
                      </Box>
                    </Box>
                    <Box display="flex" flexDirection="column" borderRadius="11px" gridGap="0px" fontWeight={700} lineHeight="32px" background={backgroundColor3} alignItems="center" padding="10px 15px">
                      <Box fontSize="38px">{selectedService?.qty}</Box>
                      <Box fontSize="28px">
                        {service.serviceInfo.type === 'mentorship' ? t('consumables.sessions') : t('consumables.events')}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
              buttonHandlerStyles={{ variant: 'default' }}
              handlerText={t('common:confirm')}
              actionHandler={() => handlePayConsumable()}
              onClose={() => {
                setIsSubmittingPayment(false);
                setConfirmationOpen(false);
              }}
              closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
              closeButtonVariant="outline"
            />
          </Box>
        </>
      )}
    </Box>
  );
}

ServiceSummary.propTypes = {
  service: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
ServiceSummary.defaultProps = {
  service: {},
};
export default ServiceSummary;
