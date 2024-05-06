import { memo } from 'react';
import {
  Box, Button, Heading, useColorModeValue, useToast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Text from '../../common/components/Text';
import Module from './module';
import { startDay } from '../../common/hooks/useModuleHandler';
import Icon from '../../common/components/Icon';
import { reportDatalayer } from '../../utils/requests';

function ModuleMap({
  index, userId, contextState, setContextState, slug, modules, filteredModules,
  title, description, taskTodo, cohortData, taskCohortNull, filteredModulesByPending,
  showPendingTasks, searchValue, existsActivities,
}) {
  const { t } = useTranslation('dashboard');
  const toast = useToast();
  const commonBorderColor = useColorModeValue('gray.200', 'gray.900');
  const currentModules = showPendingTasks ? filteredModulesByPending : filteredModules;
  const cohortId = cohortData?.id || cohortData?.cohort_id;
  const handleStartDay = () => {
    const updatedTasks = (modules || [])?.map((l) => ({
      ...l,
      title: l.title,
      associated_slug: l?.slug?.slug || l.slug,
      description: '',
      task_type: l.task_type,
      cohort: cohortId,
    }));
    reportDatalayer({
      dataLayer: {
        event: 'open_syllabus_module',
        tasks: updatedTasks,
        cohort_id: cohortId,
      },
    });
    startDay({
      t,
      id: userId,
      newTasks: updatedTasks,
      contextState,
      setContextState,
      toast,
    });
  };

  const taskCohortNullExistsInModules = taskCohortNull.some((el) => {
    const task = modules.find((l) => l.slug === el.associated_slug);
    return task;
  });

  const isAvailableToSync = () => {
    if (!taskCohortNullExistsInModules
      && filteredModules.length > 0
      && searchValue.length === 0
      && modules.length !== filteredModules.length
    ) return true;
    return false;
  };

  return ((showPendingTasks && filteredModulesByPending !== null) || (showPendingTasks === false)) && (
    <Box
      key={index}
      width="100%"
      id={slug}
    >
      <Box margin="14px 0" display="flex" alignItems="center" justifyContent="space-between" gridGap="15px">
        <Heading as="h2" fontSize="22px">
          {title}
        </Heading>
        <Heading
          as="span"
          fontSize="15px"
          color={useColorModeValue('gray.default', 'white')}
          fontWeight="normal"
          textTransform="uppercase"
          textAlign="right"
        >
          {t('modules.activitiesLength', { count: filteredModules.length })}
        </Heading>
      </Box>
      <Text margin="0 0 22px 0px" color={useColorModeValue('#606060', 'white')} size="md">
        {description}
      </Text>

      {isAvailableToSync() && (
        <Box display="flex" alignItems="center" justifyContent="space-between" padding="16px 20px" borderRadius="18px" width="100%" background="yellow.light">
          <Text color={useColorModeValue('black', 'black')} size="16px">
            {t('modules.newActivities.title', { tasksLength: (modules.length - filteredModules.length) })}
          </Text>
          <Button
            variant="outline"
            color="blue.default"
            isDisabled={!cohortId}
            textTransform="uppercase"
            onClick={() => handleStartDay()}
            borderColor="blue.default"
            gridGap="8px"
          >
            <Icon icon="sync" width="20px" height="20px" />
            <Text color="blue.default" size="15px">
              {t('modules.newActivities.handler-text')}
            </Text>
          </Button>
        </Box>
      )}

      {filteredModules.length >= 1
        ? Array.isArray(currentModules) && currentModules.map((module, i) => {
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
            alignItems="center"
            borderColor={commonBorderColor}
          >
            <Text fontSize="15px" color="gray.default">
              {existsActivities ? t('modules.start-message') : t('modules.no-activities')}
            </Text>
            {existsActivities && (
              <Button
                color="blue.default"
                textTransform="uppercase"
                isDisabled={!cohortId}
                onClick={() => handleStartDay()}
                background="white"
                border="1px solid #0097CD"
                gridGap="8px"
              >
                <Text color="blue.default" size="15px">
                  {t('modules.start-module')}
                </Text>
              </Button>
            )}
          </Box>
        )}
    </Box>
  );
}

ModuleMap.propTypes = {
  index: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
  contextState: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setContextState: PropTypes.func.isRequired,
  title: PropTypes.string,
  slug: PropTypes.string,
  modules: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  filteredModules: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  description: PropTypes.string,
  taskTodo: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  cohortData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  taskCohortNull: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  filteredModulesByPending: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  showPendingTasks: PropTypes.bool,
  searchValue: PropTypes.string,
  existsActivities: PropTypes.bool.isRequired,
};
ModuleMap.defaultProps = {
  modules: [],
  filteredModules: [],
  title: 'HTML/CSS/Bootstrap',
  slug: 'html-css-bootstrap',
  description: '',
  taskTodo: [],
  cohortData: {},
  taskCohortNull: [],
  filteredModulesByPending: [],
  showPendingTasks: false,
  searchValue: '',
};

export default memo(ModuleMap);
