import { useState, useCallback, forwardRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Link from '../components/NextChakraLink';
import useStyle from '../hooks/useStyle';
import Icon from '../components/Icon';
import Text from '../components/Text';
import TaskLabel from '../components/taskLabel';
import { isGithubUrl } from '../../utils/regex';
import ButtonHandler from '../../js_modules/assignmentHandler/index';
import useAssignments from '../store/actions/assignmentsAction';
import PopoverHandler from '../../js_modules/assignmentHandler/PopoverHandler';
import LoaderScreen from '../components/LoaderScreen';
import InfiniteScroll from '../components/InfiniteScroll';
import { ORIGIN_HOST } from '../../utils/variables';

const ProjectsRows = forwardRef(({
  updpateAssignment,
  syllabusData,
  loadStatus,
  filteredTasks,
}, ref) => {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const { contextState } = useAssignments();
  const { borderColor2 } = useStyle();
  const lang = {
    es: '/es/',
    en: '/',
  };
  return (
    <>
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task, i) => {
          const index = i;
          const githubUrl = task?.github_url;
          const haveGithubDomain = githubUrl && isGithubUrl.test(githubUrl);
          const fullName = `${task.user.first_name} ${task.user.last_name}`;
          const projectLink = `${ORIGIN_HOST}${lang[router.locale]
          }project/${task.associated_slug}`;

          const isMandatory = syllabusData.assignments.find(
            (assignment) => assignment.slug === task.associated_slug && assignment.mandatory && task.revision_status !== 'APPROVED',
          );

          return (
            <Box
              ref={ref || null}
              key={`${index}-${task.slug}-${task.title}-${fullName}`}
              p="18px 28px"
              display="flex"
              width={{ base: 'max-content', md: '100%' }}
              minWidth={{ base: '620px', md: '100%' }}
              maxWidth={{ base: '620px', md: '100%' }}
              gridGap="10px"
              justifyContent="space-between"
              flexDirection="row"
              alignItems="center"
              border="1px solid"
              borderColor={borderColor2}
              borderRadius="17px"
            >
              <Box
                display="flex"
                width="auto"
                minWidth="calc(160px - 0.5vw)"
              >
                <Box width="28px" height="28px" marginRight="15px">
                  {isMandatory && (
                    <Icon
                      icon="warning"
                      color="yellow.default"
                      width="28px"
                      height="28px"
                      title="Mandatory task"
                    />
                  )}
                </Box>
                <TaskLabel currentTask={task} t={t} />
              </Box>

              <Box width="35%">
                <Text size="15px">{fullName}</Text>
                <Link
                  variant="default"
                  href={projectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {task.title}
                </Link>
              </Box>

              <PopoverHandler
                task={task}
                haveGithubDomain={haveGithubDomain}
                githubUrl={githubUrl}
              />

              <Box width="auto" minWidth="160px" textAlign="end">
                <ButtonHandler
                  currentTask={task}
                  contextState={contextState}
                  updpateAssignment={updpateAssignment}
                />
              </Box>
            </Box>
          );
        })
      ) : (
        <>
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
          {loadStatus.loading === false && (
          <Text
            size="25px"
            pt="3rem"
            textAlign="center"
            display="flex"
            width="auto"
            margin="0 auto"
            fontWeight="700"
          >
            {t('common:search-not-found')}
          </Text>
          )}
        </>
      )}
    </>
  );
});

function Projects({ updpateAssignment, syllabusData, loadStatus, getFilterAssignments, selectedCohort }) {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const { query } = router;
  const { academy } = query;
  const { contextState } = useAssignments();
  const [currentPage, setCurrentPage] = useState(1);
  const count = contextState.tasksCount;
  const itemsPerPage = 20;
  const pageCount = Math.ceil(count / itemsPerPage);

  const hasMore = contextState.allTasks.length < count && !loadStatus.loading;

  const filteredTasks = contextState.allTasks;

  const loadMore = useCallback(async () => {
    await getFilterAssignments(selectedCohort?.id, selectedCohort?.academy.id || academy, itemsPerPage, contextState.allTasks.length, true);

    setCurrentPage((prevPage) => prevPage + 1);
  }, [currentPage, contextState.allTasks]);

  return (
    <Box
      minHeight="34vh"
      borderRadius="3px"
      margin="0 auto"
      maxWidth="1012px"
      flexGrow={1}
      overflow="auto"
    >
      <Box
        display="flex"
        margin="20px 32px 20px 55px"
        gridGap="10px"
        justifyContent="space-between"
        flexDirection="row"
        alignItems="center"
        width={{ base: 'max-content', md: 'auto' }}
      >
        <Text
          size="15px"
          display="flex"
          width={{ base: '6.8rem', md: '50%' }}
          fontWeight="700"
        >
          {t('label.status')}
        </Text>
        <Text
          size="15px"
          display="flex"
          width={{ base: '13rem', md: '100%' }}
          fontWeight="700"
        >
          {t('label.student-and-assignments')}
        </Text>
        <Text
          size="15px"
          display="flex"
          width={{ base: '8.3rem', md: '40%' }}
          fontWeight="700"
        >
          {t('label.link')}
        </Text>
        <Text
          size="15px"
          display="flex"
          width={{ base: '25%', md: '25%' }}
          minWidth="115px"
          fontWeight="700"
        >
          {t('label.actions')}
        </Text>
      </Box>
      <Box display="flex" flexDirection="column" gridGap="18px">
        <InfiniteScroll
          data={contextState.allTasks}
          loadMore={loadMore}
          currentPage={currentPage}
          pageCount={pageCount}
          hasMore={hasMore}
        >
          <ProjectsRows
            updpateAssignment={updpateAssignment}
            syllabusData={syllabusData}
            loadStatus={loadStatus}
            filteredTasks={filteredTasks}
          />
        </InfiniteScroll>
        {loadStatus.loading && (
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
    </Box>
  );
}

Projects.propTypes = {
  updpateAssignment: PropTypes.func.isRequired,
  syllabusData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  selectedCohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  loadStatus: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  getFilterAssignments: PropTypes.func.isRequired,
};

ProjectsRows.propTypes = {
  updpateAssignment: PropTypes.func.isRequired,
  syllabusData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  filteredTasks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  loadStatus: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default Projects;
