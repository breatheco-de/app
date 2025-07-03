import { useState } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';

function NoDeliveryFormat({ currentTask, sendProject, closePopover }) {
  const { t } = useTranslation('dashboard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <Box display="flex" flexDirection="column" gridGap="10px">
      <Text size="md">{t('deliverProject.no-delivery-needed')}</Text>
      <Button
        width="fit-content"
        onClick={async () => {
          setIsSubmitting(true);
          await sendProject({ task: currentTask, taskStatus: 'DONE' });
          setIsSubmitting(false);
          closePopover();
        }}
        colorScheme="blue"
        isLoading={isSubmitting}
        type="submit"
      >
        {t('deliverProject.handler-text')}
      </Button>
    </Box>
  );
}

NoDeliveryFormat.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
  sendProject: PropTypes.func,
  closePopover: PropTypes.func,
};

NoDeliveryFormat.defaultProps = {
  currentTask: {},
  sendProject: () => {},
  closePopover: () => {},
};

export default NoDeliveryFormat;
