import { useEffect, useState } from 'react';
import { useColorModeValue, useToast, Container, Box, InputGroup, Input, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { getStorageItem } from '../../utils';
import { reportDatalayer } from '../../utils/requests';
import { validatePlanExistence } from '../../common/handlers/subscriptions';
import ModalToGetAccess, { stageType } from '../../common/components/ModalToGetAccess';
import useSubscriptionsHandler from '../../common/store/actions/subscriptionAction';
import useStyle from '../../common/hooks/useStyle';
import useAuth from '../../common/hooks/useAuth';
import Icon from '../../common/components/Icon';
import Link from '../../common/components/NextChakraLink';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Image from '../../common/components/Image';
import bc from '../../common/services/breathecode';
import modifyEnv from '../../../modifyEnv';

function NoConsumablesCard({ t, handleGetMoreMentorships, isLoading }) {
  return (
    <Box fontSize="15px" margin="10px 0 0 0" display="flex" flexDirection="column">
      {t('supportSideBar.no-mentoring-available')}
      <Button
        height="auto"
        padding="3px 5px"
        variant="default"
        fontSize="15px"
        background="none"
        isLoading={isLoading}
        fontWeight={700}
        onClick={() => handleGetMoreMentorships()}
        color="blue.400"
      >
        {t('supportSideBar.get-more-mentorships')}
      </Button>
    </Box>
  );
}

function MentorshipSchedule() {
  let isTabletOrPhone = false;
  if (typeof window !== 'undefined') {
    isTabletOrPhone = window.innerWidth < 780;
  }
  const router = useRouter();
  const { t } = useTranslation('dashboard');
  const { fetchSubscriptions } = useSubscriptionsHandler();
  const { service, mentor } = router.query;
  const { borderColor } = useStyle();
  const { isLoading, user, isAuthenticated } = useAuth();
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const accessToken = getStorageItem('accessToken');
  const toast = useToast();
  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');
  const [mentorshipServices, setMentorshipServices] = useState({ isLoading: true, data: [] });
  const [searchProps, setSearchProps] = useState({ serviceSearch: '', mentorSearch: '' });
  const [servicesByMentorAvailable, setServicesByMentorsAvailable] = useState([]);
  const [consumableOfService, setConsumableOfService] = useState({});
  const [consumables, setConsumables] = useState([]);
  const [allMentorsAvailable, setAllMentorsAvailable] = useState([]);
  const [mentorsByService, setMentorsByService] = useState([]);
  const [mentoryProps, setMentoryProps] = useState({});
  const [dataToGetAccessModal, setDataToGetAccessModal] = useState({});
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [openSearchService, setOpenSearchService] = useState(true);
  const [openSearchMentor, setOpenSearchMentor] = useState(true);
  const [isFetchingDataForModal, setIsFetchingDataForModal] = useState(false);
  const [isModalToGetAccessOpen, setIsModalToGetAccessOpen] = useState(false);

  const calculateExistenceOfConsumable = () => {
    if (consumableOfService.available_as_saas === false) return true;
    if (consumableOfService?.balance) return consumableOfService?.balance?.unit > 0 || consumableOfService?.balance?.unit === -1;
    return consumables?.mentorship_service_sets?.length > 0 && Object.values(mentorshipServices.data).length > 0;
  };
  const availableForConsume = calculateExistenceOfConsumable();

  const getServices = async (userRoles) => {
    if (userRoles?.length > 0) {
      const mentorshipPromises = await userRoles.map((role) => bc.mentorship({ academy: role?.academy?.id }, true).getService()
        .then((resp) => {
          const data = resp?.data;
          if (data !== undefined && data.length > 0) {
            return data.map((serv) => ({
              ...serv,
              academy: {
                id: role?.academy.id,
                available_as_saas: role?.academy?.available_as_saas,
              },
            }));
          }
          return [];
        }));
      const mentorshipResults = await Promise.all(mentorshipPromises);
      const recopilatedServices = mentorshipResults.flat();

      setMentorshipServices({
        isLoading: false,
        data: recopilatedServices,
      });
    }
  };

  const getAdmissionsData = async () => {
    try {
      const response = await bc.admissions().me();
      const admissionsFromDB = response.data;
      getServices(admissionsFromDB.roles);
    } catch (error) {
      console.error('Error fetching admissions data:', error);
    }
  };

  const getAllMentorsAvailable = async () => {
    const servicesSlugs = mentorshipServices.data.map(({ slug }) => slug);

    const academies = mentorshipServices.data.reduce((acc, { academy, ...restOfService }) => {
      if (!acc[academy.id]) {
        acc[academy.id] = { services: [] };
      }
      acc[academy.id].services.push(restOfService);
      return acc;
    }, {});

    const academyData = Object.entries(academies).map(([id, { services }]) => ({
      id: Number(id),
      services,
    }));

    const getMentorsForAcademy = async (academy) => {
      const res = await bc.mentorship({
        services: academy.services.map((s) => s.slug).join(','),
        status: 'ACTIVE',
        academy: academy.id,
      }).getMentor();

      return res?.data || [];
    };

    if (servicesSlugs.length > 0) {
      const mentorsPromises = academyData.map(getMentorsForAcademy);
      const mentorsList = (await Promise.all(mentorsPromises)).flat();
      return mentorsList;
    }

    return [];
  };

  const getMentorsAndConsumables = async () => {
    const mentors = await getAllMentorsAvailable();
    const reqConsumables = await bc.payment().service().consumable()
      .then((res) => res?.data?.mentorship_service_sets.map((mentorshipServiceSet) => bc.mentorship()
        .getServiceSet(mentorshipServiceSet?.id)
        .then((rs) => ({
          ...rs?.data,
          ...mentorshipServiceSet,
        }))));

    const allConsumables = await Promise.all(reqConsumables);

    setConsumables(allConsumables);
    setAllMentorsAvailable(mentors);
  };

  const manageMentorsData = (serv) => {
    const filteredConsumables = consumables.filter((consumable) => consumable?.mentorship_services?.some((c) => c?.slug === serv?.slug));

    const relatedConsumable = filteredConsumables.find((consumable) => consumable?.balance?.unit === -1)
      || filteredConsumables.find((consumable) => consumable?.balance?.unit > 0)
      || filteredConsumables.find((consumable) => consumable?.balance?.unit === 0);

    if (relatedConsumable) {
      reportDatalayer({
        dataLayer: {
          event: 'select_mentorship_service',
          path: router.pathname,
          consumables_amount: relatedConsumable.balance?.unit,
          mentorship_service: serv?.slug,
        },
      });
    }
    setConsumableOfService({
      ...relatedConsumable,
      balance: {
        unit: serv?.academy?.available_as_saas === false ? -1 : relatedConsumable?.balance?.unit,
      },
      available_as_saas: serv?.academy?.available_as_saas,
    });

    setMentoryProps({ ...mentoryProps, serviceSelected: serv });
  };

  const handleService = async (serv) => {
    try {
      if (allMentorsAvailable.length > 0) {
        const mentorsByServices = allMentorsAvailable.filter((ment) => ment.services.some((s) => s.slug === serv.slug));
        setMentorsByService(mentorsByServices);
        manageMentorsData(serv, mentorsByServices);
        if (openSearchService) setOpenSearchService(false);
        setSearchProps({
          serviceSearch: '',
          mentorSearch: '',
        });
      } else {
        manageMentorsData(serv);
        if (openSearchService) setOpenSearchService(false);
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

  const handleServicesByMentorsAvailability = () => {
    const servicesWithMentors = mentorshipServices.data.filter((serv) => allMentorsAvailable.some((ment) => ment.services.some((mentorService) => serv.slug === mentorService.slug)));

    if (service) {
      const mentorshipFound = servicesWithMentors.filter((serv) => serv.slug === service);
      handleService(mentorshipFound[0]);
      if (mentorshipFound.length > 0) {
        setMentoryProps((prev) => ({
          ...prev,
          serviceSelected: mentorshipFound[0],
        }));
      }
    }

    if (mentor) {
      const isolateMentor = allMentorsAvailable.filter((ment) => ment.slug === mentor);
      const servicesOfMentor = mentorshipServices.data.filter((serv) => isolateMentor.some((ment) => ment.services.some((mentorService) => serv.slug === mentorService.slug)));
      if (servicesOfMentor.length > 0) {
        setOpenSearchMentor(false);
        setMentoryProps((prev) => ({
          ...prev,
          mentorSelected: isolateMentor[0],
        }));
      }
      return servicesOfMentor;
    }

    return servicesWithMentors.length > 0 ? servicesWithMentors : allMentorsAvailable;
  };

  const handleMentorSelection = (ment) => {
    if (mentoryProps.serviceSelected.slug) {
      setMentoryProps({ ...mentoryProps, mentorSelected: ment });
      setSearchProps({
        serviceSearch: '',
        mentorSearch: '',
      });
    }
    if (openSearchMentor) setOpenSearchMentor(false);
  };

  useEffect(() => {
    if (mentorshipServices.data && allMentorsAvailable) {
      const servicesWithMentorsAvailable = handleServicesByMentorsAvailability();
      setServicesByMentorsAvailable(servicesWithMentorsAvailable);
    }
  }, [mentorshipServices.data, allMentorsAvailable]);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      } else if (isAuthenticated) {
        await getAdmissionsData();
      }
    };

    checkAuthAndFetchData();
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (!mentorshipServices.isLoading && mentorshipServices?.data.length > 0) {
      getMentorsAndConsumables();
    }
  }, [mentorshipServices]);

  const handleOpenCloseService = () => {
    if (!openSearchService) {
      if (!openSearchMentor) setOpenSearchMentor(true);
      setMentoryProps({});
      setOpenSearchService(true);
    }
  };

  const handleOpenCloseMentor = () => {
    setMentoryProps((prevState) => {
      const { mentorSelected: mentorToRemove, ...remainingProps } = prevState;
      return remainingProps;
    });
    setOpenSearchMentor(true);
  };

  const reportBookMentor = () => {
    reportDatalayer({
      dataLayer: {
        event: 'book_mentorship_session',
        path: router.pathname,
        consumables_amount: consumableOfService.balance.unit,
        mentorship_service: mentoryProps?.serviceSelected?.slug,
        mentor_name: `${mentoryProps.mentorSelected.user.first_name} ${mentoryProps.mentorSelected.user.last_name}`,
        mentor_id: mentoryProps.mentorSelected.slug,
        mentor_booking_url: mentoryProps.mentorSelected.booking_url,
      },
    });
  };

  const handleTitleStep = () => {
    if (!mentoryProps.serviceSelected) return t('schedule-steps.select-mentorship');
    if (mentoryProps.serviceSelected && !mentoryProps.mentorSelected) return t('schedule-steps.select-mentor');
    return t('schedule-steps.schedule');
  };

  const handleDescription = () => {
    if (mentor) return `${t('mentorship.no-available-for-teacher')} ${mentor}`;
    return t('mentorship.no-available');
  };

  useEffect(() => {
    if (mentoryProps.serviceSelected) {
      fetchSubscriptions()
        .then((data) => {
          setSubscriptionData(data);
          reportDatalayer({
            dataLayer: {
              event: 'subscriptions_load',
              method: 'native',
              plan_financings: data?.plan_financings?.filter((s) => s.status === 'ACTIVE').map((s) => s.plans.filter((p) => p.status === 'ACTIVE').map((p) => p.slug).join(',')).join(','),
              subscriptions: data?.subscriptions?.filter((s) => s.status === 'ACTIVE').map((s) => s.plans.filter((p) => p.status === 'ACTIVE').map((p) => p.slug).join(',')).join(','),
            },
          });
        });
    }
  }, [mentoryProps.serviceSelected]);

  const getMostRecentPaidAt = (invoices) => invoices.reduce((latest, invoice) => {
    const paidAtDate = new Date(invoice.paid_at);
    return paidAtDate > latest ? paidAtDate : latest;
  }, new Date(0));

  const sortByMostRecentInvoice = (a, b) => {
    const latestA = getMostRecentPaidAt(a.invoices);
    const latestB = getMostRecentPaidAt(b.invoices);
    return latestB - latestA;
  };

  const handleGetMoreMentorships = async () => {
    setIsFetchingDataForModal(true);
    const academyService = mentoryProps?.serviceSelected;
    const allSubscriptions = subscriptionData.subscriptions;
    const currentServiceSubscription = Array.isArray(allSubscriptions) && allSubscriptions.sort(sortByMostRecentInvoice).find((subscription) => subscription.selected_mentorship_service_set.mentorship_services.some((serv) => serv.slug === mentoryProps?.serviceSelected?.slug));
    const currentSubscription = currentServiceSubscription || allSubscriptions?.[0];

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

  return !isLoading && user && !mentorshipServices.isLoading && (
    <Container as="div" height="100%" maxWidth="full" minHeight="87.5vh" display="flex" flexDirection="column" padding={0} background={() => useColorModeValue('#f9f9f9', '#171f2a')}>
      <Link href="/choose-program" color="#0196d1" display="inline-block" letterSpacing="0.05em" fontWeight="700" width="fit-content" padding="3rem 0 0.6rem 1rem">
        <Box display="flex" alignItems="center" justifyContent="center" gap="5px">
          <Icon icon="arrowLeft2" color="#0196d1" width="15px" height="15px" />
          <Box as="span">{`${t('back-to-dash')}`}</Box>
        </Box>
      </Link>
      <Container as="div" display="flex" flexDirection="column" justifyContent="center" alignItems="center" marginTop="2.5rem" textAlign="center" padding="10px" borderRadius="10px">
        <Heading>
          {t('supportSideBar.schedule-button')}
        </Heading>
        <Text size="18px" fontWeight="bold" marginTop="1rem">
          {`${t('mentorship.you-have')} ${servicesByMentorAvailable?.length} ${t('mentorship.mentor-sessions-available')}`}
        </Text>
        <Container as="div" display="flex" flexDirection="column" marginTop="3rem" background={commonBackground} padding={isTabletOrPhone ? '5px' : '10px'} width="100%" justifyContent="center" alignItems="center" borderRadius="10px">
          <Text size="15px">{handleTitleStep()}</Text>
          <Box marginTop="1rem" width="100%">
            {openSearchService && (
              <Input onChange={(e) => setSearchProps({ ...searchProps, serviceSearch: e.target.value?.toLocaleLowerCase() })} borderBottomRadius="0" border="0" padding="0 1px" placeholder={t('supportSideBar.select-type')} />
            )}
            <Box maxHeight="10rem" overflow="auto" borderRadius="0.375rem" border="1px solid #0097CF">
              {servicesByMentorAvailable?.length > 0 ? (
                <div>
                  {mentoryProps.serviceSelected ? (
                    <Box display="flex" justifyContent="space-between" py="5px" width="100%" px="10px" textAlign="start" height="4rem">
                      <Box display="flex" alignItems="center">
                        {mentoryProps?.serviceSelected && !openSearchService && (
                          <Icon icon="verified2" color="#25BF6C" width="20px" height="15px" mr="5px" />
                        )}
                        {mentoryProps.serviceSelected?.name}
                      </Box>
                      {mentoryProps?.serviceSelected && !openSearchService
                        && (
                          <Button background="transparent" _hover={false} _active={false} alignSelf="center" padding={0}>
                            <Icon icon="arrowDown" color="#606060" width="30px" height="30px" onClick={() => handleOpenCloseService()} />
                          </Button>
                        )}
                    </Box>
                  ) : (
                    servicesByMentorAvailable.filter((serv) => serv.name.toLowerCase().includes(searchProps.serviceSearch || '')).map((serv) => (
                      <Box key={serv?.name} display="flex" justifyContent="space-between" borderTop="1px solid" cursor="pointer" borderColor={borderColor} py="14px" width="100%" px="22px" onClick={() => handleService(serv)}>
                        <Box display="flex" alignItems="center">
                          {mentoryProps.serviceSelected ? mentoryProps.serviceSelected.name : serv.name}
                        </Box>
                      </Box>
                    ))
                  )}
                </div>
              ) : (
                <Box borderTop="1px solid" borderColor={borderColor} py="14px" width="100%" px="22px">
                  {handleDescription()}
                </Box>
              )}
            </Box>
          </Box>
          <Box width="100%">
            {mentoryProps?.serviceSelected && (
              <Box>
                {openSearchMentor && !mentoryProps.mentorSelected && (
                  <InputGroup mt="15px" borderColor={borderColor}>
                    <Input onChange={(e) => setSearchProps({ ...searchProps, mentorSearch: e.target.value?.toLowerCase() })} borderBottomRadius="0" border="0" padding="0 1px" placeholder={t('supportSideBar.search-mentor')} />
                  </InputGroup>
                )}
                <Box maxHeight="18rem" width="100%" overflow="auto" borderRadius="0.375rem" border="1px solid #0097CF" marginTop="10px">
                  {mentorsByService.length > 0 ? (
                    <Box>
                      {(mentoryProps.serviceSelected && mentoryProps.mentorSelected) ? (
                        <Box display="flex" alignItems="center" gridGap="18px" flexDirection="row" py="5px" width="100%" px="10px" textAlign="start" height="4rem">
                          <Box display="flex" alignItems="center">
                            <Icon icon="verified2" color="#25BF6C" width="20px" height="15px" mr="5px" />
                            <Image src={mentoryProps.mentorSelected?.user.profile?.avatar_url} alt={`${mentoryProps.mentorSelected?.user?.first_name} ${mentoryProps.mentorSelected?.user?.last_name}`} width={isTabletOrPhone ? 30 : 50} height={isTabletOrPhone ? 30 : 50} objectFit="cover" styleImg={{ borderRadius: '50px' }} />
                          </Box>
                          <Box display="flex" flexGrow={1}>
                            <Box display="flex" flexDirection="column" width="100%" justifyContent="center">
                              <Box fontWeight="600">
                                {`${mentoryProps.mentorSelected.user.first_name} ${mentoryProps.mentorSelected.user.last_name}`}
                              </Box>
                              <Box fontSize="14px">
                                {(mentoryProps.mentorSelected.one_line_bio && mentoryProps.mentorSelected.one_line_bio !== '') ? `${mentoryProps.mentorSelected.one_line_bio} ` : ''}
                              </Box>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="center">
                              <Button background="transparent" _hover={false} _active={false} padding={0}>
                                <Icon icon="arrowDown" color="#606060" width="30px" height="30px" maxHeight="30px" onClick={() => handleOpenCloseMentor()} />
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        mentorsByService.filter((ment) => `${ment.user.first_name} ${ment.user.last_name}`.toLowerCase().includes(searchProps.mentorSearch || '')).map((ment, i) => (
                          <div key={ment?.user?.id}>
                            {i !== 0 && (
                              <Box as="hr" borderColor="gray.300" margin="0 18px" />
                            )}
                            <Box display="flex" alignItems="center" gridGap="18px" flexDirection="row" py="5px" width="100%" px="18px" cursor="pointer" textAlign="start" onClick={() => handleMentorSelection(ment)}>
                              <Box display="flex" alignItems="center">
                                <Image src={ment?.user.profile?.avatar_url} alt={`${ment?.user?.first_name} ${ment?.user?.last_name}`} width={50} height={50} objectFit="cover" styleImg={{ borderRadius: '50px' }} />
                              </Box>
                              <Box display="flex" justifyContent="space-between" flexGrow={1}>
                                <Box display="flex" flexDirection="column" width="100%">
                                  <Box fontSize="15px" fontWeight="600">
                                    {`${ment.user.first_name} ${ment.user.last_name}`}
                                  </Box>
                                  <Box fontSize="14px">
                                    {(ment.one_line_bio && ment.one_line_bio !== '') ? `${ment.one_line_bio} ` : ''}
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </div>
                        ))
                      )}
                    </Box>
                  ) : (
                    <Box borderTop="1px solid" py="14px" width="100%" px="22px">
                      {t('supportSideBar.no-mentors')}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
          <Box>
            {mentoryProps.serviceSelected && mentoryProps.mentorSelected && !openSearchMentor && !openSearchService && availableForConsume && (
              <Box>
                {mentoryProps.mentorSelected.booking_url ? (
                  <Link variant="default" onClick={() => reportBookMentor()} href={`${BREATHECODE_HOST}/mentor/${mentoryProps.mentorSelected?.slug}?utm_campaign=${mentoryProps?.serviceSelected?.slug}&utm_source=4geeks&salesforce_uuid=${user?.id}&token=${accessToken}`} target="_blank" rel="noopener noreferrer" background="#0196d1" display="flex" marginTop="12px" padding="10px" borderRadius="5px" alignItems="center">
                    <Text color="white" fontSize="15px">
                      {t('mentorship.action')}
                    </Text>
                    <Icon icon="longArrowRight" color="white" width="30px" height="15px" ml="10px" />
                  </Link>
                ) : (
                  <Box fontSize="15px">
                    {t('supportSideBar.no-mentor-link')}
                  </Box>
                )}
              </Box>
            )}
          </Box>
          <Box>
            {mentoryProps.serviceSelected && mentoryProps.mentorSelected && !availableForConsume && (
              <NoConsumablesCard t={t} isLoading={isFetchingDataForModal} mentoryProps={mentoryProps} handleGetMoreMentorships={handleGetMoreMentorships} setMentoryProps={setMentoryProps} mt="30px" />
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
        </Container>
      </Container>
    </Container>
  );
}

NoConsumablesCard.defaultProps = {
  isLoading: false, // Valor por defecto cuando no se pasa esta prop
};

NoConsumablesCard.propTypes = {
  t: PropTypes.func.isRequired,
  handleGetMoreMentorships: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default MentorshipSchedule;
