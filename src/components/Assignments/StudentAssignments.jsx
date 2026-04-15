/* eslint-disable no-unused-vars */
import { useState, useCallback, forwardRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  Box,
  Avatar,
  Flex,
  Button,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import bc from '../../services/breathecode';
import DottedTimeline from '../DottedTimeline';
import NextChakraLink from '../NextChakraLink';
import useStyle from '../../hooks/useStyle';
import useFormatTimeString from '../../hooks/useFormatTimeString';
import { ReviewModal, NoInfoModal, DeliverModal } from './index';
import LoaderScreen from '../LoaderScreen';
import InfiniteScroll from '../InfiniteScroll';
import { ORIGIN_HOST } from '../../utils/variables';
import useCustomToast from '../../hooks/useCustomToast';
import Icon from '../Icon';
import Text from '../Text';
import useAssignments from '../../store/actions/assignmentsAction';

const MacroStudentProgressCard = forwardRef(({
  studentHeaderNode,
  extraTimelines,
  mergedDots,
  mergedEmptyMessage,
  onClickDots,
}, ref) => {
  const { t } = useTranslation('assignments');
  const { hexColor, fontColor2 } = useStyle();
  const [showMicroBreakdown, setShowMicroBreakdown] = useState(false);

  const label = (
    <Flex align="flex-start" justify="space-between" w="100%" gridGap="12px" flexWrap="wrap">
      <Box flex="1" minW="180px">
        {studentHeaderNode}
      </Box>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        flexShrink={0}
        alignSelf="flex-start"
        h="auto"
        py="4px"
        px="8px"
        color={fontColor2}
        onClick={() => setShowMicroBreakdown((v) => !v)}
        aria-expanded={showMicroBreakdown}
        _hover={{ bg: 'blackAlpha.50' }}
      >
        <Flex align="center" gridGap="6px">
          <Text size="sm" fontWeight={600} color={fontColor2}>
            {t('macro-progress-breakdown-toggle')}
          </Text>
          <Icon
            icon="arrowDown"
            width="14px"
            height="14px"
            color={hexColor.fontColor2}
            style={{
              transform: showMicroBreakdown ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </Flex>
      </Button>
    </Flex>
  );

  return (
    <Box ref={ref}>
      <DottedTimeline
        onClickDots={onClickDots}
        label={label}
        dots={showMicroBreakdown ? [] : mergedDots}
        extraTimelines={showMicroBreakdown ? extraTimelines : undefined}
        emptyDotsMessage={showMicroBreakdown ? '' : mergedEmptyMessage}
        helpText=""
      />
    </Box>
  );
});

MacroStudentProgressCard.displayName = 'MacroStudentProgressCard';

MacroStudentProgressCard.propTypes = {
  studentHeaderNode: PropTypes.node.isRequired,
  extraTimelines: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    dots: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  })),
  mergedDots: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  mergedEmptyMessage: PropTypes.string,
  onClickDots: PropTypes.func,
};

MacroStudentProgressCard.defaultProps = {
  extraTimelines: [],
  mergedDots: [],
  mergedEmptyMessage: '',
  onClickDots: undefined,
};

