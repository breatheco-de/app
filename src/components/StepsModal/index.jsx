import { useState } from 'react';
import {
  Box,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../Heading';
import ReactPlayerV2 from '../ReactPlayerV2';
import MarkDownParser from '../MarkDownParser';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';

function StepsModal({ isOpen, onClose, title, titleIcon, description, steps, finalAction, finalActionLabel }) {
  const { borderColor } = useStyle();
  const [expanded, setExpanded] = useState(0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent padding="16px" maxH="80vh" overflowY="auto">
        <ModalCloseButton zIndex={100} />
        <Box display="flex" gap="16px" height="100%">
          <Box width={{ base: '100%', md: '50%' }} display="flex" flexDirection="column" height="100%">
            <Flex align="start" gap="8px" alignItems="center">
              {titleIcon && (
                <Icon icon={titleIcon} width="50px" height="50px" />
              )}
              <Heading size="sm" fontWeight="400" m={0}>
                {title}
              </Heading>
            </Flex>
            {description && (
              <Box mb="16px" className="markdown-body">
                <MarkDownParser content={description} showLineNumbers={false} />
              </Box>
            )}
            <Accordion index={expanded} onChange={(val) => setExpanded(val)} allowToggle display="flex" flexDirection="column" gap="10px">
              {steps.map((step, i) => (
                <AccordionItem display="flex" flexDirection="column" key={step.label || i} border="1px solid" borderColor={expanded === i ? 'blue.default' : borderColor} borderRadius="8px">
                  <Heading position="relative" as="h3">
                    <AccordionButton cursor="pointer" _expanded={{ color: ('blue.default') }}>
                      <Box fontFamily="Space Grotesk Variable" as="span" flex="1" fontSize="18px" textAlign="left">
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
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
            <Box mt="24px" display="flex" flexDirection="column" gap="10px" alignItems="center">
              {finalAction && finalActionLabel && (
                <Button onClick={finalAction} variant="link" colorScheme="blue">
                  {finalActionLabel}
                </Button>
              )}
            </Box>
          </Box>

          {/* Right Column: Video Player */}
          <Box width="50%" display={{ base: 'none', md: 'block' }} marginTop="15px">
            <ReactPlayerV2
              className="react-player-border-radius"
              containerStyle={{ height: '100%' }}
              iframeStyle={{ background: 'none', borderRadius: '11px', height: '100%' }}
              url={steps?.[expanded]?.video || ''}
              autoPlay
              height="100%"
            />
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
}

StepsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  titleIcon: PropTypes.string,
  description: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    video: PropTypes.string, // Video URL is optional
  })).isRequired,
  finalAction: PropTypes.func,
  finalActionLabel: PropTypes.string,
};

StepsModal.defaultProps = {
  title: 'Steps',
  description: null,
  titleIcon: null,
  finalAction: null,
  finalActionLabel: null,
};

export default StepsModal;
