import PropTypes from 'prop-types';
import { Box, Button, Image, Input } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';

function FileInput({ name, formProps, setFormProps, handleOnChange, acceptedFiles, maxFileSize, multipleFiles,
  fileProps, setFileProps, setFieldValue, form, field, required }) {
  const { hexColor, fontColor, backgroundColor } = useStyle();
  const [dragOver, setDragOver] = useState(false);
  const { t } = useTranslation('');

  const handleChangeFile = (event) => {
    setDragOver(false);
    const fileProp = event.currentTarget.files;
    const firstFile = fileProp[0];
    const formatFileArr = acceptedFiles.replaceAll('.', '').split(',');
    if (fileProp.length > 0) {
      if (firstFile) {
        setFieldValue(name, firstFile);
      }
      Array.from(fileProp).forEach((file) => {
        const { type: fileType, name: fileName, size } = file;
        const formatExists = formatFileArr.some((l) => String(fileType).includes(l));
        const formatError = !formatExists;
        const sizeError = size > maxFileSize;
        // if (!ignoreErrors && sizeError) return;
        if (fileProps.some((item) => item.name === fileName)) return;
        if (multipleFiles) {
          setFileProps((prev) => [...prev, {
            name: fileName, type: fileType, size, file, formatError, sizeError,
          }]);
        } else {
          setFileProps([{
            name: fileName, type: fileType, size, file, formatError, sizeError, fileUrl: URL.createObjectURL(file),
          }]);
        }
      });
    }
  };

  const handleCloseFile = () => {
    setFileProps([]);
    setFieldValue(name, '');
  };
  return (
    <>
      {(fileProps.length === 0 || form.errors[name]) && (
        <Box className={`upload-wrapper ${dragOver && 'dragOver'} dashed-box${dragOver ? '-animated' : ''}`} m="10px 0" width={{ base: 'auto', md: '100%' }} height="50px" position="relative" color={dragOver ? 'blue.600' : 'blue.default'} _hover={{ color: 'blue.default' }} transition="0.3s all ease-in-out" borderRadius="12px" background="featuredColor">
          <Box width="100%" height="100%" position="absolute" display="flex" alignItems="center" cursor="pointer" borderRadius="7px" border="none" gridGap="10px" color="gray.400">
            <Box className="icon-bounce" marginLeft="15px">
              <Icon icon="upload" color={hexColor.black} width="24px" height="24px" />
            </Box>
            {`${t('common:uploadScreenshot')}${required ? '*' : ''}`}
          </Box>
          <Input
            {...field}
            birder="none"
            type="file"
            value={undefined}
            name="Upload file"
            title=""
            onChange={(e) => {
              setFormProps({ ...formProps, [name]: e.target.value });
              handleOnChange(e);
              handleChangeFile(e); // must be external
              // field.onChange(e);
            }}
            accept={acceptedFiles}
            placeholder="Upload file"
            multiple={multipleFiles ? 'multiple' : null}
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
      )}
      {fileProps.length > 0 && fileProps[0].type.includes('image') && (
        <Box width="100 %" height="100%" position="relative">
          {!form?.errors[name] && (
            <>
              <Button display="flex" background={backgroundColor} color={fontColor} variant="unstyled" opacity={0.7} _hover={{ opacity: 0.9 }} onClick={handleCloseFile} position="absolute" right={3} top={2}>
                <Icon icon="close" width="14px" height="14px" color="currentColor" />
              </Button>
              <Image src={fileProps[0].fileUrl} width="100%" height="auto" borderRadius="3px" />
            </>
          )}
        </Box>
      )}
    </>
  );
}

FileInput.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  formProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  setFormProps: PropTypes.func,
  handleOnChange: PropTypes.func,
  acceptedFiles: PropTypes.string,
  maxFileSize: PropTypes.number,
  multipleFiles: PropTypes.bool,
  fileProps: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  setFileProps: PropTypes.func,
  setFieldValue: PropTypes.func,
  form: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  field: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  required: PropTypes.bool,
};

FileInput.defaultProps = {
  type: 'text',
  name: 'firstName',
  formProps: {},
  setFormProps: () => {},
  handleOnChange: () => {},
  acceptedFiles: '*',
  maxFileSize: 1000000, // 1mb
  multipleFiles: false,
  fileProps: [],
  setFileProps: () => {},
  setFieldValue: () => {},
  required: false,
};

export default FileInput;
