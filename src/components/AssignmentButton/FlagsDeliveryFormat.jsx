import { useState } from 'react';
import { Box, Text, Button, Checkbox, Input, FormControl, FormErrorMessage, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import MarkDownParser from '../MarkDownParser';
import useCustomToast from '../../hooks/useCustomToast';

function FlagsDeliveryFormat({ currentAssetData, currentTask, sendProject, closePopover, onClickHandler, statusText }) {
  const { t } = useTranslation('dashboard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTC, setAcceptTC] = useState(false);
  const [flags, setFlags] = useState([]);
  const [flagErrors, setFlagErrors] = useState([]);
  const { createToast } = useCustomToast({ toastId: 'submit-flags-error' });
  const flagsConfig = currentAssetData.config || {};
  const flagQuantity = flagsConfig?.delivery?.quantity || 1;
  const flagIndexes = [...Array(flagQuantity).keys()];

  if (flags.length === 0) {
    setFlags(new Array(flagQuantity).fill(''));
    setFlagErrors(new Array(flagQuantity).fill(''));
  }

  const handleFlagChange = (index, value) => {
    const newFlags = [...flags];
    newFlags[index] = value;
    setFlags(newFlags);

    const newErrors = [...flagErrors];
    newErrors[index] = '';
    setFlagErrors(newErrors);
  };

  const checkForDuplicates = (flagsArray, errors) => {
    const newErrors = [...errors];

    const trimmedFlags = flagsArray.map((flag) => flag.trim()).filter((flag) => flag !== '');
    const hasDuplicates = new Set(trimmedFlags).size !== trimmedFlags.length;

    if (hasDuplicates) {
      const flagCounts = {};
      flagsArray.forEach((flag, index) => {
        const trimmed = flag.trim();
        if (trimmed) {
          flagCounts[trimmed] = (flagCounts[trimmed] || []).concat(index);
        }
      });

      Object.values(flagCounts).forEach((indexes) => {
        if (indexes.length > 1) {
          indexes.forEach((index) => {
            newErrors[index] = t('deliverProject.duplicate-flag');
          });
        }
      });

      return { hasDuplicates: true, errors: newErrors };
    }

    return { hasDuplicates: false, errors: newErrors };
  };

  const validateFlagFormat = (flag) => {
    const trimmed = flag.trim();
    return trimmed.startsWith('FLAG{') && trimmed.endsWith('}') && trimmed.length > 6;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const duplicateCheck = checkForDuplicates(flags, flagErrors);

    if (duplicateCheck.hasDuplicates) {
      setFlagErrors(duplicateCheck.errors);
      setIsSubmitting(false);

      createToast({
        position: 'top',
        title: t('deliverProject.duplicate-flags-error'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    const newErrors = duplicateCheck.errors;

    // Validate format and required flags
    let hasErrors = false;
    flags.forEach((flag, index) => {
      const trimmedFlag = flag.trim();

      if (!trimmedFlag) {
        newErrors[index] = t('deliverProject.flag-required');
        hasErrors = true;
      } else if (!validateFlagFormat(trimmedFlag)) {
        newErrors[index] = t('deliverProject.invalid-flag-format');
        hasErrors = true;
      }
    });

    setFlagErrors(newErrors);

    if (hasErrors) {
      createToast({
        position: 'top',
        title: t('deliverProject.some-flags-invalid'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    // Send flags to backend - it will validate the actual flag values
    try {
      if (onClickHandler) await onClickHandler();
      await sendProject({
        task: currentTask,
        taskStatus: 'DONE',
        flags: flags.map((flag) => flag.trim()),
        showShareModal: !onClickHandler,
      });
      closePopover();
    } catch (error) {
      createToast({
        position: 'top',
        title: t('alert-message:something-went-wrong'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Box>
      {currentAssetData?.delivery_instructions?.length > 2 ? (
        <Box
          height="100%"
          margin="0 rem auto 0 auto"
          transition="background 0.2s ease-in-out"
          borderRadius="3px"
          maxWidth="1280px"
          width={{ base: '100%', md: 'auto' }}
          className="markdown-body"
        >
          <MarkDownParser content={currentAssetData?.delivery_instructions} />
        </Box>
      ) : (
        <Text size="md" mb={4}>
          {t('deliverProject.submit-flags-instruction', { quantity: flagQuantity })}
        </Text>
      )}

      <VStack spacing={3} align="stretch">
        {flagIndexes.map((index) => (
          <FormControl key={index} isInvalid={!!flagErrors[index]}>
            <Input
              placeholder={t('deliverProject.flag-placeholder')}
              value={flags[index] || ''}
              onChange={(e) => handleFlagChange(index, e.target.value)}
              size="md"
            />
            {flagErrors[index] && (
              <FormErrorMessage>{flagErrors[index]}</FormErrorMessage>
            )}
          </FormControl>
        ))}
      </VStack>

      <Checkbox
        size="md"
        mt={4}
        mb={4}
        isChecked={acceptTC}
        onChange={() => setAcceptTC((prev) => !prev)}
      >
        <Text fontSize="sm">{t('deliverProject.deliver-confirm')}</Text>
      </Checkbox>

      <Button
        width="fit-content"
        colorScheme="blue"
        isLoading={isSubmitting}
        onClick={handleSubmit}
        isDisabled={!acceptTC || flags.every((flag) => !flag.trim())}
      >
        {statusText || t('deliverProject.handler-text')}
      </Button>
    </Box>
  );
}

FlagsDeliveryFormat.propTypes = {
  currentAssetData: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
  currentTask: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
  sendProject: PropTypes.func,
  closePopover: PropTypes.func,
  onClickHandler: PropTypes.func,
  statusText: PropTypes.string,
};

FlagsDeliveryFormat.defaultProps = {
  currentAssetData: {},
  currentTask: {},
  sendProject: () => {},
  closePopover: () => {},
  onClickHandler: () => {},
  statusText: '',
};

export default FlagsDeliveryFormat;
