import PropTypes from 'prop-types';
import {
  Grid, Box, SkeletonText, Skeleton, useColorModeValue, SkeletonCircle,
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
        borderRadius="10px"
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
        borderRadius="10px"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="10px"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="10px"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="38px"
        color="white"
        borderRadius="10px"
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
        borderRadius="10px"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="10px"
        width="100%"
        mt="6"
      />
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="58px"
        color="white"
        borderRadius="10px"
        width="100%"
        mt="6"
      />
    </Box>
  );
};

export const AvatarSkeleton = ({
  withText, quantity, templateColumns, gridAutoRows, gridGap, ...chakraProps
}) => {
  const commonStartColor = useColorModeValue('gray.300', 'gray.light');
  const commonEndColor = useColorModeValue('gray.400', 'gray.400');

  const arrOfCircles = new Array(quantity).fill(['circles']);

  return (
    <>
      {withText && (
        <Skeleton
          startColor={commonStartColor}
          endColor={commonEndColor}
          width="50%"
          height="18px"
          color="white"
          borderRadius="10px"
          mt="6"
        />
      )}
      <Grid
        {...chakraProps}
        pt="25px"
        gridAutoRows={gridAutoRows}
        templateColumns={templateColumns}
        gridGap={gridGap}
      >
        {arrOfCircles.map((item, index) => {
          const indx = index;
          return (
            <SkeletonCircle
              key={indx}
              startColor={commonStartColor}
              endColor={commonEndColor}
              size="10"
            />
          );
        })}
      </Grid>
    </>
  );
};

AvatarSkeleton.propTypes = {
  withText: PropTypes.bool,
  quantity: PropTypes.number,
  templateColumns: PropTypes.string,
  gridAutoRows: PropTypes.string,
  gridGap: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
AvatarSkeleton.defaultProps = {
  withText: false,
  quantity: 3,
  templateColumns: 'repeat(auto-fill, minmax(3.5rem, 1fr))',
  gridAutoRows: '3.4rem',
  gridGap: 0,
};
