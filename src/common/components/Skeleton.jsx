import {
  Box, SkeletonText, Skeleton, useColorModeValue,
} from '@chakra-ui/react';

export const MDSkeleton = () => {
  const commonStartColor = useColorModeValue('gray.300', 'gray.light');
  const commonEndColor = useColorModeValue('gray.400', 'gray.400');

  return (
    <Box padding="2" boxShadow="lg" bg={useColorModeValue('white', 'dark')}>
      <SkeletonText
        startColor={commonStartColor}
        endColor={commonEndColor}
        color="white"
        width="60%"
        mt="6"
        noOfLines={1}
        spacing="4"
      />
      <SkeletonText
        startColor={commonStartColor}
        endColor={commonEndColor}
        width="100%"
        mt="8"
        noOfLines={4}
        spacing="4"
      />
      <Box padding="6" marginY="8" borderRadius="8px" boxShadow="lg" bg="black">
        <SkeletonText
          startColor={commonStartColor}
          endColor={commonEndColor}
          width="100%"
          noOfLines={2}
          spacing="4"
        />
      </Box>
      <SkeletonText
        startColor={commonStartColor}
        endColor={commonEndColor}
        width="100%"
        mt="8"
        noOfLines={4}
        spacing="4"
      />
      <Box padding="6" marginY="8" borderRadius="8px" boxShadow="lg" bg="black">
        <SkeletonText
          startColor={commonStartColor}
          endColor={commonEndColor}
          width="50%"
          noOfLines={1}
          spacing="4"
        />
      </Box>
      <SkeletonText
        startColor={commonStartColor}
        endColor={commonEndColor}
        width="100%"
        mt="14"
        ml="0"
        noOfLines={3}
        spacing="4"
      />
      <SkeletonText
        startColor={commonStartColor}
        endColor={commonEndColor}
        width="80%"
        mt="8"
        ml="10"
        noOfLines={4}
        spacing="8"
      />
    </Box>
  );
};

export const ModuleMapSkeleton = () => {
  const commonStartColor = useColorModeValue('gray.300', 'gray.light');
  const commonEndColor = useColorModeValue('gray.400', 'gray.400');

  return (
    <Box padding="2" boxShadow="lg" bg={useColorModeValue('white', 'dark')}>
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="38px"
        color="white"
        borderRadius="1rem"
        width="100%"
        mt="6"
      />
      <SkeletonText
        startColor={commonStartColor}
        endColor={commonEndColor}
        width="100%"
        mt="8"
        noOfLines={3}
        spacing="4"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="1rem"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="1rem"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="1rem"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="38px"
        color="white"
        borderRadius="1rem"
        width="100%"
        mt="6"
      />
      <SkeletonText
        startColor={commonStartColor}
        endColor={commonEndColor}
        width="100%"
        mt="8"
        noOfLines={3}
        spacing="4"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="1rem"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="1rem"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="1rem"
        width="100%"
        mt="6"
      />
    </Box>
  );
};
