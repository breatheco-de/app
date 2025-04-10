import React from 'react';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@chakra-ui/react';
import useModuleHandler from '../../../hooks/useModuleHandler';
import useStyle from '../../../hooks/useStyle';

function StatusPill() {
  const { t } = useTranslation('syllabus');
  const { currentTask } = useModuleHandler();
  const { hexColor } = useStyle();

  if (!currentTask || currentTask.task_status === 'PENDING') return null;

  const colorsDict = {
    APPROVED: {
      background: hexColor.greenLight2,
      color: hexColor.greenLight,
    },
    REJECTED: {
      background: 'red.light',
      color: hexColor.danger,
    },
    PENDING: {
      background: 'yellow.light',
      color: hexColor.yellowDefault,
    },
    IGNORED: {
      background: hexColor.greenLight,
      color: hexColor.green,
    },
  };

  const labelsDict = {
    APPROVED: t('approved'),
    PENDING: t('pending'),
    IGNORED: t('approved'),
    REJECTED: t('rejected'),
  };

  const revisionStatus = currentTask.revision_status;

  return (
    <Box
      padding="5px 7px"
      borderRadius="27px"
      background={colorsDict[revisionStatus]?.background}
      color={colorsDict[revisionStatus]?.color}
      fontWeight="500"
      fontSize="13px"
    >
      {labelsDict[revisionStatus]}
    </Box>
  );
}

export default StatusPill;
