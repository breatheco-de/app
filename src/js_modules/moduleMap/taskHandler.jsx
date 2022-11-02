import {
  FormControl, Input, Button, Popover, PopoverTrigger, PopoverContent,
  PopoverArrow, PopoverHeader, PopoverCloseButton, PopoverBody, useDisclosure,
  FormErrorMessage, Box, Link, useColorModeValue, useToast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Icon from '../../common/components/Icon';
import ModalInfo from './modalInfo';
import validationSchema from '../../common/components/Forms/validationSchemas';
import { isGithubUrl } from '../../utils/regex';
import Text from '../../common/components/Text';
import bc from '../../common/services/breathecode';
import useStyle from '../../common/hooks/useStyle';
import { formatBytes } from '../../utils';

export const TextByTaskStatus = ({ currentTask, t }) => {
  const taskIsAproved = currentTask?.revision_status === 'APPROVED';
  // task project status
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
      return (
        <>
          <Icon icon="checked" color="#FFB718" width="20px" height="20px" />
          {t('common:taskStatus.update-project-delivery')}
        </>
      );
    }
    if (currentTask.revision_status === 'APPROVED') {
      return (
        <>
          <Icon icon="verified" color="#606060" width="20px" />
          {t('common:taskStatus.project-approved')}
        </>
      );
    }
    if (currentTask.revision_status === 'REJECTED') {
      return (
        <>
          <Icon icon="checked" color="#FF4433" width="20px" />
          {t('common:taskStatus.update-project-delivery')}
        </>
      );
    }
    return (
      <>
        <Icon icon="unchecked" color="#C4C4C4" width="20px" />
        {t('common:taskStatus.send-project')}
      </>
    );
  }
  // common task status
  if (currentTask && currentTask.task_type !== 'PROJECT' && currentTask.task_status === 'DONE') {
    return (
      <>
        <Icon icon="close" color="#FFFFFF" width="12px" />
        {t('common:taskStatus.mark-as-not-done')}
      </>
    );
  }
  return (
    <>
      <Icon icon="checked2" color={taskIsAproved ? '#606060' : '#FFFFFF'} width="14px" />
      {t('common:taskStatus.mark-as-done')}
    </>
  );
};

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

TextByTaskStatus.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any),
  t: PropTypes.func.isRequired,
};
TextByTaskStatus.defaultProps = {
  currentTask: {},
};
IconByTaskStatus.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any),
};
IconByTaskStatus.defaultProps = {
  currentTask: {},
};

