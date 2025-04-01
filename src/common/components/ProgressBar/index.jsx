import {
  Box, Flex, Heading,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import handlers from '../../handlers';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';
import Counter from '../ProgressCircle/Counter';
import Text from '../Text';
import Progress from './Progress';
import { usePersistent } from '../../hooks/usePersistent';
import useCohortHandler from '../../hooks/useCohortHandler';

function ProgressBar({
  progressText, cohortProgram, taskTodo, width,
}) {
  const { fontColor } = useStyle();
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [programsList] = usePersistent('programsList', {});
  const [taskCount, setTaskCount] = useState({});
  const currentCohortInfo = programsList[cohortSession?.slug || {}];
  const { allTasks, percentage } = handlers.handleTasks({ tasks: taskTodo, cohortInfo: currentCohortInfo });
  const percentageLimited = percentage > 100 ? 100 : percentage;
  const taskPercentageLimited = taskCount?.percentage > 100 ? 100 : taskCount?.percentage;

  useEffect(() => {
    if (allTasks?.cohortId !== undefined) return;
    if (taskTodo && cohortProgram) {
      handlers.getAssignmentsCount({ data: cohortProgram, taskTodo, cohortId: cohortSession?.id })
        .then((assignmentData) => {
          if (cohortSession?.slug) {
            setTaskCount(assignmentData);
          }
        });
    }
  }, [taskTodo, cohortProgram]);

  const tasksList = allTasks?.cohortId ? allTasks : taskCount.allTasks;

  return (
    <Box width={width || '100%'}>
      <Flex marginBottom="15px" gridGap="10px" align="center">
        <Heading fontSize="22px" marginY="0">
          <Counter valueTo={percentageLimited || taskPercentageLimited} totalDuration={2} />
          %
        </Heading>
        <Text size="l" marginY="0">
          {progressText}
        </Text>
      </Flex>
      <Progress percents={percentageLimited} />
      <Flex justifyContent="space-around" marginTop="18px" flexWrap="wrap" gridGap="6px">
        {tasksList?.length > 0 && tasksList.map((program) => (
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
}

ProgressBar.propTypes = {
  width: PropTypes.string,
  progressText: PropTypes.string,
  taskTodo: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  cohortProgram: PropTypes.oneOfType([PropTypes.any]),
};
ProgressBar.defaultProps = {
  width: '100%',
  progressText: 'progress in the program',
  taskTodo: [],
  cohortProgram: {},
};

export default ProgressBar;
