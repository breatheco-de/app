import {
  FormControl, Input, Button, Popover, PopoverTrigger, PopoverContent,
  PopoverArrow, PopoverHeader, PopoverCloseButton, PopoverBody, useDisclosure,
  FormErrorMessage, Box, Link,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Icon from '../../common/components/Icon';
import ModalInfo from './modalInfo';
import validationSchema from '../../common/components/Forms/validationSchemas';
import { isGithubUrl } from '../../utils/regex';

export const IconByTaskStatus = ({ currentTask }) => {
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
      return <Icon icon="checked" color="#FFB718" width="27px" height="27px" />;
    }
    if (currentTask.revision_status === 'DONE') {
      return <Icon icon="verified" color="#25BF6C" width="27px" />;
    }
    if (currentTask.revision_status === 'REJECTED') {
      return <Icon icon="checked" color="#FF4433" width="27px" />;
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

export const ButtonHandlerByTaskStatus = ({
  currentTask, sendProject, changeStatusAssignment, toggleSettings, closeSettings,
  settingsOpen,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showUrlWarn, setShowUrlWarn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');

  const howToSendProjectUrl = 'https://github.com/breatheco-de/app/blob/main/README.md#getting-started';

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

  // PRROJECT CASE
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
      // Option case Revision pending...
      return (
        <>
          <OpenModalButton />
          <ModalInfo
            isOpen={isOpen}
            onClose={onClose}
            title="Review status"
            description="Your teacher is still reviewing your deliver and will provide feedback once it's done"
            linkInfo="Link of project sended to your teacher:"
            link={currentTask.github_url}
            handlerText="Remove delivery"
            actionHandler={(event) => changeStatusAssignment(event, currentTask)}
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
            title="Review status"
            description="Your teacher has successfully received and approved your project"
            linkInfo="Link of project sended to your teacher:"
            link={currentTask.github_url}
            disableHandler
          />
        </>
      );
    }

    if (currentTask.revision_status === 'REJECTED') {
      return (
        <>
          <OpenModalButton />
          <ModalInfo
            isOpen={isOpen}
            onClose={onClose}
            title="Review status"
            description="Your teacher has rejected your project"
            linkInfo="Link of project sended to your teacher:"
            link={currentTask.github_url}
            handlerText="Remove current project link"
            actionHandler={(event) => changeStatusAssignment(event, currentTask)}
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
              onSubmit={() => {
                setIsSubmitting(true);
                if (githubUrl !== '') {
                  const getUrlResult = !isGithubUrl.test(githubUrl);
                  const haveGithubDomain = getUrlResult;
                  if (haveGithubDomain) {
                    setShowUrlWarn(haveGithubDomain);
                  } else {
                    sendProject(currentTask, githubUrl);
                    setIsSubmitting(false);
                  }
                }
              }}
              validationSchema={validationSchema.projectUrlValidation}
            >
              {() => (
                <Form>
                  <Field name="githubUrl">
                    {({ field, form }) => {
                      setGithubUrl(form.values.githubUrl);
                      return (
                        <FormControl isInvalid={form.errors.githubUrl && form.touched.githubUrl}>
                          <Input
                            {...field}
                            type="text"
                            id="githubUrl"
                            placeholder="https://github.com/..."
                          />
                          <FormErrorMessage marginTop="10px">
                            {form.errors.githubUrl}
                          </FormErrorMessage>
                        </FormControl>
                      );
                    }}
                  </Field>
                  <Box padding="6px 0 0 0">
                    <Link href={howToSendProjectUrl} color="blue.default" target="_blank" rel="noopener noreferrer">
                      How to deliver projects
                    </Link>
                  </Box>
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

            <ModalInfo
              isOpen={showUrlWarn}
              closeText="Cancel"
              onClose={() => {
                setShowUrlWarn(false);
                setIsSubmitting(false);
              }}
              title="non-github URL detected"
              description="Usually projects are delivered through Github, are you sure you want to submit a non-github URL?"
              handlerText="Confirm"
              actionHandler={() => {
                setShowUrlWarn(false);
                setIsSubmitting(false);
                sendProject(currentTask, githubUrl);
              }}
              texLink="How to deliver projects"
              link={howToSendProjectUrl}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <TaskButton />
  );
};

ButtonHandlerByTaskStatus.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any).isRequired,
  sendProject: PropTypes.func.isRequired,
  changeStatusAssignment: PropTypes.func.isRequired,
  toggleSettings: PropTypes.func.isRequired,
  closeSettings: PropTypes.func.isRequired,
  settingsOpen: PropTypes.bool.isRequired,
};
