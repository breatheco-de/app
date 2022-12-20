import {
  Box, Flex, Heading,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import useStyle from '../../hooks/useStyle';
import useProgramList from '../../store/actions/programListAction';
import Icon from '../Icon';
import Counter from '../ProgressCircle/Counter';
import Text from '../Text';
import Progress from './Progress';

const ProgressBar = ({
  progressText, taskTodo, width,
}) => {
  const router = useRouter();
  const { addTasksProgramList } = useProgramList();

  const allLessons = taskTodo.filter((l) => l.task_type === 'LESSON');
  const allExercises = taskTodo.filter((e) => e.task_type === 'EXERCISE');
  const allProjects = taskTodo.filter((p) => p.task_type === 'PROJECT');
  const allQuiz = taskTodo.filter((q) => q.task_type === 'QUIZ');
  const { fontColor } = useStyle();

  const allTasks = [
    {
      title: 'Lesson',
      icon: 'book',
      task_type: 'LESSON',
      taskLength: allLessons.length,
      completed: allLessons.filter((l) => l.task_status === 'DONE').length,
    },
    {
      title: 'Exercise',
      icon: 'strength',
      task_type: 'EXERCISE',
      taskLength: allExercises.length,
      completed: allExercises.filter((e) => e.task_status === 'DONE').length,
    },
    {
      title: 'Project',
      icon: 'code',
      task_type: 'PROJECT',
      taskLength: allProjects.length,
      completed: allProjects.filter((p) => p.task_status === 'DONE').length,
    },
    {
      title: 'Quiz',
      icon: 'answer',
      task_type: 'QUIZ',
      taskLength: allQuiz.length,
      completed: allQuiz.filter((q) => q.task_status === 'DONE').length,
    },
  ];

  const calculatePercentage = () => {
    let sumTaskCompleted = 0;
    let sumTaskLength = 0;
    for (let i = 0; i < allTasks.length; i += 1) {
      sumTaskCompleted += allTasks[i].completed;
      sumTaskLength += allTasks[i].taskLength;
    }
    return Math.trunc((sumTaskCompleted / sumTaskLength) * 100);
  };
  const percentage = calculatePercentage() || 0;

  useEffect(() => {
    if (router?.query?.cohortSlug) {
      addTasksProgramList({ list: allTasks, percentage: calculatePercentage() || 0 });
    }
  }, [router?.query?.cohortSlug, taskTodo]);

  return (
    <Box width={width || '100%'}>
      <Flex marginBottom="15px" gridGap="10px" align="center">
        <Heading fontSize="22px" marginY="0">
          <Counter valueTo={percentage} totalDuration={2} />
          %
        </Heading>
        <Text size="l" marginY="0">
          {progressText}
        </Text>
      </Flex>
      <Progress percents={percentage} />
      <Flex justifyContent="space-around" marginTop="18px" flexWrap="wrap" gridGap="6px">
        {allTasks.map((program) => (
          <Box key={program.title} display="flex">
            <Icon
              icon={program.icon || 'book'}
              width="18px"
              height="18px"
              color={fontColor}
              style={{ marginTop: '2px' }}
            />
            <Text marginLeft="11px" size="l" marginY="0">
              {`${program.title}: ${program.completed}/${program.taskLength}`}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

ProgressBar.propTypes = {
  width: PropTypes.string,
  progressText: PropTypes.string,
  taskTodo: PropTypes.arrayOf(PropTypes.object),
};
ProgressBar.defaultProps = {
  width: '100%',
  progressText: 'progress in the program',
  taskTodo: [],
};

export default ProgressBar;
