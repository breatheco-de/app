/* eslint-disable no-unused-vars */
import { useState, useCallback, forwardRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  Box,
  Avatar,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import bc from '../services/breathecode';
import DottedTimeline from '../components/DottedTimeline';
import NextChakraLink from '../components/NextChakraLink';
import useStyle from '../hooks/useStyle';
import useFormatTimeString from '../hooks/useFormatTimeString';
import { ReviewModal, NoInfoModal, DeliverModal, DetailsModal } from '../../js_modules/assignmentHandler/index';
import LoaderScreen from '../components/LoaderScreen';
import InfiniteScroll from '../components/InfiniteScroll';
import { ORIGIN_HOST } from '../../utils/variables';

const StudentsRows = forwardRef(({ currentStudentList, syllabusData, selectedCohort, setCurrentTask, setDeliveryUrl }, ref) => {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const { query } = router;
  const { academy, cohortSlug } = query;
  const { formatTimeString } = useFormatTimeString();
  const toast = useToast();
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
      const academyId = selectedCohort?.academy || academy;
      if (status === 'UNDELIVERED' || status === 'REJECTED') {
        const { data } = await bc.todo().deliver({
          id: task.id,
          academy: academyId,
        });
        setDeliveryUrl(data.delivery_url);
      } else if (status === 'APPROVED' || status === 'DELIVERED') {
        const assetResp = await bc.lesson().getAsset(task.slug);
        if (assetResp && assetResp.status < 400) {
          const dataAsset = assetResp.data;
          if (!dataAsset?.delivery_formats.includes('url')) {
            const fileResp = await bc.todo().getFile({ id: task.id, academyId: selectedCohort?.academy || academy });
            if (fileResp && fileResp.status < 400) {
              file = await fileResp.data;
            }
          }
        }
      }
      setCurrentTask({ ...task, status, file });
    } catch (e) {
      toast({
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

  return (
    <>
      {currentStudentList.map((student) => {
        const { user } = student;
        const fullname = `${student.user.first_name} ${student.user.last_name}`;
        const deliveredProjects = student.tasks.filter((task) => task.task_type === 'PROJECT' && task.task_status === 'DONE');
        const percentage = Math.round((student.tasks.reduce((acum, val) => (val.task_status !== 'PENDING' && val.task_type === 'PROJECT' ? acum + 1 : acum), 0) / syllabusData.assignments.length) * 100);
        const lastProjectDelivery = deliveredProjects.sort((a, b) => new Date(b.delivered_at) - new Date(a.delivered_at))[0];
        const dots = syllabusData.assignments.map((elem) => {
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
              label={(
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
                    {/* <small>{lastDeliver ? t('last-deliver', { date: formatTimeString(new Date(lastDeliver)) }) : t('no-deliver')}</small> */}
                    {lastProjectDelivery?.delivered_at && (
                      <small>
                        {' - '}
                        {t('last-deliver', { date: formatTimeString(new Date(lastProjectDelivery.delivered_at)) })}
                      </small>
                    )}
                  </Box>
                </Flex>
                      )}
              dots={dots}
              helpText={`${t('educational-status')}: ${student.educational_status}`}
            />
          </Box>
        );
      })}
    </>
  );
});

function StudentAssignments({ currentStudentList, updpateAssignment, syllabusData, loadStatus, selectedCohort, count, loadStudents }) {
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
};

StudentsRows.propTypes = {
  syllabusData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  selectedCohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  currentStudentList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setCurrentTask: PropTypes.func.isRequired,
  setDeliveryUrl: PropTypes.func.isRequired,
};

export default StudentAssignments;
