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
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from '../NextChakraLink';
import Image from '../Image';
import logo from '../../../../public/static/images/bc_logo.png';
import Icon from '../Icon';
import Text from '../Text';

const Navbar = () => {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation(['navbar']);

  const linkStyle = {
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: '900',
  };

  const menuList = [
    {
      title: t('menu.about-us'),
      link: '/dashboard',
    },
    {
      title: t('menu.practice'),
      link: '/',
      // icon: 'home',
    },
    {
      title: t('menu.build'),
      link: '/about-us',
      // icon: 'home',
    },
    {
      title: t('menu.bootcamp'),
      link: '/dashboard',
      // icon: 'home',
    },
  ];

  const getColorLink = (link) => {
    if (router.pathname === link) {
      return 'blue.default';
    }
    return colorMode === 'light' ? 'gray.600' : 'white';
  };

  const getColorIcon = (link) => {
    if (router?.pathname === link) {
      return '#0097CD';
    }
    return colorMode === 'light' ? 'gray.default' : 'white';
  };

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        padding="16px 22px"
        // borderBottom="1px solid #DADADA"
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
              <Link
                key={nav.title}
                href={nav.link}
                style={linkStyle}
                color={getColorLink(nav.link)}
                _focus={{ boxShadow: 'none', color: '#0097CF' }}
              >
                {nav.icon && (
                  <Icon
                    icon={nav.icon}
                    width="20px"
                    height="20px"
                    style={{ marginBottom: '-4px', marginRight: '4px' }}
                    color={getColorIcon(nav.link)}
                  />
                )}
                <Text size="13px" color={getColorLink(nav.link)}>
                  {nav.title.toUpperCase()}
                </Text>
              </Link>
            ))}
          </HStack>
        </HStack>
        {/* {t('navbar:test')} */}
        <HStack spacing={12} alignItems="center" marginLeft="1%">
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
            <Link href={router.pathname} locale={router.locale === 'es' ? 'en' : 'es'}>
              <IconButton
                variant="default"
                bg={colorMode === 'light' ? 'white' : 'darkTheme'}
                isRound
                cursor="pointer"
                _focus={{ boxShadow: 'none' }}
                _hover={{ background: 'none' }}
                _active={{ background: 'none' }}
                icon={<Icon icon="switchLanguage" width="25px" height="25px" />}
              />
            </Link>
            <Link href={`${router.locale === 'es' ? 'es' : ''}/example`}>
              <Button variant="default" px="25px">
                {t('login')}
              </Button>
            </Link>
          </HStack>
        </HStack>
      </Flex>
      {isOpen && (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {menuList.map((nav) => (
              <Link
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
              </Link>
            ))}
          </Stack>
        </Box>
      )}
    </>
  );
};

export default Navbar;
