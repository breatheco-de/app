import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Icon from '../../common/components/Icon';
import { BREATHECODE_HOST } from '../../utils/variables';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import NextChakraLink from '../../common/components/NextChakraLink';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import MarkDownParser from '../../common/components/MarkDownParser';
import useStyle from '../../common/hooks/useStyle';
import useCohortHandler from '../../common/hooks/useCohortHandler';

function OnlyReadmeDisplay({ onClose }) {
  const { t } = useTranslation('syllabus');
  const scrollToMarkdown = () => {
    const markdownBody = document.getElementById('markdown-body');
    if (!markdownBody) return;

    const threshold = 200;
    const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
    const targetPosition = markdownBody.getBoundingClientRect().top + currentScrollPosition;

    const scrollDistance = Math.abs(currentScrollPosition - targetPosition);

    if (scrollDistance > threshold) {
      markdownBody.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }

    onClose();
  };

  return (
    <Box borderRadius="11px" width="100%" height="100%">
      <Heading size="sm" fontWeight="400">
        {t('common:read-me-title')}
      </Heading>
      <Text
        mt="16px"
        size="18px"
      >
        {t('common:read-me-explanation')}
      </Text>
      <Button
        as="a"
        display="flex"
        marginY="auto"
        margin="10px 0"
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
        onClick={scrollToMarkdown}
      >
        {t('common:read-me-button')}
        <Icon color="currentColor" icon="longArrowRight" />
      </Button>
    </Box>
  );
}

