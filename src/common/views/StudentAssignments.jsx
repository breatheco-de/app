import { useState } from 'react';
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
import useStyle from '../hooks/useStyle';
import useFormatTimeString from '../hooks/useFormatTimeString';
import { ReviewModal, NoInfoModal, DeliverModal, DetailsModal } from '../../js_modules/assignmentHandler/index';
import LoaderScreen from '../components/LoaderScreen';
import { ORIGIN_HOST } from '../../utils/variables';

function StudentAssignments({ currentStudentList, updpateAssignment, syllabusData, loadStatus, selectedCohort }) {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const { query } = router;
  const { academy } = query;
  const toast = useToast();
  const { formatTimeString } = useFormatTimeString();
  const { hexColor } = useStyle();
  const [currentTask, setCurrentTask] = useState(null);
  const [deliveryUrl, setDeliveryUrl] = useState('');

  const lang = {
    es: '/es/',
    en: '/',
  };

  const statusColors = {
    APPROVED: hexColor.green,
    REJECTED: hexColor.danger,
    UNDELIVERED: hexColor.danger,
    DELIVERED: hexColor.yellowDefault,
  };

  const getStatus = (task) => {
    if (!task) return null;
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
        {currentStudentList.map((student) => {
          const { user } = student;
          const fullname = `${student.user.first_name} ${student.user.last_name}`;
          const percentage = Math.round((student.tasks.reduce((acum, val) => (val.task_status !== 'PENDING' && val.task_type === 'PROJECT' ? acum + 1 : acum), 0) / syllabusData.assignments.length) * 100);
          const lastDeliver = student.tasks.reduce((date, val) => {
            if (date) return date > val ? date : val.updated_at;
            if (val.updated_at && val.task_status !== 'PENDING' && val.task_type === 'PROJECT') return val.updated_at;
            return null;
          }, null);
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
            <DottedTimeline
              key={student.id}
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
                    <p>{fullname}</p>
                    <small>{`${percentage}${t('delivered-percentage')} - `}</small>
                    <small>{lastDeliver ? t('last-deliver', { date: formatTimeString(new Date(lastDeliver)) }) : t('no-deliver')}</small>
                  </Box>
                </Flex>
                    )}
              dots={dots}
              helpText={`${t('educational-status')}: ${student.educational_status}`}
            />
          );
        })}
      </Flex>
      <ReviewModal
        currentTask={currentTask}
        projectLink={`${ORIGIN_HOST}${
          lang[router.locale]
        }project/${currentTask?.slug}`}
        updpateAssignment={updpateAssignment}
        isOpen={currentTask && currentTask.status === 'DELIVERED'}
        onClose={() => setCurrentTask(null)}
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
      <DetailsModal
        currentTask={currentTask}
        projectLink={`${ORIGIN_HOST}${
          lang[router.locale]
        }project/${currentTask?.slug}`}
        updpateAssignment={updpateAssignment}
        isOpen={currentTask && currentTask.status === 'APPROVED'}
        onClose={() => setCurrentTask(null)}
      />
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
  syllabusData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  loadStatus: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  currentStudentList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  selectedCohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default StudentAssignments;
