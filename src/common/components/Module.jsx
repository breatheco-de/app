import {
  Text, Box, HStack, Heading, Stack, useColorMode, Flex,
} from '@chakra-ui/react';

import PropTypes from 'prop-types';
// import useCounter from '../store/actions/counterAction';
import Icon from './Icon';

const Module = ({
  title, paragraph, moduleNumber, width, icon,
}) => {
  const { colorMode } = useColorMode();

  return (
    <Stack
      direction="row"
      backgroundColor={colorMode === 'light' ? '#FFFFFF' : 'primary'}
      border="1px solid #C4C4C4"
      width={width || '100%'}
      height="auto"
      py="10px"
      px="15px"
      my="10px"
      rounded="2xl"
      overflow="hidden"
    >
      <Flex width="100%">
        <Box
          width="30px"
          minWidth="30px"
          alignSelf="center"
          mr="15px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="30px"
          rounded="full"
          align="center"
          background="#0097CF"
        >
          <Text fontWeight="bold" margin="0" fontSize="13px" color="#FFFFFF">
            {moduleNumber}
          </Text>
        </Box>
        <Box mr="20px" ml="20px" display="flex" minWidth="22px" width="22px">
          <Icon icon={icon || 'book'} color="#FFFFFF" />
        </Box>

        <Box>
          <Heading
            as="h3"
            fontSize="13px"
            lineHeight="18px"
            letterSpacing="0.05em"
            margin="0"
            isTruncated
          >
            {title}
          </Heading>
          <Text
            fontSize="15px"
            fontWeight="light"
            lineHeight="18px"
            letterSpacing="0.05em"
            margin="0"
          >
            {paragraph}
          </Text>
        </Box>
      </Flex>
      <HStack width="auto">
        <Box display="flex" width="30px" margin="0 0 0 auto">
          <Icon icon="verified" />
        </Box>
      </HStack>
      {/* <GridItem colSpan={6}>
      <Button my="5px" colorScheme="green" variant="outline" type="button">
        {resetText}
      </Button>
    </GridItem> */}
    </Stack>
  );
};
Module.propTypes = {
  title: PropTypes.string,
  paragraph: PropTypes.string,
  width: PropTypes.string,
  moduleNumber: PropTypes.number,
  icon: PropTypes.string,
};
Module.defaultProps = {
  title: 'Module',
  paragraph: '',
  width: '100%',
  moduleNumber: 1,
  icon: 'book',
};

export default Module;