const StudentsRows = forwardRef(({
  currentStudentList,
  syllabusData,
  selectedCohort,
  setCurrentTask,
  setDeliveryUrl,
  isMacroCohort,
  microCohortOrder,
  microSyllabusBySlug,
}, ref) => {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const { query } = router;
  const { academy, cohortSlug } = query;
  const { formatTimeString } = useFormatTimeString();
  const { createToast } = useCustomToast({ toastId: 'student-assignment-review-error' });
  const { hexColor } = useStyle();
  const { contextState } = useAssignments();

  const getStatus = (task) => {
    if (!task) return 'NOT-OPENED';
    if (!task.task_status && !task.revision_status) return 'NOT-OPENED';
    if (task.task_status === 'DONE' && task.revision_status === 'PENDING') return 'DELIVERED';
    if (task.task_status === 'PENDING' && task.revision_status === 'PENDING') return 'UNDELIVERED';
    return task.revision_status;
  };

  const showSingleTask = async (task) => {
    try {
      const status = getStatus(task);
      let file;
      const academyId = selectedCohort?.academy.id || academy;
      if (status === 'UNDELIVERED' || status === 'REJECTED') {
        const { data } = await bc.assignments().deliver({
          id: task.id,
          academy: academyId,
        });
        setDeliveryUrl(data.delivery_url);
      } else if (status === 'APPROVED' || status === 'DELIVERED') {
        const assetResp = await bc.registry().getAsset(task.slug);
        if (assetResp && assetResp.status < 400) {
          const dataAsset = assetResp.data;
          if (!dataAsset?.delivery_formats.includes('url')) {
            const fileResp = await bc.assignments().getFile({ id: task.id, academyId: selectedCohort?.academy.id || academy });
            if (fileResp && fileResp.status < 400) {
              file = await fileResp.data;
            }
          }
        }
      }
      setCurrentTask({ ...task, status, file });
    } catch (e) {
      createToast({
        position: 'top',
        title: t('alert-message:review-url-error'),
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const statusColors = {
    APPROVED: hexColor.green,
    REJECTED: hexColor.danger,
    UNDELIVERED: hexColor.fontColor3,
    DELIVERED: hexColor.yellowDefault,
    'NOT-OPENED': hexColor.fontColor3,
  };

  const educationalStatusLabel = (raw) => {
    const key = (raw || '').toLowerCase();
    const map = {
      active: 'educational-list.active',
      postponed: 'educational-list.postponed',
      graduated: 'educational-list.graduated',
      suspended: 'educational-list.suspended',
      dropped: 'educational-list.dropped',
    };
    return map[key] ? t(map[key]) : raw;
  };

  const studentHeader = (student, percentage, lastProjectDelivery, fullname, statusInlineLabel = null) => (
    <Flex gridGap="10px" alignItems="center">
      <Avatar
        src={student.user.profile?.avatar_url}
        width="25px"
        height="25px"
        style={{ userSelect: 'none' }}
      />
      <Box>
        <p>
          <NextChakraLink
            href={`/cohort/${cohortSlug}/student/${student.user.id}?academy=${academy}`}
            color={hexColor.blueDefault}
            fontWeight={600}
            textDecoration="underline"
            textUnderlineOffset="3px"
            cursor="pointer"
            title={t('open-student-profile')}
            aria-label={`${t('open-student-profile')}: ${fullname}`}
            _hover={{
              color: hexColor.darkBlueDefault,
              textDecoration: 'underline',
            }}
            _focusVisible={{
              boxShadow: '0 0 0 3px rgb(66 153 225 / 60%)',
              outline: 'none',
              borderRadius: '2px',
            }}
          >
            {fullname}
          </NextChakraLink>
          {statusInlineLabel != null && statusInlineLabel !== '' && (
            <>
              {' - '}
              <Box as="span" fontWeight={700} color={hexColor.fontColor2}>
                {statusInlineLabel}
              </Box>
            </>
          )}
        </p>
        <small>{`${percentage}${t('delivered-percentage')}`}</small>
        {lastProjectDelivery?.delivered_at && (
          <small>
            {' - '}
            {t('last-deliver', { date: formatTimeString(new Date(lastProjectDelivery.delivered_at)) })}
          </small>
        )}
      </Box>
    </Flex>
  );

  const sameCohortIdOrSlug = (taskCohort, cohortRef) => {
    if (!taskCohort || !cohortRef) return false;
    const a = taskCohort.id;
    const b = cohortRef.id;
    if (a != null && b != null && String(a) === String(b)) return true;
    if (taskCohort.slug && cohortRef.slug && taskCohort.slug === cohortRef.slug) return true;
    return false;
  };

  /** Slug del ítem del syllabus (a veces solo viene associated_slug). */
  const assignmentSlugFromElem = (elem) => elem?.slug ?? elem?.associated_slug;

  const taskMatchesAssignmentSlug = (task, slug) => {
    if (!task || !slug) return false;
    return task.associated_slug === slug || task.slug === slug;
  };

  const getStudentTaskPool = (student) => {
    const directTasks = Array.isArray(student?.tasks) ? student.tasks : [];
    if (!isMacroCohort) return directTasks;

    const tasksFromProjects = (contextState?.allTasks || []).filter((task) => task?.user?.id === student?.user?.id);
    if (!tasksFromProjects.length) return directTasks;

    const byId = new Map();
    [...directTasks, ...tasksFromProjects].forEach((task) => {
      if (task?.id != null) byId.set(task.id, task);
    });
    return [...byId.values()];
  };

  const taskStatusRank = (task) => {
    if (!task) return -1;
    if (task.revision_status === 'APPROVED') return 5;
    if (task.task_status === 'DONE' && task.revision_status === 'PENDING') return 4;
    if (task.revision_status === 'REJECTED') return 3;
    if (task.task_status === 'PENDING' && task.revision_status === 'PENDING') return 2;
    return 1;
  };

  const taskTimestamp = (task) => {
    const raw = task?.delivered_at || task?.updated_at || task?.created_at;
    const ts = raw ? new Date(raw).getTime() : 0;
    return Number.isNaN(ts) ? 0 : ts;
  };

  const pickBestTask = (tasks = []) => tasks
    .slice()
    .sort((a, b) => {
      const rankDiff = taskStatusRank(b) - taskStatusRank(a);
      if (rankDiff !== 0) return rankDiff;
      return taskTimestamp(b) - taskTimestamp(a);
    })[0];

  /**
   * Varias tareas pueden compartir associated_slug por reintentos/cohort distintos.
   * Prioridad: cohort micro → sin cohort → cohort macro → primera.
   */
  const matchTaskForMicro = (student, micro, slug, macroCohort) => {
    if (!slug) return undefined;
    const taskPool = getStudentTaskPool(student);
    const candidates = taskPool.filter((task) => taskMatchesAssignmentSlug(task, slug));
    if (!candidates.length) return undefined;

    const microRef = { id: micro.id, slug: micro.slug };
    const macroRef = macroCohort ? { id: macroCohort.id, slug: macroCohort.slug } : null;

    const pick = (pred) => pickBestTask(candidates.filter(pred));

    return (
      pick((task) => sameCohortIdOrSlug(task.cohort, microRef))
      || pick((task) => !task.cohort)
      || (macroRef ? pick((task) => sameCohortIdOrSlug(task.cohort, macroRef)) : undefined)
      || pickBestTask(candidates)
    );
  };

  const matchTaskForCohort = (student, slug, cohortRef) => {
    if (!slug) return undefined;
    const taskPool = getStudentTaskPool(student);
    const candidates = taskPool.filter((task) => taskMatchesAssignmentSlug(task, slug));
    if (!candidates.length) return undefined;
    if (!cohortRef) return pickBestTask(candidates);
    return pickBestTask(candidates.filter((task) => sameCohortIdOrSlug(task.cohort, cohortRef)))
      || pickBestTask(candidates.filter((task) => !task.cohort))
      || pickBestTask(candidates);
  };

  const hasMicroLayout = isMacroCohort
    && Array.isArray(microCohortOrder)
    && microCohortOrder.length > 0
    && microSyllabusBySlug
    && Object.keys(microSyllabusBySlug).length > 0;

  return (
    <>
      {currentStudentList.map((student) => {
        const { user } = student;
        const fullname = `${student.user.first_name} ${student.user.last_name}`;
        const deliveredProjects = student.tasks.filter((task) => task.task_type === 'PROJECT' && task.task_status === 'DONE');
        const lastProjectDelivery = deliveredProjects.sort((a, b) => new Date(b.delivered_at) - new Date(a.delivered_at))[0];

        if (hasMicroLayout) {
          const totalDenom = microCohortOrder.reduce(
            (acc, m) => acc + (microSyllabusBySlug[m.slug]?.assignments?.length || 0),
            0,
          );
          const percentage = totalDenom
            ? Math.round(
              (student.tasks.reduce(
                (acum, val) => (val.task_status !== 'PENDING' && val.task_type === 'PROJECT' ? acum + 1 : acum),
                0,
              ) / totalDenom) * 100,
            )
            : 0;

          const extraTimelines = microCohortOrder.map((micro) => {
            const entry = microSyllabusBySlug[micro.slug];
            const assignmentsList = entry?.assignments || [];
            const microDone = assignmentsList.reduce((acum, elem) => {
              const s = assignmentSlugFromElem(elem);
              const st = matchTaskForMicro(student, micro, s, selectedCohort);
              return st && st.task_status !== 'PENDING' && st.task_type === 'PROJECT' ? acum + 1 : acum;
            }, 0);
            const pctMicro = assignmentsList.length ? Math.round((microDone / assignmentsList.length) * 100) : 0;
            const dots = assignmentsList.map((elem) => {
              const s = assignmentSlugFromElem(elem);
              const studentTask = matchTaskForMicro(student, micro, s, selectedCohort);
              const { mandatory } = elem;
              return {
                ...elem,
                ...studentTask,
                label: elem.title,
                highlight: mandatory,
                user,
                color: statusColors[getStatus(studentTask)] || 'gray',
              };
            });
            return {
              key: micro.slug,
              label: entry?.name || micro.name,
              meta: assignmentsList.length ? `${pctMicro}${t('delivered-percentage')}` : '',
              dots,
              emptyDotsMessage: assignmentsList.length === 0 ? t('syllabus-no-projects-in-cohort') : '',
            };
          });

          let mergeIndex = 0;
          const mergedDots = [];
          microCohortOrder.forEach((micro) => {
            const entry = microSyllabusBySlug[micro.slug];
            const assignmentsList = entry?.assignments || [];
            assignmentsList.forEach((elem) => {
              const s = assignmentSlugFromElem(elem);
              const studentTask = matchTaskForMicro(student, micro, s, selectedCohort);
              const { mandatory } = elem;
              mergedDots.push({
                ...elem,
                ...studentTask,
                label: elem.title,
                highlight: mandatory,
                user,
                color: statusColors[getStatus(studentTask)] || 'gray',
                dotRowKey: `${micro.slug}-${s || 'assignment'}-${mergeIndex}`,
              });
              mergeIndex += 1;
            });
          });
          const mergedEmptyMessage = totalDenom === 0 ? t('syllabus-no-projects-in-cohort') : '';

          return (
            <MacroStudentProgressCard
              key={student.id}
              ref={ref || null}
              studentHeaderNode={studentHeader(
                student,
                percentage,
                lastProjectDelivery,
                fullname,
                educationalStatusLabel(student.educational_status),
              )}
              extraTimelines={extraTimelines}
              mergedDots={mergedDots}
              mergedEmptyMessage={mergedEmptyMessage}
              onClickDots={showSingleTask}
            />
          );
        }

        const percentage = syllabusData.assignments?.length
          ? Math.round(
            (student.tasks.reduce(
              (acum, val) => (val.task_status !== 'PENDING' && val.task_type === 'PROJECT' ? acum + 1 : acum),
              0,
            ) / syllabusData.assignments.length) * 100,
          )
          : 0;
        const dots = (syllabusData.assignments || []).map((elem) => {
          const assignmentSlug = assignmentSlugFromElem(elem);
          const studentTask = matchTaskForCohort(student, assignmentSlug, selectedCohort);
          const { mandatory } = elem;
          return {
            ...elem,
            ...studentTask,
            label: elem.title,
            highlight: mandatory,
            user,
            color: statusColors[getStatus(studentTask)] || 'gray',
          };
        });
        return (
          <Box key={student.id} ref={ref || null}>
            <DottedTimeline
              onClickDots={showSingleTask}
              label={studentHeader(student, percentage, lastProjectDelivery, fullname)}
              dots={dots}
              emptyDotsMessage={
                !(syllabusData.assignments || []).length ? t('syllabus-no-projects-in-cohort') : ''
              }
              helpText={`${t('educational-status')}: ${student.educational_status}`}
            />
          </Box>
        );
      })}
    </>
  );
});

function StudentAssignments({
  currentStudentList,
  updpateAssignment,
  syllabusData,
  loadStatus,
  selectedCohort,
  count,
  loadStudents,
  isMacroCohort = false,
  microCohortOrder = [],
  microSyllabusBySlug = {},
}) {
  const router = useRouter();
  const [currentTask, setCurrentTask] = useState(null);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const pageCount = Math.ceil(count / itemsPerPage);

  const hasMore = currentStudentList.length < count && !loadStatus.loading;

  const loadMore = useCallback(async () => {
    await loadStudents(itemsPerPage, currentStudentList.length, true);

    setCurrentPage((prevPage) => prevPage + 1);
  }, [currentPage, currentStudentList]);

  const lang = {
    es: '/es/',
    en: '/',
  };

  return (
    <Box
      minHeight="34vh"
      borderRadius="3px"
      margin="0 auto"
      maxWidth="1012px"
      flexGrow={1}
      overflow="auto"
    >
      <Flex flexDirection="column" gridGap="18px">
        <InfiniteScroll
          data={currentStudentList}
          loadMore={loadMore}
          currentPage={currentPage}
          pageCount={pageCount}
          hasMore={hasMore}
        >
          <StudentsRows
            currentStudentList={currentStudentList}
            syllabusData={syllabusData}
            selectedCohort={selectedCohort}
            setCurrentTask={setCurrentTask}
            setDeliveryUrl={setDeliveryUrl}
            isMacroCohort={isMacroCohort}
            microCohortOrder={microCohortOrder}
            microSyllabusBySlug={microSyllabusBySlug}
          />
        </InfiniteScroll>
      </Flex>
      <ReviewModal
        currentTask={currentTask}
        projectLink={`${ORIGIN_HOST}${
          lang[router.locale]
        }project/${currentTask?.slug}`}
        updpateAssignment={updpateAssignment}
        isOpen={currentTask && (currentTask.status === 'DELIVERED' || currentTask.status === 'APPROVED')}
        onClose={() => setCurrentTask(null)}
        externalFile={currentTask?.file}
      />
      <NoInfoModal
        isOpen={currentTask && currentTask.status === 'NOT-OPENED'}
        onClose={() => setCurrentTask(null)}
        selectedCohort={selectedCohort}
      />
      <DeliverModal
        currentTask={currentTask}
        projectLink={`${ORIGIN_HOST}${
          lang[router.locale]
        }project/${currentTask?.slug}`}
        updpateAssignment={updpateAssignment}
        isOpen={currentTask && (currentTask.status === 'UNDELIVERED' || currentTask.status === 'REJECTED')}
        onClose={() => setCurrentTask(null)}
        deliveryUrl={deliveryUrl}
      />
      {/* <DetailsModal
        currentTask={currentTask}
        projectLink={`${ORIGIN_HOST}${
          lang[router.locale]
        }project/${currentTask?.slug}`}
        updpateAssignment={updpateAssignment}
        isOpen={currentTask && currentTask.status === 'APPROVED'}
        onClose={() => setCurrentTask(null)}
      /> */}
      {loadStatus.status === 'loading' && (
        <Box
          display="flex"
          justifyContent="center"
          mt="2rem"
          mb="5rem"
          position="relative"
        >
          <LoaderScreen width="80px" height="80px" />
        </Box>
      )}
    </Box>
  );
}

StudentAssignments.propTypes = {
  updpateAssignment: PropTypes.func.isRequired,
  loadStudents: PropTypes.func.isRequired,
  syllabusData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  loadStatus: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  currentStudentList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  selectedCohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  count: PropTypes.number.isRequired,
  isMacroCohort: PropTypes.bool,
  microCohortOrder: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  microSyllabusBySlug: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

StudentAssignments.defaultProps = {
  isMacroCohort: false,
  microCohortOrder: [],
  microSyllabusBySlug: {},
};

StudentsRows.propTypes = {
  syllabusData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  selectedCohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  currentStudentList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setCurrentTask: PropTypes.func.isRequired,
  setDeliveryUrl: PropTypes.func.isRequired,
  isMacroCohort: PropTypes.bool,
  microCohortOrder: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  microSyllabusBySlug: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

StudentsRows.defaultProps = {
  isMacroCohort: false,
  microCohortOrder: [],
  microSyllabusBySlug: {},
};

export default StudentAssignments;
