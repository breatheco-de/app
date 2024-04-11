import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Heading from './Heading';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import AcordionList from './AcordionList';

function CourseContent({ data }) {
  const { hexColor } = useStyle();
  const { t } = useTranslation('course');

  return (
    <Flex gridGap="12px" flexDirection="column">
      <Heading as="h2" size="20px">
        {t('course-content-text')}
      </Heading>
      <Text size="16px" color={hexColor.fontColor2}>
        {t('course-content-description')}
      </Text>

      <AcordionList defaultIndex={0} list={data} />
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
