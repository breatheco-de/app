/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Link from '../components/NextChakraLink';
import { usePersistent } from '../hooks/usePersistent';
import useStyle from '../hooks/useStyle';
import Icon from '../components/Icon';
import Text from '../components/Text';
import TaskLabel from '../components/taskLabel';
import { isGithubUrl } from '../../utils/regex';
import ButtonHandler from '../../js_modules/assignmentHandler/index';
import useAssignments from '../store/actions/assignmentsAction';
import { isWindow } from '../../utils';
import PopoverHandler from '../../js_modules/assignmentHandler/PopoverHandler';
import LoaderScreen from '../components/LoaderScreen';
import { ORIGIN_HOST } from '../../utils/variables';

function Projects({ updpateAssignment, syllabusData, loadStatus }) {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const { query } = router;
  const { contextState } = useAssignments();
  const [cohortSession] = usePersistent('cohortSession', {});
  // const [allTasksPaginationProps, setAllTasksPaginationProps] = useState({});
  const [allTasksOffset, setAllTasksOffset] = useState(20);
  const [isFetching, setIsFetching] = useState(false);
  const { borderColor2 } = useStyle();

  const lang = {
    es: '/es/',
    en: '/',
  };

  const queryStudentExists = query.student !== undefined && query.student?.length > 0;
  const queryStatusExists = query.status !== undefined && query.status?.length > 0;
  const queryProjectExists = query.project !== undefined && query.project?.length > 0;

  const filteredTasks = contextState.allTasks.length > 0
    ? contextState.allTasks
      .filter((_, i) => i < allTasksOffset)
    : [];

  const handleScroll = () => {
    const scrollTop = isWindow && document.documentElement.scrollTop;
    const offsetHeight = isWindow && document.documentElement.offsetHeight + 15;
    const innerHeight = isWindow && window.innerHeight;
    if (innerHeight + scrollTop <= offsetHeight && !queryStudentExists) return;
    setIsFetching(true);
  };

  useEffect(() => {
    if (allTasksOffset < contextState.allTasks.length) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    return () => { };
  }, [allTasksOffset, contextState]);

  useEffect(() => {
    if (!isFetching) return;
    if (queryStudentExists || queryProjectExists || queryStatusExists) {
      setAllTasksOffset(contextState.allTasks.length);
      setIsFetching(false);
    }

    if (filteredTasks && allTasksOffset < contextState.allTasks.length) {
      if (!queryStudentExists) {
        setAllTasksOffset(allTasksOffset + 20);
        setIsFetching(false);
      }
    } else {
      setIsFetching(false);
    }
  }, [isFetching, queryStatusExists, queryProjectExists, queryStudentExists]);

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
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, i) => {
            const index = i;
            const githubUrl = task?.github_url;
            const haveGithubDomain = githubUrl && isGithubUrl.test(githubUrl);
            const fullName = `${task.user.first_name} ${task.user.last_name}`;
            const projectLink = `${ORIGIN_HOST}${lang[router.locale]
            }project/${task.associated_slug}`;

            return (
              <Box
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
                    {syllabusData.assignments.find(
                      (assignment) => assignment.slug === task.associated_slug && assignment.mandatory,
                    ) && (
                    <Icon
                      icon="warning"
                      color="yellow.default"
                      width="28px"
                      height="28px"
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
                    cohortSession={cohortSession}
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
        {allTasksOffset < contextState.allTasks.length !== null
          && isFetching && (
            <Box
              display="flex"
              justifyContent="center"
              mt="2rem"
              mb="5rem"
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
  loadStatus: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default Projects;
