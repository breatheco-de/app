import {
  Box, Button, Grid, Skeleton, useColorModeValue, useToast, Image,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { intervalToDuration, format } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Head from 'next/head';
import bc from '../../common/services/breathecode';
import GridContainer from '../../common/components/GridContainer';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import { adjustNumberBeetwenMinMax, capitalizeFirstLetter, getStorageItem, isValidDate, setStorageItem } from '../../utils';
import useStyle from '../../common/hooks/useStyle';
import Icon from '../../common/components/Icon';
import PublicProfile from '../../common/components/PublicProfile';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';
import ShowOnSignUp from '../../common/components/ShowOnSignup';
import useAuth from '../../common/hooks/useAuth';
import Timer from '../../common/components/Timer';
import ComponentOnTime from '../../common/components/ComponentOnTime';
import MarkDownParser from '../../common/components/MarkDownParser';

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';

const Page = () => {
  const { t } = useTranslation('workshops');
  const [event, setEvent] = useState({
    loaded: false,
  });
  const [users, setUsers] = useState([]);
  const [allUsersJoined, setAllUsersJoined] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [applied, setApplied] = useState(false);
  const [readyToJoinEvent, setReadyToJoinEvent] = useState(false);
  const accessToken = getStorageItem('accessToken');

  const router = useRouter();
  const { locale } = router;
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  const { event_slug: eventSlug } = router.query;
  const { featuredColor, hexColor } = useStyle();

  useEffect(() => {
    bc.public().singleEvent(eventSlug)
      .then((res) => {
        if (res === undefined) {
          router.push('/404');
        }
        const data = res?.data;

        bc.events().getUsers(data?.id)
          .then((resp) => {
            const formatedUsers = resp.data.map((l, i) => {
              const index = i + 1;
              const avatarNumber = adjustNumberBeetwenMinMax({
                number: index,
                min: 1,
                max: 20,
              });
              if (l?.attendee === null) {
                return {
                  ...l,
                  attendee: {
                    id: (i * 99) + 1,
                    first_name: 'Anonymous',
                    last_name: '',
                    profile: {
                      avatar_url: `https://breathecode.herokuapp.com/static/img/avatar-${avatarNumber}.png`,
                    },
                  },
                };
              }
              return l;
            });
            setAllUsersJoined(resp.data);
            setUsers(formatedUsers);
          })
          .catch(() => {});

        setEvent({
          ...data,
          loaded: true,
        });
      })
      .catch(() => {
        router.push('/404');
        setEvent({
          loaded: true,
        });
      });
  }, []);

  const limitedUsers = showAll ? users : users.slice(0, 15);

  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

  const splitTextDate = `${new Date(event?.starting_at)}`.split('(');
  const countryOfDate = splitTextDate[1]?.slice(0, -1);

  const duration = isValidDate(event?.ending_at) && isValidDate(event?.starting_at)
    ? intervalToDuration({
      end: new Date(event?.ending_at),
      start: new Date(event?.starting_at),
    })
    : {};

  const formatedDate = isValidDate(event?.starting_at) ? {
    es: format(new Date(event?.starting_at), "EEEE, dd 'de' MMMM - p (OOO)", { timeZone, locale: es }),
    en: format(new Date(event?.starting_at), 'EEEE, MMMM do - p (OOO)', { timeZone }),
  } : {};

  const eventNotExists = event?.loaded && !event?.slug;
  const isAuth = isAuthenticated && user?.id;

  const alreadyApplied = users.some((l) => l?.attendee?.id === user?.id) || applied;

  const dynamicFormInfo = () => {
    if (isAuth && !alreadyApplied) {
      return ({
        title: t('greetings', { name: user?.first_name }),
        description: t('suggest-join-event'),
      });
    }
    return ({
      title: readyToJoinEvent ? t('form.ready-to-join-title') : t('form.title'),
      description: readyToJoinEvent ? t('form.ready-to-join-description') : t('form.description'),
    });
  };
  const formInfo = dynamicFormInfo();

  const handleOnReadyToStart = () => {
    setReadyToJoinEvent(true);
  };

  const spotsRemain = event?.capacity - allUsersJoined.length;

  const arrayOfImages = [
    '/static/images/person1.png',
  ];

  return (
    <>
      {event.loaded && (
        <Head>
          {event?.title && (
            <title>{`${event?.title} | 4Geeks`}</title>
          )}
          {event?.excerpt && (
            <meta name="description" content={event?.excerpt} />
          )}
        </Head>
      )}
      <Box
        background={useColorModeValue('featuredLight', 'featuredDark')}
        marginBottom="37px"
        position="relative"
        overflowX="hidden"
      >
        <Box display={{ base: 'none', md: 'block' }} filter={{ base: 'blur(6px)', md: 'blur(0px)' }} position="absolute" top="104px" left="-40px" zIndex={1}>
          <svg width="110" height="151" viewBox="0 0 110 151" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.3031 77.3264L88.5358 24.5161L110 0H88.5358H67.6969L0 77.3264L67.5109 151H88.5358H109.814L88.5358 127.78L42.3031 77.3264Z" fill="#0097CF" />
          </svg>
        </Box>

        <Box display={{ base: 'none', md: 'block' }} filter={{ base: 'blur(6px)', md: 'blur(0px)' }} position="absolute" top="-65px" right="-20px" zIndex={1}>
          <svg width="503" height="255" viewBox="0 0 503 255" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="285.5" cy="99" rx="9.5" ry="9" fill="#FFA600" />
            <ellipse cx="324.5" cy="99" rx="9.5" ry="9" fill="#EB5757" />
            <ellipse cx="246.5" cy="99" rx="9.5" ry="9" fill="#0097CF" />
            <path d="M461.466 161.21L416.074 212.971L395 237L416.074 237L436.534 237L503 161.21L436.717 89L416.074 89L395.183 89L416.074 111.759L461.466 161.21Z" fill="#0097CF" />
            <path d="M71.5644 129.587L70.6552 130.607L71.5873 131.607L151.023 216.809L185.231 253.5L152.121 253.5L116.648 253.5L2.02928 130.561L116.988 1.50002L152.121 1.50003L185.655 1.50003L151 40.4036L152.121 41.4013L151 40.4037L71.5644 129.587Z" stroke="#25BF6C" strokeWidth="3" />
          </svg>
        </Box>
        <GridContainer
          height="100%"
          gridTemplateColumns="2fr repeat(12, 1fr) 2fr"
          gridGap="36px"
          display={{ base: 'flex', md: 'grid' }}
          padding="37px 10px"
          minHeight="290px"
          zIndex={1}
          position="relative"
        >
          <Box display="flex" flexDirection="column" justifyContent="center" gridGap="15px" gridColumn="2 / span 8">
            <Box display="flex" mt={{ base: '0', md: '1rem' }} alignItems="center" gridGap="24px">
              {event?.event_type?.name && (
                <Text size="12px" color="black" fontWeight={700} background="yellow.light" borderRadius="20px" alignItems="center" width="fit-content" padding="4px 10px">
                  {event.event_type.name}
                </Text>
              )}
              {event?.id && (
                <ComponentOnTime
                  startingAt={event?.starting_at}
                  finishedView={(
                    <Box display="flex" alignItems="center" fontWeight={700} color="danger" fontSize="12px" background="red.light" borderRadius="18px" padding="4px 10px" gridGap="10px">
                      <Icon withContainer className="pulse-red" icon="dot" color="currentColor" width="8px" height="8px" borderRadius="50px" />
                      {t('common:live-now')}
                    </Box>
                  )}
                />
              )}
            </Box>
            {event.loaded ? (
              <>
                {event?.title && !eventNotExists ? (
                  <Heading
                    as="h1"
                    size="50px"
                    fontWeight="700"
                    lineHeight="52px"
                    textTransform="capitalize"
                    color={useColorModeValue('black', 'white')}
                  >
                    {event.title}
                  </Heading>
                ) : (
                  <Heading
                    as="h1"
                    size="35px"
                    fontWeight="700"
                    lineHeight="52px"
                    textTransform="capitalize"
                    color={useColorModeValue('black', 'white')}
                  >
                    {t('no-event-found')}
                  </Heading>
                )}
              </>
            ) : (
              <Skeleton height="45px" width="100%" m="22px 0 35px 0" borderRadius="10px" />
            )}
            <Box display="flex" flexDirection="column" gridGap="9px" id="event-info">
              {formatedDate[locale] && (
                <Box display="flex" gridGap="10px">
                  <Icon icon="calendar" width="20px" height="20px" color={hexColor.blueDefault} />
                  <Text withTooltip size="14px" label={capitalizeFirstLetter(countryOfDate)} fontWeight={700} width="fit-content">
                    {capitalizeFirstLetter(formatedDate[locale])}
                  </Text>
                </Box>
              )}
              {duration?.hours > 0 && (
                <Box display="flex" gridGap="10px">
                  <Icon icon="chronometer-full" width="20px" height="20px" color={hexColor.blueDefault} />
                  <Text size="sm" lineHeight="20px">
                    {t('duration-hours', { hours: duration.hours })}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

        </GridContainer>
      </Box>
      <GridContainer
        height="100%"
        gridTemplateColumns={{ base: 'repeat(12, 1fr)', lg: '2fr repeat(12, 1fr) 2fr' }}
        gridGap="36px"
        padding="0 10px"
      >
        <Box display={{ base: 'block', lg: 'flex' }} gridGap="30px" flexDirection="column" gridColumn={{ base: '2 / span 6', lg: '2 / span 8' }}>

          <Box display="flex" flexDirection="column" gridGap="10px">
            <MarkDownParser content={event?.description} />
          </Box>

          {!eventNotExists && (typeof event?.host_user === 'object' && event?.host_user !== null) && (
            <Box display="flex" flexDirection="column" gridGap="12px" mb="31px">
              <Text size="26px" fontWeight={700}>
                {t('host-label-text')}
              </Text>
              <PublicProfile
                data={event.host_user}
              />
            </Box>
          )}
          {/* <Text size="26px" fontWeight={700}>
            We will be coding the following project
          </Text> */}
        </Box>

        <Box
          display="flex"
          gridColumn={{ base: '8 / span 4', lg: '10 / span 4' }}
          margin={{ base: '20px 0 0 auto', lg: '-13.44rem 0 0 auto' }}
          flexDirection="column"
          transition="background 0.2s ease-in-out"
          // width={{ base: '320px', md: 'auto' }}
          width="auto"
          textAlign="center"
          height="fit-content"
          borderWidth="0px"
          gridGap="10px"
          overflow="hidden"
        >
          {event?.id && (
            <ShowOnSignUp
              headContent={readyToJoinEvent ? (
                <Box position="relative" zIndex={1} width="100%" height={177}>
                  <Image src={arrayOfImages[0]} width="100%" height={177} style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} objectFit="cover" />
                </Box>
              ) : (
                <Timer
                  autoRemove
                  startingAt={event?.starting_at}
                  onFinish={handleOnReadyToStart}
                  background="transparent"
                  color="white"
                  height="177px"
                />
              )}
              subContent={!readyToJoinEvent && (
                <Box position="absolute" top="0px" left="0px" zIndex={1} width="100%" height={177}>
                  <Image src="/static/videos/bubbles_2.gif" width="100%" height={177} style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} objectFit="cover" />
                </Box>
              )}
              title={formInfo?.title}
              description={formInfo?.description}
              readOnly={event?.loaded && !event?.slug}
              position="relative"
            >
              <Button
                mt="10px"
                type="submit"
                variant="default"
                textTransform={readyToJoinEvent ? 'uppercase' : 'inherit'}
                disabled={!readyToJoinEvent && (alreadyApplied || (eventNotExists && !isAuthenticated))}
                _disabled={{
                  background: (readyToJoinEvent || !alreadyApplied) ? '' : 'gray.350',
                  cursor: (readyToJoinEvent || !alreadyApplied) ? 'pointer' : 'not-allowed',
                }}
                _hover={{
                  background: (readyToJoinEvent || !alreadyApplied) ? '' : 'gray.350',
                  cursor: (readyToJoinEvent || !alreadyApplied) ? 'pointer' : 'not-allowed',
                }}
                _active={{
                  background: (readyToJoinEvent || !alreadyApplied) ? '' : 'gray.350',
                  cursor: (readyToJoinEvent || !alreadyApplied) ? 'pointer' : 'not-allowed',
                }}
                onClick={() => {
                  if (readyToJoinEvent && alreadyApplied) {
                    router.push(`${BREATHECODE_HOST}/v1/events/me/event/${event?.id}/join?token=${accessToken}` || '#');
                    // router.push(`${BREATHECODE_HOST}/v1/events/me/event/${event?.id}/join?token=${accessToken}` || '#');
                  }
                  if (isAuthenticated && !alreadyApplied) {
                    bc.events().applyEvent(event?.id)
                      .then((resp) => {
                        if (resp !== undefined) {
                          setApplied(true);
                          toast({
                            position: 'top',
                            status: 'success',
                            title: t('alert-message:success-event-reservation'),
                            isClosable: true,
                            duration: 6000,
                          });
                        } else {
                          toast({
                            position: 'top',
                            status: 'info',
                            title: t('alert-message:event-access-error'),
                            isClosable: true,
                            duration: 6000,
                          });
                          setStorageItem('redirect-after-register', router?.asPath);
                          router.push({
                            pathname: '/checkout',
                            query: {
                              plan: '4geeks-standard',
                            },
                          });
                        }
                      });
                  }
                }}
              >
                {alreadyApplied ? t('join') : t('reserv-button-text')}
              </Button>
            </ShowOnSignUp>
          )}

          {users?.length > 0 && (
            <Box maxHeight="294px" display="flex" flexDirection="column" gridGap="18px" background={featuredColor} padding="20px 25px" borderRadius="17px">
              <Text>
                {t('users-registered-count', { count: allUsersJoined.length, spot_count: spotsRemain })}
              </Text>
              <Grid
                gridAutoRows="3.4rem"
                templateColumns="repeat(auto-fill, minmax(3.5rem, 1fr))"
                gap={0}
                maxH={showAll ? '270px' : 'auto'}
                height={showAll ? '100%' : 'auto'}
                overflowY="auto"
              >
                {limitedUsers?.map((c) => {
                  const fullName = `${c?.attendee?.first_name} ${c?.attendee?.last_name}`;
                  return (
                    <AvatarUser
                      key={`${c?.attendee?.id} - ${c?.attendee?.first_name}`}
                      fullName={fullName}
                      avatarUrl={c?.attendee?.profile?.avatar_url}
                      data={c?.attendee}
                      badge
                      withoutPopover
                    />
                  );
                })}
              </Grid>
              {users.length > 15 && !showAll && (
                <Button variant="link" height="auto" onClick={() => setShowAll(true)}>
                  {t('common:load-more')}
                </Button>
              )}
            </Box>
          )}
        </Box>
      </GridContainer>
    </>
  );
};

export default Page;
