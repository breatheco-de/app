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
import { reportDatalayer } from '../../utils/requests';
import bc from '../../common/services/breathecode';
import GridContainer from '../../common/components/GridContainer';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import { adjustNumberBeetwenMinMax, capitalizeFirstLetter, getStorageItem, isValidDate } from '../../utils';
import useStyle from '../../common/hooks/useStyle';
import Icon from '../../common/components/Icon';
import PublicProfile from '../../common/components/PublicProfile';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';
import ModalInfo from '../../js_modules/moduleMap/modalInfo';
import ShowOnSignUp from '../../common/components/ShowOnSignup';
import useAuth from '../../common/hooks/useAuth';
import Timer from '../../common/components/Timer';
import ComponentOnTime from '../../common/components/ComponentOnTime';
import MarkDownParser from '../../common/components/MarkDownParser';
import MktEventCards from '../../common/components/MktEventCards';
import modifyEnv from '../../../modifyEnv';
import { validatePlanExistence } from '../../common/handlers/subscriptions';
import ModalToGetAccess, { stageType } from '../../common/components/ModalToGetAccess';

const arrayOfImages = [
  'https://github-production-user-asset-6210df.s3.amazonaws.com/426452/264811559-ff8d2a4e-0a34-41c9-af90-57b0a96414b3.gif',
  'https://github-production-user-asset-6210df.s3.amazonaws.com/426452/264811551-c4cadebe-9bea-4abe-9d11-4c19d5b66241.gif',
  'https://github-production-user-asset-6210df.s3.amazonaws.com/426452/264811556-1d9de108-2166-4803-8014-1e1d406066a2.gif',
  'https://github-production-user-asset-6210df.s3.amazonaws.com/426452/264811564-e7889add-dd02-4b91-bb0b-91b9e5f843af.gif',
];

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
        url: `/workshops/${slug}`,
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
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [randomImage, setRandomImage] = useState(arrayOfImages[0]);
  const accessToken = getStorageItem('accessToken');
  const [isModalToGetAccessOpen, setIsModalToGetAccessOpen] = useState(false);
  const [dataToGetAccessModal, setDataToGetAccessModal] = useState({});
  const [isFetchingDataForModal, setIsFetchingDataForModal] = useState(false);
  const [noConsumablesFound, setNoConsumablesFound] = useState(false);

  const router = useRouter();
  const { locale } = router;
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  // const { isInProcessOfSubscription, handleSubscribeToPlan, setIsInProcessOfSubscription } = useSubscribeToPlan();
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

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setRandomImage(arrayOfImages[currentIndex]);
      currentIndex = (currentIndex + 1) % 4;
    }, 5000);

    return () => {
      clearInterval(interval);
    };
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

  const unixFormatedDate = {
    starting_at: isValidDate(event?.starting_at) ? new Date(event?.starting_at).getTime() / 1000 : '',
    ending_at: isValidDate(event?.ending_at) ? new Date(event?.ending_at).getTime() / 1000 : '',
  };

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

  const buttonEnabled = !finishedEvent && (readyToJoinEvent || !alreadyApplied);

  const handleGetMoreEventConsumables = () => {
    setIsFetchingDataForModal(true);
    validatePlanExistence(subscriptions)
      .then((data) => {
        setDataToGetAccessModal({
          ...data,
          event,
          academyServiceSlug: '',
        });
        setIsModalToGetAccessOpen(true);
      })
      .finally(() => {
        setIsFetchingDataForModal(false);
      });
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
    if (noConsumablesFound && !finishedEvent && isAuth && !existsConsumables && !isFreeForConsumables) {
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
      if (!event?.online_event) {
        return ({
          title: '',
          childrenDescription: (
            <Box>
              <Box mb="10px" display="flex" gridGap="5px" justifyContent="center">
                <Icon icon="location" width="20px" height="20px" color={hexColor.blueDefault} />
                <Text color={hexColor.fontColor3} size="14px" fontWeight={700} width="fit-content">
                  {event?.venue?.street_address}
                </Text>
              </Box>
              <Text size="14px" fontWeight={700} lineHeight="18px">
                {t('suggest-join-in-person-event')}
              </Text>
            </Box>
          ),
        });
      }
      return ({
        title: t('greetings', { name: user?.first_name }),
        description: t('suggest-join-event'),
      });
    }
    if (isAuth) {
      if (!event?.online_event) {
        return ({
          title: readyToJoinEvent ? t('form.ready-to-join-title') : t('form.joined-title'),
          description: !readyToJoinEvent && t('form.joined-description-in-person'),
          childrenDescription: (
            <Box>
              <Box mb="10px" display="flex" gridGap="5px" justifyContent="center">
                <Icon icon="location" width="20px" height="20px" color={hexColor.blueDefault} />
                <Text color={hexColor.fontColor3} size="14px" fontWeight={700} width="fit-content">
                  {event?.venue?.street_address}
                </Text>
              </Box>
            </Box>
          ),
        });
      }
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

  const handleJoin = () => {
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

              reportDatalayer({
                dataLayer: {
                  event: 'event_order',
                  event_id: event.id,
                  event_slug: event.slug,
                  event_title: event.title,
                  event_type: event.event_type?.slug,
                  event_starting_at: unixFormatedDate.starting_at,
                  event_ending_at: unixFormatedDate.ending_at,
                  event_language: event.lang,
                },
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
        setIsModalConfirmOpen(false);
      }
    }
  };

  return (
    <Box as="div">
      <ModalToGetAccess
        isOpen={isModalToGetAccessOpen}
        stage={stageType.outOfConsumables}
        externalData={dataToGetAccessModal}
        onClose={() => {
          setIsModalToGetAccessOpen(false);
        }}
      />

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
            <path d="M42.3031 77.3264L88.5358 24.5161L110 0H88.5358H67.6969L0 77.3264L67.5109 151H88.5358H109.814L88.5358 127.78L42.3031 77.3264Z" fill={hexColor.blueDefault} />
          </svg>
        </Box>

        <Box display={{ base: 'none', md: 'block' }} filter={{ base: 'blur(6px)', md: 'blur(0px)' }} position="absolute" top="-65px" right="-20px" zIndex={1}>
          <svg width="503" height="255" viewBox="0 0 503 255" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="285.5" cy="99" rx="9.5" ry="9" fill="#FFA600" />
            <ellipse cx="324.5" cy="99" rx="9.5" ry="9" fill="#EB5757" />
            <ellipse cx="246.5" cy="99" rx="9.5" ry="9" fill="#0097CF" />
            <path d="M461.466 161.21L416.074 212.971L395 237L416.074 237L436.534 237L503 161.21L436.717 89L416.074 89L395.183 89L416.074 111.759L461.466 161.21Z" fill={hexColor.blueDefault} />
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
                  <>
                    <Heading
                      as="h1"
                      size={{ base: '26px', md: '50px' }}
                      fontWeight="700"
                      lineHeight={{ base: '31px', md: '52px' }}
                      textTransform="capitalize"
                      color={useColorModeValue('black', 'white')}
                    >
                      {event.title}
                    </Heading>
                    {!event?.online_event && (
                      <Text size="12px" color="white" fontWeight={700} background={hexColor.blueDefault} borderRadius="20px" alignItems="center" width="fit-content" padding="4px 10px">
                        {t('in-person')}
                      </Text>
                    )}
                  </>
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
              {!event?.online_event && (
                <Box display="flex" gridGap="10px">
                  <Icon icon="location" width="20px" height="20px" color={hexColor.blueDefault} />
                  <Text size="14px" fontWeight={700} width="fit-content">
                    {event?.venue?.street_address}
                  </Text>
                </Box>
              )}
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
          {event?.id && (
            <>
              <ModalInfo
                isOpen={isModalConfirmOpen}
                onClose={() => setIsModalConfirmOpen(false)}
                headerStyles={{ textAlign: 'center' }}
                title={t('in-person')}
                childrenDescription={(
                  <Box display="flex" flexDirection="column" alignItems="center" gridGap="17px">
                    <Text
                      size="14px"
                      textAlign="center"
                    >
                      {t('in-person-confirm', { address: event?.venue?.street_address })}
                    </Text>
                  </Box>
                )}
                closeText={t('deny-attendance')}
                closeButtonVariant="outline"
                closeButtonStyles={{ borderRadius: '3px', color: hexColor.blueDefault, borderColor: hexColor.blueDefault }}
                buttonHandlerStyles={{ variant: 'default' }}
                actionHandler={handleJoin}
                handlerText={t('confirm-attendance')}
              />
              <Box color="white" zIndex="10" borderRadius="11px 11px 0 0" background={hexColor.blueDefault} padding={(readyToJoinEvent) ? '24px' : '10px 20px'} bottom="0" position="sticky" marginBottom="20px" display={{ base: isAuth ? 'block' : 'none', md: 'none' }} textAlign="left">
                {!finishedEvent ? (
                  <>
                    {!readyToJoinEvent && (
                      <Box marginBottom="10px" display="flex" gap="5px" justifyContent="space-between" alignItems="center">
                        <Heading size="sm">
                          {t('starts-in')}
                        </Heading>
                        <Timer
                          autoRemove
                          variant="small"
                          startingAt={event?.starting_at}
                          onFinish={handleOnReadyToStart}
                          color="white"
                          background="blue.900"
                          height="40px"
                        />
                      </Box>
                    )}
                    {!event?.online_event && (
                      <Box display="flex" gridGap="10px" justifyContent="center" marginBottom="10px">
                        <Icon icon="location" width="20px" height="20px" color="white" />
                        <Text size="14px" fontWeight={700} width="fit-content">
                          {event?.venue?.street_address}
                        </Text>
                      </Box>
                    )}
                    {(finishedEvent || isFreeForConsumables || existsConsumables) ? (
                      <Box display="flex" gap="10px">
                        <Button
                          fontSize="17px"
                          color="blue.default"
                          background="white"
                          width="100%"
                          display={(alreadyApplied || readyToJoinEvent) && !event?.online_event ? 'none' : 'block'}
                          isDisabled={(finishedEvent || !readyToJoinEvent) && (alreadyApplied || eventNotExists)}
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
                            if (!event?.online_event && (isAuthenticated && !alreadyApplied && !readyToJoinEvent)) setIsModalConfirmOpen(true);
                            else handleJoin();
                          }}
                        >
                          {!finishedEvent && ((alreadyApplied || readyToJoinEvent) ? t('join') : t('reserv-button-text'))}
                          {finishedEvent && t('event-finished')}
                        </Button>
                        {readyToJoinEvent && (
                          <Box display="flex" gap="10px" alignItems="center" height="40px" fontWeight="700" color="gray.dark" textTransform="uppercase" background="red.light" borderRadius="4px" padding="10px">
                            {t('common:live')}
                            <Icon className="pulse-red" icon="dot" color={hexColor.danger} width="8px" height="8px" borderRadius="50px" />
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Text marginBottom="10px" size="14px" fontWeight={700} lineHeight="18px">
                          {t('no-consumables.description')}
                        </Text>
                        <Button
                          display="flex"
                          variant="default"
                          fontSize="14px"
                          fontWeight={700}
                          onClick={handleGetMoreEventConsumables}
                          isLoading={isFetchingDataForModal}
                          alignItems="center"
                          gridGap="10px"
                          width="100%"
                        >
                          {t('no-consumables.get-more-workshops')}
                          <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <>
                    <Box marginBottom="10px" padding="5px" textAlign="center">
                      <Heading size="sm">
                        {formInfo?.title}
                      </Heading>
                      <Text>
                        {formInfo?.description}
                      </Text>
                    </Box>
                  </>
                )}

              </Box>
            </>
          )}
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
            <>
              <Box display={{ base: isAuth ? 'none' : 'block', md: 'block' }}>
                <ShowOnSignUp
                  hideForm={finishedEvent}
                  existsConsumables={existsConsumables}
                  hideSwitchUser={!isFreeForConsumables && (noConsumablesFound && !existsConsumables)}
                  isLive={readyToJoinEvent && !finishedEvent}
                  setNoConsumablesFound={setNoConsumablesFound}
                  subscribeValues={{ event_slug: event.slug }}
                  refetchAfterSuccess={() => {
                    getMySubscriptions();
                    getCurrentConsumables();
                  }}
                  headContent={readyToJoinEvent ? (
                    <Box position="relative" zIndex={1} width="100%" height={177}>
                      <Image src={randomImage} width="100%" height={177} style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} objectFit="cover" alt="head banner" />
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
                  gridGap={(existsConsumables || !noConsumablesFound) ? '10px' : '16px'}
                >
                  {(finishedEvent || isFreeForConsumables || existsConsumables) ? (
                    <Button
                      mt="10px"
                      type="submit"
                      variant="default"
                      display={(alreadyApplied || readyToJoinEvent) && !event?.online_event ? 'none' : 'block'}
                      className={readyToJoinEvent && !finishedEvent ? 'pulse-blue' : ''}
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
                        if (!event?.online_event && (isAuthenticated && !alreadyApplied && !readyToJoinEvent)) setIsModalConfirmOpen(true);
                        else handleJoin();
                      }}
                    >
                      {!finishedEvent && ((alreadyApplied || readyToJoinEvent) ? t('join') : t('reserv-button-text'))}
                      {finishedEvent && t('event-finished')}
                    </Button>
                  ) : (
                    <>
                      {noConsumablesFound ? (
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
                            isLoading={isFetchingDataForModal}
                            alignItems="center"
                            gridGap="10px"
                            width="100%"
                          >
                            {t('no-consumables.get-more-workshops')}
                            <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
                          </Button>
                        </Box>
                      ) : (
                        <Skeleton marginTop="10px" width="100%" height="40px" borderRadius="4px" />
                      )}
                    </>
                  )}
                </ShowOnSignUp>
              </Box>
            </>
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
