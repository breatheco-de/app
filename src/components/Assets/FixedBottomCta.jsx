import React from 'react';
import {
  Box,
  Button,
  Text,
  Skeleton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import ReactPlayerV2 from '../ReactPlayerV2';
import CouponTopBar from '../CouponTopBar';

function FixedBottomCta({
  asset,
  course,
  event,
  onClick,
  isCtaVisible,
  videoUrl,
  couponApplied,
  financingAvailable,
  isFetching,
  isAuthenticated,
  paymentOptions,
  eventWording,
  eventTitle,
  eventDescription,
  showVideoInCta,
  ...rest
}) {
  const { t } = useTranslation('exercises');
  const { t: tWorkshops } = useTranslation('workshops');
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
        {videoUrl && (showVideoInCta === undefined || showVideoInCta) && (
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

        {course && isFetching && <Skeleton height="50px" width="100%" padding="1px" />}

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

        {event && !isAuthenticated && (
          <>
            <Heading size="sm" mt="10px" color="white">
              {eventTitle || tWorkshops('form.title')}
            </Heading>
            <Text color="white" mb="16px">
              {eventDescription || tWorkshops('form.description')}
            </Text>
            <Button
              width="95%"
              margin="10px auto"
              background="white"
              color="gray.700"
              onClick={onClick}
            >
              {eventWording || tWorkshops('reserv-button-text')}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

FixedBottomCta.propTypes = {
  asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  course: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  event: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  videoUrl: PropTypes.string,
  couponApplied: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  onClick: PropTypes.func.isRequired,
  isCtaVisible: PropTypes.bool.isRequired,
  financingAvailable: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  isAuthenticated: PropTypes.bool,
  isFetching: PropTypes.bool,
  paymentOptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  eventWording: PropTypes.string,
  eventTitle: PropTypes.string,
  eventDescription: PropTypes.string,
  showVideoInCta: PropTypes.bool,
};

FixedBottomCta.defaultProps = {
  asset: null,
  course: null,
  event: null,
  videoUrl: undefined,
  couponApplied: undefined,
  financingAvailable: undefined,
  isAuthenticated: false,
  isFetching: false,
  paymentOptions: [],
  eventWording: undefined,
  eventTitle: undefined,
  eventDescription: undefined,
  showVideoInCta: undefined,
};

export default FixedBottomCta;
