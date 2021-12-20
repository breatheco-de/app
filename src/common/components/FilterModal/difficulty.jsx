import {
  Box, Flex, Grid, Checkbox,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../Text';

const DifficultySection = ({
  title,
  commonTextColor,
  commonBorderColor,
  difficulties,
  dificultyPosition,
  contextFilter,
  setDificulty,
  setFilter,
}) => (
  <Flex
    flexDirection="column"
    borderBottom={1}
    borderStyle="solid"
    borderColor={commonBorderColor}
    padding="0 0 30px 0"
  >
    <Text size="l" color={commonTextColor} padding="25px 0 18px 0">
      {title}
    </Text>
    <Grid gridTemplateColumns="repeat(auto-fill, minmax(10rem, 1fr))" gap={6}>
      {difficulties.map((dificulty, index) => (
        <Flex gridGap="10px" key={dificulty} cursor="pointer" onClick={() => setDificulty(index)}>
          <Checkbox borderColor="gray.default" isChecked={index === dificultyPosition} />
          <Text size="md">{dificulty}</Text>
        </Flex>
      ))}
    </Grid>
    {typeof dificultyPosition === 'number' && dificultyPosition !== null && (
      <Flex width="100%" justifyContent="right">
        <Box
          as="button"
          margin="20px 0"
          color="blue.default"
          cursor="pointer"
          fontSize="14px"
          onClick={() => {
            setDificulty(null);
            setFilter({
              ...contextFilter,
              difficulty: [],
            });
          }}
        >
          Remove difficulty
        </Box>
      </Flex>
    )}
  </Flex>
);
DifficultySection.propTypes = {
  title: PropTypes.string,
  difficulties: PropTypes.arrayOf(PropTypes.string),
  commonBorderColor: PropTypes.string.isRequired,
  commonTextColor: PropTypes.string.isRequired,
  dificultyPosition: PropTypes.number,
  contextFilter: PropTypes.objectOf(PropTypes.any).isRequired,
  setDificulty: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
};

DifficultySection.defaultProps = {
  title: 'TECHNOLOGIES',
  difficulties: [],
  dificultyPosition: null,
};

export default DifficultySection;
