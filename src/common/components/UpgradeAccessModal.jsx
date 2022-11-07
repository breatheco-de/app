import {
  Box, Modal, ModalOverlay, ModalContent, ModalCloseButton,
  ModalBody, Flex,
} from '@chakra-ui/react';
import { useState } from 'react';
import PropTypes from 'prop-types';
// import useTranslation from 'next-translate/useTranslation';
// import { Formik, Form, Field } from 'formik';
// import { useState, memo } from 'react';
// import Text from './Text';
// import validationSchema from './Forms/validationSchemas';
// import MarkDownParser from './MarkDownParser';
// import Icon from './Icon';
// import iconDict from '../utils/iconDict.json';

const UpgradeAccessModal = ({
  storySettings,
}) => {
  // const { t } = useTranslation('dashboard');
  const [isOpen, setIsOpen] = useState(storySettings.isOpen);
  console.log('storySettings', storySettings);
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent style={{ maxWidth: '52rem' }}>
        <ModalBody>
          <ModalCloseButton top={1} />
          <Flex flexDirection={{ base: 'column', md: 'row' }} gridGap="35px">
            <Box flex={1}>side 1</Box>
            <Box flex={1} background="blue.light" borderRadius="17px" minH="490px">side 2</Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

UpgradeAccessModal.propTypes = {
  storySettings: PropTypes.objectOf(PropTypes.any),
};

UpgradeAccessModal.defaultProps = {
  storySettings: {
    isOpen: false,
  },
};

export default UpgradeAccessModal;
