import {
  Box, Flex, IconButton, Avatar, Stack, Collapse, useColorModeValue,
  useDisclosure, useColorMode, Popover, PopoverTrigger,
  PopoverContent, PopoverArrow, Button, Divider,
  useBreakpointValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  useState, memo, useEffect,
} from 'react';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { es, en } from 'date-fns/locale';
import { formatDistanceStrict } from 'date-fns';
import NextChakraLink from '../NextChakraLink';
import Icon from '../Icon';
import DesktopNavItem from './DesktopNavItem';
import MobileNav from './MobileNav';
import useCohortHandler from '../../hooks/useCohortHandler';
import useSession from '../../hooks/useSession';
import Heading from '../Heading';
import useAuth from '../../hooks/useAuth';
import LanguageSelector from '../LanguageSelector';
import { setStorageItem } from '../../utils';
import { WHITE_LABEL_ACADEMY } from '../../utils/variables';
import axios from '../../axios';
import bc from '../../services/breathecode';
import logoData from '../../../public/logo.json';
import { parseQuerys } from '../../utils/url';
import useStyle from '../../hooks/useStyle';
import useSubscriptions from '../../hooks/useSubscriptions';

function Navbar({ translations, pageProps }) {
  const { location, isLoadingLocation } = useSession();
  const { isAuthenticated, isLoading, user, logout, cohorts } = useAuth();
  const [navbarItems, setNavbarItems] = useState([]);
  const [mktCourses, setMktCourses] = useState([]);
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const { allSubscriptions } = useSubscriptions();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { t } = useTranslation('navbar');
  const router = useRouter();
  const { isOpen, onToggle } = useDisclosure();
  const { toggleColorMode } = useColorMode();
  const fontColor = useColorModeValue('black', 'gray.200');
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { hexColor, colorMode, reverseColorMode, borderColor, borderColor2, navbarBackground } = useStyle();

  const existsCohortWithoutAvailableAsSaas = cohorts.some((c) => c?.available_as_saas === false);
  const existsPaidSubscription = allSubscriptions.some((sb) => sb?.invoices?.[0]?.amount > 0);
  const hasPaidSubscription = existsCohortWithoutAvailableAsSaas || existsPaidSubscription;

  const disableLangSwitcher = pageProps?.disableLangSwitcher || false;
  const { locale } = router;

  const imageFilter = useColorModeValue('none', 'brightness(0) invert(1)');

  const whiteLabelitems = t('white-label-version-items', {}, { returnObjects: true });
  const preDefinedItems = t('items', {}, { returnObjects: true });

  axios.defaults.headers.common['Accept-Language'] = locale;

  const parsedDateJoined = user?.date_joined || new Date();

  const locales = {
    en,
    es,
  };

  const formattedDateJoined = formatDistanceStrict(
    new Date(parsedDateJoined),
    new Date(),
    { addSuffix: true, locale: locales[locale] },
  );

  const handleGetStartedButton = (e) => {
    e.preventDefault();

    const enrollButton = document.getElementById('bootcamp-enroll-button');

    if (enrollButton) {
      enrollButton.click();
    } else {
      window.location.href = `/${locale}/pricing${parseQuerys({ internal_cta_placement: 'navbar-get-started' }, false)}`;
    }
  };

  const fetchMktCourses = async () => {
    try {
      const mktQueryString = {
        featured: true,
        academy: WHITE_LABEL_ACADEMY,
        country_code: location?.countryShort,
      };
      const response = await bc.marketing(mktQueryString).courses();

      const filterByTranslations = response?.data?.filter((item) => {
        if (!item?.course_translation?.title) {
          console.warn(`Course ${item?.slug} has no translation title`);
          return false;
        }
        if (item?.visibility === 'UNLISTED') {
          return false;
        }
        return true;
      });

      const coursesStruct = filterByTranslations?.map((item) => ({
        ...item,
        slug: item?.slug,
        label: item?.course_translation?.title,
        href: `/${locale}/bootcamp/${item?.slug}`,
        icon: item?.icon_url,
      }));

      setMktCourses(coursesStruct || []);
    } catch (error) {
      console.error(`Error fetching mkt courses: ${error}`);
      setMktCourses([]);
    }
  };

  useEffect(() => {
    if (!isLoadingLocation) {
      fetchMktCourses();
    }
  }, [locale, isLoadingLocation]);

  useEffect(() => {
    if (pageProps?.existsWhiteLabel) {
      setNavbarItems(whiteLabelitems);
    } else if (!isLoading && user?.id) {
      setNavbarItems(preDefinedItems.filter((item) => (item.disabled !== true && item.hide_on_auth !== true)));
    } else {
      setNavbarItems(preDefinedItems.filter((item) => item.disabled !== true));
    }
  }, [user, cohorts, isLoading, cohortSession, mktCourses, router.locale, location]);

  const closeSettings = () => {
    setIsPopoverOpen(false);
  };

  const userImg = user?.profile?.avatar_url || user?.github?.avatar_url;

  const getName = () => {
    if (user?.first_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.github?.name;
  };

  if (pageProps?.previewMode) return null;

  const prepareMenuData = (item, coursesArray) => {
    if (item.id !== 'bootcamps' || !Array.isArray(item.mainMenu)) return item;
    const selfPacedIndex = item.mainMenu.findIndex((sub) => sub.id === 'self-paced-options');
    if (selfPacedIndex === -1 || !Array.isArray(item.mainMenu[selfPacedIndex]?.subMenu)) return item;

    const newMainMenu = item.mainMenu.map((menuItem, index) => {
      if (index === selfPacedIndex) {
        return {
          ...menuItem,
          subMenu: [
            ...coursesArray,
            ...menuItem.subMenu,
          ],
        };
      }
      return menuItem;
    });

    return {
      ...item,
      mainMenu: newMainMenu,
    };
  };

  const allItems = navbarItems?.length > 0 ? navbarItems : preDefinedItems;

  const privateItems = allItems?.filter((item) => (isAuthenticated ? item.private : false)) || [];
  const publicItems = allItems?.filter((item) => !item.private) || [];
  const allNavbarItems = [...privateItems, ...publicItems]
    .map((item) => prepareMenuData(item, mktCourses))
    .sort((a, b) => a.position - b.position);

  return (
    <>
      {/* Overlay oscuro para mobile, siempre montado para permitir el fade */}
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="fixed"
        left={0}
        width="100vw"
        height="100vh"
        bg="rgba(0,0,0,0.5)"
        zIndex={10}
        onClick={onToggle}
        opacity={isOpen ? 1 : 0}
        transition="opacity 0.3s ease"
        pointerEvents={isOpen ? 'auto' : 'none'}
      />
      <Box position="relative" zIndex={100}>
        <Flex
          transition="all .2s ease"
          bg={useColorModeValue('white', 'gray.800')}
          color={useColorModeValue('gray.600', 'white')}
          height="7vh"
          py={{ base: '8px' }}
          px={{ base: 4 }}
          borderBottom={1}
          borderStyle="solid"
          borderColor={isOpen ? borderColor : useColorModeValue('gray.200', 'gray.900')}
          justifyContent="space-between"
          gridGap={{ base: '10px', md: '2rem' }}
          align="center"
        >
          <Flex
            ml={{ base: -2 }}
            display={{ base: 'flex', lg: 'none' }}
            gridGap="12px"
            className="here-2"
          >
            <IconButton
              onClick={onToggle}
              _hover={{
                background: navbarBackground,
              }}
              _active={{
                background: navbarBackground,
              }}
              background={navbarBackground}
              color={colorMode === 'light' ? 'black' : 'white'}
              icon={
                isOpen ? (
                  <Icon icon="close2" width="22px" height="22px" />
                ) : (
                  <Icon icon="hamburger2" width="22px" height="22px" />
                )
              }
              variant="default"
              height="auto"
              aria-label="Toggle Navigation"
            />
            <NextLink href={isAuthenticated ? '/choose-program' : '/'} style={{ minWidth: '105px', alignSelf: 'center', display: 'flex' }}>
              {pageProps?.existsWhiteLabel && logoData?.logo_url ? (
                <Image
                  src={logoData.logo_url}
                  width={105}
                  height={35}
                  style={{
                    maxHeight: '35px',
                    minHeight: '35px',
                    objectFit: 'cover',
                    filter: imageFilter,
                  }}
                  alt={logoData?.name ? `${logoData.name} logo` : '4Geeks logo'}
                />
              ) : <Icon icon="4Geeks-logo" secondColor={hexColor.black} width="95px" height="35px" />}
            </NextLink>
          </Flex>

          <Flex
            display={{ base: 'none', lg: 'flex' }}
            justify={{ base: 'center', xl: 'start' }}
          >
            <NextLink href={isAuthenticated ? '/choose-program' : '/'} style={{ alignSelf: 'center', display: 'flex' }}>
              {pageProps?.existsWhiteLabel && logoData?.logo_url ? (
                <Image
                  src={logoData.logo_url}
                  width={105}
                  height={35}
                  style={{
                    maxHeight: '50px',
                    minHeight: '50px',
                    objectFit: pageProps?.existsWhiteLabel ? 'contain' : 'cover',
                    filter: imageFilter,
                  }}
                  alt={logoData?.name ? `${logoData.name} logo` : '4Geeks logo'}
                />
              ) : <Icon icon="4GeeksIcon" secondColor={hexColor.black} width="90px" height="35px" />}
            </NextLink>

            <Flex display="flex" ml={10}>
              <Stack className="hideOverflowX__" direction="row" width="auto" spacing={4} alignItems="center">
                {!isMobile && allNavbarItems.map((item) => (
                  <DesktopNavItem key={item.label} item={item} />
                ))}
              </Stack>
            </Flex>
          </Flex>

          <Stack justify="flex-end" alignItems="center" direction="row" gridGap={hasPaidSubscription ? '16px' : '20px'}>
            <Flex display={{ base: 'none', md: 'flex' }} gridGap="18px">
              {disableLangSwitcher !== true && (
                <LanguageSelector display={{ base: 'none ', lg: 'block' }} translations={translations} minWidth="unset" />
              )}
              <IconButton
                style={{
                  margin: 0,
                  minWidth: 'unset',
                }}
                display={{ base: 'none', lg: 'flex' }}
                height="auto"
                _hover={{
                  background: navbarBackground,
                }}
                _active={{
                  background: navbarBackground,
                }}
                aria-label={`Toggle ${reverseColorMode} mode`}
                background={navbarBackground}
                onClick={() => {
                  toggleColorMode();
                }}
                icon={
                  colorMode === 'light' ? (
                    <Icon icon="light" id="light-button-desktop" width="25px" height="23px" color="black" />
                  ) : (
                    <Icon icon="dark" id="dark-button-desktop" width="20px" height="20px" />
                  )
                }
              />
            </Flex>
            <Box display={{ base: 'none', lg: 'inherit' }} height="35px" style={{ margin: 0 }}>
              <Divider orientation="vertical" borderColor={hexColor.fontColor3} opacity={0.5} />
            </Box>
            {hasPaidSubscription && (
              <Box display="flex" alignItems="center" height="100%" zIndex={10}>
                <Icon icon="crown" width="20px" height="26px" color="" />
              </Box>
            )}
            {isAuthenticated || isLoading ? (
              <Popover
                id="Avatar-Hover"
                isOpen={isPopoverOpen}
                onClose={closeSettings}
                placement="bottom-start"
                trigger="click"
              >
                <PopoverTrigger>
                  <Button
                    bg="rgba(0,0,0,0)"
                    alignSelf="center"
                    width="20px"
                    aria-label="User Profile"
                    minWidth="20px"
                    maxWidth="20px"
                    height="30px"
                    borderRadius="30px"
                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                    title="Profile"
                    position="relative"
                    style={{ margin: 0 }}
                  >
                    <Avatar
                      width="30px"
                      marginY="auto"
                      height="30px"
                      src={userImg}
                    />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  border={0}
                  style={{ boxShadow: 'var(--chakra-shadows-2xl) !important' }}
                  rounded="md"
                  width={{ base: '100%', md: 'auto' }}
                  minW={{ base: 'auto', md: 'md' }}
                >
                  <PopoverArrow />

                  {/* Container Section */}
                  <Box p="1rem 1.5rem 0 1.5rem">
                    <Stack flexDirection="row" gridGap="10px" pb="15px">
                      <Avatar
                        width="62px"
                        marginY="auto"
                        height="62px"
                        src={userImg}
                      />
                      <Flex flexDirection="column" alignItems="flex-start" gridGap="6px">
                        <Heading as="p" size="20px" fontWeight="700">
                          {getName() || ''}
                        </Heading>
                        {user?.date_joined && (
                          <Heading as="p" size="16px" maxWidth="300px" textTransform="initial" fontWeight="400">
                            {t('member-since', { date: formattedDateJoined })}
                          </Heading>
                        )}
                      </Flex>
                    </Stack>

                    <Flex
                      borderTop={2}
                      borderStyle="solid"
                      borderColor={borderColor2}
                      alignItems="center"
                      padding="1rem 0rem"
                    >
                      <NextChakraLink
                        href="/profile/info"
                        fontWeight="400"
                        color={fontColor}
                        fontSize="14px"
                        textDecoration="none"
                        _hover={{
                          textDecoration: 'none',
                        }}
                        letterSpacing="0.05em"
                      >
                        {t('my-profile')}
                      </NextChakraLink>
                    </Flex>
                    <Flex
                      borderTop={2}
                      borderStyle="solid"
                      borderColor={borderColor2}
                      alignItems="center"
                      padding="1rem 0rem"
                    >
                      <Box
                        as="button"
                        cursor="pointer"
                        width="auto"
                        display="flex"
                        gridGap="10px"
                        onClick={() => {
                          setIsPopoverOpen(false);
                          setTimeout(() => {
                            logout();
                          }, 150);
                        }}
                        title={t('logout')}
                      >
                        <Icon icon="logout" width="20px" height="20px" />
                        <Box
                          fontWeight="700"
                          color="blue.400"
                          as="span"
                          fontSize="14px"
                        >
                          {t('logout')}
                        </Box>
                      </Box>
                    </Flex>
                  </Box>
                </PopoverContent>
              </Popover>
            ) : (
              <Box display="flex" gridGap="24px" style={{ margin: 0 }} alignItems="center">
                <NextChakraLink
                  display={{ base: 'none', md: 'block' }}
                  href="/login"
                  fontWeight="700"
                  fontSize="14px"
                  padding="12px 0"
                  lineHeight="22px"
                  onClick={() => setStorageItem('redirect', router?.asPath)}
                  _hover={{
                    textDecoration: 'none',
                  }}
                  letterSpacing="0.05em"
                >
                  {t('login')}
                </NextChakraLink>
                <Button
                  variant="default"
                  onClick={handleGetStartedButton}
                >
                  {t('get-started')}
                </Button>
              </Box>
            )}
          </Stack>
        </Flex>

        <Collapse display={{ lg: 'block' }} in={isOpen} animateOpacity>
          <MobileNav
            navbarItems={allNavbarItems}
            translations={translations}
            onClickLink={onToggle}
          />
        </Collapse>
      </Box>
    </>
  );
}

Navbar.propTypes = {
  translations: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
  pageProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array, PropTypes.bool])),
};
Navbar.defaultProps = {
  translations: undefined,
  pageProps: undefined,
};

export default memo(Navbar);
