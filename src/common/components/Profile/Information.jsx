import { Avatar, Box, Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Slider, SliderFilledTrack, SliderThumb, SliderTrack, useMediaQuery } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import ProfileForm from '../ProfileForm';
import Text from '../Text';
import useAuth from '../../hooks/useAuth';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import { location } from '../../../utils';
import getCroppedImg from '../../../utils/cropImage';
import Icon from '../Icon';
import useUploadFileInChunks from '../../hooks/useUploadFileInChunks';
import useCustomToast from '../../hooks/useCustomToast';

function Information() {
  const { t } = useTranslation('profile');
  const { user, updateProfile } = useAuth();
  const { createToast } = useCustomToast({ toastId: 'information-picture-submitting' });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const fileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  const { backgroundColor, borderColor2 } = useStyle();
  const { uploadFileInChunks, isSplitting, isUploadingChunks, isFinalizing } = useUploadFileInChunks();

  const handleFileUpload = (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    // Validar que el archivo sea de tipo imagen
    if (file && !fileTypes.includes(file.type)) {
      createToast({
        position: 'top',
        title: t('alert-message:file-type-error', { type: file.type.split('/')[1] }),
        status: 'warning',
        duration: 5000,
      });
    }
    return setImages([...e.target.files]);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixel) => {
    setCroppedAreaPixels(croppedAreaPixel);
  }, []);

  const submitImage = useCallback(async () => {
    setIsLoading(true);
    try {
      const croppedImg = await getCroppedImg(
        imageUrls[0],
        croppedAreaPixels,
      );

      const filename = images[0].name;

      const imgFile = new File([croppedImg.blob], filename, {
        type: 'image/png',
        lastModified: Date.now(),
        lastModifiedDate: new Date(),
      });

      const meta = {
        slug: 'profile-picture',
        name: filename,
        categories: [],
        academy: null,
      };

      const currentAvatarUrl = user?.profile?.avatar_url;
      const result = await uploadFileInChunks(imgFile, 'profile-picture', meta);

      if (result) {
        const checkImageUpdate = async (retries, delay) => {
          if (retries <= 0) return;
          setTimeout(async () => {
            const { data } = await bc.auth().me();
            const requestAvatarURL = data?.profile?.avatar_url;
            if (currentAvatarUrl !== requestAvatarURL) {
              updateProfile({
                ...user,
                profile: {
                  ...user.profile,
                  avatar_url: `${requestAvatarURL}`,
                },
              });
              setShowModal(false);
              setIsLoading(false);
            } else {
              checkImageUpdate(retries - 1, delay);
            }
          }, delay);
        };

        checkImageUpdate(20, 1000);
      } else {
        throw new Error('Error uploading profile picture');
      }
      createToast({
        position: 'top',
        title: t('alert-message:submitting-picture-success'),
        status: 'success',
        duration: 5000,
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      createToast({
        position: 'top',
        title: t('alert-message:error-submitting-picture'),
        status: 'error',
        duration: 5000,
      });
    }
  }, [croppedAreaPixels]);

  useEffect(() => {
    if (images.length < 1) return;
    const newImageUrls = [];

    images?.map((image) => newImageUrls.push(URL.createObjectURL(image)));
    setImageUrls(newImageUrls);
  }, [images]);

  const getButtonText = () => {
    if (isSplitting) return t('splitting-file');
    if (isUploadingChunks) return t('uploading-chunks');
    if (isFinalizing) return t('finalizing-upload');
    return t('ready-upload');
  };

  return (
    <>
      {location?.pathname?.includes('info') && (
        <Head>
          <title>{t('seo.title')}</title>
        </Head>
      )}
      <Text fontSize="15px" fontWeight="700" pb="18px">
        {t('basic-profile-info')}
      </Text>
      <Box display="flex" flexDirection={{ base: 'column', lg: 'row' }} alignItems={{ base: 'center', lg: 'start' }} gridGap="38px" width="100%" height="auto" borderRadius="17px" border="1px solid" borderColor={borderColor2} p="30px">
        <Avatar
          width="140px"
          margin="0"
          height="140px"
          src={user?.profile?.avatar_url || user?.github?.avatar_url || ''}
        >
          <Popover trigger="hover" width="fit-content" placement="bottom-start">
            <PopoverTrigger>
              <Box position="absolute" onClick={() => setShowModal(true)} display="flex" right="-5px" bottom="-2px" p="6px" background="blue.default" border="0.2em solid" borderColor={backgroundColor} borderRadius="full" cursor="pointer">
                <Icon icon="pencilFull" color="#fff" width="15px" height="15px" />
              </Box>
            </PopoverTrigger>
            <PopoverContent width="fit-content" border="1px solid" borderColor="blue.default">
              <PopoverArrow className="arrow-blue-color" border="1px solid" background="blue.light" borderColor="blue.default" zIndex={9} />
              <PopoverBody className="popover-bgColor" fontSize="12px" textTransform="none" borderRadius="5px" background="blue.light" color="blue.default">
                {t('update-profile-image.tooltip-label')}
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Modal isOpen={showModal} size="xl" onClose={() => setShowModal(false)} isCentered={!!isBelowTablet}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>{t('update-profile-image.title')}</ModalHeader>
              <ModalCloseButton />
              <ModalBody display="flex" flexDirection="column" gridGap="15px" pt="0" pb="1.5rem">
                {!images.length > 0 && (
                  <Box className={`upload-wrapper ${dragOver && 'dragOver'}`} width={{ base: 'auto', md: '33rem' }} height={{ base: '300px', md: '26rem' }} position="relative" color={dragOver ? 'blue.600' : 'blue.default'} _hover={{ color: 'blue.default' }} transition="0.3s all ease-in-out" borderRadius="12px">
                    <Box width="100%" height="100%" position="absolute" display="flex" justifyContent="center" alignItems="center" border="1px dashed currentColor" cursor="pointer" borderWidth="4px" borderRadius="12px">
                      <Box className="icon-bounce">
                        <Icon icon="uploadImage" color="currentColor" width="220px" height="220px" />
                      </Box>
                    </Box>
                    <Input type="file" name="file" title="" onChange={handleFileUpload} accept="image/x-png,image/jpg,image/jpeg" placeholder="Upload profile image" position="absolute" width="100%" height="100%" cursor="pointer" opacity="0" padding="0" onDragOver={() => setDragOver(true)} onDragLeave={() => setDragOver(false)} />
                  </Box>
                )}
                {images.length > 0 && (
                  <Box position="relative" width="100%" height="100%">
                    <Box position="absolute" onClick={() => { setImages([]); setDragOver(false); }} zIndex={99} top="15px" left="15px" background="gray.200" borderRadius="50px" p="10px" cursor="pointer">
                      <Icon icon="arrowLeft2" width="25px" height="25px" />
                    </Box>
                    {/* Focus button not changes to center position */}
                    <Box position="absolute" onClick={() => setCrop({ x: 0, y: 0 })} zIndex={99} bottom="15px" left="15px" background="gray.200" borderRadius="50px" p="10px" cursor="pointer">
                      <Icon icon="focus" color="#0097CD" width="25px" height="25px" />
                    </Box>
                    <Box width={{ base: 'auto', md: '33rem' }} height={{ base: '300px', md: '26rem' }} position="relative" background="white">
                      <Cropper
                        restrictPosition={false}
                        image={imageUrls[0]}
                        crop={crop}
                        zoom={zoom}
                        onCropAreaChange={onCropComplete}
                        style={{
                          containerStyle: {
                            borderRadius: '12px',
                          },
                        }}
                        aspect={1}
                        cropShape="round"
                        cropSize={{
                          width: isBelowTablet ? 250 : 380,
                          height: isBelowTablet ? 250 : 380,
                        }}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                      />
                    </Box>
                  </Box>
                )}
                {images.length > 0 && (
                  <>
                    <Slider aria-label="slider-zoom" onChange={(value) => setZoom(value)} step={0.01} value={zoom} min={0.85} max={3}>
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb style={{ border: '1px solid #0097CD' }} />
                    </Slider>
                    <Button
                      isLoading={isLoading || isSplitting || isUploadingChunks || isFinalizing}
                      loadingText={getButtonText()}
                      spinnerPlacement="end"
                      variant="default"
                      onClick={submitImage}
                    >
                      {t('update-profile-image.submit-button')}
                    </Button>
                  </>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </Avatar>
        <ProfileForm />
      </Box>
    </>
  );
}

export default Information;
