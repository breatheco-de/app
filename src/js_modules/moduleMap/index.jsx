import { memo } from 'react';
import {
  Box, Button, Heading, useColorModeValue, useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../common/components/Text';
import Module from './module';
import { startDay } from '../../common/hooks/useModuleHandler';
import Icon from '../../common/components/Icon';

const ModuleMap = ({
  index, userId, contextState, setContextState, slug, modules, filteredModules,
  title, description, taskTodo,
}) => {
  const toast = useToast();
  const commonBorderColor = useColorModeValue('gray.200', 'gray.900');
  const handleStartDay = () => {
    const updatedTasks = (modules || [])?.map((l) => ({
      ...l,
      associated_slug: l.slug,
    }));

    startDay({
      id: userId,
      newTasks: updatedTasks,
      contextState,
      setContextState,
      toast,
    });
  };

  return (
    <Box
      key={index}
      width="100%"
      id={slug}
    >
      <Box margin="14px 0" display="flex" alignItems="center" justifyContent="space-between">
        <Heading as="h2" fontSize="22px">
          {title}
        </Heading>
        <Heading
          as="span"
          fontSize="15px"
          color={useColorModeValue('gray.default', 'white')}
          fontWeight="normal"
          textTransform="uppercase"
        >
          {modules.length}
          {' '}
          Activities
        </Heading>
      </Box>
      <Text margin="0 0 22px 0px" color={useColorModeValue('#606060', 'white')} size="md">
        {description}
      </Text>

      {filteredModules.length > 0 && modules.length !== filteredModules.length && (
        <Box display="flex" alignItems="center" justifyContent="space-between" padding="16px 20px" borderRadius="18px" width="100%" background="yellow.light">
          <Text color={useColorModeValue('black', 'black')} size="16px">
            {`Ey! There are ${modules.length - filteredModules.length} new activities on this day`}
          </Text>
          <Button
            color="blue.default"
            textTransform="uppercase"
            onClick={() => handleStartDay()}
            background="white"
            border="1px solid #0097CD"
            gridGap="8px"
          >
            <Icon icon="sync" width="20px" height="20px" />
            <Text color="blue.default" size="15px">
              Sync now
            </Text>
          </Button>
        </Box>
      )}

      {filteredModules.length >= 1
        ? filteredModules.map((module, i) => {
          const cheatedIndex = i;
          return (
            <Module
              key={`${module.title}-${cheatedIndex}`}
              currIndex={i}
              data={module}
              taskTodo={taskTodo}
            />
          );
        }) : (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            padding="0 0 28px 0"
            borderBottom={2}
            borderStyle="solid"
            borderColor={commonBorderColor}
          >
            <Text fontSize="15px" color="gray.default">
              {modules.length === 0 ? 'No activities for this module' : 'You have not started this module'}
            </Text>
            {modules.length !== 0 && (
              <Button
                color="blue.default"
                textTransform="uppercase"
                onClick={() => handleStartDay()}
                background="white"
                border="1px solid #0097CD"
                gridGap="8px"
              >
                <Text color="blue.default" size="15px">
                  Start module
                </Text>
              </Button>
            )}
          </Box>
        )}
    </Box>
  );
};

ModuleMap.propTypes = {
  index: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
  contextState: PropTypes.objectOf(PropTypes.any).isRequired,
  setContextState: PropTypes.func.isRequired,
  title: PropTypes.string,
  slug: PropTypes.string,
  modules: PropTypes.arrayOf(PropTypes.object),
  filteredModules: PropTypes.arrayOf(PropTypes.object),
  description: PropTypes.string,
  taskTodo: PropTypes.arrayOf(PropTypes.object),
};
ModuleMap.defaultProps = {
  modules: [],
  filteredModules: [],
  title: 'HTML/CSS/Bootstrap',
  slug: 'html-css-bootstrap',
  description: '',
  taskTodo: [],
};

export default memo(ModuleMap);
