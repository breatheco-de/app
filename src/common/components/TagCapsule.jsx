import { memo } from 'react';
import { Box, Stack, useColorMode } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import Link from './NextChakraLink';

const TagCapsule = ({
  tags,
  separator,
  background,
  color,
  variant,
  paddingX,
  marginY,
  gap,
  style,
  fontSize,
  containerStyle,
  fontWeight,
  isLink,
  href,
  borderRadius,
}) => {
  const { colorMode } = useColorMode();

  return tags.length !== 0 && (
    <Stack
      bg={variant === 'rounded' ? 'none' : background}
      as="ul"
      flexWrap="wrap"
      direction="row"
      height="auto"
      style={containerStyle}
      // minHeight="130px"
      my={marginY}
      width="fit-content"
      px={paddingX}
      borderRadius="15px"
      gridGap={gap}
    >
      {tags.map((tag, i) => (isLink ? (
        <Link
          href={`${href}/technology/${tag}`}
          display="flex"
          cursor={isLink ? 'pointer' : 'default'}
          bg={variant === 'rounded' ? background : 'none'}
          direction="row"
          padding={variant === 'rounded' ? '0 10px' : '0'}
          style={style}
          rounded={variant === 'rounded' ? borderRadius : 'none'}
          key={tag?.name || `${tag}-${i}`}
          lineHeight="22px"
          color={colorMode === 'light' ? 'black' : 'black'}
        >
          <Text
            margin="0"
            alignSelf="center"
            letterSpacing="0.05em"
            textAlign="center"
            size={fontSize}
            fontWeight={fontWeight}
            color="black"
            textTransform="uppercase"
          >
            {tag?.name || tag}
          </Text>
          {variant === 'slash' && i < tags.length - 1 && (
            <Box as="span" alignSelf="center" userSelect="none" fontSize="15px" mx="0.5rem">
              {separator}
            </Box>
          )}
        </Link>
      ) : (
        <Box
          as="li"
          display="flex"
          bg={variant === 'rounded' ? background : 'none'}
          direction="row"
          padding={variant === 'rounded' ? '0 10px' : '0'}
          style={style}
          rounded={variant === 'rounded' ? borderRadius : 'none'}
          key={tag?.name || `${tag}-${i}`}
          lineHeight="22px"
          color={colorMode === 'light' ? 'black' : 'black'}
        >
          <Text
            margin="0"
            alignSelf="center"
            letterSpacing="0.05em"
            textAlign="center"
            size={fontSize}
            fontWeight={fontWeight}
            color={color}
            textTransform="uppercase"
          >
            {tag?.name || tag}
          </Text>
          {variant === 'slash' && i < tags.length - 1 && (
            <Box as="span" alignSelf="center" userSelect="none" fontSize="15px" mx="0.5rem">
              {separator}
            </Box>
          )}
        </Box>
      )
      ))}
    </Stack>
  );
};

TagCapsule.propTypes = {
  tags: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  fontSize: PropTypes.string,
  separator: PropTypes.string,
  containerStyle: PropTypes.objectOf(PropTypes.any),
  background: PropTypes.string,
  variant: PropTypes.string,
  paddingX: PropTypes.string,
  marginY: PropTypes.string,
  gap: PropTypes.string,
  style: PropTypes.shape({}),
  fontWeight: PropTypes.string,
  isLink: PropTypes.bool,
  href: PropTypes.string,
  borderRadius: PropTypes.string,
  color: PropTypes.string,
};
TagCapsule.defaultProps = {
  separator: '/',
  background: 'yellow.light',
  containerStyle: {},
  fontSize: '11px',
  variant: 'slash',
  paddingX: '20px',
  marginY: '18px',
  fontWeight: '500',
  gap: '0',
  style: {
    margin: '0',
  },
  isLink: false,
  href: '#',
  borderRadius: '15px',
  color: 'black',
};

export default memo(TagCapsule);
