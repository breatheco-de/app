import {
  Box,
  Heading,
  Progress,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';

const ProgressBar = () => {
  const defaultProps = '450px';
  return (
    <>
      <CircularProgress value={40} color="green.400">
        <CircularProgressLabel>40%</CircularProgressLabel>
      </CircularProgress>
      <Box
        // backgroundColor="white"
        width={defaultProps}
        borderWidth="0px"
        // borderRadius="lg"
        overflow="hidden"
      >
        <Progress size="xs" isIndeterminate />
        <Progress colorScheme="orange" height="32px" value={20} />
        <Progress colorScheme="purple" size="lg" height="32px" value={20} />
        {/* <Box d="flex" justifyContent="center">
        <Icon icon="sideSupport" width="300px" height="70px" />
      </Box> */}
        <Box p="4">
          <Box d="flex" alignItems="baseline" justifyContent="center">
            <Heading textAlign="center" justify="center">
              <Progress colorScheme="green" height="32px" value={20} />
              {/* {title} */}
            </Heading>
          </Box>

          <Box pt="3" d="flex" alignItems="baseline" justifyContent="center">
            <Progress colorScheme="blue" size="lg" value={20} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ProgressBar;
