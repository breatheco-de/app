import bc from '../services/breathecode';
// import useModuleMap from '../store/actions/moduleMapAction';

export const test = 'test';
//                                     handle contextHandler
export const updateAssignment = (task = {}) => {
  // const { contextState } = useModuleMap();
  if (task?.task_type !== 'PROJECT') {
    console.log('task:::', task);
    const toggleStatus = (task?.task_status === undefined || task?.task_status === 'PENDING') ? 'DONE' : 'PENDING';
    const updatedTask = Object.assign(task, { task_status: toggleStatus });
    bc.todo().update(updatedTask).then((res) => {
      // Notify.success('Your assignment has been updated successfully');
      console.log('res.data:::', res.data);
      // contextHandler({
      //   taskTodo: [
      //     ...contextState.taskTodo,
      //     {
      //       ...(data.data || data),
      //     },
      //   ],
      // });
    }).catch((error) => {
      console.log('error:::', error);
    });
  }
};
