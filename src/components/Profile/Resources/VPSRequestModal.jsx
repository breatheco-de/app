import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text as ChakraText,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import Text from '../../Text';
import Icon from '../../Icon';
import Select from '../../ReactSelect';
import useStyle from '../../../hooks/useStyle';
import useCustomToast from '../../../hooks/useCustomToast';
import useSubscriptions from '../../../hooks/useSubscriptions';
import bc from '../../../services/breathecode';

const VPS_SERVER_CONSUMER = 'VPS_SERVER';

function getProvisioningErrorMessage(res, fallback) {
  const detail = res?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  return fallback;
}

function formatSpecsGbFromMbString(value) {
  const s = String(value ?? '').trim();
  if (!s) return '—';
  const n = Number(s);
  if (Number.isFinite(n) && String(n) === s) return `${Math.round(n / 1024)} GB`;
  return s;
}

function getDiskSizeUnitHintFromRaw(raw) {
  const arr = raw?.disk_info;
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const unit = arr[0]?.size?.unit;
  if (typeof unit !== 'string' || !unit.trim()) return null;
  return unit.trim().toLowerCase();
}

function formatSpecsDiskForDisplay(diskValueStr, unitHint) {
  const s = String(diskValueStr ?? '').trim();
  if (!s) return '—';
  const n = Number(s);
  if (!Number.isFinite(n) || String(n) !== s) return s;

  const u = unitHint ? String(unitHint).toLowerCase() : '';
  if (u === 'gib' || u === 'gb' || u === 'g') {
    return `${Math.round(n)} GB`;
  }
  if (u === 'tb' || u === 'tib' || u === 't') {
    return `${Math.round(n * 1024)} GB`;
  }
  return `${Math.round(n / 1024)} GB`;
}

function formatSpecsCpuLine(value) {
  const s = String(value ?? '').trim();
  if (!s) return '—';
  const n = Number(s);
  if (Number.isFinite(n) && String(n) === s) return `${n} vCPU`;
  return s;
}

function getVendorOptionMatchValue(raw, allowedSet) {
  const idStr = raw?.id != null && String(raw.id).trim() !== '' ? String(raw.id).trim() : '';
  const slugStr = typeof raw?.slug === 'string' && raw.slug.trim() !== '' ? raw.slug.trim() : '';
  if (idStr && allowedSet.has(idStr)) return idStr;
  if (slugStr && allowedSet.has(slugStr)) return slugStr;
  return null;
}

function buildOptionMetaInfo(raw) {
  const distribution = typeof raw?.distribution === 'string' ? raw.distribution.trim() : '';
  const definitions = [
    ['city', typeof raw?.city === 'string' ? raw.city.trim() : ''],
    ['country', typeof raw?.country === 'string' ? raw.country.trim() : ''],
    ['continent', typeof raw?.continent === 'string' ? raw.continent.trim() : ''],
    ['distribution', distribution],
  ];
  const metaInfo = {};
  definitions.forEach(([key, value]) => {
    if (value) metaInfo[key] = value;
  });
  return Object.keys(metaInfo).length ? metaInfo : null;
}

function getNormalizedVendorFieldOptions(field, vendorOptionsPayload, vendorSettings) {
  const optionsKey = field?.options_key;
  const settingsKey = field?.settings_key;
  const rawOptions = Array.isArray(vendorOptionsPayload?.[optionsKey]) ? vendorOptionsPayload[optionsKey] : [];
  const allowedValues = Array.isArray(vendorSettings?.[settingsKey]) ? vendorSettings[settingsKey] : [];
  const allowedSet = new Set(allowedValues.map((entry) => String(entry)));

  return rawOptions
    .map((raw) => {
      const matchValue = getVendorOptionMatchValue(raw, allowedSet);
      if (matchValue == null) return null;
      const rawLabel = raw?.name ?? raw?.description ?? raw?.slug;
      if (rawLabel == null || String(rawLabel).trim() === '') return null;
      const meta = raw?.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)
        ? raw.metadata
        : null;
      const metaInfo = buildOptionMetaInfo(raw);
      const cpus = String(meta?.cpus ?? raw?.vcpus ?? '').trim();
      const memory = String(meta?.memory ?? raw?.memory ?? '').trim();
      const diskSpace = String(meta?.disk_space ?? raw?.disk ?? '').trim();
      const diskUnitHint = getDiskSizeUnitHintFromRaw(raw);
      const specsCard = cpus !== '' && memory !== '' && diskSpace !== ''
        ? {
          id: String(matchValue),
          name: String(rawLabel),
          cpus,
          memory,
          diskSpace,
          diskUnitHint,
        }
        : null;

      return {
        value: matchValue,
        label: String(rawLabel),
        ...(metaInfo ? { metaInfo } : {}),
        ...(specsCard ? { specsCard } : {}),
      };
    })
    .filter(Boolean);
}

