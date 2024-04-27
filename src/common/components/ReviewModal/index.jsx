/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Box, Button, Flex, Link, Textarea, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import SimpleModal from '../SimpleModal';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import CodeReview from './CodeReview';
import AlertMessage from '../AlertMessage';
import Icon from '../Icon';
import FileList from './FileList';
import bc from '../../services/breathecode';
import LoaderScreen from '../LoaderScreen';
import ReviewCodeRevision from './ReviewCodeRevision';
import { usePersistent } from '../../hooks/usePersistent';
import PopoverTaskHandler from '../PopoverTaskHandler';
import { updateAssignment } from '../../hooks/useModuleHandler';
import useModuleMap from '../../store/actions/moduleMapAction';
import iconDict from '../../utils/iconDict.json';
import UndoApprovalModal from '../UndoApprovalModal';
import useAuth from '../../hooks/useAuth';
import { error } from '../../../utils/logging';

export const stages = {
  initial: 'initial',
  file_list: 'file_list',
  code_review: 'code_review',
  approve_or_reject_code_revision: 'approve_or_reject_code_revision',
  review_code_revision: 'review_code_revision',
};

const statusList = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};
const { APPROVED, PENDING, REJECTED } = statusList;
const inputLimit = 450;

function ReviewModal({ isExternal, externalFiles, isOpen, isStudent, externalData, defaultStage, fixedStage, onClose, updpateAssignment, currentTask,
  projectLink, changeStatusAssignment, disableRate, ...rest }) {
  const { t } = useTranslation('assignments');
  const { isAuthenticatedWithRigobot } = useAuth();
  const toast = useToast();
  const [selectedText, setSelectedText] = useState('');
  const [loaders, setLoaders] = useState({
    isFetchingCommitFiles: false,
    isFetchingCodeReviews: false,
    isApprovingOrRejecting: false,
  });
  const [profile] = usePersistent('profile', {});
  const [comment, setComment] = useState('');
  const [cohortSession] = usePersistent('cohortSession', {});
  const [currentAssetData, setCurrentAssetData] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openUndoApproval, setOpenUndoApproval] = useState(false);
  const [fileData, setFileData] = useState();
  const { contextState, setContextState } = useModuleMap();
  const [reviewStatus, setReviewStatus] = useState('');
  const [contextData, setContextData] = useState({
    commitFiles: {
      task: {},
      fileList: [],
    },
    commitFile: {},
    code_revisions: [],
    my_revisions: [],
    revision_content: {},
  });
  const [stageHistory, setStageHistory] = useState({
    current: defaultStage,
    previous: {},
  });
  const { lightColor, featuredColor, hexColor } = useStyle();
  const storybookTranslation = contextData?.translation || {};
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const taskStatus = currentTask?.task_status;
  const revisionStatus = currentTask?.revision_status;
  const hasNotBeenReviewed = revisionStatus === PENDING;
  const hasBeenApproved = revisionStatus === APPROVED;
  const hasBeenRejected = revisionStatus === REJECTED;
  const noFilesToReview = !hasBeenApproved && contextData?.commitFiles?.fileList?.length === 0;
  const codeRevisionsNotExists = typeof contextData?.code_revisions === 'undefined';
  const hasFilesToReview = contextData?.code_revisions?.length > 0 || !isStudent; // Used to show rigobot files content
  const stage = stageHistory?.current;

  const minimumReviews = 0; // The minimun number of reviews until the project is ready to be approved or rejected
  const isReadyToApprove = (contextData?.code_revisions?.length >= minimumReviews || codeRevisionsNotExists) && taskStatus === 'DONE';
  const isStageWithDefaultStyles = hasBeenApproved || (stage === stages.initial || stage === stages.approve_or_reject_code_revision || noFilesToReview);
  const showGoBackButton = stage !== stages.initial && !fixedStage;

  const buttonColor = {
    approve: 'success',
    reject: 'danger',
  };
  const buttonText = {
    approve: t('review-assignment.approve'),
    reject: t('review-assignment.reject'),
  };
  const assignmentButtonText = {
    resubmit: 'Resubmit Assignment',
    remove: 'Remove delivery',
  };
  const assignmentButtonColor = {
    resubmit: 'blue.default',
    remove: 'danger',
  };
  const revisionStatusUpperCase = {
    approve: APPROVED,
    reject: REJECTED,
  };
  const reviewHint = {
    approve: t('code-review.why-approve'),
    reject: t('code-review.why-reject'),
  };
  const alertStatus = {
    approve: t('alert-message:review-assignment-approve'),
    reject: t('alert-message:review-assignment-reject'),
  };

  const setStage = (newStage, type = 'next') => {
    setStageHistory((prevState) => {
      if (type === 'next') {
        const newPrevious = { ...prevState?.previous, [prevState?.current]: true };
        return {
          current: newStage,
          previous: newPrevious,
        };
      }
      if (type === 'back') {
        const keys = Object.keys(prevState.previous);
        const lastKey = keys[keys.length - 1];
        const newCurrent = lastKey || defaultStage;
        const { [lastKey]: _, ...newPrevious } = prevState.previous;
        return {
          current: newCurrent,
          previous: newPrevious,
        };
      }
      return prevState;
    });
  };
  const getRepoFiles = async () => {
    try {
      const response = isStudent
        ? await bc.assignments().personalFiles(currentTask.id)
        : await bc.assignments().files(currentTask.id);
      const data = await response.json();

      if (response.ok) {
        setContextData((prevState) => ({
          ...prevState,
          commitFiles: {
            task: currentTask,
            fileList: data,
          },
        }));
      } else {
        setContextData((prevState) => ({
          ...prevState,
          commitFiles: {
            task: currentTask,
            fileList: [],
          },
        }));
      }
    } catch (errorMsg) {
      error('Error fetching repo files:', errorMsg);
    }
  };
  const getCodeRevisions = async () => {
    try {
      const response = isStudent
        ? await bc.assignments().getPersonalCodeRevisionsByTask(currentTask.id)
        : await bc.assignments().getCodeRevisions(currentTask.id);
      const data = await response.json();

      if (response.ok) {
        const codeRevisionsSortedByDate = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setContextData((prev) => ({
          ...prev,
          code_revisions: codeRevisionsSortedByDate,
          my_revisions: data.filter((revision) => revision?.reviewer?.username === profile?.email),
        }));
      } else {
        toast({
          title: t('alert-message:something-went-wrong'),
          description: `Cannot get code revisions: ${data?.detail}`,
          status: 'error',
          duration: 5000,
          position: 'top',
          isClosable: true,
        });
      }
    } catch (errorMsg) {
      error('Error fetching code revisions:', errorMsg);
    } finally {
      setLoaders((prevState) => ({
        ...prevState,
        isFetchingCodeReviews: false,
      }));
    }
  };

  useEffect(() => {
    if (externalData) {
      setContextData(() => ({
        ...externalData,
      }));
    }
  }, [isOpen, externalData]);
  useEffect(() => {
    if (defaultStage) {
      setStage(defaultStage);
    }
    if (isOpen && currentTask?.id > 0 && !externalData) {
      if (externalFiles) {
        setFileData(externalFiles);
      }
      setLoaders((prevState) => ({
        ...prevState,
        isFetchingCodeReviews: true,
      }));
      getRepoFiles();
      getCodeRevisions();
    }
  }, [isOpen, currentTask?.id, externalData]);

  const onChangeComment = (e) => {
    setComment(e.target.value);
  };

  const approveOrRejectProject = () => {
    if (revisionStatusUpperCase[reviewStatus] !== undefined) {
      setLoaders((prevState) => ({
        ...prevState,
        isApprovingOrRejecting: true,
      }));
      bc.todo()
        .update({
          id: currentTask.id,
          revision_status: revisionStatusUpperCase[reviewStatus],
          description: comment,
        })
        .then(() => {
          toast({
            position: 'top',
            title: alertStatus[reviewStatus],
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          updpateAssignment({
            ...currentTask,
            id: currentTask.id,
            revision_status: revisionStatusUpperCase[reviewStatus],
            description: comment,
          });
          setStage(stages.initial);
          setContextData({});
          setReviewStatus('');
          onClose();
        })
        .catch(() => {
          toast({
            position: 'top',
            title: t('alert-message:review-assignment-error'),
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        })
        .finally(() => {
          setLoaders((prevState) => ({
            ...prevState,
            isApprovingOrRejecting: false,
          }));
        });
    }
  };

  const handleSelectedText = () => {
    const text = window.getSelection().toString();
    if (text.length > 0) {
      setSelectedText(text);
    }
  };
  const handleResetFlow = () => {
    setContextData((prevState) => ({
      ...prevState,
      commitFile: {},
    }));
    setSelectedText('');
  };

  const widthSizes = {
    initial: (!isAuthenticatedWithRigobot || !noFilesToReview) && hasFilesToReview ? '36rem' : '28rem',
    approve_or_reject_code_revision: '36rem',
    file_list: '42rem',
    code_review: '74rem',
    review_code_revision: '56rem',
  };

  const handleCommitFilesStage = () => {
    if (isStudent) {
      setStage(stages.review_code_revision);
    } else {
      setStage(stages.file_list);
    }
  };

  const proceedToCommitFiles = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: true,
    }));
    handleCommitFilesStage();
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: false,
    }));
  };

  const getTitle = () => {
    if (stage === stages.initial) {
      return storybookTranslation?.['code-review']?.['assignment-review'] || t('code-review.assignment-review');
    }
    if (stage === stages.approve_or_reject_code_revision) {
      return storybookTranslation?.['code-review']?.['write-feedback'] || t('code-review.write-feedback');
    }
    return storybookTranslation?.['code-review']?.['code-review'] || t('code-review.rigobot-code-review');
  };

  const getAssetData = async ({ callback = () => {} } = {}) => {
    const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
    if (assetResp.status < 400) {
      setLoaders((prevState) => ({
        ...prevState,
        isOpeningResubmitForm: false,
      }));
      const assetData = await assetResp.data;
      setCurrentAssetData(assetData);

      if (typeof assetData?.delivery_formats === 'string' && !assetData?.delivery_formats.includes('url')) {
        const fileResp = await bc.todo().getFile({ id: currentTask.id, academyId: cohortSession?.academy?.id });
        const respData = await fileResp.data;
        setFileData(respData);
      }
      callback();
    }
  };
  const toggleSettings = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isOpeningResubmitForm: true,
    }));
    getAssetData({
      callback: () => setSettingsOpen(!settingsOpen),
    });
  };
  const closeSettings = () => {
    setSettingsOpen(false);
  };
  const sendProject = async ({ task, githubUrl, taskStatus: newTaskStatus }) => {
    await updateAssignment({
      t, task, closeSettings, toast, githubUrl, taskStatus: newTaskStatus, contextState, setContextState,
    });
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(`/api/download/file?url=${fileUrl}&filename=${fileName}`);
      if (response.ok) {
        const blob = await response.blob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // Establecer el nombre deseado del archivo aquí
        link.style.display = 'none';
        document.body.appendChild(link);

        link.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      } else {
        throw new Error('Error al descargar el archivo');
      }
    } catch (errorMsg) {
      error('Error al descargar el archivo:', errorMsg);
    }
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setContextData({});
        setStage(stages.initial);
      }}
      title={getTitle()}
      closeOnOverlayClick={false}
      maxWidth={noFilesToReview ? widthSizes.initial : widthSizes[stage]}
      minWidth={stage === stages.code_review && '83vw'}
      minHeight={isStageWithDefaultStyles ? 'auto' : '30rem'}
      overflow={stages.initial ? 'initial' : 'auto'}
      margin="0 10px"
      bodyStyles={{
        display: 'flex',
        gridGap: '20px',
        padding: '1rem 1.5rem',
      }}
      headerStyles={{
        userSelect: 'none',
        textTransform: isStageWithDefaultStyles ? 'uppercase' : 'initial',
        fontSize: isStageWithDefaultStyles ? '15px' : '26px',
        textAlign: 'center',
        fontWeight: 700,
      }}
      closeButtonStyles={{
        top: isStageWithDefaultStyles ? 2 : 5,
      }}
      leftButton={showGoBackButton && (
        <Button
          position="absolute"
          variant="unstyled"
          top={isStageWithDefaultStyles ? 2 : 4}
          left={5}
          onClick={() => {
            setStage('', 'back');
          }}
          aria-label={t('common:go-back')}
        >
          <Icon icon="arrowLeft2" width="26px" height="15px" color={hexColor.black} />
        </Button>
      )}
      {...rest}
    >
      {stage === stages.initial && currentTask && (
        <Box width="100%" maxWidth="500px" margin="0 auto" mb="8px" position="relative">
          {loaders.isFetchingCodeReviews ? (
            <Box minHeight="215px">
              <LoaderScreen width="300px" height="302px" />
            </Box>
          ) : (
            <>
              {hasFilesToReview && !isReadyToApprove && (
                <AlertMessage
                  type={isStudent ? 'info' : 'warning'}
                  full
                  message={isStudent
                    ? t('code-review.info-student')
                    : t('code-review.info-teacher')}
                  borderRadius="4px"
                  padding="8px"
                  mb="24px"
                />
              )}
              <Flex flexDirection="column" gridGap="16px">
                {!isStudent ? (
                  <Flex justifyContent="space-between">
                    <Text size="14px" color={lightColor}>
                      {t('code-review.student-name', { name: fullName })}
                    </Text>
                    {taskStatus === 'DONE' && hasNotBeenReviewed && (
                    <Box textTransform="uppercase" fontSize="13px" background="yellow.light" color="yellow.default" borderRadius="27px" padding="2px 6px" fontWeight={700} border="2px solid" borderColor="yellow.default">
                      {t('code-review.waiting-for-review')}
                    </Box>
                    )}
                  </Flex>
                ) : (
                  <Text size="15px" color={lightColor}>
                    {hasNotBeenReviewed
                      ? t('dashboard:modalInfo.still-reviewing')
                      : (
                        <>
                          {revisionStatus === APPROVED && t('code-review.assignment-approved-msg')}
                          {revisionStatus === REJECTED && t('code-review.assignment-rejected-msg')}
                        </>
                      )}
                  </Text>
                )}

                {(hasBeenApproved || hasBeenRejected) && currentTask?.description && (
                  <Flex background={featuredColor} flexDirection="column" gridGap="4px" padding="8px 14px" borderRadius="3px">
                    <Box fontSize="14px" fontWeight={700}>
                      {t('code-review.your-teacher-said')}
                    </Box>
                    <Text
                      display="flex"
                      alignContent="center"
                      color={lightColor}
                      borderRadius="4px"
                      width="100%"
                      size="12px"
                    >
                      {currentTask?.description}
                    </Text>
                  </Flex>
                )}
                {(!Array.isArray(fileData) || !fileData) && (
                  <Flex flexDirection="column" color={lightColor}>
                    <Text size="14px" fontWeight={700}>
                      {!isStudent ? t('code-review.project-delivered') : t('dashboard:modalInfo.link-info')}
                    </Text>
                    <Link variant="default" fontSize="14px" href={currentTask?.github_url}>
                      {currentTask?.title}
                    </Link>
                  </Flex>
                )}

                {Array.isArray(fileData) && fileData.length > 0 && (
                  <Box mt="10px">
                    <Text size="l" mb="8px" fontWeight={700}>
                      {t('dashboard:modalInfo.files-sended')}
                    </Text>
                    <Box display="flex" flexDirection="column" gridGap="8px" maxHeight="135px" overflowY="auto">
                      {fileData.map((file) => {
                        const extension = file.name.split('.').pop();
                        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
                        const isImage = imageExtensions.includes(extension);
                        const icon = iconDict.includes(extension) ? extension : 'file';
                        const isDownloadable = file.mime === 'application/octet-stream';
                        const defaultIcon = isDownloadable ? 'download' : icon;
                        return (
                          <Box key={`${file.id}-${file.name}`} display="flex">
                            <Icon icon={isImage ? 'image' : defaultIcon} color="currentColor" width="22px" height="22px" />
                            {isDownloadable ? (
                              <Button
                                variant="link"
                                onClick={() => handleDownload(file.url, file.name)}
                                fontSize="16px"
                                fontWeight="normal"
                                height="auto"
                                color="blue.500"
                                margin="0 0 0 10px"
                              >
                                {file.name}
                              </Button>
                            ) : (
                              <Link
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="blue.500"
                                margin="0 0 0 10px"
                              >
                                {file.name}
                              </Link>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
                {(!isAuthenticatedWithRigobot || !noFilesToReview) && hasFilesToReview && !disableRate && (
                  <Flex padding="8px" flexDirection="column" gridGap="16px" background={featuredColor} borderRadius="4px">
                    <Flex alignItems="center" gridGap="10px">
                      <Icon icon="code" width="18.5px" height="17px" color="currentColor" />
                      <Text size="14px" fontWeight={700}>
                        {t('code-review.count-code-reviews', { count: contextData?.code_revisions?.length || 0 })}
                      </Text>
                    </Flex>
                    <Button height="auto" width="fit-content" onClick={proceedToCommitFiles} isLoading={loaders.isFetchingCommitFiles} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="start">
                      {isStudent
                        ? t('code-review.read-and-rate-the-feedback')
                        : t('code-review.start-code-review')}
                      <Icon icon="longArrowRight" width="24px" height="10px" color={hexColor.blueDefault} />
                    </Button>
                  </Flex>
                )}

                {isReadyToApprove && !isStudent && !hasBeenApproved && (
                  <Flex justifyContent="space-between" pt="8px">
                    {['reject', 'approve'].map((type) => (
                      <Button
                        minWidth="128px"
                        background={buttonColor[type]}
                        _hover={{ background: buttonColor[type] }}
                        onClick={() => {
                          setStage(stages.approve_or_reject_code_revision);
                          setReviewStatus(type);
                        }}
                        color="white"
                        borderRadius="3px"
                        fontSize="13px"
                        textTransform="uppercase"
                      >
                        {buttonText[type]}
                      </Button>
                    ))}
                  </Flex>
                )}

                {isStudent && revisionStatus !== APPROVED && (
                  <Flex justifyContent="space-between" pt="8px">
                    <Button
                      minWidth="128px"
                      isLoading={loaders.isRemovingDelivery}
                      background={assignmentButtonColor.remove}
                      _hover={{ background: assignmentButtonColor.remove }}
                      onClick={(event) => {
                        setLoaders((prevState) => ({
                          ...prevState,
                          isRemovingDelivery: true,
                        }));
                        changeStatusAssignment(event, currentTask, PENDING)
                          .finally(() => {
                            setLoaders((prevState) => ({
                              ...prevState,
                              isRemovingDelivery: false,
                            }));
                          });
                      }}
                      color="white"
                      borderRadius="3px"
                      fontSize="13px"
                      textTransform="uppercase"
                    >
                      {assignmentButtonText.remove}
                    </Button>
                    <PopoverTaskHandler
                      isLoading={loaders.isOpeningResubmitForm}
                      currentAssetData={currentAssetData}
                      currentTask={currentTask}
                      sendProject={sendProject}
                      settingsOpen={settingsOpen}
                      closeSettings={closeSettings}
                      toggleSettings={toggleSettings}
                      allowText
                      buttonChildren={t('code-review.resubmit-assignment')}
                    />
                  </Flex>
                )}
                {!isStudent && hasBeenApproved && (
                  <>
                    <Button
                      minWidth="128px"
                      mt="8px"
                      onClick={() => setOpenUndoApproval(true)}
                      color="currentColor"
                      borderRadius="3px"
                      fontSize="13px"
                      textTransform="uppercase"
                      variant="outline"
                      width="fit-content"
                      alignSelf="center"
                    >
                      {t('task-handler.undo-approval')}
                    </Button>
                    <UndoApprovalModal
                      isOpen={openUndoApproval}
                      onSuccess={() => {
                        onClose();
                        setContextData({});
                      }}
                      onClose={() => setOpenUndoApproval(false)}
                      updpateAssignment={updpateAssignment}
                      currentTask={currentTask}
                    />
                  </>
                )}
              </Flex>
            </>
          )}
        </Box>
      )}

      {stage === stages.approve_or_reject_code_revision && (
        <Flex flexDirection="column" maxWidth="500px" margin="0 auto" gridGap="15px" width="100%">
          <Box position="relative">
            <Text fontSize="14px" fontWeight={700} mb="18px">
              {reviewHint[reviewStatus]}
            </Text>
            <Textarea aria-label="feedback input" fontSize="12px" onChange={onChangeComment} minHeight="134" placeholder={t('code-review.start-review-here')} />
            <Box position="absolute" bottom={1.5} right={3} color={comment.length < 10 ? '#EB5757' : 'currentColor'}>
              {`${comment.length} / ${inputLimit}`}
            </Box>
          </Box>
          <Button isLoading={loaders.isApprovingOrRejecting} variant="default" alignSelf="flex-end" isDisabled={comment.length < 10 || revisionStatusUpperCase[reviewStatus] === undefined} onClick={approveOrRejectProject}>
            {t('code-review.send-feedback')}
          </Button>
        </Flex>
      )}

      {stage === stages.file_list && !loaders.isFetchingCommitFiles && (
        <FileList isStudent={isStudent} contextData={contextData} setContextData={setContextData} currentTask={currentTask} updpateAssignment={updpateAssignment} stage={stage} stages={stages} setStage={setStage} setReviewStatus={setReviewStatus} />
      )}
      {stage === stages.code_review && (contextData.commitFile?.code || contextData.revision_content?.code) && (
        <CodeReview isExternal={isExternal} onClose={onClose} disableRate={disableRate} isStudent={isStudent} setStage={setStage} handleResetFlow={handleResetFlow} contextData={contextData} setContextData={setContextData} selectedText={selectedText} handleSelectedText={handleSelectedText} />
      )}

      {stage === stages.review_code_revision && (
        <ReviewCodeRevision contextData={contextData} setContextData={setContextData} stage={stage} stages={stages} setStage={setStage} />
      )}
    </SimpleModal>
  );
}

ReviewModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  projectLink: PropTypes.string,
  defaultStage: PropTypes.string,
  updpateAssignment: PropTypes.func.isRequired,
  externalData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  isStudent: PropTypes.bool,
  changeStatusAssignment: PropTypes.func,
  fixedStage: PropTypes.bool,
  disableRate: PropTypes.bool,
  isExternal: PropTypes.bool,
};
ReviewModal.defaultProps = {
  isOpen: false,
  onClose: () => {},
  currentTask: {},
  projectLink: '',
  defaultStage: stages.initial,
  externalData: null,
  isStudent: false,
  changeStatusAssignment: () => {},
  fixedStage: false,
  disableRate: false,
  isExternal: false,
};

export default ReviewModal;
