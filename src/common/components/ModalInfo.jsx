import {
  Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, useColorModeValue, FormControl, Input, FormErrorMessage,
  Link,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { useState, memo } from 'react';
import Text from './Text';
import validationSchema from './Forms/validationSchemas';
import Icon from './Icon';
import iconDict from '../../iconDict.json';

function ModalInfo({
  isOpen, onClose, actionHandler, closeActionHandler, rejectHandler, forceHandler, disableHandler, title, description,
  teacherFeedback, linkInfo, linkText, link, handlerText, closeText, cancelColorButton,
  handlerColorButton, rejectData, sendProject, currentTask, type, closeButtonVariant,
  htmlDescription, attachment, disableInput, descriptionStyle, footerStyle,
  closeButtonStyles, buttonHandlerStyles, headerStyles, disableCloseButton, childrenDescription,
  maxWidth, forceHandlerAndClose, children, ...rest
}) {
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
    if (forceHandler && !forceHandlerAndClose) {
      setConfirmRejection(true);
    } else {
      closeActionHandler();
      onClose();
    }
  };

  const resubmitHandler = () => {
    setIsSubmitting(true);
    if (githubUrl !== '') {
      sendProject({
        task: currentTask,
        githubUrl,
        taskStatus: 'DONE',
      });
      setIsSubmitting(false);
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal blockScrollOnMount={false} closeOnOverlayClick={!forceHandler} isOpen={isOpen} onClose={onClose} {...rest}>
        <ModalOverlay />
        {/* md */}
        <ModalContent maxWidth={maxWidth || 'md'} borderRadius="6px" style={{ marginTop: '10vh' }}>
          <ModalHeader
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            {...headerStyles}
          >
            {title}
          </ModalHeader>

          {!forceHandler && <ModalCloseButton />}
          <ModalBody>
            {description && (
              <Text
                size="l"
                fontWeight="400"
                color={commonTextColor}
                margin="10px 0 0 0"
                {...descriptionStyle}
              >
                {description}
              </Text>
            )}
            {htmlDescription && (
              <Text
                size="l"
                fontWeight="400"
                color={commonTextColor}
                margin="10px 0 0 0"
                dangerouslySetInnerHTML={{
                  __html: htmlDescription,
                }}
              />
            )}
            {childrenDescription && childrenDescription}
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

            {Array.isArray(attachment) && attachment.length > 0 ? (
              <Box mt="10px">
                <Text size="l" mb="8px">
                  {t('modalInfo.files-sended-to-teacher')}
                </Text>
                <Box display="flex" flexDirection="column" gridGap="8px" maxHeight="135px" overflowY="auto">
                  {attachment.map((file) => {
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
            ) : (
              <>
                {!disableInput && !disableHandler && link && (
                  <Box padding="18px 0 0 0">
                    <Formik
                      initialValues={{ githubUrl: link }}
                      onSubmit={() => {
                        setIsSubmitting(true);
                        if (githubUrl !== '') {
                          sendProject({
                            task: currentTask,
                            githubUrl,
                            taskStatus: 'DONE',
                          });
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
                )}

                {disableInput && (linkText || link) && (
                  <Box padding="18px 0 0 0">
                    <Text size="l" fontWeight="bold" color={commonTextColor}>
                      {linkInfo}
                    </Text>
                    <Link
                      href={link}
                      color={useColorModeValue('blue.default', 'blue.300')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {linkText || link}
                    </Link>
                  </Box>
                )}
              </>
            )}
            {children && children}
          </ModalBody>

          <ModalFooter justifyContent="space-evenly" {...footerStyle}>
            {type === 'taskHandler' ? (
              <Box width="100%" display="flex" justifyContent="space-between">
                {!disableCloseButton && (
                  <Button
                    fontSize="13px"
                    variant={closeButtonVariant}
                    onClick={actionHandler}
                    textTransform="uppercase"
                  >
                    {closeText || t('common:close')}
                  </Button>
                )}
                <Button
                  fontSize="13px"
                  isDisabled={(Array.isArray(attachment) && attachment.length > 0) || isSubmitting || disableHandler}
                  isLoading={isSubmitting}
                  onClick={() => resubmitHandler()}
                  variant="default"
                  // colorScheme="blue"
                  textTransform="uppercase"
                >
                  {handlerText}
                </Button>
              </Box>
            ) : (
              <>
                {!disableCloseButton && (
                  <Button
                    fontSize="13px"
                    variant={closeButtonVariant}
                    colorScheme={cancelColorButton}
                    mr={3}
                    onClick={() => rejectFunction()}
                    textTransform="uppercase"
                    {...closeButtonStyles}
                  >
                    {closeText || t('common:close')}
                  </Button>
                )}
                {!disableHandler && (
                  <Button
                    fontSize="13px"
                    onClick={actionHandler}
                    colorScheme={handlerColorButton}
                    textTransform="uppercase"
                    {...buttonHandlerStyles}
                  >
                    {handlerText}
                  </Button>
                )}
              </>
            )}
          </ModalFooter>
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
              {(!disableHandler || forceHandler) && (
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
}

ModalInfo.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  actionHandler: PropTypes.func,
  closeActionHandler: PropTypes.func,
  rejectHandler: PropTypes.func,
  forceHandler: PropTypes.bool,
  disableHandler: PropTypes.bool,
  disableInput: PropTypes.bool,
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
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  type: PropTypes.string,
  closeButtonVariant: PropTypes.string,
  htmlDescription: PropTypes.string,
  attachment: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  descriptionStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  footerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  closeButtonStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  buttonHandlerStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  headerStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  disableCloseButton: PropTypes.bool,
  childrenDescription: PropTypes.node,
  maxWidth: PropTypes.string,
  forceHandlerAndClose: PropTypes.bool,
  children: PropTypes.node,
};

ModalInfo.defaultProps = {
  isOpen: false,
  actionHandler: () => {},
  closeActionHandler: () => {},
  rejectHandler: () => {},
  forceHandler: false,
  disableHandler: false,
  title: 'Review status',
  description: '',
  teacherFeedback: '',
  linkInfo: '',
  disableInput: false,
  linkText: '',
  link: '',
  handlerText: 'Remove delivery',
  closeText: '',
  handlerColorButton: 'blue',
  cancelColorButton: 'red',
  rejectData: {},
  sendProject: () => {},
  currentTask: {},
  type: 'default',
  closeButtonVariant: 'danger',
  htmlDescription: '',
  attachment: [],
  descriptionStyle: {},
  footerStyle: {},
  closeButtonStyles: {},
  buttonHandlerStyles: {},
  headerStyles: {},
  disableCloseButton: false,
  childrenDescription: null,
  maxWidth: 'md',
  forceHandlerAndClose: false,
  children: null,
};

export default memo(ModalInfo);
