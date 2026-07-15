import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
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
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { format, formatRelative } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import useStyle from '../../../hooks/useStyle';
import Text from '../../Text';
import Icon from '../../Icon';
import NextChakraLink from '../../NextChakraLink';
import Select from '../../ReactSelect';
import SimpleModal from '../../SimpleModal';
import useCustomToast from '../../../hooks/useCustomToast';
import useSubscriptions from '../../../hooks/useSubscriptions';
import bc from '../../../services/breathecode';

const LLM_BUDGET_SERVICE_SLUG = 'llm-budget';

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

  const amount = Number(spend);
  if (Number.isNaN(amount)) return '—';

  return `$${amount.toFixed(2)}`;
}

function getLlmBudgetLabel(item, lang) {
  const academyName = typeof item?.academy_name === 'string' ? item.academy_name.trim() : '';
  if (academyName) return academyName;
  const academyId = item?.academy_id;
  if (academyId == null) return '—';
  return lang === 'es' ? `Academia #${academyId}` : `Academy #${academyId}`;
}

function getAcademyLabel(entry, lang) {
  const academyName = typeof entry?.academy?.name === 'string' ? entry.academy.name.trim() : '';
  if (academyName) return academyName;
  const academyId = entry?.academy?.id;
  if (academyId == null) return '—';
  return lang === 'es' ? `Academia #${academyId}` : `Academy #${academyId}`;
}

function LLMKeyCard({
  keyAlias,
  usageText,
  createdAtText,
  planTitle,
  onViewDetails,
  viewDetailsLabel,
  onDelete,
  isDeleteLoading,
  deleteAriaLabel,
}) {
  const { hexColor } = useStyle();

  return (
    <Box width="100%">
      <Flex
        width="100%"
        flexDirection={{ base: 'column', md: 'row' }}
        alignItems={{ base: 'stretch', md: 'center' }}
        justifyContent="space-between"
        gap={{ base: 3, md: 4 }}
      >
        <Flex alignItems="center" gap={3} flex={1} minWidth={0} width={{ base: '100%', md: 'auto' }}>
          <Flex alignItems="center" gridGap="12px" minWidth={0} flex="1">
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
            <Box minWidth={0} flex="1">
              <Flex alignItems="center" gap="8px" flexWrap="wrap">
                <Text fontSize="md" fontWeight="700">
                  {keyAlias}
                </Text>
                {planTitle ? (
                  <Badge
                    fontSize="11px"
                    fontWeight="600"
                    textTransform="none"
                    borderRadius="lg"
                    overflow="hidden"
                    px="5px"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    title={planTitle}
                  >
                    {planTitle}
                  </Badge>
                ) : null}
              </Flex>
              <Text fontSize="sm" color="gray.600">
                {usageText}
              </Text>
            </Box>
          </Flex>
          <Button
            variant="outline"
            border="none"
            aria-label={deleteAriaLabel}
            isLoading={isDeleteLoading}
            flexShrink={0}
            display={{ base: 'flex', md: 'none' }}
            onClick={onDelete}
          >
            <Icon icon="delete" color={hexColor.danger} />
          </Button>
        </Flex>

        <Flex
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'center', md: 'center' }}
          justifyContent={{ base: 'center', md: 'flex-end' }}
          gap={{ base: 2, md: 4 }}
          width={{ base: '100%', md: 'auto' }}
          flexShrink={0}
          ml={{ md: 'auto' }}
        >
          {createdAtText ? (
            <Text
              size="sm"
              fontWeight="400"
              color="gray.600"
              px={1}
              whiteSpace="nowrap"
              display={{ base: 'none', md: 'block' }}
            >
              {createdAtText}
            </Text>
          ) : null}
          <Button
            variant="outline"
            color={hexColor.blueDefault}
            borderColor={hexColor.blueDefault}
            fontSize="13px"
            textTransform="uppercase"
            onClick={onViewDetails}
          >
            {viewDetailsLabel}
          </Button>
          <Button
            variant="outline"
            px={2}
            border="none"
            aria-label={deleteAriaLabel}
            isLoading={isDeleteLoading}
            display={{ base: 'none', md: 'flex' }}
            onClick={onDelete}
          >
            <Icon icon="delete" width="27px" height="27px" />
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

