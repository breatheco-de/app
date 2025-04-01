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
import useAuth from '../../hooks/useAuth';
import useOnline from '../../hooks/useOnline';
import AvatarUser from '../../../js_modules/cohortSidebar/avatarUser';
import Text from '../Text';
import { AvatarSkeletonWrapped, CardSkeleton } from '../Skeleton';
import { validatePlanExistence } from '../../handlers/subscriptions';
import { getStorageItem, getBrowserInfo } from '../../../utils';
import { reportDatalayer } from '../../../utils/requests';
import { BREATHECODE_HOST } from '../../../utils/variables';
import CanAccess from '../CanAccess';
import useCanAccess from '../../hooks/useCanAccess';

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
  profiles, size,
}) {
  const { usersConnected } = useOnline();

  return (
    <AvatarGroup max={4} justifyContent="center">
      {profiles?.map((c, i) => {
        if (!c) return null;
        const fullName = `${c.user.first_name} ${c.user.last_name}`;
        const isOnline = usersConnected?.includes(c.user.id);
        return (
          <AvatarUser
            width={size || '48px'}
            height={size || '48px'}
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
  mentoryProps, width, consumables, cohortSessionIsSaaS, setMentoryProps,
  programServices, servicesFiltered, searchProps, setSearchProps, setProgramMentors,
  mentorsFiltered, allMentorsAvailable, subscriptionData, allSubscriptions,
  queryService, queryMentor, titleSize,
}) {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');
  const [open, setOpen] = useState(false);
  const accessToken = getStorageItem('accessToken');
  const [existsMentors, setExistsMentors] = useState(true);
  const { borderColor, lightColor, hexColor } = useStyle();
  const [isModalToGetAccessOpen, setIsModalToGetAccessOpen] = useState(false);
  const [isFetchingDataForModal, setIsFetchingDataForModal] = useState(false);
  const [dataToGetAccessModal, setDataToGetAccessModal] = useState({});
  const [consumableOfService, setConsumableOfService] = useState({});
  const [servicesWithMentorsAvailable, setServicesWithMentorsAvailable] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [hasReset, setHasReset] = useState(false);
  const [notifyError, setNotifyError] = useState(true);
  const [shouldHandleService, setShouldHandleService] = useState(true);
  const router = useRouter();
  const { slug } = router.query;
  const toast = useToast();
  const mentorshipBalance = consumableOfService?.balance?.unit;
  const currentBalance = Number(mentorshipBalance && mentorshipBalance);
  const checkAccess = useCanAccess();

  const calculateExistenceOfConsumable = () => {
    if (consumableOfService.available_as_saas === false) return true;
    if (consumableOfService?.balance) return consumableOfService?.balance?.unit > 0 || consumableOfService?.balance?.unit === -1;
    return consumables?.mentorship_service_sets?.length > 0 && (currentBalance > 0 || currentBalance === -1);
  };
  const existConsumablesOnCurrentService = calculateExistenceOfConsumable();

  const getMostRecentPaidAt = (invoices) => invoices.reduce((latest, invoice) => {
    const paidAtDate = new Date(invoice.paid_at);
    return paidAtDate > latest ? paidAtDate : latest;
  }, new Date(0));

  const sortByMostRecentInvoice = (a, b) => {
    const latestA = getMostRecentPaidAt(a.invoices);
    const latestB = getMostRecentPaidAt(b.invoices);
    return latestB - latestA;
  };

  const currentServiceSubscription = Array.isArray(allSubscriptions) && allSubscriptions.sort(sortByMostRecentInvoice).find((subscription) => subscription.selected_mentorship_service_set?.mentorship_services?.some((service) => service.slug === mentoryProps?.service?.slug));
  const currentSubscription = currentServiceSubscription || allSubscriptions?.[0];

  useEffect(() => {
    if (allMentorsAvailable?.length === 0) {
      setTimeout(() => {
        setExistsMentors(false);
      }, 1500);
    }
  }, [allMentorsAvailable]);

  const manageMentorsData = (service, mentors) => {
    reportDatalayer({
      dataLayer: {
        event: 'select_mentorship_service',
        path: router.pathname,
        consumables_amount: currentBalance,
        mentorship_service: service?.slug,
        agent: getBrowserInfo(),
      },
    });
    const relatedConsumable = consumables.find((consumable) => consumable?.mentorship_services?.some((c) => c?.slug === service?.slug));
    setProgramMentors(mentors);
    setConsumableOfService({
      ...relatedConsumable,
      balance: {
        unit: (service?.academy?.available_as_saas === false || cohortSessionIsSaaS === false) ? -1 : relatedConsumable?.balance?.unit,
      },
      available_as_saas: service?.academy?.available_as_saas,
    });

    setTimeout(() => {
      setMentoryProps({ ...mentoryProps, service });
    }, 50);
  };

  const handleService = async (service) => {
    // Check if service is blocked using the checkAccess function
    const serviceAccess = checkAccess({
      fromMentorshipService: service.slug,
      fromAcademy: service?.academy?.slug,
    });

    if (!serviceAccess.hasAccess) {
      toast({
        position: 'top',
        title: t('common:service-blocked'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

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

  useEffect(() => {
    const getAllServicesWithMentors = () => servicesFiltered.filter((service) => allMentorsAvailable.some((ment) => ment.services.some((mentServ) => mentServ.slug === service.slug)));
    const getServicesWithMentor = (mentor) => servicesFiltered.filter((service) => mentor.services.some((mentServ) => mentServ.slug === service.slug));

    const showErrorToast = () => {
      toast({
        position: 'top',
        title: 'Error',
        description: `${t('supportSideBar.mentor-not-found')} "${queryMentor}"`,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    };

    let servWithMentorsAvailable = getAllServicesWithMentors();

    if (queryMentor && allMentorsAvailable.length > 0 && !hasReset) {
      const mentorFound = allMentorsAvailable.find((ment) => ment.slug === queryMentor);

      if (!mentorFound && notifyError) {
        showErrorToast();
        setNotifyError(false);
      }
      if (mentorFound) {
        servWithMentorsAvailable = getServicesWithMentor(mentorFound);
        setProgramMentors([mentorFound]);
      }
    }

    setServicesWithMentorsAvailable(servWithMentorsAvailable);

    setTimeout(() => {
      setLoadingServices(false);
    }, 2000);

    if (!hasReset && queryMentor) {
      setOpen(true);
    }
  }, [servicesFiltered, queryMentor, hasReset]);

  useEffect(() => {
    if (queryService && servicesWithMentorsAvailable?.length > 0 && shouldHandleService && !hasReset) {
      const serviceFound = servicesWithMentorsAvailable.find((service) => service.slug === queryService);

      if (!serviceFound && notifyError) {
        toast({
          position: 'top',
          title: 'Error',
          description: `${t('supportSideBar.service-not-found')} "${queryService}" ${queryMentor ? `${t('common:word-connector.for')} "${queryMentor}"` : ''}`,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        setNotifyError(false);
        return;
      }

      handleService(serviceFound);
      setOpen(true);
      setShouldHandleService(false);
    }
  }, [hasReset, servicesWithMentorsAvailable]);

  const reset = () => {
    if (mentoryProps?.service) setMentoryProps({});
    else setOpen(false);
    setHasReset(true);
  };

  const handleGetMoreMentorships = () => {
    setIsFetchingDataForModal(true);
    const academyService = mentoryProps?.service?.slug
      ? mentoryProps?.service
      : subscriptionData?.selected_mentorship_service_set?.mentorship_services?.[0];

    validatePlanExistence(allSubscriptions, currentSubscription?.plans?.[0]?.slug).then((data) => {
      setDataToGetAccessModal({
        ...data,
        event: '',
        academyService,
      });
      setIsModalToGetAccessOpen(true);
    })
      .finally(() => setIsFetchingDataForModal(false));
  };

  const reportBookMentor = (mentorSelected) => {
    reportDatalayer({
      dataLayer: {
        event: 'book_mentorship_session',
        path: router.pathname,
        consumables_amount: currentBalance,
        mentorship_service: mentoryProps?.service?.slug,
        mentor_name: `${mentorSelected.user.first_name} ${mentorSelected.user.last_name}`,
        mentor_id: mentorSelected.slug,
        mentor_booking_url: mentorSelected.booking_url,
        agent: getBrowserInfo(),
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
        <Box position="absolute" top="16px" left="18px" onClick={reset} cursor="pointer">
          <Icon icon="arrowLeft" width="25px" height="25px" color="#606060" />
        </Box>
      )}
      {open && !mentoryProps?.service && (
        <Box position="absolute" top="16px" left="18px" onClick={reset} cursor="pointer">
          <Icon icon="arrowLeft" width="25px" height="25px" color="#606060" />
        </Box>
      )}
      <Box display="flex" flexDirection="column" p="4" pt="20px" alignItems="center">
        <Box d="flex" flexDirection="column" alignItems="center" justifyContent="center">
          {!mentoryProps?.service && (consumables?.mentorship_service_sets?.length !== 0 || currentBalance !== 0) && (
            <>
              <Heading size={titleSize || '14px'} textAlign="center" lineHeight="16.8px" justify="center" mt="0px" mb="0px">
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
              <Text color={lightColor} size="12px" margin="8px 0 0 0" textAlign="center">
                {t('supportSideBar.mentors-available', { count: allMentorsAvailable.length })}
              </Text>
            </Box>
            <Button
              variant="link"
              fontSize="14px"
              onClick={() => {
                setOpen(true);
                reportDatalayer({
                  dataLayer: {
                    event: 'begin_mentorship_session_schedule',
                    path: router.pathname,
                    agent: getBrowserInfo(),
                  },
                });
              }}
            >
              {t('supportSideBar.schedule-button')}
              <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
            </Button>
          </>
        )}

        {open && mentoryProps?.service && !mentoryProps?.mentor && existConsumablesOnCurrentService && (
          <Box display="flex" alignItems="center" fontSize={titleSize || '18px'} fontWeight={700} gridGap="10px" padding="0 10px" margin="10px 0 0px 0" style={{ textWrap: 'nowrap' }}>
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
        ) : open
        && (
          <>
            {mentoryProps?.service && (
              <Box display="flex" alignItems="center" justifyContent="flex-start" gridGap="10px" background={commonBackground} px="20px" pt="15px" textAlign="center" w="100%" borderTopRadius="0.375rem">
                <Box>
                  <Icon icon="checked2" width="15px" height="15px" color={hexColor.greenLight} />
                </Box>
                <Box width="auto">
                  {mentoryProps.service.name}
                </Box>
              </Box>
            )}

            {!mentoryProps?.service && programServices.length > 0 && (
              <>
                <InputGroup mt="15px">
                  <Input
                    onChange={(e) => setSearchProps({ ...searchProps, serviceSearch: e.target.value?.toLocaleLowerCase() })}
                    background={commonBackground}
                    borderBottomRadius="0"
                    border="0"
                    placeholder={t('supportSideBar.select-type')}
                  />
                  <InputRightElement>
                    <Icon icon="arrowDown" color="#606060" width="35px" height="30px" ml="10px" />
                  </InputRightElement>
                </InputGroup>

                <Box maxHeight="10rem" width="100%" overflow="auto" borderBottomRadius="0.375rem">
                  {loadingServices ? (
                    <CardSkeleton withoutContainer quantity={2} height="40px" gridGap="20px" marginTop="10px" />
                  ) : (
                    <>
                      {servicesWithMentorsAvailable.length > 0 && (
                        servicesWithMentorsAvailable.map((service) => (
                          <CanAccess
                            key={service.slug}
                            fromMentorshipService={service.slug}
                            fromAcademy={service?.academy?.slug}
                          >
                            <Box
                              borderTop="1px solid"
                              cursor="pointer"
                              onClick={() => handleService(service)}
                              borderColor={borderColor}
                              py="14px"
                              background={commonBackground}
                              width="100%"
                              px="22px"
                              _hover={{ background: useColorModeValue('featuredLight', 'gray.700') }}
                            >
                              {service.name}
                            </Box>
                          </CanAccess>
                        ))
                      )}
                      {servicesWithMentorsAvailable.length === 0 && (
                        <Box
                          borderTop="1px solid"
                          borderColor={borderColor}
                          py="14px"
                          background={commonBackground}
                          width="100%"
                          px="22px"
                        >
                          {t('common:search-not-found')}
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </>
            )}

            {mentoryProps?.service && !mentoryProps?.mentor && (
              <CanAccess
                fromMentorshipService={mentoryProps?.service?.slug}
                fromAcademy={mentoryProps?.service?.academy?.slug}
              >
                <>
                  <InputGroup mt="15px" borderBottom="1px solid" borderColor={borderColor}>
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
                                  onClick={() => reportBookMentor(mentor)}
                                  href={`${BREATHECODE_HOST}/mentor/${mentor?.slug}?utm_campaign=${mentoryProps?.service?.slug}&utm_source=4geeks&salesforce_uuid=${user?.id}&token=${accessToken}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {t('supportSideBar.create-session-text')}
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
              </CanAccess>
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
  titleSize: PropTypes.string,
  queryService: PropTypes.string,
  queryMentor: PropTypes.string,
  consumables: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  setMentoryProps: PropTypes.func.isRequired,
  programServices: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])),
  servicesFiltered: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  searchProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.string])).isRequired,
  setSearchProps: PropTypes.func.isRequired,
  setProgramMentors: PropTypes.func,
  mentorsFiltered: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  subscriptionData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  allSubscriptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

MentoringConsumables.defaultProps = {
  queryService: undefined,
  queryMentor: undefined,
  titleSize: undefined,
  mentoryProps: [],
  width: '100%',
  consumables: {},
  programServices: [],
  setProgramMentors: () => { },
  subscriptionData: {},
  allSubscriptions: [],
};

export default MentoringConsumables;

export { ProfilesSection };
