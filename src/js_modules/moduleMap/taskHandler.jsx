/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/no-unstable-nested-components */
import {
  Button,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Icon from '../../common/components/Icon';
import ReviewModal from '../../common/components/ReviewModal';
import PopoverTaskHandler, { IconByTaskStatus, TextByTaskStatus } from '../../common/components/PopoverTaskHandler';

export function ButtonHandlerByTaskStatus({
  onlyPopoverDialog, currentTask, sendProject, changeStatusAssignment, toggleSettings, closeSettings,
  settingsOpen, allowText, onClickHandler, currentAssetData, fileData, handleOpen,
}) {
  const { t } = useTranslation('dashboard');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [loaders, setLoaders] = useState({
    isFetchingCommitFiles: false,
    isOpeningReviewModal: false,
    isChangingTaskStatus: false,
  });
  const taskIsAproved = allowText && currentTask?.revision_status === 'APPROVED';

  const deliveryFormatExists = typeof currentAssetData?.delivery_formats === 'string';
  const noDeliveryFormat = deliveryFormatExists && currentAssetData?.delivery_formats.includes('no_delivery');
  const isButtonDisabled = currentTask === null || taskIsAproved;

  function TaskButton() {
    return (
      <Button
        display="flex"
        isLoading={loaders.isChangingTaskStatus}
        onClick={(event) => {
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
        }}
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
          <TextByTaskStatus currentTask={currentTask} t={t} />
        ) : (
          <IconByTaskStatus currentTask={currentTask} />
        )}
      </Button>
    );
  }

  const openAssignmentFeedbackModal = () => {
    // if (currentTask.revision_status !== 'APPROVED') {
    //   bc.assignments().getCodeRevisions(currentTask.id)
    //     .then(({ data }) => {
    //       log('code_revisions_data:::', data);
    //       setContextData({
    //         code_revisions: data,
    //       });
    //     })
    //     .catch(() => {
    //       toast({
    //         title: t('alert-message:something-went-wrong'),
    //         description: 'Cannot get code revisions',
    //         status: 'error',
    //         duration: 5000,
    //         position: 'top',
    //         isClosable: true,
    //       });
    //     })
    //     .finally(() => {
    //       // onOpen();
    //       setIsReviewModalOpen(true);
    //       setLoaders((prevState) => ({
    //         ...prevState,
    //         isOpeningReviewModal: false,
    //       }));
    //     });
    // } else {
    //   // onOpen();
    // }
    setIsReviewModalOpen(true);
    setLoaders((prevState) => ({
      ...prevState,
      isOpeningReviewModal: false,
    }));
  };

  function OpenModalButton() {
    return (
      <Button
        isLoading={loaders.isOpeningReviewModal}
        onClick={() => {
          if (currentTask) {
            setLoaders((prevState) => ({
              ...prevState,
              isOpeningReviewModal: true,
            }));
            // if (noDeliveryFormat) {
            //   changeStatusAssignment(event, currentTask, 'PENDING');
            //   setLoaders((prevState) => ({
            //     ...prevState,
            //     isOpeningReviewModal: false,
            //   }));
            // } else {
            // }
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
          <TextByTaskStatus currentTask={currentTask} t={t} />
        ) : (
          <IconByTaskStatus currentTask={currentTask} noDeliveryFormat={noDeliveryFormat} />
        )}
      </Button>
    );
  }

  // PRROJECT CASE
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && !onlyPopoverDialog) {
      // Option case Revision pending...
      // CODING HERE 🚧 - DESDE AHORA AQUI SE VERA APROVADO, PENDING O REJECTED
      return (
        <>
          <Button variant="unstyled" mr="10px">
            <Icon icon="comment" width="20px" height="20px" />
          </Button>
          <OpenModalButton />

          <ReviewModal
            isOpen={isReviewModalOpen}
            isStudent
            fileData={fileData}
            currentAssetData={currentAssetData}
            currentTask={currentTask}
            projectLink={currentTask?.github_url}
            onClose={() => setIsReviewModalOpen(false)}
          />
        </>
      );
    }
    return (
      <PopoverTaskHandler
        currentAssetData={currentAssetData}
        currentTask={currentTask}
        sendProject={sendProject}
        onClickHandler={onClickHandler}
        settingsOpen={settingsOpen}
        allowText={allowText}
        closeSettings={closeSettings}
        toggleSettings={toggleSettings}
      />
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
  onlyPopoverDialog: PropTypes.bool,
};
ButtonHandlerByTaskStatus.defaultProps = {
  currentTask: null,
  allowText: false,
  onClickHandler: () => {},
  currentAssetData: {},
  fileData: {},
  toggleSettings: () => {},
  handleOpen: () => {},
  onlyPopoverDialog: false,
};
