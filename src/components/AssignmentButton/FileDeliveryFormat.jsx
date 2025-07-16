import { useState, useRef } from 'react';
import { Box, Text, Button, Checkbox, Input, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import MarkDownParser from '../MarkDownParser';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import { formatBytes } from '../../utils';
import bc from '../../services/breathecode';
import useCohortHandler from '../../hooks/useCohortHandler';
import useCustomToast from '../../hooks/useCustomToast';

function FileDeliveryFormat({ currentAssetData, currentTask, sendProject, closePopover, onClickHandler }) {
  const { t } = useTranslation('dashboard');
  const [acceptTC, setAcceptTC] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileProps, setFileProps] = useState([]);
  const fileInputRef = useRef();
  const fileContainerRef = useRef(null);
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const { featuredColor, lightColor, modal, hexColor } = useStyle();
  const { createToast } = useCustomToast({ toastId: 'submit-project-error' });
  const maxFileSize = 1048576 * 10; // 10mb
  const fileErrorExists = fileProps.some((file) => file.formatError) || fileProps.some((file) => file.sizeError);
  const fileSumSize = fileProps.reduce((acc, { file }) => acc + file.size, 0);
  const mimeTypes = currentAssetData?.delivery_formats || 'application/pdf,image/png,image/jpeg,image/jpg,image/gif,doc,docx';

  const handleChangeFile = (e) => {
    setDragOver(false);
    const fileProp = e.target.files;
    const formatFileArr = mimeTypes.replaceAll('.', '').split(',');
    if (fileProp.length > 0) {
      Array.from(fileProp).forEach((file) => {
        const { type, name, size } = file;
        const extensionName = name.split('.').pop();
        const formatExists = formatFileArr.some((l) => String(type).includes(l) || extensionName === l);
        const formatError = !formatExists;
        const sizeError = size > maxFileSize;
        if (fileProps.some((item) => item.name === name)) return;
        setFileProps((prev) => [...prev, {
          name, type, size, file, formatError, sizeError,
        }]);
        fileContainerRef.current?.scrollTo({
          top: fileContainerRef.current?.scrollHeight,
          behavior: 'smooth',
        });
        setTimeout(() => {
          fileContainerRef.current?.scrollTo({
            top: fileContainerRef.current?.scrollHeight,
            behavior: 'smooth',
          });
        }, [300]);
      });
    }
  };
  const handleRemoveFileInList = (name) => {
    const updatedFileList = fileProps.filter((file) => file.name !== name);
    setFileProps(updatedFileList);
    fileInputRef.current.removeAttribute('multiple');
    fileInputRef.current.value = null;
    fileInputRef.current.setAttribute('multiple', 'multiple');
  };
  const handleUploadFile = async () => {
    setIsUploading(true);
    const formdata = new FormData();
    Array.from(fileProps).forEach(({ file }) => {
      formdata.append('file', file);
    });
    const resp = await bc.assignments({ academy: cohortSession?.academy.id }).uploadFile(currentTask.id, formdata);
    if (resp?.status < 400) {
      const respData = resp.data[0];
      setIsUploading(false);
      setFileProps([]);
      sendProject({
        task: currentTask,
        githubUrl: respData?.url,
        taskStatus: 'DONE',
        showShareModal: !onClickHandler,
      });
      createToast({
        position: 'top',
        title: t('alert-message:files-uploaded'),
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      closePopover();
    } else {
      setIsUploading(false);
      createToast({
        position: 'top',
        title: t('alert-message:something-went-wrong-with', { property: 'Files' }),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
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
          background={useColorModeValue('white', 'dark')}
          width={{ base: '100%', md: 'auto' }}
          className={`markdown-body ${useColorModeValue('light', 'dark')}`}
        >
          <MarkDownParser content={currentAssetData?.delivery_instructions} />
        </Box>
      ) : (
        <Text size="md">
          {t('deliverProject.file-upload')}
          <strong>{currentAssetData?.delivery_formats?.replaceAll(',', ', ').replaceAll('.', '').toUpperCase()}</strong>
        </Text>
      )}
      <Box className={`upload-wrapper ${dragOver && 'dragOver'}`} m="10px 0" width={{ base: 'auto', md: '100%' }} height="86px" position="relative" color={dragOver ? 'blue.600' : 'blue.default'} _hover={{ color: 'blue.default' }} transition="0.3s all ease-in-out" borderRadius="12px" background={featuredColor}>
        <Box width="100%" height="100%" position="absolute" display="flex" justifyContent="center" alignItems="center" border="1px solid currentColor" cursor="pointer" borderWidth="2px" borderRadius="7px">
          <Box className="icon-bounce">
            <Icon icon="upload" color="currentColor" width="24" height="24" />
          </Box>
        </Box>
        <Input
          type="file"
          name="Upload file"
          title=""
          ref={fileInputRef}
          onChange={handleChangeFile}
          accept={currentAssetData?.delivery_formats}
          placeholder="Upload profile image"
          multiple="multiple"
          position="absolute"
          width="100%"
          height="100%"
          cursor="pointer"
          opacity="0"
          padding="0"
          onDragOver={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
        />
      </Box>
      <Checkbox size="md" mb="10px" isChecked={acceptTC} onChange={() => setAcceptTC((prev) => !prev)}>
        <Text fontSize="sm">{t('deliverProject.deliver-confirm')}</Text>
      </Checkbox>
      {fileProps.some((file) => typeof file?.type === 'string') && (
        <>
          <Box ref={fileContainerRef} maxHeight="300px" overflowY="auto">
            {fileProps.map((file) => {
              const errorExists = file.formatError || file.sizeError;
              const extension = file.name.split('.').pop();
              const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
              const isImage = imageExtensions.includes(extension);
              const icon = isImage ? 'image' : 'file';
              return (
                <Box key={file.name} display="flex" my="15px" p="8px" border="1px solid" borderColor={featuredColor} background={modal.background} justifyContent="space-between" alignItems="center" borderRadius="7px">
                  <Box display="flex" gridGap="9px">
                    <Icon icon={icon} color={hexColor.black} width="32px" height="41px" />
                    <Box position="relative">
                      <Text size="14px" style={{ margin: '0px' }} withLimit={file.name.length > 20}>
                        {file.name}
                      </Text>
                      <Text size="14px" style={{ margin: '0px' }} color={errorExists && hexColor.danger} display="flex" gridGap="6px">
                        {errorExists ? (
                          <>
                            <Icon icon="warning" width="13px" height="13px" style={{ marginTop: '5px' }} color="currentColor" full secondColor={hexColor.white2} />
                            {file.formatError
                              ? t('deliverProject.error-file-format')
                              : file.sizeError && t('deliverProject.error-file-size')}
                          </>
                        ) : formatBytes(file.size)}
                      </Text>
                    </Box>
                  </Box>
                  <Box
                    borderRadius="20px"
                    p="7px"
                    backgroundColor="gray.500"
                    onClick={() => {
                      handleRemoveFileInList(file.name);
                    }}
                    cursor="pointer"
                  >
                    <Icon icon="close" width="10px" height="10px" color="#ffffff" />
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box py="12px" color={lightColor}>
            {t('deliverProject.total-size', { size: formatBytes(fileSumSize) })}
          </Box>
        </>
      )}
      <Box display="flex" justifyContent="space-evenly" mb="6px">
        <Button
          variant="default"
          onClick={handleUploadFile}
          isLoading={isUploading}
          isDisabled={!acceptTC || isUploading || fileProps?.length === 0 || fileProps.some((file) => typeof file?.type !== 'string') || fileErrorExists || fileSumSize > maxFileSize}
          textTransform="uppercase"
        >
          {t('common:upload')}
        </Button>
        <Button variant="link" textTransform="uppercase" onClick={closePopover}>
          {t('common:cancel')}
        </Button>
      </Box>
    </Box>
  );
}

FileDeliveryFormat.propTypes = {
  currentAssetData: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
  currentTask: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
  sendProject: PropTypes.func,
  closePopover: PropTypes.func,
  onClickHandler: PropTypes.func,
};

FileDeliveryFormat.defaultProps = {
  currentAssetData: {},
  currentTask: {},
  sendProject: () => {},
  closePopover: () => {},
  onClickHandler: () => {},
};

export default FileDeliveryFormat;
