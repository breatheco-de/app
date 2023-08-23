import {
  Box, Flex, IconButton, Avatar, Stack, Collapse, useColorModeValue,
  useDisclosure, useColorMode, Popover, PopoverTrigger,
  PopoverContent, PopoverArrow, Button, Link,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  useState, memo, useEffect, Fragment,
} from 'react';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { formatDistanceStrict } from 'date-fns';
import NextChakraLink from '../NextChakraLink';
import Icon from '../Icon';
import bc from '../../services/breathecode';
import DesktopNav from '../../../js_modules/navbar/DesktopNav';
import MobileNav from '../../../js_modules/navbar/MobileNav';
import { usePersistent } from '../../hooks/usePersistent';
import Heading from '../Heading';
import Text from '../Text';
import useAuth from '../../hooks/useAuth';
import navbarTR from '../../translations/navbar';
import LanguageSelector from '../LanguageSelector';
import { getBrowserSize, isWindow } from '../../../utils';
import axios from '../../../axios';
import modifyEnv from '../../../../modifyEnv';
import logloData from '../../../../public/logo.json';
// import UpgradeExperience from '../UpgradeExperience';

const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

function Close2() {
  return (
    <svg
      width="22px"
      height="22px"
      viewBox="0 0 19 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        stroke="currentColor"
        x1="1.5"
        y1="2"
        x2="16.5645"
        y2="2"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Hamburger2() {
  return (
    <svg
      width="22px"
      height="22px"
      viewBox="0 0 28 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        stroke="currentColor"
        x1="1.5"
        y1="1.5"
        x2="26.5"
        y2="1.5"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        stroke="currentColor"
        x1="1.5"
        y1="12"
        x2="16.5645"
        y2="12"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        stroke="currentColor"
        x1="1.5"
        y1="22.5"
        x2="26.5"
        y2="22.5"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavbarWithSubNavigation({ translations, pageProps }) {
  const HAVE_SESSION = typeof window !== 'undefined' ? localStorage.getItem('accessToken') !== null : false;

  const [haveSession, setHaveSession] = useState(HAVE_SESSION);
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [ITEMS, setITEMS] = useState([]);
  const [mktCourses, setMktCourses] = useState([]);
  const [cohortsOfUser, setCohortsOfUser] = useState([]);
  const [cohortSession] = usePersistent('cohortSession', {});
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { t } = useTranslation('navbar');
  const router = useRouter();
  const { isOpen, onToggle } = useDisclosure();
  const { toggleColorMode } = useColorMode();
  const commonColors = useColorModeValue('white', 'gray.800');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const commonBorderColor = useColorModeValue('gray.200', 'gray.700');
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const fontColor = useColorModeValue('black', 'gray.200');
  const colorMode = useColorModeValue('light', 'dark');

  const disableLangSwitcher = pageProps?.disableLangSwitcher || false;
  const langs = ['en', 'es'];
  const locale = router.locale === 'default' ? 'en' : router.locale;

  const query = isWindow && new URLSearchParams(window.location.search || '');
  const queryToken = isWindow && query.get('token')?.split('?')[0];
  const queryTokenExists = isWindow && queryToken !== undefined && queryToken;
  const sessionExists = haveSession || queryTokenExists;
  const { width: screenWidth } = getBrowserSize();
  const isMobile = screenWidth < 768;

  useEffect(() => {
    // verify if accessToken exists
    if (!isLoading && isAuthenticated) {
      setHaveSession(true);
    }
  }, [isLoading]);

  const {
    languagesTR,
  } = navbarTR[locale];
  const translationsPropsExists = translations?.length > 0;

  const { selectedProgramSlug } = cohortSession;

  const programSlug = cohortSession?.selectedProgramSlug || '/choose-program';

  const items = t('ITEMS', {
    selectedProgramSlug: selectedProgramSlug || '/choose-program',
  }, { returnObjects: true });

  axios.defaults.headers.common['Accept-Language'] = locale;

  // Verify if teacher acces is with current cohort role
  const getDateJoined = user?.active_cohort?.date_joined
    || cohortSession?.date_joined
    || new Date();

  const dateJoined = {
    en: `Member since ${formatDistanceStrict(
      new Date(getDateJoined),
      new Date(),
      { addSuffix: true },
    )}`,
    es: `Miembro desde ${formatDistanceStrict(
      new Date(getDateJoined),
      new Date(),
      { addSuffix: true, locale: es },
    )}`,
  };

  useEffect(() => {
    axios.get(`${BREATHECODE_HOST}/v1/marketing/course?featured=true`)
      .then((response) => {
        const filterByTranslations = response?.data?.filter((item) => item?.course_translation !== null);
        setMktCourses(filterByTranslations || []);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (!isLoading && user !== null && mktCourses?.length > 0) {
      Promise.all([
        bc.payment({
          status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
        }).subscriptions(),
        bc.admissions().me(),
      ])
        .then((responses) => {
          const [subscriptions, userResp] = responses;
          const subscriptionRespData = subscriptions?.data;
          const formatedCohortSubscriptions = userResp?.data?.cohorts?.map((value) => ({
            ...value,
            name: value.cohort.name,
            plan_financing: subscriptionRespData?.plan_financings?.find(
              (sub) => sub?.selected_cohort?.slug === value?.cohort?.slug,
            ) || null,
            subscription: subscriptionRespData?.subscriptions?.find(
              (sub) => sub?.selected_cohort?.slug === value?.cohort?.slug,
            ) || null,
            slug: value?.cohort?.slug,
          }));

          setCohortsOfUser(formatedCohortSubscriptions);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [isLoading, mktCourses]);

  const activeSubscriptionCohorts = cohortsOfUser?.length > 0 ? cohortsOfUser?.filter((item) => {
    const cohort = item?.cohort;
    const subscriptionExists = item?.subscription !== null || item?.plan_financing !== null;

    return ((cohort?.available_as_saas && subscriptionExists) || cohort?.available_as_saas === false);
  }) : [];

  const marketingCourses = Array.isArray(mktCourses) && mktCourses.filter(
    (item) => !activeSubscriptionCohorts.some(
      (activeCohort) => activeCohort?.cohort?.syllabus_version?.slug === item?.slug,
    ) && item?.course_translation?.title,
  );

  const isNotAvailableForMktCourses = activeSubscriptionCohorts.length > 0 && activeSubscriptionCohorts.some(
    (item) => item?.cohort?.available_as_saas === false,
  );

  const mktCoursesFormat = marketingCourses.length > 0 ? marketingCourses.map((item) => ({
    slug: item?.slug,
    label: item?.course_translation?.title,
    asPath: `/course/${item?.slug}`,
    icon: item?.icon_url,
    description: item?.course_translation?.description,
    subMenu: [
      {
        href: `/${item?.slug}`,
        label: t('start-coding'),
      },
    ],
  })) : [];

  useEffect(() => {
    if (!isLoading && user?.id) {
      setITEMS(items.filter((item) => item.disabled !== true && item?.hide_on_auth !== true));
    } else {
      setITEMS(items.filter((item) => item.disabled !== true));
    }
  }, [user, isLoading, selectedProgramSlug, mktCourses]);

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  const userImg = user?.profile?.avatar_url || user?.github?.avatar_url;
  // const getImage = () => {
  //   if (user && user.github) {
  //     return user.github.avatar_url;
  //   }
  //   return '';
  // };

  const getName = () => {
    if (user && user?.first_name) {
      return `${user?.first_name} ${user?.last_name}`;
    }
    return user?.github?.name;
  };

  if (pageProps?.previewMode) return null;

  const logo = useColorModeValue(
    <Image
      src="/static/images/4geeks.png"
      width={105}
      height={35}
      style={{
        maxHeight: '35px',
        minHeight: '35px',
        objectFit: 'cover',
      }}
      alt="4Geeks logo"
    />,
    <Box padding="5px 5px">
      <Icon icon="4Geeks-logo" width="95px" height="35px" />
    </Box>,
  );

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
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        justifyContent="space-between"
        align="center"
      >
        {isMobile && (
          <Flex
            ml={{ base: -2 }}
            display={{ base: 'flex', xl: 'none' }}
            gridGap="12px"
            className="here-2"
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
              color={colorMode === 'light' ? 'black' : 'white'}
              icon={
                isOpen ? (
                  <Close2 />
                ) : (
                  <Hamburger2 />
                )
              }
              variant="default"
              height="auto"
              aria-label="Toggle Navigation"
            />
            <NextLink href={sessionExists ? programSlug : '/'} style={{ minWidth: '105px', alignSelf: 'center', display: 'flex' }}>
              {logloData?.logo_url
                ? (
                  <Image
                    src={logloData.logo_url}
                    width={105}
                    height={35}
                    style={{
                      maxHeight: '35px',
                      minHeight: '35px',
                      objectFit: 'cover',
                    }}
                    alt={logloData?.name ? `${logloData.name} logo` : '4Geeks logo'}
                  />
                )
                : logo}
            </NextLink>
          </Flex>
        )}

        <Flex
          display={{ base: 'none', xl: 'flex' }}
          justify={{ base: 'center', xl: 'start' }}
        >
          <NextLink href={sessionExists ? programSlug : '/'} style={{ minWidth: '105px', alignSelf: 'center', display: 'flex' }}>
            {logloData?.logo_url
              ? (
                <Image
                  src={logloData.logo_url}
                  width={105}
                  height={35}
                  style={{
                    maxHeight: '35px',
                    minHeight: '35px',
                    objectFit: 'cover',
                  }}
                  alt={logloData?.name ? `${logloData.name} logo` : '4Geeks logo'}
                />
              )
              : logo}
          </NextLink>

          <Flex display="flex" ml={10}>
            <DesktopNav NAV_ITEMS={ITEMS?.length > 0 ? ITEMS : items} extraContent={mktCoursesFormat} haveSession={sessionExists} />
          </Flex>
        </Flex>

        <Stack justify="flex-end" direction="row" gridGap="5px">
          {/* {!isNotAvailableForMktCourses && marketingCourses?.length > 0 && (
            <Box display={{ base: 'none', md: 'block' }}>
              <UpgradeExperience data={marketingCourses} />
            </Box>
          )} */}

          {disableLangSwitcher !== true && (
            <LanguageSelector display={{ base: 'none ', md: 'block' }} translations={translations} />
          )}
          <IconButton
            style={{
              margin: 0,
            }}
            display={isMobile ? 'none' : 'flex'}
            height="auto"
            _hover={{
              background: commonColors,
            }}
            _active={{
              background: commonColors,
            }}
            aria-label="Dark mode switch"
            background={commonColors}
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

          {sessionExists ? (
            <Popover
              id="Avatar-Hover"
              isOpen={settingsOpen}
              onClose={closeSettings}
              placement="bottom-start"
              trigger="click"
            >
              <PopoverTrigger>
                <Button
                  bg="rgba(0,0,0,0)"
                  alignSelf="center"
                  width="20px"
                  minWidth="20px"
                  maxWidth="20px"
                  height="30px"
                  borderRadius="30px"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  title="Profile"
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
                  bg={popoverContentBgColor}
                  rounded="md"
                  width={{ base: '100%', md: 'auto' }}
                  minW={{ base: 'auto', md: 'md' }}
                >

                  {/* Language Section */}
                  <Box
                    width="100%"
                    borderBottom={2}
                    borderStyle="solid"
                    borderColor={commonBorderColor}
                    display="flex"
                    justifyContent="space-between"
                    padding="12px 1.5rem"
                  >
                    <Text size="md" fontWeight="700">
                      {t('language')}
                    </Text>
                    {disableLangSwitcher !== true && (
                      <Box display="flex" flexDirection="row">
                        {((translationsPropsExists
                          && translations)
                          || languagesTR).map((l, i) => {
                          const lang = languagesTR.filter((language) => language?.value === l?.lang)[0];
                          const value = translationsPropsExists ? lang?.value : l.value;
                          const path = translationsPropsExists ? l?.link : router.asPath;

                          const cleanedPath = (path === '/' && value !== 'en') ? '' : path;
                          const localePrefix = `${value !== 'en' && !cleanedPath.includes(`/${value}`) ? `/${value}` : ''}`;

                          const link = `${localePrefix}${cleanedPath}`;

                          const getIconFlags = value === 'en' ? 'usaFlag' : 'spainFlag';
                          const getLangName = value === 'en' ? 'Eng' : 'Esp';

                          return (
                            <Fragment key={lang || value}>
                              <Link
                                _hover={{
                                  textDecoration: 'none',
                                  color: 'blue.default',
                                }}
                                color={locale === lang ? 'blue.default' : linkColor}
                                fontWeight={locale === lang ? '700' : '400'}
                                key={value}
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
                              {
                                i < langs.length - 1 && (
                                  <Box width="1px" height="100%" background="gray.350" margin="0 6px" />
                                )
                              }
                            </Fragment>
                          );
                        })}
                      </Box>
                    )}
                  </Box>

                  {/* Container Section */}
                  <Box p="1rem 1.5rem 0 1.5rem">
                    <Stack flexDirection="row" gridGap="10px" pb="15px">
                      <Avatar
                        // name={user?.first_name}
                        width="62px"
                        marginY="auto"
                        height="62px"
                        src={userImg}
                      />
                      <Flex flexDirection="column" alignItems="flex-start" gridGap="6px">
                        <Heading as="p" size="20px" fontWeight="700">
                          {getName() || ''}
                        </Heading>
                        {(cohortSession?.date_joined || user?.active_cohort?.date_joined) && (
                          <Heading as="p" size="16px" maxWidth="300px" textTransform="initial" fontWeight="400">
                            {dateJoined[locale]}
                          </Heading>
                        )}
                      </Flex>
                    </Stack>

                    <Flex
                      borderTop={2}
                      borderStyle="solid"
                      borderColor={commonBorderColor}
                      // padding="20px 0"
                      alignItems="center"
                      padding="1rem 0rem"
                    >
                      <NextChakraLink
                        href="/profile/info"
                        fontWeight="400"
                        color={fontColor}
                        fontSize="14px"
                        textDecoration="none"
                        // cursor="pointer"
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
                      borderColor={commonBorderColor}
                      // padding="20px 0"
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
                          setSettingsOpen(false);
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
            <NextChakraLink
              href="/login"
              fontWeight="700"
              style={{
                margin: '0 0px 0 10px',
              }}
              fontSize="13px"
              lineHeight="22px"
              _hover={{
                textDecoration: 'none',
              }}
              letterSpacing="0.05em"
            >
              <Button
                display="flex"
                width="100px"
                fontWeight={700}
                lineHeight="0.05em"
                variant="default"
              >
                {t('login')}
              </Button>
            </NextChakraLink>
          )}
        </Stack>
      </Flex>

      <Collapse display={{ lg: 'block' }} in={isOpen} animateOpacity>
        <MobileNav
          mktCourses={!isNotAvailableForMktCourses && mktCoursesFormat}
          NAV_ITEMS={ITEMS?.length > 0 ? ITEMS : items}
          haveSession={sessionExists}
          translations={translations}
          onClickLink={onToggle}
        />
        {/* {isBelowTablet && (
              <MobileNav
                mktCourses={!isNotAvailableForMktCourses && marketingCouses?.length > 0 ? marketingCouses : []}
                NAV_ITEMS={ITEMS}
                haveSession={sessionExists}
                translations={translations}
                readSyllabus={readSyllabus}
                onClickLink={onToggle}
              />
            )}
        */}
      </Collapse>
    </Box>
  );
}

NavbarWithSubNavigation.propTypes = {
  translations: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
  pageProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
};
NavbarWithSubNavigation.defaultProps = {
  translations: undefined,
  pageProps: undefined,
};

export default memo(NavbarWithSubNavigation);