export const ButtonHandlerByTaskStatus = ({
  currentTask, sendProject, changeStatusAssignment, toggleSettings, closeSettings,
  settingsOpen, allowText, onClickHandler, currentAssetData,
}) => {
  const { t } = useTranslation('dashboard');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showUrlWarn, setShowUrlWarn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [assetData, setAssetData] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [fileProps, setFileProps] = useState([]);
  const commonInputColor = useColorModeValue('gray.600', 'gray.200');
  const commonInputActiveColor = useColorModeValue('gray.800', 'gray.350');
  const taskIsAproved = allowText && currentTask?.revision_status === 'APPROVED';

  const mimeTypes = 'application/pdf,image/png,image/jpeg,image/jpg,image/gif';
  // const mimeTypes = assetData?.delivery_formats.replace('url', '');
  const maxFileSize = 1048576 * 10; // 10mb
  const fileErrorExists = fileProps.some((file) => file.formatError) || fileProps.some((file) => file.sizeError);

  const { featuredColor, modal, hexColor } = useStyle();
  const toast = useToast();
  const formats = ['image/', 'application/', 'text/'];
  const deliveryFormatExists = formats.some((res) => currentAssetData?.delivery_formats.includes(res));
  // const formatExists = currentAssetData?.delivery_formats?.includes('application') || currentAssetData?.delivery_formats?.includes('image');

  const howToSendProjectUrl = 'https://4geeksacademy.notion.site/How-to-deliver-a-project-e1db0a8b1e2e4fbda361fc2f5457c0de';
  const TaskButton = () => (
    <Button
      display="flex"
      onClick={(event) => {
        changeStatusAssignment(event, currentTask);
        onClickHandler();
      }}
      disabled={taskIsAproved}
      minWidth="26px"
      minHeight="26px"
      background={allowText ? 'blue.default' : 'none'}
      lineHeight={allowText ? '15px' : '0'}
      padding={allowText ? '12px 24px' : '0'}
      borderRadius={allowText ? '3px' : '30px'}
      variant={allowText ? 'default' : 'none'}
      textTransform={allowText ? 'uppercase' : 'none'}
      gridGap={allowText ? '12px' : '0'}
    >
      {allowText ? (
        <TextByTaskStatus currentTask={currentTask} t={t} />
      ) : (
        <IconByTaskStatus currentTask={currentTask} />
      )}
    </Button>
  );

  const handleOpen = async () => {
    if (currentTask && currentTask?.task_type === 'PROJECT' && currentTask.task_status === 'DONE') {
      const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
      if (assetResp && assetResp.status < 400) {
        const data = await assetResp.data;

        if (data?.delivery_formats === 'file') {
          const fileResp = await bc.todo().getFile({ id: currentTask.id });
          const respData = await fileResp.data;
          setFileData(respData[0]);
          onOpen();
        } else {
          setAssetData(data);
          onOpen();
        }
      } else {
        onOpen();
      }
    }
  };

  const OpenModalButton = () => (
    <Button
      onClick={() => handleOpen()}
      disabled={taskIsAproved}
      display="flex"
      minWidth="26px"
      minHeight="26px"
      height="fit-content"
      background={allowText ? 'blue.default' : 'none'}
      lineHeight={allowText ? '15px' : '0'}
      padding={allowText ? '12px 24px' : '0'}
      borderRadius={allowText ? '3px' : '30px'}
      variant={allowText ? 'default' : 'none'}
      textTransform={allowText ? 'uppercase' : 'none'}
      gridGap={allowText ? '12px' : '0'}
    >
      {allowText ? (
        <TextByTaskStatus currentTask={currentTask} t={t} />
      ) : (
        <IconByTaskStatus currentTask={currentTask} />
      )}
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
            link={fileData?.url || currentTask.github_url}
            markdownDescription={assetData?.delivery_instructions}
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
            markdownDescription={assetData?.delivery_instructions}
            teacherFeedback={currentTask.description}
            linkInfo={t('modalInfo.link-info')}
            link={fileData?.url || currentTask.github_url}
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
            markdownDescription={assetData?.delivery_instructions}
            type="taskHandler"
            sendProject={sendProject}
            currentTask={currentTask}
            closeText={t('modalInfo.rejected.remove-delivery')}
            teacherFeedback={currentTask.description}
            linkInfo={t('modalInfo.link-info')}
            link={fileData?.url || currentTask.github_url}
            handlerText={t('modalInfo.rejected.resubmit-assignment')}
            actionHandler={(event) => {
              changeStatusAssignment(event, currentTask, 'PENDING');
              onClose();
            }}
          />
        </>
      );
    }

    const handleCloseFile = () => {
      setFileProps([]);
      closeSettings();
    };

    const handleUpload = async () => {
      const formdata = new FormData();
      // formdata.append('file', fileProps.file);
      Array.from(fileProps).forEach(({ file }) => {
        formdata.append('file', file);
      });
      const resp = await bc.todo().uploadFile(currentTask.id, formdata);

      if (resp?.status < 400) {
        const respData = resp.data[0];
        sendProject({
          task: currentTask,
          githubUrl: respData?.url,
        });
        toast({
          title: t('alert-message:file-name-uploaded', { filename: `"${respData.name}"` }),
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        closeSettings();
      } else {
        toast({
          title: t('alert-message:something-went-wrong-with', { property: 'Files' }),
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    };

    console.log('fileProps:::', fileProps);

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
            variant={allowText ? 'default' : 'none'}
            disabled={taskIsAproved}
            minWidth="26px"
            minHeight="26px"
            height="fit-content"
            background={allowText ? 'blue.default' : 'none'}
            lineHeight={allowText ? '15px' : '0'}
            padding={allowText ? '12px 24px' : '0'}
            borderRadius={allowText ? '3px' : '30px'}
            textTransform={allowText ? 'uppercase' : 'none'}
            gridGap={allowText ? '12px' : '0'}
            onClick={() => toggleSettings(currentTask.associated_slug)}
          >
            {allowText ? (
              <TextByTaskStatus currentTask={currentTask} t={t} />
            ) : (
              <IconByTaskStatus currentTask={currentTask} />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>{t('deliverProject.title')}</PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            {typeof currentAssetData === 'object' && currentAssetData?.delivery_formats.includes('urlqwd') && (
              <Formik
                initialValues={{ githubUrl: '' }}
                onSubmit={() => {
                  setIsSubmitting(true);
                  if (githubUrl !== '') {
                    const getUrlResult = assetData?.validate_regex_url ? !githubUrl.includes(assetData?.validate_regex_url) : !isGithubUrl.test(githubUrl);
                    const haveGithubDomain = getUrlResult;
                    if (haveGithubDomain) {
                      setShowUrlWarn(haveGithubDomain);
                    } else {
                      sendProject({ task: currentTask, githubUrl });
                      setIsSubmitting(false);
                      onClickHandler();
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
            )}

            {typeof currentAssetData === 'object' && !deliveryFormatExists && (
              <Box>
                <Text size="md">
                  {t('deliverProject.file-upload')}
                </Text>

                {/* typeof fileProps?.type === 'string' */}
                {fileProps.some((file) => typeof file?.type === 'string') ? (
                  <>
                    {fileProps.map((file) => {
                      const errorExists = file.formatError || file.sizeError;
                      return (
                        <Box key={file.name} display="flex" my="15px" p="8px" border="1px solid" borderColor={featuredColor} background={modal.background} justifyContent="space-between" alignItems="center" borderRadius="7px">
                          <Box display="flex" gridGap="9px">
                            <Icon icon="pdf" color={hexColor.black} width="32px" height="41px" />
                            <Box position="relative">
                              <Text size="14px" style={{ margin: '0px' }} withLimit>
                                {file.name}
                              </Text>
                              <Text size="14px" style={{ margin: '0px' }} color={errorExists && hexColor.danger} display="flex" gridGap="6px">
                                {errorExists ? (
                                  <>
                                    <Icon icon="warning" width="13px" height="13px" style={{ marginTop: '5px' }} color="currentColor" full secondColor={hexColor.white2} />
                                    {file.formatError
                                      ? t('deliverProject.error-file-format')
                                      : file.sizeError && t('deliverProject.error-file-size')}
                                  </>
                                ) : formatBytes(file.size)}
                              </Text>
                            </Box>
                          </Box>
                          <Box borderRadius="20px" p="7px" backgroundColor="gray.500" onClick={() => setFileProps([])} cursor="pointer">
                            <Icon icon="close" width="10px" height="10px" color="#ffffff" />
                          </Box>
                        </Box>
                      );
                    })}
                  </>
                ) : (
                  <Box className={`upload-wrapper ${dragOver && 'dragOver'}`} m="10px 0" width={{ base: 'auto', md: '100%' }} height="86px" position="relative" color={dragOver ? 'blue.600' : 'blue.default'} _hover={{ color: 'blue.default' }} transition="0.3s all ease-in-out" borderRadius="12px" background={featuredColor}>
                    <Box width="100%" height="100%" position="absolute" display="flex" justifyContent="center" alignItems="center" border="1px solid currentColor" cursor="pointer" borderWidth="2px" borderRadius="7px">
                      <Box className="icon-bounce">
                        <Icon icon="upload" color="currentColor" width="24" height="24" />
                      </Box>
                    </Box>
                    <Input
                      type="file"
                      name="Upload file"
                      title=""
                      // onChange={handleFileUpload}
                      onChange={(event) => {
                        const fileProp = event.currentTarget.files;
                        const formatFileArr = mimeTypes.split(',');

                        if (fileProp.length > 0) {
                          Array.from(fileProp).forEach((file) => {
                            const { type, name, size } = file;
                            const formatError = !formatFileArr.includes(type);
                            const sizeError = size > maxFileSize;
                            console.log('fileNames:::', name);
                            setFileProps((prev) => [...prev, {
                              name, type, size, file, formatError, sizeError,
                            }]);
                          });
                        }

                        // if (fileProp.size > maxFileSize) {
                        //   setFileProps((prev) => ({ ...prev, sizeError: true }));
                        // }
                        // if (!formatFileArr.includes(fileProp.type)) {
                        //   setFileProps((prev) => ({ ...prev, formatError: true }));
                        // }
                      }}
                      // accept={assetData?.delivery_formats}
                      // accept=".pdf,.csv"
                      placeholder="Upload profile image"
                      multiple="multiple"
                      position="absolute"
                      width="100%"
                      height="100%"
                      cursor="pointer"
                      opacity="0"
                      padding="0"
                      onDragOver={() => setDragOver(true)}
                      onDragLeave={() => setDragOver(false)}
                    />
                  </Box>
                )}
                <Box display="flex" justifyContent="space-evenly" mb="6px">
                  <Button variant="default" onClick={() => handleUpload()} disabled={fileProps.some((file) => typeof file?.type !== 'string') || fileErrorExists} textTransform="uppercase">
                    {t('common:upload')}
                  </Button>
                  <Button variant="link" textTransform="uppercase" onClick={() => handleCloseFile()}>
                    {t('common:cancel')}
                  </Button>
                </Box>
              </Box>
            )}

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
                sendProject({ task: currentTask, githubUrl });
                onClickHandler();
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
  toggleSettings: PropTypes.func,
  closeSettings: PropTypes.func.isRequired,
  settingsOpen: PropTypes.bool.isRequired,
  allowText: PropTypes.bool,
  onClickHandler: PropTypes.func,
  currentAssetData: PropTypes.objectOf(PropTypes.any),
};
ButtonHandlerByTaskStatus.defaultProps = {
  currentTask: null,
  allowText: false,
  onClickHandler: () => {},
  currentAssetData: {},
  toggleSettings: () => {},
};
