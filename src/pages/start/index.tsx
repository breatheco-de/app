import {
  Box, Input, Button, Container, Text, InputGroup, InputRightElement, useColorModeValue, Skeleton,
} from '@chakra-ui/react';
import React, { useState, useEffect, lazy, Suspense, useCallback, FC, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';
import bc from '../../common/services/breathecode';
import useAuth from '../../common/hooks/useAuth';
import useCustomToast from '../../common/hooks/useCustomToast';

interface Asset {
  status_code?: number;
  [key: string]: any;
}

interface Vendor {
  name?: string;
  [key: string]: any;
}

interface ProvisioningVendor {
  vendor?: Vendor;
  [key: string]: any;
}

interface Cohort {
  academy?: { id?: number };
  [key: string]: any;
}

interface User {
  id?: number;
  [key: string]: any;
}

const ModalToCloneProject = lazy(() => import('../../common/components/GuidedExperience/ModalToCloneProject'));

const StartPage: FC = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState<string>('');
  const [assetData, setAssetData] = useState<Asset | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [provisioningVendors, setProvisioningVendors] = useState<ProvisioningVendor[]>([]);

  const router = useRouter();
  const { asset } = router.query; // asset can be string | string[] | undefined
  const { hexColor } = useStyle();
  const { user, isAuthenticated, cohorts } = useAuth() as any;
  const { createToast } = useCustomToast({ toastId: 'start-page-toast' });

  const fetchVendorsForUser = useCallback(async (): Promise<ProvisioningVendor[]> => {
    if (!isAuthenticated || !cohorts || cohorts.length === 0) {
      return [];
    }
    let foundVendors: ProvisioningVendor[] = [];
    let found = false;

    await (cohorts as Cohort[]).reduce(async (previousPromise, cohort: Cohort) => {
      await previousPromise;
      if (found || foundVendors.length > 0) return;
      if (cohort.academy?.id) {
        try {
          const academyId = cohort.academy.id;
          const { data } = await bc.provisioning().academyVendors(academyId);
          console.log('data', data);
          if (data && data.length > 0) {
            foundVendors = data as ProvisioningVendor[];
            found = true;
          }
        } catch (e: unknown) {
          console.error('Error fetching vendor data:', e);
        }
      }
    }, Promise.resolve());
    return foundVendors;
  }, [isAuthenticated, cohorts]);

  const fetchAssetAndVendors = useCallback(async (assetSlug: string) => {
    setIsLoading(true);
    setAssetData(null);
    setProvisioningVendors([]);
    setShowModal(false);
    try {
      const assetResp = await bc.lesson().getAsset(assetSlug);
      const fetchedAsset: Asset | undefined = assetResp?.data;

      if (!fetchedAsset) {
        throw new Error(`Project slug '${assetSlug}' not found or is invalid (no data).`);
      }
      if (typeof fetchedAsset.status_code === 'number' && fetchedAsset.status_code >= 400) {
        throw new Error(`Project slug '${assetSlug}' returned status ${fetchedAsset.status_code}.`);
      }

      setAssetData(fetchedAsset);
      const vendors = await fetchVendorsForUser();
      setProvisioningVendors(vendors);
      setShowModal(true);
    } catch (err: unknown) {
      console.error('Error fetching asset data:', err);
      const message = err instanceof Error ? err.message : 'Failed to load project data.';
      createToast({
        status: 'error',
        title: 'Error Loading Project',
        description: message,
      });
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
      setSearchInput(assetSlug);
      fetchAssetAndVendors(assetSlug);
    } else {
      setSearchInput('');
    }
  }, [asset, fetchAssetAndVendors]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const input = searchInput.trim();
    if (!input) return;

    setIsLoading(true);
    setShowModal(false);
    setAssetData(null);

    router.push(`/start?asset=${encodeURIComponent(input)}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/start', undefined, { shallow: true });
  };

  const headingColor = useColorModeValue('black', 'white');

  const shouldRenderModal = showModal && !isLoading && assetData;

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Container maxW="container.md" py={10} flex="1" display="flex" flexDirection="column" alignItems="center">

        <Box width="100%" display="flex" flexDirection="column" alignItems="center" mb={8}>
          <Box mb={8}>
            <Icon
              icon="4GeeksIcon"
              width="196px"
              height="42px"
              color={hexColor.blueDefault}
            />
          </Box>
          <Text fontSize="2xl" fontWeight="bold" mb={6} color={headingColor} textAlign="center">
            {t('common:start-working-project')}
          </Text>
          <Box as="form" onSubmit={handleSearch} width="100%" maxW="600px">
            <InputGroup size="lg">
              <Input
                placeholder={t('common:start-placeholder')}
                value={searchInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                borderColor={hexColor.borderColor}
                _hover={{ borderColor: hexColor.blueDefault }}
                _focus={{ borderColor: hexColor.blueDefault, boxShadow: `0 0 0 1px ${hexColor.blueDefault}` }}
                borderRadius="md"
                height="60px"
                fontSize="md"
              />
              <InputRightElement width="5.5rem" height="60px">
                <Button
                  h="40px"
                  type="submit"
                  bg={hexColor.blueDefault}
                  color="white"
                  _hover={{ bg: 'blue.600' }}
                  mr={1}
                  isLoading={isLoading}
                >
                  {t('common:search')}
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>
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
};

export default StartPage; 