LLMKeyCard.propTypes = {
  keyAlias: PropTypes.string.isRequired,
  usageText: PropTypes.string.isRequired,
  createdAtText: PropTypes.string,
  planTitle: PropTypes.string,
  onViewDetails: PropTypes.func.isRequired,
  viewDetailsLabel: PropTypes.string.isRequired,
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

function applyVendorPrefixToModels(models, vendorName) {
  if (!Array.isArray(models) || models.length === 0) return [];
  const vendor = typeof vendorName === 'string' ? vendorName.trim().toLowerCase() : '';
  if (!vendor) {
    return models.map((m) => (typeof m === 'string' ? m : String(m ?? '')));
  }
  const prefix = `${vendor}/`;
  return models.map((model) => {
    const s = typeof model === 'string' ? model.trim() : String(model ?? '');
    if (!s) return s;
    const lower = s.toLowerCase();
    if (lower.startsWith(`${vendor}/`) || lower === vendor) return s;
    return `${prefix}${s}`;
  });
}

function LlmHostCopyRow({
  value,
  onCopy,
  copyAriaLabel,
  inputBackgroundColor,
  inputBorderColor,
}) {
  return (
    <InputGroup size="md" display="flex" justifyContent="space-between">
      <Input
        value={value}
        isReadOnly
        bg={inputBackgroundColor}
        borderColor={inputBorderColor}
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
  );
}

LlmHostCopyRow.propTypes = {
  value: PropTypes.string.isRequired,
  onCopy: PropTypes.func.isRequired,
  copyAriaLabel: PropTypes.string.isRequired,
  inputBackgroundColor: PropTypes.string.isRequired,
  inputBorderColor: PropTypes.string.isRequired,
};

function LlmModelCopyRow({
  value,
  onCopy,
  copyAriaLabel,
  inputBackgroundColor,
  inputBorderColor,
}) {
  const { hexColor } = useStyle();
  const copyStripBg = useColorModeValue('gray.200', 'gray.700');
  const copyStripHoverBg = useColorModeValue('gray.300', 'gray.600');

  return (
    <InputGroup size="md" width="100%">
      <InputLeftElement width="40px" height="40px" pointerEvents="none">
        <Flex
          width="40px"
          height="36px"
          alignItems="center"
          justifyContent="center"
          borderRadius="md"
        >
          <Icon icon="brain" width="22px" height="22px" color="#0097CF" />
        </Flex>
      </InputLeftElement>
      <Input
        value={value}
        isReadOnly
        bg={inputBackgroundColor}
        borderColor={inputBorderColor}
        borderRadius="3px"
        cursor="pointer"
        fontFamily="mono"
        fontSize="sm"
        textOverflow="ellipsis"
        overflow="hidden"
        whiteSpace="nowrap"
        marginRight="50px"
        onClick={onCopy}
      />
      <InputRightElement
        width="50px"
        height="40px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRightRadius="3px"
        bg={copyStripBg}
      >
        <Button
          type="button"
          size="sm"
          variant="solid"
          aria-label={copyAriaLabel}
          minWidth="auto"
          width="100%"
          height="100%"
          borderRadius="0"
          borderRightRadius="3px"
          padding="6px"
          _dark={{ color: 'gray.100' }}
          _hover={{ bg: copyStripHoverBg }}
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
        >
          <Icon icon="copy" width="22px" height="22px" color={hexColor.fontColor2} />
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}

LlmModelCopyRow.propTypes = {
  value: PropTypes.string.isRequired,
  onCopy: PropTypes.func.isRequired,
  copyAriaLabel: PropTypes.string.isRequired,
  inputBackgroundColor: PropTypes.string.isRequired,
  inputBorderColor: PropTypes.string.isRequired,
};

function LLMKeyDetailsInfo({
  hostLabel,
  host,
  modelsTitle,
  models,
  borderColor,
  onCopyHost,
}) {
  const { t } = useTranslation('profile');
  const { borderColor2, backgroundColor3 } = useStyle();

  if (!host && (!Array.isArray(models) || models.length === 0)) return null;

  const hostValue = typeof host === 'string' ? host.trim() : '';

  return (
    <Box>
      {hostValue ? (
        <Box borderWidth="1px" backgroundColor="gray.100" borderColor={borderColor} borderRadius="8px" p="12px" mb={Array.isArray(models) && models.length > 0 ? '14px' : 0}>
          <Text size="sm" fontWeight="600" mb="6px">
            {hostLabel}
          </Text>
          <Text size="sm" color="gray.600" mb="10px">
            {t('llm.key-details.host-description')}
          </Text>
          <LlmHostCopyRow
            value={hostValue}
            onCopy={() => onCopyHost(hostValue)}
            copyAriaLabel={t('llm.key-details.copy-aria')}
            inputBackgroundColor={backgroundColor3}
            inputBorderColor={borderColor2}
          />
        </Box>
      ) : null}
      {Array.isArray(models) && models.length > 0 && (
        <Box
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="8px"
          p="12px"
        >
          <Text size="sm" fontWeight="600" mb="6px">
            {modelsTitle}
          </Text>
          <Text size="sm" color="gray.600" mb="10px">
            {t('llm.key-details.models-description')}
          </Text>
          <VStack align="stretch" spacing={3} width="100%">
            {models.map((model) => (
              <LlmModelCopyRow
                key={`llm-model-${model}`}
                value={model}
                onCopy={() => onCopyHost(model)}
                copyAriaLabel={t('llm.key-details.copy-aria')}
                inputBackgroundColor={backgroundColor3}
                inputBorderColor={borderColor2}
              />
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}

LLMKeyDetailsInfo.propTypes = {
  hostLabel: PropTypes.string.isRequired,
  host: PropTypes.string,
  modelsTitle: PropTypes.string.isRequired,
  models: PropTypes.arrayOf(PropTypes.string),
  borderColor: PropTypes.string.isRequired,
  onCopyHost: PropTypes.func.isRequired,
};

LLMKeyDetailsInfo.defaultProps = {
  host: '',
  models: [],
};

function LLM() {
  const { borderColor2 } = useStyle();
  const { t, lang } = useTranslation('profile');
  const { createToast } = useCustomToast();
  const { state: subsState } = useSubscriptions();
  const [llmStandaloneAcademies, setLlmStandaloneAcademies] = useState([]);
  const [llmUsablePlanOptions, setLlmUsablePlanOptions] = useState([]);
  const [loadingLlmConsumables, setLoadingLlmConsumables] = useState(false);

  const isLlmPlansLoading = subsState?.isLoading
    || !subsState?.areSubscriptionsFetched
    || loadingLlmConsumables;

  useEffect(() => {
    if (!subsState.areSubscriptionsFetched || subsState.isLoading) return undefined;

    const allowedStatuses = new Set(['ACTIVE', 'FREE_TRIAL', 'CANCELLED', 'PAYMENT_ISSUE', 'FULLY_PAID']);
    const subscriptions = subsState.subscriptions?.subscriptions ?? [];
    const planFinancings = subsState.subscriptions?.plan_financings ?? [];
    const subscriptionsById = Object.fromEntries(subscriptions.map((s) => [String(s.id), s]));
    const financingsById = Object.fromEntries(planFinancings.map((f) => [String(f.id), f]));

    let cancelled = false;

    const fetchLlmConsumables = async () => {
      try {
        setLoadingLlmConsumables(true);
        const res = await bc.payment({ service_slug: LLM_BUDGET_SERVICE_SLUG }).service().consumable();
        if (cancelled) return;
        if (!(res?.status >= 200 && res?.status < 300)) {
          setLlmStandaloneAcademies([]);
          setLlmUsablePlanOptions([]);
          return;
        }

        const llmVoid = (res.data.voids || []).find((entry) => entry.slug === LLM_BUDGET_SERVICE_SLUG);
        const items = llmVoid ? llmVoid.items : [];
        const now = new Date();
        const academiesById = new Map();
        const planOptionsByKey = new Map();

        items.forEach((item) => {
          if (item.how_many === 0) return;
          if (item.valid_until) {
            const validUntil = new Date(item.valid_until);
            if (Number.isNaN(validUntil.getTime()) || validUntil <= now) return;
          }

          let source = null;
          if (item.subscription !== null) {
            const subscription = subscriptionsById[String(item.subscription)];
            if (!subscription || !allowedStatuses.has(subscription.status)) return;
            source = subscription;
          } else if (item.plan_financing !== null) {
            const financing = financingsById[String(item.plan_financing)];
            if (!financing || !allowedStatuses.has(financing.status)) return;
            source = financing;
          } else {
            if (!item.standalone_invoice || !item.standalone_invoice.academy) return;
            const { academy } = item.standalone_invoice;
            const existing = academiesById.get(academy.id);
            if (!existing) {
              academiesById.set(academy.id, {
                id: academy.id,
                name: academy.name,
                validUntil: item.valid_until,
              });
              return;
            }
            if (!item.valid_until) return;
            if (!existing.validUntil || new Date(item.valid_until) < new Date(existing.validUntil)) {
              academiesById.set(academy.id, {
                id: academy.id,
                name: academy.name,
                validUntil: item.valid_until,
              });
            }
            return;
          }

          const plan = source.plans?.[0];
          const academyId = source.academy?.id;
          const planSlug = typeof plan?.slug === 'string' ? plan.slug.trim() : '';
          if (!plan || academyId == null || !planSlug) return;
          const planOptionKey = `${academyId}::${planSlug}`;
          if (planOptionsByKey.has(planOptionKey)) return;
          planOptionsByKey.set(planOptionKey, {
            academyId,
            academyLabel: getAcademyLabel(source, lang),
            planSlug,
            planLabel: getPlanTitle(plan, lang),
          });
        });

        setLlmStandaloneAcademies(Array.from(academiesById.values()));
        setLlmUsablePlanOptions(Array.from(planOptionsByKey.values()));
      } catch {
        if (!cancelled) {
          setLlmStandaloneAcademies([]);
          setLlmUsablePlanOptions([]);
        }
      } finally {
        if (!cancelled) setLoadingLlmConsumables(false);
      }
    };

    fetchLlmConsumables();
    return () => { cancelled = true; };
  }, [
    subsState.areSubscriptionsFetched,
    subsState.isLoading,
    subsState.subscriptions,
    lang,
  ]);

  const [keys, setKeys] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedAcademyOption, setSelectedAcademyOption] = useState(null);
  const [selectedPlanOption, setSelectedPlanOption] = useState(null);
  const [keyAliasInput, setKeyAliasInput] = useState('');
  const [generatedTokenId, setGeneratedTokenId] = useState('');
  const [generatedHost, setGeneratedHost] = useState('');
  const [generatedModels, setGeneratedModels] = useState([]);
  const [keyDetails, setKeyDetails] = useState(null);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [isDeletingKey, setIsDeletingKey] = useState(false);
  const [llmKeysForbidden, setLlmKeysForbidden] = useState(false);
  const [loadKeysError, setLoadKeysError] = useState('');

  const academyOptions = useMemo(() => {
    const seenAcademies = new Set();
    const acc = [];
    llmUsablePlanOptions.forEach((option) => {
      if (seenAcademies.has(option.academyId)) return;
      seenAcademies.add(option.academyId);
      acc.push({
        value: option.academyId,
        label: option.academyLabel,
      });
    });
    llmStandaloneAcademies.forEach((academy) => {
      if (seenAcademies.has(academy.id)) return;
      seenAcademies.add(academy.id);
      acc.push({
        value: academy.id,
        label: academy.name,
      });
    });
    return acc;
  }, [llmUsablePlanOptions, llmStandaloneAcademies]);

  const llmStandaloneAcademyIds = useMemo(
    () => new Set(llmStandaloneAcademies.map((academy) => academy.id)),
    [llmStandaloneAcademies],
  );

  const academyPlanOptions = useMemo(() => {
    if (!selectedAcademyOption) return [];
    return llmUsablePlanOptions
      .filter((option) => option.academyId === selectedAcademyOption.value)
      .map((option) => ({
        value: option.planSlug,
        label: option.planLabel,
        academyId: option.academyId,
      }));
  }, [llmUsablePlanOptions, selectedAcademyOption]);

  const hasUsablePlanLlmForAcademy = academyPlanOptions.length > 0;
  const hasStandaloneForAcademy = selectedAcademyOption != null
    && llmStandaloneAcademyIds.has(selectedAcademyOption.value);
  const purchasedCreditForAcademy = useMemo(() => {
    if (!selectedAcademyOption) return null;
    return llmStandaloneAcademies.find((academy) => academy.id === selectedAcademyOption.value) ?? null;
  }, [llmStandaloneAcademies, selectedAcademyOption]);
  const showPurchasedCreditExpiryWarning = !hasUsablePlanLlmForAcademy
    && hasStandaloneForAcademy
    && purchasedCreditForAcademy?.validUntil;
  const canGenerate = selectedAcademyOption != null
    && (hasUsablePlanLlmForAcademy ? selectedPlanOption != null : hasStandaloneForAcademy);
  const llmBudgetSummaries = useMemo(() => {
    const budgetsByAcademyId = new Map();

    keys.forEach((item) => {
      const academyId = item?.academy_id;
      const spend = item?.member_budget?.spend;
      const max = item?.member_budget?.max;

      if (academyId == null || spend == null || max == null) return;
      if (budgetsByAcademyId.has(academyId)) return;

      budgetsByAcademyId.set(academyId, {
        academyId,
        academyLabel: getLlmBudgetLabel(item, lang),
        spend,
        max,
      });
    });

    return Array.from(budgetsByAcademyId.values());
  }, [keys, lang]);

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
    setSelectedAcademyOption(null);
    setSelectedPlanOption(null);
    setKeyAliasInput('');
    setGeneratedTokenId('');
    setGeneratedHost('');
    setGeneratedModels([]);
  };

  const closeGenerateModal = () => {
    setIsGenerateModalOpen(false);
    setIsGenerating(false);
    setSelectedAcademyOption(null);
    setSelectedPlanOption(null);
    setKeyAliasInput('');
    setGeneratedTokenId('');
    setGeneratedHost('');
    setGeneratedModels([]);
  };

  useEffect(() => {
    if (!isGenerateModalOpen) return;

    if (selectedAcademyOption == null && academyOptions.length === 1) {
      setSelectedAcademyOption(academyOptions[0]);
      return;
    }

    if (selectedAcademyOption != null) {
      const selectedStillValid = academyOptions.some((opt) => opt.value === selectedAcademyOption.value);
      if (!selectedStillValid) {
        setSelectedAcademyOption(academyOptions.length === 1 ? academyOptions[0] : null);
        setSelectedPlanOption(null);
        return;
      }
    }

    if (selectedAcademyOption == null && academyOptions.length > 1 && selectedPlanOption != null) {
      setSelectedPlanOption(null);
      return;
    }

    if (selectedAcademyOption != null && selectedPlanOption == null && academyPlanOptions.length === 1) {
      setSelectedPlanOption(academyPlanOptions[0]);
      return;
    }

    if (selectedPlanOption != null) {
      const planStillValid = academyPlanOptions.some((opt) => opt.value === selectedPlanOption.value);
      if (!planStillValid) setSelectedPlanOption(academyPlanOptions.length === 1 ? academyPlanOptions[0] : null);
    }
  }, [
    isGenerateModalOpen,
    academyOptions,
    academyPlanOptions,
    selectedAcademyOption,
    selectedPlanOption,
  ]);

  const handleGenerate = async () => {
    if (!canGenerate) return;

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
      const payload = { key_alias: alias };
      if (selectedPlanOption) {
        payload.plan_slug = selectedPlanOption.value;
      }
      const res = await bc.provisioning().generateLLMKey(
        payload,
        selectedAcademyOption.value,
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
        setGeneratedHost(String(res?.data?.host || ''));
        setGeneratedModels(
          applyVendorPrefixToModels(
            Array.isArray(res?.data?.models) ? res.data.models : [],
            res?.data?.vendor_name,
          ),
        );
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

  const handleCopyHost = useCallback(async (value) => {
    if (typeof value !== 'string' || !value) return;
    try {
      await navigator.clipboard.writeText(value);
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
  }, [createToast, t]);

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
  const closeDetailsModal = () => {
    setKeyDetails(null);
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
              isDisabled={isLoadingList || llmKeysForbidden}
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
            <>
              {llmBudgetSummaries.length > 0 && (
                <Box mb={6}>
                  {llmBudgetSummaries.length === 1 ? (
                    <Text fontSize="14px">
                      <Box as="span" fontWeight="700">
                        {t('llm.total-usage')}
                        {': '}
                      </Box>
                      {t('llm.budget-usage', {
                        spend: formatSpendValue(llmBudgetSummaries[0].spend),
                        max: formatSpendValue(llmBudgetSummaries[0].max),
                      })}
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing={2}>
                      {llmBudgetSummaries.map((budget) => (
                        <Text key={`llm-budget-${budget.academyId}`} fontSize="14px">
                          <Box as="span" fontWeight="700">
                            {budget.academyLabel}
                            {': '}
                          </Box>
                          {t('llm.budget-usage', {
                            spend: formatSpendValue(budget.spend),
                            max: formatSpendValue(budget.max),
                          })}
                        </Text>
                      ))}
                    </VStack>
                  )}
                </Box>
              )}
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
                        viewDetailsLabel={t('llm.view-details')}
                        onViewDetails={() => {
                          setKeyDetails({
                            keyAlias,
                            usageText,
                            host: typeof item?.host === 'string' ? item.host : '',
                            models: applyVendorPrefixToModels(
                              Array.isArray(item?.models) ? item.models : [],
                              item?.vendor_name,
                            ),
                          });
                        }}
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
            </>
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
                {isLlmPlansLoading && (
                  <Text size="sm" color="gray.500">{t('llm.loading-plans')}</Text>
                )}
                {!isLlmPlansLoading && academyOptions.length === 0 && (
                  <Text size="sm" color="gray.500">{t('llm.no-plans')}</Text>
                )}
                {academyOptions.length > 1 && (
                  <Box>
                    <Text size="md" fontWeight="600" mb="6px">{t('llm.generate-modal.academy-label')}</Text>
                    <Select
                      fontWeight="500"
                      id="llm-academy-select"
                      fontSize="15px"
                      value={selectedAcademyOption}
                      options={academyOptions}
                      placeholder={t('llm.select-academy')}
                      onChange={(opt) => {
                        setSelectedAcademyOption(opt);
                        setSelectedPlanOption(null);
                      }}
                    />
                  </Box>
                )}
                {selectedAcademyOption && academyPlanOptions.length > 1 && (
                  <Box>
                    <Text size="md" fontWeight="600" mb="6px">{t('llm.generate-modal.plan-label')}</Text>
                    <Select
                      fontWeight="500"
                      id="llm-plan-select"
                      fontSize="15px"
                      value={selectedPlanOption}
                      options={academyPlanOptions}
                      placeholder={t('llm.select-plan')}
                      onChange={(opt) => setSelectedPlanOption(opt)}
                    />
                  </Box>
                )}
                {showPurchasedCreditExpiryWarning && (
                  <Box bg="yellow.light" p="4" borderRadius="md" width="100%">
                    <Flex alignItems="center" gap={3}>
                      <Icon icon="warning" height="20px" width="30px" />
                      <Text color="gray.500" fontWeight="bold">
                        {t('llm.generate-modal.purchased-credit-expiry-alert', {
                          date: format(new Date(purchasedCreditForAcademy.validUntil), 'PP', {
                            locale: lang === 'es' ? es : undefined,
                          }),
                        })}
                      </Text>
                    </Flex>
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
                <LLMKeyDetailsInfo
                  hostLabel={t('llm.host-label')}
                  host={generatedHost}
                  modelsTitle={t('llm.models-title')}
                  models={generatedModels}
                  borderColor={borderColor2}
                  onCopyHost={handleCopyHost}
                />
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
                  isDisabled={!canGenerate || academyOptions.length === 0}
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
      <SimpleModal
        isOpen={!!keyDetails}
        onClose={closeDetailsModal}
        title={t('llm.details-modal.title')}
        size="2xl"
        isCentered
        headerStyles={{ textAlign: 'center', textTransform: 'uppercase' }}
        bodyStyles={{ display: 'flex', flexDirection: 'column', gridGap: '12px' }}
      >
        <Flex justifyContent="space-between" alignItems="center" gridGap="10px" flexWrap="wrap">
          <Text size="md" fontWeight="700">{keyDetails?.usageText || '—'}</Text>
          <Text size="md" fontWeight="700">{keyDetails?.keyAlias || '—'}</Text>
        </Flex>
        <LLMKeyDetailsInfo
          hostLabel={t('llm.host-label')}
          host={keyDetails?.host}
          modelsTitle={t('llm.models-title')}
          models={Array.isArray(keyDetails?.models) ? keyDetails.models : []}
          borderColor={borderColor2}
          onCopyHost={handleCopyHost}
        />
        <Flex justifyContent="center" pb="8px">
          <Button
            variant="default"
            textTransform="uppercase"
            fontSize="13px"
            onClick={closeDetailsModal}
          >
            {t('llm.details-modal.close')}
          </Button>
        </Flex>
      </SimpleModal>
    </>
  );
}

export default LLM;
