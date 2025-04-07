import { memo } from 'react';
import {
  Box, Button, Heading, useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { reportDatalayer } from '../../../utils/requests';
import { languageFix, getBrowserInfo } from '../../../utils';
import Text from '../Text';
import SyllabusActivity from './SyllabusActivity';
import useCohortHandler from '../../hooks/useCohortHandler';
import Icon from '../Icon';

function SyllabusModule({
  index, slug, content, filteredContent,
  title, description, cohortData, filteredContentByPending,
  showPendingTasks, searchValue, existsActivities,
}) {
  const { t, lang } = useTranslation('dashboard');
  const { state, startDay } = useCohortHandler();
  const { taskCohortNull } = state;
  const commonBorderColor = useColorModeValue('gray.200', 'gray.900');
  const currentTasks = showPendingTasks ? filteredContentByPending : filteredContent;
  const cohortId = cohortData?.id || cohortData?.cohort_id;

  const handleStartDay = () => {
    const updatedTasks = (content || [])?.map((l) => ({
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
        agent: getBrowserInfo(),
      },
    });
    startDay({
      cohort: cohortData,
      newTasks: updatedTasks,
    });

    if (content && content.length > 0) {
      const firstModule = content[0];
      const langPrefix = lang !== 'en' ? `/${lang}` : '';
      const moduleSlug = firstModule?.slug?.slug || firstModule.slug;
      const moduleType = firstModule.task_type.toLowerCase();
      const url = `${langPrefix}/syllabus/${cohortData.slug}/${moduleType}/${moduleSlug}`;
      window.location.href = url;
    }
  };

  const taskCohortNullExistsInModules = taskCohortNull.some((el) => {
    const task = content.find((l) => l.slug === el.associated_slug);
    return task;
  });

  const isAvailableToSync = () => {
    if (!taskCohortNullExistsInModules
      && filteredContent.length > 0
      && searchValue.length === 0
      && content.length !== filteredContent.length
    ) return true;
    return false;
  };

  return ((showPendingTasks && filteredContentByPending !== null) || (showPendingTasks === false)) && (
    <Box
      key={index}
      width="100%"
      id={slug}
    >
      <Box margin="14px 0" display="flex" alignItems="center" justifyContent="space-between" gridGap="15px">
        <Heading as="h2" fontSize="22px">
          {languageFix(title, lang)}
        </Heading>
        <Heading
          as="span"
          fontSize="15px"
          color={useColorModeValue('gray.default', 'white')}
          fontWeight="normal"
          textTransform="uppercase"
          textAlign="right"
        >
          {t('modules.activitiesLength', { count: filteredContent.length })}
        </Heading>
      </Box>
      <Text margin="0 0 22px 0px" color={useColorModeValue('#606060', 'white')} size="md">
        {languageFix(description, lang)}
      </Text>

      {isAvailableToSync() && (
        <Box display="flex" alignItems="center" justifyContent="space-between" padding="16px 20px" borderRadius="18px" width="100%" background="yellow.light">
          <Text color={useColorModeValue('black', 'black')} size="16px">
            {t('modules.newActivities.title', { tasksLength: (content.length - filteredContent.length) })}
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

      {filteredContent.length >= 1
        ? Array.isArray(currentTasks) && currentTasks.map((task, i) => {
          const cheatedIndex = i;
          return (
            <SyllabusActivity
              key={`${task.title}-${cheatedIndex}`}
              currIndex={i}
              data={task}
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
                border="1px solid blue.default"
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

SyllabusModule.propTypes = {
  index: PropTypes.number.isRequired,
  title: PropTypes.string,
  slug: PropTypes.string,
  content: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  filteredContent: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  description: PropTypes.string,
  cohortData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  filteredContentByPending: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  showPendingTasks: PropTypes.bool,
  searchValue: PropTypes.string,
  existsActivities: PropTypes.bool.isRequired,
};
SyllabusModule.defaultProps = {
  content: [],
  filteredContent: [],
  title: 'HTML/CSS/Bootstrap',
  slug: 'html-css-bootstrap',
  description: '',
  cohortData: {},
  filteredContentByPending: [],
  showPendingTasks: false,
  searchValue: '',
};

export default memo(SyllabusModule);
