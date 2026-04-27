import {
  Box, Button, Divider, Flex, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, VStack,
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
import Select from '../../ReactSelect';
import SimpleModal from '../../SimpleModal';
import useCustomToast from '../../../hooks/useCustomToast';
import useStyle from '../../../hooks/useStyle';
import useSubscriptions from '../../../hooks/useSubscriptions';
import bc from '../../../services/breathecode';

function tryParseDetailAsObject(detail) {
  if (detail != null && typeof detail === 'object') return detail;
  if (typeof detail !== 'string') return null;
  try {
    return JSON.parse(detail.trim());
  } catch {
    return null;
  }
}

function parseEmbeddedErrorJson(detailStr) {
  if (typeof detailStr !== 'string') return null;
  const idx = detailStr.lastIndexOf('{"error"');
  if (idx === -1) return null;
  const slice = detailStr.slice(idx);
  try {
    return JSON.parse(slice);
  } catch {
    try {
      return JSON.parse(slice.replace(/\\"/g, '"'));
    } catch {
      return null;
    }
  }
}

function messageFromDetailErrorShape(detailObj) {
  const err = detailObj?.error;
  if (err == null) return null;

  if (typeof err === 'object') {
    if (err.error != null) {
      const inner = err.error;
      if (typeof inner === 'string') return inner.trim();
      if (typeof inner === 'object' && typeof inner.message === 'string') {
        return inner.message.trim();
      }
      return typeof inner === 'object' ? JSON.stringify(inner) : String(inner);
    }
    if (typeof err.message === 'string') return err.message.trim();
  }

  if (typeof err === 'string') return err.trim();

  return null;
}

function getProvisioningErrorMessage(res, fallback) {
  const detail = res?.data?.detail;

  if (detail != null) {
    const asObj = tryParseDetailAsObject(detail) ?? (typeof detail === 'string' ? parseEmbeddedErrorJson(detail) : null);
    const fromShape = asObj ? messageFromDetailErrorShape(asObj) : null;
    if (fromShape) return fromShape;
    if (typeof detail === 'string' && detail.trim()) return detail.trim();
  }

  if (res?.data == null && typeof res?.message === 'string' && res.message.trim()) {
    return res.message.trim();
  }

  return fallback;
}

function formatSpendValue(spend) {
  if (spend === null || spend === undefined) return '—';

  return String(`$${spend}`);
}

function LLMKeyCard({
  keyAlias,
  usageText,
  createdAtText,
  planTitle,
  onDelete,
  isDeleteLoading,
  deleteAriaLabel,
}) {
  const { hexColor } = useStyle();

  return (
    <Box width="100%">
      <Flex alignItems="center" justifyContent="space-between" width="100%">
        <Flex alignItems="center" gridGap="12px">
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
            <Icon icon="key" width="24px" height="24px" />
          </Box>
          <Box minWidth={0}>
            <Text fontSize="md" fontWeight="700">
              {keyAlias}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {usageText}
            </Text>
          </Box>
        </Flex>
        <Flex alignItems="center" gridGap="12px" flexShrink={0}>
          <Box>
            {createdAtText && (
              <Text
                size="sm"
                fontWeight="400"
                display={{ base: 'none', md: 'block' }}
              >
                {createdAtText}
              </Text>
            )}
            {planTitle ? (
              <Text
                size="sm"
                fontWeight="400"
                color="gray.500"
                display={{ base: 'none', md: 'block' }}
              >
                {planTitle}
              </Text>
            ) : null}
          </Box>
          <Button
            variant="outline"
            border="none"
            aria-label={deleteAriaLabel}
            isLoading={isDeleteLoading}
            onClick={onDelete}
          >
            <Icon icon="close" width="15px" height="15px" color={hexColor.danger} />
          </Button>
        </Flex>
      </Flex>
      {createdAtText && (
        <Text
          size="sm"
          fontWeight="400"
          color="gray.500"
          mt="4px"
          display={{ base: 'block', md: 'none' }}
        >
          {createdAtText}
        </Text>
      )}
    </Box>
  );
}

LLMKeyCard.propTypes = {
  keyAlias: PropTypes.string.isRequired,
  usageText: PropTypes.string.isRequired,
  createdAtText: PropTypes.string,
  planTitle: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  isDeleteLoading: PropTypes.bool,
  deleteAriaLabel: PropTypes.string.isRequired,
};

LLMKeyCard.defaultProps = {
  createdAtText: '',
  planTitle: '',
  isDeleteLoading: false,
};

function getPlanTitle(plan, lang) {
  const translation = plan?.translations?.find((tr) => tr.lang?.startsWith(lang));
  if (translation?.title) return translation.title;
  const fallback = plan?.translations?.[0]?.title;
  return fallback || plan?.title || plan?.slug || '—';
}

function LLM() {
  const { borderColor2 } = useStyle();
  const { t, lang } = useTranslation('profile');
  const { createToast } = useCustomToast();
  const { state: subsState } = useSubscriptions();

  const planOptions = useMemo(() => {
    const subs = subsState.subscriptions?.subscriptions ?? [];
    const financings = subsState.subscriptions?.plan_financings ?? [];
    const seenAcademies = new Set();
    const options = [];
    const allowedStatuses = new Set(['ACTIVE', 'FREE_TRIAL', 'CANCELLED', 'PAYMENT_ISSUE']);

    [...subs, ...financings].forEach((entry) => {
      const entryAcademyId = entry?.academy?.id;
      if (entryAcademyId == null || seenAcademies.has(entryAcademyId)) return;
      if (!allowedStatuses.has(entry?.status)) return;

      const hasLlmConsumable = (entry?.plans ?? []).some((plan) => plan?.service_items?.some(
        (si) => si?.service?.consumer === 'MONTHLY_LLM_BUDGET',
      ));
      if (!hasLlmConsumable) return;

      seenAcademies.add(entryAcademyId);
      const plan = entry?.plans?.[0];
      if (plan) {
        options.push({ plan, academyId: entryAcademyId });
      }
    });

    return options;
  }, [subsState.subscriptions]);

  const selectOptions = useMemo(() => planOptions.map((opt, idx) => ({
    value: idx,
    label: getPlanTitle(opt.plan, lang),
  })), [planOptions, lang]);

  const [keys, setKeys] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedPlanOption, setSelectedPlanOption] = useState(null);
  const [keyAliasInput, setKeyAliasInput] = useState('');
  const [generatedTokenId, setGeneratedTokenId] = useState('');
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [isDeletingKey, setIsDeletingKey] = useState(false);
  const [llmKeysForbidden, setLlmKeysForbidden] = useState(false);
  const [loadKeysError, setLoadKeysError] = useState('');

  const fetchKeys = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await bc.provisioning().getLLMKeys();
      if (res?.status === 403) {
        setKeys([]);
        setLlmKeysForbidden(true);
        setLoadKeysError('');
        return;
      }
      if (res?.status >= 200 && res?.status < 300) {
        setLlmKeysForbidden(false);
        setLoadKeysError('');
        const list = Array.isArray(res.data) ? res.data : [];
        const sorted = list.slice().sort((a, b) => {
          const aDate = Date.parse(a?.created_at || 0);
          const bDate = Date.parse(b?.created_at || 0);
          return bDate - aDate;
        });
        setKeys(sorted);
      } else {
        setLlmKeysForbidden(false);
        setKeys([]);
        setLoadKeysError(getProvisioningErrorMessage(res, t('llm.load-error')));
      }
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      if (status === 403) {
        setKeys([]);
        setLlmKeysForbidden(true);
        setLoadKeysError('');
        return;
      }
      setLlmKeysForbidden(false);
      setKeys([]);
      setLoadKeysError(getProvisioningErrorMessage(err?.response ?? err, t('llm.load-error')));
    } finally {
      setIsLoadingList(false);
    }
  }, [createToast, t]);

  useEffect(() => {
    fetchKeys();
  }, []);

  const openGenerateModal = () => {
    setIsGenerateModalOpen(true);
    setSelectedPlanOption(planOptions.length === 1 ? selectOptions[0] : null);
    setKeyAliasInput('');
    setGeneratedTokenId('');
  };

  const closeGenerateModal = () => {
    setIsGenerateModalOpen(false);
    setIsGenerating(false);
    setSelectedPlanOption(null);
    setKeyAliasInput('');
    setGeneratedTokenId('');
  };
  const handleGenerate = async () => {
    const selected = selectedPlanOption ? planOptions[selectedPlanOption.value] : null;
    if (!selected) return;

    const alias = keyAliasInput.trim();
    if (!alias) {
      createToast({
        title: t('llm.key-alias-required'),
        status: 'error',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await bc.provisioning().generateLLMKey(
        { key_alias: alias, plan_slug: selected?.plan?.slug },
        selected.academyId,
      );
      if (res?.status >= 200 && res?.status < 300) {
        const tokenId = res?.data?.key;
        if (!tokenId) {
          createToast({
            title: getProvisioningErrorMessage(res, t('llm.action-error')),
            status: 'error',
          });
          return;
        }
        setGeneratedTokenId(String(tokenId));
        await fetchKeys();
      } else {
        createToast({
          title: getProvisioningErrorMessage(res, t('llm.action-error')),
          status: 'error',
        });
      }
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      if (status === 403) {
        setLlmKeysForbidden(true);
        closeGenerateModal();
        return;
      }
      createToast({
        title: getProvisioningErrorMessage(err?.response ?? err, t('llm.action-error')),
        status: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTokenId = async () => {
    try {
      await navigator.clipboard.writeText(generatedTokenId);
      createToast({
        title: t('llm.key-copied'),
        status: 'success',
      });
    } catch {
      createToast({
        title: t('llm.key-copy-error'),
        status: 'error',
      });
    }
  };

  const handleDelete = async (tokenId, academyId) => {
    try {
      const res = await bc.provisioning().deleteLLMKey(tokenId, academyId);
      if (res?.status === 403) {
        setLlmKeysForbidden(true);
        setKeyToDelete(null);
        setIsDeletingKey(false);
        return false;
      }
      if (res?.status >= 200 && res?.status < 300) {
        createToast({
          title: t('llm.key-delete-success'),
          status: 'success',
        });
        setKeys((prevKeys) => prevKeys.filter((keyItem) => keyItem?.token_id !== tokenId));
        return true;
      }
      createToast({
        title: getProvisioningErrorMessage(res, t('llm.action-error')),
        status: 'error',
      });
      return false;
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      if (status === 403) {
        setLlmKeysForbidden(true);
        setKeyToDelete(null);
        setIsDeletingKey(false);
        return false;
      }
      createToast({
        title: getProvisioningErrorMessage(err?.response ?? err, t('llm.action-error')),
        status: 'error',
      });
      return false;
    }
  };

  const closeDeleteModal = () => {
    setKeyToDelete(null);
    setIsDeletingKey(false);
  };

  const confirmDelete = async () => {
    if (!keyToDelete?.tokenId || !keyToDelete?.academyId) return;
    setIsDeletingKey(true);
    try {
      const ok = await handleDelete(keyToDelete.tokenId, keyToDelete.academyId);
      if (ok) closeDeleteModal();
    } finally {
      setIsDeletingKey(false);
    }
  };

  const formatCreatedAt = useCallback((createdAt) => {
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
                {t('llm.title')}
              </Text>
              <Text fontSize="14px" color="gray.600">
                {t('llm.description')}
              </Text>
            </Box>
            <Button
              variant="default"
              backgroundColor="blue.default"
              color="white"
              fontSize="15px"
              textTransform="uppercase"
              alignSelf={{ base: 'center', md: 'auto' }}
              isDisabled={llmKeysForbidden}
              onClick={openGenerateModal}
            >
              <Text fontSize="15px" fontWeight="700">
                {t('llm.generate')}
              </Text>
            </Button>
          </Flex>

          {isLoadingList && (
            <Text size="md" fontWeight="400">
              {t('llm.loading')}
            </Text>
          )}

          {!isLoadingList && keys.length === 0 && (
            llmKeysForbidden ? (
              <Text size="md" fontWeight="400">
                {t('llm.no-consumable')}
                {' '}
                <NextChakraLink
                  href="/pricing"
                  color="blue.default"
                  fontWeight="700"
                  textDecoration="none"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {t('llm.pricing-page')}
                </NextChakraLink>
                .
              </Text>
            ) : (
              <Text size="md" fontWeight="400">
                {loadKeysError || t('llm.no-keys')}
              </Text>
            )
          )}

          {!isLoadingList && keys.length > 0 && (
            <VStack spacing={0} align="stretch" width="100%" divider={<Divider />}>
              {keys.map((item, index) => {
                const tokenId = item?.token_id;
                const academyId = item?.academy_id;
                const keyAlias = item?.key_alias ?? '—';
                const usageText = t('llm.key-usage', { usage: formatSpendValue(item?.spend) });
                const createdAtText = formatCreatedAt(item?.created_at);
                const planTitle = item?.metadata?.plan_title ?? '';
                return (
                  <Box
                    key={tokenId != null ? String(tokenId) : `llm-key-${index}`}
                    py={4}
                    {...(index === 0 ? { pt: 0 } : {})}
                  >
                    <LLMKeyCard
                      keyAlias={keyAlias}
                      usageText={usageText}
                      createdAtText={createdAtText}
                      planTitle={planTitle}
                      deleteAriaLabel={t('llm.key-delete-aria')}
                      onDelete={() => {
                        if (tokenId == null || academyId == null) return;
                        setKeyToDelete({ tokenId, academyId });
                      }}
                    />
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
      </Box>
      <Modal isOpen={isGenerateModalOpen} onClose={closeGenerateModal} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            textAlign="center"
            textTransform="uppercase"
            borderBottom="1px solid"
            borderColor={borderColor2}
          >
            {t('llm.generate-modal.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" gridGap="12px">
            {!generatedTokenId && (
              <>
                {planOptions.length === 0 && (
                  <Text size="sm" color="gray.500">{t('llm.no-plans')}</Text>
                )}
                {planOptions.length > 1 && (
                  <Box>
                    <Text size="md" fontWeight="600" mb="6px">{t('llm.generate-modal.plan-label')}</Text>
                    <Select
                      fontWeight="500"
                      id="cohort-select"
                      fontSize="15px"
                      value={selectedPlanOption}
                      options={selectOptions}
                      placeholder={t('llm.select-plan')}
                      onChange={(opt) => setSelectedPlanOption(opt)}
                    />
                  </Box>
                )}
                <Box>
                  <Text size="md" fontWeight="600" mb="6px">{t('llm.generate-modal.alias-label')}</Text>
                  <Input
                    value={keyAliasInput}
                    placeholder={t('llm.generate-modal.alias-placeholder')}
                    onChange={(e) => setKeyAliasInput(e.target.value)}
                  />
                </Box>
              </>
            )}
            {generatedTokenId && (
              <>
                <Text size="md">{t('llm.generate-modal.token-description')}</Text>
                <InputGroup size="md" display="flex" justifyContent="space-between">
                  <Input
                    value={generatedTokenId}
                    isReadOnly
                    borderColor="blue.default"
                    borderRadius="3px"
                    cursor="pointer"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    marginRight="20px"
                    onClick={handleCopyTokenId}
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
                      size="sm"
                      variant="solid"
                      background="blue.default"
                      color="gray.800"
                      onClick={handleCopyTokenId}
                      minWidth="auto"
                      padding="6px"
                      height="32px"
                      _hover={{ color: 'none' }}
                    >
                      <Icon icon="copy" size="25px" />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <Text size="sm" color="gray.500">{t('llm.generate-modal.token-warning')}</Text>
              </>
            )}
          </ModalBody>
          <ModalFooter display="flex" gridGap="12px">
            {!generatedTokenId ? (
              <>
                <Button
                  variant="outline"
                  color="blue.default"
                  borderColor="blue.default"
                  textTransform="uppercase"
                  fontSize="13px"
                  onClick={closeGenerateModal}
                >
                  {t('llm.generate-modal.cancel')}
                </Button>
                <Button
                  variant="default"
                  isLoading={isGenerating}
                  isDisabled={!selectedPlanOption || planOptions.length === 0}
                  textTransform="uppercase"
                  fontSize="13px"
                  onClick={handleGenerate}
                >
                  {t('llm.generate-modal.generate')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  textTransform="uppercase"
                  fontSize="13px"
                  onClick={closeGenerateModal}
                >
                  {t('llm.generate-modal.close')}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      <SimpleModal
        isOpen={!!keyToDelete}
        onClose={closeDeleteModal}
        title={t('llm.delete-modal.title')}
        isCentered
        headerStyles={{ textAlign: 'center', textTransform: 'uppercase' }}
        bodyStyles={{ display: 'flex', flexDirection: 'column', gridGap: '16px' }}
      >
        <Text textAlign="center" size="md">{t('llm.delete-modal.description')}</Text>
        <Flex justifyContent="center" gridGap="12px" pb="8px">
          <Button
            variant="outline"
            color="blue.default"
            borderColor="blue.default"
            textTransform="uppercase"
            fontSize="13px"
            isDisabled={isDeletingKey}
            onClick={closeDeleteModal}
          >
            {t('llm.delete-modal.close')}
          </Button>
          <Button
            variant="default"
            textTransform="uppercase"
            fontSize="13px"
            isLoading={isDeletingKey}
            onClick={confirmDelete}
          >
            {t('llm.delete-modal.confirm')}
          </Button>
        </Flex>
      </SimpleModal>
    </>
  );
}

export default LLM;
