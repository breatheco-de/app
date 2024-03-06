import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Heading from './Heading';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import AcordionList from './AcordionList';

function CourseContent({ data, assetCount }) {
  const { hexColor } = useStyle();
  const { t } = useTranslation('course');
  const contentCountString = `${assetCount.lesson} ${t('readings')}, ${assetCount.exercise} ${t('exercises')}, ${assetCount.project} ${t('projects')}`;

  return (
    <Flex gridGap="12px" flexDirection="column" my="100px">
      <Heading as="h2" size="20px">
        Course Content
      </Heading>
      <Text size="14px" color={hexColor.fontColor2}>
        {contentCountString}
      </Text>

      <AcordionList list={data?.modules} />
    </Flex>
  );
}
CourseContent.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object])),
  assetCount: PropTypes.objectOf(PropTypes.number).isRequired,
};
CourseContent.defaultProps = {
  data: {},
};
export default CourseContent;
