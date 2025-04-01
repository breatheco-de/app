import React, { useEffect, useState, useMemo } from 'react';
import {
  Flex, Box, Button, useToast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import ChooseProgram from '../../js_modules/chooseProgram';
import Text from '../../common/components/Text';
import asPrivate from '../../common/context/PrivateRouteWrapper';
import bc from '../../common/services/breathecode';
import useAuth from '../../common/hooks/useAuth';
import Icon from '../../common/components/Icon';
import TaskBar from '../../common/components/TaskBar';
import { calculateDifferenceDays, getStorageItem, isPlural, isValidDate, removeStorageItem, setStorageItem, sortToNearestTodayDate, syncInterval, getBrowserInfo } from '../../utils';
import { reportDatalayer } from '../../utils/requests';
import Heading from '../../common/components/Heading';
import { usePersistent } from '../../common/hooks/usePersistent';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import LiveEvent from '../../common/components/LiveEvent';
import NextChakraLink from '../../common/components/NextChakraLink';
import { SimpleSkeleton } from '../../common/components/Skeleton';
import useProgramList from '../../common/store/actions/programListAction';
import handlers from '../../common/handlers';
import useSubscriptionsHandler from '../../common/store/actions/subscriptionAction';
import { PREPARING_FOR_COHORT } from '../../common/store/types';
import SimpleModal from '../../common/components/SimpleModal';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import useStyle from '../../common/hooks/useStyle';
import SupportSidebar from '../../common/components/SupportSidebar';
import Feedback from '../../common/components/Feedback';
import axios from '../../axios';
import LanguageSelector from '../../common/components/LanguageSelector';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'choose-program');

  return {
    props: {
      seo: {
        title: t('seo.title'),
        locales,
        locale,
        url: '/choose-program',
        pathConnector: '/choose-program',
      },
      fallback: false,
    },
  };
};

