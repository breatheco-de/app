import {
  useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState, memo } from 'react';
import { updateAssignment } from '../../common/hooks/useModuleHandler';
import useModuleMap from '../../common/store/actions/moduleMapAction';
import { ButtonHandlerByTaskStatus } from './taskHandler';
import ModuleComponent from '../../common/components/Module';
import { isWindow } from '../../utils/index';
// import { usePersistent } from '../../common/hooks/usePersistent';

const Module = ({
  data, taskTodo, currIndex,
}) => {
  // const [cohortSession] = usePersistent('cohortSession', {});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { contextState, setContextState } = useModuleMap();
  const [currentTask, setCurrentTask] = useState(null);
  const [, setUpdatedTask] = useState(null);
  const toast = useToast();

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

  const changeStatusAssignment = (event, task, taskStatus) => {
    event.preventDefault();
    setUpdatedTask({
      ...task,
    });
    updateAssignment({
      task, taskStatus, closeSettings, toast, contextState, setContextState,
    });
  };

  const sendProject = (task, githubUrl, taskStatus) => {
    updateAssignment({
      task, closeSettings, toast, githubUrl, taskStatus, contextState, setContextState,
    });
  };

  const isDone = currentTask?.task_status === 'DONE' || currentTask?.revision_status === 'APPROVED';

  return (
    <ModuleComponent
      currIndex={currIndex}
      textWithLink
      link={`/syllabus/${cohortSession.slug}/${data.type.toLowerCase()}/${currentTask?.associated_slug}`}
      isDone={isDone}
      data={{
        type: data.type || 'Read',
        title: data.title,
        icon: data.icon,
      }}
      rightItemHandler={(
        <ButtonHandlerByTaskStatus
          currentTask={currentTask}
          sendProject={sendProject}
          changeStatusAssignment={changeStatusAssignment}
          toggleSettings={toggleSettings}
          closeSettings={closeSettings}
          settingsOpen={settingsOpen}
        />
      )}
    />
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
