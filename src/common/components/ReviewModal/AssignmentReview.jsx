import { useState, useEffect } from 'react';
import {
  Box, Button, Flex, Link,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import useAuth from '../../hooks/useAuth';
import useCohortHandler from '../../hooks/useCohortHandler';
import AlertMessage from '../AlertMessage';
import Icon from '../Icon';
import LoaderScreen from '../LoaderScreen';
import ProjectSubmitButton from '../AssignmentButton/ProjectSubmitButton';
import UndoApprovalModal from '../UndoApprovalModal';
import iconDict from '../../../iconDict.json';
import { error } from '../../../utils/logging';
import bc from '../../services/breathecode';

const statusList = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};
const { APPROVED, PENDING, REJECTED } = statusList;

function AssignmentReview({
  currentTask,
  loaders,
  hasFilesToReview,
  isStudent,
  noFilesToReview,
  disableRate,
  contextData,
  setStage,
  rejectOrApprove,
  updpateAssignment,
  onClose,
  resetState,
  setLoaders,
  externalFiles,
}) {
  const { t } = useTranslation('assignments');
  const { lightColor, featuredColor } = useStyle();
  const [openUndoApproval, setOpenUndoApproval] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [currentAssetData, setCurrentAssetData] = useState(null);
  const [fileData, setFileData] = useState();
  const { isAuthenticatedWithRigobot } = useAuth();
  const { cohortSession, updateAssignment, changeStatusAssignment } = useCohortHandler();

  const commitFiles = contextData?.commitFiles || {};
  const codeRevisions = contextData?.code_revisions || [];

  const taskStatus = currentTask?.task_status;
  const revisionStatus = currentTask?.revision_status;
  const hasNotBeenReviewed = revisionStatus === PENDING;
  const hasBeenApproved = revisionStatus === APPROVED;
  const hasBeenRejected = revisionStatus === REJECTED;

  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;

  const codeRevisionsNotExists = codeRevisions === 'undefined';
  const minimumReviews = 0; // The minimun number of reviews until the project is ready to be approved or rejected
  const isReadyToApprove = (codeRevisions.length >= minimumReviews || codeRevisionsNotExists) && taskStatus === 'DONE';

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

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(`/api/download/file?url=${fileUrl}&filename=${fileName}`);
      if (response.ok) {
        const blob = await response.blob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
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

  const proceedToCommitFiles = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: true,
    }));
    if (isStudent) {
      setStage('review_code_revision');
    } else {
      setStage('file_list');
    }
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: false,
    }));
  };

  const getAssetData = async () => {
    const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
    if (assetResp.status < 400) {
      setLoaders((prevState) => ({
        ...prevState,
        isOpeningResubmitForm: false,
      }));
      const assetData = assetResp.data;
      setCurrentAssetData(assetData);

      if (typeof assetData?.delivery_formats === 'string' && !assetData?.delivery_formats.includes('url')) {
        const fileResp = await bc.todo().getFile({ id: currentTask.id, academyId: cohortSession?.academy?.id });
        const respData = fileResp.data;
        setFileData(respData);
      }
    }
  };
  const togglePopover = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isOpeningResubmitForm: true,
    }));
    await getAssetData();
    setIsPopoverOpen(!isPopoverOpen);
  };
  const closePopover = () => {
    setIsPopoverOpen(false);
  };
  const sendProject = async ({ task, githubUrl, taskStatus: newTaskStatus }) => {
    await updateAssignment({
      task, githubUrl, taskStatus: newTaskStatus,
    });
  };

  useEffect(() => {
    if (currentTask?.id && externalFiles) {
      setFileData(externalFiles);
    }
  }, [currentTask, externalFiles]);

  return (
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
            <Flex flexDirection="column" color={lightColor}>
              <Text size="md" fontWeight={700}>
                {!isStudent ? t('code-review.project-delivered') : t('dashboard:modalInfo.link-info')}
              </Text>
              {currentTask?.github_url && (
                <Link variant="default" fontSize="14px" href={currentTask.github_url}>
                  {currentTask?.title}
                </Link>
              )}
              {currentTask?.delivered_at && (
                <Text size="md">
                  {t('code-review.delivered-at')}
                  {'  '}
                  {format(new Date(currentTask.delivered_at), 'MM/dd/yyyy')}
                </Text>
              )}
            </Flex>

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
            {(!isAuthenticatedWithRigobot || !noFilesToReview) && hasFilesToReview && !disableRate && commitFiles?.fileList?.length > 0 && (
              <Flex padding="8px" flexDirection="column" gridGap="16px" background={featuredColor} borderRadius="4px">
                <Flex alignItems="center" gridGap="10px">
                  <Icon icon="code" width="18.5px" height="17px" color="currentColor" />
                  <Text size="14px" fontWeight={700}>
                    {t('code-review.count-code-reviews', { count: codeRevisions.length || 0 })}
                  </Text>
                  {!isStudent && codeRevisions.length > 0 && (
                    <Button height="auto" width="fit-content" onClick={() => setStage('review_code_revision')} isLoading={loaders.isFetchingCommitFiles} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="start">
                      {t('code-review.read-code-reviews')}
                    </Button>
                  )}
                </Flex>
                <Button height="auto" width="fit-content" onClick={proceedToCommitFiles} isLoading={loaders.isFetchingCommitFiles} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="start">
                  {isStudent
                    ? t('code-review.read-and-rate-the-feedback')
                    : t('code-review.start-code-review')}
                  <Icon icon="longArrowRight" width="24px" height="10px" color="blue.500" />
                </Button>
              </Flex>
            )}

            {isReadyToApprove && !isStudent && !hasBeenApproved && (
              <Flex justifyContent="space-between" pt="8px">
                {['reject', 'approve'].map((type) => (
                  <Button
                    key={type}
                    minWidth="128px"
                    background={buttonColor[type]}
                    _hover={{ background: buttonColor[type] }}
                    onClick={() => rejectOrApprove(type)}
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
                  onClick={() => {
                    setLoaders((prevState) => ({
                      ...prevState,
                      isRemovingDelivery: true,
                    }));
                    changeStatusAssignment(currentTask, PENDING)
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
                <ProjectSubmitButton
                  isLoading={loaders.isOpeningResubmitForm}
                  currentAssetData={currentAssetData}
                  currentTask={currentTask}
                  sendProject={sendProject}
                  isPopoverOpen={isPopoverOpen}
                  closePopover={closePopover}
                  togglePopover={togglePopover}
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
                    resetState();
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
  );
}

AssignmentReview.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  loaders: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  hasFilesToReview: PropTypes.bool,
  isStudent: PropTypes.bool,
  noFilesToReview: PropTypes.bool,
  disableRate: PropTypes.bool,
  contextData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  setStage: PropTypes.func,
  rejectOrApprove: PropTypes.func,
  updpateAssignment: PropTypes.func,
  onClose: PropTypes.func,
  resetState: PropTypes.func,
  setLoaders: PropTypes.func,
  externalFiles: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

AssignmentReview.defaultProps = {
  currentTask: {},
  loaders: {},
  hasFilesToReview: false,
  isStudent: false,
  noFilesToReview: false,
  disableRate: false,
  contextData: {},
  setStage: () => {},
  rejectOrApprove: () => {},
  updpateAssignment: () => {},
  onClose: () => {},
  resetState: () => {},
  setLoaders: () => {},
  externalFiles: [],
};

export default AssignmentReview;
