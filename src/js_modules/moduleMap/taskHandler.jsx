/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/no-unstable-nested-components */
import {
  FormControl, Input, Button, Popover, PopoverTrigger, PopoverContent,
  PopoverArrow, PopoverHeader, PopoverCloseButton, PopoverBody, useDisclosure,
  FormErrorMessage, Box, useColorModeValue, useToast, Flex,
} from '@chakra-ui/react';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
import Icon from '../../common/components/Icon';
import ModalInfo from './modalInfo';
import { isGithubUrl } from '../../utils/regex';
import Text from '../../common/components/Text';
import bc from '../../common/services/breathecode';
import useStyle from '../../common/hooks/useStyle';
import { formatBytes } from '../../utils';
import MarkDownParser from '../../common/components/MarkDownParser';
import iconDict from '../../common/utils/iconDict.json';
import { usePersistent } from '../../common/hooks/usePersistent';
import ReviewModal, { stages } from '../../common/components/ReviewModal';

export function TextByTaskStatus({ currentTask, t }) {
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
}

export function IconByTaskStatus({ currentTask, noDeliveryFormat }) {
  // task project status
  const hasDeliveryFormat = !noDeliveryFormat;
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING' && hasDeliveryFormat) {
      return <Icon icon="checked" color="#FFB718" width="27px" height="27px" />;
    }
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING' && !hasDeliveryFormat) {
      return <Icon icon="verified" color="#25BF6C" width="27px" />;
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
}

TextByTaskStatus.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  t: PropTypes.func.isRequired,
};
TextByTaskStatus.defaultProps = {
  currentTask: {},
};
IconByTaskStatus.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  noDeliveryFormat: PropTypes.bool,
};
IconByTaskStatus.defaultProps = {
  currentTask: {},
  noDeliveryFormat: false,
};

