import {
  Avatar, Box, Button, Input, Link, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger,
  Tab, TabList, TabPanel, TabPanels, Tabs, Tooltip, useColorModeValue, useToast, Slider,
  SliderTrack, SliderFilledTrack, SliderThumb, useMediaQuery,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import {
  memo, useCallback, useEffect, useState,
} from 'react';
import { formatRelative } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/router';
import Cropper from 'react-easy-crop';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import useAuth from '../../common/hooks/useAuth';
import asPrivate from '../../common/context/PrivateRouteWrapper';
import { usePersistent } from '../../common/hooks/usePersistent';
import ProfileForm from '../../common/components/profileForm';
import bc from '../../common/services/breathecode';
import Icon from '../../common/components/Icon';
import { cleanQueryStrings } from '../../utils';
import ShareButton from '../../common/components/ShareButton';
import AlertMessage from '../../common/components/AlertMessage';
import getCroppedImg from '../../utils/cropImage';

const Profile = () => {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const { user, updateProfilePicture } = useAuth();
  const router = useRouter();
  const { locale, asPath } = router;
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [profile, setProfile] = usePersistent('profile', {});
  const [certificates, setCertificates] = useState([]);
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const tabListMenu = t('tabList', {}, { returnObjects: true });
  const borderColor = useColorModeValue('white', 'darkTheme');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  // const [croppedImage, setCroppedImage] = useState(null);
  const [images, setImages] = useState([]); // file images
  const [imageUrls, setImageUrls] = useState([]); // preview of the image

  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const fileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  const tabPosition = {
    '/profile/info': 0,
    '/profile/info#': 0,
    '/profile/certificates': 1,
    '/profile/certificates#': 1,
  };
  const currentPathCleaned = cleanQueryStrings(asPath);

  const handleFileUpload = (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    // Validate file is of type Image
    if (file && !fileTypes.includes(file.type)) {
      toast({
        title: t('alert-message:file-type-error', { type: file.type.split('/')[1] }),
        status: 'warning',
        duration: 3000,
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
      // setCroppedImage(croppedImg.imgURI); // preview of the image

      const filename = images[0].name;
      // const imgType = images[0].type;

      const imgFile = new File([croppedImg.blob], filename, {
        type: 'image/png',
        lastModified: Date.now(),
        lastModifiedDate: new Date(),
      });

      const formdata = new FormData();
      formdata.append('file', imgFile);
      // formdata.append('name', filename);
      // formdata.append('upload_preset', 'breathecode');

      // console.log('_START_:Image uploaded before prepare:', images[0]);
      // console.log('_PREVIEW_:cropedImg for preview:', croppedImg);
      // console.log('_FINAL_:Prepared and edited image for endpoint:', imgFile);

      // NOTE: Endpoint updates the image on the second try
      bc.auth().updatePicture(formdata)
        .then((res) => {
          if (res.data) {
            bc.auth().updatePicture(formdata).then((res2) => {
              setIsLoading(false);
              updateProfilePicture({
                ...user,
                profile: {
                  ...user.profile,
                  avatar_url: res2.data.avatar_url,
                },
              });
              setShowModal(false);
              toast({
                title: t('alert-message:submitting-picture-success'),
                status: 'success',
                duration: 5000,
              });
            });
          }
        })
        .catch(() => {
          setIsLoading(false);
          toast({
            title: t('alert-message:error-submitting-picture'),
            status: 'error',
            duration: 5000,
          });
        });
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels]);

  useEffect(() => {
    setCurrentTabIndex(tabPosition[currentPathCleaned]);
  }, [currentPathCleaned]);

  useEffect(() => {
    bc.certificate().get()
      .then(({ data }) => {
        setCertificates(data);
      })
      .catch(() => {
        toast({
          title: t('alert-message:something-went-wrong-with', { property: 'Certificates' }),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  }, []);

  useEffect(() => {
    if (images.length < 1) return;
    const newImageUrls = [];

    images?.map((image) => newImageUrls.push(URL.createObjectURL(image)));
    setImageUrls(newImageUrls);
  }, [images]);

  useEffect(() => {
    if (user) {
      setProfile({
        ...profile,
        ...user,
      });
    }
  }, [user]);

  return (
    <>
      {user && !user.github && (
        <AlertMessage
          full
          type="warning"
          message={t('common:github-warning')}
          style={{ borderRadius: '0px', justifyContent: 'center' }}
        />
      )}
      <Box margin={{ base: '3% 4% 0px', md: '3% 10% 0px' }} minH="65vh">
        <Heading as="h1" size="m" margin="45px 0">{t('navbar:my-profile')}</Heading>
        <Tabs index={currentTabIndex} display="flex" flexDirection={{ base: 'column', md: 'row' }} variant="unstyled" gridGap="40px">
          <TabList display="flex" flexDirection={{ base: 'row', md: 'column' }} width={{ base: '100%', md: '300px' }}>
            {tabListMenu.filter((l) => l.disabled !== true).map((tab) => (
              <Tab
                key={tab.title}
                p="14px"
                display="block"
                onClick={() => router.push(`/profile/${tab.value}`, undefined, { shallow: true })}
                textAlign={{ base: 'center', md: 'start' }}
                isDisabled={tab.disabled}
                textTransform="uppercase"
                fontWeight="900"
                fontSize="13px"
                letterSpacing="0.05em"
                width={{ base: '100%', md: 'auto' }}
              // height="100%"
                _selected={{
                  color: 'blue.default',
                  borderLeft: { base: 'none', md: '4px solid' },
                  borderBottom: { base: '4px solid', md: 'none' },
                  borderColor: 'blue.default',
                }}
                _hover={{
                  color: 'blue.default',
                }}
                _disabled={{
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                {tab.title}
              </Tab>
            ))}
          </TabList>
          <TabPanels p="0">
            <TabPanel p="0">
              <Text fontSize="15px" fontWeight="700" pb="18px">
                {t('basic-profile-info')}
              </Text>
              <Box display="flex" flexDirection={{ base: 'column', lg: 'row' }} alignItems={{ base: 'center', lg: 'start' }} gridGap="38px" width="100%" height="auto" borderRadius="17px" border="1px solid" borderColor={commonBorderColor} p="30px">
                <Avatar
                  // name={user?.first_name}
                  width="140px"
                  margin="0"
                  height="140px"
                  src={profile?.profile?.avatar_url || profile?.github?.avatar_url || ''}
                >
                  <Popover trigger="hover" width="fit-content" placement="bottom-start">
                    <PopoverTrigger>
                      <Box position="absolute" onClick={() => setShowModal(true)} display="flex" right="-5px" bottom="-2px" p="6px" background="blue.default" border="0.2em solid" borderColor={borderColor} borderRadius="full" cursor="pointer">
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
                            {/* Focus butotn not changes to center position */}
                            <Box position="absolute" onClick={() => setCrop({ x: 0, y: 0 })} zIndex={99} bottom="15px" left="15px" background="gray.200" borderRadius="50px" p="10px" cursor="pointer">
                              <Icon icon="focus" color="#0097CD" width="25px" height="25px" />
                            </Box>
                            <Box width={{ base: 'auto', md: '33rem' }} height={{ base: '300px', md: '26rem' }} position="relative">
                              <Cropper
                                restrictPosition={false}
                                image={imageUrls[0]}
                                crop={crop}
                                zoom={zoom}
                                // onCropComplete={onCropComplete}
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
                                // showGrid={false}
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
                              isLoading={isLoading}
                              loadingText={t('common:uploading')}
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
                <ProfileForm profile={profile} />
              </Box>
            </TabPanel>
            <TabPanel p="0" display="flex" flexDirection="column" gridGap="18px">
              <Text fontSize="15px" fontWeight="700" pb="6px">
                {t('my-certificates')}
              </Text>
              {certificates && certificates?.map((l, i) => {
                const index = `${i} - ${l.created_at} - ${l.specialty.name}`;
                const createdAt = l.specialty.created_at;
                const dateCreated = {
                  es: formatRelative(new Date(createdAt), new Date(), { locale: es }),
                  en: formatRelative(new Date(createdAt), new Date()),
                };
                const certfToken = l?.preview_url && l.preview_url?.split('/')?.pop();
                const certfLink = certfToken ? `https://certificate.4geeks.com/${certfToken}` : '#';
                const profession = l.specialty.name;
                const socials = t('share-certificate.socials', { certfLink, profession }, { returnObjects: true });

                return (
                  <Box key={index} display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" gridGap="26px" border="1px solid" borderColor={commonBorderColor} p="23px 28px" borderRadius="18px">
                    <Box display="flex" gridGap="26px">
                      <Box padding="13.5px 10.5px" height="fit-content" backgroundColor="blue.light" borderRadius="35px">
                        <Icon icon="certificate" width="24px" height="24px" style={{ marginBottom: '-8px' }} />
                      </Box>
                      <Box display="flex" flexDirection="column">
                        <Text size="l" fontWeight="400">
                          {dateCreated[locale]}
                        </Text>
                        <Text size="l" fontWeight="700">
                          {l.specialty.name}
                        </Text>
                      </Box>
                    </Box>
                    <Box display="flex" flexDirection="row" gridGap="18px">
                      <Tooltip placement="top" isDisabled={certfToken !== null} label={t('certificate-preview-not-available')}>
                        <Link href={certfLink} variant="buttonDefault" outline colorScheme="blue.default" disabled={!certfToken} textTransform="uppercase" target={certfToken ? '_blank' : '_self'} rel="noopener noreferrer" fontSize="13px">
                          {t('view-certificate')}
                        </Link>
                      </Tooltip>
                      <ShareButton withParty title={t('share-certificate.title')} shareText={t('share-certificate.shareText')} link={certfLink} socials={socials} />
                    </Box>
                  </Box>
                );
              })}
              {certificates.length === 0 && (
              <Text fontSize="15px" fontWeight="400" pb="6px">
                {t('no-certificates')}
              </Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
};

export default asPrivate(memo(Profile));
