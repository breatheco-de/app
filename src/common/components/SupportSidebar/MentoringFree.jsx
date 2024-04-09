/* eslint-disable react/prop-types */
import { Avatar, AvatarGroup, Box, Button, Image, Input, InputGroup, InputRightElement, useColorModeValue, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import useStyle from '../../hooks/useStyle';
import Heading from '../Heading';
import Icon from '../Icon';
import Link from '../NextChakraLink';
import Text from '../Text';
import bc from '../../services/breathecode';
import { AvatarSkeletonWrapped } from '../Skeleton';
import useOnline from '../../hooks/useOnline';
import AvatarUser from '../../../js_modules/cohortSidebar/avatarUser';

function ProfilesSection({
  profiles,
}) {
  const { usersConnected } = useOnline();

  return (
    <AvatarGroup max={4} justifyContent="center">
      {profiles?.map((c, i) => {
        const fullName = `${c.user.first_name} ${c.user.last_name}`;
        const isOnline = usersConnected?.includes(c.user.id);
        return (
          <AvatarUser
            width="48px"
            height="48px"
            index={i}
            key={`${c.id} - ${c.user.first_name}`}
            isWrapped
            fullName={fullName}
            data={c}
            isOnline={isOnline}
            badge
          />
        );
      })}
    </AvatarGroup>
  );
}

function MentoringFree({
  mentoryProps, width, setMentoryProps,
  programServices, dateFormated, servicesFiltered, searchProps,
  setSearchProps, setProgramMentors, savedChanges, setSavedChanges,
  mentorsFiltered, dateFormated2, allMentorsAvailable,
}) {
  const { t } = useTranslation('dashboard');

  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');
  const [open, setOpen] = useState(false);
  const { borderColor, lightColor, hexColor } = useStyle();
  const [existsMentors, setExistsMentors] = useState(true);
  const router = useRouter();
  const toast = useToast();
  const { slug } = router.query;

  useEffect(() => {
    if (allMentorsAvailable?.length === 0) {
      setTimeout(() => {
        setExistsMentors(false);
      }, 1500);
    }
  }, [allMentorsAvailable]);

  const manageMentorsData = (service, data) => {
    setProgramMentors(data);
    setTimeout(() => {
      setMentoryProps({ ...mentoryProps, service });
      setSavedChanges({ ...savedChanges, service });
    }, 50);
  };

  const handleService = async (service) => {
    try {
      if (allMentorsAvailable.length > 0) {
        const mentorsByService = allMentorsAvailable.filter((mentor) => mentor.services.some((s) => s.slug === service.slug));
        manageMentorsData(service, mentorsByService);
      } else {
        const res = await bc.mentorship({
          services: service.slug,
          status: 'ACTIVE',
          syllabus: slug,
          academy: service?.academy?.id,
        }).getMentor();
        manageMentorsData(service, res.data);
      }
    } catch (e) {
      toast({
        position: 'top',
        title: 'Error',
        description: t('alert-message:error-finding-mentors'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const servicesWithMentorsAvailable = servicesFiltered.filter((service) => allMentorsAvailable.some((mentor) => mentor.services.some((mentServ) => mentServ.slug === service.slug)));

  return (
    <Box
      position="relative"
      width={width}
      height="auto"
      borderWidth="0px"
      borderRadius="lg"
    >
      {open && mentoryProps?.service && (
        <Box position="absolute" top="16px" left="18px" onClick={() => setMentoryProps({})} cursor="pointer">
          <Icon icon="arrowLeft" width="25px" height="25px" color="#606060" />
        </Box>
      )}
      {open && !mentoryProps?.service && (
        <Box position="absolute" top="16px" left="18px" onClick={() => setOpen(false)} cursor="pointer">
          <Icon icon="arrowLeft" width="25px" height="25px" color="#606060" />
        </Box>
      )}
      <Box display="flex" flexDirection="column" padding="16px" alignItems="center">
        <Box d="flex" flexDirection="column" alignItems="center" justifyContent="center">
          {!mentoryProps?.service && (
            <Heading size="14px" textAlign="center" lineHeight="16.8px" justify="center" mt="0px" mb="0px">
              {t('supportSideBar.mentoring')}
              <br />
              <Link size="14px" variant="default" className="link" href={t('supportSideBar.learn-more-link')} target="_blank" rel="noopener noreferrer">
                {t('supportSideBar.learn-more')}
              </Link>
            </Heading>
          )}
          {!mentoryProps?.service && programServices.length <= 0 && (
            <Heading size="16px" textAlign="center" justify="center" mt="10px" mb="0px">
              {programServices.length > 0 ? `${programServices.length} ${t('supportSideBar.mentoring-available')}` : t('supportSideBar.no-mentoring-available')}
            </Heading>
          )}
        </Box>
        {!open && (
          <>
            <Box display="flex" flexDirection="column" margin="15px 0">
              {allMentorsAvailable.length > 0 ? (
                <ProfilesSection profiles={allMentorsAvailable} />
              ) : (
                <>
                  {existsMentors && (
                    <AvatarSkeletonWrapped quantity={4} />
                  )}
                  {!existsMentors && (
                    <Avatar
                      width="48px"
                      height="48px"
                      margin="0px auto"
                      style={{ userSelect: 'none' }}
                      src="/static/images/angry-avatar.png"
                    />
                  )}
                </>
              )}
              <Text color={lightColor} size="12px" margin="8px 0 0 0">
                {t('supportSideBar.mentors-available', { count: allMentorsAvailable.length })}
              </Text>
            </Box>
            <Button variant="link" fontSize="14px" onClick={() => setOpen(true)}>
              {t('supportSideBar.schedule-button')}
              <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
            </Button>
          </>
        )}
        {open && (
          <>
            {!mentoryProps?.time ? (
              <>
                <Box display="flex" alignItems="baseline" justifyContent="center">
                  {programServices.length > 0 ? (
                    <>
                      {!mentoryProps?.service && (
                        <Text
                          size="md"
                          textAlign="center"
                          mt="10px"
                          px="0px"
                        >
                          {t('supportSideBar.start-mentorship')}
                        </Text>
                      )}
                    </>
                  ) : ''}
                </Box>
                {mentoryProps?.service && (
                  <Box display="flex" alignItems="center" fontSize="18px" fontWeight={700} gridGap="10px" padding="0 10px" margin="10px 0 0px 0" style={{ textWrap: 'nowrap' }}>
                    <Box>
                      {t('mentorship.you-have')}
                    </Box>
                    <Box display="flex" color="white" justifyContent="center" alignItems="center" background="green.400" width="30px" height="30px" borderRadius="50%">
                      <Icon icon="infinite" width="20px" height="20px" />
                    </Box>
                    <Box textAlign="center">
                      {t('mentorship.available-sessions')}
                    </Box>
                  </Box>
                )}
                {mentoryProps?.service && (
                  <Box display="flex" alignItems="center" justifyContent="flex-start" gridGap="10px" background={commonBackground} mt="20px" px="20px" py="15px" textAlign="center" w="100%" borderTopRadius="0.375rem">
                    <Box>
                      <Icon icon="checked2" width="15px" height="15px" color={hexColor.greenLight} />
                    </Box>
                    <Box width="auto">
                      {mentoryProps.service.name}
                    </Box>
                  </Box>
                )}
                {mentoryProps?.mentor && (
                  <Box background={commonBackground} display="flex" gridGap="14px" justifyContent="center" alignItems="center" py="15px" w="100%" borderTop="1px solid" borderColor={borderColor} borderBottomRadius={!mentoryProps?.date ? '0.375rem' : '0'}>
                    <Image
                      src={mentoryProps.mentor?.user.profile?.avatar_url}
                      alt={`selected ${mentoryProps.mentor?.user?.first_name} ${mentoryProps.mentor?.user?.last_name}`}
                      width="40px"
                      height="40px"
                      objectFit="cover"
                      style={{ minWidth: '40px', width: '40px !important', height: '40px !important' }}
                      borderRadius="50%"
                    />
                    <Box>
                      <Box fontWeight="700" fontSize="15px" color={useColorModeValue('gray.900', 'white')} letterSpacing="0.05em">
                        {`${mentoryProps.mentor.user.first_name} ${mentoryProps.mentor.user.last_name}`}
                      </Box>
                      <Box fontWeight="400" fontSize="15px" letterSpacing="0.05em">
                        {`${parseInt(mentoryProps.service.duration, 10) / 60} min Mentoring Session`}
                      </Box>
                    </Box>
                  </Box>
                )}
                {mentoryProps?.date && (
                  <Box background={commonBackground} py="15px" textAlign="center" borderTop="1px solid" borderColor={borderColor} w="100%" borderBottomRadius="0.375rem">
                    {dateFormated[router.locale]}
                  </Box>
                )}

                {!mentoryProps?.service && programServices.length > 0 && (
                  <>
                    <InputGroup mt="24px">
                      <Input onChange={(e) => setSearchProps({ ...searchProps, serviceSearch: e.target.value?.toLocaleLowerCase() })} background={commonBackground} borderBottomRadius="0" border="0" placeholder={t('supportSideBar.select-type')} />
                      <InputRightElement>
                        <Icon icon="arrowDown" color="#606060" width="35px" height="30px" ml="10px" />
                      </InputRightElement>
                    </InputGroup>
                    <Box maxHeight="10rem" width="100%" overflow="auto" borderBottomRadius="0.375rem">
                      {servicesWithMentorsAvailable.length > 0 ? servicesWithMentorsAvailable.map((service) => (
                        <Box borderTop="1px solid" cursor="pointer" onClick={() => handleService(service)} borderColor={borderColor} py="14px" background={commonBackground} width="100%" px="22px" _hover={{ background: useColorModeValue('featuredLight', 'gray.700') }}>
                          {service.name}
                        </Box>
                      )) : (
                        <Box borderTop="1px solid" borderColor={borderColor} py="14px" background={commonBackground} width="100%" px="22px">
                          {t('common:search-not-found')}
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {mentoryProps?.service && !mentoryProps?.mentor
                  && (
                    <>
                      <InputGroup mt="24px" borderBottom="1px solid" borderColor={borderColor}>
                        <Input onChange={(e) => setSearchProps({ ...searchProps, mentorSearch: e.target.value?.toLowerCase() })} background={commonBackground} borderBottomRadius="0" border="0" placeholder={t('supportSideBar.search-mentor')} />
                        <InputRightElement>
                          <Icon icon="arrowDown" color="#606060" width="35px" height="30px" ml="10px" />
                        </InputRightElement>
                      </InputGroup>
                      <Box maxHeight="18rem" width="100%" background={commonBackground} overflow="auto" borderBottomRadius="0.375rem">
                        {mentorsFiltered.length > 0 ? mentorsFiltered.map((mentor, i) => (
                          <>
                            {i !== 0 && (
                              <Box as="hr" borderColor="gray.300" margin="0 18px" />
                            )}
                            <Box display="flex" gridGap="18px" flexDirection="row" py="14px" width="100%" px="18px" _hover={{ background: useColorModeValue('featuredLight', 'gray.700') }}>
                              <Image
                                src={mentor?.user.profile?.avatar_url}
                                alt={`${mentor?.user?.first_name} ${mentor?.user?.last_name}`}
                                width="78px"
                                height="78px"
                                objectFit="cover"
                                style={{ minWidth: '78px', width: '78px !important', height: '78px !important' }}
                                borderRadius="50%"
                              />
                              <Box display="flex" flexDirection="column" width="100%">
                                <Box fontSize="15px" fontWeight="600">
                                  {`${mentor.user.first_name} ${mentor.user.last_name}`}
                                </Box>
                                <Box as="hr" borderColor={borderColor} my="5px" />
                                <Box>
                                  {(mentor.one_line_bio && mentor.one_line_bio !== '') ? `${mentor.one_line_bio} ` : ''}
                                  {mentor?.booking_url ? (
                                    <Link variant="default" href={mentor?.booking_url} target="_blank" rel="noopener noreferrer">
                                      {t('supportSideBar.create-session-text', { name: mentor.user.first_name })}
                                    </Link>
                                  ) : (
                                    <Box fontSize="15px">
                                      {t('supportSideBar.no-mentor-link')}
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </>
                        )) : (
                          <Box borderTop="1px solid" borderColor={borderColor} py="14px" background={commonBackground} width="100%" px="22px">
                            {t('supportSideBar.no-mentors')}
                          </Box>
                        )}
                      </Box>
                    </>
                  )}
              </>
            ) : (
              <>
                {mentoryProps?.mentor && mentoryProps?.date && mentoryProps?.time && (
                  <Box display="flex" flexDirection="column" background={commonBackground} borderRadius="3px" mt="22px" gridGap="14px" justifyContent="center" alignItems="center" p="25px 0 25px 0" w="100%">
                    {!mentoryProps?.confirm ? (
                      <Image
                        src={mentoryProps.mentor?.user.profile?.avatar_url}
                        alt={`selected ${mentoryProps.mentor?.user?.first_name} ${mentoryProps.mentor?.user?.last_name}`}
                        width="68px"
                        height="68px"
                        objectFit="cover"
                        style={{ minWidth: '68px', width: '68px !important', height: '68px !important' }}
                        styleImg={{ borderRadius: '50px' }}
                      />
                    ) : (
                      <Icon icon="verified" width="68px" height="68px" />
                    )}
                    <Box margin="0 10px" display="flex" flexDirection="column">
                      <Box fontWeight="700" textAlign="center" fontSize="15px" color={useColorModeValue('gray.900', 'white')} letterSpacing="0.05em">
                        {`${mentoryProps.mentor.user.first_name} ${mentoryProps.mentor.user.last_name} - ${mentoryProps?.service?.name}`}
                      </Box>
                      <Box fontWeight="400" fontSize="15px" color={lightColor} textAlign="center" letterSpacing="0.05em">
                        {dateFormated2[router.locale]}
                      </Box>
                      <Box fontWeight="400" fontSize="15px" color={lightColor} textAlign="center" letterSpacing="0.05em">
                        {`${mentoryProps.time} hs.`}
                      </Box>

                      {!mentoryProps?.confirm && (
                        <Button variant="default" onClick={() => setMentoryProps({ ...mentoryProps, confirm: true })} textTransform="uppercase" margin="15px auto 10px auto">
                          Confirm
                        </Button>
                      )}
                      {mentoryProps?.confirm && (
                        <Button variant="default" onClick={() => setOpen(false)} textTransform="uppercase" margin="15px auto 10px auto">
                          Done
                        </Button>
                      )}
                      {!mentoryProps?.confirm && (
                        <Box onClick={() => setMentoryProps({ ...mentoryProps, time: null })} className="link" width="fit-content" margin="0 auto">
                          Go back
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </>
        )}

      </Box>
    </Box>
  );
}

MentoringFree.propTypes = {
  mentoryProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])),
  width: PropTypes.string,
  setMentoryProps: PropTypes.func.isRequired,
  programServices: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])),
  dateFormated: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  servicesFiltered: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  searchProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  setSearchProps: PropTypes.func.isRequired,
  savedChanges: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  setSavedChanges: PropTypes.func.isRequired,
  setProgramMentors: PropTypes.func,
  mentorsFiltered: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  dateFormated2: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  allMentorsAvailable: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
};

MentoringFree.defaultProps = {
  mentoryProps: [],
  width: '100%',
  programServices: [],
  setProgramMentors: () => {},
};

export default MentoringFree;
