import useTranslation from 'next-translate/useTranslation';
import useModuleMap from '../store/actions/moduleMapAction';
import bc from '../services/breathecode';
import { reportDatalayer } from '../../utils/requests';
import useCustomToast from './useCustomToast';

function useModuleHandler() {
  const { t } = useTranslation('alert-message');
  const { createToast } = useCustomToast({ toastId: ' assignment-update-task' });
  const { setTaskTodo, setCohortProgram, state, setCurrentTask, setSubTasks, setNextModule, setPrevModule } = useModuleMap();
  const { taskTodo } = state;

  const updateAssignment = async ({
    task, closeSettings, githubUrl, taskStatus,
  }) => {
    // Task case
    const { cohort, ...taskData } = task;
    const toggleStatus = (task.task_status === undefined || task.task_status === 'PENDING') ? 'DONE' : 'PENDING';
    if (task.task_type && task.task_type !== 'PROJECT') {
      const taskToUpdate = {
        ...taskData,
        id: taskData.id,
        task_status: toggleStatus,
      };

      try {
        await bc.todo().update(taskToUpdate);
        const keyIndex = taskTodo.findIndex((x) => x.id === task.id);
        setTaskTodo([
          ...taskTodo.slice(0, keyIndex), // before keyIndex (inclusive)
          taskToUpdate, // key item (updated)
          ...taskTodo.slice(keyIndex + 1), // after keyIndex (exclusive)
        ]);
        createToast({
          position: 'top',
          title: t('alert-message:assignment-updated'),
          status: 'error',
          duration: 6000,
          isClosable: true,
          silent: false,
        });
        closeSettings();
      } catch (error) {
        console.log(error);
        createToast({
          position: 'top',
          title: t('alert-message:assignment-update-error'),
          status: 'error',
          duration: 5000,
          isClosable: true,
          silent: false,
        });
        closeSettings();
      }
    } else {
      // Project case
      const getProjectUrl = () => {
        if (githubUrl) {
          return githubUrl;
        }
        return '';
      };

      const projectUrl = getProjectUrl();

      const isDelivering = projectUrl !== '';
      // const linkIsRemoved = task.task_type === 'PROJECT' && !isDelivering;
      const taskToUpdate = {
        ...taskData,
        task_status: taskStatus || toggleStatus,
        github_url: projectUrl,
        revision_status: 'PENDING',
        delivered_at: new Date(),
      };

      try {
        const response = await bc.todo({}).update(taskToUpdate);
        // verify if form is equal to the response
        if (response.data.github_url === projectUrl) {
          const keyIndex = taskTodo.findIndex((x) => x.id === task.id);
          setTaskTodo([
            ...taskTodo.slice(0, keyIndex), // before keyIndex (inclusive)
            taskToUpdate, // key item (updated)
            ...taskTodo.slice(keyIndex + 1), // after keyIndex (exclusive)
          ]);
          reportDatalayer({
            dataLayer: {
              event: 'assignment_status_updated',
              task_status: taskStatus,
              task_id: task.id,
              task_title: task.title,
              task_associated_slug: task.associated_slug,
              task_type: task.task_type,
              task_revision_status: task.revision_status,
            },
          });
          createToast({
            position: 'top',
            title: isDelivering
              ? t('alert-message:delivery-success')
              : t('alert-message:delivery-removed'),
            status: 'success',
            duration: 6000,
            isClosable: true,
            silent: false,
          });
          closeSettings();
        }
      } catch (error) {
        console.log(error);
        createToast({
          position: 'top',
          title: t('alert-message:delivery-error'),
          status: 'error',
          duration: 5000,
          isClosable: true,
          silent: false,
        });
        closeSettings();
      }
    }
  };

  const startDay = async ({
    newTasks, label, customHandler = () => {},
  }) => {
    try {
      const response = await bc.todo({}).add(newTasks);

      if (response.status < 400) {
        createToast({
          position: 'top',
          title: label
            ? t('alert-message:module-started', { title: label })
            : t('alert-message:module-sync-success'),
          status: 'success',
          duration: 6000,
          isClosable: true,
          silent: false,
        });
        setTaskTodo([
          ...taskTodo,
          ...response.data,
        ]);
        customHandler();
      }
    } catch (err) {
      console.log('error_ADD_TASK 🔴 ', err);
      createToast({
        position: 'top',
        title: t('alert-message:module-start-error'),
        status: 'error',
        duration: 6000,
        isClosable: true,
        silent: false,
      });
    }
  };

  return {
    updateAssignment,
    startDay,
    setTaskTodo,
    setCohortProgram,
    setCurrentTask,
    setSubTasks,
    setNextModule,
    setPrevModule,
    ...state,
  };
}

export default useModuleHandler;
