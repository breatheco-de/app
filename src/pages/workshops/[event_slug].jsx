import {
  Box, Button, Grid, useColorModeValue, useToast, Image, Avatar, Skeleton, Flex,
} from '@chakra-ui/react';
import { useEffect, useState, useContext } from 'react';
import { intervalToDuration, format } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { reportDatalayer } from '../../utils/requests';
import bc from '../../common/services/breathecode';
import SimpleModal from '../../common/components/SimpleModal';
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
import Link from '../../common/components/NextChakraLink';
import { categoriesFor, BREATHECODE_HOST } from '../../utils/variables';
import ComponentOnTime from '../../common/components/ComponentOnTime';
import MarkDownParser from '../../common/components/MarkDownParser';
import MktEventCards from '../../common/components/MktEventCards';
import { validatePlanExistence } from '../../common/handlers/subscriptions';
import ModalToGetAccess, { stageType } from '../../common/components/ModalToGetAccess';
import SmallCardsCarousel from '../../common/components/SmallCardsCarousel';
import LoaderScreen from '../../common/components/LoaderScreen';
import DynamicContentCard from '../../common/components/DynamicContentCard';
import { SessionContext } from '../../common/context/SessionContext';

const arrayOfImages = [
  'https://github-production-user-asset-6210df.s3.amazonaws.com/426452/264811559-ff8d2a4e-0a34-41c9-af90-57b0a96414b3.gif',
  'https://github-production-user-asset-6210df.s3.amazonaws.com/426452/264811551-c4cadebe-9bea-4abe-9d11-4c19d5b66241.gif',
  'https://github-production-user-asset-6210df.s3.amazonaws.com/426452/264811556-1d9de108-2166-4803-8014-1e1d406066a2.gif',
  'https://github-production-user-asset-6210df.s3.amazonaws.com/426452/264811564-e7889add-dd02-4b91-bb0b-91b9e5f843af.gif',
];

const langsDict = {
  es: 'es',
  en: 'en',
  us: 'en',
};

const assetTypeDict = {
  ARTICLE: 'lesson',
  LESSON: 'lesson',
  PROJECT: 'interactive-coding-tutorial',
  EXERCISE: 'interactive-exercise',
};

export const getStaticPaths = async ({ locales }) => {
  const { data } = await bc.public().events();

  const paths = data.filter((ev) => ev?.slug && ['ACTIVE', 'FINISHED'].includes(data.status))
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

  if (resp.statusText === 'not-found' || !data?.slug || !['ACTIVE', 'FINISHED'].includes(data.status)) {
    return ({
      props: {
        translations: [],
        disableLangSwitcher: true,
      },
    });
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

  let asset = null;
  if (data?.asset_slug) {
    const assetResp = await bc.lesson().getAsset(data?.asset_slug);
    asset = assetResp?.data;
  }

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
      eventData: data,
      asset,
    },
  });
};