function ProvisioningDisplay({ availableOptions, resetOptionSelector, cohortSessionID, currentAssetURL }) {
  const { t } = useTranslation('syllabus');
  const accessToken = localStorage.getItem('accessToken');
  const openInLearnpackAction = t('common:learnpack.open-in-learnpack-button', {}, { returnObjects: true });

  const provisioningLinks = [{
    title: t('common:learnpack.new-exercise'),
    link: `${BREATHECODE_HOST}/v1/provisioning/me/container/new?token=${accessToken}&cohort=${cohortSessionID}&repo=${currentAssetURL}`,
    isExternalLink: true,
  },
  {
    title: t('common:learnpack.continue-exercise'),
    link: `${BREATHECODE_HOST}/v1/provisioning/me/workspaces?token=${accessToken}&cohort=${cohortSessionID}&repo=${currentAssetURL}`,
    isExternalLink: true,
  }];
  return (
    <Box borderRadius="11px" width="100%" height="100%">
      <Heading size="sm" fontWeight="400">
        {openInLearnpackAction.text}
      </Heading>
      <Text
        mt="16px"
        size="18px"
        dangerouslySetInnerHTML={{ __html: openInLearnpackAction?.description }}
      />
      {availableOptions.length > 1 && (
        <Button variant="link" textDecoration="none" onClick={resetOptionSelector}>
          ←
          {'  '}
          {t('common:go-back-option')}
        </Button>
      )}
      {provisioningLinks.map((link) => (
        <Button
          key={link.text}
          as="a"
          display="flex"
          href={link.link}
          target={link.isExternalLink ? '_blank' : '_self'}
          marginY="auto"
          margin="10px 0"
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
    </Box>

  );
}

function OpenLocallyDisplay({ availableOptions, osList, selectedOs, setSelectedOs, resetOsSelector, resetOptionSelector, expanded, setExpanded, steps }) {
  const { t } = useTranslation('syllabus');
  const { featuredLight, hexColor, borderColor } = useStyle();

  return (
    <Box>
      <Heading size="sm" fontWeight="400">
        {t('common:learnpack.clone-modal.title')}
      </Heading>
      <Text mt="16px" size="18px">
        {t('common:learnpack.clone-modal.description')}
      </Text>
      {availableOptions.length > 1 && (
        <Button variant="link" textDecoration="none" onClick={resetOptionSelector}>
          ←
          {'  '}
          {t('common:go-back-option')}
        </Button>
      )}
      {!selectedOs && (
        <Box padding="16px">
          <Text fontFamily="Space Grotesk Variable" fontWeight="500" fontSize="18px">
            {t('common:learnpack.clone-modal.select-os')}
          </Text>
          <Box mt="12px" display="flex" gap="12px">
            {osList.map((os) => (
              <Box
                borderRadius="8px"
                width="140px"
                height="140px"
                background={featuredLight}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                cursor="pointer"
                onClick={() => setSelectedOs(os)}
                _active={{
                  background: hexColor.featuredColor,
                  border: '1px solid',
                  borderColor: hexColor.blueDefault,
                }}
              >
                <Image src={os.logo} alt={os.label} margin="auto" />
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {selectedOs && (
        <Box>
          <Button variant="link" textDecoration="none" onClick={resetOsSelector}>
            ←
            {'  '}
            {t('common:go-back-os')}
          </Button>
          <Accordion index={expanded} onChange={(val) => setExpanded(val)} allowToggle display="flex" flexDirection="column" gap="10px">
            {steps.map((step, i) => (
              <AccordionItem display="flex" flexDirection="column" key={step.title} border="1px solid" borderColor={expanded === i ? 'blue.default' : borderColor} borderRadius="8px">
                <Heading position="relative" as="h3">
                  <Checkbox top="10px" left="16px" position="absolute" />
                  <AccordionButton cursor="pointer" _expanded={{ color: ('blue.default') }}>
                    <Box marginLeft="26px" fontFamily="Space Grotesk Variable" as="span" flex="1" fontSize="18px" textAlign="left">
                      {`${i + 1}.`}
                      {'  '}
                      {step.label}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Heading>
                <AccordionPanel className="markdown-body">
                  <MarkDownParser
                    content={step.description}
                    showLineNumbers={false}
                  />
                  {step.source && (
                    <NextChakraLink href={step.source} target="_blank" color={hexColor.blueDefault}>
                      {step['source-label'] || t('common:learn-more')}
                    </NextChakraLink>
                  )}
                </AccordionPanel>
              </AccordionItem>
            ))}

          </Accordion>
        </Box>
      )}
    </Box>
  );
}

function ModalToCloneProject({ isOpen, onClose, currentAsset, provisioningVendors }) {
  const { t } = useTranslation('syllabus');
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const { featuredLight, hexColor } = useStyle();

  const [selectedOs, setSelectedOs] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [expanded, setExpanded] = useState(0);

  //____determine what type of option is available based on thruthness____
  const templateUrl = currentAsset?.template_url;
  const isInteractive = currentAsset?.interactive;

  const isForOpenLocaly = isInteractive || templateUrl;
  const showProvisioningLinks = provisioningVendors?.length > 0 && currentAsset?.gitpod;
  const onlyReadme = !isForOpenLocaly && !showProvisioningLinks;

  const assetDependencies = currentAsset?.dependencies;

  //__this block of code is for open locally on computer__
  const urlToClone = currentAsset?.url || currentAsset?.readme_url.split('/blob')?.[0];
  const repoName = urlToClone.split('/').pop();

  const osList = t('common:learnpack.clone-modal.os-list', { repoUrl: isInteractive ? urlToClone : templateUrl }, { returnObjects: true });
  const agentVsCode = t('common:learnpack.clone-modal.agent-vs-code', {}, { returnObjects: true });
  const agentOS = t('common:learnpack.clone-modal.agent-os', { repoName }, { returnObjects: true });
  const projectReadme = t('common:learnpack.clone-modal.project-readme', {}, { returnObjects: true });

  const finalStep = currentAsset?.agent === 'vscode' ? agentVsCode : agentOS;

  const formatDependencies = (input) => {
    if (!input) return [];
    return input.split(',').map((item) => {
      const [dep, version] = item.split('=');
      return { [dep]: version };
    });
  };

  const dependencies = formatDependencies(assetDependencies);
  const dependenciesNames = dependencies.flatMap((dep) => Object.keys(dep));
  const dependenciesSteps = selectedOs?.dependencies.filter((dep) => dependenciesNames.includes(dep.name));

  const parseSteps = () => {
    if (isInteractive) return selectedOs?.steps.concat([finalStep]);
    return selectedOs?.steps.filter((step) => step.slug === 'download-ide' || step.slug === 'clone').concat([...dependenciesSteps, projectReadme]);
  };

  const steps = parseSteps();

  const resetOsSelector = () => {
    setSelectedOs(null);
    setExpanded(0);
  };

  //__options to show to the user__
  const resetOptionSelector = () => {
    setSelectedOption(null);
    if (selectedOs) resetOsSelector();
  };

  useEffect(() => {
    const options = [
      isForOpenLocaly && { key: 'open_locally', label: t('common:option-open-locally') },
      showProvisioningLinks && { key: 'provisioning_vendors', label: t('common:option-provisioning-vendors') },
      onlyReadme && { key: 'readme', label: t('common:option-readme') },
    ].filter(Boolean);

    setAvailableOptions(options);

    if (options.length === 1) {
      setSelectedOption(options[0].key);
      return;
    }

    setSelectedOption(null);
  }, [isForOpenLocaly, showProvisioningLinks, onlyReadme]);

  //__content displayed in the modal__
  const renderOptionContent = () => {
    switch (selectedOption) {
      case 'open_locally':
        return (
          <OpenLocallyDisplay
            osList={osList}
            selectedOs={selectedOs}
            setSelectedOs={setSelectedOs}
            resetOsSelector={resetOsSelector}
            expanded={expanded}
            setExpanded={setExpanded}
            steps={steps}
            resetOptionSelector={resetOptionSelector}
            availableOptions={availableOptions}
          />
        );
      case 'provisioning_vendors':
        return (
          <ProvisioningDisplay
            cohortSessionID={cohortSession?.id}
            currentAssetURL={currentAsset?.url}
            resetOptionSelector={resetOptionSelector}
            availableOptions={availableOptions}
          />
        );
      case 'readme':
        return <OnlyReadmeDisplay assetType={currentAsset?.asset_type} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={selectedOption === 'open_locally' ? '5xl' : 'lg'}>
      <ModalOverlay />
      <ModalContent padding="16px" overflow="auto">
        <ModalCloseButton />
        <Box display="flex" gap="16px" height="100%" minHeight="100%">
          <Box width={{ base: '100%', md: selectedOption === 'open_locally' ? '50%' : '100%' }} display="flex" flexDirection="column" justifyContent="space-between" height="100%">
            {selectedOption ? (
              renderOptionContent()
            ) : (
              <>
                {availableOptions.length === 1 ? (
                  renderOptionContent()
                ) : (
                  <Box>
                    <Heading size="sm" fontWeight="400">
                      {t('common:choose-one-option')}
                    </Heading>
                    <Text mt="16px" size="18px">
                      {t('common:choose-one-description')}
                    </Text>
                    <Box mt="20px">
                      {availableOptions.map((option) => (
                        <Button
                          key={option.key}
                          onClick={() => setSelectedOption(option.key)}
                          marginY="8px"
                          width="100%"
                        >
                          {option.label}
                          <Icon icon="longArrowRight" marginLeft="8px" />
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}
            {cohortSession?.available_as_saas && (
              <NextChakraLink marginTop="16px" href="/mentorship/schedule" target="_blank" color={hexColor.blueDefault} textAlign="center">
                {t('common:learnpack.clone-modal.need-help')}
                {' '}
                →
              </NextChakraLink>
            )}
          </Box>
          {selectedOption === 'open_locally' && (
            <Box width="50%" display={{ base: 'none', md: 'block' }}>
              {selectedOs ? (
                <ReactPlayerV2
                  className="react-player-border-radius"
                  containerStyle={{ height: '100%' }}
                  iframeStyle={{ background: 'none', borderRadius: '11px', height: '100% !important' }}
                  url={steps && steps[expanded]?.video}
                  height="100%"
                />
              ) : (
                <>
                  <Box background={featuredLight} borderRadius="11px" width="100%" height="100%" />
                </>
              )}
            </Box>
          )}
        </Box>
      </ModalContent>
    </Modal>
  );
}

ModalToCloneProject.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  provisioningVendors: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

ModalToCloneProject.defaultProps = {
  isOpen: false,
  onClose: () => { },
  currentAsset: null,
  provisioningVendors: [],
};

OpenLocallyDisplay.propTypes = {
  osList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  selectedOs: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  availableOptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setSelectedOs: PropTypes.func.isRequired,
  resetOsSelector: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired,
  resetOptionSelector: PropTypes.func.isRequired,
  steps: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

ProvisioningDisplay.propTypes = {
  availableOptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  resetOptionSelector: PropTypes.func.isRequired,
  cohortSessionID: PropTypes.string.isRequired,
  currentAssetURL: PropTypes.string.isRequired,
};

OnlyReadmeDisplay.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ModalToCloneProject;
