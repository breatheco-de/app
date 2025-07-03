import {
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  Popover,
  PopoverTrigger,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import ButtonVariants from './ButtonVariants';
import DeliveryFormat from './DeliveryFormat';

function ProjectSubmitButton({
  isGuidedExperience,
  isLoading,
  currentAssetData,
  currentTask,
  sendProject,
  onClickHandler,
  allowText,
  isPopoverOpen,
  closePopover,
  togglePopover,
  buttonChildren,
}) {
  const { t } = useTranslation('dashboard');
  const taskIsApproved = allowText && currentTask?.revision_status === 'APPROVED';
  const isButtonDisabled = currentTask === null || taskIsApproved;

  const handleCloseFile = () => {
    closePopover();
  };

  const deliveryFormatExists = typeof currentAssetData?.delivery_formats === 'string';
  const noDeliveryFormat = deliveryFormatExists && currentAssetData?.delivery_formats.includes('no_delivery');

  return (
    <Popover
      id="task-status"
      isOpen={isPopoverOpen}
      onClose={handleCloseFile}
      trigger="click"
      placement="top-start"
    >

      <PopoverTrigger>
        <ButtonVariants
          isLoading={isLoading}
          isDisabled={isButtonDisabled}
          onClick={togglePopover}
          currentTask={currentTask}
          noDeliveryFormat={noDeliveryFormat}
          allowText={allowText}
          buttonChildren={buttonChildren}
          withTooltip={isGuidedExperience}
        />
      </PopoverTrigger>

      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader>{t('deliverProject.title')}</PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody>
          <DeliveryFormat
            currentAssetData={currentAssetData}
            currentTask={currentTask}
            sendProject={sendProject}
            closePopover={closePopover}
            onClickHandler={onClickHandler}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

ProjectSubmitButton.propTypes = {
  isLoading: PropTypes.bool,
  currentAssetData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  sendProject: PropTypes.func,
  onClickHandler: PropTypes.func,
  closePopover: PropTypes.func,
  isPopoverOpen: PropTypes.bool,
  allowText: PropTypes.bool,
  togglePopover: PropTypes.func,
  buttonChildren: PropTypes.node,
  isGuidedExperience: PropTypes.bool,
};

ProjectSubmitButton.defaultProps = {
  isLoading: false,
  currentAssetData: {},
  currentTask: {},
  sendProject: () => { },
  onClickHandler: () => { },
  closePopover: () => { },
  isPopoverOpen: false,
  allowText: false,
  togglePopover: () => { },
  buttonChildren: null,
  isGuidedExperience: false,
};

export default ProjectSubmitButton;
