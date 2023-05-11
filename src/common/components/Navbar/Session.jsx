import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  useDisclosure,
  InputRightElement,
  InputGroup,
  Input,
  Stack,
  useColorMode,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import NextChakraLink from '../NextChakraLink';
import Icon from '../Icon';

function Navbar({
  menuList, user: { onClickUser, avatar, notifies }, handleChange, width, onClickNotifications,
}) {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const linkStyle = {
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: '900',
  };

  const getColorLink = (link) => {
    if (router?.pathname === link || router.asPath === link) {
      return 'blue.default';
    }
    return colorMode === 'light' ? 'gray.600' : 'white';
  };

  const getColorIcon = (link) => {
    if (router?.pathname === link || router?.asPath === link) {
      return 'blue.default';
    }
    return colorMode === 'light' ? 'gray.default' : 'white';
  };

  return (
    <Box width={width}>
      <Flex alignItems="center" justifyContent="space-between" padding="22px" borderBottom="1px solid #DADADA">
        <HStack spacing={20} alignItems="center">
          <Box onClick={isOpen ? onClose : onOpen} cursor={{ base: 'pointer', md: 'default' }}>
            <Icon icon="logoModern" width="92px" height="21px" />
          </Box>
          <HStack
            as="nav"
            spacing={16}
            display={{ base: 'none', md: 'flex' }}
          >
            {menuList.map((nav) => (
              <NextChakraLink
                key={nav.title}
                href={nav.link}
                style={linkStyle}
                color={getColorLink(nav.link)}
                fontWeight="90"
                fontSize="16px"
                _focus={{ boxShadow: 'none', color: 'blue.default' }}
              >
                <Icon
                  icon={nav.icon}
                  width="22px"
                  height="22px"
                  style={{ marginBottom: '-4px', marginRight: '8px' }}
                  color={getColorIcon(nav.link)}
                />
                {nav.title.toUpperCase()}
              </NextChakraLink>
            ))}
          </HStack>
        </HStack>
        <HStack spacing={12} alignItems="center" marginLeft="5%">
          <HStack
            as="nav"
            spacing={16}
            display={{ base: 'flex', md: 'flex' }}
          >
            <InputGroup>
              <Input
                borderRadius="20px"
                background={colorMode === 'light' ? '#F5F5F5' : '#283340'}
                border="none"
                type="text"
                name="nav"
                color="inherit"
                onChange={(e) => handleChange(e.target.value)}
              />
              <InputRightElement>
                <Icon color="black" icon="search" width="20px" height="20px" />
              </InputRightElement>
            </InputGroup>
            <IconButton
              variant="default"
              bg={colorMode === 'light' ? 'white' : 'darkTheme'}
              isRound
              onClick={toggleColorMode}
              cursor="pointer"
              _focus={{ boxShadow: 'none' }}
              _hover={{ background: 'none' }}
              _active={{ background: 'none' }}
              icon={colorMode === 'light' ? <Icon icon="light" width="25px" height="23px" color="black" /> : <Icon icon="dark" width="25px" height="25px" />}
            />
            <IconButton
              variant="default"
              bg={colorMode === 'light' ? 'white' : 'darkTheme'}
              isRound
              onClick={onClickNotifications}
              _focus={{ boxShadow: 'none' }}
              _hover={{ background: 'none' }}
              _active={{ background: 'none' }}
              cursor="pointer"
              icon={<Icon icon="bell" width="25px" height="25px" color="black" />}
              _after={notifies ? {
                content: '""',
                w: 2,
                h: 2,
                bg: 'green',
                rounded: 'full',
                pos: 'absolute',
                left: '21px',
                top: '7px',
              } : null}
            />
            <Avatar
              onClick={onClickUser}
              width="43px"
              height="43px"
              cursor="pointer"
              src={avatar}
            />
          </HStack>
        </HStack>
      </Flex>
      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {menuList.map((nav) => (
              <NextChakraLink
                key={nav.title}
                href={nav.link}
                style={linkStyle}
                fontSize="13px"
                color={colorMode === 'light' ? 'gray.600' : 'white'}
                _focus={{ boxShadow: 'none', color: '#0097CF' }}
              >
                <Icon
                  icon={nav.icon}
                  width="15px"
                  height="15px"
                  style={{ marginBottom: '-4px', marginRight: '4px' }}
                  color={router?.pathname === nav.link ? 'blue.default' : 'gray.default'}
                />
                {nav.title.toUpperCase()}
              </NextChakraLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

Navbar.propTypes = {
  menuList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  user: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  handleChange: PropTypes.func,
  width: PropTypes.string,
  onClickNotifications: PropTypes.func,
};
Navbar.defaultProps = {
  handleChange: () => {
  },
  width: '',
  onClickNotifications: () => {},
};

export default Navbar;
