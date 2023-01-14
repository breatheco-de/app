import { Box, Button, Flex, Modal, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Heading from '../Heading';
import Text from '../Text';
import FinalProjectForm from './Form';

const FinalProjectModal = ({ isOpen }) => {
  const { t } = useTranslation('final-project');
  const [isModalOpen, setIsModalOpen] = useState(isOpen || false);
  const [openForm, setOpenForm] = useState(false);
  const bullets = t('modal.bullets', {}, { returnObjects: true });

  return (
    <>
      <Modal isOpen={isModalOpen && !openForm} onClose={setIsModalOpen}>
        <ModalOverlay />
        <ModalContent maxWidth="960px" margin="6rem 0 0 0">
          <ModalCloseButton />
          <Flex gridGap="22px" padding="30px">
            <Box flex={0.6} backgroundColor="yellow.default" borderRadius="17px" padding="20px">
              <Heading size="90px" color="white" textTransform="uppercase">
                {t('modal.title')}
              </Heading>
            </Box>
            <Flex flexDirection="column" flex={0.4} width="100%" gridGap="16px" padding="20px">
              <Heading size="sm" color="gray.600" letterSpacing="0.05em">{t('modal.subtitle')}</Heading>
              <Text size="18px">{t('modal.description')}</Text>
              <Flex flexDirection="column" gridGap="8px">
                {bullets.map((bullet) => (
                  <Text size="18px" key={bullet} dangerouslySetInnerHTML={{ __html: bullet }} />
                ))}
              </Flex>
              <Button variant="default" onClick={() => setOpenForm(true)} width="fit-content" margin="auto 0 0 0" padding="0 1.8rem">
                {t('modal.button')}
              </Button>
            </Flex>
          </Flex>
        </ModalContent>
      </Modal>
      {openForm && (
        <Modal size="lg" isOpen={isOpen} onClose={setOpenForm}>
          <ModalOverlay />
          <ModalContent margin="6rem 0 0 0" borderRadius="13px">
            <ModalCloseButton />
            <FinalProjectForm />
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

FinalProjectModal.propTypes = {
  isOpen: PropTypes.bool,
};
FinalProjectModal.defaultProps = {
  isOpen: true,
};

export default FinalProjectModal;
