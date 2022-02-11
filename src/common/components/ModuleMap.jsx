import {
  Box, Heading, Stack, Flex, useColorModeValue, HStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import Link from './NextChakraLink';
import Icon from './Icon';

const Module = ({
  data, index, taskTodo, cohortSlug,
}) => {
  const currentSlug = data.slug ? data.slug : '';

  const currentTask = taskTodo.find((el) => el.task_type === data.task_type
    && el.associated_slug === currentSlug);
  return (
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
          {data.icon && (
            <Icon icon={data.icon || 'book'} color="#0097CF" />
          )}
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
      <HStack width="-webkit-fill-available">
        <Box
          display="flex"
          margin="0 0 0 auto"

          // NOTE: USAR REDUX

          // onClick={(e) => handleModuleStatus(e, { ...module, index: i })}
          // onClick={() => {
          //   console.log('click');
          // }}
        >
          {currentTask && currentTask.task_type !== 'PROJECT' && currentTask.task_status === 'DONE' ? (
            <Icon icon="verified" width="27px" />
          ) : (
            <Link
              href={`/syllabus/${cohortSlug}/lesson/${data.slug}`}
              color="#0097CF"
              fontWeight="bold"
              fontStyle="normal"
            >
              Open lesson
            </Link>
          )}
        </Box>
      </HStack>
    </Stack>
  );
};

const ModuleMap = ({
  width, read, practice, code, answer, title, description, taskTodo, cohortSlug,
}) => {
  const updatedRead = read.map((el) => ({
    ...el,
    type: 'Read',
    icon: 'book',
    task_type: 'LESSON',
  }));
  const updatedPractice = practice.map((el) => ({
    ...el,
    type: 'Practice',
    icon: 'strength',
    task_type: 'EXERCISE',
  }));
  const updatedCode = code.map((el) => ({
    ...el,
    type: 'Code',
    icon: 'code',
    task_type: 'PROJECT',
  }));
  const updatedAnswer = answer.map((el) => ({
    ...el,
    type: 'Answer',
    icon: 'answer',
    task_type: 'QUIZ',
  }));

  const modules = [...updatedRead, ...updatedPractice, ...updatedCode, ...updatedAnswer];
  // console.log('MODULES__sortedModules:::', modules);
  // console.log('taskTodo:::', taskTodo);

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
        <Module data={module} index={i} taskTodo={taskTodo} cohortSlug={cohortSlug} />
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
  cohortSlug: PropTypes.string,
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
  cohortSlug: '',
};

Module.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  index: PropTypes.number,
  taskTodo: PropTypes.arrayOf(PropTypes.object).isRequired,
  cohortSlug: PropTypes.string,
};
Module.defaultProps = {
  data: {},
  index: 0,
  cohortSlug: '',
};

export default ModuleMap;
