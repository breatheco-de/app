import { Box, Button, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Text from '../../Text';
import Icon from '../../Icon';

function SeatRow({
  seat, isOwnerSeat, onRemove, onViewShared,
}) {
  const { t } = useTranslation('profile');
  const isPending = seat.is_active && !seat.user;

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      p="12px"
      borderRadius="8px"
      backgroundColor="gray.50"
      _dark={{ backgroundColor: 'gray.700' }}
    >
      <Box
        as="button"
        type="button"
        display="flex"
        alignItems="center"
        gridGap="10px"
        flex="1"
        textAlign="left"
        background="transparent"
        cursor="pointer"
        onClick={() => onViewShared(seat)}
      >
        <Icon icon="avatar-glasses" width="18px" height="18px" />
        <Box>
          <Text fontSize="14px" fontWeight="600">
            {seat.email}
          </Text>
          {isOwnerSeat && (
            <Text fontSize="11px" color="gray.500">
              {t('team-seats.owner-label')}
            </Text>
          )}
          {!isOwnerSeat && isPending && (
            <Text fontSize="11px" color="gray.500">
              {t('team-seats.pending-invite')}
            </Text>
          )}
          {!isOwnerSeat && (
            <Text fontSize="11px" color="blue.default" fontWeight="600">
              {t('team-seats.view-shared-resources')}
            </Text>
          )}
        </Box>
      </Box>
      {!isOwnerSeat && seat.is_active && (
        <Button
          size="sm"
          variant="outline"
          colorScheme="red"
          onClick={() => onRemove(seat)}
        >
          {t('team-seats.remove-seat')}
        </Button>
      )}
    </Flex>
  );
}

SeatRow.propTypes = {
  seat: PropTypes.shape({
    id: PropTypes.number,
    email: PropTypes.string,
    user: PropTypes.number,
    is_active: PropTypes.bool,
  }).isRequired,
  isOwnerSeat: PropTypes.bool,
  onRemove: PropTypes.func.isRequired,
  onViewShared: PropTypes.func.isRequired,
};

SeatRow.defaultProps = {
  isOwnerSeat: false,
};

export default SeatRow;
