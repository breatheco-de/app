import { Box, Button } from '@chakra-ui/react';
import Heading from '../Heading';
import Icon from '../Icon';
import Text from '../Text';

const FinalProject = () => {
  console.log('test');

  return (
    <Box minHeight="300px" background="blue.900" borderRadius="lg" position="relative" color="white" textAlign="center" padding="0 34px">
      <Box className="center-absolute-x" top="0" background="yellow.default" padding="9px" borderBottomRadius="4px">
        <Icon icon="graduationCap" width="46px" height="39px" />
      </Box>
      <Box marginTop="4rem">
        <Heading
          size="18px"
        >
          What do you need to graduate?
        </Heading>
        <Text size="l" mt="10px">
          Almost there! You are on the last sprint before graduation, please make sure to complete the following activities:
        </Text>
        <Button variant="unstyled" background="blue.light" color="blue.default" padding="0 27px">
          Add final project info
        </Button>
      </Box>
    </Box>
  );
};

export default FinalProject;
