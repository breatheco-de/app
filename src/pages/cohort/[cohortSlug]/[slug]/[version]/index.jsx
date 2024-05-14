import {
  useMemo, useEffect, useState,
} from 'react';
import {
  Box, Flex, Container, useColorModeValue, Skeleton, useToast,
  Checkbox, Input, InputGroup, InputRightElement, IconButton,
  keyframes, usePrefersReducedMotion, Avatar, useColorMode,
  Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel,
} from '@chakra-ui/react';
// import io from 'socket.io-client';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import ReactPlayerV2 from '../../../../../common/components/ReactPlayerV2';
import NextChakraLink from '../../../../../common/components/NextChakraLink';
import TagCapsule from '../../../../../common/components/TagCapsule';
import ModuleMap from '../../../../../js_modules/moduleMap/index';
import Module from '../../../../../js_modules/moduleMap/module';
import CohortSideBar from '../../../../../common/components/CohortSideBar';
import Icon from '../../../../../common/components/Icon';
import SupportSidebar from '../../../../../common/components/SupportSidebar';
import TeacherSidebar from '../../../../../common/components/TeacherSidebar';
import CallToAction from '../../../../../common/components/CallToAction';
import ProgressBar from '../../../../../common/components/ProgressBar';
import Heading from '../../../../../common/components/Heading';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import useAuth from '../../../../../common/hooks/useAuth';
import { ModuleMapSkeleton, SimpleSkeleton } from '../../../../../common/components/Skeleton';
import bc from '../../../../../common/services/breathecode';
import useModuleMap from '../../../../../common/store/actions/moduleMapAction';
import { nestAssignments } from '../../../../../common/hooks/useModuleHandler';
import axios from '../../../../../axios';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import {
  slugify,
  includesToLowerCase,
  getStorageItem,
  sortToNearestTodayDate,
  syncInterval,
  getBrowserSize,
  calculateDifferenceDays,
  adjustNumberBeetwenMinMax,
  isValidDate,
} from '../../../../../utils/index';
import { reportDatalayer } from '../../../../../utils/requests';
import ModalInfo from '../../../../../js_modules/moduleMap/modalInfo';
import Text from '../../../../../common/components/Text';
import OnlyFor from '../../../../../common/components/OnlyFor';
import AlertMessage from '../../../../../common/components/AlertMessage';
import useHandler from '../../../../../common/hooks/useCohortHandler';
import modifyEnv from '../../../../../../modifyEnv';
import LiveEvent from '../../../../../common/components/LiveEvent';
import FinalProject from '../../../../../common/components/FinalProject';
import useStyle from '../../../../../common/hooks/useStyle';
import Feedback from '../../../../../common/components/Feedback';

