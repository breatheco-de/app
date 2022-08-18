import {
  Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, useColorModeValue, FormControl, Input, FormErrorMessage,
  Link,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Text from '../../common/components/Text';
import validationSchema from '../../common/components/Forms/validationSchemas';

const ModalInfo = ({
  isOpen, onClose, actionHandler, rejectHandler, forceHandler, disableHandler, title, description,
  teacherFeedback, linkInfo, linkText, link, handlerText, closeText, cancelColorButton,
  handlerColorButton, rejectData, sendProject, currentTask, type, closeButtonVariant,
}) => {
  const { t } = useTranslation('dashboard');
  const [githubUrl, setGithubUrl] = useState(link);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmRejection, setConfirmRejection] = useState(false);
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const commonInputColor = useColorModeValue('gray.default', 'gray.300');
  const commonInputActiveColor = useColorModeValue('gray.800', 'gray.100');
  const commonHighlightColor = useColorModeValue('gray.250', 'darkTheme');
  const rejectFunction = () => {
    if (forceHandler) {
      setConfirmRejection(true);
    } else {
      onClose();
    }
  };

  const resubmitHandler = () => {
    setIsSubmitting(true);
    if (githubUrl !== '') {
      sendProject(currentTask, githubUrl, 'DONE');
      setIsSubmitting(false);
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal closeOnOverlayClick={!forceHandler} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
          >
            {title}
          </ModalHeader>

          {!forceHandler && <ModalCloseButton />}
          <ModalBody>
            <Text
              size="l"
              fontWeight="400"
              color={commonTextColor}
              margin="10px 0 0 0"
            >
              {description}
            </Text>
            {teacherFeedback && (
              <Box margin="15px 0 0 0" padding="12px 16px" background={commonHighlightColor} display="flex" flexDirection="column" gridGap="0px">
                <Text size="l" fontWeight="700" color={useColorModeValue('gray.800', 'gray.light')}>
                  {t('modalInfo.rejected.teacher-feedback')}
                </Text>
                <Text
                  size="l"
                  fontWeight="500"
                  color={commonTextColor}
                  // padding="4px 0"
                  margin="0"
                  // margin="10px 0 0 0"
                  // opacity={0.8}
                  // borderLeft={4}
                  // borderStyle="solid"
                  // borderColor={commonBorderColor}
                  // _hover={{
                  //   opacity: 1,
                  //   transition: 'opacity 0.2s ease-in-out',
                  // }}
                >
                  {teacherFeedback}
                </Text>
              </Box>
            )}

            {!disableHandler && link && !linkText ? (
              <Box padding="18px 0 0 0">
                <Formik
                  initialValues={{ githubUrl: link }}
                  onSubmit={() => {
                    setIsSubmitting(true);
                    if (githubUrl !== '') {
                      sendProject(currentTask, githubUrl, 'DONE');
                      setIsSubmitting(false);
                      onClose();
                    }
                  }}
                  validationSchema={validationSchema.projectUrlValidation}
                >
                  {() => (
                    <Form>
                      <Field name="githubUrl">
                        {({ field, form }) => {
                          setGithubUrl(form.values.githubUrl);
                          return (
                            <FormControl
                              isInvalid={form.errors.githubUrl && form.touched.githubUrl}
                            >
                              <Input
                                {...field}
                                type="text"
                                color={commonInputColor}
                                _focus={{
                                  color: commonInputActiveColor,
                                }}
                                _hover={{
                                  color: commonInputActiveColor,
                                }}
                                id="githubUrl"
                                placeholder="https://github.com/..."
                              />
                              <FormErrorMessage marginTop="10px">
                                {form.errors.githubUrl}
                              </FormErrorMessage>
                            </FormControl>
                          );
                        }}
                      </Field>
                    </Form>
                  )}
                </Formik>

              </Box>
            ) : (
              <Box padding="20px 0">
                {linkInfo && (
                  <Text size="l" fontWeight="bold" color={commonTextColor}>
                    {linkInfo}
                  </Text>
                )}
                <Link href={link} color={useColorModeValue('blue.default', 'blue.300')} target="_blank" rel="noopener noreferrer">
                  {linkText || link}
                </Link>
              </Box>
            )}
          </ModalBody>

          {!disableHandler && (
            <ModalFooter justifyContent="space-evenly">
              {type === 'taskHandler' ? (
                <Box width="100%" display="flex" justifyContent="space-between">
                  <Button
                    fontSize="13px"
                    variant={closeButtonVariant}
                    onClick={actionHandler}
                    textTransform="uppercase"
                  >
                    {closeText}
                  </Button>
                  {!disableHandler && (
                    <Button
                      fontSize="13px"
                      isLoading={isSubmitting}
                      onClick={() => resubmitHandler()}
                      variant="default"
                      // colorScheme="blue"
                      textTransform="uppercase"
                    >
                      {handlerText}
                    </Button>
                  )}
                </Box>
              ) : (
                <>
                  <Button
                    fontSize="13px"
                    variant={closeButtonVariant}
                    colorScheme={cancelColorButton}
                    mr={3}
                    onClick={() => rejectFunction()}
                    textTransform="uppercase"
                  >
                    {closeText}
                  </Button>
                  {!disableHandler && (
                    <Button
                      fontSize="13px"
                      onClick={actionHandler}
                      colorScheme={handlerColorButton}
                      textTransform="uppercase"
                    >
                      {handlerText}
                    </Button>
                  )}
                </>
              )}
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>

      {confirmRejection && (
        <Modal isOpen={confirmRejection} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              borderBottom={1}
              borderStyle="solid"
              borderColor={commonBorderColor}
            >
              {/* Please confirm your action to reject all unsynced tasks */}
              {rejectData.title}
            </ModalHeader>
            <ModalFooter>
              <Button
                fontSize="13px"
                colorScheme="red"
                mr={3}
                onClick={() => setConfirmRejection(false)}
                textTransform="uppercase"
              >
                {rejectData.closeText}
              </Button>
              {!disableHandler && (
                <Button
                  fontSize="13px"
                  colorScheme="blue"
                  onClick={() => {
                    rejectHandler();
                    setConfirmRejection(false);
                  }}
                  textTransform="uppercase"
                >
                  {rejectData.handlerText}
                  {/* confirm */}
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

ModalInfo.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionHandler: PropTypes.func,
  rejectHandler: PropTypes.func,
  forceHandler: PropTypes.bool,
  disableHandler: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  teacherFeedback: PropTypes.string,
  linkInfo: PropTypes.string,
  linkText: PropTypes.string,
  link: PropTypes.string,
  handlerText: PropTypes.string,
  closeText: PropTypes.string,
  handlerColorButton: PropTypes.string,
  cancelColorButton: PropTypes.string,
  rejectData: PropTypes.objectOf(PropTypes.string),
  sendProject: PropTypes.func,
  currentTask: PropTypes.objectOf(PropTypes.any),
  type: PropTypes.string,
  closeButtonVariant: PropTypes.string,
};

ModalInfo.defaultProps = {
  actionHandler: () => {},
  rejectHandler: () => {},
  forceHandler: false,
  disableHandler: false,
  title: 'Review status',
  description: '',
  teacherFeedback: '',
  linkInfo: '',
  linkText: '',
  link: '',
  handlerText: 'Remove delivery',
  closeText: 'Close',
  handlerColorButton: 'blue',
  cancelColorButton: 'red',
  rejectData: {},
  sendProject: () => {},
  currentTask: {},
  type: 'default',
  closeButtonVariant: 'danger',
};

export default ModalInfo;
