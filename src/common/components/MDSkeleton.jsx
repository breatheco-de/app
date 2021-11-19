import { Box, SkeletonText } from '@chakra-ui/react';

const MDSkeleton = () => (
  <Box padding="2" boxShadow="lg" bg="white">
    <SkeletonText width="60%" mt="6" noOfLines={1} spacing="4" />
    <SkeletonText width="100%" mt="8" noOfLines={4} spacing="4" />
    <Box padding="6" marginY="8" borderRadius="8px" boxShadow="lg" bg="black">
      <SkeletonText width="100%" noOfLines={2} spacing="4" />
    </Box>
    <SkeletonText width="100%" mt="8" noOfLines={4} spacing="4" />
    <Box padding="6" marginY="8" borderRadius="8px" boxShadow="lg" bg="black">
      <SkeletonText width="50%" noOfLines={1} spacing="4" />
    </Box>
    <SkeletonText width="100%" mt="14" ml="0" noOfLines={3} spacing="4" />
    <SkeletonText width="80%" mt="8" ml="10" noOfLines={4} spacing="8" />
  </Box>
);

export default MDSkeleton;
