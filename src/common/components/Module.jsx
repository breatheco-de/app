import {
  Box, Heading, Stack, Flex, useColorModeValue, HStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import Icon from './Icon';
import Link from './NextChakraLink';

const Module = ({
  data, containerStyle, leftContentStyle, containerPX, width, currIndex,
  isDone, rightItemHandler, link, textWithLink,
}) => {
  const containerBackground = isDone ? useColorModeValue('featuredLight', 'featuredDark') : useColorModeValue('#FFFFFF', 'primary');
  const commonFontColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Stack
      width={width}
      style={containerStyle}
      gridGap="12px"
      direction="row"
      backgroundColor={containerBackground}
      border={`${useColorModeValue('1px', '2px')} solid`}
      borderColor={isDone ? 'transparent' : useColorModeValue('#C4C4C4', 'gray.700')}
      height="auto"
      py="10px"
      px={containerPX || '15px'}
      my="10px"
      rounded="2xl"
      overflow="hidden"
      key={`${data.title}-${currIndex}`}
      _hover={{ bg: useColorModeValue('blue.light', 'featuredDark') }}
    >
      <Flex width="100%">
        {currIndex !== null && (
          <Box
            width="30px"
            minWidth="30px"
            alignSelf="center"
            mr="15px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="30px"
            rounded="full"
            align="center"
            background={isDone ? '#0097CF' : '#BFBFBF'}
          >
            <Text fontWeight="bold" margin="0" size="sm" color="#FFFFFF">
              {currIndex + 1}
            </Text>
          </Box>
        )}
        {data.icon && (
          <Box display={{ base: 'none', sm: 'flex' }} mr="20px" ml="20px" minWidth="22px" width="22px">
            <Icon
              icon={data.icon || 'book'}
              color={isDone ? '#0097CF' : '#A4A4A4'}
            />
          </Box>
        )}
        {textWithLink ? (
          <Link href={link} style={leftContentStyle} width="100%">
            {data.type && (
              <Heading
                as="h3"
                fontSize="13px"
                color={commonFontColor}
                lineHeight="18px"
                letterSpacing="0.05em"
                margin="0"
                isTruncated
                fontWeight="900"
                textTransform="uppercase"
              >
                {data.type}
              </Heading>
            )}
            <Text
              size="l"
              fontWeight="normal"
              color={commonFontColor}
              lineHeight="18px"
              letterSpacing="0.05em"
              margin="0"
            >
              {data.title}
            </Text>
          </Link>
        ) : (
          <Flex flexDirection="column" style={leftContentStyle} justifyContent="center">
            {data.type && (
              <Heading
                as="h3"
                fontSize="13px"
                color={commonFontColor}
                lineHeight="18px"
                letterSpacing="0.05em"
                margin="0"
                isTruncated
                fontWeight="900"
                textTransform="uppercase"
              >
                {data.type}
              </Heading>
            )}
            <Text
              size="l"
              fontWeight="normal"
              color={commonFontColor}
              lineHeight="18px"
              letterSpacing="0.05em"
              margin="0"
            >
              {data.title}
            </Text>
          </Flex>
        )}
      </Flex>
      <HStack
        // justifyContent="flex-end"
        width="auto"
        style={{
          margin: 0,
        }}
      >
        {rightItemHandler}
      </HStack>
    </Stack>
  );
};

Module.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  containerStyle: PropTypes.objectOf(PropTypes.any),
  leftContentStyle: PropTypes.objectOf(PropTypes.any),
  containerPX: PropTypes.string,
  width: PropTypes.string,
  link: PropTypes.string,
  textWithLink: PropTypes.bool,
  rightItemHandler: PropTypes.element,
  isDone: PropTypes.bool,
  currIndex: PropTypes.number,
};
Module.defaultProps = {
  data: {},
  containerStyle: {},
  leftContentStyle: {},
  containerPX: '',
  width: '100%',
  link: '',
  textWithLink: false,
  rightItemHandler: null,
  isDone: false,
  currIndex: null,
};

export default Module;
