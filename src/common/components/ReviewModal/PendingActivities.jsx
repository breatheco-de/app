// import { useState } from 'react';
import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Icon from '../Icon';
import Text from '../Text';
import Heading from '../Heading';
import useCohortHandler from '../../hooks/useCohortHandler';
import useStyle from '../../hooks/useStyle';
import SyllabusActivity from '../SyllabusModule/SyllabusActivity';

function PendingActivities({ cohortSlug, setStage }) {
  const { t } = useTranslation('dashboard');

  const { hexColor, featuredLight, fontColor } = useStyle();
  const { getMandatoryProjects, taskTodo } = useCohortHandler();

  const mandatoryProjects = getMandatoryProjects(cohortSlug);

  return (
    <Box>
      <Box backgroundColor={featuredLight} padding="8px" borderRadius="8px" border="1px solid" borderColor={hexColor.borderColor}>
        <Box mb="5px" display="flex" alignItems="center" gap="5px">
          <Icon icon="info" width="14px" height="14px" color={fontColor} />
          <Heading size="md">
            {t('mandatoryProjects.title')}
          </Heading>
        </Box>
        <Text size="md">
          {t('mandatoryProjects.description')}
        </Text>
      </Box>
      {mandatoryProjects.map((project, i) => (
        <SyllabusActivity
          key={`${project.title}-pending-modal`}
          currIndex={i}
          data={project}
          taskTodo={taskTodo}
          showWarning={false}
          cohortSlug={cohortSlug}
          setStage={setStage}
        />
      ))}
    </Box>
  );
}

PendingActivities.propTypes = {
  cohortSlug: PropTypes.string,
  setStage: PropTypes.func,
};

PendingActivities.defaultProps = {
  cohortSlug: null,
  setStage: null,
};

export default PendingActivities;
