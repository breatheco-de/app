import React from 'react';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@chakra-ui/react';
import useModuleHandler from '../../common/hooks/useModuleHandler';

function SubtasksPill() {
  const { t } = useTranslation('common');
  const { subTasks } = useModuleHandler();

  if (!Array.isArray(subTasks) || subTasks.length === 0) return null;

  const tasksDone = subTasks.length > 0 && subTasks?.filter((subtask) => subtask.status === 'DONE');

  return (
    <Box padding="5px 7px" fontSize="13px" borderRadius="27px" border="1px solid #0084FF" color="#0084FF">
      {`${tasksDone.length} / ${subTasks.length} ${t('tasks')}`}
    </Box>
  );
}

export default SubtasksPill;
