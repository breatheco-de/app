import React from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Button, Flex, Text } from '@chakra-ui/react';
import Icon from '../../Icon';
import useStyle from '../../../hooks/useStyle';

function ConsumableCard({ title, icon, totalAvailable, onClick }) {
  const { featuredLight, hexColor } = useStyle();
  const { t } = useTranslation('profile');

  return (
    <Flex
      direction="column"
      borderRadius="17px"
      padding="12px 16px"
      background={featuredLight}
      width={{ base: '100%', md: '265px' }}
      gap="10px"
      justifyContent="space-between"
    >
      <Text size="sm" mb="10px" fontWeight="700">
        {title}
      </Text>
      <Flex justifyContent="space-between" alignItems="center">
        <Flex gap="10px" alignItems="center" minHeight="51px">
          {icon}
          {totalAvailable >= 0 && totalAvailable < 100 ? (
            <Text color={hexColor.fontColor3} fontSize="34px" fontWeight="700">
              {totalAvailable}
            </Text>
          ) : (
            <Icon icon="infinite" color={hexColor.fontColor3} width="34px" height="34px" />
          )}
        </Flex>
        <Button variant="link" onClick={onClick}>
          {t('subscription.see-details')}
        </Button>
      </Flex>
    </Flex>
  );
}

ConsumableCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  totalAvailable: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ConsumableCard;
