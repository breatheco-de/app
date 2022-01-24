import bc from '../services/breathecode';

export const test = 'test';
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
    const projectUrl = (task?.github_url === undefined || task?.github_url === '') ? githubUrl : '';
    const isDelivering = projectUrl !== '';
    const updatedTask = Object.assign(task, { task_status: toggleStatus, github_url: projectUrl });
    bc.todo().update(updatedTask).then(() => {
      toast({
        // title: `"${res.data.title}" has been updated successfully`,
        title: `Your project ${isDelivering ? 'has been delivered' : 'delivery has been removed'} successfully`,
        status: 'success',
        duration: 6000,
        isClosable: true,
      });
      closeSettings();
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
