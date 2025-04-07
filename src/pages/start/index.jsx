import {
  Box, Input, Button, Container, Text, InputGroup, InputRightElement,
  Link as ChakraLink, useColorModeValue, Skeleton, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton,
} from '@chakra-ui/react';
import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';
import bc from '../../common/services/breathecode';
import useAuth from '../../common/hooks/useAuth';

const ModalToCloneProject = lazy(() => import('../../js_modules/syllabus/ModalToCloneProject'));

export default function StartPage() {
  const [searchInput, setSearchInput] = useState('');
  const [assetData, setAssetData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [provisioningVendors, setProvisioningVendors] = useState([]);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { asset, repo } = router.query;
  const { hexColor } = useStyle();
  const { user, isAuthenticated, cohorts } = useAuth();

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
          const { data } = await bc.provisioning().vendors({ academy: cohort.academy.id });
          if (data && data.length > 0) {
            foundVendors = data;
            found = true;
          }
        } catch (e) {
          console.error(`Error fetching vendors for academy ${cohort.academy.id}:`, e);
        }
      }
    }, Promise.resolve());
    return foundVendors;
  }, [isAuthenticated, cohorts]);

  const fetchAssetAndVendors = useCallback(async (assetSlug) => {
    setIsLoading(true);
    setError(null);
    setAssetData(null);
    setProvisioningVendors([]);
    setShowModal(false);
    try {
      const assetResp = await bc.lesson().getAsset(assetSlug);
      const fetchedAsset = assetResp?.data;
      if (!fetchedAsset) {
        throw new Error(`Asset '${assetSlug}' not found.`);
      }
      setAssetData(fetchedAsset);
      const vendors = await fetchVendorsForUser();
      setProvisioningVendors(vendors);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching asset data:', err);
      setError(err.message || 'Failed to load asset data.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchVendorsForUser]);

  useEffect(() => {
    setIsLoading(false);
    setError(null);
    setShowModal(false);
    setAssetData(null);
    setProvisioningVendors([]);

    if (asset) {
      setSearchInput(asset);
      fetchAssetAndVendors(asset);
    } else if (repo) {
      setSearchInput(repo);
      setShowModal(true);
    } else {
      setSearchInput('');
    }
  }, [asset, repo, fetchAssetAndVendors]);

  const handleSearch = (e) => {
    e.preventDefault();
    const input = searchInput.trim();
    if (!input) return;

    setError(null);
    setIsLoading(false);
    setShowModal(false);
    setAssetData(null);

    if (input.includes('github.com') || (input.includes('/') && input.split('/').length === 2)) {
      router.push(`/start?repo=${encodeURIComponent(input)}`);
    } else {
      router.push(`/start?asset=${encodeURIComponent(input)}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/start', undefined, { shallow: true });
  };

  const headingColor = useColorModeValue('black', 'white');

  const shouldRenderModal = showModal && !isLoading && !error && (assetData || repo);

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Head>
        <title>Start Coding Project | 4Geeks</title>
      </Head>

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
            Start working on your project
          </Text>
          <Box as="form" onSubmit={handleSearch} width="100%" maxW="600px">
            <InputGroup size="lg">
              <Input
                placeholder="Enter asset slug or repository URL/path"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
                  Search
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

        {error && !isLoading && (
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            mt={4}
            borderRadius="md"
            width="100%"
            maxW="600px"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Error
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {error}
            </AlertDescription>
            <CloseButton alignSelf="flex-start" position="relative" right={-1} top={-1} onClick={() => { setError(null); router.push('/start', undefined, { shallow: true }); }} />
          </Alert>
        )}

        {shouldRenderModal && (
          <Suspense fallback={<Box mt={4}>Loading Modal...</Box>}>
            <ModalToCloneProject
              {...(asset ? { currentAsset: assetData } : {})}
              {...(repo ? { repoPath: repo } : {})}
              isOpen={showModal}
              onClose={handleCloseModal}
              provisioningVendors={assetData ? provisioningVendors : []}
              publicView
              userID={user?.id}
            />
          </Suspense>
        )}

      </Container>

      <Box as="footer" width="100%" py={4} textAlign="center" borderTopWidth="1px" borderColor={hexColor.borderColor}>
        <Text fontSize="sm" color={hexColor.fontColor3}>
          Have a question?
          {' '}
          <ChakraLink href="mailto:info@4geeks.com" color={hexColor.blueDefault}>
            info@4geeks.com
          </ChakraLink>
        </Text>
        <Text fontSize="xs" color={hexColor.fontColor3} mt={1}>
          All rights reserved 4Geeks LLC
          {' '}
          {new Date().getFullYear()}
        </Text>
      </Box>
    </Box>
  );
}
