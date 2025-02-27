import React from 'react';
import {
  Box,
  Button,
  Text,
  Skeleton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../../common/components/Heading';
import useStyle from '../../common/hooks/useStyle';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import CouponTopBar from '../../common/components/CouponTopBar';

function StickyBottomCta({
  asset,
  onClick,
  isCtaVisible,
  course,
  videoUrl,
  couponApplied,
  financingAvailable,
  isFetching,
  isAuthenticated,
  paymentOptions,
  ...rest
}) {
  const { t } = useTranslation('exercises');
  const { hexColor } = useStyle();

  if (!isCtaVisible) return null;

  const includesFreeTier = paymentOptions?.some((option) => option.isFreeTier);
  const backgroundColor = couponApplied ? hexColor.greenLight4 : hexColor.backgroundColor;

  const getHeadingForAsset = () => {
    if (!isAuthenticated && videoUrl) return t('video-instructions');
    if (isAuthenticated && videoUrl) return t('video-instructions-logged');
    return t('start-interactive');
  };

  const getButtonTextForAsset = () => {
    if (!isAuthenticated) return t('create-account');
    if (videoUrl) return t('see-instructions');
    return t('start-interactive-cta');
  };

  const courseButtonText = () => {
    if (videoUrl) return t('course:join-cohort');
    if (financingAvailable) return t('common:see-financing-options');
    return t('common:enroll');
  };

  return (
    <Box
      overflow="hidden"
      position="fixed"
      width="100vw"
      bottom="0"
      zIndex="100"
      borderRadius="11px 11px 0 0"
      border="1px solid"
      borderColor={hexColor.greenLight}
      background={backgroundColor}
      textAlign="center"
      display={{ base: 'block', md: 'none' }}
      {...rest}
    >
      <Box paddingBottom={couponApplied || isFetching ? '0' : '5px'}>

        {videoUrl && (
          <ReactPlayerV2
            title={asset ? 'Video tutorial' : ''}
            withModal
            url={videoUrl}
            withThumbnail
            thumbnailStyle={{ borderRadius: '0 0 0 0', height: '110px' }}
          />
        )}

        {asset && (
          <>
            <Heading size="sm" mt="10px">{getHeadingForAsset()}</Heading>
            <Button display="block" width="95%" margin="10px auto" color="white" background={hexColor.greenLight} onClick={onClick}>
              {getButtonTextForAsset()}
            </Button>
          </>
        )}

        {course && isFetching && <Skeleton height="40px" width="100%" padding="1px" />}

        {course && !isFetching && couponApplied && <CouponTopBar />}

        {course && !isFetching && !couponApplied && (
          <>
            {!videoUrl && (
              <Text color="black" fontSize="18px" fontWeight={600}>
                {t('course:create-account-text')}
              </Text>
            )}

            <Button
              fontSize="18px"
              display="block"
              width="95%"
              margin="10px auto"
              border={`1px solid ${hexColor.greenLight}`}
              color={hexColor.greenLight}
              background={hexColor.backgroundColor}
              onClick={onClick}
            >
              {courseButtonText()}
            </Button>

            {includesFreeTier && (
              <Button
                fontSize="18px"
                display="block"
                width="95%"
                margin="10px auto"
                color="white"
                background={hexColor.greenLight}
                onClick={onClick}
              >
                {t('common:start-free-trial')}
              </Button>
            )}
          </>
        )}

      </Box>
    </Box>
  );
}

StickyBottomCta.propTypes = {
  asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  course: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  videoUrl: PropTypes.string,
  couponApplied: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  onClick: PropTypes.func.isRequired,
  isCtaVisible: PropTypes.bool.isRequired,
  financingAvailable: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  isFetching: PropTypes.bool,
  paymentOptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

StickyBottomCta.defaultProps = {
  asset: null,
  course: null,
  videoUrl: undefined,
  couponApplied: undefined,
  financingAvailable: undefined,
  isAuthenticated: false,
  isFetching: false,
  paymentOptions: [],
};

export default StickyBottomCta;
