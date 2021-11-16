import {
  Box,
  IconButton,
  Stack,
  useColorModeValue,
  useBreakpointValue,
  useColorMode,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from '../../common/components/Icon';
import MobileNavItem from './MobileNavItem';

const MobileNav = ({ NAV_ITEMS }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const commonColors = useColorModeValue('white', 'gray.800');
  return (
    <Stack
      position="absolute"
      width="100%"
      zIndex="10"
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
    >
      {NAV_ITEMS.map((navItem) => {
        const {
          label, subMenu, href, description, icon,
        } = navItem;
        return (
          <MobileNavItem
            key={label}
            description={description}
            icon={icon}
            label={label}
            subMenu={subMenu}
            href={href}
          />
        );
      })}

      <Box
        borderTop={1}
        borderStyle="solid"
        margin="4px auto"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <IconButton
          style={{ margin: '14px auto 0 auto' }}
          display={useBreakpointValue({ base: 'flex', md: 'none' })}
          _hover={{
            background: commonColors,
          }}
          _active={{
            background: commonColors,
          }}
          background={commonColors}
          onClick={toggleColorMode}
          icon={
            colorMode === 'light' ? (
              <Icon icon="light" width="25px" height="23px" color="black" />
            ) : (
              <Icon icon="dark" width="20px" height="20px" />
            )
          }
        />
      </Box>
    </Stack>
  );
};

MobileNav.propTypes = {
  NAV_ITEMS: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.string,
      href: PropTypes.string,
      subMenu: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          subLabel: PropTypes.string,
          href: PropTypes.string.isRequired,
        }),
      ),
    }),
  ),
};

MobileNav.defaultProps = {
  NAV_ITEMS: [
    {
      href: '/',
      description: '',
      icon: 'book',
      subMenu: {
        subLabel: '',
      },
    },
  ],
};

export default MobileNav;
