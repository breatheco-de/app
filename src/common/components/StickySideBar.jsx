import PropTypes from 'prop-types';
import {
  Box, VStack, useColorMode,
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';

const StickySideBar = ({ menu }) => {
  const { colorMode } = useColorMode();
  return (
    <>
      <VStack>
        {
            menu.map((item) => (
              <Box key={item.id}>
                <Box as="button" cursor="pointer" _active={{ backgroundColor: 'blue.default' }} margin="auto" width="fit-content" height="48px" padding="15px" border="1px solid" borderColor={colorMode === 'light' ? 'gray.default' : 'white'} borderRadius="full">
                  <Icon icon={item.icon} width="18px" height="18px" />
                </Box>
                <Text _active={{ color: 'blue.default' }} size="sm" marginTop="3px" color={colorMode === 'light' ? 'gray.default' : 'white'}>{item.text}</Text>
              </Box>
            ))
        }
      </VStack>
    </>
  );
};

StickySideBar.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.array),
};

StickySideBar.defaultProps = {
  menu: [
    {
      icon: 'book',
      text: 'Student Mode',
      id: 1,
    },
    {
      icon: 'book',
      text: 'Student Mode',
      id: 2,
    },
    {
      icon: 'book',
      text: 'Student Mode',
      id: 3,
    },
    {
      icon: 'book',
      text: 'Student Mode',
      id: 4,
    },
  ],
};

export default StickySideBar;
