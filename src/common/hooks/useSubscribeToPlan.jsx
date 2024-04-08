import { useMemo, useState } from 'react';
import { Box, ListItem, UnorderedList, useToast, Button, Image } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import SimpleModal from '../components/SimpleModal';
import useSignup from '../store/actions/signupAction';
import axiosInstance from '../../axios';
import useStyle from './useStyle';
import Heading from '../components/Heading';
import { toCapitalize, unSlugify } from '../../utils';
import Icon from '../components/Icon';
import { generatePlan } from '../handlers/subscriptions';

const useSubscribeToPlan = ({ enableRedirectOnCTA = false, redirectTo = '/choose-program', onClose: onExternalClose = () => {} } = {}) => {
  const { t } = useTranslation(['common']);
  const [planProps, setPlanProps] = useState({});
  const router = useRouter();
  const [isInProcessOfSubscription, setIsInProcessOfSubscription] = useState(false);
  const { handleChecking, handlePayment } = useSignup({ disableRedirectAfterSuccess: true });
  const { modal } = useStyle();
  const toast = useToast();
  const [isCheckingSuccess, setIsCheckingSuccess] = useState(false);

  const handleSubscribeToPlan = ({ slug, accessToken, onSubscribedToPlan = () => {}, disableRedirects = false }) => new Promise((resolve, reject) => {
    setIsInProcessOfSubscription(true);
    if (accessToken) {
      axiosInstance.defaults.headers.common.Authorization = `Token ${accessToken}`;
    }
    generatePlan(slug)
      .then((data) => {
        onSubscribedToPlan(data);
        setPlanProps({
          ...data,
          title: toCapitalize(unSlugify(data?.slug)),
          bullets: data?.featured_info || [],
        });

        handleChecking({ plan: data, token: accessToken })
          .then((respData) => {
            handlePayment({
              ...respData,
              installments: respData?.how_many_months,
            }, disableRedirects)
              .then((respPayment) => {
                resolve(respPayment);
                if (respPayment.status < 400) {
                  setIsCheckingSuccess(true);
                }
              })
              .catch((error) => {
                reject(error);
                console.error('Error handling payment', error);
                toast({
                  position: 'top',
                  title: t('alert-message:payment-error'),
                  status: 'error',
                  duration: 7000,
                  isClosable: true,
                });
              });
          })
          .catch((error) => {
            reject(error);
            console.error('Error handling checking', error);
          });
      }).catch(() => reject());
  });

  const onClose = () => {
    if (enableRedirectOnCTA === true && redirectTo?.length > 0) {
      router.push(redirectTo);
    } else {
      onExternalClose();
      setIsCheckingSuccess(false);
    }
  };

  const successModal = useMemo(() => (
    <SimpleModal
      isOpen={isCheckingSuccess}
      onClose={onClose}
      style={{ marginTop: '10vh', padding: '0px' }}
      maxWidth="45rem"
      bodyStyles={{ padding: '0' }}
      borderRadius="13px"
      forceHandler
    >
      <Box display="flex" gridGap="16px">
        <Box width="100%">
          <Image src="/static/images/vertical-banner.webp" style={{ objectFit: 'cover', borderRadius: '13px 0 0 13px' }} margin="0 auto" alt="Purchase of standard plan completed" />
        </Box>
        <Box display="flex" gridGap="16px" flexDirection="column" justifyContent="center" width="100%" borderRadius="11px" padding="8px 16px" background={modal.featuredBackground}>
          <Heading as="h1" size="xsm" display="flex" flexDirection="column">
            <span>{t('signup:welcome-to')}</span>
            {planProps?.title && (
              <span>
                {planProps.title}
                {' '}
                plan
              </span>
            )}
          </Heading>
          <Box display="flex" flexDirection="column" gridGap="10px">
            <Heading as="h2" size="14px" color="blue.default">
              {t('signup:info.this-plan-includes')}
            </Heading>
            <UnorderedList display="flex" flexDirection="column" gridGap="10px">
              {planProps?.bullets?.map((bullet) => {
                const description = bullet?.features?.[0]?.description;
                const oneLineDesc = bullet?.features?.[0]?.one_line_desc;

                return description && (
                  <ListItem
                    key={oneLineDesc}
                    display="inline-flex"
                    gridGap="13px"
                    alignItems="center"
                    lineHeight="normal"
                    fontSize="14px"
                  >
                    <Icon
                      icon="checked2"
                      color="#38A56A"
                      width="15px"
                      height="11px"
                    />
                    {description}
                  </ListItem>
                );
              })}
            </UnorderedList>
          </Box>
          <Button variant="link" onClick={onClose} width="auto" margin="0 auto" gridGap="6px">
            {t('signup:continue-learning')}
            <Icon icon="longArrowRight" color="currentColor" width="24px" height="10px" />
          </Button>
        </Box>
      </Box>
    </SimpleModal>
  ), [isCheckingSuccess, planProps]);

  return { isCheckingSuccess, isInProcessOfSubscription, setIsInProcessOfSubscription, handleSubscribeToPlan, successModal };
};

export default useSubscribeToPlan;
