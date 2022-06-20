/* eslint-disable max-len */
import {
  Button,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
// import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { memo } from 'react';

const ButtonByTaskStatus = ({ currentTask }) => {
  const { t } = useTranslation('assignments');

  if (currentTask && currentTask.task_type) {
    const taskStatus = currentTask.task_status;
    const revisionStatus = currentTask.revision_status;

    const statusConditional = {
      delivered: taskStatus === 'DONE' && revisionStatus === 'PENDING',
      approved: revisionStatus === 'APPROVED',
      rejected: revisionStatus === 'REJECTED',
      undelivered: taskStatus === 'PENDING' && revisionStatus === 'PENDING',
    };

    if (statusConditional.delivered) {
      return (
        <Button variant="default" textTransform="uppercase">
          {t('task-handler.review')}
        </Button>
      );
    }
    if (statusConditional.approved) {
      return (
        <Button variant="link" color="blue.default" _hover={{ textDecoration: 'none' }} textTransform="uppercase">
          {t('task-handler.undo-approval')}
        </Button>
      );
    }
    if (statusConditional.rejected) {
      return (
        <Button variant="outline" textTransform="uppercase">
          {t('task-handler.deliver')}
        </Button>
      );
    }
  }
  return (
    <Button variant="outline" textTransform="uppercase">
      {t('task-handler.deliver')}
    </Button>
  );
};

ButtonByTaskStatus.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any),
  // t: PropTypes.func.isRequired,
};
ButtonByTaskStatus.defaultProps = {
  currentTask: {},
};

const ButtonHandler = ({
  currentTask,
}) => {
  // const { t } = useTranslation('assignments');

  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const [showUrlWarn, setShowUrlWarn] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [githubUrl, setGithubUrl] = useState('');
  // const commonInputColor = useColorModeValue('gray.600', 'gray.200');
  // const commonInputActiveColor = useColorModeValue('gray.800', 'gray.350');

  const OpenModalButton = () => (
    <ButtonByTaskStatus currentTask={currentTask} />
  );

  return (
    <OpenModalButton />
  );
};

ButtonHandler.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any),
  // sendProject: PropTypes.func.isRequired,
  // changeStatusAssignment: PropTypes.func.isRequired,
  // toggleSettings: PropTypes.func.isRequired,
  // closeSettings: PropTypes.func.isRequired,
  // settingsOpen: PropTypes.bool.isRequired,
  // allowText: PropTypes.bool,
  // onClickHandler: PropTypes.func,
};
ButtonHandler.defaultProps = {
  currentTask: null,
  // allowText: false,
  // onClickHandler: () => {},
};

export default memo(ButtonHandler);
