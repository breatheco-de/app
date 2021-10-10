import {
  Box, HStack, Heading, Stack, useColorMode, Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import NextChakraLink from './NextChakraLink';
import useModuleMap from '../store/actions/moduleMapAction';
import Text from './Text';

// import useCounter from '../store/actions/counterAction';
import Icon from './Icon';

const ModuleMap = ({
  width, handleModuleStatus, title, description,
}) => {
  const { colorMode } = useColorMode();
  const { modules } = useModuleMap();
  const statusIcons = {
    finished: 'verified',
    inactive: 'lesson',
    active: 'unverified',
  };

  return (
    <Box width={width || '100%'}>
      <Box display="flex" justifyContent="space-between">
        <Heading as="h1" margin={0} fontSize="22px">
          {title}
        </Heading>
        <Heading
          as="h6"
          margin={0}
          fontSize="15px"
          color={colorMode === 'light' ? 'gray.default' : 'white'}
          fontWeight="normal"
        >
          {modules?.length}
          {' '}
          LESSONS
        </Heading>
      </Box>
      <Text color={colorMode === 'light' ? '#606060' : 'white'} size="md">
        {description}
      </Text>
      {modules.map((module, i) => (
        <Stack
          direction="row"
          backgroundColor={colorMode === 'light' ? '#FFFFFF' : 'primary'}
          border="1px solid #C4C4C4"
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
              <Text fontWeight="bold" margin="0" size="sm" color="#FFFFFF">
                {i + 1}
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
                size="l"
                fontWeight="light"
                lineHeight="18px"
                letterSpacing="0.05em"
                margin="0"
              >
                {module.text}
              </Text>
            </Box>
          </Flex>
          <HStack width="-webkit-fill-available">
            <Box
              display="flex"
              margin="0 0 0 auto"
              onClick={(e) => handleModuleStatus(e, { ...module, index: i })}
            >
              {module.status === 'inactive' ? (
                <NextChakraLink
                  href="/"
                  color="#0097CF"
                  fontWeight="bold"
                  fontStyle="normal"
                >
                  {`${module.title} lesson`}
                </NextChakraLink>
              ) : (
                <Icon icon={statusIcons[module.status]} width="27px" />
              )}
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
  title: PropTypes.string,
  description: PropTypes.string,
};
ModuleMap.defaultProps = {
  width: '100%',
  title: 'HTML/CSS/Bootstrap',
  description: '',
  handleModuleStatus: () => {},
};

export default ModuleMap;
