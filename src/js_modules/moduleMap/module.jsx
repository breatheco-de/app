import {
  Box, Heading, Stack, Flex, useColorModeValue, HStack, useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState, memo } from 'react';
import Text from '../../common/components/Text';
import { updateAssignment } from '../../common/hooks/useModuleHandler';
import useModuleMap from '../../common/store/actions/moduleMapAction';
import { getHandlerByTaskStatus } from './taskHandler';
import Icon from '../../common/components/Icon';
import Link from '../../common/components/NextChakraLink';

const Module = ({
  data, taskTodo, currIndex,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { contextState, setContextState } = useModuleMap();
  const [currentTask, setCurrentTask] = useState(null);
  const [, setUpdatedTask] = useState(null);
  const toast = useToast();

  const isWindow = typeof window !== 'undefined';
  const cohortSession = isWindow ? JSON.parse(localStorage.getItem('cohortSession') || '{}') : {};

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
      task, closeSettings, toast, contextState, setContextState,
    });
  };

  const sendProject = (task, githubUrl) => {
    updateAssignment({
      task, closeSettings, toast, githubUrl, contextState, setContextState,
    });
  };

  const isDone = currentTask?.task_status === 'DONE';
  const containerBackground = isDone ? useColorModeValue('featuredLight', 'featuredDark') : useColorModeValue('#FFFFFF', 'primary');

  return (
    <Stack
      direction="row"
      backgroundColor={containerBackground}
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
        <Box display={{ base: 'none', sm: 'flex' }} mr="20px" ml="20px" minWidth="22px" width="22px">
          {data.icon && (
            <Icon
              icon={data.icon || 'book'}
              color={isDone ? '#0097CF' : '#A4A4A4'}
            />
          )}
        </Box>
        <Link href={`/syllabus/${cohortSession.slug}/lesson/${currentTask?.associated_slug}`}>
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
        </Link>
      </Flex>
      <HStack justifyContent="flex-end">
        {getHandlerByTaskStatus({
          currentTask,
          sendProject,
          changeStatusAssignment,
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

export default memo(Module);
