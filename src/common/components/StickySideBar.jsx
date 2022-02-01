import PropTypes from 'prop-types';
import {
  Box, VStack, useColorMode,
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';

const StickySideBar = ({ menu, width, onClickMenuItem }) => {
  const { colorMode } = useColorMode();
  return (
    <>
      <VStack width={width}>
        {
          menu.map((item) => (
            <Box
              key={item.id}
              textAlign="center"
              cursor="pointer"
              as="button"
              bg="transparent"
              border="none"
              onClick={(e) => onClickMenuItem(e, item)}
            >
              <Box
                bg={colorMode === 'light' ? 'white' : 'blue.default'}
                margin="auto"
                width="fit-content"
                height="48px"
                variant="default"
                padding="15px"
                border="1px solid"
                borderColor={colorMode === 'light' ? 'gray.default' : 'blue.default'}
                borderRadius="full"
              >
                <Icon icon={item.icon} width="18px" height="18px" color={colorMode === 'light' ? 'gray' : 'white'} />
              </Box>
              <Text
                size="sm"
                marginTop="3px"
                color={colorMode === 'light' ? 'gray.default' : 'white'}
              >
                {item.text}

              </Text>
            </Box>
          ))
        }
      </VStack>
    </>
  );
};

StickySideBar.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.array),
  width: PropTypes.string,
  onClickMenuItem: PropTypes.func,
};

StickySideBar.defaultProps = {
  menu: [],
  width: '100%',
  onClickMenuItem: () => {},
};

export default StickySideBar;
