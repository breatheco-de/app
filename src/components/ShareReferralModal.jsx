import { useEffect, useState } from 'react';
import { Grid, Box, Text, Button, Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../hooks/useStyle';
import Icon from './Icon';
import CouponInput from './ReferralCouponInput';
import useSocialShare from '../hooks/useSocialShare';
import SimpleModal from './SimpleModal';
import { parseQuerys } from '../utils/url';

function ShareReferralModal({ isOpen, onClose, couponData }) {
  const [checkoutLink, setCheckoutLink] = useState('');
  const { lightColor, modal } = useStyle();
  const { t } = useTranslation('profile');
  const { socials } = useSocialShare({
    info: checkoutLink,
    type: 'referral',
    shareMessage: t('referral-share-message', { coupon: couponData?.slug }),
  });
  useEffect(() => {
    if (couponData?.plans) {
      const has4GeeksPlusPlan = couponData?.plans.filter((plan) => plan.slug === '4geeks-plus-subscription') || [];
      const baseUrl = process.env.DOMAIN_NAME || '';
      const queryParams = parseQuerys({
        plan: has4GeeksPlusPlan.length > 0 || couponData.plans.length === 0 ? '4geeks-plus-subscription' : couponData?.plans[0]?.slug,
        coupon: couponData?.slug,
      });
      setCheckoutLink(`${baseUrl}/checkout${queryParams}`);
    }
  }, [couponData]);
  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ sm: 'xl', md: '3xl' }}
      isCentered
      title={t('referral-modal-title')}
      backgroundColor={modal.background}
      headerStyles={{
        fontSize: '15px',
        color: lightColor,
        textAlign: 'center',
        letterSpacing: '0.05em',
        fontWeight: '900',
        textTransform: 'uppercase',
      }}
      bodyStyles={{ pb: 6 }}
    >
      {!couponData ? (
        <Text fontSize="15px" fontWeight="700" pb="18px" textAlign="center">
          {t('no-referral-coupon')}
        </Text>
      ) : (
        <Grid
          templateColumns={{ base: '1fr', md: '57% 43%' }}
          gridGap="13px"
          mt="20px"
        >
          <Box display="flex" flexDirection="column" gridGap="20px">
            <Text fontSize="16px">{t('referral-share-coupon-text')}</Text>
            <CouponInput coupon={couponData?.slug} />
            <Text fontSize="16px">{t('referral-share-link-text')}</Text>
            <CouponInput coupon={checkoutLink} />
            <Stack
              display={socials.length <= 2 ? 'flex' : 'grid'}
              gridTemplateColumns={`repeat(${socials.length}, minmax(min(5rem, 100%), 1fr))`}
              justifyItems="center"
              justifyContent={socials.length <= 2 && 'center'}
              flexDirection={socials.length <= 2 && 'row'}
              gridGap={socials.length <= 2 && '3rem'}
              width="100%"
            >
              {socials.map((social) => (
                <Box
                  key={social.name}
                  style={{ margin: '0px' }}
                  textAlign="center"
                  display="flex"
                  flexDirection="column"
                  gridGap="6px"
                >
                  <Button
                    onClick={() => {
                      if (social.target === 'popup') {
                        window.open(
                          social.href,
                          'popup',
                          'width=600,height=600,scrollbars=no,resizable=no',
                        );
                      } else {
                        window.open(social.href, '_blank');
                      }
                    }}
                    minWidth={{ base: '60px', md: '68px' }}
                    minHeight={{ base: '60px', md: '68px' }}
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="35px"
                    backgroundColor={modal.featuredBackground}
                    _hover={{
                      backgroundColor: 'gray.100',
                    }}
                    _active={{
                      backgroundColor: 'gray.100',
                    }}
                    style={{ margin: '0px' }}
                    padding="0"
                  >
                    <Icon
                      icon={social.name}
                      color={social.color}
                      width="36px"
                      height="36px"
                    />
                  </Button>
                  <Text fontSize="12px" marginBottom="5px">
                    {social.label}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
          <Box
            backgroundColor={modal.featuredBackground}
            borderRadius="17px"
            padding="16px"
          >
            <Text fontSize="15px" fontWeight="700" pb="12px">
              {t('how-it-works')}
            </Text>
            <Box display="flex" flexDirection="column" gridGap="12px">
              <Text fontSize="13px" lineHeight="1.5">
                {t('referral-step-1')}
              </Text>
              <Text fontSize="13px" lineHeight="1.5">
                {t('referral-step-2')}
              </Text>
              <Text fontSize="13px" lineHeight="1.5">
                {t('referral-step-3')}
              </Text>
              <Text fontSize="13px" lineHeight="1.5">
                {t('referral-step-4')}
              </Text>
            </Box>
          </Box>
        </Grid>
      )}
    </SimpleModal>
  );
}

ShareReferralModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  couponData: PropTypes.shape({
    slug: PropTypes.string,
    plans: PropTypes.arrayOf(
      PropTypes.shape({
        slug: PropTypes.string,
      }),
    ),
  }),
};

ShareReferralModal.defaultProps = {
  couponData: null,
};

export default ShareReferralModal;
