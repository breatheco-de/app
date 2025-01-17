import { useState } from 'react';
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
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import NextChakraLink from '../../common/components/NextChakraLink';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import MarkDownParser from '../../common/components/MarkDownParser';
import useStyle from '../../common/hooks/useStyle';
import useCohortHandler from '../../common/hooks/useCohortHandler';

function ModalToCloneProject({ isOpen, onClose, currentAsset }) {
  const { t } = useTranslation('syllabus');
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [selectedOs, setSelectedOs] = useState(null);
  const [expanded, setExpanded] = useState(0);
  const { featuredLight, hexColor, borderColor } = useStyle();

  const templateUrl = currentAsset?.template_url;
  // const assetDependencies = 'python=3.10,node=16.0';
  const assetDependencies = currentAsset?.dependencies;
  const isInteractive = currentAsset?.interactive;
  // const isInteractive = false;

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
      // Split each dependency by '=' to get the key-value pair
      const [dep, version] = item.split('=');
      // Return an object in the desired format
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

  const resetSelector = () => {
    setSelectedOs(null);
    setExpanded(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent padding="16px" overflow="auto">
        <ModalCloseButton />
        <Box display="flex" gap="16px" height="100%" minHeight="100%">
          <Box width={{ base: '100%', md: '50%' }} display="flex" flexDirection="column" justifyContent="space-between" height="100%">
            <Box>
              <Heading size="sm" fontWeight="400">
                {t('common:learnpack.clone-modal.title')}
              </Heading>
              <Text mt="16px" size="18px">
                {t('common:learnpack.clone-modal.description')}
              </Text>
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
                  <Button variant="link" textDecoration="none" onClick={resetSelector}>
                    ←
                    {'  '}
                    {t('common:go-back')}
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
            {cohortSession?.available_as_saas && (
              <NextChakraLink marginTop="16px" href="/mentorship/schedule" target="_blank" color={hexColor.blueDefault} textAlign="center">
                {t('common:learnpack.clone-modal.need-help')}
                {' '}
                →
              </NextChakraLink>
            )}
          </Box>
          <Box width="50%" display={{ base: 'none', md: 'block' }} paddingTop="20px">
            {selectedOs ? (
              <ReactPlayerV2
                className="react-player-border-radius"
                containerStyle={{ height: '100%' }}
                iframeStyle={{ background: 'none', borderRadius: '11px', height: '100% !important' }}
                url={steps && steps[expanded]?.video}
                height="100%"
              />
            ) : (
              <Box background={featuredLight} borderRadius="11px" width="100%" height="100%" />
            )}
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
}

ModalToCloneProject.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ModalToCloneProject.defaultProps = {
  isOpen: false,
  onClose: () => {},
  currentAsset: null,
};

export default ModalToCloneProject;
