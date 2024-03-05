import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';

function CourseContent({ data }) {
  console.log('CourseContent_data:::', data);
  return (
    <Flex>
      CourseContent
    </Flex>
    // <Flex flexDirection="column" gridGap="16px">
    //   <Flex flexDirection="column" gridGap="16px">
    //     <Flex gridGap="9px" alignItems="center">
    //       <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
    //       <Text size="16px" fontWeight={400} color="currentColor" lineHeight="normal">
    //         Follow a structured syllabus with
    //         {' '}
    //         <strong>1000+ exercises and interactive tutorials.</strong>
    //       </Text>
    //     </Flex>
    //     <Flex gridGap="9px" alignItems="center">
    //       <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
    //       <Text size="16px" fontWeight={400} color="currentColor" lineHeight="normal">
    //         Boost your experience with
    //         {' '}
    //         <strong>live one-on-one mentoring sessions</strong>
    //         {' '}
    //         with industry experts who have already been down this path.
    //       </Text>
    //     </Flex>
    //   </Flex>

  //   {/* Instructors component here */}

  //   {/* Course description */}
  //   <Flex flexDirection="column" gridGap="16px">
  //     {data?.course_translation?.short_description && (
  //       <Text size="18px" fontWeight={700} color="currentColor" lineHeight="normal">
  //         {data?.course_translation?.short_description}
  //       </Text>
  //     )}
  //     <Text size="16px" fontWeight={400} color={hexColor.fontColor3} lineHeight="normal">
  //       {data?.course_translation?.description}
  //     </Text>
  //   </Flex>
  // </Flex>
  );
}
CourseContent.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object])),
};
CourseContent.defaultProps = {
  data: {},
};
export default CourseContent;
