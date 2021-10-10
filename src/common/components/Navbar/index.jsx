import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  useColorMode,
  Button,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import NextChakraLink from '../NextChakraLink';
import Image from '../Image';
import logo from '../../../../public/static/images/bc_logo.png';
import Icon from '../Icon';

const Navbar = ({ menuList, width }) => {
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
      <Box width={width}>
        <Flex
          alignItems="center"
          justifyContent="space-between"
          padding="22px"
          borderBottom="1px solid #DADADA"
        >
          <HStack spacing={20} alignItems="center">
            <Image
              onClick={isOpen ? onClose : onOpen}
              cursor={{ base: 'pointer', md: 'default' }}
              src={logo}
              width="40px"
              height="40px"
              alt="breathecode logo"
            />
            <HStack as="nav" spacing={16} display={{ base: 'none', md: 'flex' }}>
              {menuList.map((nav) => (
                <NextChakraLink
                  key={nav.title}
                  href={nav.link}
                  style={linkStyle}
                  color="gray"
                  _focus={{ boxShadow: 'none', color: '#0097CF' }}
                >
                  {nav.icon && (
                    <Icon
                      icon={nav.icon}
                      width="20px"
                      height="20px"
                      style={{ marginBottom: '-4px', marginRight: '4px' }}
                      color="#A4A4A4"
                      fill={router?.pathname === nav.link ? '#0097CF' : ''}
                    />
                  )}
                  {nav.title.toUpperCase()}
                </NextChakraLink>
              ))}
            </HStack>
          </HStack>
          <HStack spacing={12} alignItems="center" marginLeft="5%">
            <HStack as="nav" spacing={16} display={{ base: 'flex', md: 'flex' }}>
              <IconButton
                variant="default"
                bg={colorMode === 'light' ? 'white' : 'darkTheme'}
                isRound
                onClick={toggleColorMode}
                cursor="pointer"
                _focus={{ boxShadow: 'none' }}
                _hover={{ background: 'none' }}
                _active={{ background: 'none' }}
                icon={
                  colorMode === 'light' ? (
                    <Icon icon="light" width="25px" height="23px" color="black" />
                  ) : (
                    <Icon icon="dark" width="25px" height="25px" />
                  )
                }
              />
              <Button variant="default">Login</Button>
            </HStack>
          </HStack>
        </Flex>
        {isOpen && (
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
                  {nav.icon && (
                    <Icon
                      icon={nav.icon}
                      width="20px"
                      height="20px"
                      style={{ marginBottom: '-4px', marginRight: '4px' }}
                      color="#A4A4A4"
                      fill={router?.pathname === nav.link ? '#0097CF' : ''}
                    />
                  )}
                  {nav.title.toUpperCase()}
                </NextChakraLink>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </>
  );
};

Navbar.propTypes = {
  menuList: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
    }),
  ),
  width: PropTypes.string,
};
Navbar.defaultProps = {
  width: '',
  menuList: [
    {
      title: 'About us',
      link: '/',
    },
    {
      title: 'Practice',
      link: '/',
      // icon: 'home',
    },
    {
      title: 'Build',
      link: '/',
      // icon: 'home',
    },
    {
      title: 'Coding Bootcamp',
      link: '/',
      // icon: 'home',
    },
  ],
};

export default Navbar;
