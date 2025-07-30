import { useEffect, useState, useMemo } from 'react';
import { useColorModeValue, Container, Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useSubscriptions from '../../hooks/useSubscriptions';
import useAuth from '../../hooks/useAuth';
import Icon from '../../components/Icon';
import Link from '../../components/NextChakraLink';
import bc from '../../services/breathecode';
import MentoringConsumables from '../../components/SupportSidebar/MentoringConsumables';

function MentorshipSchedule() {
  const router = useRouter();
  const { t } = useTranslation('signup');
  const { state } = useSubscriptions();
  const { subscriptions: subscriptionData } = state;
  const { service, mentor } = router.query;
  const { isLoading, user, isAuthenticated, cohorts } = useAuth();
  const [mentorshipServices, setMentorshipServices] = useState({ isLoading: true, data: [] });
  const [searchProps, setSearchProps] = useState({ serviceSearch: '', mentorSearch: '' });
  const [mentoryProps, setMentoryProps] = useState({});
  const [consumables, setConsumables] = useState([]);
  const [allMentorsAvailable, setAllMentorsAvailable] = useState([]);
  const [mentorsByService, setMentorsByService] = useState([]);

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

      const uniqueServices = recopilatedServices.filter((serviceItem, index, self) => index === self.findIndex((s) => s.slug === serviceItem.slug));

      setMentorshipServices({
        isLoading: false,
        data: uniqueServices,
      });
    }
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      } else if (isAuthenticated) {
        await getServices(user.roles);
      }
    };

    checkAuthAndFetchData();
  }, [isLoading, isAuthenticated, user]);

  const allSyllabus = useMemo(() => {
    const allCohorts = cohorts || [];
    const syllabus = [...new Set(allCohorts.map((cohort) => cohort.syllabus_version.slug))];
    return syllabus;
  }, [cohorts]);

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
        syllabus: allSyllabus?.join(',') || undefined,
        academy: academy.id,
      }).getMentor();

      return res?.data || [];
    };

    if (servicesSlugs.length > 0 || allSyllabus.length > 0) {
      const mentorsPromises = academyData.map(getMentorsForAcademy);
      const mentorsList = (await Promise.all(mentorsPromises)).flat();
      return mentorsList;
    }

    return [];
  };

  const sortByConsumptionAvailability = (allConsumables) => allConsumables.sort((a, b) => {
    const balanceA = a?.balance?.unit;
    const balanceB = b?.balance?.unit;

    if (balanceA === -1 && balanceB !== -1) return -1;
    if (balanceA !== -1 && balanceB === -1) return 1;

    if (balanceA > 0 && balanceB <= 0) return -1;
    if (balanceA <= 0 && balanceB > 0) return 1;

    if (balanceA > 0 && balanceB > 0) return balanceB - balanceA;

    return 0;
  });

  const getMentorsAndConsumables = async () => {
    const mentors = await getAllMentorsAvailable();
    const reqConsumables = await bc.payment().service().consumable()
      .then((res) => res?.data?.mentorship_service_sets.map((mentorshipServiceSet) => bc.payment()
        .getServiceSet(mentorshipServiceSet?.id)
        .then((rs) => ({
          ...rs?.data,
          ...mentorshipServiceSet,
        }))));

    const allConsumables = await Promise.all(reqConsumables);
    const sortedConsumables = sortByConsumptionAvailability(allConsumables);

    const uniqueMentors = mentors.filter((mentorItem, index, self) => index === self.findIndex((m) => m.id === mentorItem.id));

    setConsumables(sortedConsumables);
    setAllMentorsAvailable(uniqueMentors);
  };

  useEffect(() => {
    if (!mentorshipServices.isLoading && mentorshipServices?.data.length > 0) {
      getMentorsAndConsumables();
    }
  }, [mentorshipServices]);

  useEffect(() => {
    if (allMentorsAvailable.length === 0) {
      setMentorsByService([]);
      setMentoryProps({});
      setSearchProps({ serviceSearch: '', mentorSearch: '' });
    }
  }, [allMentorsAvailable.length]);

  const mentorsFiltered = mentorsByService.filter(
    (ment) => {
      const fullName = `${ment.user.first_name} ${ment.user.last_name}`.toLowerCase();
      return (
        fullName.includes(searchProps.mentorSearch)
        && ment.services.some((sv) => sv.status === 'ACTIVE' && sv.slug === mentoryProps?.service?.slug)
      );
    },
  );

  const filterServices = () => {
    if (subscriptionData?.selected_mentorship_service_set?.mentorship_services?.length > 0) {
      return subscriptionData?.selected_mentorship_service_set?.mentorship_services?.filter(
        (l) => l.name.toLowerCase().includes(searchProps.serviceSearch),
      );
    }
    if (mentorshipServices.data.length > 0) {
      return mentorshipServices.data?.filter(
        (l) => l.name.toLowerCase().includes(searchProps.serviceSearch),
      );
    }

    return [];
  };
  const suscriptionServicesFiltered = filterServices();

  return !isLoading && user && !mentorshipServices.isLoading && (
    <Container as="div" height="100%" maxWidth="full" minHeight="93vh" display="flex" flexDirection="column" padding={0} background={() => useColorModeValue('gray.light3', 'darkTheme')} overflow="hidden">
      <Container maxWidth="1280px">
        <Link href="/choose-program" color="#0196d1" display="inline-block" letterSpacing="0.05em" fontWeight="700" width="fit-content" padding="3rem 0 0.6rem 1rem">
          <Box display="flex" alignItems="center" justifyContent="center" gap="5px">
            <Icon icon="arrowLeft2" color="#0196d1" width="15px" height="15px" />
            <Box as="span">{`${t('consumables.back-to-dashboard')}`}</Box>
          </Box>
        </Link>
        <Container as="div" display="flex" flexDirection="column" justifyContent="center" alignItems="center" marginTop="2.5rem" textAlign="center" padding="0px" borderRadius="10px">
          <Box textAlign="start" borderRadius="10px" background={() => useColorModeValue('white', '#27333f')}>
            <MentoringConsumables
              {...{
                mentoryProps,
                width: { base: '350px', md: '650px' },
                titleSize: { base: '14px', md: '24px' },
                consumables,
                setMentoryProps,
                programServices: mentorshipServices.data,
                servicesFiltered: suscriptionServicesFiltered,
                searchProps,
                setSearchProps,
                setProgramMentors: setMentorsByService,
                mentorsFiltered,
                allMentorsAvailable,
                subscriptionData,
                allSubscriptions: subscriptionData?.subscriptions || [],
                queryService: service,
                queryMentor: mentor,
                withDescription: true,
              }}
            />
          </Box>
        </Container>
      </Container>
    </Container>
  );
}

export default MentorshipSchedule;
