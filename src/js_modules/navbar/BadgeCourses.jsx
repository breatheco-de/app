import { Badge, Text } from '@chakra-ui/react';

function BadgeCourses(courses) {
  return (
    <Badge bg="#FFB718" color="black" variant="warning" size="sm" m="2">
      <Text>
        5
        {courses}
      </Text>
    </Badge>
  );
}

export default BadgeCourses;
