import {
  FormControl, Input, Button, Popover, PopoverTrigger, PopoverContent,
  PopoverArrow, PopoverHeader, PopoverCloseButton, PopoverBody, useDisclosure,
  FormErrorMessage, Box, Link, useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Icon from '../../common/components/Icon';
import ModalInfo from './modalInfo';
import validationSchema from '../../common/components/Forms/validationSchemas';
import { isGithubUrl } from '../../utils/regex';

export const IconByTaskStatus = ({ currentTask }) => {
  // task project status
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
      return <Icon icon="checked" color="#FFB718" width="27px" height="27px" />;
    }
    if (currentTask.revision_status === 'APPROVED') {
      return <Icon icon="verified" color="#25BF6C" width="27px" />;
    }
    if (currentTask.revision_status === 'REJECTED') {
      return <Icon icon="checked" color="#FF4433" width="27px" />;
    }
    return <Icon icon="unchecked" color="#C4C4C4" width="27px" />;
  }
  // common task status
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
  const { t } = useTranslation('dashboard');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showUrlWarn, setShowUrlWarn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const commonInputColor = useColorModeValue('gray.600', 'gray.200');
  const commonInputActiveColor = useColorModeValue('gray.800', 'gray.350');

  const howToSendProjectUrl = 'https://4geeksacademy.notion.site/How-to-deliver-a-project-e1db0a8b1e2e4fbda361fc2f5457c0de';
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
            title={t('modalInfo.title')}
            description={t('modalInfo.still-reviewing')}
            teacherFeedback={currentTask.description}
            linkInfo={t('modalInfo.link-info')}
            link={currentTask.github_url}
            type="taskHandler"
            handlerText={t('modalInfo.rejected.resubmit-assignment')}
            actionHandler={(event) => {
              changeStatusAssignment(event, currentTask, 'PENDING');
              onClose();
            }}
            sendProject={sendProject}
            currentTask={currentTask}
            closeText={t('modalInfo.rejected.remove-delivery')}
          />
        </>
      );
    }
    if (currentTask.revision_status === 'APPROVED') {
      return (
        <>
          <OpenModalButton />
          <ModalInfo
            isOpen={isOpen}
            onClose={onClose}
            title={t('modalInfo.title')}
            description={t('modalInfo.approved')}
            teacherFeedback={currentTask.description}
            linkInfo={t('modalInfo.link-info')}
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
            title={t('modalInfo.title')}
            description={t('modalInfo.rejected.title')}
            type="taskHandler"
            sendProject={sendProject}
            currentTask={currentTask}
            closeText={t('modalInfo.rejected.remove-delivery')}
            teacherFeedback={currentTask.description}
            linkInfo={t('modalInfo.link-info')}
            link={currentTask.github_url}
            handlerText={t('modalInfo.rejected.resubmit-assignment')}
            actionHandler={(event) => {
              changeStatusAssignment(event, currentTask, 'PENDING');
              onClose();
            }}
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
          <PopoverHeader>{t('deliverProject.title')}</PopoverHeader>
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
                            color={commonInputColor}
                            _focus={{
                              color: commonInputActiveColor,
                            }}
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
                      {t('deliverProject.how-to-deliver')}
                    </Link>
                  </Box>
                  <Button
                    mt={4}
                    colorScheme="blue"
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    {t('deliverProject.handler-text')}
                  </Button>
                </Form>
              )}
            </Formik>

            <ModalInfo
              isOpen={showUrlWarn}
              closeText={t('modalInfo.non-github-url.cancel')}
              onClose={() => {
                setShowUrlWarn(false);
                setIsSubmitting(false);
              }}
              title={t('modalInfo.non-github-url.title')}
              description={t('modalInfo.non-github-url.description')}
              handlerText={t('modalInfo.non-github-url.confirm')}
              actionHandler={() => {
                setShowUrlWarn(false);
                setIsSubmitting(false);
                sendProject(currentTask, githubUrl);
              }}
              linkText={t('deliverProject.how-to-deliver')}
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
  currentTask: PropTypes.objectOf(PropTypes.any),
  sendProject: PropTypes.func.isRequired,
  changeStatusAssignment: PropTypes.func.isRequired,
  toggleSettings: PropTypes.func.isRequired,
  closeSettings: PropTypes.func.isRequired,
  settingsOpen: PropTypes.bool.isRequired,
};
ButtonHandlerByTaskStatus.defaultProps = {
  currentTask: null,
};
