import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Popover,
  Link,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useColorMode,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';
import NextChakraLink from '../NextChakraLink';
import Icon from '../Icon';
import Image from '../Image';
import logo from '../../../../public/static/images/bc_logo.png';

const NavbarWithSubNavigation = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { t } = useTranslation(['navbar']);

  const commonColors = useColorModeValue('white', 'gray.800');

  const NAV_ITEMS = [
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
      subMenu: [
        {
          label: t('menu.read.child-1.label'),
          // subLabel: t('menu.read.child-1.subLabel'),
          href: '/lessons',
        },
        {
          label: t('menu.read.child-2.label'),
          // subLabel: t('menu.read.child-2.subLabel'),
          href: '/lessons',
        },
        {
          label: t('menu.read.child-3.label'),
          // subLabel: t('menu.read.child-2.subLabel'),
          href: '/lessons',
        },
      ],
    },
    {
      label: t('menu.build'),
      href: '/build',
    },
    {
      label: t('menu.bootcamp'),
      href: 'https://4geeksacademy.com',
    },
  ];

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        // minH="60px"
        height="10vh"
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
            <Image src={logo} width="30px" height="30px" alt="Breathecode logo" />
          </NextChakraLink>
        </Flex>

        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <NextChakraLink href="/" alignSelf="center" display={{ base: 'none', md: 'flex' }}>
            <Image src={logo} width="30px" height="30px" alt="Breathecode logo" />
          </NextChakraLink>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav NAV_ITEMS={NAV_ITEMS} />
          </Flex>
        </Flex>

        <Stack flex={{ base: 1, md: 0 }} justify="flex-end" direction="row" spacing={6}>
          <IconButton
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
          />
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
              fontWeight={400}
              variant="default"
            >
              {t('login')}
            </Button>
          </NextChakraLink>
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        {/* <SlideFade in={isOpen} offsetY="20px"> */}
        <MobileNav NAV_ITEMS={NAV_ITEMS} />
        {/* </SlideFade> */}
      </Collapse>
    </Box>
  );
};

const DesktopNav = ({ NAV_ITEMS }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction="row" spacing={4} alignItems="center">
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover id={navItem.href ?? 'trigger-64'} trigger="hover" placement="bottom-start">
            <PopoverTrigger>
              <Link
                display="flex"
                alignItems="center"
                p={2}
                href={navItem.href ?? '#'}
                fontSize="sm"
                textTransform="uppercase"
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {navItem.subMenu && (
                  <Icon icon="arrowDown" color="gray" width="22px" height="22px" />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.subMenu && (
              <PopoverContent
                border={0}
                boxShadow="xl"
                bg={popoverContentBgColor}
                p={4}
                rounded="md"
                minW="md"
              >
                <Stack>
                  <Flex
                    flexDirection="row"
                    padding="20px 0"
                    borderBottom={1}
                    borderStyle="solid"
                    borderColor={useColorModeValue('gray.200', 'gray.900')}
                    alignItems="center"
                    color={linkColor}
                  >
                    <Box width="140px">
                      <Icon icon={navItem.icon} width="50px" height="50px" />
                    </Box>
                    <Box display="flex" flexDirection="column">
                      <Text size="xl" fontWeight={900}>
                        {navItem.label}
                      </Text>
                      <Text fontWeight={500}>{navItem.description}</Text>
                    </Box>
                  </Flex>
                  {navItem.subMenu.map((child) => {
                    const { label, subLabel, href } = child;
                    return (
                      <DesktopSubNav
                        key={`${label}-${subLabel}`}
                        label={label}
                        subLabel={subLabel}
                        href={href}
                      />
                    );
                  })}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => (
  <Link
    href={href}
    role="group"
    display="block"
    p={2}
    style={{ borderRadius: '5px' }}
    _hover={{ bg: useColorModeValue('featuredLight', 'gray.900') }}
  >
    <Stack direction="row" align="center">
      <Box>
        <Text
          transition="all .3s ease"
          color={useColorModeValue('gray.600', 'gray.300')}
          _groupHover={{ color: useColorModeValue('gray.900', 'featuredLight') }}
          fontWeight={500}
        >
          {label}
        </Text>
        <Text fontSize="sm">{subLabel}</Text>
      </Box>
      <Flex
        transition="all .3s ease"
        transform="translateX(-10px)"
        opacity={0}
        _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
        justify="flex-end"
        align="center"
        flex={1}
      >
        <Icon
          icon="arrowRight"
          color={useColorModeValue('#A4A4A4', '#EEF9FE')}
          width="15px"
          height="15px"
        />
      </Flex>
    </Stack>
  </Link>
);

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

const MobileNavItem = ({
  label, subMenu, href, description, icon,
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const commonColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Stack spacing={4} onClick={subMenu && onToggle}>
      {!subMenu && (
        <NextChakraLink
          py={2}
          // as={Link}
          href={href}
          display="flex"
          justifyContent="space-between"
          align="center"
          _hover={{
            textDecoration: 'none',
          }}
        >
          <Text fontWeight={400} color={commonColor}>
            {label}
          </Text>
        </NextChakraLink>
      )}
      {subMenu && (
        <Flex
          py={2}
          justifyContent="left"
          gridGap="10px"
          align="center"
          _hover={{
            textDecoration: 'none',
          }}
        >
          <Text fontWeight={400} color={useColorModeValue('gray.600', 'gray.200')}>
            {label}
          </Text>
          <Box
            display="flex"
            onClick={(e) => e.preventDefault()}
            transition="all .25s ease-in-out"
            transform={isOpen ? 'rotate(90deg)' : 'rotate(0deg)'}
          >
            <Icon icon="arrowRight" color="gray" width="12px" height="12px" />
          </Box>
        </Flex>
      )}

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          // mt={2}
          pl={4}
          borderLeft="2px solid"
          // borderStyle="solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align="start"
        >
          <Flex
            flexDirection="row"
            padding="20px 0"
            gridGap="15px"
            borderBottom={1}
            borderStyle="solid"
            borderColor={useColorModeValue('gray.200', 'gray.900')}
            alignItems="center"
            color={commonColor}
          >
            <Box width="auto">
              <Icon icon={icon} width="50px" height="50px" />
            </Box>
            <Box display="flex" flexDirection="column">
              <Text size="xl" fontWeight={900}>
                {label}
              </Text>
              <Text color={commonColor} fontWeight={500}>
                {description}
              </Text>
            </Box>
          </Flex>

          {subMenu
            && subMenu.map((child) => (
              <Link
                key={child.label}
                color={commonColor}
                _hover={{
                  color: useColorModeValue('black', 'featuredLight'),
                }}
                style={{ textDecoration: 'none' }}
                py={2}
                href={child.href}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
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

DesktopNav.propTypes = {
  NAV_ITEMS: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.string,
      href: PropTypes.string,
      subMenu: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          subLabel: PropTypes.string,
          href: PropTypes.string,
        }),
      ),
    }),
  ),
};

DesktopSubNav.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string,
  subLabel: PropTypes.string,
};

MobileNavItem.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.string,
  href: PropTypes.string,
  subMenu: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      subLabel: PropTypes.string,
      href: PropTypes.string,
    }),
  ),
};
DesktopNav.defaultProps = {
  NAV_ITEMS: [
    {
      href: '/',
      description: '',
      icon: 'book',
    },
  ],
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

DesktopSubNav.defaultProps = {
  href: '/',
  subLabel: '',
};

MobileNavItem.defaultProps = {
  href: '/',
  description: '',
  icon: 'book',
  subMenu: undefined,
};

export default NavbarWithSubNavigation;
