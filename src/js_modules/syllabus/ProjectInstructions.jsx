/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Skeleton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import noLearnpackAssets from '../../../public/no-learnpack-in-cloud.json';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useModuleHandler from '../../common/hooks/useModuleHandler';
import bc from '../../common/services/breathecode';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import useAuth from '../../common/hooks/useAuth';

const ModalToCloneProject = lazy(() => import('./ModalToCloneProject'));

export function ButtonsHandler({ currentAsset, setShowCloneModal, handleStartLearnpack, isForOpenLocaly, learnpackUrlFromPublicView, startWithLearnpack, openWithLearnpackNoSaas, variant, isStarted, publicView, ...rest }) {
  const { t } = useTranslation('common');
  const { cohorts } = useAuth();

  const isExternalExercise = currentAsset.external && currentAsset.asset_type === 'EXERCISE';
  const noSaaSCohortsAvailable = cohorts.some((c) => c?.available_as_saas === false) && publicView;

  //____USED ONLY ON PUBLIC VIEWS____
  if (learnpackUrlFromPublicView && !noSaaSCohortsAvailable) {
    return (
      <Button
        cursor="pointer"
        as="a"
        href={currentAsset?.learnpack_deploy_url}
        target="_blank"
        size="sm"
        width={variant === 'extra-small' && '100%'}
        padding="4px 8px"
        fontSize="14px"
        fontWeight="bold"
        background={variant !== 'extra-small' ? 'gray.200' : 'blue.default'}
        style={variant === 'extra-small' ? { color: 'white', textDecoration: 'none' } : { textDecoration: 'none' }}
        _hover="none"
        _active="none"
        {...rest}
      >
        {publicView
          ? t('common:learnpack.start-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) }).toUpperCase()
          : t('common:learnpack.start-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) })}
      </Button>
    );
  }

  //___USED ON PRIVATE VIEWS NO SAAS___
  if ((isExternalExercise && !startWithLearnpack) || (isExternalExercise && noSaaSCohortsAvailable)) {
    return (
      <Button
        cursor="pointer"
        as="a"
        href={openWithLearnpackNoSaas ? currentAsset?.learnpack_deploy_url : currentAsset.url}
        target="_blank"
        size="sm"
        padding="4px 8px"
        fontSize="14px"
        fontWeight="500"
        color="blue.default"
        background={variant !== 'extra-small' ? 'gray.200' : 'blue.default'}
        style={variant === 'extra-small' ? { color: 'white', textDecoration: 'none' } : { textDecoration: 'none' }}
        _hover="none"
        _active="none"
        {...rest}
      >
        {publicView
          ? t('common:learnpack.start-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) }).toUpperCase()
          : t('common:learnpack.start-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) })}
      </Button>
    );
  }

  //___USED ON PRIVATE VIEWS SAAS___
  return (
    <>
      {startWithLearnpack ? (
        <Button cursor="pointer" as="a" onClick={handleStartLearnpack} size="sm" padding="4px 8px" fontSize="14px" fontWeight="500" background="gray.200" color="blue.default" {...rest}>
          {isStarted ? t('common:learnpack.continue-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) })
            : t('common:learnpack.start-interactive-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) })}
        </Button>
      ) : (
        <Button
          cursor="pointer"
          size="sm"
          padding="4px 8px"
          fontSize="14px"
          fontWeight="500"
          width={variant === 'extra-small' && '100%'}
          background={variant === 'extra-small' ? 'none' : 'gray.200'}
          color={variant === 'extra-small' ? 'white' : 'blue.default'}
          _hover={variant === 'extra-small' && 'none'}
          _active={variant === 'extra-small' && 'none'}
          onClick={() => {
            setShowCloneModal(true);
          }}
          {...rest}
        >
          {publicView
            ? t('common:learnpack.start-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) }).toUpperCase()
            : t('common:learnpack.start-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) })}
        </Button>
      )}
    </>
  );
}

function ProjectInstructions({ currentAsset, variant, handleStartLearnpack, isStarted, publicViewLearnpack, publicView, ...rest }) {
  const { t } = useTranslation('common');
  const { cohorts } = useAuth();
  const { currentTask } = useModuleHandler();
  const { user } = useAuth();
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [vendors, setVendors] = useState([]);
  const noLearnpackIncluded = noLearnpackAssets['no-learnpack'];

  const fetchProvisioningVendors = async (academyId) => {
    try {
      const { data } = await bc.provisioning().academyVendors(academyId);
      return data;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  useEffect(() => {
    const fetchVendors = async () => {
      if (cohortSession && !publicView) {
        const fetchedVendors = await fetchProvisioningVendors(cohortSession.academy.id);
        setVendors(fetchedVendors);
        return;
      }

      const fetchSequentially = async () => {
        let found = false;

        await cohorts.reduce(async (previousPromise, cohort) => {
          await previousPromise;

          if (found || vendors.length > 0) return;

          if (cohort.academy?.id) {
            const data = await fetchProvisioningVendors(cohort.academy.id);
            if (data.length > 0) {
              setVendors(data);
              found = true;
            }
          }
        }, Promise.resolve());
      };

      if (vendors.length === 0) {
        fetchSequentially();
      }
    };

    fetchVendors();
  }, [cohortSession, cohorts]);

  const NoSaasOnPublicView = cohorts.some((c) => c?.available_as_saas === false);
  const isInteractive = currentAsset?.interactive;
  const isExternalExercise = currentAsset?.external && currentAsset?.asset_type === 'EXERCISE';
  const startWithLearnpack = currentAsset?.learnpack_deploy_url && cohortSession?.available_as_saas && !noLearnpackIncluded.includes(currentAsset.slug);
  const openWithLearnpackNoSaas = isExternalExercise && currentAsset?.learnpack_deploy_url && !cohortSession?.available_as_saas;

  const renderModal = () => (
    <Suspense fallback={<Skeleton height="300px" width="100%" />}>
      <ModalToCloneProject
        currentAsset={currentAsset}
        isOpen={showCloneModal}
        onClose={setShowCloneModal}
        provisioningVendors={vendors}
        publicView={publicView}
        userID={user?.id}
      />
    </Suspense>
  );

  if (variant === 'extra-small') {
    return (
      <>
        <Box
          background="blue.default"
          display="inline-flex"
          gap="10px"
          padding="5px"
          borderRadius="8px"
          flexDirection={{
            base: 'column',
            md: 'row',
          }}
        >
          {(startWithLearnpack) && (
            <Icon icon="learnpack" />
          )}
          <ButtonsHandler
            currentAsset={currentAsset}
            handleStartLearnpack={handleStartLearnpack}
            setShowCloneModal={setShowCloneModal}
            startWithLearnpack={startWithLearnpack}
            openWithLearnpackNoSaas={openWithLearnpackNoSaas}
            learnpackUrlFromPublicView={publicViewLearnpack}
            variant={variant}
            publicView={publicView}
          />
        </Box>
        {showCloneModal && renderModal()}
      </>
    );
  }

  if (variant === 'small') {
    return (
      <>
        <Box mt="10px" background="blue.default" padding="8px" borderRadius="8px" display="flex" alignItems="center" gap="10px">
          {(startWithLearnpack) && (
            <Icon icon="learnpack" />
          )}
          <Box>
            <Text color="white" size="md">
              {t('learnpack.choose-open')}
            </Text>
            <Box
              mt="10px"
              display="flex"
              gap="10px"
              flexDirection={{
                base: 'column',
                md: 'row',
              }}
            >
              <ButtonsHandler
                currentAsset={currentAsset}
                handleStartLearnpack={handleStartLearnpack}
                setShowCloneModal={setShowCloneModal}
                startWithLearnpack={startWithLearnpack}
                openWithLearnpackNoSaas={openWithLearnpackNoSaas}
                variant={variant}
                isStarted={isStarted}
              />
            </Box>
          </Box>
        </Box>
        {showCloneModal && renderModal()}
      </>
    );
  }

  return (
    <>
      <Box background="blue.1100" borderRadius="11px" padding="16px" {...rest}>
        <Box display="flex" gap="16px">
          {(!isExternalExercise && isInteractive) && <Icon icon="learnpack" width="102px" height="102px" />}
          <Box>
            <Heading size="xsm" mb="15px" color="white">
              {!isExternalExercise ? t('common:learnpack.title') : t('common:external.title')}
            </Heading>
            <Text
              size="l"
              color="white"
              dangerouslySetInnerHTML={{
                __html: (!isExternalExercise || startWithLearnpack) ? t('common:learnpack.description', { projectName: currentAsset?.title || currentTask?.title })
                  : t('common:external.description', { projectName: currentAsset?.title || currentTask?.title }),
              }}
            />
          </Box>
        </Box>
        <Box
          mt="16px"
          display="flex"
          gap="16px"
          flexDirection={{
            base: 'column',
            md: 'row',
          }}
        >
          <ButtonsHandler
            currentAsset={currentAsset}
            handleStartLearnpack={handleStartLearnpack}
            setShowCloneModal={setShowCloneModal}
            startWithLearnpack={startWithLearnpack}
            openWithLearnpackNoSaas={openWithLearnpackNoSaas}
            variant={variant}
            isStarted={isStarted}
          />
        </Box>
      </Box>
      {showCloneModal && renderModal()}
    </>
  );
}

ProjectInstructions.propTypes = {
  variant: PropTypes.string,
  handleStartLearnpack: PropTypes.func.isRequired,
  isStarted: PropTypes.bool,
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
};
ProjectInstructions.defaultProps = {
  variant: null,
  currentAsset: null,
  isStarted: false,
};

export default ProjectInstructions;
