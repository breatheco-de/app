import React from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import NextChakraLink from '../../common/components/NextChakraLink';
import Heading from '../../common/components/Heading';
import useStyle from '../../common/hooks/useStyle';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';

function StickyBottomCta({ asset, onClick, isCtaVisible, course, videoUrl, couponApplied, ...rest }) {
  const { t } = useTranslation('exercises');
  const { hexColor, featuredColor } = useStyle();

  const hasVideo = asset?.intro_video_url;

  if (!isCtaVisible) return null;
  console.log('ASDASDASD', course);

  return (
    <>
      <Box
        overflow="hidden"
        position="fixed"
        width="100vw"
        // position="sticky"
        bottom="0"
        zIndex="100"
        borderRadius="11px 11px 0 0"
        border="1px solid"
        borderColor={hexColor.greenLight}
        background={couponApplied ? hexColor.greenLight4 : hexColor.backgroundColor}
        textAlign="center"
        display={{ base: 'block', md: 'none' }}
        {...rest}
      >
        <Box paddingBottom="20px">
          {videoUrl
            && (
            <ReactPlayerV2
              title="Video tutorial"
              withModal
              url={asset?.intro_video_url}
              withThumbnail
              thumbnailStyle={{
                borderRadius: '0 0 0 0',
                height: '110px',
              }}
            />
            )}
          {asset
            && (
            <>
              <Heading size="sm" mt="10px">
                {videoUrl ? t('video-instructions') : t('register')}
              </Heading>
              <Button display="block" width="95%" margin="10px auto" color="white" background={hexColor.greenLight} onClick={onClick}>
                {videoUrl ? t('see-instructions') : t('create-account')}
              </Button>
            </>
            )}
          {course
            && (
            <>
              <Box paddingBottom="10px" paddingTop="10px">
                <Heading size="21px">{t('course:join-cohort')}</Heading>
                <Text>{t('course:create-account-text')}</Text>
              </Box>
              <Button _active={{ brackground: hexColor.greenLight }} _focus={{ brackground: hexColor.greenLight }} fontSize="18px" display="block" width="95%" margin="10px auto" color="white" background={hexColor.greenLight} onClick={onClick}>
                {t('signup:free_trial')}
              </Button>
              <Button _active={{ brackground: 'red' }} _focus={{ brackground: 'red' }} fontSize="18px" display="block" width="95%" margin="10px auto" border={`1px solid ${hexColor.greenLight}`} color={hexColor.greenLight} background={hexColor.backgroundColor} onClick={onClick}>
                {t('common:see-financing-options')}
              </Button>
              <Flex fontSize="13px" backgroundColor={featuredColor} justifyContent="center" alignItems="center" borderRadius="4px" padding="4px 8px" width="95%" margin="0 auto" gridGap="6px">
                {t('signup:already-have-account')}
                {' '}
                <NextChakraLink href="/login" redirectAfterLogin fontSize="13px" variant="default">{t('signup:login-here')}</NextChakraLink>
              </Flex>
            </>
            )}
        </Box>
        {asset
          && (
            <Box>
              <ReactPlayerV2
                title="Video tutorial"
                withModal
                url={asset?.intro_video_url}
                withThumbnail
                thumbnailStyle={{
                  borderRadius: '0 0 0 0',
                  height: '110px',
                }}
              />
              <Heading size="sm" mt="10px">
                {hasVideo ? t('video-instructions') : t('register')}
              </Heading>
              <Button display="block" width="95%" margin="10px auto" color="white" background={hexColor.greenLight} onClick={onClick}>
                {hasVideo ? t('see-instructions') : t('create-account')}
              </Button>
            </Box>
          )}
      </Box>
    </>
  );
}

StickyBottomCta.propTypes = {
  asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  course: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  videoUrl: PropTypes.string,
  couponApplied: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  onClick: PropTypes.func.isRequired,
  isCtaVisible: PropTypes.bool.isRequired,
};

StickyBottomCta.defaultProps = {
  couponApplied: undefined,
  videoUrl: undefined,
};

export default StickyBottomCta;