function Dashboard() {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { t } = useTranslation('dashboard');
  const toast = useToast();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const { contextState, setContextState } = useModuleMap();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const { cohortProgram } = contextState;
  const [studentAndTeachers, setSudentAndTeachers] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [, setSortedAssignments] = usePersistent('sortedAssignments', []);
  const [searchValue, setSearchValue] = useState(router.query.search || '');
  const [showPendingTasks, setShowPendingTasks] = useState(false);
  const [events, setEvents] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const { featuredColor, hexColor } = useStyle();

  const { user, choose, isAuthenticated } = useAuth();

  const isBelowTablet = getBrowserSize()?.width < 768;
  const [currentCohortProps, setCurrentCohortProps] = useState({});
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState(null);
  const [isAvailableToShowWarningModal, setIsAvailableToShowModalMessage] = useState(false);
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);
  const {
    cohortSession, sortedAssignments, taskCohortNull, getCohortAssignments, getCohortData, prepareTasks, getDailyModuleData,
    getMandatoryProjects, getTasksWithoutCohort, taskTodo, taskTodoState,
  } = useHandler();

  const { cohortSlug, slug } = router.query;

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

  const skeletonStartColor = useColorModeValue('gray.300', 'gray.light');
  const commonInputColor = useColorModeValue('gray.default', 'gray.300');
  const commonInputActiveColor = useColorModeValue('gray.800', 'gray.100');
  const skeletonEndColor = useColorModeValue('gray.400', 'gray.400');
  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');
  const commonFontColor = useColorModeValue('gray.600', 'gray.200');
  const commonActiveBackground = useColorModeValue('gray.light', 'rgba(255, 255, 255, 0.22)');
  const iconColor = useColorModeValue('#000000', '#FFFFFF');
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const commonModalColor = useColorModeValue('gray.dark', 'gray.light');
  const accessToken = getStorageItem('accessToken');
  const showGithubWarning = getStorageItem('showGithubWarning');
  const TwelveHours = 720;

  const profesionalRoles = ['TEACHER', 'ASSISTANT', 'REVIEWER'];
  const cohortUserDaysCalculated = calculateDifferenceDays(cohortSession?.cohort_user?.created_at);

  if (cohortSession?.academy?.id) {
    axios.defaults.headers.common.Academy = cohortSession.academy.id;
  } else {
    router.push('/choose-program');
  }

  const syncTaskWithCohort = async () => {
    const tasksToUpdate = ((taskCohortNull !== undefined) && taskCohortNull).map((task) => ({
      // ...task,
      id: task.id,
      cohort: cohortSession.id,
    }));
    await bc.todo({}).updateBulk(tasksToUpdate)
      .then(({ data }) => {
        setContextState({
          ...contextState,
          taskTodo: [
            ...contextState.taskTodo,
            ...data,
          ],
        });
        setModalIsOpen(false);
      })
      .catch(() => {
        setModalIsOpen(false);
        toast({
          position: 'top',
          title: t('alert-message:task-cant-sync-with-cohort'),
          // title: 'Some Tasks cannot synced with current cohort',
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
  useEffect(() => {
    if (isAuthenticated) {
      bc.admissions().me()
        .then((resp) => {
          const data = resp?.data;
          const cohorts = data?.cohorts;
          const currentCohort = cohorts?.find((l) => l?.cohort?.slug === cohortSlug);
          if (currentCohort?.finantial_status === 'LATE' || currentCohort?.educational_status === 'SUSPENDED') {
            router.push('/choose-program');
          } else {
            const isReadyToShowGithubMessage = cohorts?.some(
              (l) => l?.educational_status === 'ACTIVE' && l.cohort.available_as_saas === false,
            );
            setIsAvailableToShowModalMessage(isReadyToShowGithubMessage);
          }
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (showGithubWarning === 'active') {
      setShowWarningModal(true);
    }
    bc.payment().events()
      .then(({ data }) => {
        const eventsRemain = data?.length > 0 ? data.filter((l) => {
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
      status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
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
          },
        });
      });
    syncInterval(() => {
      setLiveClasses((prev) => {
        const validatedEventList = prev?.length > 0
          ? prev?.filter((l) => isValidDate(l?.starting_at) && isValidDate(l?.ending_at))
          : [];
        const sortDateToLiveClass = sortToNearestTodayDate(validatedEventList, TwelveHours);
        const existentLiveClasses = sortDateToLiveClass?.filter((l) => l?.hash && l?.starting_at && l?.ending_at);
        return existentLiveClasses;
      });
    });
  }, []);

  // Fetch cohort data with pathName structure
  useEffect(() => {
    getCohortData({
      choose, cohortSlug,
    }).then((cohort) => {
      setCurrentCohortProps(cohort);
      reportDatalayer({
        dataLayer: {
          cohort,
        },
      });
    });
  }, [cohortSlug]);

  // Students and Teachers data
  useEffect(() => {
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
    }).catch(() => {
      toast({
        position: 'top',
        title: t('alert-message:error-fetching-students-and-teachers'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    });
  }, [cohortSlug]);

  // Fetch cohort assignments (lesson, exercise, project, quiz)
  useEffect(() => {
    if (isAuthenticated) {
      getCohortAssignments({
        user, setContextState, slug,
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    getTasksWithoutCohort({ setModalIsOpen });
  }, [sortedAssignments]);

  // Sort all data fetched in order of taskTodo
  useMemo(() => {
    prepareTasks({
      cohortProgram, contextState, nestAssignments,
    });
  }, [contextState.cohortProgram, contextState.taskTodo, router]);

  const dailyModuleData = getDailyModuleData() || '';

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
    (assignment) => assignment.filteredModules && assignment.filteredModules.length !== 0,
  );

  const sortedAssignmentsSearched = (searchValue && searchValue.length > 0) ? sortedAssignments.filter((l) => {
    const { filteredModules } = l;
    const filtered = filteredModules.filter((module) => {
      const { title } = module;
      return title.toLowerCase().includes(searchValue.toLowerCase());
    });
    return filtered.length !== 0;
  }) : sortedAssignments;

  return (
    <>
      {getMandatoryProjects() && getMandatoryProjects().length > 0 && (
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
            {t('deliverProject.mandatory-message', { count: getMandatoryProjects().length })}
            {'  '}
            <Button
              variant="link"
              color="black"
              textDecoration="underline"
              fontWeight="700"
              fontSize="15px"
              height="20px"
              onClick={() => setShowMandatoryModal(true)}
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
      <Container maxW="container.xl">
        <Box width="fit-content" marginTop="18px" marginBottom="48px">
          <NextChakraLink
            href="/choose-program"
            display="flex"
            flexDirection="row"
            alignItems="center"
            onClick={() => {
              setSortedAssignments([]);
            }}
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
        <Flex
          justifyContent="space-between"
          flexDirection={{
            base: 'column', sm: 'column', md: 'row', lg: 'row',
          }}
        >
          <Box width="100%" minW={{ base: 'auto', md: 'clamp(300px, 60vw, 770px)' }}>
            {(cohortSession?.syllabus_version?.name || cohortProgram.name) ? (
              <Heading as="h1" size="xl">
                {cohortSession?.syllabus_version?.name || cohortProgram?.name}
              </Heading>
            ) : (
              <Skeleton
                startColor={skeletonStartColor}
                endColor={skeletonEndColor}
                height="60px"
                width="100%"
                borderRadius="10px"
              />
            )}

            {cohortSession?.main_technologies ? (
              <TagCapsule containerStyle={{ padding: '6px 18px 6px 18px' }} tags={cohortSession.main_technologies} separator="/" />
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
                <OnlyFor onlyTeachers cohortSession={cohortSession} capabilities={['academy_reporting', 'classroom_activity', 'read_cohort_activity']}>
                  <TeacherSidebar
                    title={t('teacher-sidebar.actions')}
                    user={user}
                    students={onlyStudentsActive}
                    sortedAssignments={sortedAssignments}
                    currentCohortProps={currentCohortProps}
                    setCurrentCohortProps={setCurrentCohortProps}
                    width="100%"
                  />
                </OnlyFor>
                {cohortSession?.academy_owner?.white_labeled && (
                <Box
                  className="white-label"
                  borderRadius="md"
                  padding="10px"
                  display="flex"
                  justifyContent="space-around"
                  bg={colorMode === 'light' ? '#F2F2F2' || 'blue.light' : 'featuredDark'}
                >
                  <Avatar
                    name={cohortSession.academy_owner.name}
                    src={cohortSession.academy_owner.icon_url}
                  />
                  <Box className="white-label-text" width="80%">
                    <Text size="md" fontWeight="700" marginBottom="5px">
                      {cohortSession.academy_owner.name}
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
                  cohorts={cohortSession ? [{ role: cohortSession.cohort_role, cohort: cohortSession }] : []}
                />
                {cohortSession?.stage === 'FINAL_PROJECT' && (
                  <FinalProject
                    tasks={taskTodoState}
                    studentAndTeachers={onlyStudentsActive}
                  />
                )}
                {cohortSession?.kickoff_date && (
                <CohortSideBar
                  cohortSession={cohortSession}
                  teacherVersionActive={profesionalRoles.includes(cohortSession?.cohort_role)}
                  cohort={cohortSession}
                  studentAndTeachers={studentAndTeachers}
                  cohortCity={cohortSession?.name}
                  width="100%"
                />
                )}
                {cohortSession?.cohort_role?.toLowerCase() === 'student' && (
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
                          <Icon icon="arrowRight" width="11px" height="20px" color="currentColor" style={{ }} transform={isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'} transition="transform 0.2s ease-in" />
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
            )}

            {
            cohortSession.current_module && dailyModuleData && (
              <CallToAction
                background="blue.default"
                margin="40px 0 auto 0"
                title={t('callToAction.title')}
                href={`#${dailyModuleData && slugify(dailyModuleData.label)}`}
                text={dailyModuleData.description}
                buttonText={t('callToAction.buttonText')}
                width={{ base: '100%', md: 'fit-content' }}
              />
            )
          }

            {(!cohortSession?.intro_video || ['TEACHER', 'ASSISTANT'].includes(cohortSession?.cohort_role) || (cohortUserDaysCalculated?.isRemainingToExpire === false && cohortUserDaysCalculated?.result >= 3)) && (
              <Box marginTop="36px">
                <ProgressBar
                  cohortProgram={cohortProgram}
                  taskTodo={taskTodoState}
                  progressText={t('progressText')}
                  width="100%"
                />
              </Box>
            )}

            <Box height={useColorModeValue('1px', '2px')} bg={useColorModeValue('gray.200', 'gray.700')} marginY="32px" />

            <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" gridGap="18px">
              <Heading as="h2" fontWeight="900" size="15px" textTransform="uppercase">{t('moduleMap')}</Heading>

              <Box display="flex" alignItems="center">
                <InputGroup>
                  <Input
                    borderRadius="25px"
                    type="text"
                    value={searchValue}
                    backgroundColor={commonBackground}
                    style={{
                      cursor: 'default',
                      opacity: showSearch ? 1 : 0,
                    }}
                    isDisabled={!showSearch}
                    animation={showSearch ? slideLeftAnimation : ''}
                    onChange={(e) => setSearchValue(e.target.value)}
                    color={commonInputColor}
                    _focus={{
                      color: commonInputActiveColor,
                      backgroundColor: commonActiveBackground,
                    }}
                    _hover={{
                      color: commonInputActiveColor,
                      backgroundColor: commonActiveBackground,
                    }}
                  />
                  <InputRightElement>
                    <IconButton onClick={() => setShowSearch(!showSearch)} pr="8px" background="transparent" _hover={{ background: 'transparent' }} _active={{ background: 'transparent' }} aria-label="Search in modules" icon={<Icon icon="search" color={showSearch ? iconColor : ''} width="18px" height="18px" />} />
                  </InputRightElement>
                </InputGroup>
                {modulesExists && (
                <Checkbox onChange={(e) => setShowPendingTasks(e.target.checked)} textAlign="right" gridGap="10px" display="flex" flexDirection="row-reverse" color={commonFontColor}>
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
              {sortedAssignments && sortedAssignments.length >= 1 ? (
                <>
                  {sortedAssignmentsSearched.map((assignment, i) => {
                    const {
                      label, description, filteredModules, exists_activities: existsActivities, modules, filteredModulesByPending,
                    } = assignment;

                    const filteredModulesSearched = searchValue && searchValue.length > 0
                      ? filteredModules.filter(
                        (l) => includesToLowerCase(l.title, searchValue),
                      )
                      : filteredModules;

                    const filteredModulesByPendingSearched = searchValue && searchValue.length > 0
                      ? filteredModulesByPending.filter(
                        (l) => includesToLowerCase(l.title, searchValue),
                      )
                      : filteredModulesByPending;

                    const index = i;
                    return (
                      <ModuleMap
                        key={index}
                        userId={user?.id}
                        existsActivities={existsActivities}
                        cohortData={currentCohortProps}
                        taskCohortNull={taskCohortNull}
                        contextState={contextState}
                        setContextState={setContextState}
                        index={index}
                        title={label}
                        slug={slugify(label)}
                        searchValue={searchValue}
                        description={description}
                        taskTodo={taskTodo}
                        modules={modules}
                        filteredModules={filteredModulesSearched}
                        showPendingTasks={showPendingTasks}
                        filteredModulesByPending={filteredModulesByPendingSearched}
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
              <OnlyFor onlyTeachers cohortSession={cohortSession} capabilities={['academy_reporting', 'classroom_activity', 'read_cohort_activity']}>
                <TeacherSidebar
                  title={t('teacher-sidebar.actions')}
                  user={user}
                  students={onlyStudentsActive}
                  sortedAssignments={sortedAssignments}
                  currentCohortProps={currentCohortProps}
                  setCurrentCohortProps={setCurrentCohortProps}
                  width="100%"
                />
              </OnlyFor>
              {cohortSession?.academy_owner?.white_labeled && (
                <Box
                  className="white-label"
                  borderRadius="md"
                  padding="10px"
                  display="flex"
                  justifyContent="space-around"
                  bg={colorMode === 'light' ? '#F2F2F2' || 'blue.light' : 'featuredDark'}
                >
                  <Avatar
                    name={cohortSession.academy_owner.name}
                    src={cohortSession.academy_owner.icon_url}
                  />
                  <Box className="white-label-text" width="80%">
                    <Text size="md" fontWeight="700" marginBottom="5px">
                      {cohortSession.academy_owner.name}
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
                cohorts={cohortSession ? [{ role: cohortSession.cohort_role, cohort: cohortSession }] : []}
              />
              {cohortSession?.stage === 'FINAL_PROJECT' && (
                <FinalProject
                  tasks={taskTodoState}
                  studentAndTeachers={onlyStudentsActive}
                />
              )}
              {cohortSession?.kickoff_date && (
              <CohortSideBar
                cohortSession={cohortSession}
                teacherVersionActive={profesionalRoles.includes(cohortSession?.cohort_role)}
                studentAndTeachers={studentAndTeachers}
                cohort={cohortSession}
                cohortCity={cohortSession?.name}
                width="100%"
              />
              )}
              {cohortSession?.cohort_role?.toLowerCase() === 'student' && (
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
          <ModalContent style={{ margin: '3rem 0 0 0' }}>
            <ModalHeader color={commonModalColor} borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={commonBorderColor} textAlign="center">
              {t('warningModal.title')}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody padding={{ base: '15px 22px' }}>
              <Text textAlign="center" fontSize="14px" lineHeight="24px" marginBottom="15px" fontWeight="400">
                {t('warningModal.sub-title')}
              </Text>
              {isAvailableToShowWarningModal && (
                <Text marginBottom="25px" color={commonFontColor} textAlign="center" fontSize="12px" lineHeight="24px">
                  {t('warningModal.text')}
                </Text>
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
                color={commonModalColor}
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
      {/* Mandatory projects modal */}
      <Modal
        isOpen={showMandatoryModal}
        size="2xl"
        margin="0 10px"
        onClose={() => {
          setShowMandatoryModal(false);
        }}
      >
        <ModalOverlay />
        <ModalContent style={{ margin: '3rem 0 0 0' }}>
          <ModalHeader pb="0" fontSize="15px" textTransform="uppercase" borderColor={commonBorderColor}>
            {t('mandatoryProjects.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody padding={{ base: '15px 22px' }}>
            <Text color={hexColor.fontColor3} fontSize="14px" lineHeight="24px" marginBottom="15px" fontWeight="400">
              {t('mandatoryProjects.description')}
            </Text>
            {getMandatoryProjects().map((module, i) => (
              <Module
                // eslint-disable-next-line react/no-array-index-key
                key={`${module.title}-${i}`}
                currIndex={i}
                data={module}
                taskTodo={taskTodo}
                variant="open-only"
              />
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default asPrivate(Dashboard);
