import {
  Box,
  Flex,
  IconButton,
  Button,
  Stack,
  Collapse,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
// import { useRouter } from 'next/router';
import NextChakraLink from '../NextChakraLink';
import Icon from '../Icon';
/* import Image from '../Image';
import logo from '../../../../public/static/images/bc_logo.png'; */
import DesktopNav from '../../../js_modules/navbar/DesktopNav';
import MobileNav from '../../../js_modules/navbar/MobileNav';

const NavbarWithSubNavigation = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { t } = useTranslation(['navbar']);
  const commonColors = useColorModeValue('white', 'gray.800');

  const EXTERNAL_ITEMS = [
    {
      label: t('menu.about-us'),
      href: '/about-us',
    },
    {
      label: t('menu.practice'),
      href: '/interactive-exercises',
    },
    {
      label: t('menu.read.title'),
      icon: 'book',
      description: t('menu.read.description'),
      asPath: '/lessons', // For colorLink
      subMenu: [
        {
          label: t('menu.read.child-1.label'),
          // subLabel: t('menu.read.child-1.subLabel'),
          href: '/lessons?child=1',
        },
        {
          label: t('menu.read.child-2.label'),
          // subLabel: t('menu.read.child-2.subLabel'),
          href: '/lessons?child=2',
        },
        {
          label: t('menu.read.child-3.label'),
          // subLabel: t('menu.read.child-2.subLabel'),
          href: '/lessons?child=3',
        },
      ],
    },
    {
      label: t('menu.build'),
      href: '/projects',
    },
    {
      label: t('menu.bootcamp'),
      href: 'https://4geeksacademy.com',
    },
  ];

  return (
    <Box>
      <Flex
        transition="all .2s ease"
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        // minH="60px"
        height="7vh"
        py={{ base: '8px' }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align="center"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
          gridGap="12px"
        >
          <IconButton
            onClick={onToggle}
            _hover={{
              background: commonColors,
            }}
            _active={{
              background: commonColors,
            }}
            background={commonColors}
            icon={
              isOpen ? (
                <Icon icon="close2" width="22px" height="22px" />
              ) : (
                <Icon icon="hamburger2" width="22px" height="22px" />
              )
            }
            variant="default"
            aria-label="Toggle Navigation"
          />
          <NextChakraLink href="/" alignSelf="center" display={{ base: 'flex', md: 'none' }}>
            <Icon icon="logoModern" width="90px" height="20px" />
            {/* <Image src={logo} width="30px" height="30px" alt="Breathecode logo" /> */}
          </NextChakraLink>
        </Flex>

        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <NextChakraLink href="/" alignSelf="center" display={{ base: 'none', md: 'flex' }}>
            <Icon icon="logoModern" width="90px" height="20px" />
          </NextChakraLink>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav NAV_ITEMS={EXTERNAL_ITEMS} />
          </Flex>
        </Flex>

        <Stack flex={{ base: 1, md: 0 }} justify="flex-end" direction="row" spacing={6}>
          {/* <IconButton
            display={useBreakpointValue({ base: 'none', md: 'flex' })}
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
          /> */}
          <NextChakraLink
            href="/login"
            fontWeight="700"
            fontSize="13px"
            lineHeight="22px"
            _hover={{
              textDecoration: 'none',
            }}
            letterSpacing="0.05em"
          >
            <Button
              display={useBreakpointValue({ base: 'flex', md: 'flex' })}
              width="100px"
              fontWeight={700}
              lineHeight="0.05em"
              variant="default"
            >
              {t('login')}
            </Button>
          </NextChakraLink>
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav NAV_ITEMS={EXTERNAL_ITEMS} />
      </Collapse>
    </Box>
  );
};

export default NavbarWithSubNavigation;
