/* eslint-disable no-unused-vars */
import {
  useEffect, useState, useRef,
} from 'react';
import {
  Box, Flex, Container,
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
import ReactPlayerV2 from '../../../../../components/ReactPlayerV2';
import NextChakraLink from '../../../../../components/NextChakraLink';
import TagCapsule from '../../../../../components/TagCapsule';
import SyllabusModule from '../../../../../components/SyllabusModule';
import CohortHeader from '../../../../../components/CohortHeader';
import CohortPanel from '../../../../../components/CohortPanel';
import CohortSideBar from '../../../../../components/CohortSideBar';
import Icon from '../../../../../components/Icon';
import SupportSidebar from '../../../../../components/SupportSidebar';
import TeacherSidebar from '../../../../../components/TeacherSidebar';
import CallToAction from '../../../../../components/CallToAction';
import ProgressBar from '../../../../../components/ProgressBar';
import Heading from '../../../../../components/Heading';
import asPrivate from '../../../../../context/PrivateRouteWrapper';
import useAuth from '../../../../../hooks/useAuth';
import useRigo from '../../../../../hooks/useRigo';
import { ModuleMapSkeleton, SimpleSkeleton } from '../../../../../components/Skeleton';
import bc from '../../../../../services/breathecode';
import axios from '../../../../../axios';
import { reportDatalayer } from '../../../../../utils/requests';
import { BREATHECODE_HOST } from '../../../../../utils/variables';
import ModalInfo from '../../../../../components/ModalInfo';
import Text from '../../../../../components/Text';
import OnlyFor from '../../../../../components/OnlyFor';
import useCohortHandler from '../../../../../hooks/useCohortHandler';
import useSubscriptions from '../../../../../hooks/useSubscriptions';
import LiveEvent from '../../../../../components/LiveEvent';
import FinalProject from '../../../../../components/FinalProject';
import useStyle from '../../../../../hooks/useStyle';
import Feedback from '../../../../../components/Feedback';
import useCustomToast from '../../../../../hooks/useCustomToast';
import ReviewModal, { stages } from '../../../../../components/ReviewModal';

function Dashboard() {
  const { t, lang } = useTranslation('dashboard');
  const { createToast, closeToast } = useCustomToast({ toastId: 'fetching-teachers-students-nsync-cohort' });
  const router = useRouter();

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [studentAndTeachers, setSudentAndTeachers] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSyncMicroModal, setShowSyncMicroModal] = useState(false);
  const [isSyncingMicro, setIsSyncingMicro] = useState(false);

  const [searchValue, setSearchValue] = useState(router.query.search || '');
  const [showPendingTasks, setShowPendingTasks] = useState(false);
  const [events, setEvents] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoadingAssigments, setIsLoadingAssigments] = useState(true);
  const { isAuthenticated, cohorts, reSetUserAndCohorts } = useAuth();
  const { rigo, isRigoInitialized } = useRigo();

  const isBelowTablet = getBrowserSize()?.width < 768;
  const [isAvailableToShowWarningModal, setIsAvailableToShowModalMessage] = useState(false);
  const [deletionOrders, setDeletionOrders] = useState([]);
  const [showDeletionOrdersModal, setShowDeletionOrdersModal] = useState(false);
  const {
    state, getCohortUserCapabilities, getCohortData, getDailyModuleData,
    getMandatoryProjects, getTasksWithoutCohort, setCohortSession,
    cohortProgram, taskTodo, addTasks, sortedAssignments, handleOpenReviewModal, handleCloseReviewModal,
    continueWhereYouLeft, checkNavigationAvailability, grantAccess, setGrantAccess, getCohortsModules,
  } = useCohortHandler();
  const { allSubscriptions, areSubscriptionsFetched } = useSubscriptions();

  const { cohortSession, taskCohortNull, cohortsAssignments, reviewModalState } = state;

  const {
    featuredColor, hexColor, modal, featuredLight, borderColor, disabledColor2, fontColor2, fontColor3, lightColor, backgroundColor2, backgroundColor3,
  } = useStyle();

  const { cohortSlug } = router.query;

  const isAvailableAsSaas = cohortSession?.available_as_saas;
  const hasMicroCohorts = cohortSession?.micro_cohorts?.length > 0;

  const mainTechnologies = cohortProgram?.main_technologies
    ? cohortProgram.main_technologies.split(',').map((el) => el.trim())
    : [];

  const currentSubscription = allSubscriptions.find((s) => s?.selected_cohort_set?.cohorts.some((cohort) => cohort?.slug === cohortSlug));
  const isSubscriptionFreeTrial = currentSubscription?.id && currentSubscription?.status === 'FREE_TRIAL' && currentSubscription?.planOffer;

  const academyOwner = cohortProgram?.academy_owner;

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
  const TwentyFourHours = 720;

  const profesionalRoles = ['TEACHER', 'ASSISTANT', 'REVIEWER'];
  const cohortUserDaysCalculated = calculateDifferenceDays(cohortSession?.cohort_user?.created_at);

  const [isVideoVisible, setIsVideoVisible] = useState(true);

  if (cohortSession?.academy?.id) {
    axios.defaults.headers.common.Academy = cohortSession.academy.id;
  }

  const syncTaskWithCohort = async () => {
    const tasksToUpdate = ((taskCohortNull !== undefined) && taskCohortNull).map((task) => ({
      id: task.id,
      cohort: cohortSession.id,
    }));

    try {
      const { data } = await bc.assignments().updateBulk(tasksToUpdate);
      addTasks(data, cohortSession);
      setModalIsOpen(false);
    } catch (error) {
      setModalIsOpen(false);
      createToast({
        position: 'top',
        title: t('alert-message:task-cant-sync-with-cohort'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const removeUnsyncedTasks = async () => {
    const idsParsed = ((taskCohortNull !== undefined) && taskCohortNull).map((task) => task.id).join(','); // 23,2,45,45
    try {
      await bc.assignments({
        id: idsParsed,
      }).deleteBulk();
      setModalIsOpen(false);
    } catch (err) {
      createToast({
        position: 'top',
        title: t('alert-message:unsynced-tasks-cant-be-removed'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated && areSubscriptionsFetched && cohortSession?.available_as_saas === true && cohortSession.cohort_user.role === 'STUDENT') {
      checkNavigationAvailability();
    }
    if (isAuthenticated && (cohortSession?.cohort_user?.role !== 'STUDENT' || cohortSession?.available_as_saas === false)) setGrantAccess(true);
  }, [cohortSession, areSubscriptionsFetched, isAuthenticated]);

  useEffect(() => {
    if (!cohortSession || !Array.isArray(cohortSession?.micro_cohorts) || cohortSession.micro_cohorts.length === 0) return;
    const ownsMacro = cohorts?.some((c) => c?.slug === cohortSession?.slug);
    if (!ownsMacro) return;
    const missingAnyMicro = cohortSession.micro_cohorts.some((mc) => !cohorts?.some((uc) => uc.slug === mc.slug));
    if (missingAnyMicro) setShowSyncMicroModal(true);
  }, [cohortSession?.slug, cohorts?.length]);

  const handleSyncMicroCohorts = async () => {
    if (!cohortSession?.slug) return;
    try {
      setIsSyncingMicro(true);
      const resp = await bc.admissions().syncMyMicroCohorts(cohortSession.slug);
      if (resp?.status < 400) {
        const { cohorts: updatedCohorts } = await reSetUserAndCohorts();

        const microCohorts = updatedCohorts.filter((c) => cohortSession.micro_cohorts.some((mc) => mc.slug === c.slug));
        await getCohortsModules(microCohorts);

        setShowSyncMicroModal(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsSyncingMicro(false);
    }
  };

  useEffect(() => {
    if (cohortSession?.cohort_user) {
      const isReadyToShowGithubMessage = cohorts.some(
        (l) => l.cohort_user.educational_status === 'ACTIVE' && l.available_as_saas === false,
      );
      setIsAvailableToShowModalMessage(isReadyToShowGithubMessage);
    }
  }, [cohortSession]);

  useEffect(() => {
    if (showGithubWarning === 'active') {
      setShowWarningModal(true);
    }
    bc.events({ upcoming: true, limit: 20 }).meOnlineEvents()
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
        const sortDateToLiveClass = sortToNearestTodayDate(validatedEventList, TwentyFourHours);
        const existentLiveClasses = sortDateToLiveClass?.filter((l) => l?.hash && l?.starting_at && l?.ending_at);
        setLiveClasses(existentLiveClasses);
      });
  }, []);

  console.log(liveClasses);

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
        if (Array.isArray(data) && data.length > 0) {
          setCertificates(data);
        }
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
      bc.admissions().getStudents(cohortSlug).then(({ data }) => {
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
        createToast({
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

  const hasShownMandatoryToast = useRef(false);
  const hasShownFreeTrialToast = useRef(false);
  const hasShownDeletionToast = useRef(false);

  const mandatoryProjects = getMandatoryProjects();
  const mandatoryProjectsCount = mandatoryProjects.length;

  useEffect(() => {
    if (isSubscriptionFreeTrial && !hasShownFreeTrialToast.current) {
      hasShownFreeTrialToast.current = true;
      createToast({
        position: 'top',
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('free-trial-msg', { link: '/profile/subscriptions' }),
            }}
          />
        ),
        status: 'warning',
        duration: 5000,
      });
    }
    if (mandatoryProjectsCount > 0 && !isSubscriptionFreeTrial && !hasShownMandatoryToast.current) {
      hasShownMandatoryToast.current = true;
      createToast({
        position: 'top',
        title: (
          <span>
            <span
              dangerouslySetInnerHTML={{
                __html: t('deliverProject.mandatory-message', { count: mandatoryProjectsCount }),
              }}
            />
            .
            <span
              role="button"
              tabIndex={0}
              onClick={() => {
                closeToast();
                handleOpenReviewModal({ defaultStage: stages.pending_activities, fixedStage: true });
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  closeToast();
                  handleOpenReviewModal({ defaultStage: stages.pending_activities, fixedStage: true });
                }
              }}
              style={{ textDecoration: 'underline', cursor: 'pointer', color: 'black', fontWeight: '700' }}
            >
              {t('deliverProject.see-mandatory-projects')}
            </span>
          </span>
        ),
        status: 'warning',
        duration: 5000,
      });
    }
    if (deletionOrders.length > 0 && !hasShownDeletionToast.current) {
      hasShownDeletionToast.current = true;
      createToast({
        position: 'top',
        title: (
          <span>
            {t('repository-deletion.description')}
            {' '}
            <span
              role="button"
              tabIndex={0}
              onClick={() => {
                closeToast();
                setShowDeletionOrdersModal(true);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  closeToast();
                  setShowDeletionOrdersModal(true);
                }
              }}
              style={{ textDecoration: 'underline', cursor: 'pointer', color: 'black', fontWeight: '700' }}
            >
              {t('repository-deletion.see-repositories')}
            </span>
          </span>
        ),
        status: 'warning',
        duration: 5000,
      });
    }
  }, [isSubscriptionFreeTrial, mandatoryProjectsCount, deletionOrders.length]);

  const dailyModuleData = getDailyModuleData() || '';

  const onlyStudentsActive = studentAndTeachers.filter(
    (x) => x.role === 'STUDENT' && x.educational_status === 'ACTIVE' && x.finantial_status !== 'LATE',
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

  const cohortsOrder = cohortSession?.cohorts_order?.split(',');

  const sortMicroCohorts = (a, b) => {
    if (Array.isArray(cohortsOrder)) {
      return cohortsOrder.indexOf(a.id.toString()) - cohortsOrder.indexOf(b.id.toString());
    }
    return 0;
  };

  const openGithubModalHandler = () => setShowWarningModal(true);

  return (
    <Container minHeight="93vh" display="flex" flexDirection="column" maxW="none" padding="0">
      <Modal
        isOpen={showSyncMicroModal}
        isCentered
        onClose={() => {}}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('dashboard:microcohorts-sync.title')}</ModalHeader>
          <ModalBody>
            <Text>{t('dashboard:microcohorts-sync.description')}</Text>
          </ModalBody>
          <Flex justifyContent="flex-start" gap="10px" p="16px">
            <Button isLoading={isSyncingMicro} onClick={handleSyncMicroCohorts} variant="default">
              {t('dashboard:microcohorts-sync.sync')}
            </Button>
          </Flex>
        </ModalContent>
      </Modal>
      {isAvailableAsSaas && (
        <CohortHeader
          onOpenGithubModal={openGithubModalHandler}
          liveClasses={liveClasses}
          upcomingEvents={events}
          isLoadingEvents={isLoadingAssigments}
        />
      )}
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
              color="blue.default"
              _focus={{ boxShadow: 'none', color: 'blue.default' }}
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
                  {cohortSession?.intro_video ? (
                    <Flex direction="column" mb="20px">
                      <Flex direction={{ base: 'column', md: isVideoVisible ? 'row' : 'column' }} gap="20px">
                        <Box flex={1}>
                          {isVideoVisible ? (
                            <Flex direction="column" alignItems="center" gap="10px" height="100%">
                              <Flex direction="column" gap="10px" height="100%" wrap="wrap">
                                <Flex gap="10px">
                                  <Img borderRadius="full" src={cohortSession.syllabus_version?.logo} width="29px" height="29px" />
                                  <Heading as="h1" size="m">
                                    {cohortSession.name}
                                  </Heading>
                                </Flex>
                                <Text fontSize="16px">
                                  {t('micro-cohorts-description')}
                                </Text>
                                <Button
                                  display="flex"
                                  padding="0"
                                  alignSelf="flex-start"
                                  flexDirection="row"
                                  alignItems="center"
                                  fontWeight="700"
                                  color="blue.default"
                                  background="transparent"
                                  _focus={{ boxShadow: 'none', color: 'blue.default' }}
                                  _hover={{ background: 'transparent' }}
                                  onClick={() => {
                                    continueWhereYouLeft(cohortSession);
                                  }}
                                >
                                  <span>
                                    {t('saasCohortcallToAction.buttonText')}
                                  </span>
                                  <Icon
                                    icon="longArrowRight"
                                    width="20px"
                                    height="20px"
                                    style={{ marginLeft: '7px' }}
                                    color="currentColor"
                                  />
                                </Button>
                              </Flex>
                            </Flex>
                          ) : (
                            <Flex direction="column" gap="10px">
                              <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
                                <Flex gap="10px" alignItems="center">
                                  <Img borderRadius="full" src={cohortSession.syllabus_version?.logo} width="29px" height="29px" />
                                  <Heading as="h1" size="m">
                                    {cohortSession.name}
                                  </Heading>
                                </Flex>
                                <Button
                                  display="flex"
                                  padding="0"
                                  alignSelf="flex-start"
                                  flexDirection="row"
                                  alignItems="center"
                                  fontWeight="700"
                                  color="blue.default"
                                  background="transparent"
                                  _focus={{ boxShadow: 'none', color: 'blue.default' }}
                                  _hover={{ background: 'transparent' }}
                                  onClick={() => {
                                    continueWhereYouLeft(cohortSession);
                                  }}
                                >
                                  <span>
                                    {t('saasCohortcallToAction.buttonText')}
                                  </span>
                                  <Icon
                                    icon="longArrowRight"
                                    width="20px"
                                    height="20px"
                                    style={{ marginLeft: '7px' }}
                                    color="currentColor"
                                  />
                                </Button>
                              </Flex>
                            </Flex>
                          )}
                        </Box>
                        {isVideoVisible && (
                          <Box flex={1} borderRadius="12px" overflow="hidden">
                            <ReactPlayerV2
                              url={cohortSession.intro_video}
                              width="100%"
                              height="100%"
                              iframeStyle={{ aspectRatio: '16/9', borderRadius: '12px' }}
                            />
                          </Box>
                        )}
                      </Flex>
                      {isVideoVisible && (
                        <Button alignSelf="center" color="auto" display="flex" gap="10px" variant="link" mt="auto" onClick={() => setIsVideoVisible(false)}>
                          {t('hide-content')}
                          <Icon icon="arrowUp" width="10px" height="10px" />
                        </Button>
                      )}
                      {!isVideoVisible && (
                        <Button variant="link" color="auto" onClick={() => setIsVideoVisible(true)}>
                          {t('show-content')}
                          <Icon icon="arrowDown" width="15px" height="15px" />
                        </Button>
                      )}
                    </Flex>
                  ) : (
                    <Flex direction="column" gap="10px" mb="20px">
                      <Flex
                        alignItems={{ base: 'flex-start', sm: 'center' }}
                        direction={{ base: 'column', sm: 'row' }}
                        gap="10px"
                        justifyContent="space-between"
                      >
                        <Flex gap="10px">
                          <Img borderRadius="full" src={cohortSession.syllabus_version?.logo} width="29px" height="29px" />
                          <Heading as="h1" size="m">
                            {cohortSession.name}
                          </Heading>
                        </Flex>
                        <Button
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          fontWeight="700"
                          gridGap="12px"
                          color="blue.default"
                          background="transparent"
                          _focus={{ boxShadow: 'none', color: 'blue.default' }}
                          _hover={{ background: 'transparent' }}
                          onClick={() => {
                            continueWhereYouLeft(cohortSession);
                          }}
                        >
                          <span>
                            {t('saasCohortcallToAction.buttonText')}
                          </span>
                          <Icon
                            icon="longArrowRight"
                            width="20px"
                            height="20px"
                            style={{ marginLeft: '7px' }}
                            color="currentColor"
                          />
                        </Button>
                      </Flex>
                      <Text fontSize="16px">
                        {t('micro-cohorts-description')}
                      </Text>
                    </Flex>
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
                              certificate={certificates?.find((cert) => cert.cohort.id === microCohort.id)}
                            />
                          ))
                        : (
                          <CohortPanel openByDefault cohort={cohortSession} modules={sortedAssignments} certificate={certificates?.find((cert) => cert.cohort.id === cohortSession.id)} />
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
                            subscriptionData={currentSubscription}
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
                                      <Icon icon="cameraFilled" width="29px" height="16px" color="blue.default" />
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
                          subscriptionData={currentSubscription}
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
      {showWarningModal && (
        <Modal
          isOpen={showWarningModal}
          size="md"
          margin="0 10px"
          onClose={() => {
            setShowWarningModal(false);
            if (showGithubWarning === 'active') {
              localStorage.setItem('showGithubWarning', 'postponed');
            }
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
                  if (showGithubWarning === 'active') {
                    localStorage.setItem('showGithubWarning', 'postponed');
                  }
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
