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
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useModuleHandler from '../../common/hooks/useModuleHandler';
import bc from '../../common/services/breathecode';
import Heading from '../../common/components/Heading';
import { BREATHECODE_HOST } from '../../utils/variables';
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

function OpenWithLearnpackCTA({ currentAsset, variant }) {
  const { t } = useTranslation('common');
  const [vendors, setVendors] = useState([]);
  const { currentTask } = useModuleHandler();
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [showCloneModal, setShowCloneModal] = useState(false);
  const openInLearnpackAction = t('learnpack.open-in-learnpack-button', {}, { returnObjects: true });

  const accessToken = localStorage.getItem('accessToken');
  const learnpackDeployUrl = currentAsset?.learnpack_deploy_url;

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

  if (variant === 'small') {
    return (
      <>
        <Box mt="10px" background="blue.default" padding="8px" borderRadius="8px" display="flex" alignItems="center" gap="10px">
          <Icon icon="learnpack" />
          <Box>
            <Text color="white" size="md">
              {t('learnpack.choose-open')}
            </Text>
            <Box mt="10px" display="flex" gap="10px" flexDirection={{ base: 'column', md: 'row' }}>
              {vendors.length > 0 && !learnpackDeployUrl && (
                <Popover>
                  <PopoverTrigger>
                    <Button size="sm" padding="4px 8px" fontSize="14px" fontWeight="500" background="gray.200" color="blue.default">
                      {t('learnpack.open-in-learnpack-button.text')}
                    </Button>
                  </PopoverTrigger>
                  <ProvisioningPopover openInLearnpackAction={openInLearnpackAction} provisioningLinks={provisioningLinks} />
                </Popover>
              )}
              {learnpackDeployUrl
                ? (
                  <Button as="a" href={learnpackDeployUrl} target="_blank" size="sm" padding="4px 8px" fontSize="14px" fontWeight="500" background="gray.200" color="blue.default">
                    {t('start-asset', { asset_type: currentAsset.asset_type })}
                  </Button>
                )
                : (
                  <Button size="sm" padding="4px 8px" fontSize="14px" fontWeight="500" background="gray.200" color="blue.default" onClick={() => setShowCloneModal(true)}>
                    {t('learnpack.open-locally')}
                  </Button>
                )}
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
          <Icon icon="learnpack" width="102px" height="102px" />
          <Box>
            <Heading size="xsm" mb="15px" color="white">
              {t('common:learnpack.title')}
            </Heading>
            <Text
              size="l"
              color="white"
              dangerouslySetInnerHTML={{ __html: t('common:learnpack.description', { projectName: currentTask?.title }) }}
            />
          </Box>
        </Box>
        <Box mt="16px" display="flex" gap="16px" flexDirection={{ base: 'column', md: 'row' }}>
          {vendors.length > 0 && !learnpackDeployUrl && (
            <Popover>
              <PopoverTrigger>
                <Button
                  borderRadius="3px"
                  background="white"
                  color="blue.1000"
                  display="flex"
                  gap="16px"
                  alignItems="center"
                  fontSize="17px"
                >
                  <Icon icon="prov-bridge" width="20px" height="20px" />
                  {t('common:learnpack.open-in-learnpack-button.text')}
                </Button>
              </PopoverTrigger>
              <ProvisioningPopover openInLearnpackAction={openInLearnpackAction} provisioningLinks={provisioningLinks} />
            </Popover>
          )}
          {learnpackDeployUrl
            ? (
              <Button
                as="a"
                href={learnpackDeployUrl}
                target="_blank"
                borderRadius="3px"
                background="white"
                color="blue.1000"
                display="flex"
                gap="16px"
                alignItems="center"
                fontSize="17px"
              >
                {t('start-asset', { asset_type: currentAsset.asset_type })}
              </Button>
            )
            : (
              <Button
                variant="outline"
                borderColor="white"
                color="white"
                whiteSpace="normal"
                onClick={() => setShowCloneModal(true)}
                fontSize="17px"
              >
                {t('common:learnpack.open-locally')}
              </Button>
            )}
        </Box>
      </Box>
      <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
    </>
  );
}

OpenWithLearnpackCTA.propTypes = {
  variant: PropTypes.string,
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
};
OpenWithLearnpackCTA.defaultProps = {
  variant: null,
  currentAsset: null,
};

ProvisioningPopover.propTypes = {
  openInLearnpackAction: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  provisioningLinks: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default OpenWithLearnpackCTA;
