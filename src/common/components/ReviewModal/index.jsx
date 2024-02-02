/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Box, Button, Flex, Link, Textarea, useToast } from '@chakra-ui/react';
// import useTranslation from 'next-translate/useTranslation';
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

export const stages = {
  initial: 'initial',
  file_list: 'file_list',
  code_review: 'code_review',
  approve_or_reject_code_revision: 'approve_or_reject_code_revision',
  review_code_revision: 'review_code_revision',
};

const inputLimit = 500;

function ReviewModal({ defaultFileData, isOpen, isStudent, externalData, defaultStage, onClose, updpateAssignment, currentTask,
  projectLink, changeStatusAssignment, ...rest }) {
  const { t } = useTranslation('assignments');
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
  const [fileData, setFileData] = useState(defaultFileData);
  const { contextState, setContextState } = useModuleMap();
  const [reviewStatus, setReviewStatus] = useState('');
  const [contextData, setContextData] = useState({
    commitfiles: [],
    commitFile: {},
    code_revisions: [],
    my_revisions: [],
    revision_content: {},
  });
  const [stage, setStage] = useState(defaultStage);
  const { lightColor, featuredColor, hexColor } = useStyle();
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const taskStatus = currentTask?.task_status;
  const revisionStatus = currentTask?.revision_status;
  const hasNotBeenReviewed = revisionStatus === 'PENDING';
  const hasNoFilesToReview = contextData?.code_revisions?.length === 0;
  const isReadyToApprove = contextData?.code_revisions?.length >= 3 && taskStatus === 'DONE';
  const isStageWithDefaultStyles = stage === stages.initial || stage === stages.approve_or_reject_code_revision || hasNoFilesToReview;

  const statusColor = {
    approve: 'success',
    reject: 'error',
  };
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
    approve: 'APPROVED',
    reject: 'REJECTED',
  };
  const reviewHint = {
    approve: 'Why are you approving this assignment?',
    reject: 'Why are you rejecting this assignment?',
  };
  const alertStatus = {
    approve: t('alert-message:review-assignment-approve'),
    reject: t('alert-message:review-assignment-reject'),
  };

  useEffect(() => {
    if (externalData) {
      setContextData({
        ...externalData,
      });
    }
    if (isOpen && currentTask?.id > 0 && !externalData) {
      setLoaders((prevState) => ({
        ...prevState,
        isFetchingCodeReviews: true,
      }));
      bc.assignments().getCodeRevisions(currentTask.id)
        .then(({ data }) => {
          setContextData({
            code_revisions: data,
            my_revisions: data.filter((revision) => revision?.reviewer?.username === profile?.email),
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
          setLoaders((prevState) => ({
            ...prevState,
            isFetchingCodeReviews: false,
          }));
        });
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
            status: statusColor[reviewStatus],
            duration: 5000,
            isClosable: true,
          });
          updpateAssignment({
            ...currentTask,
            id: currentTask.id,
            revision_status: revisionStatusUpperCase[reviewStatus],
            description: comment,
          });
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
    initial: '36rem',
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
    const response = await bc.assignments().files(currentTask.id);
    const data = await response.json();

    if (response.status >= 400) {
      toast({
        title: 'Error',
        description: data.detail,
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      });
      handleCommitFilesStage();
    }
    if (response.ok) {
      setContextData((prevState) => ({
        ...prevState,
        commitfiles: {
          task: currentTask,
          fileList: data,
        },
      }));
      handleCommitFilesStage();
    }
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: false,
    }));
  };

  const getTitle = () => {
    if (stage === stages.initial) {
      return 'Assignment review';
    }
    if (stage === stages.approve_or_reject_code_revision) {
      return 'Write a feedback';
    }
    return 'Rigobot code review';
  };

  // const handleOpen = async (onOpen = () => {}) => {
  //   if (currentTask && currentTask?.task_type === 'PROJECT' && currentTask.task_status === 'DONE') {
  //     const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
  //     if (assetResp?.status < 400) {
  //       const assetData = await assetResp.data;
  //       setCurrentAssetData(assetData);

  //       if (typeof assetData?.delivery_formats === 'string' && !assetData?.delivery_formats.includes('url')) {
  //         const fileResp = await bc.todo().getFile({ id: currentTask.id, academyId: cohortSession?.academy?.id });
  //         const respData = await fileResp.data;
  //         setFileData(respData);
  //         onOpen();
  //       } else {
  //         onOpen();
  //       }
  //     } else {
  //       onOpen();
  //     }
  //   }
  // };
  const toggleSettings = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isOpeningResubmitForm: true,
    }));
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
      setSettingsOpen(!settingsOpen);
    }
  };
  const closeSettings = () => {
    setSettingsOpen(false);
  };
  const sendProject = async ({ task, githubUrl, taskStatus: newTaskStatus }) => {
    await updateAssignment({
      t, task, closeSettings, toast, githubUrl, taskStatus: newTaskStatus, contextState, setContextState,
    });
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setStage(stages.initial);
      }}
      title={getTitle()}
      closeOnOverlayClick={false}
      maxWidth={hasNoFilesToReview ? widthSizes.initial : widthSizes[stage]}
      isCentered={isStageWithDefaultStyles}
      // maxWidth="74rem"
      minHeight={isStageWithDefaultStyles ? 'auto' : '30rem'}
      bodyStyles={{
        display: 'flex',
        gridGap: '20px',
        padding: '1rem',
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
      leftButton={stage !== stages.initial && (
        <Button
          position="absolute"
          variant="unstyled"
          top={isStageWithDefaultStyles ? 2 : 4}
          left={5}
          onClick={() => {
            if (isStudent && stage === stages.code_review) {
              setStage(stages.review_code_revision);
            }
            if (!isStudent && stage === stages.code_review) {
              setStage(stages.file_list);
              handleResetFlow();
            }
            if (stage === stages.file_list || stage === stages.review_code_revision) {
              setStage(stages.initial);
            }
            if (stage === stages.approve_or_reject_code_revision && !hasNoFilesToReview) {
              setStage(stages.initial);
              setReviewStatus('');
              setComment('');
            }
            if (stage === stages.approve_or_reject_code_revision && hasNoFilesToReview) {
              setStage(stages.file_list);
            }
          }}
          aria-label="Go back"
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
              {!isReadyToApprove && (
                <AlertMessage
                  type="warning"
                  full
                  message="This project needs to have at least 3 code reviews in order to be accepted or rejected."
                  borderRadius="4px"
                  padding="8px"
                  mb="24px"
                />
              )}
              <Flex flexDirection="column" gridGap="16px">
                {!isStudent ? (
                  <Flex justifyContent="space-between">
                    <Text size="14px" color={lightColor}>
                      {`Student: ${fullName}`}
                    </Text>
                    {taskStatus === 'DONE' && hasNotBeenReviewed && (
                    <Box textTransform="uppercase" fontSize="13px" background="yellow.light" color="yellow.default" borderRadius="27px" padding="2px 6px" fontWeight={700} border="2px solid" borderColor="yellow.default">
                      Waiting for review
                    </Box>
                    )}
                  </Flex>
                ) : (
                  <Text size="14px" color={lightColor}>
                    {hasNotBeenReviewed
                      ? t('dashboard:modalInfo.still-reviewing')
                      : `Your teacher has ${revisionStatus} your project.`}
                  </Text>
                )}
                {!isStudent && (
                  <Text size="14px" color={lightColor}>
                    <span>
                      Project Instructions:
                    </span>
                    {' '}
                    <Link variant="default" href={projectLink}>
                      {currentTask?.title}
                    </Link>
                  </Text>
                )}
                <Box>
                  Teacher feedback here if its approved
                </Box>

                {Array.isArray(fileData) && fileData.length > 0 && (
                  <Box mt="10px">
                    <Text size="l" mb="8px">
                      {t('modalInfo.files-sended-to-teacher')}
                    </Text>
                    <Box display="flex" flexDirection="column" gridGap="8px" maxHeight="135px" overflowY="auto">
                      {fileData.map((file) => {
                        const extension = file.name.split('.').pop();
                        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
                        const isImage = imageExtensions.includes(extension);
                        const icon = iconDict.includes(extension) ? extension : 'file';
                        return (
                          <Box key={`${file.id}-${file.name}`} display="flex">
                            <Icon icon={isImage ? 'image' : icon} width="22px" height="22px" />
                            <Link
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="blue.500"
                              margin="0 0 0 10px"
                            >
                              {file.name}
                            </Link>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
                <Flex padding="8px" flexDirection="column" gridGap="16px" background={featuredColor} borderRadius="4px">
                  <Flex alignItems="center" gridGap="10px">
                    <Icon icon="code" width="18.5px" height="17px" color="#fff" />
                    <Text size="14px" fontWeight={700}>
                      {`${contextData?.code_revisions?.length} code reviews`}
                    </Text>
                  </Flex>
                  <Button height="auto" onClick={proceedToCommitFiles} isLoading={loaders.isFetchingCommitFiles} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="start">
                    {isStudent ? 'Read and rate the feedback' : 'Start code review'}
                    <Icon icon="longArrowRight" width="24px" height="10px" color={hexColor.blueDefault} />
                  </Button>
                </Flex>

                {isReadyToApprove && !isStudent && (
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

                {isStudent && revisionStatus === 'REJECTED' && (
                  <Flex justifyContent="space-between" pt="8px">
                    <Button
                      minWidth="128px"
                      background={assignmentButtonColor.remove}
                      _hover={{ background: assignmentButtonColor.remove }}
                      onClick={(event) => {
                        changeStatusAssignment(event, currentTask, 'PENDING');
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
                      buttonChildren="Resubmit Assignment"
                      // currentAssetData,
                      // currentTask,
                      // sendProject,
                      // onClickHandler,
                      // settingsOpen,
                      // allowText,
                      // closeSettings,
                      // toggleSettings,
                      // buttonChildren,
                    />

                    {/* <Button
                      minWidth="128px"
                      background={assignmentButtonColor.resubmit}
                      _hover={{ background: assignmentButtonColor.resubmit }}
                      onClick={(event) => {

                        // changeStatusAssignment(event, currentTask, 'PENDING');
                      }}
                      color="white"
                      borderRadius="3px"
                      fontSize="13px"
                      textTransform="uppercase"
                    >
                      {assignmentButtonText.resubmit}
                    </Button> */}
                  </Flex>
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
            <Textarea aria-label="feedback input" fontSize="12px" onChange={onChangeComment} minHeight="134" placeholder="Start you review here..." />
            <Box position="absolute" bottom={1.5} right={3} color={comment.length < 10 ? '#EB5757' : 'currentColor'}>
              {`${comment.length}/ ${inputLimit}`}
            </Box>
          </Box>
          <Button isLoading={loaders.isApprovingOrRejecting} variant="default" alignSelf="flex-end" isDisabled={comment.length < 10 || revisionStatusUpperCase[reviewStatus] === undefined} onClick={approveOrRejectProject}>
            Send feedback
          </Button>
        </Flex>
      )}

      {stage === stages.file_list && !loaders.isFetchingCommitFiles && (
        <FileList isStudent={isStudent} contextData={contextData} setContextData={setContextData} stage={stage} stages={stages} setStage={setStage} setReviewStatus={setReviewStatus} />
      )}
      {stage === stages.code_review && (contextData.commitFile?.code || contextData.revision_content?.code) && (
        <CodeReview isStudent={isStudent} setStage={setStage} handleResetFlow={handleResetFlow} contextData={contextData} setContextData={setContextData} selectedText={selectedText} handleSelectedText={handleSelectedText} />
      )}

      {/* Student view */}
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
};

export default ReviewModal;
