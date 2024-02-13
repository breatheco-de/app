import { differenceInDays } from 'date-fns';
import bc from '../services/breathecode';
import { reportDatalayer } from '../../utils/requests';

export const updateAssignment = async ({
  t, task, closeSettings, toast, githubUrl, contextState, setContextState, taskStatus,
}) => {
  // Task case
  const toggleStatus = (task.task_status === undefined || task.task_status === 'PENDING') ? 'DONE' : 'PENDING';
  if (task.task_type && task.task_type !== 'PROJECT') {
    const taskToUpdate = {
      ...task,
      id: task.id,
      task_status: toggleStatus,
    };

    try {
      await bc.todo({}).update(taskToUpdate);
      const keyIndex = contextState.taskTodo.findIndex((x) => x.id === task.id);
      setContextState({
        ...contextState,
        taskTodo: [
          ...contextState.taskTodo.slice(0, keyIndex), // before keyIndex (inclusive)
          taskToUpdate, // key item (updated)
          ...contextState.taskTodo.slice(keyIndex + 1), // after keyIndex (exclusive)
        ],
      });
      toast({
        position: 'top',
        title: t('alert-message:assignment-updated'),
        status: 'success',
        duration: 6000,
        isClosable: true,
      });

      closeSettings();
    } catch (error) {
      console.log(error);
      toast({
        position: 'top',
        title: t('alert-message:assignment-update-error'),
        status: 'errror',
        duration: 5000,
        isClosable: true,
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
      ...task,
      task_status: taskStatus || toggleStatus,
      github_url: projectUrl,
      revision_status: 'PENDING',
      delivered_at: new Date(),
    };

    try {
      const response = await bc.todo({}).update(taskToUpdate);
      // verify if form is equal to the response
      if (response.data.github_url === projectUrl) {
        const keyIndex = contextState.taskTodo.findIndex((x) => x.id === task.id);
        setContextState({
          ...contextState,
          taskTodo: [
            ...contextState.taskTodo.slice(0, keyIndex), // before keyIndex (inclusive)
            taskToUpdate, // key item (updated)
            ...contextState.taskTodo.slice(keyIndex + 1), // after keyIndex (exclusive)
          ],
        });
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
        toast({
          position: 'top',
          // title: `"${res.data.title}" has been updated successfully`,
          title: isDelivering
            ? t('alert-message:delivery-success')
            : t('alert-message:delivery-removed'),
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
        closeSettings();
      }
    } catch (error) {
      console.log(error);
      toast({
        position: 'top',
        title: t('alert-message:delivery-error'),
        status: 'errror',
        duration: 5000,
        isClosable: true,
      });
      closeSettings();
    }
  }
};

export const startDay = async ({
  t, newTasks, label, contextState, setContextState, toast, customHandler = () => {},
}) => {
  try {
    const response = await bc.todo({}).add(newTasks);

    if (response.status < 400) {
      toast({
        position: 'top',
        title: label
          ? t('alert-message:module-started', { title: label })
          : t('alert-message:module-sync-success'),
        // title: `Module ${label ? `${label}started` : 'synchronized'} successfully`,
        status: 'success',
        duration: 6000,
        isClosable: true,
      });
      setContextState({
        ...contextState,
        taskTodo: [
          ...contextState.taskTodo,
          ...response.data,
        ],
      });
      customHandler();
    }
  } catch (err) {
    console.log('error_ADD_TASK 🔴 ', err);
    toast({
      position: 'top',
      title: t('alert-message:module-start-error'),
      status: 'error',
      duration: 6000,
      isClosable: true,
    });
  }
};

export const nestAssignments = ({
  id, label = '', read, practice, project, answer, taskTodo = [],
}) => {
  const getTaskProps = (slug) => taskTodo.find(
    (task) => task.associated_slug === slug,
  );
  const currentDate = new Date();

  const updatedRead = read?.map((el) => ({
    ...el,
    id,
    label,
    task_status: getTaskProps(el.slug)?.task_status || '',
    revision_status: getTaskProps(el.slug)?.revision_status || '',
    created_at: getTaskProps(el.slug)?.created_at || '',
    position: el.position,
    type: 'Read',
    icon: 'book',
    task_type: 'LESSON',
  })).sort((a, b) => b.position - a.position);

  const updatedPractice = practice?.map((el) => ({
    ...el,
    id,
    label,
    task_status: getTaskProps(el.slug)?.task_status || '',
    revision_status: getTaskProps(el.slug)?.revision_status || '',
    created_at: getTaskProps(el.slug)?.created_at || '',
    position: el.position,
    type: 'Practice',
    icon: 'strength',
    task_type: 'EXERCISE',
  })).sort((a, b) => b.position - a.position);

  const updatedProject = project?.map((el) => {
    const taskProps = getTaskProps(el?.slug?.slug || el?.slug);

    return ({
      ...el,
      id,
      label,
      slug: el?.slug?.slug || el?.slug,
      task_status: taskProps?.task_status || '',
      revision_status: taskProps?.revision_status || '',
      created_at: taskProps?.created_at || '',
      daysDiff: taskProps?.created_at ? differenceInDays(currentDate, new Date(taskProps?.created_at)) : '',
      position: el.position,
      mandatory: el.mandatory,
      type: 'Project',
      icon: 'code',
      task_type: 'PROJECT',
    });
  }).sort((a, b) => b.position - a.position);

  const updatedAnswer = answer?.map((el) => ({
    ...el,
    id,
    label,
    task_status: getTaskProps(el.slug)?.task_status || '',
    revision_status: getTaskProps(el.slug)?.revision_status || '',
    created_at: getTaskProps(el.slug)?.created_at || '',
    position: el.position,
    type: 'Answer',
    icon: 'answer',
    task_type: 'QUIZ',
  })).sort((a, b) => b.position - a.position);

  const modules = [...updatedRead, ...updatedPractice, ...updatedProject, ...updatedAnswer];

  const includesDailyTask = (module) => {
    const getModules = taskTodo.some((task) => task.associated_slug === module.slug);
    return getModules;
  };

  const includesStatusPending = (module) => {
    const getModules = module.task_status === 'PENDING' && module.revision_status !== 'APPROVED';
    return getModules;
  };

  const filteredModules = modules.filter((module) => includesDailyTask(module));
  const filteredModulesByPending = modules.filter((module) => includesStatusPending(module));

  return {
    filteredModules,
    modules,
    filteredModulesByPending,
  };
  /*
    example:
    filteredModules: [{...}, {...}, {...}]
    filteredModules: [{...}, {...}]
    filteredModules: []
    filteredModules: []
    filteredModules: [{...}]
    --------------------------------------------------
    modules: [{...}, {...}, {...}]
    modules: [{...}, {...}]
    modules: [{...}, {...}, {...}, {...}, {...}]
  */
};

export const getTechonologies = (cohortDays) => {
  let technologyTags = [];

  for (let i = 0; i < cohortDays.length; i += 1) {
    if (typeof cohortDays[i].technologies === 'string') technologyTags.push(cohortDays[i].technologies);
    if (Array.isArray(cohortDays[i].technologies)) {
      technologyTags = technologyTags.concat(cohortDays[i].technologies);
    }
  }
  technologyTags = [...new Set(technologyTags)];

  return technologyTags;
};
