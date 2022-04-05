import {
  Box,
  Flex,
  IconButton,
  Avatar,
  Stack,
  Collapse,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useColorMode,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Button,
} from '@chakra-ui/react';
import {
  useState, memo, useEffect, Fragment,
} from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { formatDistanceStrict } from 'date-fns';
import NextChakraLink from '../NextChakraLink';
import Icon from '../Icon';
import DesktopNav from '../../../js_modules/navbar/DesktopNav';
import MobileNav from '../../../js_modules/navbar/MobileNav';
import { usePersistent } from '../../hooks/usePersistent';
import Heading from '../Heading';
import Text from '../Text';
import styles from '../../../../styles/flags.module.css';

import useAuth from '../../hooks/useAuth';
import navbarTR from '../../translations/navbar';

const NavbarWithSubNavigation = ({ haveSession, translations }) => {
  const router = useRouter();
  const [readSyllabus, setReadSyllabus] = useState([]);
  const locale = router.locale === 'default' ? 'en' : router.locale;
  const {
    loginTR, logoutTR, languageTR, ITEMS, languagesTR,
  } = navbarTR[locale];

  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const commonColors = useColorModeValue('white', 'gray.800');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const commonBorderColor = useColorModeValue('gray.200', 'gray.900');
  const { user, logout } = useAuth();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);

  const langs = ['en', 'es'];
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const currentLanguage = languagesTR.filter((l) => l.value === locale)[0];

  useEffect(async () => {
    const resp = await fetch(
      `${process.env.BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${process.env.SYLLABUS}`,
    )
      .then((res) => res.json());
    setReadSyllabus(resp);
  }, []);

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

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  const getImage = () => {
    if (user && user.github) {
      return user.github.avatar_url;
    }
    return '';
  };

  const getName = () => {
    if (user && user?.first_name) {
      return `${user?.first_name} ${user?.last_name}`;
    }
    return user?.github.name;
  };

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
            height="auto"
            aria-label="Toggle Navigation"
          />
          <NextChakraLink href="/" alignSelf="center" display="flex">
            <Icon icon="logoModern" width="90px" height="20px" />
          </NextChakraLink>
        </Flex>

        <Flex flex={{ base: 1 }} display={{ base: 'none', md: 'flex' }} justify={{ base: 'center', md: 'start' }}>
          <NextChakraLink href="/" alignSelf="center" display="flex">
            <Icon icon="logoModern" width="90px" height="20px" />
          </NextChakraLink>

          <Flex display="flex" ml={10}>
            <DesktopNav NAV_ITEMS={ITEMS} haveSession={haveSession} readSyllabus={readSyllabus} />
          </Flex>
        </Flex>

        <Stack flex={{ base: 1, md: 0 }} justify="flex-end" direction="row" spacing={6}>
          <Popover
            id="Language-Hover"
            isOpen={languagesOpen}
            onClose={() => setLanguagesOpen(false)}
            placement="bottom-start"
            trigger="click"
          >
            <PopoverTrigger>
              <Button
                padding="0"
                height="auto"
                backgroundColor="transparent"
                width="auto"
                alignSelf="center"
                _hover={{
                  background: 'transparent',
                }}
                _active={{
                  background: 'transparent',
                }}
                onClick={() => setLanguagesOpen(!languagesOpen)}
              >
                <Box
                  className={`${styles.flag} ${styles[currentLanguage.value]}`}
                  width="25px"
                  height="25px"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              // border={0}
              // boxShadow="dark-lg"
              bg={popoverContentBgColor}
              rounded="md"
              width={{ base: '100%', md: 'auto' }}
              minW="210px"
            >
              <PopoverArrow />
              <Box
                width="100%"
                display="flex"
                boxShadow="2xl"
                flexDirection="column"
                gridGap="10px"
                padding="12px"
              >
                {((typeof translations === 'object'
                  && Object.keys(translations)) || languagesTR).map((l) => {
                  const lang = languagesTR.filter((language) => language.value === l)[0];
                  const value = typeof translations === 'object' ? lang.value : l.value;
                  const label = typeof translations === 'object' ? lang.label : l.label;
                  const path = typeof translations === 'object' ? translations[value] : router.asPath;
                  return (
                    <NextChakraLink
                      width="100%"
                      key={value}
                      href={path}
                      locale={value}
                      role="group"
                      alignSelf="center"
                      display="flex"
                      gridGap="5px"
                      fontWeight="bold"
                      textDecoration="none"
                      opacity={locale === (value) ? 1 : 0.75}
                      _hover={{
                        opacity: 1,
                      }}
                    >
                      <Box className={`${styles.flag} ${styles[value]}`} width="25px" height="25px" />
                      {label}
                    </NextChakraLink>
                  );
                })}
              </Box>
            </PopoverContent>
          </Popover>

          <IconButton
            display={useBreakpointValue({ base: 'none', md: 'flex' })}
            height="auto"
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

          {haveSession ? (
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
                >
                  <Avatar
                    // name={user?.first_name}
                    width="30px"
                    marginY="auto"
                    height="30px"
                    src={getImage()}
                  />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                border={0}
                boxShadow="2xl"
                // bg={popoverContentBgColor}
                rounded="md"
                width={{ base: '100%', md: 'auto' }}
                minW={{ base: 'auto', md: 'md' }}
              >
                <PopoverArrow />
                <Box
                  // border={0}
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
                      {languageTR}
                    </Text>
                    <Box display="flex" flexDirection="row">
                      {langs.map((lang, i) => {
                        const getIconFlags = lang === 'en' ? 'usaFlag' : 'spainFlag';
                        const getLangName = lang === 'en' ? 'Eng' : 'Esp';
                        return (
                          <Fragment key={lang}>
                            <NextChakraLink
                              _hover={{
                                textDecoration: 'none',
                                color: 'blue.default',
                              }}
                              color={locale === lang ? 'blue.default' : linkColor}
                              fontWeight={locale === lang ? '700' : '400'}
                              href={router.asPath}
                              locale={lang}
                              display="flex"
                              alignItems="center"
                              textTransform="uppercase"
                              gridGap="5px"
                              size="sm"
                            >
                              <Icon icon={getIconFlags} width="16px" height="16px" />
                              {getLangName}
                            </NextChakraLink>
                            {
                              i < langs.length - 1 && (
                                <Box width="1px" height="100%" background="gray.350" margin="0 6px" />
                              )
                            }
                          </Fragment>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Container Section */}
                  <Box p="1rem 1.5rem 0 1.5rem">
                    <Stack flexDirection="row" gridGap="10px" pb="15px">
                      <Avatar
                        // name={user?.first_name}
                        width="62px"
                        marginY="auto"
                        height="62px"
                        src={getImage()}
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
                      <Box as="button" cursor="pointer" width="auto" display="flex" gridGap="10px" onClick={logout}>
                        <Icon icon="logout" width="20px" height="20px" />
                        <Box
                          fontWeight="700"
                          color="blue.400"
                          as="span"
                          fontSize="14px"
                        >
                          {logoutTR}
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
                {loginTR}
              </Button>
            </NextChakraLink>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav NAV_ITEMS={ITEMS} haveSession={haveSession} readSyllabus={readSyllabus} />
      </Collapse>
    </Box>
  );
};

NavbarWithSubNavigation.propTypes = {
  haveSession: PropTypes.bool,
  translations: PropTypes.objectOf(PropTypes.string),
};
NavbarWithSubNavigation.defaultProps = {
  haveSession: false,
  translations: undefined,
};

export default memo(NavbarWithSubNavigation);
