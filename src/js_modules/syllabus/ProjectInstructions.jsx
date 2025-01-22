/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import noLearnpackAssets from '../../../public/no-learnpack-in-cloud.json';
import { BREATHECODE_HOST } from '../../utils/variables';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useModuleHandler from '../../common/hooks/useModuleHandler';
import bc from '../../common/services/breathecode';
import Heading from '../../common/components/Heading';
import ModalToCloneProject from './ModalToCloneProject';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';

function ProvisioningPopover({ openInLearnpackAction, provisioningLinks }) {
  return (
    <PopoverContent width="min-content">
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader>{openInLearnpackAction.title}</PopoverHeader>
      <PopoverBody display="flex" gridGap="1rem" color="currentColor" flexDirection="column">
        <Text
          size="14px"
          dangerouslySetInnerHTML={{ __html: openInLearnpackAction?.description }}
          style={{ margin: 0 }}
        />
        {provisioningLinks.map((link) => (
          <Button
            key={link.text}
            as="a"
            display="flex"
            href={link.link}
            target={link.isExternalLink ? '_blank' : '_self'}
            marginY="auto"
            margin="0"
            textTransform="uppercase"
            width="100%"
            flexDirection="row"
            gridGap="10px"
            fontSize="12px"
            alignItems="center"
            justifyContent="flex-start"
            style={{
              color: 'currentColor',
            }}
          >
            {link.title}
            <Icon color="currentColor" icon="longArrowRight" />
          </Button>
        ))}
      </PopoverBody>
    </PopoverContent>
  );
}

