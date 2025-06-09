import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Box,
  Text,
  Image,
  Button,
  ModalCloseButton,
} from '@chakra-ui/react';
import Icon from '../../Icon';
import useStyle from '../../../hooks/useStyle';
import { unSlugify } from '../../../utils';
import { ProfilesSection } from '../../SupportSidebar/MentoringConsumables';
import { defaultProfiles } from '../../../utils/variables';

function UnitsDisplay({ item, hexColor }) {
  const value = item?.unit ?? item?.how_many;
  if (value === -1) {
    return <Icon icon="infinite" color={hexColor.fontColor3} width="20px" height="20px" />;
  }
  if (typeof value === 'number' && value >= 0) {
    return value;
  }
  return null;
}

UnitsDisplay.propTypes = {
  item: PropTypes.shape({
    unit: PropTypes.number,
    how_many: PropTypes.number,
  }).isRequired,
  hexColor: PropTypes.shape({
    fontColor3: PropTypes.string.isRequired,
  }).isRequired,
};

function ConsumableMoreInfoModal({ serviceModal, services, closeMentorshipsModal, existsNoAvailableAsSaas, t }) {
  const { hexColor } = useStyle();
  const detailsConsumableData = {
    mentorships: {
      icon: <ProfilesSection profiles={defaultProfiles} size="29px" ms="12px" />,
      title: t('subscription.your-mentoring-available'),
    },
    workshops: {
      icon: <Icon icon="live-event-opaque" width="40px" height="40px" />,
      title: t('subscription.your-workshop-available'),
    },
    voids: {
      icon: <Icon icon="rigobot-avatar-tiny" width="32px" height="32px" />,
      title: t('subscription.rigo-available'),
    },
  };

  // console.log(services[serviceModal]);
  return (
    <Modal isOpen={serviceModal !== null} onClose={closeMentorshipsModal} isCentered>
      <ModalOverlay />
      <ModalContent
        borderRadius="11px"
        overflow="hidden"
        minH={services[serviceModal]?.length === 0 && '264px'}
        maxH="264px"
      >
        <ModalCloseButton size="14px" _hover="none" _active="none" />
        {serviceModal && (
          <>
            <ModalHeader fontWeight="400" fontSize="18px" display="flex" alignItems="center" gap="8px" px="8px">
              {detailsConsumableData[serviceModal]?.icon}
              {detailsConsumableData[serviceModal]?.title}
            </ModalHeader>

            <ModalBody
              p="8px"
              style={{
                maxHeight: '350px',
                overflowY: 'auto',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: services[serviceModal]?.length === 0 ? 'center' : 'flex-start',
              }}
            >
              {services[serviceModal]?.length === 0 ? (
                <Box
                  w="100%"
                  h="206px"
                  borderRadius="4px"
                  display="flex"
                  backgroundColor="#F9F9F9"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                >
                  {existsNoAvailableAsSaas && (
                    <Text color={hexColor.fontColor2} fontSize="18px" mb="16px" textAlign="center">
                      {t('subscription.bootcamp-mentorships')}
                    </Text>
                  )}
                  <Text color={hexColor.fontColor2} fontSize="16px" mb="16px" textAlign="center">
                    {t('subscription.no-consumables-available', { service: t(`consumable-services.${serviceModal}`).toLowerCase() })}
                  </Text>
                  <Button
                    backgroundColor="blue.default"
                    color="white"
                    onClick={closeMentorshipsModal}
                    fontWeight="500"
                    borderRadius="4px"
                    height="32px"
                    _hover="none"
                    fontSize="14px"
                    _active="none"
                  >
                    {t('subscription.add-consumables', { service: t(`consumable-services.${serviceModal}`).toLowerCase() })}
                  </Button>
                </Box>
              ) : (
                <Box w="100%" px="8px">
                  {services[serviceModal].map((item) => (
                    <Box
                      key={item.slug}
                      display="flex"
                      alignItems="center"
                      boxShadow="3px 3px 7px rgba(0,0,0,0.04)"
                      borderRadius="8px"
                      p="8px"
                      mb="12px"
                      bg="white"
                    >
                      {item.logo_url && (
                        <Image src={item.logo_url} width="32px" height="32px" alt="icon" style={{ marginRight: '16px' }} />
                      )}
                      <Box>
                        <Text display="flex" alignItems="center" fontWeight="400" fontSize="16px" mb="8px">
                          <Text as="span" style={{ marginRight: '8px' }}><UnitsDisplay item={item} hexColor={hexColor} /></Text>
                          {item?.name || unSlugify(item?.slug)}
                        </Text>
                        <Text color={hexColor.fontColor3} fontSize="14px">{item?.description}</Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

ConsumableMoreInfoModal.propTypes = {
  serviceModal: PropTypes.string.isRequired,
  closeMentorshipsModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  existsNoAvailableAsSaas: PropTypes.bool.isRequired,
  services: PropTypes.shape({
    mentorships: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
    workshops: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
    voids: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  }).isRequired,
};

export default ConsumableMoreInfoModal;
