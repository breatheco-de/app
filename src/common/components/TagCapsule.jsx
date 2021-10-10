import { Box, Stack, useColorMode } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';

const TagCapsule = ({ tags, separator, background }) => {
  const { colorMode } = useColorMode();
  return (
    <div>
      <Stack
        bg={background}
        as="ul"
        direction="row"
        height="30px"
        my="18px"
        width="fit-content"
        px="20px"
        borderRadius="15px"
      >
        {tags.map((tag, i) => (
          <Box
            as="li"
            display="flex"
            direction="row"
            padding="0"
            style={{ margin: 0 }}
            key={tag.name}
            lineHeight="22px"
            color={colorMode === 'light' ? 'black' : 'black'}
          >
            <Text
              margin="0"
              alignSelf="center"
              letterSpacing="0.05em"
              textAlign="center"
              size="11px"
            >
              {tag.name?.toUpperCase()}
            </Text>
            {i < tags.length - 1 && (
              <Box as="span" alignSelf="center" userSelect="none" fontSize="15px" mx="0.5rem">
                {separator}
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </div>
  );
};

TagCapsule.propTypes = {
  tags: PropTypes.string.isRequired,
  separator: PropTypes.string,
  background: PropTypes.string,
};
TagCapsule.defaultProps = {
  separator: '/',
  background: 'yellow.light',
};

export default TagCapsule;
