import {
  FormControl, Input, Button, Popover, PopoverTrigger, PopoverContent,
  PopoverArrow, PopoverHeader, PopoverCloseButton, PopoverBody, useDisclosure,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import Icon from '../../common/components/Icon';
import ModalInfo from './modalInfo';

export const IconByTaskStatus = ({ currentTask }) => {
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
      // NOTE: Icon for Revision pending...
      return <Icon icon="checked" color="#FFB718" width="27px" height="27px" />;
    }
    if (currentTask.revision_status === 'DONE') {
      return <Icon icon="verified" color="#25BF6C" width="27px" />;
    }
    return <Icon icon="unchecked" color="#C4C4C4" width="27px" />;
  }
  if (currentTask && currentTask.task_type !== 'PROJECT' && currentTask.task_status === 'DONE') {
    return <Icon icon="verified" color="#25BF6C" width="27px" />;
  }
  return <Icon icon="unchecked" color="#C4C4C4" width="27px" />;
};

IconByTaskStatus.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any),
};
IconByTaskStatus.defaultProps = {
  currentTask: {},
};

export const getHandlerByTaskStatus = ({
  currentTask, sendProject, changeStatusAssignment, toggleSettings, closeSettings,
  settingsOpen,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const TaskButton = () => (
    <Button
      display="flex"
      onClick={(event) => changeStatusAssignment(event, currentTask)}
      minWidth="26px"
      minHeight="26px"
      height="fit-content"
      background="none"
      padding="0"
      borderRadius="30px"
    >
      <IconByTaskStatus currentTask={currentTask} />
    </Button>
  );

  const OpenModalButton = () => (
    <Button
      onClick={onOpen}
      display="flex"
      minWidth="26px"
      minHeight="26px"
      height="fit-content"
      background="none"
      padding="0"
      borderRadius="30px"
    >
      <IconByTaskStatus currentTask={currentTask} />
    </Button>
  );

  // NOTE: PRROJECT CASE
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
      // Option case Revision pending...
      return (
        <>
          <OpenModalButton />
          <ModalInfo
            isOpen={isOpen}
            onClose={onClose}
            description="Your teacher is still reviewing your deliver and will provide feedback once it's done"
            projectUrl={currentTask.github_url}
            removeDelivery={(event) => changeStatusAssignment(event, currentTask)}
          />
        </>
      );
    }
    if (currentTask.revision_status === 'DONE') {
      return (
        <>
          <OpenModalButton />
          <ModalInfo
            isOpen={isOpen}
            onClose={onClose}
            isDone
          />
        </>
      );
    }

    return (
      <Popover
        id="task-status"
        isOpen={settingsOpen}
        onClose={closeSettings}
        trigger="click"
      >

        <PopoverTrigger>
          <Button
            display="flex"
            minWidth="26px"
            minHeight="26px"
            height="fit-content"
            background="none"
            padding="0"
            borderRadius="30px"
            onClick={() => toggleSettings()}
          >
            <IconByTaskStatus currentTask={currentTask} />
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>Github repository url</PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            <Formik
              initialValues={{ githubUrl: '' }}
              onSubmit={(values) => {
                // console.log('values:::', values);
                if (values.githubUrl !== '') {
                // NOTE_BUG: when the user starts module and send the link, it not sends to
                // the endpoint, It occurs by the taskTodo persistent not changes in localStorage
                  sendProject(currentTask, values.githubUrl);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Field name="githubUrl">
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.githubUrl && form.touched.githubUrl}>
                        <Input
                          {...field}
                          type="url"
                          id="githubUrl"
                          placeholder="https://github.com/..."
                        />
                      </FormControl>
                    )}
                  </Field>
                  <Button
                    mt={4}
                    colorScheme="blue"
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    Deliver assignment
                  </Button>
                </Form>
              )}
            </Formik>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <TaskButton />
  );
};
