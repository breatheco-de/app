import React from 'react';
import {
  Box,
  Button,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../../common/components/Heading';
import useStyle from '../../common/hooks/useStyle';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';

function StickyBottomCta({ asset, onClick, isCtaVisible, ...rest }) {
  const { t } = useTranslation('exercises');
  const { hexColor } = useStyle();

  const hasVideo = asset?.intro_video_url;

  if (!isCtaVisible) return null;

  return (
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
      background={hexColor.backgroundColor}
      textAlign="center"
      display={{ base: 'block', md: 'none' }}
      {...rest}
    >
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
  );
}

StickyBottomCta.propTypes = {
  asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  onClick: PropTypes.func.isRequired,
  isCtaVisible: PropTypes.bool.isRequired,
};

export default StickyBottomCta;
