import {
  Box, Heading, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../common/components/Text';
import Module from './module';

const ModuleMap = ({
  index, modules, filteredModules, title, description, taskTodo,
}) => {
  console.log('allModules:::', modules);
  console.log('filteredModules:::', filteredModules);

  return (
    <Box key={index} width="100%">
      <Box margin="14px 0" display="flex" alignItems="center" justifyContent="space-between">
        <Heading as="h2" fontSize="22px">
          {title}
        </Heading>
        <Heading
          as="span"
          fontSize="15px"
          color={useColorModeValue('gray.default', 'white')}
          fontWeight="normal"
        >
          {modules.length}
          {' '}
          Lessons
        </Heading>
      </Box>
      <Text margin="0 0 22px 0px" color={useColorModeValue('#606060', 'white')} size="md">
        {description}
      </Text>

      {filteredModules.length > 0 && modules.length !== filteredModules.length && (
        <Text color={useColorModeValue('blue.default', 'blue.300')} size="sm">
          unsynchronized module
        </Text>
      )}

      {/* NOTE: MODULE COMPONENT */}
      {filteredModules.map((module, i) => {
        const cheatedIndex = i;
        return (
          <Module
            key={`${module.title}-${cheatedIndex}`}
            currIndex={i}
            data={module}
            taskTodo={taskTodo}
          />
        );
      })}
    </Box>
  );
};

ModuleMap.propTypes = {
  index: PropTypes.number.isRequired,
  title: PropTypes.string,
  modules: PropTypes.arrayOf(PropTypes.object),
  filteredModules: PropTypes.arrayOf(PropTypes.object),
  description: PropTypes.string,
  taskTodo: PropTypes.arrayOf(PropTypes.object),
};
ModuleMap.defaultProps = {
  modules: [],
  filteredModules: [],
  title: 'HTML/CSS/Bootstrap',
  description: '',
  taskTodo: [],
};

export default ModuleMap;
