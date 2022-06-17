import { Box, Stack, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from './Heading';
import Icon from './Icon';

const KPI = ({
  label, icon, value, unit, max,
  variation, variationColor, style,
}) => {
  // const variationIcon = {
  //   up: 'chevron-up-circle',
  //   '+': 'chevron-up-circle',
  //   down: 'chevron-down-circle',
  //   '-': 'chevron-down-circle',
  // };

  const verifiVariation = () => {
    if (variation.includes('+')) return 'up';
    if (variation.includes('-')) return 'down';
    return false;
  };
  const kpiPositions = {
    up: 'scaleY(-1)',
    down: 'scaleY(1)',
    default: false,
  };
  const kpiColors = {
    up: '#25BF6C',
    '+': '#25BF6C',
    down: '#CD0000',
    '-': '#CD0000',
    default: '#0097CF',
  };

  const kpiColor = kpiColors[verifiVariation()];
  const defaultColor = kpiColors.default;
  const kpiPosition = kpiPositions[verifiVariation()] || kpiPositions.default;
  const isPositive = value >= (max * 0.8); // value is greather than 80% of max

  return (
    <Stack style={style} display="flex" flexDirection="column" padding="17px 22px" border="2px solid" borderColor="blue.200" borderRadius="10px">
      <Heading as="label" color="gray.dark" textTransform="capitalize" fontSize="14px">
        {label}
      </Heading>
      <Box display="flex" alignItems="center" style={{ margin: '6px 0 0 0' }} gridGap="10px">
        {icon && (
          <Icon icon={icon} color={variationColor || (kpiColor || '#3A3A3A')} width="26px" height="26px" />
        )}
        <Box display="flex" gridGap="6px">
          <Heading as="p" size="m" color={isPositive || kpiColor || '#000000'}>
            {unit}
            {value}
            {/* {value.toString().length >= 3
              ? (value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
              : value} */}
          </Heading>
          {max && (
            <>
              <Heading as="label" size="m" fontWeight="400" color="gray.default">
                /
              </Heading>
              <Heading as="p" size="m" fontWeight="400" color="gray.default">
                {max}
              </Heading>
            </>
          )}
        </Box>
        {variation && (
          <Box display="flex" flexDirection="row" alignItems="center">
            {kpiPosition && (
              <Icon icon="arrowDown" style={{ transition: 'all 0.3s ease-in-out', transform: kpiPosition }} color={kpiColor || defaultColor} width="20px" height="20px" />
            )}
            <Text as="label" color={kpiColor || defaultColor} fontSize="15px" fontWeight="700">
              {`${variation.replace('+', '').replace('-', '')}%`}
            </Text>
          </Box>
        )}
      </Box>
    </Stack>
  );
};

KPI.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  value: PropTypes.number,
  unit: PropTypes.string,
  max: PropTypes.number,
  variation: PropTypes.string,
  variationColor: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
  // variationUnit: PropTypes.string.isRequired,
};

KPI.defaultProps = {
  icon: '',
  value: 0,
  unit: '',
  max: null,
  variation: '',
  variationColor: '',
  style: {},
  // variationUnit: '',
};

export default KPI;