function VPSRequestModal({ isOpen, onClose, onSuccess }) {
  const { borderColor2, backgroundColor3 } = useStyle();
  const { t, lang } = useTranslation('profile');
  const { createToast } = useCustomToast();
  const { state: subsState } = useSubscriptions();

  const [requestStep, setRequestStep] = useState('provider');
  const [selectedAcademyOption, setSelectedAcademyOption] = useState(null);
  const [selectedPlanOption, setSelectedPlanOption] = useState(null);
  const [vpsConsumableOptions, setVpsConsumableOptions] = useState([]);
  const [loadingVpsConsumables, setLoadingVpsConsumables] = useState(false);
  const [provisioningByAcademyId, setProvisioningByAcademyId] = useState({});
  const [provisioningErrorByAcademyId, setProvisioningErrorByAcademyId] = useState({});
  const [loadingProvisioningVendors, setLoadingProvisioningVendors] = useState(false);
  const [selectedProvisioningVendor, setSelectedProvisioningVendor] = useState(null);
  const [vendorOptionsPayload, setVendorOptionsPayload] = useState(null);
  const [loadingVendorOptions, setLoadingVendorOptions] = useState(false);
  const [loadVendorOptionsError, setLoadVendorOptionsError] = useState('');
  const [selectedVendorSelections, setSelectedVendorSelections] = useState({});
  const [submittingVpsRequest, setSubmittingVpsRequest] = useState(false);

  const academyOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    vpsConsumableOptions.forEach((opt) => {
      const key = String(opt.academyId);
      if (seen.has(key)) return;
      seen.add(key);
      options.push({
        value: opt.academyId,
        label: opt.academyName || `Academy #${opt.academyId}`,
      });
    });
    return options;
  }, [vpsConsumableOptions]);

  const academyPlanOptions = useMemo(() => {
    const selectedAcademyId = selectedAcademyOption?.value;
    if (selectedAcademyId == null) return [];
    return vpsConsumableOptions
      .filter((opt) => String(opt.academyId) === String(selectedAcademyId))
      .map((opt) => ({
        value: opt.value,
        label: opt.label,
      }));
  }, [selectedAcademyOption?.value, vpsConsumableOptions]);

  const selectedConsumable = useMemo(
    () => vpsConsumableOptions.find(
      (opt) => String(opt.value) === String(selectedPlanOption?.value),
    ) || null,
    [vpsConsumableOptions, selectedPlanOption?.value],
  );

  const selectedProvisioningAcademyId = selectedConsumable?.academyId ?? null;

  const currentLoadProvidersError = useMemo(() => {
    if (selectedProvisioningAcademyId == null) return '';
    return provisioningErrorByAcademyId[String(selectedProvisioningAcademyId)] || '';
  }, [selectedProvisioningAcademyId, provisioningErrorByAcademyId]);

  const currentProvisioningList = useMemo(() => {
    if (selectedProvisioningAcademyId == null || currentLoadProvidersError) return [];
    return provisioningByAcademyId[String(selectedProvisioningAcademyId)] ?? [];
  }, [selectedProvisioningAcademyId, currentLoadProvidersError, provisioningByAcademyId]);

  const isVendorSelectionComplete = useMemo(() => (selectedProvisioningVendor?.vendor?.settings_schema?.fields || []).every((field) => {
    const normalizedOptions = getNormalizedVendorFieldOptions(
      field,
      vendorOptionsPayload,
      selectedProvisioningVendor?.vendor_settings,
    );
    if (normalizedOptions.length === 0) return true;
    const isRequired = field?.required !== false;
    if (!isRequired) return true;
    const selectionKey = field?.selection_key;
    const value = selectedVendorSelections?.[selectionKey];
    return value != null && String(value).trim() !== '';
  }), [selectedProvisioningVendor, selectedVendorSelections, vendorOptionsPayload]);

  const resetState = useCallback(() => {
    setRequestStep('provider');
    setSelectedAcademyOption(null);
    setSelectedPlanOption(null);
    setVpsConsumableOptions([]);
    setLoadingVpsConsumables(false);
    setProvisioningByAcademyId({});
    setProvisioningErrorByAcademyId({});
    setSelectedProvisioningVendor(null);
    setLoadingProvisioningVendors(false);
    setVendorOptionsPayload(null);
    setLoadingVendorOptions(false);
    setLoadVendorOptionsError('');
    setSelectedVendorSelections({});
    setSubmittingVpsRequest(false);
  }, []);

  const closeModal = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  // Keep modal state in sync with visibility: initialize step on open, reset all state on close.
  useEffect(() => {
    if (isOpen) {
      setRequestStep('provider');
      return;
    }
    resetState();
  }, [isOpen, resetState]);

  // Load VPS consumables when modal opens and filter them to valid/usable options.
  useEffect(() => {
    if (!isOpen) return undefined;
    if (!subsState.areSubscriptionsFetched || subsState.isLoading) {
      setLoadingVpsConsumables(true);
      return undefined;
    }

    const allowedStatuses = new Set(['ACTIVE', 'FREE_TRIAL', 'CANCELLED']);
    const subscriptions = subsState.subscriptions?.subscriptions ?? [];
    const planFinancings = subsState.subscriptions?.plan_financings ?? [];
    const subscriptionsById = Object.fromEntries(subscriptions.map((s) => [String(s?.id), s]));
    const financingsById = Object.fromEntries(planFinancings.map((f) => [String(f?.id), f]));
    let cancelled = false;

    const fetchConsumablesOptions = async () => {
      try {
        setLoadingVpsConsumables(true);
        const res = await bc.payment({ service_slug: 'vps_server' }).service().consumable();
        if (cancelled) return;
        if (!(res?.status >= 200 && res?.status < 300)) {
          setVpsConsumableOptions([]);
          return;
        }

        const payload = res?.data;
        const vpsServiceEntry = (payload?.voids ?? []).find(
          (entry) => String(entry?.slug || '').toLowerCase() === 'vps_server',
        );
        const items = Array.isArray(vpsServiceEntry?.items) ? vpsServiceEntry.items : [];
        const now = new Date();
        const uniqueValidConsumableCandidates = [];
        const seenAcademyPlanKeys = new Set();
        items.forEach((item) => {
          if ((item?.how_many ?? 0) <= 0) return;
          const validUntilRaw = item?.valid_until;
          if (validUntilRaw) {
            const validUntil = new Date(validUntilRaw);
            if (Number.isNaN(validUntil.getTime()) || validUntil <= now) return;
          }
          let source = null;
          if (item?.subscription != null) {
            const subscription = subscriptionsById[String(item.subscription)];
            if (!subscription || !allowedStatuses.has(subscription?.status)) return;
            source = subscription;
          } else if (item?.plan_financing != null) {
            const financing = financingsById[String(item.plan_financing)];
            if (!financing || !allowedStatuses.has(financing?.status)) return;
            source = financing;
          } else {
            return;
          }
          const plan = source?.plans?.[0];
          const academyId = source?.academy?.id;
          const academyName = source?.academy?.name;
          if (!plan || academyId == null) return;
          const planTitle = typeof plan?.title === 'string' ? plan.title.trim() : '';
          const planSlug = typeof plan?.slug === 'string' ? plan.slug.trim() : '';
          const planLabel = planTitle || planSlug || '—';
          const planKey = planSlug || String(plan?.id ?? planLabel);
          const academyPlanKey = `${academyId}::${planKey}`;
          if (seenAcademyPlanKeys.has(academyPlanKey)) return;
          seenAcademyPlanKeys.add(academyPlanKey);
          uniqueValidConsumableCandidates.push({
            item, plan, academyId, academyName,
          });
        });

        const options = uniqueValidConsumableCandidates.map(({
          item, plan, academyId, academyName,
        }) => ({
          value: item.id,
          label: (
            (typeof plan?.title === 'string' && plan.title.trim())
            || (typeof plan?.slug === 'string' && plan.slug.trim())
            || '—'
          ),
          academyId,
          academyName,
          planSlug: typeof plan?.slug === 'string' ? plan.slug.trim() : '',
          consumableId: item.id,
        }));

        setVpsConsumableOptions(options);
      } catch {
        if (!cancelled) setVpsConsumableOptions([]);
      } finally {
        if (!cancelled) setLoadingVpsConsumables(false);
      }
    };

    fetchConsumablesOptions();
    return () => { cancelled = true; };
  }, [
    isOpen,
    subsState.areSubscriptionsFetched,
    subsState.isLoading,
    subsState.subscriptions,
    lang,
  ]);

  // Auto-select academy/plan when only one valid option is available.
  useEffect(() => {
    if (!isOpen) return;
    if (selectedAcademyOption == null && academyOptions.length === 1) {
      setSelectedAcademyOption(academyOptions[0]);
      return;
    }
    if (selectedAcademyOption != null && selectedPlanOption == null && academyPlanOptions.length === 1) {
      setSelectedPlanOption(academyPlanOptions[0]);
    }
  }, [
    isOpen,
    academyOptions,
    selectedAcademyOption,
    selectedPlanOption,
    academyPlanOptions,
  ]);

  // Prefetch provisioning vendors by academy and expose the selected academy cache/error.
  useEffect(() => {
    if (!isOpen || !selectedConsumable?.academyId) {
      setSelectedProvisioningVendor(null);
      setLoadingProvisioningVendors(false);
      return undefined;
    }
    const selectedAcademyId = selectedConsumable.academyId;
    const academyIds = [...new Set(vpsConsumableOptions.map((opt) => opt?.academyId).filter((id) => id != null))];
    const hasPrefetchedAll = academyIds.every((academyId) => {
      const key = String(academyId);
      return Array.isArray(provisioningByAcademyId[key]) || Boolean(provisioningErrorByAcademyId[key]);
    });

    if (hasPrefetchedAll) {
      const selectedKey = String(selectedAcademyId);
      const selectedError = provisioningErrorByAcademyId[selectedKey] || '';
      const selectedList = provisioningByAcademyId[selectedKey] ?? [];
      if (!selectedError && selectedList.length === 1) setSelectedProvisioningVendor(selectedList[0]);
      setLoadingProvisioningVendors(false);
      return undefined;
    }

    let cancelled = false;
    setLoadingProvisioningVendors(true);
    setSelectedProvisioningVendor(null);

    const prefetchProvisioningAcademies = async () => {
      try {
        const responses = await Promise.all(
          academyIds.map((academyId) => bc.provisioning().getProvisioningAcademies(academyId)),
        );
        if (cancelled) return;
        const provisioningVendorsByAcademyId = {};
        const errorByAcademy = {};
        responses.forEach((res, idx) => {
          const academyId = academyIds[idx];
          const key = String(academyId);
          if (res?.status >= 200 && res?.status < 300) {
            const list = Array.isArray(res.data) ? res.data : [];
            provisioningVendorsByAcademyId[key] = list.filter(
              (row) => row?.vendor?.vendor_type === VPS_SERVER_CONSUMER,
            );
          } else {
            provisioningVendorsByAcademyId[key] = [];
            errorByAcademy[key] = getProvisioningErrorMessage(res, t('vps.modal.load-providers-error'));
          }
        });
        setProvisioningByAcademyId(provisioningVendorsByAcademyId);
        setProvisioningErrorByAcademyId(errorByAcademy);
        const selectedKey = String(selectedAcademyId);
        const selectedError = errorByAcademy[selectedKey] || '';
        const selectedList = provisioningVendorsByAcademyId[selectedKey] ?? [];
        if (!selectedError && selectedList.length === 1) setSelectedProvisioningVendor(selectedList[0]);
      } catch (err) {
        if (!cancelled) {
          const fallbackError = getProvisioningErrorMessage(err?.response ?? err, t('vps.modal.load-providers-error'));
          const errorByAcademy = {};
          academyIds.forEach((academyId) => {
            errorByAcademy[String(academyId)] = fallbackError;
          });
          setProvisioningByAcademyId({});
          setProvisioningErrorByAcademyId(errorByAcademy);
        }
      } finally {
        if (!cancelled) setLoadingProvisioningVendors(false);
      }
    };

    prefetchProvisioningAcademies();
    return () => { cancelled = true; };
  }, [
    isOpen,
    selectedPlanOption?.value,
    selectedConsumable?.academyId,
    vpsConsumableOptions,
    provisioningByAcademyId,
    provisioningErrorByAcademyId,
    t,
  ]);

  // Load vendor dynamic options only when user reaches the options step.
  useEffect(() => {
    if (!isOpen || requestStep !== 'options' || !selectedProvisioningVendor?.id || !selectedProvisioningAcademyId) {
      setVendorOptionsPayload(null);
      setLoadingVendorOptions(false);
      setLoadVendorOptionsError('');
      setSelectedVendorSelections({});
      return undefined;
    }
    let cancelled = false;
    const fetchVendorOptions = async () => {
      try {
        setLoadingVendorOptions(true);
        setLoadVendorOptionsError('');
        const res = await bc.provisioning().getProvisioningVendorOptions(
          selectedProvisioningVendor.id,
          selectedProvisioningAcademyId,
        );
        if (cancelled) return;
        if (!(res?.status >= 200 && res?.status < 300)) {
          setVendorOptionsPayload(null);
          setLoadVendorOptionsError(getProvisioningErrorMessage(res, t('vps.modal.load-options-error')));
          return;
        }
        setVendorOptionsPayload(res?.data || {});
      } catch (err) {
        if (!cancelled) {
          setVendorOptionsPayload(null);
          setLoadVendorOptionsError(getProvisioningErrorMessage(err?.response ?? err, t('vps.modal.load-options-error')));
        }
      } finally {
        if (!cancelled) setLoadingVendorOptions(false);
      }
    };
    fetchVendorOptions();
    return () => { cancelled = true; };
  }, [
    isOpen,
    requestStep,
    selectedProvisioningVendor?.id,
    selectedProvisioningAcademyId,
    t,
  ]);

  const handleSelectProvisioningVendor = useCallback((row) => {
    if (!row?.id) return;
    setSelectedProvisioningVendor(row);
    setRequestStep('options');
    setSelectedVendorSelections({});
  }, []);

  const handleSubmitVpsRequest = useCallback(async () => {
    if (!selectedConsumable?.consumableId || !selectedProvisioningAcademyId || !selectedProvisioningVendor?.id) {
      createToast({ title: t('vps.modal.missing-selection'), status: 'error' });
      return;
    }
    if (!isVendorSelectionComplete) {
      createToast({ title: t('vps.modal.missing-selection'), status: 'error' });
      return;
    }
    const vendorSelection = {};
    (selectedProvisioningVendor?.vendor?.settings_schema?.fields || []).forEach((field) => {
      const normalizedOptions = getNormalizedVendorFieldOptions(
        field,
        vendorOptionsPayload,
        selectedProvisioningVendor?.vendor_settings,
      );
      if (normalizedOptions.length === 0) return;
      const selectionKey = field?.selection_key;
      if (!selectionKey) return;
      const value = selectedVendorSelections?.[selectionKey];
      if (value != null && String(value).trim() !== '') vendorSelection[selectionKey] = value;
    });
    const payload = {
      consumable_id: selectedConsumable.consumableId,
      provisioning_academy: selectedProvisioningVendor.id,
      vendor_selection: vendorSelection,
      ...(selectedConsumable?.planSlug ? { plan_slug: selectedConsumable.planSlug } : {}),
    };
    try {
      setSubmittingVpsRequest(true);
      const res = await bc.provisioning().requestMyVPS(payload);
      if (!(res?.status >= 200 && res?.status < 300)) {
        createToast({ title: getProvisioningErrorMessage(res, t('vps.load-error')), status: 'error' });
        return;
      }
      createToast({ title: t('vps.request-success'), status: 'success' });
      closeModal();
      onSuccess();
    } catch (err) {
      createToast({ title: getProvisioningErrorMessage(err?.response ?? err, t('vps.load-error')), status: 'error' });
    } finally {
      setSubmittingVpsRequest(false);
    }
  }, [
    selectedConsumable,
    selectedProvisioningAcademyId,
    selectedProvisioningVendor,
    isVendorSelectionComplete,
    vendorOptionsPayload,
    selectedVendorSelections,
    createToast,
    t,
    closeModal,
    onSuccess,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          textAlign="center"
          textTransform="uppercase"
          borderBottom="1px solid"
          borderColor={borderColor2}
        >
          {t('vps.modal.title')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" gridGap="12px" py="16px">
          {requestStep === 'provider' && (
            <Text size="sm" color="gray.600">{t('vps.modal.description')}</Text>
          )}

          {(subsState.isLoading || loadingVpsConsumables) && (
            <Text size="sm" color="gray.600">{t('vps.modal.loading-plans')}</Text>
          )}

          {!subsState.isLoading && !loadingVpsConsumables && academyOptions.length === 0 && (
            <Text size="sm" color="gray.500">{t('vps.modal.no-academies')}</Text>
          )}

          {requestStep === 'provider' && academyOptions.length > 1 && (
            <Box>
              <Text size="md" fontWeight="600" mb="6px">{t('vps.modal.academy-label')}</Text>
              <Select
                id="vps-academy-select"
                fontWeight="500"
                fontSize="15px"
                value={selectedAcademyOption}
                options={academyOptions}
                placeholder={t('vps.modal.academy-label')}
                onChange={(opt) => {
                  setSelectedAcademyOption(opt);
                  setSelectedPlanOption(null);
                  setSelectedProvisioningVendor(null);
                  setRequestStep('provider');
                }}
              />
            </Box>
          )}

          {requestStep === 'provider' && academyOptions.length === 1 && (
            <Box>
              <Text size="md" fontWeight="600" mb="6px">{t('vps.modal.academy-label')}</Text>
              <Input value={academyOptions[0]?.label || '—'} isReadOnly />
            </Box>
          )}

          {requestStep === 'provider' && selectedAcademyOption != null && academyPlanOptions.length > 1 && (
            <Box>
              <Text size="md" fontWeight="600" mb="6px">{t('vps.modal.plan-label')}</Text>
              <Select
                id="vps-plan-select"
                fontWeight="500"
                fontSize="15px"
                value={selectedPlanOption}
                options={academyPlanOptions}
                placeholder={t('vps.modal.plan-label')}
                onChange={(opt) => {
                  setSelectedPlanOption(opt);
                  setSelectedProvisioningVendor(null);
                  setRequestStep('provider');
                }}
              />
            </Box>
          )}

          {requestStep === 'provider' && selectedAcademyOption != null && selectedPlanOption != null && selectedPlanOption.value != null && academyPlanOptions.length > 0 && (
            <Box mt="8px">
              {loadingProvisioningVendors && (
                <Text size="sm" color="gray.600">{t('vps.modal.loading-providers')}</Text>
              )}
              {!loadingProvisioningVendors && currentLoadProvidersError && (
                <Text size="sm" color="red.500">{currentLoadProvidersError}</Text>
              )}
              {!loadingProvisioningVendors && !currentLoadProvidersError && currentProvisioningList.length === 0 && (
                <Text size="sm" color="gray.500">{t('vps.modal.no-providers')}</Text>
              )}
              {!loadingProvisioningVendors && !currentLoadProvidersError && currentProvisioningList.length > 0 && (
                <Box>
                  <Text size="md" fontWeight="600" mb="10px">{t('vps.modal.select-provider-heading')}</Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} width="100%">
                    {currentProvisioningList.map((row, idx) => {
                      const vendorCardBackground = idx % 2 === 1 ? 'blue.light' : backgroundColor3;
                      return (
                        <Box
                          key={String(row.id)}
                          as="button"
                          type="button"
                          width="100%"
                          textAlign="left"
                          p="16px"
                          borderRadius="12px"
                          borderWidth="2px"
                          borderStyle="solid"
                          backgroundColor={vendorCardBackground}
                          cursor="pointer"
                          transition="all 0.18s ease"
                          _hover={{
                            filter: 'brightness(0.97)',
                            borderColor: 'blue.default',
                          }}
                          _active={{ filter: 'brightness(0.94)' }}
                          onClick={() => handleSelectProvisioningVendor(row)}
                        >
                          <Flex alignItems="flex-start" gap="12px">
                            <Box
                              minWidth="40px"
                              minHeight="40px"
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              backgroundColor="blue.light"
                              borderRadius="full"
                              flexShrink={0}
                            >
                              <Icon icon="globe" width="20px" height="20px" />
                            </Box>
                            <Box minWidth={0} flex="1">
                              <Text fontSize="md" fontWeight="700" lineHeight="short">
                                {row.vendor.name}
                              </Text>
                              <Text fontSize="sm" color="gray.600" mt="4px">
                                {t('vps.modal.vendor-card-subtitle')}
                              </Text>
                            </Box>
                          </Flex>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Box>
              )}
            </Box>
          )}

          {requestStep === 'options' && selectedProvisioningVendor != null && (
            <Box mt="8px">
              <Text size="md" fontWeight="600" mb="10px">
                {t('vps.modal.configure-provider', { provider: selectedProvisioningVendor?.vendor?.name || '—' })}
              </Text>
              {loadingVendorOptions && (
                <Text size="sm" color="gray.600">{t('vps.modal.loading-options')}</Text>
              )}
              {!loadingVendorOptions && loadVendorOptionsError && (
                <Text size="sm" color="red.500">{loadVendorOptionsError}</Text>
              )}
              {!loadingVendorOptions && !loadVendorOptionsError && (selectedProvisioningVendor?.vendor?.settings_schema?.fields || []).length === 0 && (
                <Text size="sm" color="gray.500">{t('vps.modal.no-options-schema')}</Text>
              )}
              {!loadingVendorOptions && !loadVendorOptionsError && (selectedProvisioningVendor?.vendor?.settings_schema?.fields || []).length > 0 && (
                <Box display="flex" flexDirection="column" gridGap="12px">
                  {(selectedProvisioningVendor?.vendor?.settings_schema?.fields || [])
                    .map((field) => {
                      const normalizedOptions = getNormalizedVendorFieldOptions(
                        field,
                        vendorOptionsPayload,
                        selectedProvisioningVendor?.vendor_settings,
                      );
                      return normalizedOptions.length > 0 ? { field, normalizedOptions } : null;
                    })
                    .filter(Boolean)
                    .map(({ field, normalizedOptions }) => {
                      const selectionKey = field?.selection_key;
                      const value = selectedVendorSelections?.[selectionKey];
                      const selectedOption = normalizedOptions.find((opt) => opt.value === value) || null;
                      const fieldLabel = lang === 'es' ? field?.label_es : field?.label_en;
                      const showMetaInfoOnPills = normalizedOptions.some((o) => Object.values(o.metaInfo || {}).some(Boolean));

                      return (
                        <Box
                          key={selectionKey}
                          border="1px solid"
                          borderColor={borderColor2}
                          borderRadius="17px"
                          p="14px"
                          backgroundColor="white"
                        >
                          <Flex alignItems="center" gap="10px" mb="10px">
                            <Box
                              flexShrink={0}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              width="36px"
                              height="36px"
                              borderRadius="full"
                              backgroundColor="blue.light"
                            >
                              <Icon icon="content" width="18px" height="18px" />
                            </Box>
                            <Box minWidth={0}>
                              <Text size="md" fontWeight="600" lineHeight="short">
                                {fieldLabel}
                                {field?.required !== false ? ' *' : ''}
                              </Text>
                            </Box>
                          </Flex>
                          <Box
                            maxHeight={{ base: '220px', md: '280px' }}
                            overflowY="auto"
                            pr="2px"
                          >
                            <Flex flexWrap="wrap" gap="8px" alignItems="stretch">
                              {normalizedOptions.map((opt) => {
                                const isSelected = selectedOption?.value === opt.value;
                                return (
                                  <Box
                                    key={`${selectionKey}-${String(opt.value)}`}
                                    as="button"
                                    type="button"
                                    width={opt.specsCard ? 'max-content' : 'fit-content'}
                                    maxW={opt.specsCard ? '100%' : undefined}
                                    textAlign="left"
                                    py={opt.specsCard ? '10px' : '6px'}
                                    px="10px"
                                    borderRadius="8px"
                                    borderStyle="solid"
                                    borderWidth="1px"
                                    borderColor={isSelected ? 'blue.default' : borderColor2}
                                    backgroundColor={isSelected ? 'blue.light' : backgroundColor3}
                                    cursor="pointer"
                                    transition="border-color 0.15s ease, background-color 0.15s ease"
                                    _hover={{
                                      borderColor: 'blue.default',
                                      backgroundColor: 'blue.light',
                                    }}
                                    _active={{ filter: 'brightness(0.97)' }}
                                    onClick={() => {
                                      setSelectedVendorSelections((prev) => ({ ...prev, [selectionKey]: opt.value }));
                                    }}
                                  >
                                    {opt.specsCard ? (
                                      <Flex direction="column" align="stretch" gap="8px" width="100%">
                                        <Flex alignItems="center" gap="10px" width="100%">
                                          <Box
                                            flexShrink={0}
                                            height="14px"
                                            width="14px"
                                            marginTop="4px"
                                            borderRadius="full"
                                            borderWidth="2px"
                                            borderStyle="solid"
                                            borderColor={isSelected ? 'blue.default' : 'gray.400'}
                                            backgroundColor={isSelected ? 'blue.default' : 'transparent'}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            aria-hidden
                                          >
                                            {isSelected ? (
                                              <Box width="4px" height="4px" borderRadius="full" backgroundColor="white" />
                                            ) : null}
                                          </Box>
                                          <Box flex="1" minWidth={0}>
                                            <ChakraText
                                              fontSize="11px"
                                              color="gray.500"
                                              fontFamily="mono"
                                              lineHeight="short"
                                              mb="2px"
                                              textAlign="left"
                                            >
                                              {`#${opt.specsCard.id}`}
                                            </ChakraText>
                                            <Text
                                              fontSize="14px"
                                              fontWeight="700"
                                              lineHeight="short"
                                              textAlign="left"
                                              noOfLines={2}
                                            >
                                              {opt.specsCard.name}
                                            </Text>
                                            {Object.values(opt.metaInfo || {}).some(Boolean) ? (
                                              <ChakraText
                                                fontSize="11px"
                                                fontWeight="500"
                                                color="gray.500"
                                                lineHeight="short"
                                                textAlign="left"
                                                noOfLines={1}
                                              >
                                                {Object.values(opt.metaInfo || {}).filter(Boolean).join(' · ')}
                                              </ChakraText>
                                            ) : null}
                                          </Box>
                                        </Flex>
                                        <Flex alignItems="stretch" justifyContent="space-between" gap="6px" width="100%">
                                          <Box textAlign="center" flex="1" minW={0}>
                                            <ChakraText fontSize="10px" fontWeight="500" color="gray.700" textTransform="uppercase" lineHeight="short">
                                              {t('vps.modal.specs.cpu')}
                                            </ChakraText>
                                            <ChakraText fontSize="13px" fontWeight="700" color="gray.700" textAlign="center" whiteSpace="nowrap">
                                              {formatSpecsCpuLine(opt.specsCard.cpus)}
                                            </ChakraText>
                                          </Box>
                                          <Box textAlign="center" flex="1" minW={0}>
                                            <ChakraText fontSize="10px" fontWeight="500" color="gray.700" textTransform="uppercase" lineHeight="short">
                                              {t('vps.modal.specs.ram')}
                                            </ChakraText>
                                            <ChakraText fontSize="13px" fontWeight="700" color="gray.700" textAlign="center" whiteSpace="nowrap">
                                              {formatSpecsGbFromMbString(opt.specsCard.memory)}
                                            </ChakraText>
                                          </Box>
                                          <Box textAlign="center" flex="1" minW={0}>
                                            <ChakraText fontSize="10px" fontWeight="500" color="gray.700" textTransform="uppercase" lineHeight="short">
                                              {t('vps.modal.specs.disk')}
                                            </ChakraText>
                                            <ChakraText fontSize="13px" fontWeight="700" color="gray.700" textAlign="center" whiteSpace="nowrap">
                                              {formatSpecsDiskForDisplay(opt.specsCard.diskSpace, opt.specsCard.diskUnitHint)}
                                            </ChakraText>
                                          </Box>
                                        </Flex>
                                      </Flex>
                                    ) : (
                                      <Flex
                                        alignItems="flex-start"
                                        gap="10px"
                                        flexWrap="wrap"
                                        rowGap="6px"
                                        justifyContent="space-between"
                                        width="100%"
                                      >
                                        <Flex alignItems="center" gap="8px" minWidth={0} flex="1">
                                          <Box
                                            flexShrink={0}
                                            height="14px"
                                            width="14px"
                                            marginTop="2px"
                                            borderRadius="full"
                                            borderWidth="2px"
                                            borderStyle="solid"
                                            borderColor={isSelected ? 'blue.default' : 'gray.400'}
                                            backgroundColor={isSelected ? 'blue.default' : 'transparent'}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            aria-hidden
                                          >
                                            {isSelected ? (
                                              <Box width="4px" height="4px" borderRadius="full" backgroundColor="white" />
                                            ) : null}
                                          </Box>
                                          <Text
                                            fontSize="14px"
                                            fontWeight="600"
                                            lineHeight="short"
                                            textAlign="left"
                                            noOfLines={2}
                                          >
                                            {opt.label}
                                          </Text>
                                        </Flex>
                                        {showMetaInfoOnPills && Object.values(opt.metaInfo || {}).some(Boolean) ? (
                                          <ChakraText
                                            as="span"
                                            fontSize="12px"
                                            fontWeight="500"
                                            color="gray.600"
                                            opacity={0.65}
                                            flexShrink={0}
                                            whiteSpace="nowrap"
                                          >
                                            {Object.values(opt.metaInfo || {}).filter(Boolean).join(' · ')}
                                          </ChakraText>
                                        ) : null}
                                      </Flex>
                                    )}
                                  </Box>
                                );
                              })}
                            </Flex>
                          </Box>
                        </Box>
                      );
                    })}
                </Box>
              )}
            </Box>
          )}
        </ModalBody>
        <ModalFooter display="flex" gridGap="12px" justifyContent="center">
          {requestStep === 'options' && (
            <Button
              variant="outline"
              color="blue.default"
              borderColor="blue.default"
              textTransform="uppercase"
              fontSize="13px"
              onClick={() => {
                setRequestStep('provider');
                setVendorOptionsPayload(null);
                setSelectedVendorSelections({});
                setLoadVendorOptionsError('');
              }}
            >
              {t('vps.modal.back')}
            </Button>
          )}
          <Button
            variant="outline"
            color="blue.default"
            borderColor="blue.default"
            textTransform="uppercase"
            fontSize="13px"
            onClick={closeModal}
          >
            {t('vps.modal.cancel')}
          </Button>
          <Button
            variant="default"
            backgroundColor="blue.default"
            color="white"
            textTransform="uppercase"
            fontSize="13px"
            isLoading={submittingVpsRequest}
            isDisabled={
              requestStep !== 'options'
              || loadingVendorOptions
              || Boolean(loadVendorOptionsError)
              || !isVendorSelectionComplete
            }
            onClick={handleSubmitVpsRequest}
          >
            {t('vps.modal.confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

VPSRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default VPSRequestModal;
