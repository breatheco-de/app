import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../Heading';
import ProgressCircle from '../ProgressCircle';
import Text from '../Text';

const SubTasks = ({
  subTasks, title, description, stTranslation,
}) => {
  const { t, lang } = useTranslation('common');

  const stTitle = stTranslation && stTranslation[lang].common.subtasks.title.replace('{{count}}', subTasks.length);
  const stDescription = stTranslation && stTranslation[lang].common.subtasks.description;

  const tasksDone = subTasks.length > 0 && subTasks?.filter((subtask) => subtask.status === 'DONE');
  const taskPercent = Math.round((tasksDone.length / subTasks.length) * 100);

  return subTasks.length > 0 && (
    <Box display="flex" border="2px solid" borderColor="blue.default" borderRadius="18px" p="16px 22px" mt="18px" gridGap="19px" alignItems="center">
      <ProgressCircle size={74} percents={taskPercent} counterString={`${tasksDone.length} / ${subTasks.length}`} />
      <Box display="flex" flexDirection="column" gridGap="6px">
        <Heading as="p" size="18px" style={{ margin: 0 }}>
          {title || stTitle || t('subtasks.title', { count: subTasks.length })}
        </Heading>
        <Text size="14px" color="gray.600" p={{ base: '0', md: '0 14% 0 0' }} style={{ margin: 0 }}>
          {description || stDescription || t('subtasks.description')}
        </Text>
      </Box>
    </Box>
  );
};

SubTasks.propTypes = {
  subTasks: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
  description: PropTypes.string,
  stTranslation: PropTypes.objectOf(PropTypes.any),
};

SubTasks.defaultProps = {
  subTasks: [],
  title: '',
  description: '',
  stTranslation: null,
};

export default SubTasks;
