import React from 'react';
import useModuleHandler from '../../common/hooks/useModuleHandler';
import ProgressCircle from '../../common/components/ProgressCircle';

function SubtasksPill() {
  const { subTasks } = useModuleHandler();

  if (!Array.isArray(subTasks) || subTasks.length === 0) return null;

  const tasksDone = subTasks.length > 0 && subTasks?.filter((subtask) => subtask.status === 'DONE');
  const taskPercent = Math.round((tasksDone.length / subTasks.length) * 100);

  return (
    <ProgressCircle size={40} duration={1} delay={0.3} percents={taskPercent} counterString={`${tasksDone.length} / ${subTasks.length}`} />
  );
}

export default SubtasksPill;
