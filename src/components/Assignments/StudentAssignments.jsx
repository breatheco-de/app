/* eslint-disable no-unused-vars */
import { useState, useCallback, forwardRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  Box,
  Avatar,
  Flex,
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

  const getStatus = (task) => {
    if (!task) return 'NOT-OPENED';
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

  const studentHeader = (student, percentage, lastProjectDelivery, fullname) => (
    <Flex gridGap="10px" alignItems="center">
      <Avatar
        src={student.user.profile?.avatar_url}
        width="25px"
        height="25px"
        style={{ userSelect: 'none' }}
      />
      <Box>
        <p>
          <NextChakraLink textDecoration="underline" href={`/cohort/${cohortSlug}/student/${student.user.id}?academy=${academy}`}>{fullname}</NextChakraLink>
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

  /**
   * Varias tareas pueden compartir associated_slug por reintentos/cohort distintos.
   * Prioridad: cohort micro → sin cohort → cohort macro → primera.
   */
  const matchTaskForMicro = (student, micro, slug, macroCohort) => {
    if (!slug || !Array.isArray(student.tasks)) return undefined;
    const candidates = student.tasks.filter((task) => task.associated_slug === slug);
    if (!candidates.length) return undefined;

    const microRef = { id: micro.id, slug: micro.slug };
    const macroRef = macroCohort ? { id: macroCohort.id, slug: macroCohort.slug } : null;

    const pick = (pred) => candidates.find(pred);

    return (
      pick((task) => sameCohortIdOrSlug(task.cohort, microRef))
      || pick((task) => !task.cohort)
      || (macroRef ? pick((task) => sameCohortIdOrSlug(task.cohort, macroRef)) : undefined)
      || candidates[0]
    );
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

          return (
            <Box key={student.id} ref={ref || null}>
              <DottedTimeline
                onClickDots={showSingleTask}
                label={studentHeader(student, percentage, lastProjectDelivery, fullname)}
                dots={[]}
                extraTimelines={extraTimelines}
                helpText={`${t('educational-status')}: ${student.educational_status}`}
              />
            </Box>
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
          const studentTask = student.tasks.find((task) => task.associated_slug === elem.slug);
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
        isOpen={currentTask && !currentTask.status}
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
