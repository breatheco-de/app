import {
  Box, Flex, Grid, Checkbox, useMediaQuery, Collapse,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../Text';

// eslint-disable-next-line react/prop-types
const TechnologiesSection = ({
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
      <Text fontSize="xl" fontWeight="bold" color={commonTextColor} padding="25px 0 18px 0">
        {title}
      </Text>
      <Collapse in={show} startingHeight={170} animateOpacity>
        <Grid
          gridTemplateColumns={{
            base: 'repeat(auto-fill, minmax(6rem, 1fr))',
            md: 'repeat(auto-fill, minmax(10rem, 1fr))',
          }}
          padding="5px"
          gap={6}
        >
          {technologyTags.map((technology) => {
            const checkbox = getCheckboxProps({
              value: technology,
              checked:
              checkedTechnologies.length === 0 ? false : checkedTechnologies.includes(technology),
              isChecked: false,
            });
            return (
              <Box
                key={technology}
                as="label"
                cursor="pointer"
                _focus={{
                  boxShadow: 'outline',
                }}
              >
                <Flex gridGap="10px">
                  <Checkbox {...checkbox} borderColor="gray.default" isChecked={checkbox.checked} />
                  <Text size="l">{technology}</Text>
                </Flex>
              </Box>
            );
          })}
        </Grid>
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
          {`Show ${show ? 'Less' : 'More'}`}
        </Box>
      </Flex>
      )}
    </Flex>
  );
};

TechnologiesSection.propTypes = {
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
  title: 'TECHNOLOGIES',
};

export default TechnologiesSection;
