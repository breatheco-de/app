import {
  Box, Heading, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../common/components/Text';
import Module from './module';

const ModuleMap = ({
  index, read, practice, code, answer, title, description, taskTodo,
}) => {
  const updatedRead = read.map((el) => ({
    ...el,
    type: 'Read',
    icon: 'book',
    task_type: 'LESSON',
  }));
  const updatedPractice = practice.map((el) => ({
    ...el,
    type: 'Practice',
    icon: 'strength',
    task_type: 'EXERCISE',
  }));
  const updatedCode = code.map((el) => ({
    ...el,
    type: 'Code',
    icon: 'code',
    task_type: 'PROJECT',
  }));
  const updatedAnswer = answer.map((el) => ({
    ...el,
    type: 'Answer',
    icon: 'answer',
    task_type: 'QUIZ',
  }));

  const modules = [...updatedRead, ...updatedPractice, ...updatedCode, ...updatedAnswer];

  // console.log('taskTodo:::', taskTodo);
  return (
    <Box key={index} width="100%">
      <Box display="flex" justifyContent="space-between">
        <Heading as="h1" fontSize="22px">
          {title}
        </Heading>
        <Heading
          as="h6"
          fontSize="15px"
          color={useColorModeValue('gray.default', 'white')}
          fontWeight="normal"
        >
          {modules.length}
          {' '}
          Lessons
        </Heading>
      </Box>
      <Text color={useColorModeValue('#606060', 'white')} size="md">
        {description}
      </Text>

      {/* NOTE: MODULE COMPONENT */}
      {modules.map((module, i) => (
        <Module
          // eslint-disable-next-line react/no-array-index-key
          key={`${module.title}-${i}`}
          currIndex={i}
          data={module}
          taskTodo={taskTodo}
        />
      ))}
    </Box>
  );
};

ModuleMap.propTypes = {
  index: PropTypes.number.isRequired,
  title: PropTypes.string,
  read: PropTypes.arrayOf(PropTypes.object),
  practice: PropTypes.arrayOf(PropTypes.object),
  code: PropTypes.arrayOf(PropTypes.object),
  answer: PropTypes.arrayOf(PropTypes.object),
  description: PropTypes.string,
  taskTodo: PropTypes.arrayOf(PropTypes.object),
};
ModuleMap.defaultProps = {
  read: [],
  practice: [],
  code: [],
  answer: [],
  title: 'HTML/CSS/Bootstrap',
  description: '',
  taskTodo: [],
};

export default ModuleMap;
