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
  Image,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import NextChakraLink from './nextChakraLink';
import logo from '../../../public/static/images/bc_logo.png';
import Icon from './Icon';

const Navbar = ({
  menuList, user: { handleUser, avatar, notifies }, handleChange, value,
}) => {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const linkStyle = {
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: '900',
  };

  return (
    <>
      <Box px="25px" py="18px" borderBottom="1px solid #DADADA">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <HStack spacing={20} alignItems="center">
            <Box onClick={isOpen ? onClose : onOpen} cursor={{ base: 'pointer', md: 'default' }}>
              <Image src={logo} width="40px" height="40px" />
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
                  color="gray"
                  _focus={{ boxShadow: 'none', color: '#0097CF' }}
                >
                  <Icon
                    icon={nav.icon}
                    width="20px"
                    height="20px"
                    style={{ marginBottom: '-4px', marginRight: '4px' }}
                    color="#A4A4A4"
                    fill={router?.pathname === nav.link ? '#0097CF' : ''}
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
                  value={value}
                  onChange={handleChange}
                />
                <InputRightElement children={<Icon color="black" icon="search" width="20px" height="20px" />} />
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
                icon={colorMode === 'light' ? <Icon icon="light" width="25px" height="25px" color="black" /> : <Icon icon="dark" width="25px" height="25px" />}
              />
              <IconButton
                variant="default"
                bg={colorMode === 'light' ? 'white' : 'darkTheme'}
                isRound
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
                onClick={handleUser}
                width="40px"
                height="40px"
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
                  color="gray"
                  _focus={{ boxShadow: 'none', color: '#0097CF' }}
                >
                  <Icon
                    icon={nav.icon}
                    width="20px"
                    height="20px"
                    style={{ marginBottom: '-4px', marginRight: '4px' }}
                    color="#A4A4A4"
                    fill={router?.pathname === nav.link ? '#0097CF' : ''}
                  />
                  {nav.title.toUpperCase()}
                </NextChakraLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
};

Navbar.propTypes = {
  menuList: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  handleChange: PropTypes.func,
  value: PropTypes.string,
};
Navbar.defaultProps = {
  value: '',
  handleChange: () => {
  },
};

export default Navbar;
