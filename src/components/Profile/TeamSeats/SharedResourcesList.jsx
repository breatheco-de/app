import { Box, Flex, Badge } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Text from '../../Text';
import useStyle from '../../../hooks/useStyle';
import Icon from '../../Icon';

function SharedResourcesList({
  serviceItems,
  consumptionStrategy,
  onOpenDetails,
}) {
  const { t } = useTranslation('profile');
  const { borderColor2 } = useStyle();
  const strategyKey = consumptionStrategy === 'PER_TEAM' ? 'per-team' : 'per-seat';

  if (!serviceItems?.length) return null;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gridGap="10px"
      borderRadius="12px"
    >
      <Box
        as="button"
        type="button"
        onClick={onOpenDetails}
        textAlign="left"
        width="100%"
        p="10px 12px"
        borderRadius="8px"
        border="1px solid"
        borderColor={borderColor2}
        background="transparent"
        cursor="pointer"
        _hover={{ backgroundColor: 'blue.50', _dark: { backgroundColor: 'whiteAlpha.100' } }}
      >
        <Flex alignItems="center" justifyContent="space-between" gridGap="8px">
          <Box>
            <Badge
              colorScheme={consumptionStrategy === 'PER_TEAM' ? 'purple' : 'blue'}
              fontSize="10px"
              mb="6px"
              textTransform="uppercase"
            >
              {t(`team-seats.consumption-strategy.${strategyKey}-title`)}
            </Badge>
            <Text fontSize="12px" color="gray.500">
              {t(`team-seats.consumption-strategy.${strategyKey}`)}
            </Text>
          </Box>
          <Icon icon="arrowRight" width="16px" height="16px" />
        </Flex>
      </Box>
    </Box>
  );
}

SharedResourcesList.propTypes = {
  serviceItems: PropTypes.arrayOf(PropTypes.shape({})),
  consumptionStrategy: PropTypes.string,
  onOpenDetails: PropTypes.func.isRequired,
};

SharedResourcesList.defaultProps = {
  serviceItems: [],
  consumptionStrategy: 'PER_SEAT',
};

export default SharedResourcesList;
