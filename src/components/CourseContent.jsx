import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';
import Heading from './Heading';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import AcordionList from './AcordionList';

function CourseContent({ data, courseContentText, courseContentDescription, ...rest }) {
  const { hexColor } = useStyle();

  return (
    <Flex gridGap="12px" flexDirection="column">
      <Heading as="h2" size={{ base: '20px', md: '34px' }}>
        {courseContentText}
      </Heading>
      <Text size={{ base: '16px', md: '18px' }} color={hexColor.fontColor2}>
        {courseContentDescription}
      </Text>

      <AcordionList defaultIndex={0} list={data} {...rest} />
    </Flex>
  );
}
CourseContent.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object])),
  courseContentText: PropTypes.string,
  courseContentDescription: PropTypes.string,
};
CourseContent.defaultProps = {
  data: {},
  courseContentText: '',
  courseContentDescription: '',
};
export default CourseContent;
