import bc from '../services/breathecode';

export const updateAssignment = ({
  task = {}, closeSettings, toast, githubUrl = '',
}) => {
  // Task case
  const toggleStatus = (task.task_status === undefined || task.task_status === 'PENDING') ? 'DONE' : 'PENDING';
  if (task.task_type !== 'PROJECT') {
    const updatedTask = Object.assign(task, { task_status: toggleStatus });
    bc.todo().update(updatedTask).then(() => {
      toast({
        title: 'Your assignment has been updated successfully',
        status: 'success',
        duration: 6000,
        isClosable: true,
      });

      closeSettings();
    }).catch(() => {
      toast({
        title: 'There was an error updated your assignment',
        status: 'errror',
        duration: 5000,
        isClosable: true,
      });
      closeSettings();
    });
  } else {
    // Project case
    const projectUrl = (task.github_url === undefined || task.github_url === '') ? githubUrl : '';
    const isDelivering = projectUrl !== '';
    const updatedTask = Object.assign(task, { task_status: toggleStatus, github_url: projectUrl });
    bc.todo().update(updatedTask).then((res) => {
      const { data } = res;
      // verify if form is equal to the response
      if (data.github_url === projectUrl) {
        toast({
          // title: `"${res.data.title}" has been updated successfully`,
          title: `Your project ${isDelivering ? 'has been delivered' : 'delivery has been removed'} successfully`,
          description: isDelivering ? `Link: ${data.github_url} has been delivered successfully` : '',
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
        closeSettings();
      }
    }).catch(() => {
      toast({
        title: 'There was an error delivering your project',
        status: 'errror',
        duration: 5000,
        isClosable: true,
      });
      closeSettings();
    });
  }
};

export const nestAssignments = ({
  id, label = '', read, practice, code, answer, taskTodo,
}) => {
  const updatedRead = read.map((el) => ({
    ...el,
    id,
    label,
    type: 'Read',
    icon: 'book',
    task_type: 'LESSON',
  }));
  const updatedPractice = practice.map((el) => ({
    ...el,
    id,
    label,
    type: 'Practice',
    icon: 'strength',
    task_type: 'EXERCISE',
  }));
  const updatedCode = code.map((el) => ({
    ...el,
    id,
    label,
    type: 'Code',
    icon: 'code',
    task_type: 'PROJECT',
  }));
  const updatedAnswer = answer.map((el) => ({
    ...el,
    id,
    label,
    type: 'Answer',
    icon: 'answer',
    task_type: 'QUIZ',
  }));

  const modules = [...updatedRead, ...updatedPractice, ...updatedCode, ...updatedAnswer];

  const includesDailyTask = (module) => {
    const getModules = taskTodo.some((task) => task.associated_slug === module.slug);
    return getModules;
  };

  const filteredModules = modules.filter((module) => includesDailyTask(module));

  return {
    filteredModules,
    modules,
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
