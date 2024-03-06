import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';
import Heading from './Heading';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import AcordionList from './AcordionList';

function CourseContent({ data }) {
  const { hexColor } = useStyle();

  const getAssetCount = () => {
    const assetType = {
      lesson: 0,
      project: 0,
      quiz: 0,
      exercise: 0,
    };
    data?.modules.forEach((module) => {
      module?.content.forEach((task) => {
        if (task?.task_type) {
          const taskType = task?.task_type?.toLowerCase();
          assetType[taskType] += 1;
        }
      });
    });

    return assetType;
  };
  const assetCount = getAssetCount();

  return (
    <Flex gridGap="12px" flexDirection="column" my="100px">
      <Heading as="h2" size="20px">
        Course Content
      </Heading>
      <Text size="14px" color={hexColor.fontColor2}>
        {`${assetCount.lesson} Readings, ${assetCount.exercise} Exercises, ${assetCount.project} Projects`}
      </Text>

      <AcordionList list={data?.modules} />
    </Flex>
  );
}
CourseContent.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object])),
};
CourseContent.defaultProps = {
  data: {},
};
export default CourseContent;
