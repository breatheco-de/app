import {
  Box, Heading, Stack, Flex, useColorModeValue, HStack, Popover,
  PopoverTrigger, PopoverContent, PopoverArrow, Button, PopoverHeader,
  PopoverCloseButton, PopoverBody,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Text from './Text';
import { updateAssignment } from '../hooks/useTodoHandler';
// import Link from './NextChakraLink';

import Icon from './Icon';

const Module = ({
  data, index, taskTodo, contextHandler,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const currentSlug = data.slug ? data.slug : '';

  useEffect(() => {
    setCurrentTask(taskTodo.find((el) => el.task_type === data.task_type
    && el.associated_slug === currentSlug));
  });
  // const currentTask = taskTodo.find((el) => el.task_type === data.task_type
  //   && el.associated_slug === currentSlug);

  const getIconByTaskStatus = () => {
    if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
      if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
        // NOTE: Icon for Revision pending...
        return <Icon icon="group" color="#0097CF" width="27px" />;
      }
      if (currentTask.revision_status === 'DONE') {
        return <Icon icon="verified" color="#0097CF" width="27px" />;
      }
      return <Icon icon="checked" color="#0097CF" width="27px" />;
    }
    if (currentTask && currentTask.task_type !== 'PROJECT' && currentTask.task_status === 'DONE') {
      return <Icon icon="verified" color="#0097CF" width="27px" />;
    }
    return <Icon icon="checked" color="#0097CF" width="27px" />;
  };

  const getOptionsByTaskStatus = () => {
    if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
      if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
        // NOTE: Option case Revision pending...
        return (
          <Button colorScheme="red">Remove current assignment delivery</Button>
        );
      }
      if (currentTask.revision_status === 'DONE') {
        return (
          <Button colorScheme="blue">Approved by teacher</Button>
        );
      }
      return (
        <Button colorScheme="blue">Deliver assignment</Button>
      );
    }

    if (currentTask && currentTask.task_type !== 'PROJECT' && currentTask.task_status === 'DONE') {
      return (
        <Button onClick={() => updateAssignment(currentTask, contextHandler)} colorScheme="red">Mark as NOT read</Button>
      );
    }
    return (
      // { task_status: 'PENDING', github_url: '', revision_status: 'PENDING' }
      <Button
        onClick={() => updateAssignment(currentTask, contextHandler)}
        colorScheme="blue"
      >
        Mark as read
      </Button>
    );
  };

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
      <HStack width="-webkit-fill-available" justifyContent="right">
        <Popover
          id="task-status"
          isOpen={settingsOpen}
          onClose={closeSettings}
          trigger="click"
        >

          <PopoverTrigger>
            <Button
              display="flex"
              // bg="rgba(0,0,0,0)"
              minWidth="26px"
              minHeight="26px"
              height="fit-content"
              padding="0"
              borderRadius="30px"
              onClick={() => toggleSettings()}

              // NOTE: Use Redux
              // When click on task open the page in curren page
              // when when click the button open dropdown with options
              // when click an option open modal

              // onClick={(e) => handleModuleStatus(e, { ...module, index: i })}
            >
              <Box>
                {getIconByTaskStatus(currentTask && currentTask)}
              </Box>
            </Button>
          </PopoverTrigger>

          <PopoverContent>
            <PopoverArrow />
            <PopoverHeader>Select option</PopoverHeader>
            <PopoverCloseButton />
            <PopoverBody>
              {getOptionsByTaskStatus()}
              {/* <Button colorScheme="blue">Mark as read</Button>
              <Button colorScheme="green">Deliver assignments</Button>
              <Button colorScheme="green">Mark as done</Button> */}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>
    </Stack>
  );
};

const ModuleMap = ({
  width, read, practice, code, answer, title, description, taskTodo, changeSingleTask,
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
        <Module
          index={i}
          data={module}
          contextHandler={changeSingleTask}
          taskTodo={taskTodo}
        />
      ))}
    </Box>
  );
};

ModuleMap.propTypes = {
  width: PropTypes.string,
  title: PropTypes.string,
  changeSingleTask: PropTypes.func,
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
  changeSingleTask: () => {},
  description: '',
  taskTodo: [],
};

Module.propTypes = {
  contextHandler: PropTypes.func.isRequired,
  data: PropTypes.objectOf(PropTypes.any),
  index: PropTypes.number,
  taskTodo: PropTypes.arrayOf(PropTypes.object).isRequired,
};
Module.defaultProps = {
  data: {},
  index: 0,
};

export default ModuleMap;