export function ButtonsHandler({ currentAsset, setShowCloneModal, handleStartLearnpack, isForOpenLocaly, startWithLearnpack, variant, isStarted, ...rest }) {
  const { t } = useTranslation('common');
  const [vendors, setVendors] = useState([]);
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const openInLearnpackAction = t('learnpack.open-in-learnpack-button', {}, { returnObjects: true });

  const fetchProvisioningVendors = async () => {
    try {
      const { data } = await bc.provisioning().academyVendors(cohortSession.academy.id);
      setVendors(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (cohortSession) {
      fetchProvisioningVendors();
    }
  }, [cohortSession]);

  const accessToken = localStorage.getItem('accessToken');

  const provisioningLinks = [{
    title: t('learnpack.new-exercise'),
    link: `${BREATHECODE_HOST}/v1/provisioning/me/container/new?token=${accessToken}&cohort=${cohortSession?.id}&repo=${currentAsset?.url}`,
    isExternalLink: true,
  },
  {
    title: t('learnpack.continue-exercise'),
    link: `${BREATHECODE_HOST}/v1/provisioning/me/workspaces?token=${accessToken}&cohort=${cohortSession?.id}&repo=${currentAsset?.url}`,
    isExternalLink: true,
  }];

  const scrollToMarkdown = () => {
    const markdownBody = document.getElementById('markdown-body');
    markdownBody.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const showProvisioningLinks = vendors?.length > 0 && currentAsset?.gitpod && !cohortSession.available_as_saas;
  const isExternalExercise = currentAsset.external && currentAsset.asset_type === 'EXERCISE';
  const canSeeInstructions = variant !== 'small' || variant !== 'extra-small';

  if (isExternalExercise) {
    return (
      <Button cursor="pointer" as="a" href={currentAsset.url} target="_blank" size="sm" padding="4px 8px" fontSize="14px" fontWeight="500" background="gray.200" color="blue.default" {...rest}>
        {t('common:learnpack.start-exercise')}
      </Button>
    );
  }

  return (
    <>
      {showProvisioningLinks && (
        <Popover>
          <PopoverTrigger>
            <Button cursor="pointer" size="sm" padding="4px 8px" fontSize="14px" fontWeight="500" background="gray.200" color="blue.default">
              {t('learnpack.open-in-learnpack-button.text')}
            </Button>
          </PopoverTrigger>
          <ProvisioningPopover openInLearnpackAction={openInLearnpackAction} provisioningLinks={provisioningLinks} />
        </Popover>
      )}
      {startWithLearnpack ? (
        <Button cursor="pointer" as="a" onClick={handleStartLearnpack} size="sm" padding="4px 8px" fontSize="14px" fontWeight="500" background="gray.200" color="blue.default" {...rest}>
          {isStarted ? t('common:learnpack.continue-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) })
            : t('common:learnpack.start-asset', { asset_type: t(`common:learnpack.asset_types.${currentAsset?.asset_type?.toLowerCase() || ''}`) })}
        </Button>
      ) : (
        <Button
          cursor="pointer"
          size="sm"
          padding="4px 8px"
          fontSize="14px"
          fontWeight="500"
          background={variant === 'extra-small' ? 'none' : 'gray.200'}
          color={variant === 'extra-small' ? 'white' : 'blue.default'}
          _hover={variant === 'extra-small' && 'none'}
          _active={variant === 'extra-small' && 'none'}
          display={!isForOpenLocaly && !canSeeInstructions && 'none'}
          onClick={() => {
            if (isForOpenLocaly) setShowCloneModal(true);
            else scrollToMarkdown();
          }}
          {...rest}
        >
          {t('asset-button.project')}
        </Button>
      )}
    </>
  );
}

function ProjectInstructions({ currentAsset, variant, handleStartLearnpack, isStarted }) {
  const { t } = useTranslation('common');
  const { currentTask } = useModuleHandler();
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [showCloneModal, setShowCloneModal] = useState(false);
  const noLearnpackIncluded = noLearnpackAssets['no-learnpack'];

  const templateUrl = currentAsset?.template_url;
  const isInteractive = currentAsset?.interactive;
  const isForOpenLocaly = isInteractive || templateUrl;
  const learnpackDeployUrl = currentAsset?.learnpack_deploy_url;

  const isExternalExercise = currentAsset?.external && currentAsset?.asset_type === 'EXERCISE';

  const startWithLearnpack = learnpackDeployUrl && cohortSession.available_as_saas && !noLearnpackIncluded.includes(currentAsset.slug);

  if (variant === 'extra-small') {
    return (
      <Box background="blue.default" padding="8px" borderRadius="8px" display={!startWithLearnpack && !isForOpenLocaly ? 'none' : 'flex'} alignItems="center" gap="10px">
        {(!isForOpenLocaly || startWithLearnpack) && (
          <Icon icon="learnpack" />
        )}
        <Box>
          <Box
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
              isForOpenLocaly={isForOpenLocaly}
              startWithLearnpack={startWithLearnpack}
              variant={variant}
            />
          </Box>
        </Box>
        <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
      </Box>
    );
  }

  if (variant === 'small') {
    return (
      <>
        <Box mt="10px" background="blue.default" padding="8px" borderRadius="8px" display="flex" alignItems="center" gap="10px">
          {(!isForOpenLocaly || startWithLearnpack) && (
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
                isForOpenLocaly={isForOpenLocaly}
                startWithLearnpack={startWithLearnpack}
                variant={variant}
                isStarted={isStarted}
              />
            </Box>
          </Box>
        </Box>
        <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
      </>
    );
  }

  return (
    <>
      <Box background="blue.1100" borderRadius="11px" padding="16px">
        <Box display="flex" gap="16px">
          {!isExternalExercise && <Icon icon="learnpack" width="102px" height="102px" />}
          <Box>
            <Heading size="xsm" mb="15px" color="white">
              {!isExternalExercise ? t('common:learnpack.title') : t('common:external.title')}
            </Heading>
            <Text
              size="l"
              color="white"
              dangerouslySetInnerHTML={{
                __html: !isExternalExercise ? t('common:learnpack.description', { projectName: currentAsset?.title || currentTask?.title })
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
            isForOpenLocaly={isForOpenLocaly}
            variant={variant}
            isStarted={isStarted}
          />
        </Box>
      </Box>
      <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
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

ProvisioningPopover.propTypes = {
  openInLearnpackAction: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  provisioningLinks: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default ProjectInstructions;
