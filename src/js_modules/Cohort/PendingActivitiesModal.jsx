// import { useState } from 'react';
import {
  Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Divider, Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import Heading from '../../common/components/Heading';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useStyle from '../../common/hooks/useStyle';
import Module from '../moduleMap/module';

function PendingActivities({ isOpen, onClose, cohortSlug }) {
  const { t } = useTranslation('dashboard');

  const { hexColor, lightColor, featuredLight, fontColor } = useStyle();
  const { getMandatoryProjects, taskTodo } = useCohortHandler();

  const mandatoryProjects = getMandatoryProjects(cohortSlug);

  return (
    <Modal
      isOpen={isOpen}
      size="2xl"
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color={lightColor} pb="0" fontSize="15px" textTransform="uppercase" textAlign="center">
          {t('mandatoryProjects.title')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody padding={{ base: '15px 22px' }}>
          <Divider mb="15px" />
          <Box backgroundColor={featuredLight} padding="8px" borderRadius="8px" border="1px solid" borderColor={hexColor.borderColor}>
            <Box mb="5px" display="flex" alignItems="center" gap="5px">
              <Icon icon="info" width="14px" height="14px" color={fontColor} />
              <Heading size="md">
                {t('mandatoryProjects.title')}
              </Heading>
            </Box>
            <Text size="md">
              {t('mandatoryProjects.description')}
            </Text>
          </Box>
          {mandatoryProjects.map((module, i) => (
            <Module
              key={`${module.title}-pending-modal`}
              currIndex={i}
              data={module}
              taskTodo={taskTodo}
              showWarning={false}
              cohortSlug={cohortSlug}
            />
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

PendingActivities.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cohortSlug: PropTypes.string,
};

PendingActivities.defaultProps = {
  cohortSlug: null,
};

export default PendingActivities;
