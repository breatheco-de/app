import React from 'react';
import {
  Box, Flex, Tooltip, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../hooks/useStyle';
import Icon from './Icon';
import Text from './Text';

/**
 * Tooltip for optional (bonus) syllabus content.
 * Same layout as the CohortHeader info popover, on a white surface.
 * Per-type chips follow the gift chip rule: totals only until the student starts any bonus
 * of the module (showProgress), then done/total for every type (including when complete).
 */
function BonusTooltip({
  children, byType, showProgress, allCompleted, placement, iconColor,
}) {
  const { t } = useTranslation('common');
  const { hexColor } = useStyle();
  const bg = useColorModeValue('#FFFFFF', '#283340');
  const borderColor = useColorModeValue('#E2E8F0', '#3A4656');
  const titleColor = useColorModeValue('black', 'white');
  const descriptionColor = useColorModeValue('#4C648F', 'gray.300');
  const yellowSurface = useColorModeValue('yellow.light', '#332508');
  const chipIconColor = iconColor || hexColor.blueDefault;

  const getChipValue = ({ total, done }) => {
    if (!showProgress) return `${total}`;
    return `${done}/${total}`;
  };

  const label = (
    <Flex
      direction="column"
      alignItems="center"
      textAlign="center"
      gap="4px"
      width="fit-content"
    >
      <Flex alignItems="center" justifyContent="center" gap="6px">
        <Flex
          alignItems="center"
          justifyContent="center"
          width="24px"
          height="24px"
          minWidth="24px"
          borderRadius="full"
          background={yellowSurface}
        >
          <Icon icon="gift" width="14px" height="14px" />
        </Flex>
        <Text fontSize="16px" margin={0} color={titleColor}>
          {allCompleted ? t('bonus.completed-title') : t('bonus.title')}
        </Text>
      </Flex>
      <Text
        fontSize="12px"
        margin={0}
        color={descriptionColor}
        lineHeight="1.5"
        maxWidth="220px"
      >
        {allCompleted ? t('bonus.completed-description') : t('bonus.description')}
      </Text>
      {byType.length > 0 && (
        <Flex
          justifyContent="center"
          flexWrap="nowrap"
          gap="6px"
          marginTop="6px"
        >
          {byType.map((item) => (
            <Flex
              key={item.taskType}
              alignItems="center"
              justifyContent="center"
              gap="4px"
              padding="3px 9px"
              borderRadius="14px"
              background={yellowSurface}
              flexShrink={0}
            >
              <Icon icon={item.icon} width="12px" height="12px" color={chipIconColor} />
              <Text fontSize="12px" margin={0} color={titleColor} whiteSpace="nowrap">{getChipValue(item)}</Text>
              {showProgress && item.done === item.total && (
                <Icon icon="checked2" color={hexColor.green} width="11px" height="11px" />
              )}
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );

  return (
    <Tooltip
      hasArrow
      placement={placement}
      label={label}
      bg={bg}
      color={titleColor}
      border="1px solid"
      borderColor={borderColor}
      arrowShadowColor={borderColor}
      borderRadius="8px"
      padding="12px"
      maxWidth="fit-content"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
    >
      <Box as="span" display="inline-flex">
        {children}
      </Box>
    </Tooltip>
  );
}

BonusTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  byType: PropTypes.arrayOf(PropTypes.shape({
    taskType: PropTypes.string,
    total: PropTypes.number,
    done: PropTypes.number,
    icon: PropTypes.string,
  })),
  showProgress: PropTypes.bool,
  allCompleted: PropTypes.bool,
  placement: PropTypes.string,
  iconColor: PropTypes.string,
};

BonusTooltip.defaultProps = {
  byType: [],
  showProgress: false,
  allCompleted: false,
  placement: 'top',
  iconColor: undefined,
};

export default BonusTooltip;
