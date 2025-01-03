import {
  Button, Tooltip,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import useStyle from '../../common/hooks/useStyle';
import ReviewModal from '../../common/components/ReviewModal';
import Icon from '../../common/components/Icon';
import PopoverTaskHandler, { IconByTaskStatus, textByTaskStatus } from '../../common/components/PopoverTaskHandler';

export function ButtonHandlerByTaskStatus({
  onlyPopoverDialog, currentTask, sendProject, changeStatusAssignment, toggleSettings, closeSettings,
  settingsOpen, allowText, onClickHandler, currentAssetData, fileData, handleOpen, isGuidedExperience,
  hasPendingSubtasks, togglePendingSubtasks,
}) {
  const { hexColor } = useStyle();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [acceptTC, setAcceptTC] = useState(false);
  const [loaders, setLoaders] = useState({
    isFetchingCommitFiles: false,
    isOpeningReviewModal: false,
    isChangingTaskStatus: false,
  });
  const taskIsApproved = allowText && currentTask?.revision_status === 'APPROVED';
  const taskIsApprovedOrRejected = currentTask?.revision_status === 'APPROVED' || currentTask?.revision_status === 'REJECTED';

  const deliveryFormatExists = typeof currentAssetData?.delivery_formats === 'string';
  const noDeliveryFormat = deliveryFormatExists && currentAssetData?.delivery_formats.includes('no_delivery');
  const isButtonDisabled = currentTask === null || taskIsApproved;

  const openAssignmentFeedbackModal = () => {
    setIsReviewModalOpen(true);
    setLoaders((prevState) => ({
      ...prevState,
      isOpeningReviewModal: false,
    }));
  };

  const handleTaskButton = (event) => {
    if (currentTask) {
      setLoaders((prevState) => ({
        ...prevState,
        isChangingTaskStatus: true,
      }));
      changeStatusAssignment(event, currentTask)
        .finally(() => {
          setLoaders((prevState) => ({
            ...prevState,
            isChangingTaskStatus: false,
          }));
          onClickHandler();
        });
    }
  };

  const textAndIcon = textByTaskStatus(currentTask, isGuidedExperience, hasPendingSubtasks);

  // PRROJECT CASE
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if ((currentTask.task_status === 'DONE' || taskIsApprovedOrRejected) && !onlyPopoverDialog && !isGuidedExperience) {
      return (
        <>
          {currentTask?.description && (
            <Button
              variant="none"
              onClick={() => {
                if (currentTask) {
                  setLoaders((prevState) => ({
                    ...prevState,
                    isOpeningReviewModal: true,
                  }));
                  handleOpen(() => openAssignmentFeedbackModal());
                }
              }}
            >
              <Icon icon="comment" color={hexColor.blueDefault} />
            </Button>
          )}
          <Button
            isLoading={loaders.isOpeningReviewModal}
            onClick={() => {
              if (currentTask) {
                setLoaders((prevState) => ({
                  ...prevState,
                  isOpeningReviewModal: true,
                }));
                handleOpen(() => openAssignmentFeedbackModal());
              }
            }}
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

          <ReviewModal
            isOpen={isReviewModalOpen}
            isStudent
            changeStatusAssignment={changeStatusAssignment}
            externalFiles={fileData}
            currentTask={currentTask}
            projectLink={currentTask?.github_url}
            onClose={() => setIsReviewModalOpen(false)}
            acceptTC={acceptTC}
            handleAcceptTC={setAcceptTC}
          />
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
        currentAssetData={currentAssetData}
        currentTask={currentTask}
        sendProject={sendProject}
        onClickHandler={onClickHandler}
        settingsOpen={settingsOpen}
        allowText={allowText}
        closeSettings={closeSettings}
        toggleSettings={toggleSettings}
        acceptTC={acceptTC}
        handleAcceptTC={setAcceptTC}
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
  changeStatusAssignment: PropTypes.func.isRequired,
  toggleSettings: PropTypes.func,
  togglePendingSubtasks: PropTypes.func,
  closeSettings: PropTypes.func.isRequired,
  settingsOpen: PropTypes.bool.isRequired,
  allowText: PropTypes.bool,
  onClickHandler: PropTypes.func,
  handleOpen: PropTypes.func,
  currentAssetData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  fileData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  onlyPopoverDialog: PropTypes.bool,
  isGuidedExperience: PropTypes.bool,
  hasPendingSubtasks: PropTypes.bool,
};
ButtonHandlerByTaskStatus.defaultProps = {
  currentTask: null,
  allowText: false,
  onClickHandler: () => { },
  currentAssetData: {},
  fileData: {},
  toggleSettings: () => { },
  handleOpen: () => { },
  togglePendingSubtasks: () => { },
  onlyPopoverDialog: false,
  isGuidedExperience: false,
  hasPendingSubtasks: undefined,
};
