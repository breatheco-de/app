import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text as ChakraText,
  VStack,
} from '@chakra-ui/react';
import { formatRelative } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import Text from '../../Text';
import Icon from '../../Icon';
import NextChakraLink from '../../NextChakraLink';
import VPSRequestModal from './VPSRequestModal';
import useStyle from '../../../hooks/useStyle';
import useCustomToast from '../../../hooks/useCustomToast';
import useSubscriptions from '../../../hooks/useSubscriptions';
import bc from '../../../services/breathecode';
import profileHandlers from '../Subscriptions/handlers';

function getProvisioningErrorMessage(res, fallback) {
  const detail = res?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  return fallback;
}

/** Maps VPS API status to subscription-card pill styles (same keys as `statusStyles` in handlers). */
function getVpsStatusPillConfig(status) {
  const s = String(status || '').toUpperCase();
  switch (s) {
    case 'ACTIVE':
      return { styleKey: 'active', labelKey: 'active' };
    case 'PENDING':
      return { styleKey: 'free_trial', labelKey: 'pending' };
    case 'PROVISIONING':
      return { styleKey: 'completed', labelKey: 'provisioning' };
    case 'ERROR':
      return { styleKey: 'payment_issue', labelKey: 'error' };
    case 'DELETED':
      return { styleKey: 'cancelled', labelKey: 'deleted' };
    default:
      return { styleKey: 'free_trial', labelKey: 'unknown' };
  }
}

