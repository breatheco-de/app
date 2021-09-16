import {
  Progress,
  Box,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';

const ProgressBar = ({ progressText, programs, width }) => {
  const calculatePercentage = () => {
    let sumTaskCompleted = 0;
    let sumTaskLength = 0;
    for (let i = 0; i < programs.length; i += 1) {
      sumTaskCompleted += programs[i].taskCompleted;
      sumTaskLength += programs[i].taskLength;
    }
    return Math.trunc((sumTaskCompleted / sumTaskLength) * 100);
  };
  return (
    <Box width={width || '100%'}>
      <Flex marginBottom="15px">
        <Heading fontSize="22px" marginRight="5px" marginY="0">
          {calculatePercentage()}
          %
        </Heading>
        <Text fontSize="15px" marginY="0">{progressText}</Text>
      </Flex>
      <Progress value={calculatePercentage()} borderRadius="2px" height="4px" />
      <Flex justifyContent="space-around" marginTop="18px">
        {programs.map((program) => (
          <Box display="flex">
            <Icon icon={program.icon || 'book'} width="18px" height="18px" color="black" style={{ marginTop: '2px' }} />
            <Text marginLeft="11px" fontSize="15px" marginY="0">
              {`${program.title}: ${program.taskCompleted}/${program.taskLength}`}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

ProgressBar.propTypes = {
  progressText: PropTypes.string,
  programs: PropTypes.arrayOf(PropTypes.array),
  width: PropTypes.string,
};
ProgressBar.defaultProps = {
  width: '100%',
  programs: [],
  progressText: 'progress in the program',
};

export default ProgressBar;
