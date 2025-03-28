/* eslint-disable no-unused-vars */
import {
  Button, Tooltip, useToast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState } from 'react';
import useStyle from '../../common/hooks/useStyle';
import Icon from '../../common/components/Icon';
import PopoverTaskHandler, { IconByTaskStatus, textByTaskStatus } from '../../common/components/PopoverTaskHandler';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import bc from '../../common/services/breathecode';

export function ButtonHandlerByTaskStatus({
  onlyPopoverDialog,
  currentTask,
  sendProject,
  currentAssetData,
  allowText,
  onClickHandler,
  isGuidedExperience,
  hasPendingSubtasks,
  togglePendingSubtasks,
  setStage,
}) {
  const { t, lang } = useTranslation('dashboard');
  const { hexColor } = useStyle();
  const { updateTaskReadAt, handleOpenReviewModal, changeStatusAssignment } = useCohortHandler();
  const toast = useToast();

  const [currentAsset, setCurrentAsset] = useState(currentAssetData);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [fileData, setFileData] = useState(null);

  const fetchAsset = async () => {
    try {
      const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
      if (assetResp?.status >= 400) {
        throw new Error('Error fetching asset');
      }
      let assetData = assetResp.data;
      if (assetData?.translations?.[lang]) {
        const localeResp = await bc.lesson().getAsset(assetResp.data.translations[lang]);
        assetData = localeResp.data;
      }
      setCurrentAsset(assetData);
      return assetData;
    } catch (error) {
      console.error(error);
      toast({
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

  const handleOpen = async () => {
    const taskIsApprovedOrRejected = currentTask?.revision_status === 'APPROVED' || currentTask?.revision_status === 'REJECTED';
    if (currentTask && currentTask?.task_type === 'PROJECT' && (currentTask.task_status === 'DONE' || taskIsApprovedOrRejected)) {
      let assetData = currentAsset;
      if (!assetData) {
        assetData = await fetchAsset();
      }
      if (typeof assetData?.delivery_formats === 'string' && !assetData?.delivery_formats.includes('url')) {
        const fileResp = await bc.todo().getFile({ id: currentTask.id });
        const respData = await fileResp.data;
        setFileData(respData);
      }
    }
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

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

  const handleTaskButton = (event) => {
    if (currentTask) {
      setLoaders((prevState) => ({
        ...prevState,
        isChangingTaskStatus: true,
      }));
      changeStatusAssignment(currentTask)
        .finally(() => {
          closePopover();
          setLoaders((prevState) => ({
            ...prevState,
            isChangingTaskStatus: false,
          }));
          onClickHandler();
        });
    }
  };

  const textAndIcon = textByTaskStatus(currentTask, isGuidedExperience, hasPendingSubtasks);

  const openTask = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isOpeningReviewModal: true,
    }));
    await handleOpen();
    openAssignmentFeedbackModal();
  };

  // PRROJECT CASE
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if ((currentTask.task_status === 'DONE' || taskIsApprovedOrRejected) && !onlyPopoverDialog && !isGuidedExperience) {
      return (
        <>
          {currentTask?.description && (
            <Button
              variant="none"
              onClick={openTask}
            >
              <Icon icon="comment" color={hexColor.blueDefault} />
            </Button>
          )}
          <Button
            isLoading={loaders.isOpeningReviewModal}
            onClick={openTask}
            isDisabled={isButtonDisabled}
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
              <>
                <Icon {...textAndIcon.icon} />
                {textAndIcon.text}
              </>
            ) : (
              <IconByTaskStatus currentTask={currentTask} noDeliveryFormat={noDeliveryFormat} />
            )}
          </Button>
        </>
      );
    }
    if (hasPendingSubtasks && !taskIsApprovedOrRejected && currentTask.task_status === 'PENDING') {
      return (
        <Button
          isLoading={loaders.isOpeningReviewModal}
          onClick={togglePendingSubtasks}
          isDisabled={isButtonDisabled}
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
            <>
              <Icon {...textAndIcon.icon} />
              {textAndIcon.text}
            </>
          ) : (
            <IconByTaskStatus currentTask={currentTask} noDeliveryFormat={noDeliveryFormat} />
          )}
        </Button>
      );
    }
    return (
      <PopoverTaskHandler
        isGuidedExperience={isGuidedExperience}
        currentAssetData={currentAsset}
        currentTask={currentTask}
        sendProject={sendProject}
        onClickHandler={onClickHandler}
        allowText={allowText}
        isPopoverOpen={isPopoverOpen}
        closePopover={closePopover}
        togglePopover={togglePopover}
      />
    );
  }

  if (isGuidedExperience) {
    return (
      <Tooltip label={textAndIcon.text} placement="top">
        <Button
          isLoading={loaders.isChangingTaskStatus}
          onClick={handleTaskButton}
          isDisabled={isButtonDisabled}
          width="40px"
          height="40px"
          background={hexColor.blueDefault}
          padding="20px"
          borderRadius="full"
          variant="default"
          gridGap="12px"
        >
          <Icon {...textAndIcon.icon} />
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      display="flex"
      isLoading={loaders.isChangingTaskStatus}
      onClick={handleTaskButton}
      isDisabled={isButtonDisabled}
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
        <>
          <Icon {...textAndIcon.icon} />
          {textAndIcon.text}
        </>
      ) : (
        <IconByTaskStatus currentTask={currentTask} />
      )}
    </Button>
  );
}

ButtonHandlerByTaskStatus.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  sendProject: PropTypes.func.isRequired,
  togglePendingSubtasks: PropTypes.func,
  allowText: PropTypes.bool,
  onClickHandler: PropTypes.func,
  currentAssetData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  onlyPopoverDialog: PropTypes.bool,
  isGuidedExperience: PropTypes.bool,
  hasPendingSubtasks: PropTypes.bool,
  setStage: PropTypes.func,
};

ButtonHandlerByTaskStatus.defaultProps = {
  currentTask: null,
  allowText: false,
  onClickHandler: () => { },
  currentAssetData: null,
  togglePendingSubtasks: () => { },
  onlyPopoverDialog: false,
  isGuidedExperience: false,
  hasPendingSubtasks: undefined,
  setStage: null,
};