function chooseProgram() {
  const { t } = useTranslation('choose-program');
  const { setCohortSession, getCohortsModules, cohortsAssignments } = useCohortHandler();
  const { user, cohorts, isLoading, reSetUserAndCohorts, fetchUserAndCohorts, setCohorts } = useAuth();
  const [subscriptionProcess] = usePersistent('subscription-process', null);
  const [invites, setInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const [events, setEvents] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [loadingInvite, setLoadingInvite] = useState(null);
  const { state, programsList, updateProgramList } = useProgramList();
  const { fetchSubscriptions, state: subscriptionsState } = useSubscriptionsHandler();
  const { isLoading: subscriptionLoading, subscriptions } = subscriptionsState;
  const [cohortTasks, setCohortTasks] = useState({});
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [lateModalProps, setLateModalProps] = useState({
    isOpen: false,
    data: [],
  });
  const [mentorshipServices, setMentorshipServices] = useState({
    isLoading: true,
    data: [],
  });
  const toast = useToast();
  const { hexColor } = useStyle();
  const isClosedLateModal = getStorageItem('isClosedLateModal');
  const TwelveHoursInMinutes = 720;
  const cardColumnSize = 'repeat(auto-fill, minmax(17rem, 1fr))';

  const getStudentAndTeachers = async (item) => {
    const users = await bc.cohort({
      role: 'TEACHER,ASSISTANT',
      cohorts: item?.slug,
      academy: item?.academy?.id,
    }).getMembers();

    return users || [];
  };

  const getMembers = async (cohortSubscription) => {
    const members = await getStudentAndTeachers(cohortSubscription);
    return members;
  };

  const getAllSyllabus = () => {
    const syllabus = [];

    cohorts.forEach(({ syllabus_version: syllabusVersion }) => {
      if (!syllabus.includes(syllabusVersion.slug)) syllabus.push(syllabusVersion.slug);
    });
    return syllabus;
  };

  const allSyllabus = useMemo(getAllSyllabus, [cohorts]);

  const getServices = async (userRoles) => {
    if (userRoles?.length > 0) {
      delete axios.defaults.headers.common.Academy;
      const mentorshipPromises = await userRoles.map((role) => bc.mentorship({ academy: role?.academy?.id }, true).getService()
        .then((resp) => {
          const data = resp?.data;
          if (data !== undefined && data.length > 0) {
            return data.map((service) => ({
              ...service,
              academy: {
                id: role?.academy.id,
                slug: role?.academy.slug,
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

  useEffect(() => {
    let revalidate;
    if (user) {
      const cohortSubscription = cohorts?.find((item) => item?.slug === subscriptionProcess?.slug);
      const members = cohortSubscription ? getMembers(cohortSubscription) : [];

      getServices(user.roles);
      const cohortIsReady = cohorts?.length > 0 && cohorts?.some((cohort) => {
        // const cohort = item?.cohort;
        const academy = cohort?.academy;
        if (cohort?.id === subscriptionProcess?.id
        && cohort?.slug === subscriptionProcess?.slug
        && academy?.id === subscriptionProcess?.academy_info?.id) return true;

        return false;
      });
      if (cohorts?.length > 0) {
        const hasAvailableAsSaas = cohorts.some((elem) => elem.available_as_saas === true);
        const cohortsSlugs = cohorts.map((elem) => elem.slug).join(',');
        const cohortsAcademies = cohorts.map((elem) => elem.academy.slug).join(',');
        const cohortWithFinantialStatusLate = cohorts.filter((elem) => elem.cohort_user.finantial_status === 'LATE' || elem.educational_status === 'SUSPENDED');
        setLateModalProps({
          isOpen: cohortWithFinantialStatusLate?.length > 0 && !isClosedLateModal,
          data: cohortWithFinantialStatusLate,
        });

        reportDatalayer({
          dataLayer: {
            available_as_saas: hasAvailableAsSaas,
            cohorts: cohortsSlugs,
            academies: cohortsAcademies,
            agent: getBrowserInfo(),
          },
        });
      }

      revalidate = setTimeout(async () => {
        if (subscriptionProcess?.status === PREPARING_FOR_COHORT && subscriptionProcess?.id) {
          setIsRevalidating(true);
          if (!cohortIsReady && members.length === 0) {
            const { cohorts: myCohorts } = await fetchUserAndCohorts();
            setCohorts(myCohorts);
            console.log('revalidated on:', new Date().toLocaleString());
            setIsRevalidating(false);
          } else {
            setIsRevalidating(false);
            console.log('Start learning!');
            removeStorageItem('subscription-process');
          }
        }
      }, 2000);
    }

    return () => clearTimeout(revalidate);
  }, [user, cohorts]);

  useEffect(() => {
    fetchSubscriptions()
      .then((data) => {
        reportDatalayer({
          dataLayer: {
            event: 'subscriptions_load',
            method: 'native',
            plan_financings: data?.plan_financings?.filter((s) => s.status === 'ACTIVE').map((s) => s.plans.filter((p) => p.status === 'ACTIVE').map((p) => p.slug).join(',')).join(','),
            subscriptions: data?.subscriptions?.filter((s) => s.status === 'ACTIVE').map((s) => s.plans.filter((p) => p.status === 'ACTIVE').map((p) => p.slug).join(',')).join(','),
            agent: getBrowserInfo(),
          },
        });
      });
  }, []);

  const allSubscriptions = [
    ...subscriptions?.subscriptions || [],
    ...subscriptions?.plan_financings || [],
  ];
  // .filter((subscription) => subscription?.plans?.[0]?.slug !== undefined);

  useEffect(() => {
    if (subscriptionLoading === false && cohorts.length > 0 && Object.values(cohortTasks)?.length > 0) {
      updateProgramList(cohorts?.reduce((acc, value) => {
        acc[value.slug] = {
          ...state[value.slug],
          ...programsList[value.slug],
          ...cohortTasks[value.slug],
          name: value.name,
          plan_financing: subscriptions?.plan_financings?.find(
            (sub) => sub?.selected_cohort_set?.cohorts.some((cohort) => cohort?.slug === value.slug),
          ) || null,
          subscription: subscriptions?.subscriptions?.find(
            (sub) => sub?.selected_cohort_set?.cohorts.some((cohort) => cohort?.slug === value.slug),
          ) || null,
          all_subscriptions: allSubscriptions,
          slug: value.slug,
        };
        return acc;
      }, {}));
    }
  }, [cohorts, cohortTasks, subscriptionLoading]);

  const processCohort = async (cohort) => {
    if (cohort?.slug) {
      const isFinantialStatusLate = cohort.cohort_user.finantial_status === 'LATE' || cohort.cohort_user.educational_status === 'SUSPENDED';
      const { slug } = cohort;
      const studentAndTeachers = isFinantialStatusLate ? {} : await bc.cohort({
        role: 'TEACHER,ASSISTANT',
        cohorts: slug,
        academy: cohort.academy?.id,
      }).getMembers();
      const teacher = studentAndTeachers?.data?.filter((st) => st.role === 'TEACHER') || [];
      const assistant = studentAndTeachers?.data?.filter((st) => st.role === 'ASSISTANT') || [];
      const { tasks, syllabus } = cohortsAssignments[slug];
      const assignmentData = await handlers.getAssignmentsCount({ data: syllabus, taskTodo: tasks, cohortId: cohort.id });

      setCohortTasks((prev) => ({
        ...prev,
        [slug]: {
          ...assignmentData,
          teacher,
          assistant,
        },
      }));
    }
  };

  useEffect(() => {
    if (cohorts.length > 0) {
      getCohortsModules(cohorts);
    }
  }, [cohorts]);

  useEffect(() => {
    const cohortSlugs = Object.keys(cohortsAssignments);
    if (cohorts.length > 0 && cohorts.every((cohort) => cohortSlugs.includes(cohort.slug))) {
      cohorts.map(processCohort);
    }
  }, [cohorts, cohortsAssignments]);

  useEffect(() => {
    bc.payment({ upcoming: true, limit: 20 }).events()
      .then(({ data }) => {
        const results = data?.results || [];
        const eventsRemain = results?.length > 0 ? results.filter((l) => {
          if (isValidDate(l?.ended_at)) return new Date(l?.ended_at) - new Date() > 0;
          if (isValidDate(l?.ending_at)) return new Date(l?.ending_at) - new Date() > 0;
          return false;
        }).slice(0, 3) : [];
        setEvents(eventsRemain);
      });

    bc.events({
      upcoming: true,
    }).liveClass()
      .then((res) => {
        const validatedEventList = res?.data?.length > 0
          ? res?.data?.filter((l) => isValidDate(l?.starting_at) && isValidDate(l?.ending_at))
          : [];
        const sortDateToLiveClass = sortToNearestTodayDate(validatedEventList, TwelveHoursInMinutes);
        const existentLiveClasses = sortDateToLiveClass?.filter((l) => l?.hash && l?.starting_at && l?.ending_at);
        setLiveClasses(existentLiveClasses);
      });
    syncInterval(() => {
      setLiveClasses((prev) => {
        const validatedEventList = prev?.length > 0
          ? prev?.filter((l) => isValidDate(l?.starting_at) && isValidDate(l?.ending_at))
          : [];
        const sortDateToLiveClass = sortToNearestTodayDate(validatedEventList, TwelveHoursInMinutes);
        const existentLiveClasses = sortDateToLiveClass?.filter((l) => l?.hash && l?.starting_at && l?.ending_at);
        return existentLiveClasses;
      });
    });
  }, []);

  useEffect(() => {
    if (user?.date_joined) {
      const cohortUserDaysCalculated = calculateDifferenceDays(user?.date_joined);
      if (cohortUserDaysCalculated?.isRemainingToExpire === false && cohortUserDaysCalculated?.result <= 2) {
        setIsWelcomeModalOpen(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCohortSession(null);
    }
  }, [user]);

  const getPendingInvites = async () => {
    try {
      const { data } = await bc.auth().invites().profileInvites();
      const { invites: invs, profile_academies: profileAcademies } = data;

      const pendingInvites = invs.filter((inv) => inv.status === 'PENDING').map((inv) => ({ ...inv, type: 'invite' }));
      const pendingProfileAcademies = profileAcademies
        .filter((prof) => !pendingInvites.some((inv) => inv.academy.id === prof.academy.id))
        .map((prof) => ({ ...prof, type: 'profile_academy' }));

      setInvites([
        ...pendingInvites,
        ...pendingProfileAcademies,
      ]);
    } catch (e) {
      toast({
        title: t('alert-message:something-went-wrong-with', { property: 'Admissions' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    getPendingInvites();
  }, []);

  const acceptInvite = async ({ id }) => {
    try {
      setLoadingInvite(id);
      const res = await bc.auth().invites().accept(id);
      const { status } = res;
      if (status >= 200 && status < 400) {
        const invitationIndex = invites.findIndex((invite) => invite.id === id);
        const inv = invites[invitationIndex];
        const { name: cohortName } = inv.cohort;

        await reSetUserAndCohorts();

        const invList = [...invites];
        invList.splice(invitationIndex, 1);
        setInvites(invList);

        toast({
          title: t('alert-message:invitation-accepted-cohort', { cohortName }),
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: t('alert-message:invitation-error'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (e) {
      console.log(e);
      toast({
        title: t('alert-message:invitation-error'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingInvite(null);
    }
  };

  const acceptProfileAcademy = async ({ id }) => {
    try {
      setLoadingInvite(id);
      const res = await bc.auth().acceptProfileAcademy(id);
      const { status } = res;
      if (status >= 200 && status < 400) {
        const invitationIndex = invites.findIndex((invite) => invite.id === id);

        await reSetUserAndCohorts();

        const invList = [...invites];
        invList.splice(invitationIndex, 1);
        setInvites(invList);

        toast({
          title: t('alert-message:invitation-accepted'),
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: t('alert-message:invitation-error'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (e) {
      console.log(e);
      toast({
        title: t('alert-message:invitation-error'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingInvite(null);
    }
  };

  const inviteWord = () => {
    if (isPlural(invites)) {
      return t('invite.plural-word', { invitesLength: invites?.length });
    }
    return t('invite.singular-word', { invitesLength: invites?.length });
  };

  const isMainCohort = (cohort) => !cohorts.some((elem) => elem.micro_cohorts.some((micro) => micro.slug === cohort.slug));

  return (
    <Flex alignItems="center" flexDirection="row" mt="40px">
      <SimpleModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        style={{ marginTop: '10vh' }}
        maxWidth="45rem"
        borderRadius="13px"
        headerStyles={{ textAlign: 'center' }}
        title={t('dashboard:welcome-modal.title')}
        bodyStyles={{ padding: 0 }}
        closeOnOverlayClick={false}
        leftButton={(
          <Flex
            position="absolute"
            variant="unstyled"
            top={5}
            left={5}
            alignItems="center"
            justifyContent="center"
            width="auto"
            mb="1rem"
          >
            <LanguageSelector />
          </Flex>
        )}
      >
        <Box display="flex" flexDirection="column" gridGap="17px" padding="1.5rem 4%">
          <Text size="13px" textAlign="center" style={{ textWrap: 'balance' }}>
            {t('dashboard:welcome-modal.description')}
          </Text>
        </Box>
        <Box padding="0 15px 15px">
          <ReactPlayerV2
            url={t('welcome-video')}
            width="100%"
            height="100%"
            iframeStyle={{ borderRadius: '3px 3px 13px 13px' }}
          />
        </Box>
      </SimpleModal>
      <SimpleModal
        maxWidth="30rem"
        isOpen={lateModalProps.isOpen}
        title={t('late-payment.title')}
        onClose={() => {
          setLateModalProps({ ...lateModalProps, isOpen: false });
          setStorageItem('isClosedLateModal', true);
        }}
      >
        <Text
          size="md"
          dangerouslySetInnerHTML={{
            __html: t('late-payment.description', {
              cohort_name: lateModalProps.data[0]?.cohort?.name,
              academy_name: lateModalProps.data?.[0]?.cohort?.academy?.name,
            }),
          }}
        />
      </SimpleModal>
      <Flex minHeight="81vh" flexDirection={{ base: 'column', md: 'row' }} gridGap="2rem" maxWidth="1200px" flexFlow={{ base: 'column-reverse', md: '' }} width="100%" margin="0 auto" padding={{ base: '0 10px', md: '0 40px' }}>
        <Box flex={{ base: 1, md: 0.7 }}>
          <Flex flexDirection={{ base: 'column-reverse', md: 'row' }} gridGap={{ base: '1rem', md: '3.5rem' }} position="relative">
            <Box width="100%" flex={{ base: 1, md: 0.7 }}>
              <Heading
                fontWeight={800}
                size="xl"
              >
                {user?.first_name ? t('welcome-back-user', { name: user?.first_name }) : t('welcome')}
              </Heading>

              {invites?.length > 0 && (
                <Box
                  margin="25px 0 0 0"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  padding="16px 20px"
                  borderRadius="18px"
                  background="yellow.light"
                >
                  <Text
                    color="black"
                    display="flex"
                    flexDirection="row"
                    gridGap="15px"
                    width="100%"
                    justifyContent="space-between"
                    size="md"
                  >
                    {t('invite.notify', { cohortInvitationWord: inviteWord() })}
                  </Text>
                  <Text
                    as="button"
                    size="md"
                    fontWeight="bold"
                    textAlign="left"
                    gridGap="5px"
                    _focus={{
                      boxShadow: '0 0 0 3px rgb(66 153 225 / 60%)',
                    }}
                    color="blue.default"
                    display="flex"
                    alignItems="center"
                    onClick={() => setShowInvites(!showInvites)}
                  >
                    {showInvites ? t('invite.hide') : t('invite.show')}
                    <Icon
                      icon="arrowDown"
                      width="20px"
                      height="20px"
                      style={{ transform: showInvites ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </Text>
                </Box>
              )}

              {showInvites && invites.map((item) => {
                const { id, type } = item;
                return (
                  <TaskBar
                    key={`invites-${id}`}
                    data={{
                      title: type === 'invite' ? item.cohort.name : item.academy.name,
                    }}
                    containerStyle={{
                      background: '#FFF4DC',
                    }}
                    rightItemHandler={(
                      <Button
                        color="blue.default"
                        borderColor="blue.default"
                        textTransform="uppercase"
                        onClick={() => {
                          if (type === 'invite') acceptInvite({ id });
                          else acceptProfileAcademy({ id });
                        }}
                        isLoading={loadingInvite === id}
                        gridGap="8px"
                      >
                        <Text color="blue.default" size="15px">
                          {t('invite.accept')}
                        </Text>
                      </Button>
                    )}
                  />
                );
              })}
            </Box>
          </Flex>

          <Box>
            {!isLoading && (
              <ChooseProgram chooseList={cohorts.filter(isMainCohort)} setLateModalProps={setLateModalProps} />
            )}
          </Box>
          {isRevalidating && (
            <Box
              display="grid"
              mt="1rem"
              gridTemplateColumns={cardColumnSize}
              gridColumnGap="4rem"
              gridRowGap="3rem"
              height="auto"
            >
              {Array(1).fill(0).map((_, i) => (
                <SimpleSkeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${i}-skeleton-revalidating`}
                  width="100%"
                  height="286px"
                  color="white"
                  borderRadius="17px"
                />
              ))}
            </Box>
          )}
          {isLoading && (
            <Box
              display="grid"
              mt="1rem"
              gridTemplateColumns={cardColumnSize}
              gridColumnGap="4rem"
              gridRowGap="3rem"
              height="auto"
            >
              {Array(3).fill(0).map((_, i) => (
                <SimpleSkeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${i}-skeleton-loading`}
                  width="100%"
                  height="286px"
                  color="white"
                  borderRadius="17px"
                />
              ))}
            </Box>
          )}
        </Box>
        <Flex flexDirection="column" gridGap="42px" flex={{ base: 1, md: 0.3 }}>
          <Box zIndex={10}>
            <LiveEvent
              featureLabel={t('common:live-event.title')}
              featureReadMoreUrl={t('common:live-event.readMoreUrl')}
              mainClasses={liveClasses?.length > 0 ? liveClasses : []}
              otherEvents={events}
              margin="0 auto"
              cohorts={cohorts}
            />
          </Box>
          <Box zIndex={10}>
            {!mentorshipServices.isLoading && mentorshipServices?.data?.length > 0 && (
              <SupportSidebar
                allCohorts={cohorts}
                allSyllabus={allSyllabus}
                services={mentorshipServices.data}
                subscriptions={allSubscriptions}
              />
            )}
          </Box>
          <Feedback />

          {cohorts.every((elem) => elem.available_as_saas) && (
            <NextChakraLink
              href={t('whats-app-link')}
              aria-label="4Geeks Academy community"
              target="blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              gridGap="30px"
              padding="1.2rem"
              borderRadius="17px"
              border="1px solid"
              justifyContent="space-between"
              borderColor={hexColor.borderColor}
            >
              <Flex gridGap="30px" alignItems="center">
                <Icon icon="whatsapp" width="20px" height="20px" />
                <Text size="15px" fontWeight={700}>
                  {t('sidebar.join-our-community')}
                </Text>
              </Flex>
              <Icon icon="external-link" width="19px" height="18px" color="currentColor" />
            </NextChakraLink>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default asPrivate(chooseProgram);
