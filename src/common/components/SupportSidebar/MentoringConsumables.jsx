/* eslint-disable react/prop-types */
import { Avatar, AvatarGroup, Box, Button, Input, InputGroup, InputRightElement, useColorModeValue, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useState } from 'react';
import useStyle from '../../hooks/useStyle';
import Heading from '../Heading';
import Icon from '../Icon';
import Image from '../Image';
import ModalToGetAccess, { stageType } from '../ModalToGetAccess';
import Link from '../NextChakraLink';
import bc from '../../services/breathecode';
import useOnline from '../../hooks/useOnline';
import AvatarUser from '../../../js_modules/cohortSidebar/avatarUser';
import Text from '../Text';
import { AvatarSkeletonWrapped } from '../Skeleton';
import modifyEnv from '../../../../modifyEnv';
import { usePersistent } from '../../hooks/usePersistent';
import { validatePlanExistence } from '../../handlers/subscriptions';
import { isDevMode } from '../../../utils';
import { reportDatalayer } from '../../../utils/requests';

function NoConsumablesCard({ t, setMentoryProps, handleGetMoreMentorships, mentoryProps, subscriptionData, disableBackButton = false, ...rest }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" {...rest}>
      <Heading size="14px" textAlign="center" lineHeight="16.8px" justify="center" mt="0px" mb="0px">
        {t('mentorship.no-mentorship')}
        <br />
        <Link size="14px" variant="default" className="link" href={t('supportSideBar.learn-more-link')} target="_blank" rel="noopener noreferrer">
          {t('supportSideBar.learn-more')}
        </Link>
      </Heading>
      <Avatar
        width="55px"
        height="55px"
        margin="16px 0"
        style={{ userSelect: 'none' }}
        src="/static/images/angry-avatar.png"
      />
      <Button
        display="flex"
        variant="default"
        fontSize="14px"
        isLoading={rest.isLoading}
        fontWeight={700}
        onClick={() => handleGetMoreMentorships()}
        alignItems="center"
        gridGap="10px"
      >
        {t('supportSideBar.get-more-mentorships')}
        <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
      </Button>

      {!disableBackButton && (
      <Button variant="link" fontSize="14px" onClick={() => setMentoryProps({})} letterSpacing="0.05em">
        {t('common:go-back')}
      </Button>
      )}
    </Box>
  );
}

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

