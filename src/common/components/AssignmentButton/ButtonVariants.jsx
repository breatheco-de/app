/* eslint-disable react/prop-types */
import {
  Button, Tooltip,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';

const getProjectStatusConfig = (currentTask, isGuidedExperience, hasPendingSubtasks, hexColor, t) => {
  const projectStatusMap = {
    PENDING: {
      PENDING: {
        icon: {
          icon: isGuidedExperience ? 'send-2' : 'longArrowRight',
          color: isGuidedExperience ? hexColor.blueDefault : 'white',
          width: '20px',
        },
        text: hasPendingSubtasks
          ? t('common:taskStatus.pending-subtasks')
          : t('common:taskStatus.send-project'),
      },
    },
    DONE: {
      PENDING: {
        icon: {
          icon: 'checked',
          color: hexColor.yellowDefault,
          width: '20px',
          height: '20px',
        },
        text: t('common:taskStatus.update-project-delivery'),
      },
      APPROVED: {
        icon: {
          icon: 'verified',
          color: hexColor.gray['600'],
          width: '20px',
        },
        text: t('common:taskStatus.project-approved'),
      },
      REJECTED: {
        icon: {
          icon: 'checked',
          color: hexColor.danger,
          width: '20px',
        },
        text: t('common:taskStatus.update-project-delivery'),
      },
    },
  };

  return projectStatusMap[currentTask?.task_status]?.[currentTask?.revision_status] || projectStatusMap.PENDING.PENDING;
};

const getCommonTaskStatusConfig = (currentTask, taskIsApproved, hexColor, t) => {
  const commonStatusMap = {
    DONE: {
      icon: {
        icon: 'close',
        color: hexColor.white,
        width: '12px',
      },
      text: t('common:taskStatus.mark-as-not-done'),
    },
    PENDING: {
      icon: {
        icon: 'checked2',
        color: taskIsApproved ? hexColor.gray['600'] : hexColor.white,
        width: '14px',
      },
      text: t('common:taskStatus.mark-as-done'),
    },
  };

  return commonStatusMap[currentTask?.task_status] || commonStatusMap.PENDING;
};

export function textByTaskStatus(currentTask, isGuidedExperience, hasPendingSubtasks) {
  const { t } = useTranslation('dashboard');
  const { hexColor } = useStyle();
  const taskIsApproved = currentTask?.revision_status === 'APPROVED';

  if (currentTask?.task_type === 'PROJECT') {
    return getProjectStatusConfig(currentTask, isGuidedExperience, hasPendingSubtasks, hexColor, t);
  }

  return getCommonTaskStatusConfig(currentTask, taskIsApproved, hexColor, t);
}

const getProjectIconConfig = (currentTask, hasDeliveryFormat, hexColor) => {
  const projectIconMap = {
    DONE: {
      PENDING: hasDeliveryFormat
        ? { icon: 'checked', color: hexColor.yellowDefault, width: '27px', height: '27px' }
        : { icon: 'verified', color: hexColor.greenLight, width: '27px' },
      APPROVED: { icon: 'verified', color: hexColor.greenLight, width: '27px' },
      REJECTED: { icon: 'checked', color: hexColor.danger, width: '27px' },
    },
  };

  return projectIconMap[currentTask?.task_status]?.[currentTask?.revision_status]
    || { icon: 'unchecked', color: hexColor.gray['300'], width: '27px' };
};

const getCommonIconConfig = (currentTask, hexColor) => {
  const commonIconMap = {
    DONE: { icon: 'verified', color: hexColor.greenLight, width: '27px' },
    PENDING: { icon: 'unchecked', color: hexColor.gray['300'], width: '27px' },
  };

  return commonIconMap[currentTask?.task_status] || commonIconMap.PENDING;
};

function IconByTaskStatus({ currentTask, noDeliveryFormat }) {
  const { hexColor } = useStyle();
  const hasDeliveryFormat = !noDeliveryFormat;

  if (currentTask?.task_type === 'PROJECT' && currentTask.task_status) {
    const iconConfig = getProjectIconConfig(currentTask, hasDeliveryFormat, hexColor);
    return <Icon {...iconConfig} />;
  }

  const iconConfig = getCommonIconConfig(currentTask, hexColor);
  return <Icon {...iconConfig} />;
}

const ButtonVariants = forwardRef(({
  currentTask,
  allowText,
  withTooltip,
  hasPendingSubtasks,
  noDeliveryFormat,
  buttonChildren,
  ...rest
}, ref) => {
  const { hexColor } = useStyle();

  const textAndIcon = textByTaskStatus(currentTask, withTooltip, hasPendingSubtasks);

  // TOOL TIP
  if (withTooltip) {
    return (
      <Tooltip label={textAndIcon.text} placement="top">
        <Button
          ref={ref}
          width="40px"
          height="40px"
          background={hexColor.blueDefault}
          padding="20px"
          borderRadius="full"
          variant="default"
          gridGap="12px"
          {...rest}
        >
          <Icon {...textAndIcon.icon} />
        </Button>
      </Tooltip>
    );
  }

  // ALLOW TEXT
  if (allowText) {
    return (
      <Button
        ref={ref}
        display="flex"
        minWidth="26px"
        minHeight="26px"
        background="blue.default"
        lineHeight="15px"
        padding="12px 24px"
        borderRadius="3px"
        variant="default"
        textTransform="uppercase"
        gridGap="12px"
        {...rest}
      >
        {buttonChildren || (
          <>
            <Icon {...textAndIcon.icon} />
            {textAndIcon.text}
          </>
        )}
      </Button>
    );
  }

  // NO TEXT
  return (
    <Button
      ref={ref}
      className="aaaaa"
      display="flex"
      minWidth="26px"
      minHeight="26px"
      height="fit-content"
      background="none"
      lineHeight="0"
      padding="0"
      borderRadius="30px"
      variant="none"
      textTransform="none"
      gridGap="0"
      {...rest}
    >
      <IconByTaskStatus currentTask={currentTask} noDeliveryFormat={noDeliveryFormat} />
    </Button>
  );
});

ButtonVariants.displayName = 'ButtonVariants';

export default ButtonVariants;

ButtonVariants.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  allowText: PropTypes.bool,
  withTooltip: PropTypes.bool,
  hasPendingSubtasks: PropTypes.bool,
  noDeliveryFormat: PropTypes.bool,
};

ButtonVariants.defaultProps = {
  currentTask: null,
  allowText: false,
  withTooltip: false,
  hasPendingSubtasks: undefined,
  noDeliveryFormat: false,
};
