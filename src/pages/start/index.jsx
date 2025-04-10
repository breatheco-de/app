import {
  Box, Container, Text, useColorModeValue, Skeleton,
} from '@chakra-ui/react';
import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';
import bc from '../../common/services/breathecode';
import useAuth from '../../common/hooks/useAuth';
import useCustomToast from '../../common/hooks/useCustomToast';
import MktSearchBar from '../../common/components/MktSearchBar';

const ModalToCloneProject = lazy(() => import('../../common/components/GuidedExperience/ModalToCloneProject'));

export default function StartPage() {
  const { t } = useTranslation();
  const [assetData, setAssetData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [provisioningVendors, setProvisioningVendors] = useState([]);

  const router = useRouter();
  const { asset } = router.query;
  const { hexColor } = useStyle();
  const { user, isAuthenticated, cohorts } = useAuth();
  const { createToast } = useCustomToast({ toastId: 'start-page-toast' });

  const fetchVendorsForUser = useCallback(async () => {
    if (!isAuthenticated || !cohorts || cohorts.length === 0) {
      return [];
    }
    let foundVendors = [];
    let found = false;
    await cohorts.reduce(async (previousPromise, cohort) => {
      await previousPromise;
      if (found || foundVendors.length > 0) return;
      if (cohort.academy?.id) {
        try {
          const academyId = cohort.academy.id;
          const { data } = await bc.provisioning().academyVendors(academyId);
          if (data && data.length > 0) {
            foundVendors = data;
            found = true;
          }
        } catch (e) {
          console.error('Error fetching vendor data:', e);
        }
      }
    }, Promise.resolve());
    return foundVendors;
  }, [isAuthenticated, cohorts]);

  const fetchAssetAndVendors = useCallback(async (assetSlug) => {
    setIsLoading(true);
    setAssetData(null);
    setProvisioningVendors([]);
    setShowModal(false);
    try {
      const assetResp = await bc.lesson().getAsset(assetSlug);
      const fetchedAsset = assetResp?.data;

      if (!fetchedAsset) {
        throw new Error(`Project slug '${assetSlug}' not found or is invalid (no data).`);
      }
      if (fetchedAsset.status_code && fetchedAsset.status_code >= 400) {
        throw new Error(`Project slug '${assetSlug}' returned status ${fetchedAsset.status_code}.`);
      }

      setAssetData(fetchedAsset);
      const vendors = await fetchVendorsForUser();
      setProvisioningVendors(vendors);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching asset data:', err);
      const message = err instanceof Error ? err.message : 'Failed to load project data.';
      createToast({
        status: 'error',
        title: 'Error Loading Project',
        description: message,
      });
      setAssetData(null);
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchVendorsForUser]);

  useEffect(() => {
    setIsLoading(false);
    setShowModal(false);
    setAssetData(null);
    setProvisioningVendors([]);

    if (asset) {
      const assetSlug = Array.isArray(asset) ? asset[0] : asset;
      fetchAssetAndVendors(assetSlug);
    }
  }, [asset]);

  const handleCloseModal = () => {
    setShowModal(false);
    const currentQuery = new URLSearchParams(router.query);
    currentQuery.delete('asset');
    const queryString = currentQuery.toString();
    router.replace(`${router.pathname}${queryString ? `?${queryString}` : ''}`, undefined, { shallow: true });
  };

  const headingColor = useColorModeValue('black', 'white');

  const shouldRenderModal = showModal && !isLoading && assetData;

  const popularSearches = ['node-api-tutorial'];

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Container maxW="container.md" py={10} flex="1" display="flex" flexDirection="column" alignItems="center">

        <Box width="100%" display="flex" flexDirection="column" alignItems="center">
          <Box>
            <Icon
              icon="4GeeksIcon"
              width="196px"
              height="42px"
              color={hexColor.blueDefault}
            />
          </Box>
          <Text fontSize="2xl" fontWeight="bold" color={headingColor} textAlign="center">
            {t('common:start-working-project')}
          </Text>
          <MktSearchBar
            id="start-asset-search"
            placeholder={t('common:start-placeholder')}
            popularSearches={popularSearches}
            popularSearchesTitle={t('common:popular-searches')}
            width="100%"
            padding="0"
            searchOn="submit"
            queryParamKey="asset"
          />
        </Box>

        {isLoading && (
          <Box width="100%" maxW="600px" mt={4}>
            <Skeleton height="60px" borderRadius="md" />
            <Skeleton height="20px" mt={4} width="80%" />
            <Skeleton height="20px" mt={2} width="60%" />
          </Box>
        )}

        {shouldRenderModal && (
          <Suspense fallback={<Skeleton height="400px" width="100%" mt={4} borderRadius="md" />}>
            <ModalToCloneProject
              currentAsset={assetData}
              isOpen={showModal}
              onClose={handleCloseModal}
              provisioningVendors={provisioningVendors}
              publicView
              userID={user?.id}
            />
          </Suspense>
        )}

      </Container>
    </Box>
  );
}
