import {
  Box, Heading, Stack, Flex, useColorModeValue, HStack, useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Text from '../../common/components/Text';
import { updateAssignment } from '../../common/hooks/useModuleHandler';
import { IconByTaskStatus, getHandlerByTaskStatus } from './taskHandler';
import Icon from '../../common/components/Icon';

const Module = ({
  data, taskTodo, currIndex,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [, setUpdatedTask] = useState(null);
  const toast = useToast();

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
  }, [taskTodo, data.task_type, currentSlug]);

  const changeStatusAssignment = (event, task) => {
    event.preventDefault();
    //  setUpdatedTask, has been added because currentTask cant update when task status is changed
    setUpdatedTask({
      ...task,
    });
    updateAssignment({
      task, closeSettings, toast,
    });
  };

  const sendProject = (task, githubUrl) => {
    updateAssignment({
      task, closeSettings, toast, githubUrl,
    });
  };

  const isDone = currentTask?.task_status === 'DONE';
  const containerBackground = isDone ? useColorModeValue('featuredLight', 'featuredDark') : useColorModeValue('#FFFFFF', 'primary');

  return (
    <Stack
      direction="row"
      backgroundColor={containerBackground}
      // featuredDark
      // #C4C4C4
      border={`${useColorModeValue('1px', '2px')} solid`}
      borderColor={isDone ? 'transparent' : useColorModeValue('#C4C4C4', 'gray.700')}
      height="auto"
      py="10px"
      px="15px"
      my="10px"
      rounded="2xl"
      overflow="hidden"
      key={`${data.title}-${currIndex}`}
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
          background={isDone ? '#0097CF' : '#BFBFBF'}
        >
          <Text fontWeight="bold" margin="0" size="sm" color="#FFFFFF">
            {currIndex + 1}
          </Text>
        </Box>
        <Box mr="20px" ml="20px" display="flex" minWidth="22px" width="22px">
          {data.icon && (
            <Icon
              icon={data.icon || 'book'}
              color={isDone ? '#0097CF' : '#A4A4A4'}
            />
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
            fontWeight="900"
            textTransform="uppercase"
          >
            {data.type || 'Read'}
          </Heading>
          <Text
            size="l"
            fontWeight="normal"
            lineHeight="18px"
            letterSpacing="0.05em"
            margin="0"
          >
            {data.title}
          </Text>
        </Box>
      </Flex>
      <HStack justifyContent="flex-end">
        {getHandlerByTaskStatus({
          currentTask,
          sendProject,
          changeStatusAssignment,
          icon: <IconByTaskStatus currentTask={currentTask} />,
          toggleSettings,
          closeSettings,
          settingsOpen,
        })}
      </HStack>
    </Stack>
  );
};

Module.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  currIndex: PropTypes.number,
  taskTodo: PropTypes.arrayOf(PropTypes.object).isRequired,
};
Module.defaultProps = {
  data: {},
  currIndex: 0,
};

export default Module;
