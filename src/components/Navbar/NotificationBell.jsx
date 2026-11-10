import { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Flex, Popover, PopoverArrow, PopoverContent, PopoverTrigger, Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { es, enUS } from 'date-fns/locale';
import { formatDistanceStrict } from 'date-fns';
import Icon from '../Icon';
import Heading from '../Heading';
import Text from '../Text';
import bc from '../../services/breathecode';
import useStyle from '../../hooks/useStyle';

const UNREAD_POLL_INTERVAL = 60 * 1000;
const PAGE_SIZE = 20;

function NotificationBell() {
  const { t } = useTranslation('navbar');
  const router = useRouter();
  const { hexColor, colorMode, borderColor2, navbarBackground } = useStyle();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const levelColors = {
    INFO: hexColor.blueDefault,
    WARNING: hexColor.yellowDefault,
    ERROR: hexColor.danger,
  };

  const refreshUnread = useCallback(() => {
    bc.messaging().inboxUnread()
      .then(({ data }) => setUnread(data?.unread || 0))
      .catch(() => {});
  }, []);

  const loadNotifications = useCallback(() => {
    setIsLoading(true);
    bc.messaging().inbox({ limit: PAGE_SIZE })
      .then(({ data }) => setNotifications(Array.isArray(data) ? data : data?.results || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, UNREAD_POLL_INTERVAL);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshUnread();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshUnread]);

  const toggle = () => {
    if (!isOpen) loadNotifications();
    setIsOpen(!isOpen);
  };

  const markAllAsRead = () => {
    bc.messaging().readInbox()
      .then(({ data }) => {
        const now = new Date().toISOString();
        setUnread(data?.unread || 0);
        setNotifications((prev) => prev.map((item) => ({ ...item, read_at: item.read_at || now })));
      })
      .catch(() => {});
  };

  const openNotification = (notification) => {
    if (!notification.read_at) {
      setNotifications((prev) => prev.map((item) => (
        item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
      )));
      bc.messaging().readInbox(notification.id)
        .then(({ data }) => setUnread(data?.unread || 0))
        .catch(() => {});
    }

    if (!notification.link) return;
    setIsOpen(false);
    if (notification.link.startsWith('/')) router.push(notification.link);
    else window.open(notification.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-end">
      <PopoverTrigger>
        <Button
          bg="rgba(0,0,0,0)"
          alignSelf="center"
          minWidth="unset"
          width="26px"
          height="30px"
          padding="0"
          position="relative"
          aria-label={t('notifications.title')}
          title={t('notifications.title')}
          onClick={toggle}
          style={{ margin: 0 }}
          _hover={{ background: navbarBackground }}
          _active={{ background: navbarBackground }}
        >
          <Icon icon="bell" width="22px" height="22px" color="black" />
          {unread > 0 && (
            <Box
              position="absolute"
              top="-2px"
              right="-4px"
              minWidth="16px"
              height="16px"
              padding="0 4px"
              borderRadius="8px"
              background={hexColor.danger}
              color="white"
              fontSize="10px"
              fontWeight="700"
              lineHeight="16px"
              textAlign="center"
            >
              {unread > 9 ? '9+' : unread}
            </Box>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        border={0}
        boxShadow="2xl !important"
        rounded="md"
        width={{ base: '92vw', md: '380px' }}
        maxWidth="380px"
      >
        <PopoverArrow />
        <Flex alignItems="center" justifyContent="space-between" padding="14px 16px" gridGap="10px">
          <Heading as="p" size="16px" fontWeight="700">
            {t('notifications.title')}
          </Heading>
          {unread > 0 && (
            <Button variant="link" fontSize="13px" fontWeight="400" color="blue.400" onClick={markAllAsRead}>
              {t('notifications.mark-all-as-read')}
            </Button>
          )}
        </Flex>

        <Box maxHeight="400px" overflowY="auto" borderTop="1px solid" borderColor={borderColor2}>
          {isLoading && notifications.length === 0 && (
            <Flex justifyContent="center" padding="24px">
              <Spinner size="sm" />
            </Flex>
          )}
          {!isLoading && notifications.length === 0 && (
            <Text size="14px" padding="24px 16px" textAlign="center" color={hexColor.fontColor3}>
              {t('notifications.empty')}
            </Text>
          )}
          {notifications.map((notification) => (
            <Flex
              key={notification.id}
              as="button"
              width="100%"
              textAlign="left"
              gridGap="10px"
              padding="12px 16px"
              borderBottom="1px solid"
              borderColor={borderColor2}
              background={notification.read_at ? 'transparent' : hexColor.featuredColor}
              cursor={notification.link || !notification.read_at ? 'pointer' : 'default'}
              onClick={() => openNotification(notification)}
            >
              <Box
                flexShrink={0}
                marginTop="6px"
                width="8px"
                height="8px"
                borderRadius="50%"
                background={levelColors[notification.level] || hexColor.blueDefault}
                opacity={notification.read_at ? 0.35 : 1}
              />
              <Box flex="1" minWidth="0">
                <Text size="14px" fontWeight={notification.read_at ? '400' : '700'}>
                  {notification.title}
                </Text>
                {notification.message && (
                  <Text size="13px" marginTop="4px" whiteSpace="pre-line" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                    {notification.message}
                  </Text>
                )}
                <Text size="12px" marginTop="6px" color={hexColor.fontColor3}>
                  {formatDistanceStrict(new Date(notification.created_at), new Date(), {
                    addSuffix: true,
                    locale: router.locale === 'es' ? es : enUS,
                  })}
                </Text>
              </Box>
            </Flex>
          ))}
        </Box>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
