/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Link } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import bc from '../../common/services/breathecode';
import useSignup from '../../common/store/actions/signupAction';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';
import Text from '../../common/components/Text';
import FieldForm from '../../common/components/Forms/FieldForm';
import { formatPrice, getStorageItem } from '../../utils';
import ModalInfo from '../moduleMap/modalInfo';
import { usePersistent } from '../../common/hooks/usePersistent';
import modifyEnv from '../../../modifyEnv';
import ModalCardError from './ModalCardError';
import { SILENT_CODE } from '../../lib/types';
import { reportDatalayer } from '../../utils/requests';

function ServiceSummary({ service }) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { t } = useTranslation('signup');
  const {
    state, setSelectedService, setPaymentInfo,
  } = useSignup();
  const { selectedService, paymentInfo } = state;
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);
  const [cohortSession] = usePersistent('cohortSession', {});
  const { backgroundColor, lightColor, hexColor, backgroundColor3 } = useStyle();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [openDeclinedModal, setOpenDeclinedModal] = useState(false);
  const [declinedModalProps, setDeclinedModalProps] = useState({
    title: '',
    description: '',
  });
  const [stateCard, setStateCard] = useState({
    card_number: 0,
    exp_month: 0,
    exp_year: 0,
    cvc: 0,
  });
  const redirectedFrom = getStorageItem('redirected-from');

  const infoValidation = Yup.object().shape({
    owner_name: Yup.string()
      .min(6, t('validators.owner_name-min'))
      .required(t('validators.owner_name-required')),
    card_number: Yup.string()
      .min(16)
      .max(20)
      .required(t('validators.card_number-required')),
    exp: Yup.string()
      .min(5, t('validators.exp-min'))
      .required(t('validators.exp-required')),
    cvc: Yup.string()
      .min(3)
      .max(4)
      .required(t('validators.cvc-required')),
  });

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
            event: 'purchase',
            ecommerce: {
              currencyCode: 'USD',
              detail: {
                actionField: {
                  slug: service.service.slug,
                },
                products: [{
                  name: selectedService.title,
                  id: selectedService?.id,
                  price: selectedService.priceDiscounted,
                  brand: '4Geeks',
                  category: service.serviceInfo.type,
                  quantity: 1,
                }],
              },
            },
          });
          setPurchaseCompleted(true);
          setConfirmationOpen(false);
        }
      })
      .catch(() => {});
  };

  const handlePaymentErrors = (data, actions = {}, callback = () => {}) => {
    const silentCode = data?.silent_code;
    setIsSubmitting(false);
    actions?.setSubmitting(false);
    callback();
    // reportDatalayer({
    //   event: 'error',
    //   eventCategory: 'payment',
    //   eventAction: 'error',
    //   eventLabel: silentCode,
    // });
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
    reportDatalayer({
      event: 'checkout',
      ecommerce: {
        currencyCode: 'USD',
        detail: {
          actionField: {
            step: 2,
            option: 'Credit card',
          },
          products: [{
            name: selectedService.title,
            id: selectedService?.id,
            price: selectedService.priceDiscounted,
            brand: '4Geeks',
            category: service.serviceInfo.type,
            quantity: 1,
          }],
        },
      },
    });
    const resp = await bc.payment().addCard(values);
    const data = await resp.json();
    setIsSubmittingCard(false);
    if (resp.ok) {
      setConfirmationOpen(true);
    } else {
      setOpenDeclinedModal(true);
      handlePaymentErrors(data, _);
    }
  };

  const handleSelectService = (item) => {
    if (item?.id) {
      reportDatalayer({
        event: 'checkout',
        ecommerce: {
          currencyCode: 'USD',
          detail: {
            actionField: {
              step: 1,
              option: 'Select service',
            },
            products: [{
              name: item.title,
              id: item?.id,
              price: item.priceDiscounted,
              brand: '4Geeks',
              category: service.serviceInfo.type,
              quantity: 1,
            }],
          },
        },
      });
    }
    setSelectedService(item);
  };

  useEffect(() => {
    if (service?.list?.length === 1) {
      handleSelectService(service.list[0]);
    }
  }, [service]);

  return (
    <Box
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      gridGap="30px"
      justifyContent="center"
      mb="1rem"
    >
      <ModalCardError
        disableTryAgain
        isSubmitting={isSubmittingCard}
        openDeclinedModal={openDeclinedModal}
        setOpenDeclinedModal={setOpenDeclinedModal}
        declinedModalProps={declinedModalProps}
      />

      {purchaseCompleted
        ? (
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
        )
        : (
          <>
            <Box display="flex" flexDirection="column" flex={0.5} gridGap="24px">
              <Box display="flex" flexDirection="column" gridGap="3rem" background={backgroundColor} p={{ base: '20px 22px', md: '14px 23px' }} height="100%" borderRadius="15px">
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
              {service?.list?.length > 0 && (
                <Box display="flex" flexDirection="column" gridGap="10px" padding="14px 23px" background={backgroundColor} borderRadius="15px">
                  <Box height="40px" display="flex" flexDirection={{ base: 'column', sm: 'row' }} margin={{ base: '0 0 30px 0', sm: '0' }} justifyContent="space-between" alignItems="center">
                    <Heading as="span" size="21px">
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
              <Box background={backgroundColor} p={{ base: '22px', md: '14px 23px' }} borderRadius="15px">
                <Heading
                  size="xsm"
                  p="0 0 12px 0"
                >
                  {t('select-payment-plan')}
                </Heading>
                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Formik
                    initialValues={{
                      owner_name: '',
                      card_number: '',
                      exp: '',
                      cvc: '',
                    }}
                    onSubmit={(values, actions) => {
                      setIsSubmitting(true);
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
                    }}
                    validationSchema={infoValidation}
                  >
                    {() => (
                      <Form
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gridGap: '22px',
                        }}
                      >
                        <Box display="flex" gridGap="18px">
                          <FieldForm
                            type="text"
                            name="owner_name"
                            externValue={paymentInfo.owner_name}
                            handleOnChange={(e) => {
                              setPaymentInfo('owner_name', e.target.value);
                              setStateCard({ ...stateCard, owner_name: e.target.value });
                            }}
                            pattern="[A-Za-z ]*"
                            label={t('owner-name')}
                          />
                        </Box>
                        <Box display="flex" gridGap="18px">
                          <FieldForm
                            type="text"
                            name="card_number"
                            externValue={paymentInfo.card_number}
                            handleOnChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                              const newValue = value.replace(/(.{4})/g, '$1 ').trim();
                              e.target.value = newValue.slice(0, 19);
                              setPaymentInfo('card_number', e.target.value);
                              setStateCard({ ...stateCard, card_number: newValue.replaceAll(' ', '').slice(0, 16) });
                            }}
                            pattern="[0-9]*"
                            label={t('card-number')}
                          />
                        </Box>
                        <Box display="flex" gridGap="18px">
                          <Box display="flex" gridGap="18px" flex={1}>
                            <Box display="flex" flexDirection="column" flex={0.5}>
                              <FieldForm
                                style={{ flex: 0.5 }}
                                type="text"
                                name="exp"
                                externValue={paymentInfo.exp}
                                maxLength={3}
                                handleOnChange={(e) => {
                                  let { value } = e.target;
                                  if ((value.length === 2 && paymentInfo.exp?.length === 1)) {
                                    value += '/';
                                  } else if (value.length === 2 && paymentInfo.exp?.length === 3) {
                                    value = value.slice(0, 1);
                                  }
                                  value = value.substring(0, 5);

                                  setPaymentInfo('exp', value);
                                }}
                                pattern="[0-9]*"
                                label={t('exp')}
                              />
                            </Box>
                            <FieldForm
                              style={{ flex: 0.5 }}
                              type="text"
                              name="cvc"
                              externValue={paymentInfo.cvc}
                              maxLength={3}
                              handleOnChange={(e) => {
                                const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                                const newValue = value.replace(/(.{4})/g, '$1 ').trim();
                                e.target.value = newValue.slice(0, 4);

                                setPaymentInfo('cvc', e.target.value);
                              }}
                              pattern="[0-9]*"
                              label={t('cvc')}
                            />
                          </Box>
                        </Box>

                        <Button
                          type="submit"
                          width="100%"
                          variant="default"
                          isDisabled={!selectedService?.id}
                          isLoading={isSubmitting}
                          height="40px"
                          mt="0"
                        >
                          {t('common:proceed-to-payment')}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Box>
              </Box>
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
                      <Box fontSize="21px" fontWeight={700}>
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
                setIsSubmitting(false);
                setConfirmationOpen(false);
              }}
              closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
              closeButtonVariant="outline"
            />
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