function Page({ eventData, asset }) {
  const { t } = useTranslation('workshops');
  const { userSession } = useContext(SessionContext);
  const [users, setUsers] = useState([]);
  const [event, setEvent] = useState(eventData);
  const [allUsersJoined, setAllUsersJoined] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [readyToJoinEvent, setReadyToJoinEvent] = useState(false);
  const [finishedEvent, setFinishedEvent] = useState(false);
  const [consumables, setConsumables] = useState({
    isFetching: false,
    data: null,
  });
  const [myCohorts, setMyCohorts] = useState([]);
  const [assetData, setAssetData] = useState(asset);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [randomImage, setRandomImage] = useState(arrayOfImages[0]);
  const accessToken = getStorageItem('accessToken');
  const [isModalToGetAccessOpen, setIsModalToGetAccessOpen] = useState(false);
  const [dataToGetAccessModal, setDataToGetAccessModal] = useState({});
  const [isFetchingDataForModal, setIsFetchingDataForModal] = useState(false);
  const [noConsumablesFound, setNoConsumablesFound] = useState(false);
  const [denyAccessToEvent, setDenyAccessToEvent] = useState(false);

  const router = useRouter();
  const { locale } = router;
  const eventSlug = router?.query?.event_slug;
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  const { featuredColor, hexColor } = useStyle();
  const endDate = event?.ended_at || event?.ending_at;

  const getDefaultData = async () => {
    const resp = await bc.public().singleEvent(eventData?.slug || eventSlug).catch(() => ({
      statusText: 'not-found',
    }));
    const data = resp?.data;
    if (data?.asset_slug) {
      const assetResp = await bc.lesson().getAsset(data?.asset_slug);
      setAssetData(assetResp?.data);
    }
    setEvent(data);
  };

  useEffect(() => {
    if ((!eventData?.slug || !assetData?.slug) && eventSlug) {
      getDefaultData();
    }
  }, [locale, eventData, eventSlug]);

  useEffect(() => {
    if (eventData?.id) {
      setEvent(eventData);
      const eventLang = (eventData?.lang === 'us' || eventData?.lang === null) ? 'en' : eventData?.lang;
      if (eventLang !== locale) {
        window.location.href = `/${eventLang}/workshops/${eventData?.slug}`;
      }
      bc.events().getUsers(eventData?.id)
        .then((resp) => {
          const formatedUsers = resp.data.map((l, i) => {
            const index = i + 1;
            const existsAvatar = l?.attendee?.profile?.avatar_url;
            const avatarNumber = adjustNumberBeetwenMinMax({
              number: index,
              min: 1,
              max: 20,
            });
            if (l?.attendee === null || !existsAvatar) {
              return {
                ...l,
                attendee: {
                  id: l?.attendee?.id || 475335 + i,
                  first_name: l?.attendee?.first_name || 'Anonymous',
                  last_name: l?.attendee?.last_name || '',
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
        .catch(() => { });
    }
  }, [eventData]);

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
      end: new Date(endDate),
      start: new Date(event?.starting_at),
    })
    : {};

  const formatedDate = isValidDate(event?.starting_at) ? {
    es: format(new Date(event?.starting_at), "EEEE, dd 'de' MMMM - p (OOO)", { timeZone, locale: es }),
    en: format(new Date(event?.starting_at), 'EEEE, MMMM do - p (OOO)', { timeZone }),
  } : {};

  const unixFormatedDate = {
    starting_at: isValidDate(event?.starting_at) ? new Date(event?.starting_at).getTime() / 1000 : '',
    ending_at: isValidDate(endDate) ? new Date(endDate).getTime() / 1000 : '',
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
    setConsumables({
      ...consumables,
      isFetching: true,
    });
    bc.payment().service().consumable()
      .then((res) => {
        setConsumables({
          isFetching: false,
          data: res?.data,
        });
      })
      .finally(() => {
        setConsumables((prev) => ({
          ...prev,
          isFetching: false,
        }));
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

  const sortByConsumptionAvailability = (consum) => consum.sort((a, b) => {
    const balanceA = a?.balance?.unit;
    const balanceB = b?.balance?.unit;

    if (balanceA === -1 && balanceB !== -1) return -1;
    if (balanceA !== -1 && balanceB === -1) return 1;

    if (balanceA > 0 && balanceB <= 0) return -1;
    if (balanceA <= 0 && balanceB > 0) return 1;

    return 0;
  });

  const getSubscriptionForCurrentEvent = () => {
    if (!subscriptions || !event?.event_type?.slug) return [];
    const currentEventSlug = event.event_type.slug;

    const filteredSubscriptions = subscriptions.filter((subscription) => {
      const eventTypes = subscription.selected_event_type_set?.event_types || [];
      return eventTypes.some((eventType) => eventType.slug === currentEventSlug);
    });

    return filteredSubscriptions;
  };

  const consumableEventList = consumables?.data?.event_type_sets || [];
  const availableConsumables = sortByConsumptionAvailability(consumableEventList);
  const subscriptionsForCurrentEvent = getSubscriptionForCurrentEvent();
  const currentConsumable = availableConsumables?.length > 0 ? availableConsumables?.find(
    (c) => subscriptionsForCurrentEvent.some(
      (s) => c?.slug.toLowerCase() === s?.selected_event_type_set?.slug.toLowerCase(),
    ),
  ) : {};
  const existsConsumables = typeof currentConsumable?.balance?.unit === 'number' && (currentConsumable?.balance?.unit > 0 || currentConsumable?.balance?.unit === -1);
  const hasFetchedAndNoConsumablesToUse = currentConsumable?.balance?.unit === 0 || (!isRefetching && !currentConsumable?.id && noConsumablesFound) || (!isRefetching && noConsumablesFound && consumableEventList?.length === 0);

  const existsNoAvailableAsSaas = myCohorts.some((c) => c?.cohort?.available_as_saas === false);
  const isFreeForConsumables = event?.free_for_all || finishedEvent || (event?.free_for_bootcamps === true && existsNoAvailableAsSaas);

  useEffect(() => {
    if (subscriptionsForCurrentEvent.length === 0) setDenyAccessToEvent(true);
    else setDenyAccessToEvent(false);
  }, [subscriptionsForCurrentEvent]);

  const dynamicFormInfo = () => {
    if (finishedEvent) {
      return ({
        title: t('form.finished-title'),
        description: t('form.finished-description'),
      });
    }
    if (hasFetchedAndNoConsumablesToUse && !finishedEvent && isAuth && !isFreeForConsumables) {
      return ({
        title: '',
        childrenDescription: (
          <Text size="14px" fontWeight={700} lineHeight="18px">
            {!denyAccessToEvent ? t('no-consumables.description') : `${t('denny-access.description')} '${event?.event_type?.name}' ${t('denny-access.can-join')}`}
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

  const utms = {
    utm_campaign: userSession?.utm_campaign,
    utm_content: userSession?.utm_content,
    utm_medium: userSession?.utm_medium,
    utm_placement: userSession?.utm_placement,
    utm_source: userSession?.utm_source,
    utm_term: userSession?.utm_term,
  };

  const handleJoin = () => {
    if (!finishedEvent) {
      if ((readyToJoinEvent && alreadyApplied) || readyToJoinEvent) {
        reportDatalayer({
          dataLayer: {
            event: 'join_event',
            event_id: event.id,
            event_slug: event.slug,
            event_title: event.title,
            event_type: event.event_type?.slug,
            event_starting_at: unixFormatedDate.starting_at,
            event_ending_at: unixFormatedDate.ending_at,
            event_language: event.lang,
          },
        });
        router.push(`${BREATHECODE_HOST}/v1/events/me/event/${event?.id}/join?token=${accessToken}` || '#');
      }
      if (isAuthenticated && !alreadyApplied && !readyToJoinEvent) {
        bc.events().applyEvent(event?.id, utms)
          .then((resp) => {
            if (resp !== undefined) {
              setApplied(true);
              setIsCheckinModalOpen(true);
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

  const getAssetType = (myAsset) => {
    let assetType;
    if (categoriesFor.howTo.split(',').includes(myAsset?.category.slug)) assetType = 'how-to';
    else assetType = assetTypeDict[myAsset?.asset_type];

    return assetType;
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
      <SimpleModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        closeOnOverlayClick={false}
        padding="0px 0px 16px 0px"
        maxWidth="52rem"
        bodyStyles={{
          display: 'flex',
          // gridGap: withoutSpacing ? '20px' : '16px',
          // padding: withoutSpacing && { base: '16px', md: '0.5rem 16px 0 0' },
        }}
      >
        <Box display={{ base: 'none', md: 'flex' }} flex={0.5} alignItems="center" maxWidth="392px">
          <Image src="/static/images/happy-meeting-2.webp" alt="Get Access" style={{ objectFit: 'cover' }} margin="2rem 0 0 0" borderBottomLeftRadius="6px" />
        </Box>

        <Flex gap="16px" background={hexColor.lightColor} borderRadius="11px" flexDirection="column" marginTop="2rem" flex={{ base: 1, md: 0.5 }} padding="32px 16px" width={{ base: 'auto', md: '394px' }}>
          <Heading size="xsm">
            {t('checkin-modal.title')}
          </Heading>
          <Text size="l" fontWeight="700" color={hexColor.fontColor2}>
            {t('checkin-modal.sub-title')}
          </Text>
          <Flex flexDirection="column" gap="16px">
            {t('checkin-modal.items', {}, { returnObjects: true }).map((item) => (
              <Flex alignItems="center" gap="9px">
                <Icon icon="checked2" color={hexColor.green} width="15px" height="11px" />
                <Text size="md">
                  {item}
                </Text>
              </Flex>
            ))}
          </Flex>
          <Link margin="auto" href={t('checkin-modal.conversation-link')} target="_blank" style={{ textDecoration: 'none' }}>
            <Button display="flex" alignItems="center" gap="5px" variant="outline" borderWidth="2px" borderColor={hexColor.blueDefault}>
              <Icon icon="whatsapp" width="20px" height="14px" />
              <Text size="md" fontWeight="700" color={hexColor.blueDefault}>
                {t('checkin-modal.join-conversation')}
              </Text>
            </Button>
          </Link>
        </Flex>

      </SimpleModal>

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
          gridGap="20px"
          display={{ base: 'flex', md: 'grid' }}
          padding="37px 10px"
          minHeight="290px"
          zIndex={1}
          position="relative"
          flexDirection="column"
        >
          <Link
            gridColumn="1 / span 8"
            margin={{ base: '0', md: '0 2rem' }}
            href="/workshops"
            color={useColorModeValue('blue.default', 'blue.300')}
            display="inline-block"
            letterSpacing="0.05em"
            fontWeight="700"
            width="fit-content"
          >
            {`← ${t('back-to-workshops')}`}
          </Link>
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
                  endingAt={endDate}
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
          {assetData && (
            <>
              <Box mb="20px">
                <Text size="26px" fontWeight={700} mb="10px">
                  {finishedEvent ? t('workshop-asset-ended') : t('workshop-asset-upcoming')}
                </Text>
                <DynamicContentCard
                  data={assetData}
                  type="project"
                />
              </Box>
              {!finishedEvent && assetData.assets_related?.filter((relatedAsset) => relatedAsset.status === 'PUBLISHED' && !['blog-us', 'blog-es'].includes(relatedAsset.category.slug)).length > 0 && (
                <SmallCardsCarousel
                  boxStyle={{
                    width: '210px',
                    background: hexColor.backgroundColor,
                  }}
                  title={t('documents')}
                  cards={asset?.assets_related?.filter((relatedAsset) => relatedAsset.status === 'PUBLISHED' && !['blog-us', 'blog-es'].includes(relatedAsset.category.slug))
                    .map((relatedAsset) => {
                      const assetType = getAssetType(relatedAsset);
                      return {
                        ...relatedAsset,
                        url: `/${assetType}/${relatedAsset.slug}`,
                        lang: langsDict[relatedAsset.lang || 'en'],
                        upperTags: relatedAsset?.technologies?.slice(0, 2) || [],
                        type: 'project',
                      };
                    })}
                  background={hexColor.lightColor}
                  padding="16px"
                  borderRadius="11px"
                  mb="31px"
                  mt="0"
                />
              )}
            </>
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
              <Box color="white" zIndex="10" borderRadius="11px 11px 0 0" background={hexColor.greenLight} padding={(readyToJoinEvent) ? '24px' : '10px 20px'} bottom="0" position="sticky" marginBottom="20px" display={{ base: isAuth ? 'block' : 'none', md: 'none' }} textAlign="left">
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
                          background={hexColor.green}
                          height="40px"
                        />
                      </Box>
                    )}
                    {!event?.online_event && (
                      <>
                        <Box display="flex" gridGap="10px" justifyContent="center" marginBottom="10px">
                          <Icon icon="location" width="20px" height="20px" color="white" />
                          <Text size="14px" fontWeight={700} width="fit-content">
                            {event?.venue?.street_address}
                          </Text>
                        </Box>
                        <Text textAlign="center">{t('form.joined-description-in-person')}</Text>
                      </>
                    )}
                    {(finishedEvent || isFreeForConsumables || existsConsumables) ? (
                      <Box display="flex" gap="10px">
                        <Button
                          fontSize="17px"
                          color={hexColor.greenLight}
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
                        {hasFetchedAndNoConsumablesToUse && (
                          <Text marginBottom="10px" size="14px" fontWeight={700} lineHeight="18px">
                            {!denyAccessToEvent ? t('no-consumables.description') : `${t('denny-access.description')} '${event?.event_type?.name}' ${t('denny-access.can-join')}`}
                          </Text>
                        )}
                        <Button
                          display="flex"
                          variant="default"
                          fontSize="14px"
                          fontWeight={700}
                          onClick={handleGetMoreEventConsumables}
                          isLoading={!hasFetchedAndNoConsumablesToUse || isFetchingDataForModal}
                          alignItems="center"
                          gridGap="10px"
                          width="100%"
                          isDisabled={denyAccessToEvent}
                          background={hexColor.greenLight}
                        >
                          {denyAccessToEvent ? t('no-consumables.get-more-workshops') : t('denny-access.button')}
                          {!denyAccessToEvent && <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />}
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
          width={{ base: '100%', md: '320px' }}
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
                  showVerifyEmail={false}
                  hideForm={finishedEvent}
                  existsConsumables={existsConsumables}
                  hideSwitchUser={!isFreeForConsumables && (noConsumablesFound && !existsConsumables)}
                  isLive={readyToJoinEvent && !finishedEvent}
                  setNoConsumablesFound={setNoConsumablesFound}
                  subscribeValues={{ event_slug: event.slug }}
                  onSubmit={() => setIsRefetching(true)}
                  refetchAfterSuccess={() => {
                    setIsRefetching(true);
                    getMySubscriptions();
                    getCurrentConsumables();
                  }}
                  onLastAttempt={() => {
                    setIsRefetching(false);
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
                  borderColor={hexColor.greenLight}
                  gridGap={(existsConsumables || !noConsumablesFound) ? '10px' : '16px'}
                >
                  {(finishedEvent || isFreeForConsumables || existsConsumables) ? (
                    <Button
                      mt="10px"
                      type="submit"
                      variant="default"
                      display={(alreadyApplied || readyToJoinEvent) && !event?.online_event ? 'none' : 'block'}
                      className={readyToJoinEvent && !finishedEvent ? 'pulse-blue' : ''}
                      background={buttonEnabled ? hexColor.greenLight : 'gray.350'}
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
                      {hasFetchedAndNoConsumablesToUse ? (
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
                            isDisabled={denyAccessToEvent}
                            background={hexColor.greenLight}
                          >
                            {!denyAccessToEvent ? t('no-consumables.get-more-workshops') : t('denny-access.button')}
                            {!denyAccessToEvent && <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />}
                          </Button>
                        </Box>
                      ) : (
                        <Box position="relative" width="180px" height="130px" margin="0 auto">
                          <LoaderScreen width="100%" height="100%" objectFit="cover" />
                        </Box>
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
                  return (
                    <AvatarUser
                      key={`${c?.attendee?.id} - ${c?.attendee?.first_name}`}
                      fullName={fullName}
                      avatarUrl={c?.attendee?.profile?.avatar_url}
                      data={c?.attendee}
                      badge
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
  eventData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
Page.defaultProps = {
  eventData: {},
  asset: null,
};

export default Page;
