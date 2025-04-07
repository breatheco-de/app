import {
  Box, Flex, IconButton, Avatar, Stack, Collapse, useColorModeValue,
  useDisclosure, useColorMode, Popover, PopoverTrigger,
  PopoverContent, PopoverArrow, Button, Link, Divider,
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
import Text from '../Text';
import useAuth from '../../hooks/useAuth';
import LanguageSelector from '../LanguageSelector';
import { setStorageItem } from '../../../utils';
import { WHITE_LABEL_ACADEMY } from '../../../utils/variables';
import axios from '../../../axios';
import bc from '../../services/breathecode';
import logoData from '../../../../public/logo.json';
import { parseQuerys } from '../../../utils/url';
import useStyle from '../../hooks/useStyle';
import { getAllMySubscriptions } from '../../handlers/subscriptions';

function Navbar({ translations, pageProps }) {
  const [uniqueLanguages, setUniqueLanguages] = useState([]);
  const { userSession, location } = useSession();
  const isUtmMediumAcademy = userSession?.utm_medium === 'academy';
  const { isAuthenticated, isLoading, user, logout, cohorts } = useAuth();
  const [navbarItems, setNavbarItems] = useState([]);
  const [mktCourses, setMktCourses] = useState([]);
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [hasPaidSubscription, setHasPaidSubscription] = useState(false);

  const { t } = useTranslation('navbar');
  const router = useRouter();
  const { isOpen, onToggle } = useDisclosure();
  const { toggleColorMode } = useColorMode();
  const fontColor = useColorModeValue('black', 'gray.200');
  const { hexColor, colorMode, reverseColorMode, borderColor, lightColor, navbarBackground } = useStyle();

  const disableLangSwitcher = pageProps?.disableLangSwitcher || false;
  const langs = ['en', 'es'];
  const locale = router.locale === 'default' ? 'en' : router.locale;

  const imageFilter = useColorModeValue('none', 'brightness(0) invert(1)');

  const translationsPropsExists = translations?.length > 0;

  const whiteLabelitems = t('white-label-version-items', {}, { returnObjects: true });
  const preDefinedItems = t('items', {}, { returnObjects: true });
  const languages = t('languages', {}, { returnObjects: true });

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

  const verifyIfHasPaidSubscription = async () => {
    const subscriptions = await getAllMySubscriptions();

    const existsCohortWithoutAvailableAsSaas = cohorts?.length > 0 && cohorts.some((c) => c?.available_as_saas === false);
    const existsPaidSubscription = subscriptions.some((sb) => sb?.invoices?.[0]?.amount > 0);
    setHasPaidSubscription(existsCohortWithoutAvailableAsSaas || existsPaidSubscription);
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      verifyIfHasPaidSubscription();
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    const filteredLanguages = [...new Map(((translationsPropsExists && translations) || languages)
      .map((lang) => [lang.value, lang])).values()];
    setUniqueLanguages(filteredLanguages);
  }, [router.asPath]);

  const fetchMktCourses = async () => {
    try {
      const mktQueryString = {
        featured: true,
        academy: WHITE_LABEL_ACADEMY,
      };
      const response = await bc.marketing(mktQueryString).courses();
      const filterByTranslations = response?.data?.filter((item) => item?.course_translation !== null && item?.visibility !== 'UNLISTED');
      const coursesStruct = filterByTranslations?.map((item) => ({
        ...item,
        slug: item?.slug,
        label: item?.course_translation?.title,
        asPath: `/course/${item?.slug}`,
        icon: item?.icon_url,
        description: item?.course_translation?.description,
        subMenu: [
          {
            href: `/bootcamp/${item?.slug}`,
            label: t('course-details'),
          },
        ],
      }));

      setMktCourses(coursesStruct || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMktCourses();
  }, [locale]);

  useEffect(() => {
    if (pageProps?.existsWhiteLabel) {
      setNavbarItems(whiteLabelitems);
    } else {
      const preFilteredItems = preDefinedItems.filter(
        (item) => (isUtmMediumAcademy ? item.id !== 'bootcamps' : true) && (item.id === 'bootcamps' ? location?.countryShort !== 'ES' : true),
      );
      if (!isLoading && user?.id) {
        const isBootcampStudent = cohorts.some((cohort) => !cohort.available_as_saas);
        setNavbarItems(
          preFilteredItems
            .filter((item) => (item.disabled !== true && item.hide_on_auth !== true)
              && (item.id !== 'bootcamps' || !isBootcampStudent)),
        );
      } else {
        setNavbarItems(preFilteredItems.filter((item) => item.disabled !== true));
      }
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

  // manage submenus in level 1
  const prepareSubMenuData = (item) => {
    if (item.id === 'bootcamps') {
      return mktCourses;
    }
    return item?.subMenu;
  };

  const allItems = navbarItems?.length > 0 ? navbarItems : preDefinedItems;

  const privateItems = allItems?.filter((item) => (isAuthenticated ? item.private : false)) || [];
  const publicItems = allItems?.filter((item) => !item.private) || [];
  const allNavbarItems = [...privateItems, ...publicItems]
    .map((item) => {
      const submenuData = prepareSubMenuData(item);
      const subMenuLength = item.subMenu?.length;

      return ({
        ...item,
        subMenu: subMenuLength > 1 ? item.subMenu : submenuData,
      });
    })
    .sort((a, b) => a.position - b.position);

  return (
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
          <NextLink href={isAuthenticated ? '/choose-program' : '/'} style={{ minWidth: '105px', alignSelf: 'center', display: 'flex' }}>
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
            ) : <Icon icon="4Geeks-logo" secondColor={hexColor.black} width="95px" height="35px" />}
          </NextLink>

          <Flex display="flex" ml={10}>
            <Stack className="hideOverflowX__" direction="row" width="auto" spacing={4} alignItems="center">
              {allNavbarItems.map((item) => (
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
                boxShadow="2xl"
                rounded="md"
                width={{ base: '100%', md: 'auto' }}
                minW={{ base: 'auto', md: 'md' }}
              >
                <PopoverArrow />
                <Box
                  boxShadow="dark-lg"
                  bg={navbarBackground}
                  rounded="md"
                  width={{ base: '100%', md: 'auto' }}
                  minW={{ base: 'auto', md: 'md' }}
                >

                  {/* Language Section */}
                  <Box
                    width="100%"
                    borderBottom={2}
                    borderStyle="solid"
                    borderColor={borderColor}
                    display="flex"
                    justifyContent="space-between"
                    padding="12px 1.5rem"
                  >
                    <Text size="md" fontWeight="700">
                      {t('language')}
                    </Text>
                    {disableLangSwitcher !== true && (
                      <Box display="flex" flexDirection="row">
                        {uniqueLanguages.map((l, i) => {
                          const lang = languages.find((language) => language?.value === l?.lang);
                          const value = translationsPropsExists ? lang?.value : l.value;
                          const path = translationsPropsExists ? l?.link : router.asPath;

                          const cleanedPath = (path === '/' && value !== 'en') ? '' : path;
                          const localePrefix = `${value !== 'en' && !cleanedPath?.includes(`/${value}`) ? `/${value}` : ''}`;
                          const link = `${localePrefix}${cleanedPath}`;

                          const getIconFlags = value === 'en' ? 'usaFlag' : 'spainFlag';
                          const getLangName = value === 'en' ? 'Eng' : 'Esp';

                          return (
                            <Box display="flex" flexDirection="row" key={value}>
                              <Link
                                _hover={{
                                  textDecoration: 'none',
                                  color: 'blue.default',
                                }}
                                color={locale === lang ? 'blue.default' : lightColor}
                                fontWeight={locale === lang ? '700' : '400'}
                                href={link}
                                display="flex"
                                alignItems="center"
                                textTransform="uppercase"
                                gridGap="5px"
                                size="sm"
                              >
                                <Icon icon={getIconFlags} width="16px" height="16px" />
                                {getLangName}
                              </Link>
                              {i < langs.length - 1 && (
                                <Box width="1px" height="100%" background="gray.350" margin="0 6px" />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>

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
                      borderColor={borderColor}
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
                      borderColor={borderColor}
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
