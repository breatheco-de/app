import { memo } from 'react';
import PropTypes from 'prop-types';
import Text from './Text';

const TaskLabel = ({ currentTask }) => {
  const getStatus = () => {
    if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
      if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
        return {
          status: 'delivered',
          msg: 'Delivered',
        };
      }
      if (currentTask.revision_status === 'APPROVED') {
        return {
          status: 'approved',
          msg: 'Approved',
        };
      }
      if (currentTask.revision_status === 'REJECTED') {
        return {
          status: 'rejected',
          msg: 'Rejected',
        };
      }
    }
    return {
      status: 'undelivered',
      msg: 'Undelivered',
    };
  };

  const task = getStatus();
  const { status, msg } = task;
  const borderColor = {
    delivered: 'success',
    approved: 'success',
    rejected: 'danger',
    undelivered: 'yellow.default',
  };

  const backgroundColor = {
    approved: 'success',
    rejected: 'danger',
  };

  const fontColor = {
    delivered: 'success',
    approved: 'white',
    rejected: 'white',
    undelivered: 'yellow.default',
  };

  return (
    <Text
      border="1px solid"
      borderColor={borderColor[status]}
      backgroundColor={backgroundColor[status] || 'transparent'}
      color={fontColor[status]}
      borderRadius="14.5px"
      as="label"
      size="13px"
      p="5px 11px"
    >
      {msg}
    </Text>
  );
};

TaskLabel.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any).isRequired,
};

TaskLabel.defaultProps = {
};

export default memo(TaskLabel);