function MentoringConsumables({
  mentoryProps, width, consumables, mentorshipService, setMentoryProps,
  programServices, dateFormated, servicesFiltered, searchProps,
  setSearchProps, setProgramMentors, savedChanges, setSavedChanges,
  mentorsFiltered, dateFormated2, allMentorsAvailable, subscriptionData, allSubscriptions,
}) {
  const { t } = useTranslation('dashboard');

  const [cohortSession] = usePersistent('cohortSession', {});
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');
  const [open, setOpen] = useState(false);
  const [existsMentors, setExistsMentors] = useState(true);
  const { borderColor, lightColor, hexColor } = useStyle();
  const [isModalToGetAccessOpen, setIsModalToGetAccessOpen] = useState(false);
  const [isFetchingDataForModal, setIsFetchingDataForModal] = useState(false);
  const [dataToGetAccessModal, setDataToGetAccessModal] = useState({});
  const [consumableOfService, setConsumableOfService] = useState({});
  const router = useRouter();
  const toast = useToast();
  const { slug } = router.query;

  const mentorshipBalance = mentorshipService?.balance?.unit || mentorshipService?.balance || consumableOfService?.balance?.unit;
  const currentBalance = Number(mentorshipBalance && mentorshipBalance);

  const calculateExistenceOfConsumable = () => {
    if (consumableOfService.available_as_saas === false) return true;
    if (consumableOfService?.balance) return consumableOfService?.balance?.unit > 0 || consumableOfService?.balance?.unit === -1;
    return consumables?.mentorship_service_sets?.length > 0 && Object.values(mentorshipService).length > 0 && (currentBalance > 0 || currentBalance === -1);
  };
  const existConsumablesOnCurrentService = calculateExistenceOfConsumable();

  useEffect(() => {
    if (allMentorsAvailable?.length === 0) {
      setTimeout(() => {
        setExistsMentors(false);
      }, 1500);
    }
  }, [allMentorsAvailable]);

  const manageMentorsData = (service, data) => {
    reportDatalayer({
      dataLayer: {
        event: 'select_mentorship_service',
        path: router.pathname,
        consumables_amount: currentBalance,
        mentorship_service: service?.slug,
      },
    });
    const relatedConsumables = consumables.find((consumable) => consumable?.mentorship_services?.some((c) => c?.slug === service?.slug));
    setProgramMentors(data);
    setConsumableOfService({
      ...relatedConsumables,
      balance: {
        unit: service?.academy?.available_as_saas === false ? -1 : relatedConsumables?.balance?.unit,
      },
      available_as_saas: service?.academy?.available_as_saas,
    });
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

  const handleGetMoreMentorships = () => {
    setIsFetchingDataForModal(true);
    const academyService = mentoryProps?.service?.slug
      ? mentoryProps?.service
      : subscriptionData?.selected_mentorship_service_set?.mentorship_services?.[0];

    validatePlanExistence(allSubscriptions).then((data) => {
      setDataToGetAccessModal({
        ...data,
        event: '',
        academyService,
      });
      setIsModalToGetAccessOpen(true);
    })
      .finally(() => setIsFetchingDataForModal(false));
  };
  const reportBookMentor = () => {
    reportDatalayer({
      dataLayer: {
        event: 'book_mentorship_session',
        path: router.pathname,
        consumables_amount: currentBalance,
        mentorship_service: mentoryProps?.service?.slug,
        mentor_name: `${mentoryProps.mentor.user.first_name} ${mentoryProps.mentor.user.last_name}`,
        mentor_id: mentoryProps.mentor.slug,
        mentor_booking_url: mentoryProps.mentor.booking_url,
      },
    });
  };

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
      <Box display="flex" flexDirection="column" p="4" pt="20px" alignItems="center">
        <Box d="flex" flexDirection="column" alignItems="center" justifyContent="center">
          {!mentoryProps?.service && (consumables?.mentorship_service_sets?.length !== 0 || currentBalance !== 0) && (
            <>
              <Heading size="14px" textAlign="center" lineHeight="16.8px" justify="center" mt="0px" mb="0px">
                {t('supportSideBar.mentoring')}
                <br />
                <Link size="14px" variant="default" className="link" href={t('supportSideBar.learn-more-link')} target="_blank" rel="noopener noreferrer">
                  {t('supportSideBar.learn-more')}
                </Link>
              </Heading>
              {!mentoryProps?.service && programServices.length <= 0 && (
                <Heading size="16px" textAlign="center" justify="center" mt="10px" mb="0px">
                  {programServices.length > 0 ? `${programServices.length} ${t('supportSideBar.mentoring-available')}` : t('supportSideBar.no-mentoring-available')}
                </Heading>
              )}
            </>
          )}
        </Box>
        {!open && (
          <>
            <Box margin="15px 0" display="flex" flexDirection="column">
              {allMentorsAvailable.length > 0 ? (
                <ProfilesSection profiles={allMentorsAvailable} />
              ) : (
                <>
                  {existsMentors && (
                    <AvatarSkeletonWrapped quantity={4} />
                  )}
                  {!existsMentors && allMentorsAvailable.length === 0 && (
                    <Avatar
                      width="48px"
                      height="48px"
                      margin="0 auto"
                      style={{ userSelect: 'none' }}
                      src="/static/images/angry-avatar.png"
                    />
                  )}
                </>
              )}
              <Text color={lightColor} size="12px" margin="8px 0 0 0">
                {t('supportSideBar.mentors-available', { count: 3 })}
              </Text>
            </Box>
            {/* Schedule event */}
            <Button
              variant="link"
              fontSize="14px"
              onClick={() => {
                setOpen(true);
                reportDatalayer({
                  dataLayer: {
                    event: 'begin_mentorship_session_schedule',
                    path: router.pathname,
                    consumables_amount: currentBalance,
                  },
                });
              }}
            >
              {t('supportSideBar.schedule-button')}
              <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
            </Button>
          </>
        )}

        {isDevMode && open && mentoryProps?.service && !mentoryProps?.mentor && existConsumablesOnCurrentService && (
          <Box display="flex" alignItems="center" fontSize="18px" fontWeight={700} gridGap="10px" padding="0 10px" margin="10px 0 0px 0" style={{ textWrap: 'nowrap' }}>
            <Box>
              {t('mentorship.you-have')}
            </Box>
            <Box display="flex" color="white" justifyContent="center" alignItems="center" background="green.400" width="30px" height="30px" borderRadius="50%">
              {currentBalance > 0 ? currentBalance : ''}
              {currentBalance === -1 ? (
                <Icon icon="infinite" width="20px" height="20px" />
              ) : ''}
            </Box>
            <Box textAlign="center">
              {t('mentorship.available-sessions')}
            </Box>
          </Box>
        )}
        {mentoryProps?.service && open && !mentoryProps?.mentor && !existConsumablesOnCurrentService ? (
          <NoConsumablesCard t={t} isLoading={isFetchingDataForModal} mentoryProps={mentoryProps} handleGetMoreMentorships={handleGetMoreMentorships} subscriptionData={subscriptionData} setMentoryProps={setMentoryProps} mt="30px" />
        ) : open && (
          <>
            {!mentoryProps?.time ? (
              <>
                {mentoryProps?.service && (
                  <Box display="flex" alignItems="center" justifyContent="flex-start" gridGap="10px" background={commonBackground} mt={currentBalance > 0 ? '22px' : '34px'} px="20px" py="15px" textAlign="center" w="100%" borderTopRadius="0.375rem">
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
                      width={40}
                      height={40}
                      objectFit="cover"
                      style={{ minWidth: '40px', width: '40px !important', height: '40px !important' }}
                      styleImg={{ borderRadius: '50px' }}
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
                        <Box key={service.name} borderTop="1px solid" cursor="pointer" onClick={() => handleService(service)} borderColor={borderColor} py="14px" background={commonBackground} width="100%" px="22px" _hover={{ background: useColorModeValue('featuredLight', 'gray.700') }}>
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
                          <Fragment key={mentor?.user?.id}>
                            {i !== 0 && (
                              <Box as="hr" borderColor="gray.300" margin="0 18px" />
                            )}
                            <Box display="flex" gridGap="18px" flexDirection="row" py="14px" width="100%" px="18px" _hover={{ background: useColorModeValue('featuredLight', 'gray.700') }}>
                              {/* onClick={() => { setMentoryProps({ ...mentoryProps, mentor }); setSavedChanges({ ...savedChanges, mentor }); }} */}
                              <Image
                                src={mentor?.user.profile?.avatar_url}
                                alt={`${mentor?.user?.first_name} ${mentor?.user?.last_name}`}
                                width={78}
                                height={78}
                                objectFit="cover"
                                style={{ minWidth: '78px', width: '78px !important', height: '78px !important' }}
                                styleImg={{ borderRadius: '50px' }}
                              />
                              <Box display="flex" flexDirection="column" width="100%">
                                <Box fontSize="15px" fontWeight="600">
                                  {`${mentor.user.first_name} ${mentor.user.last_name}`}
                                </Box>
                                <Box as="hr" borderColor={borderColor} my="5px" />
                                <Box>
                                  {(mentor.one_line_bio && mentor.one_line_bio !== '') ? `${mentor.one_line_bio} ` : ''}
                                  {mentor?.booking_url ? (
                                    <Link
                                      variant="default"
                                      onClick={() => reportBookMentor()}
                                      href={`${BREATHECODE_HOST}/mentor/${mentor?.slug}?utm_campaign=${mentoryProps?.service?.slug}&utm_source=4geeks&salesforce_uuid=${cohortSession?.bc_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
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
                          </Fragment>
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

      <ModalToGetAccess
        isOpen={isModalToGetAccessOpen}
        stage={stageType.outOfConsumables}
        externalData={dataToGetAccessModal}
        onClose={() => {
          setIsModalToGetAccessOpen(false);
        }}
      />
    </Box>
  );
}

MentoringConsumables.propTypes = {
  mentoryProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])),
  width: PropTypes.string,
  consumables: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  mentorshipService: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  setMentoryProps: PropTypes.func.isRequired,
  programServices: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])),
  dateFormated: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  servicesFiltered: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  searchProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  setSearchProps: PropTypes.func.isRequired,
  savedChanges: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  setSavedChanges: PropTypes.func.isRequired,
  setProgramMentors: PropTypes.func,
  mentorsFiltered: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  dateFormated2: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  subscriptionData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  allSubscriptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

MentoringConsumables.defaultProps = {
  mentoryProps: [],
  width: '100%',
  consumables: {},
  mentorshipService: {},
  programServices: [],
  setProgramMentors: () => {},
  subscriptionData: {},
  allSubscriptions: [],
};

export default MentoringConsumables;