function VpsCredentialCopyRow({
  label,
  value,
  copyAriaLabel,
  onCopy,
}) {
  return (
    <Box>
      <Text size="sm" fontWeight="600" mb="4px">{label}</Text>
      <InputGroup size="md" display="flex" justifyContent="space-between">
        <Input
          value={value}
          isReadOnly
          borderColor="blue.default"
          borderRadius="3px"
          cursor="pointer"
          textOverflow="ellipsis"
          overflow="hidden"
          whiteSpace="nowrap"
          marginRight="20px"
          onClick={onCopy}
        />
        <InputRightElement
          width="50px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRightRadius="3px"
          backgroundColor="blue.default"
        >
          <Button
            type="button"
            size="sm"
            variant="solid"
            background="blue.default"
            color="gray.800"
            aria-label={copyAriaLabel}
            minWidth="auto"
            padding="6px"
            height="32px"
            _hover={{ color: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
          >
            <Icon icon="copy" size="25px" />
          </Button>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
}

VpsCredentialCopyRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  copyAriaLabel: PropTypes.string.isRequired,
  onCopy: PropTypes.func.isRequired,
};

function VpsCard({
  title,
  ipText,
  providerText,
  planText,
  createdAtText,
  statusLabel,
  pillStyle,
  showOddColumnRightBorder,
  isViewCredentialsDisabled,
  onViewCredentials,
}) {
  const { borderColor2, backgroundColor3 } = useStyle();
  const { t } = useTranslation('profile');

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      minWidth={0}
      borderRightWidth={{ base: '0', md: showOddColumnRightBorder ? '1px' : '0' }}
      borderRightColor={borderColor2}
      pr={{ md: showOddColumnRightBorder ? 6 : 0 }}
    >
      <Flex
        alignItems="flex-start"
        flexShrink={0}
        gridGap="12px"
        width="100%"
        backgroundColor={backgroundColor3}
        marginTop="10px"
        padding="10px"
        borderRadius="10px"
      >
        <Box
          minWidth="48px"
          minHeight="48px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          backgroundColor="blue.light"
          borderRadius="50px"
          flexShrink={0}
        >
          <Icon icon="globe" width="24px" height="24px" />
        </Box>
        <Box minWidth={0} flex="1">
          <Flex alignItems="center" flexWrap="wrap" gridGap="8px" mb="4px">
            <Text fontSize="md" fontWeight="700">
              {title}
            </Text>
            <ChakraText
              as="span"
              fontSize="12px"
              fontWeight="700"
              padding="4px 10px"
              borderRadius="18px"
              width="fit-content"
              {...pillStyle}
            >
              {statusLabel}
            </ChakraText>
          </Flex>
          {ipText ? <Text fontSize="sm" color="gray.600">{ipText}</Text> : null}
        </Box>
      </Flex>
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        width="100%"
        minHeight={0}
        padding="10px"
      >
        <Flex
          alignItems={{ base: 'flex-start', md: 'flex-end' }}
          justifyContent="space-between"
          flexDirection={{ base: 'column', md: 'row' }}
          width="100%"
          gridGap={{ base: '8px', md: '12px' }}
        >
          <Box flex="1" minWidth={0}>
            {providerText ? <Text fontSize="sm" color="gray.600">{providerText}</Text> : null}
            {planText ? <Text fontSize="sm" color="gray.600">{planText}</Text> : null}
          </Box>
          {createdAtText ? (
            <Text
              size="sm"
              fontWeight="400"
              flexShrink={0}
              textAlign={{ base: 'left', md: 'right' }}
            >
              {createdAtText}
            </Text>
          ) : null}
        </Flex>
        <Box marginTop="auto" paddingTop="10px" width="100%">
          <Button
            variant="outline"
            size="sm"
            width="100%"
            fontWeight="600"
            isDisabled={isViewCredentialsDisabled}
            onClick={onViewCredentials}
          >
            {t('vps.view-credentials')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

VpsCard.propTypes = {
  title: PropTypes.string.isRequired,
  ipText: PropTypes.string,
  providerText: PropTypes.string,
  planText: PropTypes.string,
  createdAtText: PropTypes.string,
  statusLabel: PropTypes.string.isRequired,
  pillStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.any])).isRequired,
  showOddColumnRightBorder: PropTypes.bool.isRequired,
  isViewCredentialsDisabled: PropTypes.bool,
  onViewCredentials: PropTypes.func.isRequired,
};

VpsCard.defaultProps = {
  ipText: '',
  providerText: '',
  planText: '',
  createdAtText: '',
  isViewCredentialsDisabled: false,
};

function VPS() {
  const { borderColor2 } = useStyle();
  const { t, lang } = useTranslation('profile');
  const { createToast } = useCustomToast();
  const { statusStyles } = profileHandlers();
  const { state: subsState } = useSubscriptions();

  const [vpsList, setVpsList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadListError, setLoadListError] = useState('');
  const [canRequestVps, setCanRequestVps] = useState(false);

  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [credentialsDetail, setCredentialsDetail] = useState(null);
  const [credentialsLoadError, setCredentialsLoadError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const planTitleBySlug = useMemo(() => {
    const subscriptions = subsState?.subscriptions?.subscriptions ?? [];
    const planFinancings = subsState?.subscriptions?.plan_financings ?? [];
    const sources = [...subscriptions, ...planFinancings];
    const titleBySlug = {};

    sources.forEach((source) => {
      const plan = source?.plans?.[0];
      const slug = typeof plan?.slug === 'string' ? plan.slug.trim() : '';
      const title = typeof plan?.title === 'string' ? plan.title.trim() : '';
      if (!slug || !title) return;
      if (!titleBySlug[slug]) titleBySlug[slug] = title;
    });

    return titleBySlug;
  }, [subsState?.subscriptions]);
  const openRequestModal = useCallback(() => {
    setRequestModalOpen(true);
  }, []);

  const closeRequestModal = useCallback(() => {
    setRequestModalOpen(false);
  }, []);
  const fetchVpsList = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await bc.provisioning().getMyVPS();
      if (!(res?.status >= 200 && res?.status < 300)) {
        setVpsList([]);
        setCanRequestVps(false);
        setLoadListError(getProvisioningErrorMessage(res, t('vps.load-error')));
        return;
      }

      const payload = res?.data || {};
      setVpsList(payload?.results || []);
      setCanRequestVps(payload?.can_request_vps === true);
      setLoadListError('');
    } catch (err) {
      setVpsList([]);
      setCanRequestVps(false);
      setLoadListError(getProvisioningErrorMessage(err?.response ?? err, t('vps.load-error')));
    } finally {
      setIsLoadingList(false);
    }
  }, [t]);

  // Load current user VPS list on mount.
  useEffect(() => {
    fetchVpsList();
  }, [fetchVpsList]);

  const formatVpsCreatedAt = useCallback((createdAt) => {
    if (!createdAt) return '';
    try {
      const date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) return '';
      const relative = lang === 'es'
        ? formatRelative(date, new Date(), { locale: es })
        : formatRelative(date, new Date());
      return t('llm.key-created-at', { date: relative });
    } catch {
      return '';
    }
  }, [lang, t]);

  const closeCredentialsModal = useCallback(() => {
    setCredentialsModalOpen(false);
    setCredentialsLoading(false);
    setCredentialsDetail(null);
    setCredentialsLoadError('');
    setPasswordVisible(false);
  }, []);

  const openCredentialsModal = useCallback(async (vpsId) => {
    if (vpsId == null) return;
    setCredentialsModalOpen(true);
    setPasswordVisible(false);
    setCredentialsDetail(null);
    setCredentialsLoadError('');
    setCredentialsLoading(true);
    try {
      const res = await bc.provisioning().getMyVpsById(vpsId);
      if (res?.status >= 200 && res?.status < 300) {
        setCredentialsDetail(res.data);
      } else {
        setCredentialsDetail(null);
        setCredentialsLoadError(getProvisioningErrorMessage(res, t('vps.credentials-modal.load-error')));
      }
    } catch (err) {
      setCredentialsDetail(null);
      setCredentialsLoadError(getProvisioningErrorMessage(err?.response ?? err, t('vps.credentials-modal.load-error')));
    } finally {
      setCredentialsLoading(false);
    }
  }, [t]);

  const handleCopyCredential = useCallback(async (raw) => {
    const str = raw == null ? '' : String(raw).trim();
    if (!str) {
      createToast({
        title: t('vps.credentials-modal.copy-error'),
        status: 'error',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(str);
      createToast({
        title: t('vps.credentials-modal.copy-success'),
        status: 'success',
      });
    } catch {
      createToast({
        title: t('vps.credentials-modal.copy-error'),
        status: 'error',
      });
    }
  }, [createToast, t]);

  return (
    <>
      <Box
        display="flex"
        flexDirection={{ base: 'column', lg: 'row' }}
        alignItems={{ base: 'center', lg: 'start' }}
        gridGap="38px"
        width="100%"
        height="auto"
        borderRadius="17px"
        border="1px solid"
        borderColor={borderColor2}
        p="30px"
        mt="26px"
      >
        <Box width="100%">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            alignItems={{ base: 'flex-start', md: 'center' }}
            justifyContent={{ base: 'flex-start', md: 'space-between' }}
            mb={{ base: '18px', md: '14px' }}
            flexWrap="wrap"
            gridGap={{ base: '10px', md: '12px' }}
          >
            <Box width={{ base: '100%', md: '80%' }} mb="18px">
              <Text fontSize="16px" fontWeight="700">
                {t('vps.title')}
              </Text>
              <Text fontSize="14px" color="gray.600">
                {t('vps.description')}
              </Text>
            </Box>
            <Button
              variant="default"
              backgroundColor="blue.default"
              color="white"
              fontSize="15px"
              textTransform="uppercase"
              alignSelf={{ base: 'center', md: 'auto' }}
              title={!canRequestVps ? t('vps.cannot-request') : undefined}
              isDisabled={!canRequestVps}
              onClick={openRequestModal}
            >
              <Text fontSize="15px" fontWeight="700">
                {t('vps.request')}
              </Text>
            </Button>
          </Flex>

          {isLoadingList && (
          <Text size="md" fontWeight="400">
            {t('vps.loading')}
          </Text>
          )}

          {!isLoadingList && loadListError && (
          <Text size="md" fontWeight="400">
            {loadListError}
          </Text>
          )}

          {!isLoadingList && !loadListError && vpsList.length === 0 && (
          <Text size="md" fontWeight="400">
            {canRequestVps ? t('vps.no-vps') : t('vps.cannot-request')}
            {!canRequestVps && (
              <>
                {' '}
                <NextChakraLink
                  href="/pricing"
                  color="blue.default"
                  fontWeight="700"
                  textDecoration="none"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {t('vps.pricing-page')}
                </NextChakraLink>
                .
              </>
            )}
          </Text>
          )}

          {!isLoadingList && !loadListError && vpsList.length > 0 && (
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 4, md: 6 }}
            width="100%"
            alignItems="stretch"
          >
            {vpsList.map((item, idx) => {
              const itemId = item?.id ?? idx;
              const title = item?.hostname || t('vps.server-fallback-title', { id: String(itemId) });
              const ipText = item?.ip_address ? t('vps.ip-label', { ip: item.ip_address }) : '';
              const providerValue = item?.vendor?.name ?? item?.vendor?.slug ?? item?.vendor ?? '';
              const providerText = providerValue ? t('vps.provider-label', { provider: providerValue }) : '';
              const planValue = item?.plan_title
                ?? item?.plan?.title
                ?? planTitleBySlug[item?.plan_slug]
                ?? item?.plan_slug;
              const planText = planValue ? t('vps.plan-label', { plan: planValue }) : '';
              const createdAtText = formatVpsCreatedAt(item?.created_at);
              const { styleKey, labelKey } = getVpsStatusPillConfig(item?.status);
              const pillStyle = statusStyles[styleKey] || statusStyles.error;
              const isLast = idx === vpsList.length - 1;
              const isOddColumn = idx % 2 === 0;
              const showOddColumnRightBorder = isOddColumn && !isLast;

              return (
                <VpsCard
                  key={String(itemId)}
                  title={title}
                  ipText={ipText}
                  providerText={providerText}
                  planText={planText}
                  createdAtText={createdAtText}
                  statusLabel={t(`vps.status.${labelKey}`)}
                  pillStyle={pillStyle}
                  showOddColumnRightBorder={showOddColumnRightBorder}
                  isViewCredentialsDisabled={item?.id == null}
                  onViewCredentials={() => {
                    if (item?.id != null) openCredentialsModal(item.id);
                  }}
                />
              );
            })}
          </SimpleGrid>
          )}
        </Box>
      </Box>
      <Modal isOpen={credentialsModalOpen} onClose={closeCredentialsModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            textAlign="center"
            textTransform="uppercase"
            borderBottom="1px solid"
            borderColor={borderColor2}
          >
            {t('vps.credentials-modal.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" gridGap="12px" py="16px">
            {credentialsLoading && (
            <Text size="sm" color="gray.600">{t('vps.credentials-modal.loading')}</Text>
            )}
            {!credentialsLoading && credentialsLoadError && (
            <Text size="sm" color="red.500">{credentialsLoadError}</Text>
            )}
            {!credentialsLoading && !credentialsLoadError && credentialsDetail && (
              <VStack spacing={3} align="stretch" width="100%">
                {credentialsDetail.hostname && (
                  <VpsCredentialCopyRow
                    label={t('vps.credentials-modal.hostname')}
                    value={String(credentialsDetail.hostname).trim()}
                    copyAriaLabel={t('vps.credentials-modal.copy-aria')}
                    onCopy={() => handleCopyCredential(credentialsDetail.hostname)}
                  />
                )}
                {credentialsDetail.ip_address && (
                  <VpsCredentialCopyRow
                    label={t('vps.credentials-modal.ip')}
                    value={String(credentialsDetail.ip_address).trim()}
                    copyAriaLabel={t('vps.credentials-modal.copy-aria')}
                    onCopy={() => handleCopyCredential(credentialsDetail.ip_address)}
                  />
                )}
                {credentialsDetail.ssh_user && (
                  <VpsCredentialCopyRow
                    label={t('vps.credentials-modal.ssh-user')}
                    value={String(credentialsDetail.ssh_user).trim()}
                    copyAriaLabel={t('vps.credentials-modal.copy-aria')}
                    onCopy={() => handleCopyCredential(credentialsDetail.ssh_user)}
                  />
                )}
                {credentialsDetail.ssh_port != null && credentialsDetail.ssh_port !== '' && (
                  <VpsCredentialCopyRow
                    label={t('vps.credentials-modal.ssh-port')}
                    value={String(credentialsDetail.ssh_port)}
                    copyAriaLabel={t('vps.credentials-modal.copy-aria')}
                    onCopy={() => handleCopyCredential(credentialsDetail.ssh_port)}
                  />
                )}
                {credentialsDetail.root_password && (
                  <Box>
                    <Text size="sm" fontWeight="600" mb="4px">{t('vps.credentials-modal.root-password')}</Text>
                    <InputGroup size="md" display="flex" justifyContent="space-between">
                      <InputLeftElement
                        width="50px"
                        height="40px"
                        pointerEvents="auto"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconButton
                          aria-label={passwordVisible ? t('vps.credentials-modal.hide-password') : t('vps.credentials-modal.show-password')}
                          icon={(
                            <Icon
                              icon={passwordVisible ? 'eyeClosed' : 'eyeOpen'}
                              size="25px"
                              color="gray.800"
                            />
                          )}
                          variant="ghost"
                          size="sm"
                          color="gray.800"
                          h="32px"
                          minW="32px"
                          p={0}
                          onClick={() => setPasswordVisible((v) => !v)}
                        />
                      </InputLeftElement>
                      <Input
                        type={passwordVisible ? 'text' : 'password'}
                        value={String(credentialsDetail.root_password)}
                        isReadOnly
                        borderColor="blue.default"
                        borderRadius="3px"
                        pl="50px"
                        marginRight="20px"
                        cursor="pointer"
                        textOverflow="ellipsis"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        onClick={() => handleCopyCredential(credentialsDetail.root_password)}
                      />
                      <InputRightElement
                        width="50px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRightRadius="3px"
                        backgroundColor="blue.default"
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="solid"
                          background="blue.default"
                          color="gray.800"
                          aria-label={t('vps.credentials-modal.copy-password')}
                          minWidth="auto"
                          padding="6px"
                          height="32px"
                          _hover={{ color: 'none' }}
                          onClick={() => handleCopyCredential(credentialsDetail.root_password)}
                        >
                          <Icon icon="copy" size="25px" />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter display="flex" justifyContent="center">
            <Button variant="default" backgroundColor="blue.default" color="white" onClick={closeCredentialsModal}>
              {t('vps.credentials-modal.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <VPSRequestModal
        isOpen={requestModalOpen}
        onClose={closeRequestModal}
        onSuccess={fetchVpsList}
      />
    </>
  );
}

export default VPS;
