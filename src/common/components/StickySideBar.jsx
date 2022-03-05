import PropTypes from 'prop-types';
import {
  Box, VStack, useColorMode,
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';

const StickySideBar = ({
  menu, width, onClickMenuItem, top, right, left,
}) => {
  const { colorMode } = useColorMode();
  return (
    <>
      <VStack
        width={width}
        position="fixed"
        top={top}
        right={right}
        left={left}
      >
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
                width="80px"
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
  top: PropTypes.string,
  right: PropTypes.string,
  left: PropTypes.string,
};

StickySideBar.defaultProps = {
  menu: [],
  width: '100%',
  onClickMenuItem: () => {},
  top: '12%',
  right: '15px',
  left: 'unset',
};

export default StickySideBar;
