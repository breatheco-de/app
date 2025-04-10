import PropTypes from 'prop-types';
import {
  Grid, Box, SkeletonText, Skeleton, useColorModeValue, SkeletonCircle, Flex, AvatarGroup,
} from '@chakra-ui/react';
import useStyle from '../hooks/useStyle';

export function MDSkeleton() {
  const commonStartColor = useColorModeValue('gray.300', 'gray.700');
  const commonEndColor = useColorModeValue('gray.400', 'gray.800');

  return (
    <Box padding="2" bg={useColorModeValue('white', 'dark')}>
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
      <Box padding="6" marginY="8" borderRadius="8px" bg="black">
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
      <Box padding="6" marginY="8" borderRadius="8px" bg="black">
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
}

export function ModuleMapSkeleton() {
  const commonStartColor = useColorModeValue('gray.300', 'gray.700');
  const commonEndColor = useColorModeValue('gray.400', 'gray.800');

  return (
    <Box padding="2" bg={useColorModeValue('white', 'dark')}>
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
}

export function CardSkeleton({
  withoutContainer, quantity, templateColumns, gridGap, cardWidth, cardHeight,
  cardRadius, ...rest
}) {
  const commonStartColor = useColorModeValue('gray.300', 'gray.700');
  const commonEndColor = useColorModeValue('gray.400', 'gray.800');

  return !withoutContainer ? (
    <Grid
      gridTemplateColumns={templateColumns}
      gridGap={gridGap}
      {...rest}
    >
      {Array(quantity).fill('l').map((_, i) => {
        const index = i;
        return (
          <Skeleton
            key={index}
            width={cardWidth}
            height={cardHeight}
            borderRadius={cardRadius}
            startColor={commonStartColor}
            endColor={commonEndColor}
            opacity={1}
            zIndex={2}
          />
        );
      })}
    </Grid>
  ) : (
    <>
      {Array(quantity).fill('l').map((_, i) => {
        const index = i;
        return (
          <Skeleton
            key={index}
            width={cardWidth}
            height={cardHeight}
            borderRadius={cardRadius}
            startColor={commonStartColor}
            endColor={commonEndColor}
            {...rest}
          />
        );
      })}
    </>
  );
}

export function DottedTimelineSkeleton() {
  const commonStartColor = useColorModeValue('gray.300', 'gray.700');
  const commonEndColor = useColorModeValue('gray.400', 'gray.800');
  const { borderColor, backgroundColor2 } = useStyle();
  return (
    <Flex flexDirection="column" gridGap="20px">
      {Array(3).fill('l').map((_, i) => {
        const index = i;
        return (
          <Flex key={index} borderRadius="17px" flexDirection="column" gridGap="4px" width="100%" padding="20px 29px" border="1px solid" borderColor={borderColor} background={backgroundColor2}>
            <Flex justifyContent="space-between" fontWeight={700}>
              <Box display="flex" width="100%" alignItems="center" gridGap="10px">
                <SkeletonCircle
                  startColor={commonStartColor}
                  endColor={commonEndColor}
                  size="25px"
                />
                <Skeleton
                  minHeight="14px"
                  startColor={commonStartColor}
                  endColor={commonEndColor}
                  width="200px"
                  color="white"
                  borderRadius="17px"
                />
              </Box>
              <Skeleton
                startColor={commonStartColor}
                endColor={commonEndColor}
                width="15%"
                height="14px"
                color="white"
                borderRadius="17px"
              />
            </Flex>
            <Skeleton
              mt="12px"
              startColor={commonStartColor}
              endColor={commonEndColor}
              width="100%"
              height="14px"
              color="white"
              borderRadius="17px"
            />
          </Flex>
        );
      })}
    </Flex>
  );
}
export function AvatarSkeleton({
  withText, quantity, templateColumns, gridAutoRows, gridGap, ...chakraProps
}) {
  const commonStartColor = useColorModeValue('gray.300', 'gray.700');
  const commonEndColor = useColorModeValue('gray.400', 'gray.800');

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
        pt={chakraProps.pt || '25px'}
        alignItems="center"
        justifyItems="center"
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
      {arrOfCircles.length >= 15 && (
        <Box padding="14px 0 0 0">
          <Skeleton
            startColor={commonStartColor}
            endColor={commonEndColor}
            height="21px"
            width="138px"
            color="white"
            borderRadius="10px"
            margin="0 auto"
          />
        </Box>
      )}
    </>
  );
}

export function AvatarSkeletonWrapped({
  quantity, ...chakraProps
}) {
  const commonStartColor = useColorModeValue('gray.300', 'gray.700');
  const commonEndColor = useColorModeValue('gray.400', 'gray.800');

  const arrOfCircles = new Array(quantity).fill(['circles']);

  return (
    <AvatarGroup max={chakraProps?.max || 4}>
      {arrOfCircles?.map((c, i) => {
        const index = i;
        return (
          <SkeletonCircle
            key={index}
            width={chakraProps?.size || 10}
            height={chakraProps?.size || 10}
            startColor={commonStartColor}
            endColor={commonEndColor}
            size="10"
            {...chakraProps}
          />
        );
      })}
    </AvatarGroup>
  );
}

export function SimpleSkeleton({ width, height, ...chakraProps }) {
  const commonStartColor = useColorModeValue('gray.300', 'gray.700');
  const commonEndColor = useColorModeValue('gray.400', 'gray.800');
  return (
    <Skeleton
      {...chakraProps}
      width={width}
      height={height}
      startColor={commonStartColor}
      endColor={commonEndColor}
    />
  );
}

CardSkeleton.propTypes = {
  withoutContainer: PropTypes.bool,
  quantity: PropTypes.number,
  templateColumns: PropTypes.string,
  cardWidth: PropTypes.string,
  cardHeight: PropTypes.string,
  gridGap: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cardRadius: PropTypes.string,
};
CardSkeleton.defaultProps = {
  withoutContainer: false,
  quantity: 3,
  templateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))',
  cardWidth: '100%',
  cardHeight: '240px',
  gridGap: '12px',
  cardRadius: '16px',
};

SimpleSkeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
};
SimpleSkeleton.defaultProps = {
  width: '100%',
  height: '100%',
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
AvatarSkeletonWrapped.propTypes = {
  quantity: PropTypes.number,
};
AvatarSkeletonWrapped.defaultProps = {
  quantity: 3,
};
