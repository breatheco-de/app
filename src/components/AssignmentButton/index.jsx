import {
  Button,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';
import ProjectSubmitButton from './ProjectSubmitButton';
import useCohortHandler from '../../hooks/useCohortHandler';
import bc from '../../services/breathecode';
import ButtonVariants from './ButtonVariants';
import useCustomToast from '../../hooks/useCustomToast';

function AssignmentButton({
  currentTask,
  sendProject,
  currentAssetData,
  allowText,
  onClickHandler,
  isGuidedExperience,
  hasPendingSubtasks,
  togglePendingSubtasks,
  setStage,
  portalled,
}) {
  const { t, lang } = useTranslation('dashboard');
  const { hexColor } = useStyle();
  const { updateTaskReadAt, handleOpenReviewModal, changeStatusAssignment } = useCohortHandler();
  const { createToast } = useCustomToast({ toastId: 'submit-assignment-error' });

  const [currentAsset, setCurrentAsset] = useState(currentAssetData);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [fileData, setFileData] = useState(null);

  useEffect(() => {
    if (currentAssetData?.id !== currentAsset?.id) {
      setCurrentAsset(currentAssetData);
    }
  }, [currentAssetData]);

  const [loaders, setLoaders] = useState({
    isFetchingCommitFiles: false,
    isOpeningReviewModal: false,
    isChangingTaskStatus: false,
  });
  const taskIsApproved = allowText && currentTask?.revision_status === 'APPROVED';
  const taskIsApprovedOrRejected = currentTask?.revision_status === 'APPROVED' || currentTask?.revision_status === 'REJECTED';

  const deliveryFormatExists = typeof currentAsset?.delivery_formats === 'string';
  const noDeliveryFormat = deliveryFormatExists && currentAsset?.delivery_formats.includes('no_delivery');
  const isButtonDisabled = currentTask === null || taskIsApproved;

  const fetchAsset = async () => {
    try {
      const assetResp = await bc.registry().getAsset(currentTask.associated_slug);
      if (assetResp?.status >= 400) {
        throw new Error('Error fetching asset');
      }
      let assetData = assetResp.data;
      if (assetData?.translations?.[lang]) {
        const localeResp = await bc.registry().getAsset(assetResp.data.translations[lang]);
        assetData = localeResp.data;
      }
      setCurrentAsset(assetData);
      return assetData;
    } catch (error) {
      console.error(error);
      createToast({
        position: 'top',
        title: t('alert-message:something-went-wrong'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      return null;
    }
  };

  const togglePopover = async () => {
    if (!currentAsset) {
      await fetchAsset();
    }
    setIsPopoverOpen(!isPopoverOpen);
  };

  const fetchFileData = async () => {
    let assetData = currentAsset;
    if (!assetData) {
      assetData = await fetchAsset();
    }
    if (typeof assetData?.delivery_formats === 'string' && !assetData?.delivery_formats.includes('url')) {
      const fileResp = await bc.assignments().getFile({ id: currentTask.id });
      const respData = fileResp.data;
      setFileData(respData);
    }
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const openAssignmentFeedbackModal = async () => {
    if (currentTask) {
      setLoaders((prevState) => ({
        ...prevState,
        isOpeningReviewModal: true,
      }));
      await updateTaskReadAt(currentTask);
      if (setStage) {
        setStage('initial');
      }
      handleOpenReviewModal({
        currentTask,
        externalFiles: fileData,
        cohortSlug: currentTask.cohort?.slug,
        defaultStage: 'initial',
      });
      setLoaders((prevState) => ({
        ...prevState,
        isOpeningReviewModal: false,
      }));
    }
  };

  const handleNonDeliverableTask = () => {
    if (currentTask) {
      setLoaders((prevState) => ({
        ...prevState,
        isChangingTaskStatus: true,
      }));
      changeStatusAssignment(currentTask)
        .finally(() => {
          setLoaders((prevState) => ({
            ...prevState,
            isChangingTaskStatus: false,
          }));
          onClickHandler();
        });
    }
  };

  const loadAndOpenReviewModal = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isOpeningReviewModal: true,
    }));
    await fetchFileData();
    openAssignmentFeedbackModal();
  };

  // PRROJECT CASE
  if (currentTask?.task_type === 'PROJECT') {
    if ((currentTask.task_status === 'DONE' || taskIsApprovedOrRejected) && !isGuidedExperience) {
      return (
        <>
          {currentTask?.description && (
            <Button
              variant="none"
              onClick={loadAndOpenReviewModal}
            >
              <Icon icon="comment" color={hexColor.blueDefault} />
            </Button>
          )}
          <ButtonVariants
            isLoading={loaders.isOpeningReviewModal}
            onClick={loadAndOpenReviewModal}
            isDisabled={isButtonDisabled}
            currentTask={currentTask}
            hasPendingSubtasks={hasPendingSubtasks}
            noDeliveryFormat={noDeliveryFormat}
            allowText={allowText}
          />
        </>
      );
    }
    if (hasPendingSubtasks && !taskIsApprovedOrRejected && currentTask.task_status === 'PENDING') {
      return (
        <ButtonVariants
          isLoading={loaders.isOpeningReviewModal}
          allowText={allowText}
          onClick={togglePendingSubtasks}
          isDisabled={isButtonDisabled}
          currentTask={currentTask}
          hasPendingSubtasks={hasPendingSubtasks}
          withTooltip={isGuidedExperience}
          noDeliveryFormat={noDeliveryFormat}
        />
      );
    }
    return (
      <ProjectSubmitButton
        isGuidedExperience={isGuidedExperience}
        currentAssetData={currentAsset}
        currentTask={currentTask}
        sendProject={sendProject}
        onClickHandler={onClickHandler}
        allowText={allowText}
        isPopoverOpen={isPopoverOpen}
        closePopover={closePopover}
        togglePopover={togglePopover}
        portalled={portalled}
      />
    );
  }

  return (
    <ButtonVariants
      isLoading={loaders.isChangingTaskStatus}
      onClick={handleNonDeliverableTask}
      isDisabled={isButtonDisabled}
      withTooltip={isGuidedExperience}
      currentTask={currentTask}
      hasPendingSubtasks={hasPendingSubtasks}
      allowText={allowText}
    />
  );
}

export default AssignmentButton;

AssignmentButton.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  sendProject: PropTypes.func.isRequired,
  togglePendingSubtasks: PropTypes.func,
  allowText: PropTypes.bool,
  onClickHandler: PropTypes.func,
  currentAssetData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  isGuidedExperience: PropTypes.bool,
  hasPendingSubtasks: PropTypes.bool,
  setStage: PropTypes.func,
  portalled: PropTypes.bool,
};

AssignmentButton.defaultProps = {
  currentTask: null,
  allowText: false,
  onClickHandler: () => { },
  currentAssetData: null,
  togglePendingSubtasks: () => { },
  isGuidedExperience: false,
  hasPendingSubtasks: undefined,
  setStage: null,
  portalled: false,
};
