import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../Heading';
import ProgressCircle from '../ProgressCircle';
import Text from '../Text';
import { toCapitalize } from '../../../utils';

function SubTasks({
  subTasks, title, description, assetType,
}) {
  const { t } = useTranslation('common');

  const tasksDone = subTasks.length > 0 && subTasks?.filter((subtask) => subtask.status === 'DONE');
  const taskPercent = Math.round((tasksDone.length / subTasks.length) * 100);
  const assetValue = t(`common:asset-type-pronouns.${assetType.toLowerCase()}`);

  return subTasks.length > 0 && (
    <Box display="flex" border="2px solid" borderColor="blue.default" borderRadius="18px" p="16px 22px" mt="18px" gridGap="19px" alignItems="center">
      <ProgressCircle size={74} duration={1} delay={0.3} percents={taskPercent} counterString={`${tasksDone.length} / ${subTasks.length}`} />
      <Box display="flex" flexDirection="column" gridGap="6px">
        <Heading as="p" size="18px" style={{ margin: 0 }}>
          {title || toCapitalize(t('subtasks.title', { count: subTasks.length, asset_type: assetValue }))}
        </Heading>
        <Text size="14px" color="gray.600" p={{ base: '0', md: '0 14% 0 0' }} style={{ margin: 0 }}>
          {description || t('subtasks.description')}
        </Text>
      </Box>
    </Box>
  );
}

SubTasks.propTypes = {
  subTasks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  title: PropTypes.string,
  description: PropTypes.string,
  assetType: PropTypes.string,
};

SubTasks.defaultProps = {
  subTasks: [],
  title: '',
  description: '',
  assetType: 'lesson',
};

export default SubTasks;
