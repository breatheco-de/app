import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Badge,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Text from '../../Text';
import useStyle from '../../../hooks/useStyle';

function formatServiceItemLabel(item) {
  const title = item?.service?.title || '';
  if (item?.how_many === -1) return `${title} (∞)`;
  if (item?.how_many != null && item?.unit_type) {
    return `${title} (${item.how_many} ${item.unit_type})`;
  }
  return title;
}

function ConsumptionStrategyModal({
  isOpen,
  onClose,
  consumptionStrategy,
  serviceItems,
  memberEmail,
}) {
  const { t } = useTranslation('profile');
  const { borderColor2, hexColor } = useStyle();
  const strategyKey = consumptionStrategy === 'PER_TEAM' ? 'per-team' : 'per-seat';
  const strategyLabel = t(`team-seats.consumption-strategy.${strategyKey}-title`);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="17px" p="8px">
        <ModalCloseButton />
        <ModalHeader fontSize="18px" fontWeight="700" pb="8px">
          {memberEmail
            ? t('team-seats.consumption-strategy.modal-member-title', { email: memberEmail })
            : t('team-seats.consumption-strategy.modal-title')}
        </ModalHeader>
        <ModalBody pb="24px">
          <Box display="flex" flexDirection="column" gridGap="16px">
            <Box display="flex" alignItems="center" gridGap="10px">
              <Badge
                colorScheme={consumptionStrategy === 'PER_TEAM' ? 'purple' : 'blue'}
                fontSize="11px"
                px="10px"
                py="4px"
                borderRadius="full"
                textTransform="uppercase"
              >
                {strategyLabel}
              </Badge>
            </Box>

            <Text fontSize="14px" color={hexColor.fontColor3}>
              {t(`team-seats.consumption-strategy.${strategyKey}-description`)}
            </Text>

            {serviceItems?.length > 0 && (
              <Box
                border="1px solid"
                borderColor={borderColor2}
                borderRadius="12px"
                p="16px"
              >
                <Text fontSize="13px" fontWeight="700" mb="12px">
                  {t('team-seats.shared-resources-title')}
                </Text>
                <Box as="ul" pl="18px" m="0">
                  {serviceItems.map((item) => (
                    <Box as="li" key={item.id} fontSize="14px" mb="8px">
                      {formatServiceItemLabel(item)}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

ConsumptionStrategyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  consumptionStrategy: PropTypes.string,
  serviceItems: PropTypes.arrayOf(PropTypes.shape({})),
  memberEmail: PropTypes.string,
};

ConsumptionStrategyModal.defaultProps = {
  consumptionStrategy: 'PER_SEAT',
  serviceItems: [],
  memberEmail: null,
};

export default ConsumptionStrategyModal;
