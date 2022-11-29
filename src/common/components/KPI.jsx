import {
  Box, Flex, Stack, Text, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';
import Icon from './Icon';
import Counter from './ProgressCircle/Counter';
import ChakraText from './Text';

const KPI = ({
  label, icon, value, unit, max,
  variation, variationColor, style,
  changeWithColor, valueUnit, unstyled, chart,
}) => {
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

  // const textColor = useColorModeValue('gray.900', 'white');
  const textColorIcon = useColorModeValue('#1A202C', 'white');
  // const labelColor = useColorModeValue('gray.dark', 'gray.light');
  const bgColor = useColorModeValue('white', 'featuredDark');
  const { hexColor, fontColor2 } = useStyle();

  const kpiColor = kpiColors[verifiVariation()];
  const defaultColor = kpiColors.default;
  const kpiPosition = kpiPositions[verifiVariation()] || kpiPositions.default;
  const isPositiveColor = max !== null
    && value >= (max * 0.8)
    && kpiColors.up; // value is greather than 80% of max

  const getNumberColor = () => {
    if (max === null) return changeWithColor ? kpiColor : hexColor.fontColor2;
    return isPositiveColor || kpiColor;
  };
  const numberColors = getNumberColor();

  return (
    <Stack style={style} width="fit-content" background={!unstyled && bgColor} display="flex" flexDirection={chart === null ? 'column' : 'row'} padding={!unstyled && (label ? '17px 22px' : '10px 20px')} border={!unstyled && '2px solid'} borderColor={!unstyled && 'blue.200'} borderRadius="10px">
      {chart !== null ? (
        <Flex flexDirection="column" color={fontColor2}>
          {label && (
            <ChakraText fontWeight={700} size="15px">
              {label}
            </ChakraText>
          )}
          <ChakraText fontWeight={700} size={label ? '30px' : '46px'} color={numberColors}>
            <Counter valueTo={value} totalDuration={2} />
            {valueUnit}
          </ChakraText>
        </Flex>
      ) : (
        <Heading as="label" color={fontColor2} textTransform="capitalize" fontSize="14px">
          {label}
        </Heading>
      )}
      <Box display="flex" alignItems="center" style={{ margin: '6px 0 0 0' }} gridGap="10px" position="relative">
        {icon && (
          <Icon icon={icon} color={variationColor || (numberColors || kpiColor || textColorIcon)} width={label ? '26px' : '32px'} height={label ? '26px' : '32px'} />
        )}
        <Box display="flex" gridGap="6px">
          {chart === null && (
            <Heading as="p" size={label ? 'm' : 'l'} padding="0" margin="0" color={numberColors}>
              {unit}
              {value}
              {/* {value.toString().length >= 3
                ? (value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                : value} */}
            </Heading>
          )}
          {max && (
            <>
              <Heading as="label" size={label ? 'm' : 'l'} fontWeight="400" color="gray.default">
                /
              </Heading>
              <Heading as="p" size={label ? 'm' : 'l'} fontWeight="400" padding="0" margin="0" color="gray.default">
                {max}
              </Heading>
            </>
          )}
        </Box>
        {variation && (
          <Box display="flex" flexDirection="row" alignItems="center">
            {kpiPosition && (
              <Box transition="all 0.3s ease-in-out" height="20px" transform={kpiPosition}>
                <Icon icon="arrowDown" color={kpiColor || defaultColor} width="20px" height="20px" />
              </Box>
            )}
            <Text as="label" color={kpiColor || defaultColor} fontSize={label ? '15px' : '18px'} fontWeight="700">
              {`${variation.replace('+', '').replace('-', '')}%`}
            </Text>
          </Box>
        )}

        {chart && chart}
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
  changeWithColor: PropTypes.bool,
  valueUnit: PropTypes.string,
  unstyled: PropTypes.bool,
  chart: PropTypes.node,
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
  changeWithColor: false,
  valueUnit: '',
  unstyled: false,
  chart: null,
  // variationUnit: '',
};

export default KPI;
