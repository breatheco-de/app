import { Box, Stack, useColorMode } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';

const TagCapsule = ({
  tags, separator, background, variant, paddingX, marginY, gap, style,
}) => {
  const { colorMode } = useColorMode();

  return (
    <Stack
      bg={variant === 'rounded' ? 'none' : background}
      as="ul"
      flexWrap="wrap"
      direction="row"
      height="auto"
      // minHeight="130px"
      my={marginY}
      width="fit-content"
      px={paddingX}
      borderRadius="15px"
      gridGap={gap}
    >
      {tags.map((tag, i) => (
        <Box
          as="li"
          display="flex"
          bg={variant === 'rounded' ? background : 'none'}
          direction="row"
          padding={variant === 'rounded' ? '0 10px' : '0'}
          style={style}
          rounded={variant === 'rounded' ? '15px' : 'none'}
          key={tag.name || `${tag}-${i}`}
          lineHeight="22px"
          color={colorMode === 'light' ? 'black' : 'black'}
        >
          <Text
            margin="0"
            alignSelf="center"
            letterSpacing="0.05em"
            textAlign="center"
            size="11px"
            color="black"
            textTransform="uppercase"
          >
            {tag.name || tag}
          </Text>
          {variant === 'slash' && i < tags.length - 1 && (
            <Box as="span" alignSelf="center" userSelect="none" fontSize="15px" mx="0.5rem">
              {separator}
            </Box>
          )}
        </Box>
      ))}
    </Stack>
  );
};

TagCapsule.propTypes = {
  tags: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  separator: PropTypes.string,
  background: PropTypes.string,
  variant: PropTypes.string,
  paddingX: PropTypes.string,
  marginY: PropTypes.string,
  gap: PropTypes.string,
  style: PropTypes.shape({}),
};
TagCapsule.defaultProps = {
  separator: '/',
  background: 'yellow.light',
  variant: 'slash',
  paddingX: '20px',
  marginY: '18px',
  gap: '0',
  style: {
    margin: '0',
  },
};

export default TagCapsule;
