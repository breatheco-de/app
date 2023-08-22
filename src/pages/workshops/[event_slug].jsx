import {
  Box, Button, Grid, useColorModeValue, useToast, Image, Avatar, Skeleton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { intervalToDuration, format } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
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
import MktEventCards from '../../common/components/MktEventCards';
import modifyEnv from '../../../modifyEnv';
import useSubscribeToPlan from '../../common/hooks/useSubscribeToPlan';

const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

export const getStaticPaths = async ({ locales }) => {
  const { data } = await bc.public().events();

  const paths = data.filter((ev) => ev?.slug)
    .flatMap((res) => locales.map((locale) => ({
      params: {
        event_slug: res?.slug,
      },
      locale,
    })));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  const { event_slug: slug } = params;
  const resp = await bc.public().singleEvent(slug).catch(() => ({
    statusText: 'not-found',
  }));
  const data = resp?.data;

  if (resp.statusText === 'not-found' || !data?.slug) {
    return {
      notFound: true,
    };
  }
  const lang = (data?.lang === 'us' || data?.lang === null) ? 'en' : data?.lang;

  const translationArray = [
    {
      value: 'en',
      lang: 'en',
      slug: data?.slug,
      link: `/workshops/${data?.slug}`,
    },
    {
      value: 'es',
      lang: 'es',
      slug: data?.slug,
      link: `/es/workshops/${data?.slug}`,
    },
  ].filter((item) => lang?.length > 0 && lang.includes(item?.lang));

  const objForTranslations = {
    [lang]: data?.slug,
  };

  return ({
    props: {
      seo: {
        title: data?.title || '',
        description: data?.excerpt || '',
        image: data?.banner || '',
        pathConnector: '/workshops',
        url: `${lang === 'en' ? '' : `/${lang}`}/workshops/${slug}`,
        slug,
        type: 'event',
        card: 'large',
        translations: objForTranslations,
        eventStartAt: data?.starting_at || '',
        locale,
        publishedTime: data?.published_at || '',
        modifiedTime: data?.updated_at || '',
      },
      translations: translationArray,
      disableLangSwitcher: true,
      event: data,
    },
  });
};

function Page({ event }) {
  const { t } = useTranslation('workshops');
  const [users, setUsers] = useState([]);
  const [allUsersJoined, setAllUsersJoined] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [applied, setApplied] = useState(false);
  const [readyToJoinEvent, setReadyToJoinEvent] = useState(false);
  const [finishedEvent, setFinishedEvent] = useState(false);
  const [consumables, setConsumables] = useState([]);
  const [myCohorts, setMyCohorts] = useState([]);
  const accessToken = getStorageItem('accessToken');

  const router = useRouter();
  const { locale } = router;
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  const { isInProcessOfSubscription, handleSubscribeToPlan, setIsInProcessOfSubscription } = useSubscribeToPlan();
  const { featuredColor, hexColor } = useStyle();

  useEffect(() => {
    if (event?.id) {
      const eventLang = (event?.lang === 'us' || event?.lang === null) ? 'en' : event?.lang;
      if (eventLang !== locale) {
        window.location.href = `/${eventLang}/workshops/${event?.slug}`;
      }
      bc.events().getUsers(event?.id)
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
                  id: 475335 + i,
                  first_name: 'Anonymous',
                  last_name: '',
                  profile: {
                    avatar_url: `${BREATHECODE_HOST}/static/img/avatar-${avatarNumber}.png`,
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
    }
  }, [event]);

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

  const eventNotExists = !event?.slug;
  const isAuth = isAuthenticated && user?.id;

  const alreadyApplied = users.some((l) => l?.attendee?.id === user?.id) || applied;

  const handleOnReadyToStart = () => {
    setReadyToJoinEvent(true);
  };
  const handleOnFinished = () => {
    setFinishedEvent(true);
  };

  const getMySubscriptions = () => {
    bc.payment({
      status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
    }).subscriptions()
      .then(({ data }) => {
        const planFinancing = data.plan_financings.length > 0 ? data.plan_financings : [];
        const planSubscriptions = data.subscriptions.length > 0 ? data.subscriptions : [];

        const allPlans = [...planFinancing, ...planSubscriptions];

        setSubscriptions(allPlans);
      });
  };
  const getCurrentConsumables = () => {
    bc.payment().service().consumable()
      .then((res) => {
        setConsumables(res.data);
      });
  };

  const getMyCurrentCohorts = () => {
    bc.admissions().me()
      .then((res) => {
        setMyCohorts(res.data.cohorts);
      });
  };

  useEffect(() => {
    if (isAuth) {
      getMySubscriptions();
      getCurrentConsumables();
      getMyCurrentCohorts();
    }
  }, [isAuth]);

  const capacity = event?.capacity || 0;
  const allUsersJoinedLength = allUsersJoined?.length || 0;
  const spotsRemain = (capacity - allUsersJoinedLength);

  const arrayOfImages = [
    '/static/images/person1.webp',
  ];
  const buttonEnabled = !finishedEvent && (readyToJoinEvent || !alreadyApplied);

  const handleGetMoreEventConsumables = () => {
    const findedPlanCoincidences = subscriptions.filter(
      (s) => s.selected_event_type_set?.event_types.some(
        (ev) => ev?.slug === event?.event_type?.slug,
      ),
    );
    const relevantProps = findedPlanCoincidences.map(
      (subscription) => ({
        event_type_set_slug: subscription?.selected_event_type_set.slug,
        plan_slug: subscription?.plans?.[0]?.slug,
      }),
    );
    const propsToQueryString = {
      event_type_set: relevantProps.map((p) => p.event_type_set_slug).join(','),
      plans: relevantProps.map((p) => p.plan_slug).join(','),
    };

    if (findedPlanCoincidences?.length > 0) {
      setStorageItem('redirected-from', router?.asPath);
      router.push({
        pathname: '/checkout',
        query: propsToQueryString,
      });
    } else {
      handleSubscribeToPlan({ slug: '4geeks-standard' })
        .finally(() => {
          getMySubscriptions();
          getCurrentConsumables();
          setIsInProcessOfSubscription(false);
        });
    }
  };

  const currentConsumable = consumables?.event_type_sets?.find(
    (c) => subscriptions.some(
      (s) => c?.slug.toLowerCase() === s?.selected_event_type_set?.slug.toLowerCase(),
    ),
  );
  const existsConsumables = typeof currentConsumable?.balance?.unit === 'number' && (currentConsumable?.balance?.unit > 0 || currentConsumable?.balance?.unit === -1);

  const existsAvailableAsSaas = myCohorts.some((c) => c?.cohort?.available_as_saas === false);
  const isFreeForConsumables = finishedEvent || (event?.free_for_bootcamps === true && existsAvailableAsSaas);

  const dynamicFormInfo = () => {
    if (finishedEvent) {
      return ({
        title: t('form.finished-title'),
        description: t('form.finished-description'),
      });
    }
    if (!finishedEvent && isAuth && !existsConsumables && !isFreeForConsumables) {
      return ({
        title: '',
        childrenDescription: (
          <Text size="14px" fontWeight={700} lineHeight="18px">
            {t('no-consumables.description')}
          </Text>
        ),
      });
    }
    if (isAuth && (!alreadyApplied && !readyToJoinEvent)) {
      return ({
        title: t('greetings', { name: user?.first_name }),
        description: t('suggest-join-event'),
      });
    }
    if (isAuth) {
      return ({
        title: readyToJoinEvent ? t('form.ready-to-join-title') : t('form.joined-title'),
        description: readyToJoinEvent ? t('form.ready-to-join-description-logged') : t('form.joined-description'),
      });
    }
    if (!isAuth && readyToJoinEvent) {
      return ({
        title: t('form.ready-to-join-title'),
        description: t('form.ready-to-join-description'),
      });
    }
    return ({
      title: t('form.title'),
      description: t('form.description'),
    });
  };
  const formInfo = dynamicFormInfo();

  const hostUserExists = event?.host_user
    && typeof event?.host_user === 'object'
    && event?.host_user !== null
    && event?.host_user?.profile?.bio;

  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event?.title,
    description: event?.excerpt,
    startDate: event?.start_date,
    endDate: event?.end_date,
    image: event?.banner,
    location: {
      '@type': 'Place',
      name: event?.venue?.title,
      address: event?.venue?.street_address,
      // url: `https://www.4geeks.com/workshops/${event.slug}`,
    },
    organizer: {
      '@type': 'Organization',
      name: event?.academy?.name,
      // url: 'https://www.4geeks.com',
    },
    eventStatus: 'https://schema.org/EventScheduled',
  };

  return (
    <Box as="div">
      <Head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventStructuredData) }}
        />
      </Head>
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
                  endingAt={event?.ending_at}
                  onEndedEvent={handleOnFinished}
                  finishedView={(
                    <Box display="flex" alignItems="center" fontWeight={700} color="danger" fontSize="12px" background="red.light" borderRadius="18px" padding="4px 10px" gridGap="10px">
                      <Icon className="pulse-red" icon="dot" color="currentColor" width="8px" height="8px" borderRadius="50px" />
                      {t('common:live-now')}
                    </Box>
                  )}
                />
              )}
            </Box>
            {event?.slug ? (
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

          {!eventNotExists && hostUserExists && (
            <Box display="flex" flexDirection="column" gridGap="12px" mb="31px">
              <Text size="26px" fontWeight={700}>
                {t('host-label-text')}
              </Text>
              <PublicProfile
                data={event?.host_user}
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
          margin={{ base: '20px 0 0 auto', lg: '-13.42rem 0 0 auto' }}
          flexDirection="column"
          transition="background 0.2s ease-in-out"
          // width={{ base: '320px', md: 'auto' }}
          width="auto"
          textAlign="center"
          height="fit-content"
          borderWidth="0px"
          gridGap="10px"
          overflow={{ base: 'inherit', md: 'hidden' }}
        >
          {event?.id && (
            <ShowOnSignUp
              hideForm={finishedEvent}
              hideSwitchUser={!isFreeForConsumables && !existsConsumables}
              refetchAfterSuccess={() => {
                getMySubscriptions();
                getCurrentConsumables();
              }}
              headContent={readyToJoinEvent ? (
                <Box position="relative" zIndex={1} width="100%" height={177}>
                  <Image src={arrayOfImages[0]} width="100%" height={177} style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} objectFit="cover" alt="head banner" />
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
              childrenDescription={formInfo?.childrenDescription}
              readOnly={!event?.slug}
              position="relative"
              gridGap={existsConsumables ? '10px' : '16px'}
            >
              {(finishedEvent || isFreeForConsumables || existsConsumables) ? (
                <Button
                  mt="10px"
                  type="submit"
                  variant="default"
                  background={buttonEnabled ? 'blue.default' : 'gray.350'}
                  textTransform={readyToJoinEvent ? 'uppercase' : 'inherit'}
                  isDisabled={(finishedEvent || !readyToJoinEvent) && (alreadyApplied || (eventNotExists && !isAuthenticated))}
                  _disabled={{
                    background: buttonEnabled ? '' : 'gray.350',
                    cursor: buttonEnabled ? 'pointer' : 'not-allowed',
                  }}
                  _hover={{
                    background: buttonEnabled ? '' : 'gray.350',
                    cursor: buttonEnabled ? 'pointer' : 'not-allowed',
                  }}
                  _active={{
                    background: buttonEnabled ? '' : 'gray.350',
                    cursor: buttonEnabled ? 'pointer' : 'not-allowed',
                  }}
                  onClick={() => {
                    if (!finishedEvent) {
                      if ((readyToJoinEvent && alreadyApplied) || readyToJoinEvent) {
                        router.push(`${BREATHECODE_HOST}/v1/events/me/event/${event?.id}/join?token=${accessToken}` || '#');
                      }
                      if (isAuthenticated && !alreadyApplied && !readyToJoinEvent) {
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
                            }
                          });
                      }
                    }
                  }}
                >
                  {!finishedEvent && ((alreadyApplied || readyToJoinEvent) ? t('join') : t('reserv-button-text'))}
                  {finishedEvent && t('event-finished')}
                </Button>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar
                    width="85px"
                    height="85px"
                    margin="0 0 16px 0"
                    style={{ userSelect: 'none' }}
                    src={`${BREATHECODE_HOST}/static/img/avatar-7.png`}
                    alt="No consumables avatar"
                  />
                  <Button
                    display="flex"
                    variant="default"
                    fontSize="14px"
                    fontWeight={700}
                    onClick={handleGetMoreEventConsumables}
                    isLoading={isInProcessOfSubscription}
                    alignItems="center"
                    gridGap="10px"
                    width="100%"
                  >
                    {t('no-consumables.get-more-workshops')}
                    <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
                  </Button>
                </Box>
              )}
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
                  return c?.attendee?.profile?.avatar_url && (
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
      {finishedEvent && (<MktEventCards gridTemplateColumns="2fr repeat(12, 1fr) 2fr" gridColumn="2 / span 12" margin="2rem auto 0 auto" maxWidth="1440px" padding="0 10px" />)}
    </Box>
  );
}

Page.propTypes = {
  event: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
Page.defaultProps = {
  event: {},
};

export default Page;
