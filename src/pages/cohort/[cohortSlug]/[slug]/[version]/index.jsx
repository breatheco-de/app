/* eslint-disable no-unused-vars */
import {
  useEffect, useState,
} from 'react';
import {
  Box, Flex, Container, useToast,
  Checkbox, Input, InputGroup, InputRightElement, IconButton,
  keyframes, usePrefersReducedMotion, Avatar,
  Img, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import {
  languageFix,
  slugify,
  includesToLowerCase,
  getStorageItem,
  sortToNearestTodayDate,
  getBrowserSize,
  calculateDifferenceDays,
  adjustNumberBeetwenMinMax,
  isValidDate,
  getBrowserInfo,
} from '../../../../../utils/index';
import ReactPlayerV2 from '../../../../../common/components/ReactPlayerV2';
import NextChakraLink from '../../../../../common/components/NextChakraLink';
import TagCapsule from '../../../../../common/components/TagCapsule';
import SyllabusModule from '../../../../../common/components/SyllabusModule';
import CohortHeader from '../../../../../common/components/CohortHeader';
import CohortPanel from '../../../../../common/components/CohortPanel';
import CohortSideBar from '../../../../../common/components/CohortSideBar';
import Icon from '../../../../../common/components/Icon';
import SupportSidebar from '../../../../../common/components/SupportSidebar';
import TeacherSidebar from '../../../../../common/components/TeacherSidebar';
import CallToAction from '../../../../../common/components/CallToAction';
import ProgressBar from '../../../../../common/components/ProgressBar';
import Heading from '../../../../../common/components/Heading';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import useAuth from '../../../../../common/hooks/useAuth';
import useRigo from '../../../../../common/hooks/useRigo';
import { ModuleMapSkeleton, SimpleSkeleton } from '../../../../../common/components/Skeleton';
import { parseQuerys } from '../../../../../utils/url';
import bc from '../../../../../common/services/breathecode';
import axios from '../../../../../axios';

import { reportDatalayer } from '../../../../../utils/requests';
import { BREATHECODE_HOST } from '../../../../../utils/variables';
import ModalInfo from '../../../../../common/components/ModalInfo';
import Text from '../../../../../common/components/Text';
import OnlyFor from '../../../../../common/components/OnlyFor';
import AlertMessage from '../../../../../common/components/AlertMessage';
import useCohortHandler from '../../../../../common/hooks/useCohortHandler';
import LiveEvent from '../../../../../common/components/LiveEvent';
import FinalProject from '../../../../../common/components/FinalProject';
import useStyle from '../../../../../common/hooks/useStyle';
import Feedback from '../../../../../common/components/Feedback';
import ReviewModal, { stages } from '../../../../../common/components/ReviewModal';

function Dashboard() {
  const { t, lang } = useTranslation('dashboard');
  const toast = useToast();
  const router = useRouter();

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [studentAndTeachers, setSudentAndTeachers] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [grantAccess, setGrantAccess] = useState(false);

  const [searchValue, setSearchValue] = useState(router.query.search || '');
  const [showPendingTasks, setShowPendingTasks] = useState(false);
  const [events, setEvents] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoadingAssigments, setIsLoadingAssigments] = useState(true);
  const { isAuthenticated, cohorts } = useAuth();
  const { rigo, isRigoInitialized } = useRigo();

  const isBelowTablet = getBrowserSize()?.width < 768;
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState(null);
  const [isAvailableToShowWarningModal, setIsAvailableToShowModalMessage] = useState(false);
  const [deletionOrders, setDeletionOrders] = useState([]);
  const [showDeletionOrdersModal, setShowDeletionOrdersModal] = useState(false);
  const {
    state, getCohortUserCapabilities, getCohortData, getDailyModuleData,
    getMandatoryProjects, getTasksWithoutCohort, setCohortSession,
    cohortProgram, taskTodo, addTasks, sortedAssignments, handleOpenReviewModal, handleCloseReviewModal,
  } = useCohortHandler();

  const { cohortSession, taskCohortNull, cohortsAssignments, reviewModalState } = state;

  const {
    featuredColor, hexColor, modal, featuredLight, borderColor, disabledColor2, fontColor2, fontColor3, lightColor, backgroundColor2, backgroundColor3,
  } = useStyle();

  const isAvailableAsSaas = cohortSession?.available_as_saas;
  const hasMicroCohorts = cohortSession?.micro_cohorts?.length > 0;

  const mainTechnologies = cohortProgram?.main_technologies
    ? cohortProgram.main_technologies.split(',').map((el) => el.trim())
    : [];

  const academyOwner = cohortProgram?.academy_owner;

  const { cohortSlug } = router.query;

  const prefersReducedMotion = usePrefersReducedMotion();
  const slideLeft = keyframes`
  from {
    -webkit-transform: translateX(30px);
            transform: translateX(30px);
  }
  to {
    -webkit-transform: translateX(0px);
            transform: translateX(0px);
  }
`;
  const slideLeftAnimation = prefersReducedMotion
    ? undefined
    : `${slideLeft} 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both`;

  const accessToken = getStorageItem('accessToken');
  const showGithubWarning = getStorageItem('showGithubWarning');
  const TwelveHours = 720;

  const profesionalRoles = ['TEACHER', 'ASSISTANT', 'REVIEWER'];
  const cohortUserDaysCalculated = calculateDifferenceDays(cohortSession?.cohort_user?.created_at);

  if (cohortSession?.academy?.id) {
    axios.defaults.headers.common.Academy = cohortSession.academy.id;
  }

  const syncTaskWithCohort = async () => {
    const tasksToUpdate = ((taskCohortNull !== undefined) && taskCohortNull).map((task) => ({
      id: task.id,
      cohort: cohortSession.id,
    }));
    await bc.todo().updateBulk(tasksToUpdate)
      .then(({ data }) => {
        addTasks(data, cohortSession);
        setModalIsOpen(false);
      })
      .catch(() => {
        setModalIsOpen(false);
        toast({
          position: 'top',
          title: t('alert-message:task-cant-sync-with-cohort'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const removeUnsyncedTasks = async () => {
    const idsParsed = ((taskCohortNull !== undefined) && taskCohortNull).map((task) => task.id).join(','); // 23,2,45,45
    await bc.todo({
      id: idsParsed,
    }).deleteBulk()
      .then(() => {
        toast({
          position: 'top',
          title: t('alert-message:unsynced-tasks-removed'),
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setModalIsOpen(false);
      })
      .catch(() => {
        toast({
          position: 'top',
          title: t('alert-message:unsynced-tasks-cant-be-removed'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const checkNavigationAvailability = () => {
    const showToastAndRedirect = (programSlug) => {
      const querys = parseQuerys({
        plan: programSlug,
      });
      router.push(`/${lang}/checkout${querys}`);
      toast({
        position: 'top',
        title: t('alert-message:access-denied'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    };

    if (allSubscriptions) {
      const currentSessionSubs = allSubscriptions?.filter((sub) => sub.academy?.id === cohortSession?.academy?.id);
      const cohortSubscriptions = currentSessionSubs?.filter((sub) => sub.selected_cohort_set?.cohorts.some((cohort) => cohort.id === cohortSession.id));
      const currentCohortSlug = cohortSubscriptions[0]?.selected_cohort_set?.slug;

      if (cohortSubscriptions.length === 0) {
        showToastAndRedirect(currentCohortSlug);
        return;
      }

      const expiredCourse = cohortSubscriptions.find((sub) => sub.status === 'EXPIRED' || sub.status === 'ERROR');
      const fullyPaidSub = cohortSubscriptions.find((sub) => sub.status === 'FULLY_PAID' || sub.status === 'ACTIVE');
      if (expiredCourse && !fullyPaidSub) {
        showToastAndRedirect(currentCohortSlug);
        return;
      }

      if (fullyPaidSub) {
        setGrantAccess(true);
        return;
      }

      const freeTrialSub = cohortSubscriptions.find((sub) => sub.status === 'FREE_TRIAL');
      const freeTrialExpDate = new Date(freeTrialSub?.valid_until);
      const todayDate = new Date();

      if (todayDate > freeTrialExpDate) {
        showToastAndRedirect(currentCohortSlug);
        return;
      }

      setGrantAccess(true);
    }
  };

  useEffect(() => {
    if (cohortSession?.available_as_saas === true && cohortSession.cohort_user.role === 'STUDENT') {
      checkNavigationAvailability();
    }
    if (cohortSession?.cohort_user?.role !== 'STUDENT' || cohortSession?.available_as_saas === false) setGrantAccess(true);
  }, [cohortSession, allSubscriptions]);

  useEffect(() => {
    if (cohortSession?.cohort_user) {
      if (cohortSession.cohort_user.finantial_status === 'LATE' || cohortSession.cohort_user.educational_status === 'SUSPENDED') {
        router.push('/choose-program');
      } else {
        const isReadyToShowGithubMessage = cohorts.some(
          (l) => l.cohort_user.educational_status === 'ACTIVE' && l.available_as_saas === false,
        );
        setIsAvailableToShowModalMessage(isReadyToShowGithubMessage);
      }
    }
  }, [cohortSession]);

  useEffect(() => {
    if (showGithubWarning === 'active') {
      setShowWarningModal(true);
    }
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
      cohort: cohortSlug,
    }).liveClass()
      .then((res) => {
        const validatedEventList = res?.data?.length > 0
          ? res?.data?.filter((l) => isValidDate(l?.starting_at) && isValidDate(l?.ending_at))
          : [];
        const sortDateToLiveClass = sortToNearestTodayDate(validatedEventList, TwelveHours);
        const existentLiveClasses = sortDateToLiveClass?.filter((l) => l?.hash && l?.starting_at && l?.ending_at);
        setLiveClasses(existentLiveClasses);
      });

    bc.payment({
      status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE,EXPIRED,ERROR',
    }).subscriptions()
      .then(async ({ data }) => {
        const currentPlanFinancing = data?.plan_financings?.find((s) => s?.selected_cohort_set?.cohorts.some((cohort) => cohort?.slug === cohortSlug));
        const currentSubscription = data?.subscriptions?.find((s) => s?.selected_cohort_set?.cohorts.some((cohort) => cohort?.slug === cohortSlug));
        const planData = currentPlanFinancing || currentSubscription;
        const planSlug = planData?.plans?.[0]?.slug;
        const planOffer = await bc.payment({
          original_plan: planSlug,
        }).planOffer().then((res) => res?.data);

        const currentPlanOffer = planOffer?.find((p) => p?.original_plan?.slug === planSlug);

        const finalData = {
          ...planData,
          planOfferExists: currentPlanOffer !== undefined,
        };

        const planFinancings = data?.plan_financings?.length > 0 ? data?.plan_financings : [];
        const subscriptions = data?.subscriptions?.length > 0 ? data?.subscriptions : [];

        setAllSubscriptions([...planFinancings, ...subscriptions]);
        setSubscriptionData(finalData);

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

  const countDoneAssignments = (total, assignment) => {
    if (assignment.task_status === 'DONE') return total + 1;
    return total;
  };

  const cohortContextGenerator = (cohort, modules) => {
    let context = '';
    const allAssignments = modules.flatMap((module) => module.content);

    const assignmentsDone = allAssignments.reduce(countDoneAssignments, 0);
    const toalAssignments = modules.reduce((total, module) => total + module.content.length, 0);
    context = `
      Duration in hours: ${cohort.syllabus_version?.duration_in_hours}
      assignments: ${assignmentsDone} done out of ${toalAssignments}
      modules:
      ${modules.map(({ label, description }) => `
        - Title: ${typeof label === 'object' ? (label[lang] || label.us) : label}
          description: ${typeof description === 'object' ? (description[lang] || description.us) : description}
      `)}
    `;
    return context;
  };

  const fetchDeletionOrders = async () => {
    try {
      const resp = await bc.assignments({ status: 'transferring' }).getDeletionOrders();
      const { data } = resp;
      if (resp.status < 400) {
        setDeletionOrders(data);
      }
    } catch (err) {
      console.error('Error fetching deletion orders:', err);
    }
  };

  // Fetch cohort data with pathName structure
  useEffect(() => {
    if (isRigoInitialized && cohortSession && cohortSession.cohort_user?.role === 'STUDENT' && !isLoadingAssigments) {
      let context = '';
      if (hasMicroCohorts) {
        const modulesPerProgram = cohorts.filter((cohort) => cohortSession.micro_cohorts.some((microCohort) => microCohort.slug === cohort.slug))
          .map((cohort) => {
            const cohortContext = cohortContextGenerator(cohort, cohortsAssignments[cohort.slug]?.modules);
            return `
            - ${cohort.slug}:
              ${cohortContext}
          `;
          });
        context = `
          programs: ${cohortSession.micro_cohorts.map(({ name }) => name).join(', ')}
          Modules per program:
            ${modulesPerProgram}
        `;
      } else {
        context = cohortContextGenerator(cohortSession, sortedAssignments);
      }
      rigo.updateOptions({
        showBubble: false,
        context,
      });

      fetchDeletionOrders();
    }
  }, [isRigoInitialized, cohortSession, isLoadingAssigments]);

  const getUserData = async () => {
    try {
      setIsLoadingAssigments(true);
      const cohort = await getCohortData({ cohortSlug });
      if (cohort) {
        reportDatalayer({
          dataLayer: {
            current_cohort_id: cohort.id,
            current_cohort_slug: cohort.slug,
            agent: getBrowserInfo(),
          },
        });
      }
      if (certificates.length === 0) {
        const { data } = await bc.certificate().get();
        setCertificates(data);
      }

      await getCohortUserCapabilities({
        cohort,
      });
    } finally {
      setIsLoadingAssigments(false);
    }
  };

  // Fetch cohort data with pathName structure
  useEffect(() => {
    if (isAuthenticated) {
      getUserData();
    }
  }, [isAuthenticated]);

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      setCohortSession(null);
    };
  }, []);

  // Students and Teachers data
  useEffect(() => {
    if (cohortSession?.id) {
      bc.cohort().getStudents(cohortSlug).then(({ data }) => {
        if (data && data.length > 0) {
          setSudentAndTeachers(data.sort(
            (a, b) => a.user.first_name.localeCompare(b.user.first_name),
          ).map((elem, index) => {
            const avatarNumber = adjustNumberBeetwenMinMax({
              number: index,
              min: 1,
              max: 20,
            });
            return {
              ...elem,
              user: {
                ...elem.user,
                profile: {
                  ...elem.user.profile,
                  avatar_url: elem?.user?.profile?.avatar_url || `${BREATHECODE_HOST}/static/img/avatar-${avatarNumber}.png`,
                },
              },
            };
          }));
        }
      }).catch((err) => {
        console.log(err);
        toast({
          position: 'top',
          title: t('alert-message:error-fetching-students-and-teachers'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
    }
  }, [cohortSession]);

  useEffect(() => {
    getTasksWithoutCohort({ setModalIsOpen });
  }, [sortedAssignments]);

  const dailyModuleData = getDailyModuleData() || '';
  // const lastTaskDoneModuleData = getLastDoneTaskModuleData() || '';

  const onlyStudentsActive = studentAndTeachers.filter(
    (x) => x.role === 'STUDENT' && x.educational_status === 'ACTIVE',
  ).map((student) => ({
    ...student,
    user: {
      ...student?.user,
      full_name: `${student?.user?.first_name} ${student?.user?.last_name}`,
    },
  }));

  const modulesExists = sortedAssignments.some(
    (assignment) => assignment.filteredContent && assignment.filteredContent.length !== 0,
  );

  const sortedAssignmentsSearched = (searchValue && searchValue.length > 0) ? sortedAssignments.filter((l) => {
    const { filteredContent } = l;
    const filtered = filteredContent.filter((module) => {
      const { title } = module;
      return title.toLowerCase().includes(searchValue.toLowerCase());
    });
    return filtered.length !== 0;
  }) : sortedAssignments;

  const mandatoryProjects = getMandatoryProjects();

  const cohortsOrder = cohortSession?.cohorts_order?.split(',');

  const sortMicroCohorts = (a, b) => {
    if (Array.isArray(cohortsOrder)) {
      return cohortsOrder.indexOf(a.id.toString()) - cohortsOrder.indexOf(b.id.toString());
    }
    return 0;
  };

  return (
    <Container minHeight="93vh" display="flex" flexDirection="column" maxW="none" padding="0">
      {deletionOrders.length > 0 && (
        <AlertMessage
          full
          type="warning"
          style={{ borderRadius: '0px', justifyContent: 'center' }}
        >
          <Text
            size="l"
            color="black"
            fontWeight="700"
          >
            {t('repository-deletion.warning')}
            {'  '}
            <Button
              variant="link"
              color="black"
              textDecoration="underline"
              fontWeight="700"
              fontSize="15px"
              height="20px"
              onClick={() => setShowDeletionOrdersModal(true)}
              _active={{ color: 'black' }}
            >
              {t('repository-deletion.see-repositories')}
            </Button>
          </Text>
        </AlertMessage>
      )}
      {cohortSession && !isAvailableAsSaas && mandatoryProjects && mandatoryProjects.length > 0 && (
        <AlertMessage
          full
          type="warning"
          style={{ borderRadius: '0px', justifyContent: 'center' }}
        >
          <Text
            size="l"
            color="black"
            fontWeight="700"
          >
            {t('deliverProject.mandatory-message', { count: mandatoryProjects.length })}
            {'  '}
            <Button
              variant="link"
              color="black"
              textDecoration="underline"
              fontWeight="700"
              fontSize="15px"
              height="20px"
              onClick={() => handleOpenReviewModal({ defaultStage: stages.pending_activities, fixedStage: true })}
              _active={{ color: 'black' }}
            >
              {t('deliverProject.see-mandatory-projects')}
            </Button>
          </Text>
        </AlertMessage>
      )}
      {subscriptionData?.id && subscriptionData?.status === 'FREE_TRIAL' && subscriptionData?.planOfferExists && (
        <AlertMessage
          full
          type="warning"
          style={{ borderRadius: '0px', justifyContent: 'center' }}
        >
          <Text
            size="l"
            color="black"
            dangerouslySetInnerHTML={{
              __html: t('free-trial-msg', { link: '/profile/subscriptions' }),
            }}
          />
        </AlertMessage>
      )}
      {isAvailableAsSaas && <CohortHeader />}
      <Container flex="1" background={isAvailableAsSaas && hexColor.lightColor4} maxW="none">
        <Box maxW="1280px" width="100%" margin="0 auto">
          <Box width="fit-content" paddingTop="18px" marginBottom="18px">
            <NextChakraLink
              href="/choose-program"
              display="flex"
              flexDirection="row"
              alignItems="center"
              fontWeight="700"
              gridGap="12px"
              color="#0097CF"
              _focus={{ boxShadow: 'none', color: '#0097CF' }}
            >
              <Icon
                icon="arrowLeft"
                width="20px"
                height="20px"
                style={{ marginRight: '7px' }}
                color="currentColor"
              />
              <span>
                {t('backToChooseProgram')}
              </span>
            </NextChakraLink>
          </Box>
          {cohortSession ? (
            <>
              {isAvailableAsSaas ? (
                <Box flex="1 1 auto" pb="20px">
                  {hasMicroCohorts && (
                    <Box display="flex" alignItems="center" gap="10px" mb="20px">
                      <Img borderRadius="full" src={cohortSession.syllabus_version?.logo} width="29px" height="29px" />
                      <Heading as="h1" size="m">
                        {cohortSession.name}
                      </Heading>
                    </Box>
                  )}

                  {!isLoadingAssigments ? (
                    <Box display="flex" flexDirection="column" gap="20px">
                      {hasMicroCohorts
                        ? cohorts.filter((cohort) => cohortSession.micro_cohorts.some((elem) => elem.slug === cohort.slug))
                          .sort(sortMicroCohorts)
                          .map((microCohort) => (
                            <CohortPanel
                              key={microCohort.slug}
                              cohort={microCohort}
                              modules={cohortsAssignments[microCohort.slug]?.modules}
                              tasks={cohortsAssignments[microCohort.slug]?.tasks}
                              mainCohort={cohortSession}
                              onOpenReviewModal={handleOpenReviewModal}
                              certificate={certificates.find((cert) => cert.cohort.id === microCohort.id)}
                            />
                          ))
                        : (
                          <CohortPanel openByDefault cohort={cohortSession} modules={sortedAssignments} certificate={certificates.find((cert) => cert.cohort.id === cohortSession.id)} />
                        )}
                    </Box>
                  ) : (
                    <Flex flexDirection="column" gap="20px">
                      <SimpleSkeleton
                        height="100px"
                        width="100%"
                        borderRadius="10px"
                      />
                      <SimpleSkeleton
                        height="100px"
                        width="100%"
                        borderRadius="10px"
                      />
                      <SimpleSkeleton
                        height="100px"
                        width="100%"
                        borderRadius="10px"
                      />
                    </Flex>
                  )}
                </Box>
              ) : (
                <Flex
                  justifyContent="space-between"
                  flexDirection={{
                    base: 'column', sm: 'column', md: 'row', lg: 'row',
                  }}
                >
                  <Box width="100%" minW={{ base: 'auto', md: 'clamp(300px, 60vw, 770px)' }}>
                    {(cohortSession?.syllabus_version?.name || cohortProgram?.name) && grantAccess ? (
                      <Heading as="h1" size="xl">
                        {cohortSession?.syllabus_version?.name || cohortProgram.name}
                      </Heading>
                    ) : (
                      <SimpleSkeleton
                        height="60px"
                        width="100%"
                        borderRadius="10px"
                      />
                    )}

                    {mainTechnologies && grantAccess ? (
                      <TagCapsule variant="rounded" gridGap="10px" containerStyle={{ padding: '0px' }} tags={mainTechnologies} style={{ padding: '6px 10px' }} />
                    ) : (
                      <SimpleSkeleton
                        height="34px"
                        width="290px"
                        padding="6px 18px 6px 18px"
                        margin="18px 0"
                        borderRadius="30px"
                      />
                    )}
                    {isBelowTablet && (
                    <Box
                      display={{ base: 'flex', md: 'none' }}
                      flexDirection="column"
                      gridGap="30px"
                    >
                      <OnlyFor onlyTeachers capabilities={['academy_reporting', 'classroom_activity', 'read_cohort_activity']}>
                        <TeacherSidebar
                          title={t('teacher-sidebar.actions')}
                          students={onlyStudentsActive}
                          width="100%"
                        />
                      </OnlyFor>
                      {academyOwner?.white_labeled && (
                      <Box
                        className="white-label"
                        borderRadius="md"
                        padding="10px"
                        display="flex"
                        justifyContent="space-around"
                        bg={featuredColor}
                      >
                        <Avatar
                          name={academyOwner.name}
                          src={academyOwner.icon_url}
                        />
                        <Box className="white-label-text" width="80%">
                          <Text size="md" fontWeight="700" marginBottom="5px">
                            {academyOwner.name}
                          </Text>
                          <Text size="sm">
                            {t('whiteLabeledText')}
                          </Text>
                        </Box>
                      </Box>
                      )}
                      <LiveEvent
                        featureLabel={t('common:live-event.title')}
                        featureReadMoreUrl={t('common:live-event.readMoreUrl')}
                        mainClasses={liveClasses?.length > 0 ? liveClasses : []}
                        otherEvents={events}
                        cohorts={cohortSession ? [{ role: cohortSession.cohort_user.role, cohort: cohortSession }] : []}
                      />

                      {cohortSession?.kickoff_date && (
                      <CohortSideBar
                        teacherVersionActive={profesionalRoles.includes(cohortSession?.cohort_user?.role)}
                        studentAndTeachers={studentAndTeachers}
                        width="100%"
                      />
                      )}
                      {cohortSession?.cohort_user?.role?.toLowerCase() === 'student' && (
                      <SupportSidebar
                        allCohorts={[{
                          cohort: {
                            ...cohortSession,
                            ...cohortSession?.cohort_user,
                          },
                        }]}
                        subscriptions={allSubscriptions}
                        subscriptionData={subscriptionData}
                      />
                      )}
                    </Box>
                    )}
                    {cohortSession?.intro_video && cohortUserDaysCalculated?.isRemainingToExpire === false && (
                    <>
                      {grantAccess ? (
                        <Accordion defaultIndex={cohortUserDaysCalculated?.result <= 3 ? [0] : [1]} allowMultiple>
                          <AccordionItem background={featuredColor} borderRadius="17px" border="0">
                            {({ isExpanded }) => (
                              <>
                                <span>
                                  <AccordionButton display="flex" gridGap="16px" padding="10.5px 20px" borderRadius="17px">
                                    <Icon icon="cameraFilled" width="29px" height="16px" color="#0097CF" />
                                    <Box as="span" fontSize="21px" fontWeight={700} flex="1" textAlign="left">
                                      {t('intro-video-title')}
                                    </Box>
                                    <Icon icon="arrowRight" width="11px" height="20px" color="currentColor" style={{}} transform={isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'} transition="transform 0.2s ease-in" />
                                  </AccordionButton>
                                </span>
                                <AccordionPanel padding="0px 4px 4px 4px">
                                  <ReactPlayerV2
                                    className="intro-video"
                                    url={cohortSession?.intro_video}
                                  />
                                </AccordionPanel>
                              </>
                            )}
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <SimpleSkeleton
                          height="450px"
                          padding="6px 18px 6px 18px"
                          margin="18px 0"
                          borderRadius="30px"
                        />
                      )}
                    </>
                    )}

                    {!cohortSession?.available_as_saas && cohortSession?.current_module && dailyModuleData && (
                    <CallToAction
                      background="blue.default"
                      margin="40px 0 auto 0"
                      title={t('callToAction.title')}
                      href={`#${slugify(dailyModuleData.label)}`}
                      text={languageFix(dailyModuleData.description, lang)}
                      buttonText={t('callToAction.buttonText')}
                      width={{ base: '100%', md: 'fit-content' }}
                    />
                    )}

                    {(!cohortSession?.intro_video || ['TEACHER', 'ASSISTANT'].includes(cohortSession?.cohort_user?.role) || (cohortUserDaysCalculated?.isRemainingToExpire === false && cohortUserDaysCalculated?.result >= 3)) && (
                    <Box marginTop="36px">
                      <ProgressBar
                        cohortProgram={cohortProgram}
                        taskTodo={taskTodo}
                        progressText={t('progressText')}
                        width="100%"
                      />
                    </Box>
                    )}

                    <Box height="2px" bg={borderColor} marginY="32px" />

                    <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" gridGap="18px">
                      <Heading as="h2" fontWeight="900" size="15px" textTransform="uppercase">{t('moduleMap')}</Heading>

                      <Box display="flex" alignItems="center">
                        <InputGroup>
                          <Input
                            borderRadius="25px"
                            type="text"
                            value={searchValue}
                            backgroundColor={backgroundColor2}
                            style={{
                              cursor: 'default',
                              opacity: showSearch ? 1 : 0,
                            }}
                            isDisabled={!showSearch}
                            animation={showSearch ? slideLeftAnimation : ''}
                            onChange={(e) => setSearchValue(e.target.value)}
                            color={disabledColor2}
                            _focus={{
                              color: fontColor3,
                              backgroundColor: backgroundColor3,
                            }}
                            _hover={{
                              color: fontColor3,
                              backgroundColor: backgroundColor3,
                            }}
                          />
                          <InputRightElement>
                            <IconButton onClick={() => setShowSearch(!showSearch)} pr="8px" background="transparent" _hover={{ background: 'transparent' }} _active={{ background: 'transparent' }} aria-label="Search in modules" icon={<Icon icon="search" color={showSearch ? hexColor.black : ''} width="18px" height="18px" />} />
                          </InputRightElement>
                        </InputGroup>
                        {modulesExists && (
                        <Checkbox onChange={(e) => setShowPendingTasks(e.target.checked)} textAlign="right" gridGap="10px" display="flex" flexDirection="row-reverse" color={lightColor}>
                          {t('modules.show-pending-tasks')}
                        </Checkbox>
                        )}
                      </Box>
                    </Box>
                    <Box
                      id="module-map"
                      marginTop="30px"
                      gridGap="24px"
                      display="flex"
                      flexDirection="column"
                    >
                      {sortedAssignments && sortedAssignments.length >= 1 && !isLoadingAssigments && grantAccess ? (
                        <>
                          {sortedAssignmentsSearched.map((module, i) => {
                            const {
                              label, description, filteredContent, exists_activities: existsActivities, content, filteredContentByPending,
                            } = module;

                            const filteredModulesSearched = searchValue && searchValue.length > 0
                              ? filteredContent.filter(
                                (l) => includesToLowerCase(l.title, searchValue),
                              )
                              : filteredContent;

                            const filteredModulesByPendingSearched = searchValue && searchValue.length > 0
                              ? filteredContentByPending.filter(
                                (l) => includesToLowerCase(l.title, searchValue),
                              )
                              : filteredContentByPending;

                            const index = i;
                            return (
                              <SyllabusModule
                                key={index}
                                existsActivities={existsActivities}
                                cohortData={cohortSession}
                                index={index}
                                title={label}
                                slug={slugify(label)}
                                searchValue={searchValue}
                                description={description}
                                content={content}
                                filteredContent={filteredModulesSearched}
                                showPendingTasks={showPendingTasks}
                                filteredContentByPending={filteredModulesByPendingSearched}
                              />
                            );
                          })}
                          {sortedAssignmentsSearched && sortedAssignmentsSearched.length <= 0 && (
                          <Text size="l">
                            {t('modules.search-not-found')}
                          </Text>
                          )}
                        </>
                      ) : <ModuleMapSkeleton />}

                    </Box>

                  </Box>
                  <Box width="5rem" />

                  {!isBelowTablet && (
                  <Box
                    display={{ base: 'none', md: 'flex' }}
                    flexDirection="column"
                    gridGap="30px"
                    maxWidth="380px"
                    minWidth={{ base: 'auto', md: 'clamp(250px, 32vw, 380px)' }}
                  >
                    <OnlyFor onlyTeachers capabilities={['academy_reporting', 'classroom_activity', 'read_cohort_activity']}>
                      <TeacherSidebar
                        title={t('teacher-sidebar.actions')}
                        students={onlyStudentsActive}
                        width="100%"
                      />
                    </OnlyFor>
                    {cohortSession?.stage === 'FINAL_PROJECT' && (
                    <FinalProject
                      tasks={taskTodo}
                      studentAndTeachers={onlyStudentsActive}
                      isStudent={!profesionalRoles.includes(cohortSession?.cohort_user?.role)}
                    />
                    )}
                    {academyOwner?.white_labeled && (
                    <Box
                      className="white-label"
                      borderRadius="md"
                      padding="10px"
                      display="flex"
                      justifyContent="space-around"
                      bg={featuredColor}
                    >
                      <Avatar
                        name={academyOwner.name}
                        src={academyOwner.icon_url}
                      />
                      <Box className="white-label-text" width="80%">
                        <Text size="md" fontWeight="700" marginBottom="5px">
                          {academyOwner.name}
                        </Text>
                        <Text size="sm">
                          {t('whiteLabeledText')}
                        </Text>
                      </Box>
                    </Box>
                    )}
                    <LiveEvent
                      featureLabel={t('common:live-event.title')}
                      featureReadMoreUrl={t('common:live-event.readMoreUrl')}
                      mainClasses={liveClasses?.length > 0 ? liveClasses : []}
                      otherEvents={events}
                      cohorts={cohortSession ? [cohortSession] : []}
                    />
                    {cohortSession?.kickoff_date && (
                    <CohortSideBar
                      teacherVersionActive={profesionalRoles.includes(cohortSession?.cohort_user?.role)}
                      studentAndTeachers={studentAndTeachers}
                      width="100%"
                    />
                    )}
                    {cohortSession?.cohort_user?.role?.toLowerCase() === 'student' && (
                    <SupportSidebar
                      allCohorts={[{
                        cohort: {
                          ...cohortSession,
                          ...cohortSession?.cohort_user,
                        },
                      }]}
                      subscriptions={allSubscriptions}
                      subscriptionData={subscriptionData}
                    />
                    )}
                    <Feedback />
                  </Box>
                  )}
                </Flex>
              )}
            </>
          ) : (
            <ModuleMapSkeleton />
          )}
        </Box>
      </Container>
      {showGithubWarning === 'active' && (
        <Modal
          isOpen={showWarningModal}
          size="md"
          margin="0 10px"
          onClose={() => {
            setShowWarningModal(false);
            localStorage.setItem('showGithubWarning', 'postponed');
          }}
        >
          <ModalOverlay />
          <ModalContent background={modal.background3} style={{ margin: '3rem 0 0 0' }}>
            <ModalHeader color={fontColor2} borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={borderColor} textAlign="center">
              {t('warningModal.title')}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody padding={{ base: '15px 22px' }}>
              <Text textAlign="center" fontSize="14px" lineHeight="24px" marginBottom="15px" fontWeight="400">
                {t('warningModal.sub-title')}
              </Text>
              {isAvailableToShowWarningModal && (
                <Flex flexDirection="column" gridGap="10px" marginBottom="25px">
                  <Text color={lightColor} fontSize="12px" lineHeight="auto">
                    {t('warningModal.text')}
                  </Text>
                  <Text
                    color={lightColor}
                    fontSize="12px"
                    lineHeight="auto"
                    dangerouslySetInnerHTML={{
                      __html: t('warningModal.text2'),
                    }}
                  />
                </Flex>
              )}
              <Button
                textAlign="center"
                variant="outline"
                margin="auto"
                fontSize="13px"
                fontWeight="700"
                display="flex"
                width="100%"
                marginBottom="15px"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `${BREATHECODE_HOST}/v1/auth/github/${accessToken}?url=${window.location.href}`;
                }}
              >
                <Icon
                  icon="github"
                  width="16px"
                  height="16px"
                  style={{ marginRight: '5px' }}
                />
                {' '}
                {t('warningModal.connect')}
              </Button>
              <Button
                textAlign="center"
                variant="link"
                margin="auto"
                fontSize="15px"
                lineHeight="22px"
                fontWeight="700"
                display="block"
                color={fontColor2}
                onClick={() => {
                  setShowWarningModal(false);
                  localStorage.setItem('showGithubWarning', 'postponed');
                }}
              >
                {t('warningModal.skip')}
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      <ReviewModal
        isOpen={reviewModalState.isOpen}
        isStudent
        onClose={handleCloseReviewModal}
        {...reviewModalState}
      />
      <ModalInfo
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        title={t('unsynced.title', { taskLength: taskCohortNull && taskCohortNull.length })}
        description={t('unsynced.description')}
        handlerColorButton="blue"
        rejectHandler={() => removeUnsyncedTasks()}
        forceHandler
        rejectData={{
          title: t('unsynced.reject-unsync-title'),
          closeText: t('unsynced.cancel'),
          handlerText: t('unsynced.confirm'),
        }}
        closeText={t('unsynced.unsync')}
        actionHandler={() => syncTaskWithCohort()}
        handlerText={t('unsynced.sync')}
      />
      {/* Add Deletion Orders Modal */}
      <Modal
        isOpen={showDeletionOrdersModal}
        size="md"
        margin="0 10px"
        onClose={() => {
          setShowDeletionOrdersModal(false);
        }}
      >
        <ModalOverlay />
        <ModalContent style={{ margin: '3rem 0 0 0' }}>
          <ModalHeader pb="0" fontSize="15px" textTransform="uppercase" borderColor={borderColor}>
            {t('repository-deletion.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody padding={{ base: '15px 22px' }}>
            <Box>
              <Box marginBottom="15px" padding="10px" border="1px solid" borderColor={borderColor} borderRadius="8px" backgroundColor={featuredLight}>
                <Text fontSize="14px" lineHeight="24px" fontWeight="400">
                  {t('repository-deletion.description')}
                </Text>
              </Box>
              {deletionOrders.map((order) => {
                let daysLeft;
                if (order.starts_transferring_at) {
                  const startDate = new Date(order.starts_transferring_at);
                  const deletionDate = new Date(startDate.setMonth(startDate.getMonth() + 2));
                  const today = new Date();
                  daysLeft = Math.ceil((deletionDate - today) / (1000 * 60 * 60 * 24));
                }

                return (
                  <Flex
                    key={order.repository_name}
                    fontSize="14px"
                    padding="10px"
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <NextChakraLink
                      href={`https://github.com/${order.repository_user}/${order.repository_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {order.repository_name}
                    </NextChakraLink>
                    {typeof daysLeft === 'number' && (
                      <Text fontWeight="700">
                        {daysLeft > 0 ? `${t('repository-deletion.days-left', { days: daysLeft })}` : t('repository-deletion.deletion-imminent')}
                      </Text>
                    )}
                  </Flex>
                );
              })}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default asPrivate(Dashboard);
