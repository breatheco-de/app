import React from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box, Button, Text } from '@chakra-ui/react';
import Icon from '../../../common/components/Icon';
import useStyle from '../../../common/hooks/useStyle';

function ConsumableCard({ title, icon, totalAvailable, onClick }) {
  const { featuredLight, hexColor } = useStyle();
  const { t } = useTranslation('profile');

  return (
    <Box borderRadius="17px" padding="12px 16px" background={featuredLight} width={{ base: '100%', md: '265px' }}>
      <Text size="sm" mb="10px" fontWeight="700">
        {title}
      </Text>
      <Box display="flex" justifyContent="space-between" alignItems="end">
        <Box display="flex" gap="10px" alignItems="center">
          <Icon icon={icon} color={hexColor.blueDefault} width="34px" height="34px" />
          {totalAvailable >= 0 && totalAvailable < 100 ? (
            <Text color={hexColor.fontColor3} fontSize="34px" fontWeight="700">
              {totalAvailable}
            </Text>
          ) : (
            <Icon icon="infinite" color={hexColor.fontColor3} width="34px" height="34px" />
          )}
        </Box>
        <Button variant="link" onClick={onClick}>
          {t('subscription.see-details')}
        </Button>
      </Box>
    </Box>
  );
}

ConsumableCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  totalAvailable: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ConsumableCard;
