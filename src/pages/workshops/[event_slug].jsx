import {
  Box, Button, Grid, Skeleton, useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { intervalToDuration, format } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Image from 'next/image';
import bc from '../../common/services/breathecode';
import GridContainer from '../../common/components/GridContainer';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import { capitalizeFirstLetter, getStorageItem, isValidDate } from '../../utils';
import useStyle from '../../common/hooks/useStyle';
import Icon from '../../common/components/Icon';
import PublicProfile from '../../common/components/PublicProfile';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';
import ShowOnSignUp from '../../common/components/ShowOnSignup';
import useAuth from '../../common/hooks/useAuth';
import Timer from '../../common/components/Timer';

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';

const Page = () => {
  const { t } = useTranslation('workshops');
  const [event, setEvent] = useState({
    loaded: false,
  });
  const [users, setUsers] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [applied, setApplied] = useState(false);
  const [readyToJoinEvent, setReadyToJoinEvent] = useState(false);
  const accessToken = getStorageItem('accessToken');

  const router = useRouter();
  const { locale } = router;
  const { isAuthenticated, user } = useAuth();
  const { event_slug: eventSlug } = router.query;
  const { featuredColor, hexColor } = useStyle();

  useEffect(() => {
    bc.public().events()
      .then((res) => {
        const findedEvent = res.data.find((l) => l?.slug === eventSlug);
        if (findedEvent?.id) {
          bc.events().getUsers(findedEvent?.id)
            .then((resp) => {
              const onlyExistentUsers = resp.data.filter((l) => l?.attendee?.first_name && l?.attendee?.last_name);

              setUsers(onlyExistentUsers);
            })
            .catch(() => {});
        } else {
          router.push('/404');
        }

        setEvent({
          ...findedEvent,
          loaded: true,
        });
      })
      .catch(() => {
        setEvent({
          loaded: true,
        });
      });
  }, []);

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
    console.log('Timer finished');
    setReadyToJoinEvent(true);
  };

  return (
    <>
      <Box
        background={useColorModeValue('featuredLight', 'featuredDark')}
        marginBottom="37px"
      >
        <GridContainer
          height="100%"
          gridTemplateColumns="2fr repeat(12, 1fr) 2fr"
          gridGap="36px"
          display={{ base: 'flex', md: 'grid' }}
          padding="37px 10px"
          minHeight="290px"
        >
          <Box display="flex" flexDirection="column" justifyContent="center" gridGap="15px" gridColumn="2 / span 8">
            <Box display="flex" mt={{ base: '0', md: '1rem' }} gridGap="6px" background="yellow.light" borderRadius="20px" alignItems="center" width="fit-content" padding="8px 12px">
              <Icon icon="usaFlag" width="15px" height="15px" />
              <Text size="13px" fontWeight={700} color="#000">
                Javascript Beginner Workshop
              </Text>
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
            <Box display="flex" flexDirection="column" gridGap="8px" id="event-info">
              {formatedDate[locale] && (
                <Box display="flex" gridGap="10px">
                  <Icon icon="calendar" width="20px" height="20px" color={hexColor.fontColor3} />
                  <Text withTooltip size="14px" label={capitalizeFirstLetter(countryOfDate)} fontWeight={700} width="fit-content">
                    {capitalizeFirstLetter(formatedDate[locale])}
                  </Text>
                </Box>
              )}
              {duration?.hours && (
                <Box display="flex" gridGap="10px">
                  <Icon icon="chronometer-full" width="20px" height="20px" color={hexColor.fontColor3} />
                  <Text size="sm">
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
          <Box
            borderRadius="3px"
            maxWidth="1012px"
            width={{ base: 'auto', lg: '100%' }}
          >
            {event?.description}
          </Box>
          {!eventNotExists && (typeof event?.host_user === 'object' && event?.host_user !== null) && (
            <Box display="flex" flexDirection="column" gridGap="12px" mb="31px">
              <Text size="26px" fontWeight={700}>
                {t('host-label-text')}
              </Text>
              <PublicProfile
                profile={event.host_user}
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
          width="100%"
          textAlign="center"
          height="fit-content"
          borderWidth="0px"
          gridGap="10px"
          overflow="hidden"
        >
          {event?.id && (
            <ShowOnSignUp
              headContent={alreadyApplied
                ? <Timer startingAt={event?.starting_at} onFinish={handleOnReadyToStart} background="transparent" color="white" />
                : <Image src="/static/images/person-smile1.png" width={342} title="Form image" height={177} objectFit="cover" style={{ borderTopLeftRadius: '17px', borderTopRightRadius: '17px', zIndex: 10 }} />}
              subContent={alreadyApplied && (
                <Box position="absolute" top="0px" left="0px" zIndex={1} width="100%" height={177}>
                  <Image src="/static/videos/bubbles_2.gif" width={342} height={177} style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} objectFit="cover" />
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
                disabled={!readyToJoinEvent && (alreadyApplied || (eventNotExists && !isAuthenticated))}
                _disabled={{
                  background: readyToJoinEvent ? '' : 'gray.dark',
                }}
                _hover={{
                  background: readyToJoinEvent ? '' : 'gray.dark',
                }}
                _active={{
                  background: readyToJoinEvent ? '' : 'gray.dark',
                }}
                onClick={() => {
                  if (readyToJoinEvent && alreadyApplied) {
                    router.push(`${BREATHECODE_HOST}/v1/events/me/event/${event?.id}/join?token=${accessToken}` || '#');
                  }
                  if (isAuthenticated && !alreadyApplied && !readyToJoinEvent) {
                    bc.events().applyEvent(event?.id)
                      .then(() => {
                        setApplied(true);
                      });
                  }
                }}
              >
                {alreadyApplied ? t('join') : t('reserv-button-text')}
              </Button>
            </ShowOnSignUp>
          )}

          {users?.length > 0 && (
            <Box display="flex" flexDirection="column" gridGap="18px" background={featuredColor} padding="20px 25px" borderRadius="17px">
              <Text>
                {t('users-registered-count', { count: users.length })}
              </Text>
              <Grid
                gridAutoRows="3.4rem"
                templateColumns="repeat(auto-fill, minmax(3.5rem, 1fr))"
                gap={0}
                maxH={showAll ? '270px' : 'auto'}
                height={showAll ? '100%' : 'auto'}
                overflowY="auto"
                maxHeight="163.20px"
              >
                {users?.map((c) => {
                  const fullName = `${c?.attendee?.first_name} ${c?.attendee?.last_name}`;
                  return c?.attendee?.id && (
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
