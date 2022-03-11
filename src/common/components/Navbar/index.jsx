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
import usePersistent from '../../hooks/usePersistent';
import Heading from '../Heading';
import Text from '../Text';

import useAuth from '../../hooks/useAuth';
import navbarTR from '../../translations/navbar';

const NavbarWithSubNavigation = ({ haveSession }) => {
  const router = useRouter();
  const [readSyllabus, setReadSyllabus] = useState([]);

  const {
    loginTR, logoutTR, languageTR, ITEMS,
  } = navbarTR[router.locale];

  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const commonColors = useColorModeValue('white', 'gray.800');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const commonBorderColor = useColorModeValue('gray.200', 'gray.900');
  const { user, logout } = useAuth();
  const [cohortSession] = usePersistent('cohortSession', {});

  const langs = ['en', 'es'];
  const linkColor = useColorModeValue('gray.600', 'gray.200');

  const [settingsOpen, setSettingsOpen] = useState(false);

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
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
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
            aria-label="Toggle Navigation"
          />
          <NextChakraLink href="/" locale={router.locale} alignSelf="center" display="flex">
            <Icon icon="logoModern" width="90px" height="20px" />
          </NextChakraLink>
        </Flex>

        <Flex flex={{ base: 1 }} display={{ base: 'none', md: 'flex' }} justify={{ base: 'center', md: 'start' }}>
          <NextChakraLink href="/" locale={router.locale} alignSelf="center" display="flex">
            <Icon icon="logoModern" width="90px" height="20px" />
          </NextChakraLink>

          <Flex display="flex" ml={10}>
            <DesktopNav NAV_ITEMS={ITEMS} haveSession={haveSession} readSyllabus={readSyllabus} />
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
                  onClick={() => toggleSettings()}
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
                boxShadow="dark-lg"
                bg={popoverContentBgColor}
                rounded="md"
                width={{ base: '100%', md: 'auto' }}
                minW={{ base: 'auto', md: 'md' }}
              >
                <PopoverArrow />

                {/* Language Section */}
                <Box
                  width="100%"
                  borderBottom={2}
                  borderStyle="solid"
                  borderColor={commonBorderColor}
                  display="flex"
                  justifyContent="space-between"
                  padding="12px"
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
                            color={router.locale === lang ? 'blue.default' : linkColor}
                            fontWeight={router.locale === lang ? '700' : '400'}
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
                            i < langs.length && (
                              <Box width="1px" height="100%" background="gray.350" margin="0 6px" />
                            )
                          }
                        </Fragment>
                      );
                    })}
                  </Box>
                </Box>

                {/* Container Section */}
                <Box p="1rem 1.5rem 1rem 1.5rem">
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
                          {dateJoined[router.locale]}
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
                    <Box cursor="pointer" width="auto" display="flex" gridGap="10px" onClick={logout}>
                      <Icon icon="logout" width="20px" height="20px" />
                      <Box
                        _hover={{
                          fontWeight: '700',
                        }}
                        color="blue.default"
                        as="span"
                        fontSize="15px"
                      >
                        {logoutTR}
                      </Box>
                    </Box>
                  </Flex>
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
};
NavbarWithSubNavigation.defaultProps = {
  haveSession: false,
};

export default memo(NavbarWithSubNavigation);
