import {
  Box, Flex, Checkbox, useMediaQuery, Collapse,
  // Input, InputGroup, InputLeftElement,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
// import Icon from '../Icon';
import Text from '../Text';

// eslint-disable-next-line react/prop-types
const TechnologiesSection = ({
  t,
  title,
  show,
  commonBorderColor,
  commonTextColor,
  checkedTechnologies,
  technologyTags,
  handleToggle,
  getCheckboxProps,
}) => {
  const [isMobile] = useMediaQuery('(min-width: 1082px)');
  return (
    <Flex flexDirection="column" padding="0 0 12px 0" borderBottom={1} borderStyle="solid" borderColor={commonBorderColor}>
      <Box display="flex" gridGap="8px" justifyContent="space-between" padding="18px 0 18px 0" alignItems="center">
        <Text fontSize="1rem" textTransform="uppercase" fontWeight="bold" color={commonTextColor}>
          {title}
        </Text>
        {/* <InputGroup>
          <InputLeftElement
            height="29px"
            pointerEvents="none"
          >
            <Icon icon="search" width="14px" height="14px" />
          </InputLeftElement>
          <Input type="tel" placeholder="Phone number" height="29px" />
        </InputGroup> */}

      </Box>
      <Collapse in={show} startingHeight={technologyTags.length > 4 ? 170 : 38} animateOpacity>
        <Flex
          // gridTemplateColumns={{
          //   base: 'repeat(auto-fill, minmax(6rem, 1fr))',
          //   md: 'repeat(auto-fill, minmax(10rem, 1fr))',
          // }}
          flexFlow="row wrap"
          padding="5px"
          gridGap="20px"
        >
          {technologyTags.map((technology) => {
            const checkbox = getCheckboxProps({
              value: technology,
              checked: checkedTechnologies.length === 0
                ? false
                : checkedTechnologies.includes(technology),
              isChecked: false,
            });
            // console.log('checkbox:::', checkbox);
            return (
              <Box
                key={technology}
                border="1px solid"
                borderColor={checkbox.checked ? 'blue.default' : 'black'}
                backgroundColor={checkbox.checked ? 'blue.default' : 'white'}
                borderRadius="15px"
                p="4px 9px"
                as="label"
                cursor="pointer"
                _focus={{
                  boxShadow: 'outline',
                }}
              >
                <Flex gridGap="10px">
                  <Checkbox display="none" {...checkbox} borderColor="gray.default" isChecked={checkbox.checked} />
                  <Text size="l" color={checkbox.checked ? 'white' : 'black'}>{technology}</Text>
                </Flex>
              </Box>
            );
          })}
        </Flex>
      </Collapse>
      {(technologyTags.length >= 17 || !isMobile) && (
      <Flex width="100%" justifyContent="right">
        <Box
          as="button"
          margin="20px 0"
          color="blue.default"
          cursor="pointer"
          fontSize="14px"
          onClick={handleToggle}
        >
          {show ? t('common:show-less') : t('common:show-more')}
        </Box>
      </Flex>
      )}
    </Flex>
  );
};

TechnologiesSection.propTypes = {
  t: PropTypes.func,
  title: PropTypes.string,
  show: PropTypes.bool.isRequired,
  commonBorderColor: PropTypes.string.isRequired,
  commonTextColor: PropTypes.string.isRequired,
  checkedTechnologies: PropTypes.arrayOf(PropTypes.string).isRequired,
  technologyTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleToggle: PropTypes.func.isRequired,
  getCheckboxProps: PropTypes.func.isRequired,
};

TechnologiesSection.defaultProps = {
  t: () => {},
  title: 'TECHNOLOGIES',
};

export default TechnologiesSection;
