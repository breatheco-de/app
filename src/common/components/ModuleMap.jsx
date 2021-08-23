import {
  Text, Box, HStack, Heading, Stack, useColorMode, Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import NextChakraLink from './NextChakraLink';
import useModuleMap from '../store/actions/moduleMapAction';

// import useCounter from '../store/actions/counterAction';
import Icon from './Icon';

const ModuleMap = ({ width, handleModuleStatus }) => {
  const { colorMode } = useColorMode();
  const { modules } = useModuleMap();
  const statusIcons = {
    finished: 'verified',
    inactive: 'lesson',
    active: 'unverified',
  };

  return (
    <Box>
      <Heading as="h1">Module Map</Heading>
      {modules.map((module, i) => (
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
          key={module.text}
          _hover={{ bg: colorMode === 'light' ? 'blue.light' : 'featuredDark' }}
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
                {i}
              </Text>
            </Box>
            <Box mr="20px" ml="20px" display="flex" minWidth="22px" width="22px">
              <Icon icon={module.icon || 'book'} />
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
                {module.title?.toUpperCase()}
              </Heading>
              <Text
                fontSize="15px"
                fontWeight="light"
                lineHeight="18px"
                letterSpacing="0.05em"
                margin="0"
              >
                {module.text}
              </Text>
            </Box>
          </Flex>
          <HStack width="inherit">
            <Box display="flex" margin="0 0 0 auto" onClick={(e) => handleModuleStatus(e, { ...module, index: i })}>
              {module.status === 'inactive'
                ? <NextChakraLink href="/" color="#0097CF" fontWeight="bold" fontStyle="normal">{`${module.title} lesson`}</NextChakraLink>
                : <Icon icon={statusIcons[module.status]} width="27px" />}
            </Box>
          </HStack>
        </Stack>
      ))}
    </Box>
  );
};

ModuleMap.propTypes = {
  width: PropTypes.string,
  handleModuleStatus: PropTypes.func,
};
ModuleMap.defaultProps = {
  width: '100%',
  handleModuleStatus: () => {
  },
};

export default ModuleMap;
