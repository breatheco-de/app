import {
  Box, Heading, Stack, Flex, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';

import Icon from './Icon';

const Module = ({ data, icon, index }) => (
  <Stack
    direction="row"
    backgroundColor={useColorModeValue('#FFFFFF', 'primary')}
    border="1px solid #C4C4C4"
    height="auto"
    py="10px"
    px="15px"
    my="10px"
    rounded="2xl"
    overflow="hidden"
    key={index}
    _hover={{ bg: useColorModeValue('blue.light', 'featuredDark') }}
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
          {index + 1}
        </Text>
      </Box>
      <Box mr="20px" ml="20px" display="flex" minWidth="22px" width="22px">
        <Icon icon={icon} color="blue.default" />
      </Box>
      <Box>
        <Heading
          as="h3"
          fontSize="13px"
          lineHeight="18px"
          letterSpacing="0.05em"
          margin="0"
          isTruncated
          textTransform="uppercase"
        >
          {data.type || 'Read'}
        </Heading>
        <Text
          size="l"
          fontWeight="light"
          lineHeight="18px"
          letterSpacing="0.05em"
          margin="0"
        >
          {data.title}
        </Text>
      </Box>
    </Flex>
    {/* <HStack width="-webkit-fill-available">
      <Box
        display="flex"
        margin="0 0 0 auto"
        // onClick={(e) => handleModuleStatus(e, { ...module, index: i })}
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
    </HStack> */}
  </Stack>
);

const ModuleMap = ({
  // eslint-disable-next-line no-unused-vars
  width, read, practice, code, answer, title, description, taskTodo,
}) => {
  const updatedRead = read.map((el) => ({
    ...el,
    type: 'Read',
    icon: 'book',
  }));
  const updatedPractice = practice.map((el) => ({
    ...el,
    type: 'Practice',
    icon: 'strenght',
  }));
  const updatedCode = code.map((el) => ({
    ...el,
    type: 'Code',
    icon: 'code',
  }));
  const updatedAnswer = answer.map((el) => ({
    ...el,
    type: 'Answer',
    icon: 'answer',
  }));

  const modules = [...updatedRead, ...updatedPractice, ...updatedCode, ...updatedAnswer];
  // console.log('MODULES__sortedModules:::', modules);
  console.log('taskTodo:::', taskTodo);

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
          color={useColorModeValue('gray.default', 'white')}
          fontWeight="normal"
        >
          {/* {modules.length} */}
          {' '}
          Lessons
        </Heading>
      </Box>
      <Text color={useColorModeValue('#606060', 'white')} size="md">
        {description}
      </Text>
      {modules.map((module, i) => (
        <Module data={module} index={i} />
      ))}
    </Box>
  );
};

ModuleMap.propTypes = {
  width: PropTypes.string,
  title: PropTypes.string,
  read: PropTypes.arrayOf(PropTypes.object),
  practice: PropTypes.arrayOf(PropTypes.object),
  code: PropTypes.arrayOf(PropTypes.object),
  answer: PropTypes.arrayOf(PropTypes.object),
  description: PropTypes.string,
  taskTodo: PropTypes.arrayOf(PropTypes.object),
};
ModuleMap.defaultProps = {
  width: '100%',
  read: [],
  practice: [],
  code: [],
  answer: [],
  title: 'HTML/CSS/Bootstrap',
  description: '',
  taskTodo: [],
};

Module.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  icon: PropTypes.string,
  index: PropTypes.number,
};
Module.defaultProps = {
  data: {},
  icon: 'book',
  index: 0,
};

export default ModuleMap;
