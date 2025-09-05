import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarGroup, Box, Flex, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useStyle from '../../hooks/useStyle';
import Link from '../NextChakraLink';
import Text from '../Text';
import bc from '../../services/breathecode';

function MktEventToast({ academy, status, type, text, colorLight, colorDark, hostImage, hostGroupImages, maxWidth, ...rest }) {
  const { t } = useTranslation('workshops');
  const { locale } = useRouter();
  const [event, setEvent] = useState(null);
  const { backgroundColor } = useStyle();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const background = colorLight && colorDark ? useColorModeValue(colorLight, colorDark) : backgroundColor;
  const query = useMemo(() => {
    const q = {};
    if (academy) q.academy = academy;
    if (status) q.status = status;
    if (type) q.type = type;
    return q;
  }, [academy, status, type]);

  useEffect(() => {
    bc.events(query).allEvents()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setEvent(list[0] || null);
      })
      .catch(() => setEvent(null));
  }, [query]);

  if (!event) return null;

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (_) {
      return '';
    }
  };
  const dynamicText = isMobile ? t('toast-dynamic-short', { title: event?.title }) : t('toast-dynamic', { title: event?.title || '', date: formatDate(event?.starting_at) });
  const showHostGroupImages = Array.isArray(hostGroupImages) && hostGroupImages.length > 0;
  const showHostImage = hostImage && !showHostGroupImages;

  return (
    <Box
      position="absolute"
      zIndex="1400"
      top="50px"
      right="50%"
      transform="translateX(50%)"
      maxWidth={maxWidth}
      width="calc(100% - 32px)"
      {...rest}
    >
      <Link
        href={event?.slug ? `/workshops/${event.slug}` : '#'}
        _hover={{ textDecoration: 'none' }}
        style={{ textDecoration: 'none' }}
      >
        <Flex
          alignItems="center"
          gridGap="10px"
          borderRadius="10px"
          padding="10px 14px"
          background={background}
          border="1px solid transparent"
          boxShadow="0 8px 24px rgba(0, 0, 0, 0.2)"
          cursor="pointer"
        >
          {showHostGroupImages && (
            <AvatarGroup size="sm" max={4}>
              {hostGroupImages.map((img) => (
                <Avatar key={(img?.url || img)} name="host" src={img?.url || img} />
              ))}
            </AvatarGroup>
          )}
          {showHostImage && (
            <Avatar name="host" src={hostImage?.url || hostImage} />
          )}
          <Box display="flex" flexDirection="column" flex={1} minWidth={0}>
            <Text size="sm" color="black" noOfLines={2}>
              {text || dynamicText || t('toast-default')}
            </Text>
          </Box>
        </Flex>
      </Link>
    </Box>
  );
}

MktEventToast.propTypes = {
  academy: PropTypes.string,
  status: PropTypes.string,
  type: PropTypes.string,
  text: PropTypes.string,
  colorLight: PropTypes.string,
  colorDark: PropTypes.string,
  hostImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  hostGroupImages: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

MktEventToast.defaultProps = {
  academy: undefined,
  status: undefined,
  type: undefined,
  text: undefined,
  colorLight: undefined,
  colorDark: undefined,
  hostImage: undefined,
  hostGroupImages: undefined,
  maxWidth: '420px',
};

export default MktEventToast;