export function ButtonHandlerByTaskStatus({
  currentTask, sendProject, changeStatusAssignment, toggleSettings, closeSettings,
  settingsOpen, allowText, onClickHandler, currentAssetData, fileData, handleOpen,
}) {
  const { t } = useTranslation('dashboard');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [fileProps, setFileProps] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [openCommitFiles, setOpenCommitFiles] = useState(false);
  const [loaders, setLoaders] = useState({
    isFetchingCommitFiles: false,
  });
  const [contextData, setContextData] = useState({});
  const fileContainerRef = useRef(null);
  const fileInputRef = useRef();
  const commonInputColor = useColorModeValue('gray.600', 'gray.200');
  const commonInputActiveColor = useColorModeValue('gray.800', 'gray.350');
  const taskIsAproved = allowText && currentTask?.revision_status === 'APPROVED';

  const deliveryFormatExists = typeof currentAssetData?.delivery_formats === 'string';
  const regexUrlExists = typeof currentAssetData?.delivery_regex_url === 'string';
  const mimeTypes = currentAssetData?.delivery_formats || 'application/pdf,image/png,image/jpeg,image/jpg,image/gif';
  const deliveryFormatIsUrl = deliveryFormatExists && currentAssetData?.delivery_formats.includes('url');
  const noDeliveryFormat = deliveryFormatExists && currentAssetData?.delivery_formats.includes('no_delivery');
  const maxFileSize = 1048576 * 10; // 10mb
  const fileErrorExists = fileProps.some((file) => file.formatError) || fileProps.some((file) => file.sizeError);

  const {
    featuredColor, modal, hexColor, lightColor,
  } = useStyle();
  const toast = useToast();

  const howToSendProjectUrl = 'https://4geeksacademy.notion.site/How-to-deliver-a-project-e1db0a8b1e2e4fbda361fc2f5457c0de';
  function TaskButton() {
    return (
      <Button
        display="flex"
        onClick={(event) => {
          changeStatusAssignment(event, currentTask);
          onClickHandler();
        }}
        isDisabled={taskIsAproved}
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
  }

  const openAssignmentFeedbackModal = () => {
    bc.assignments().getCodeRevisions(currentTask.id)
      .then(({ data }) => {
        console.log('code_revisions_data:::', data);
        setContextData({
          code_revisions: data,
        });
      })
      .catch(() => {
        toast({
          title: t('alert-message:something-went-wrong'),
          description: 'Cannot get code revisions',
          status: 'error',
          duration: 5000,
          position: 'top',
          isClosable: true,
        });
      })
      .finally(() => {
        onOpen();
      });
  };

  function OpenModalButton() {
    return (
      <Button
        onClick={(event) => {
          if (noDeliveryFormat) {
            changeStatusAssignment(event, currentTask, 'PENDING');
          } else {
            handleOpen(() => openAssignmentFeedbackModal());
          }
        }}
        isDisabled={taskIsAproved}
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
          <IconByTaskStatus currentTask={currentTask} noDeliveryFormat={noDeliveryFormat} />
        )}
      </Button>
    );
  }

  const proceedToCommitFiles = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: true,
    }));
    const response = await bc.assignments().files(currentTask.id);
    const data = typeof response === 'object' ? await response.json() : {};

    if (!response || response?.status >= 400) {
      setLoaders((prevState) => ({
        ...prevState,
        isFetchingCommitFiles: false,
      }));
      toast({
        title: 'Error',
        description: data.detail,
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      });
    }
    if (response?.ok) {
      setContextData((prevState) => ({
        ...prevState,
        commitfiles: {
          task: currentTask,
          fileList: data,
        },
      }));
      setOpenCommitFiles(true);
    }
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: false,
    }));
  };

  // if (currentTask?.task_type === 'PROJECT') {
  //   console.log('currentTask:::', currentTask);
  // }
  // PRROJECT CASE
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
      // Option case Revision pending...
      return (
        <>
          <Button variant="unstyled" mr="10px">
            <Icon icon="comment" width="20px" height="20px" />
          </Button>
          <OpenModalButton />
          <ModalInfo
            isOpen={isOpen}
            onClose={onClose}
            title={t('modalInfo.title')}
            description={t('modalInfo.still-reviewing')}
            teacherFeedback={currentTask.description}
            linkInfo={t('modalInfo.link-info')}
            link={currentTask.github_url}
            attachment={fileData}
            type="taskHandler"
            handlerText={t('modalInfo.rejected.resubmit-assignment')}
            linkText={currentTask.github_url}
            disableInput
            disableHandler
            sendProject={sendProject}
            currentTask={currentTask}
            actionHandler={(event) => {
              changeStatusAssignment(event, currentTask, 'PENDING');
              onClose();
            }}
            closeText={t('modalInfo.rejected.remove-delivery')}
          >
            <Flex mt="20px" padding="8px" flexDirection="column" gridGap="16px" background={featuredColor} borderRadius="4px">
              <Flex alignItems="center" gridGap="10px">
                <Icon icon="code" width="18.5px" height="17px" color="#fff" />
                <Text size="14px" fontWeight={700}>
                  0 code reviews
                </Text>
              </Flex>
              <Button height="auto" onClick={proceedToCommitFiles} isLoading={loaders.isFetchingCommitFiles} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="start">
                Read and rate the feedback
                <Icon icon="longArrowRight" width="24px" height="10px" color={hexColor.blueDefault} />
              </Button>
            </Flex>
          </ModalInfo>

          {openCommitFiles && (
            <ReviewModal isOpen={openCommitFiles} currentTask={currentTask} defaultStage={stages.file_list} onClose={() => setOpenCommitFiles(false)} defaultContextData={contextData} />
          )}
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
            teacherFeedback={currentTask?.description}
            linkInfo={t('modalInfo.link-info')}
            link={currentTask.github_url}
            attachment={fileData}
            disableHandler
            disableCloseButton
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
            attachment={fileData}
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
      closeSettings();
    };

    const handleChangeFile = (e) => {
      setDragOver(false);
      const fileProp = e.target.files;
      const formatFileArr = mimeTypes.replaceAll('.', '').split(',');
      if (fileProp.length > 0) {
        Array.from(fileProp).forEach((file) => {
          const { type, name, size } = file;
          const formatExists = formatFileArr.some((l) => String(type).includes(l));
          const formatError = !formatExists;
          const sizeError = size > maxFileSize;
          if (fileProps.some((item) => item.name === name)) return;
          setFileProps((prev) => [...prev, {
            name, type, size, file, formatError, sizeError,
          }]);

          fileContainerRef.current?.scrollTo({
            top: fileContainerRef.current?.scrollHeight,
            behavior: 'smooth',
          });
          setTimeout(() => {
            fileContainerRef.current?.scrollTo({
              top: fileContainerRef.current?.scrollHeight,
              behavior: 'smooth',
            });
          }, [300]);
        });
      }
    };

    const handleRemoveFileInList = (name) => {
      const updatedFileList = fileProps.filter((file) => file.name !== name);
      setFileProps(updatedFileList);
      fileInputRef.current.removeAttribute('multiple');
      fileInputRef.current.value = null;
      fileInputRef.current.setAttribute('multiple', 'multiple');
    };

    const handleUploadFile = async () => {
      setIsUploading(true);
      const formdata = new FormData();
      Array.from(fileProps).forEach(({ file }) => {
        formdata.append('file', file);
      });
      const resp = await bc.todo({ academy: cohortSession.academy.id }).uploadFile(currentTask.id, formdata);

      if (resp?.status < 400) {
        const respData = resp.data[0];
        setIsUploading(false);
        setFileProps([]);
        sendProject({
          task: currentTask,
          githubUrl: respData?.url,
        });
        toast({
          position: 'top',
          title: t('alert-message:files-uploaded'),
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        closeSettings();
      } else {
        setIsUploading(false);
        toast({
          position: 'top',
          title: t('alert-message:something-went-wrong-with', { property: 'Files' }),
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    };

    const fileSumSize = fileProps.reduce((acc, { file }) => acc + file.size, 0);

    const customUrlValidation = Yup.object().shape({
      githubUrl: Yup.string().matches(
        currentAssetData?.delivery_regex_url,
        t('deliverProject.invalid-url', { url: currentAssetData?.delivery_regex_url }),
      ).required(t('deliverProject.url-is-required')),
    });

    const githubUrlValidation = Yup.object().shape({
      githubUrl: Yup.string().matches(
        isGithubUrl,
        t('deliverProject.invalid-url', { url: 'https://github.com/' }),
      ).required(t('deliverProject.url-is-required')),
    });

    return (
      <Popover
        id="task-status"
        isOpen={settingsOpen}
        onClose={handleCloseFile}
        trigger="click"
      >

        <PopoverTrigger>
          <Button
            display="flex"
            variant={allowText ? 'default' : 'none'}
            isDisabled={taskIsAproved}
            minWidth="26px"
            minHeight="26px"
            height="fit-content"
            background={allowText ? 'blue.default' : 'none'}
            lineHeight={allowText ? '15px' : '0'}
            padding={allowText ? '12px 24px' : '0'}
            borderRadius={allowText ? '3px' : '30px'}
            textTransform={allowText ? 'uppercase' : 'none'}
            gridGap={allowText ? '12px' : '0'}
            onClick={() => toggleSettings()}
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
            {noDeliveryFormat ? (
              <Box display="flex" flexDirection="column" gridGap="10px">
                <Text size="md">
                  {t('deliverProject.no-delivery-needed')}
                </Text>

                <Button
                  width="fit-content"
                  onClick={() => {
                    sendProject({ task: currentTask });
                  }}
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {t('deliverProject.handler-text')}
                </Button>
              </Box>
            ) : (
              <>
                {typeof currentAssetData === 'object' && deliveryFormatIsUrl ? (
                  <Formik
                    initialValues={{ githubUrl: '' }}
                    onSubmit={() => {
                      setIsSubmitting(true);
                      if (githubUrl !== '') {
                        sendProject({ task: currentTask, githubUrl });
                        setIsSubmitting(false);
                        onClickHandler();
                      }
                    }}
                    validationSchema={regexUrlExists ? customUrlValidation : githubUrlValidation}
                  >
                    {() => (
                      <Form
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gridGap: currentAssetData?.delivery_instructions?.length ? '0px' : '14px',
                        }}
                      >
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
                                  placeholder="https://..."
                                />
                                <FormErrorMessage marginTop="10px">
                                  {form.errors.githubUrl}
                                </FormErrorMessage>
                              </FormControl>
                            );
                          }}
                        </Field>
                        <Box>
                          {currentAssetData?.delivery_instructions?.length > 2 ? (
                            <Box
                              height="100%"
                              margin="0 rem auto 0 auto"
                              transition="background 0.2s ease-in-out"
                              borderRadius="3px"
                              maxWidth="1280px"
                              background={useColorModeValue('white', 'dark')}
                              width={{ base: '100%', md: 'auto' }}
                              className={`markdown-body ${useColorModeValue('light', 'dark')}`}
                            >
                              <MarkDownParser content={currentAssetData?.delivery_instructions} />
                            </Box>
                          ) : (
                            <Box dangerouslySetInnerHTML={{ __html: t('deliverProject.how-to-deliver-text', { link: howToSendProjectUrl }) }} />
                          )}
                        </Box>
                        <Button
                          // mt={4}
                          width="fit-content"
                          colorScheme="blue"
                          isLoading={isSubmitting}
                          type="submit"
                        >
                          {t('deliverProject.handler-text')}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <Box>
                    {currentAssetData?.delivery_instructions?.length > 2 ? (
                      <Box
                        height="100%"
                        margin="0 rem auto 0 auto"
                        transition="background 0.2s ease-in-out"
                        borderRadius="3px"
                        maxWidth="1280px"
                        background={useColorModeValue('white', 'dark')}
                        width={{ base: '100%', md: 'auto' }}
                        className={`markdown-body ${useColorModeValue('light', 'dark')}`}
                      >
                        <MarkDownParser content={currentAssetData?.delivery_instructions} />
                      </Box>
                    ) : (
                      <Text size="md">
                        {t('deliverProject.file-upload')}
                        <strong>{currentAssetData?.delivery_formats?.replaceAll(',', ', ').replaceAll('.', '').toUpperCase()}</strong>
                      </Text>
                    )}

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
                        ref={fileInputRef}
                        onChange={handleChangeFile}
                        accept={currentAssetData?.delivery_formats}
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

                    {fileProps.some((file) => typeof file?.type === 'string') && (
                      <>
                        <Box ref={fileContainerRef} maxHeight="300px" overflowY="auto">
                          {fileProps.map((file) => {
                            const errorExists = file.formatError || file.sizeError;
                            const extension = file.name.split('.').pop();
                            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
                            const isImage = imageExtensions.includes(extension);
                            const icon = iconDict.includes(extension) ? extension : 'file';
                            return (
                              <Box key={file.name} display="flex" my="15px" p="8px" border="1px solid" borderColor={featuredColor} background={modal.background} justifyContent="space-between" alignItems="center" borderRadius="7px">
                                <Box display="flex" gridGap="9px">
                                  <Icon icon={isImage ? 'image' : icon} color={hexColor.black} width="32px" height="41px" />
                                  <Box position="relative">
                                    <Text size="14px" style={{ margin: '0px' }} withLimit={file.name.length > 20}>
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
                                <Box
                                  borderRadius="20px"
                                  p="7px"
                                  backgroundColor="gray.500"
                                  onClick={() => {
                                    handleRemoveFileInList(file.name);
                                  }}
                                  cursor="pointer"
                                >
                                  <Icon icon="close" width="10px" height="10px" color="#ffffff" />
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                        <Box py="12px" color={lightColor}>
                          {t('deliverProject.total-size', { size: formatBytes(fileSumSize) })}
                        </Box>
                      </>
                    )}
                    <Box display="flex" justifyContent="space-evenly" mb="6px">
                      <Button
                        variant="default"
                        onClick={() => handleUploadFile()}
                        isLoading={isUploading}
                        isDisabled={isUploading || fileProps?.length === 0 || fileProps.some((file) => typeof file?.type !== 'string') || fileErrorExists || fileSumSize > maxFileSize}
                        textTransform="uppercase"
                      >
                        {t('common:upload')}
                      </Button>
                      <Button variant="link" textTransform="uppercase" onClick={() => handleCloseFile()}>
                        {t('common:cancel')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <TaskButton />
  );
}

ButtonHandlerByTaskStatus.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  sendProject: PropTypes.func.isRequired,
  changeStatusAssignment: PropTypes.func.isRequired,
  toggleSettings: PropTypes.func,
  closeSettings: PropTypes.func.isRequired,
  settingsOpen: PropTypes.bool.isRequired,
  allowText: PropTypes.bool,
  onClickHandler: PropTypes.func,
  handleOpen: PropTypes.func,
  currentAssetData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  fileData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
ButtonHandlerByTaskStatus.defaultProps = {
  currentTask: null,
  allowText: false,
  onClickHandler: () => {},
  currentAssetData: {},
  fileData: {},
  toggleSettings: () => {},
  handleOpen: () => {},
};
