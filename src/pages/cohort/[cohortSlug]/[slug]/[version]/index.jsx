import {
  useMemo, useEffect, useState,
} from 'react';
import {
  Box, Flex, Container, useColorModeValue, Skeleton, useToast,
  Checkbox, Input, InputGroup, InputRightElement, IconButton,
  keyframes, usePrefersReducedMotion, Avatar, useColorMode,
  Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Button, useMediaQuery,
} from '@chakra-ui/react';
// import io from 'socket.io-client';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import NextChakraLink from '../../../../../common/components/NextChakraLink';
import TagCapsule from '../../../../../common/components/TagCapsule';
import ModuleMap from '../../../../../js_modules/moduleMap/index';
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
  slugify, includesToLowerCase, getStorageItem,
} from '../../../../../utils/index';
import ModalInfo from '../../../../../js_modules/moduleMap/modalInfo';
import Text from '../../../../../common/components/Text';
import OnlyFor from '../../../../../common/components/OnlyFor';
import AlertMessage from '../../../../../common/components/AlertMessage';
import useHandler from '../../../../../common/hooks/useCohortHandler';

const Dashboard = () => {
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
  const { user, choose, isLoading } = useAuth();
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const [currentCohortProps, setCurrentCohortProps] = useState({});
  const {
    cohortSession, sortedAssignments, taskCohortNull, getCohortAssignments, getCohortData, prepareTasks, getDailyModuleData,
    getMandatoryProjects, getTasksWithoutCohort, taskTodo, taskTodoState,
  } = useHandler();

  const teacherAndAssistants = studentAndTeachers.filter((st) => st.role === 'TEACHER' || st.role === 'ASSISTANT');

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

  const supportSideBar = t('supportSideBar', {}, { returnObjects: true });

  const profesionalRoles = ['TEACHER', 'ASSISTANT', 'REVIEWER'];

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
          title: t('alert-message:unsynced-tasks-removed'),
          // title: 'Unsynced tasks successfully removed!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setModalIsOpen(false);
      })
      .catch(() => {
        toast({
          title: t('alert-message:unsynced-tasks-cant-be-removed'),
          // title: 'Some Tasks cannot be removed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    if (showGithubWarning === 'active') {
      setShowWarningModal(true);
    }
  }, []);

  // Fetch cohort data with pathName structure
  useEffect(() => {
    getCohortData({
      choose, cohortSlug,
    }).then((cohort) => {
      setCurrentCohortProps(cohort);
    });
  }, [cohortSlug]);

  // Students and Teachers data
  useEffect(() => {
    bc.cohort().getStudents(cohortSlug).then(({ data }) => {
      if (data.length > 0) {
        setSudentAndTeachers(data.sort(
          (a, b) => a.user.first_name.localeCompare(b.user.first_name),
        ));
      }
    }).catch(() => {
      toast({
        title: t('alert-message:error-fetching-students-and-teachers'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    });
  }, [cohortSlug]);

  // Fetch cohort assignments (lesson, exercise, project, quiz)
  useEffect(() => {
    if (!isLoading) {
      getCohortAssignments({
        user, setContextState, slug,
      });
    }
  }, [user]);

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
  );

  const modulesExists = sortedAssignments.some(
    (assignment) => assignment.filteredModules.length !== 0,
  );

  const sortedAssignmentsSearched = searchValue.length > 0 ? sortedAssignments.filter((l) => {
    const { filteredModules } = l;
    const filtered = filteredModules.filter((module) => {
      const { title } = module;
      return title.toLowerCase().includes(searchValue.toLowerCase());
    });
    return filtered.length !== 0;
  }) : sortedAssignments;

  return (
    <>
      {getMandatoryProjects().length > 0 && (
        <AlertMessage
          full
          type="warning"
          message={t('deliverProject.mandatory-message', { count: getMandatoryProjects().length })}
          style={{ borderRadius: '0px', justifyContent: 'center' }}
        />
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
            {t('backToChooseProgram')}
          </NextChakraLink>
        </Box>

        <ModalInfo
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          title={t('unsynced.title', { taskLength: taskCohortNull.length })}
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
                  title={supportSideBar.title}
                  subtitle={supportSideBar.description}
                  teacherAndAssistants={teacherAndAssistants}
                  actionButtons={supportSideBar.actionButtons}
                  width="100%"
                />
                )}
              </Box>
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

            <Box marginTop="36px">
              <ProgressBar
                taskTodo={taskTodoState}
                progressText={t('progressText')}
                width="100%"
              />
            </Box>

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
                    disabled={!showSearch}
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
              {sortedAssignments.length >= 1 ? (
                <>
                  {sortedAssignmentsSearched.map((assignment, i) => {
                    const {
                      label, description, filteredModules, modules, filteredModulesByPending,
                    } = assignment;

                    const filteredModulesSearched = searchValue.length > 0
                      ? filteredModules.filter(
                        (l) => includesToLowerCase(l.title, searchValue),
                      )
                      : filteredModules;

                    const filteredModulesByPendingSearched = searchValue.length > 0
                      ? filteredModulesByPending.filter(
                        (l) => includesToLowerCase(l.title, searchValue),
                      )
                      : filteredModulesByPending;

                    const index = i;
                    return (
                      <ModuleMap
                        key={index}
                        userId={user?.id}
                        cohortSession={cohortSession}
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
                  {sortedAssignmentsSearched.length <= 0 && (
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
                title={supportSideBar.title}
                subtitle={supportSideBar.description}
                teacherAndAssistants={teacherAndAssistants}
                actionButtons={supportSideBar.actionButtons}
                width="100%"
              />
              )}
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
        <ModalContent>
          <ModalHeader color={commonModalColor} borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={commonBorderColor} textAlign="center">
            {t('warningModal.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody padding={{ base: '15px 22px' }}>
            <Text textAlign="center" fontSize="14px" lineHeight="24px" marginBottom="15px" fontWeight="400">
              {t('warningModal.sub-title')}
            </Text>
            <Text marginBottom="25px" color={commonFontColor} textAlign="center" fontSize="12px" lineHeight="24px">
              {t('warningModal.text')}
            </Text>
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
                window.location.href = `${process.env.BREATHECODE_HOST}/v1/auth/github/${accessToken}?url=${window.location.href}`;
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
    </>
  );
};

export default asPrivate(Dashboard);
