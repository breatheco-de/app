import { useRouter } from 'next/router';
import {
  Box, Button, Grid, Skeleton, useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import { intervalToDuration, format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { Form, Formik } from 'formik';
import useTranslation from 'next-translate/useTranslation';
import bc from '../../common/services/breathecode';
import GridContainer from '../../common/components/GridContainer';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import { capitalizeFirstLetter, isValidDate, setStorageItem } from '../../utils';
import useStyle from '../../common/hooks/useStyle';
import Icon from '../../common/components/Icon';
import FieldForm from '../../common/components/Forms/FieldForm';
import Link from '../../common/components/NextChakraLink';
import PublicProfile from '../../common/components/PublicProfile';
import modifyEnv from '../../../modifyEnv';
import useCustomToast from '../../common/hooks/useCustomToast';
import useAuth from '../../common/hooks/useAuth';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';

const Page = () => {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { isAuthenticated, user, logout } = useAuth();
  const [event, setEvent] = useState({
    loaded: false,
  });
  const [users, setUsers] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const router = useRouter();
  const { t } = useTranslation('workshops');
  const { locale } = router;
  const toastIdRef = useRef();
  const { event_slug: eventSlug } = router.query;
  const { backgroundColor, featuredColor, hexColor } = useStyle();
  const [formProps, setFormProps] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const { createToast } = useCustomToast({
    toastIdRef,
    status: 'info',
    title: t('signup:alert-message.title'),
    content: (
      <Box>
        {t('signup:alert-message.message1')}
        {' '}
        <Link variant="default" color="blue.200" href="/">4Geeks.com</Link>
        .
        <br />
        {t('signup:alert-message.message2')}
        {' '}
        <Link variant="default" color="blue.200" href="/login" redirectAfterLogin>{t('signup:alert-message.click-here-to-login')}</Link>
        {' '}
        {t('signup:alert-message.or-click-here')}
        {' '}
        <Link variant="default" color="blue.200" href="/#">{t('signup:alert-message.message3')}</Link>
        .
      </Box>
    ),
  });

  const commonBorderColor = useColorModeValue('gray.250', 'gray.700');

  useEffect(() => {
    bc.public().events()
      .then((res) => {
        const findedEvent = res.data.find((l) => l?.slug === eventSlug);
        if (findedEvent?.id) {
          bc.events().getUsers(findedEvent?.id)
            .then((resp) => {
              const cleanedData = resp.data.filter((l) => l?.attendee?.first_name && l?.attendee?.last_name);
              setUsers(cleanedData);
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

  const subscriptionValidation = Yup.object().shape({
    first_name: Yup.string().min(2, t('common:validators.short-input')).max(50, t('common:validators.long-input')).required(t('common:validators.first-name-required')),
    last_name: Yup.string().min(2, t('common:validators.short-input')).max(50, t('common:validators.long-input')).required(t('common:validators.last-name-required')),
    email: Yup.string().email(t('common:validators.invalid-email')).required(t('common:validators.email-required')),
  });

  const handleSubmit = async (actions, allValues) => {
    const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(allValues),
    });
    const data = await resp.json();

    if (resp.status < 400 && typeof data?.id === 'number') {
      setStorageItem('subscriptionId', data.id);
      router.push('/thank-you');
    }
    if (resp.status > 400) {
      actions.setSubmitting(false);
    }
    if (resp.status === 409) {
      createToast();
      actions.setSubmitting(false);
    }
  };

  const eventNotExists = event?.loaded && !event?.slug;

  return (
    <>
      <Box
        background={useColorModeValue('featuredLight', 'featuredDark')}
        marginBottom="37px"
      >
        <GridContainer
          height="100%"
          minHeight="290px"
          // gridTemplateColumns={{ base: 'repeat(12, 1fr)', lg: '2fr repeat(12, 1fr)' }}
          gridTemplateColumns="2fr repeat(12, 1fr) 2fr"
          gridGap="36px"
          padding="0 10px"
          display={{ base: 'flex', md: 'grid' }}
        >
          <Box display="flex" flexDirection="column" justifyContent="center" gridGap="15px" gridColumn="2 / span 8">
            <Box display="flex" mt={{ base: '0', md: '1rem' }} gridGap="6px" background="yellow.light" borderRadius="20px" alignItems="center" width="fit-content" padding="8px 12px">
              <Icon icon="usaFlag" width="15px" height="15px" />
              <Text size="13px" fontWeight={700}>
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
                    {`${duration.hours} hr duraiton`}
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
        {/* <Box display={{ base: 'none', lg: 'grid' }} position="sticky" top="20px" height="fit-content" gridColumn="1 / span 1" margin={{ base: '0 0 40px', md: '1rem 0 0 0' }}>
          <MktSideRecommendedCourses />
        </Box> */}
        <Box display={{ base: 'block', lg: 'flex' }} flexDirection="column" gridColumn={{ base: '2 / span 6', lg: '2 / span 8' }}>

          {/* MARKDOWN SIDE */}
          <Box
            borderRadius="3px"
            marginBottom="17px"
            maxWidth="1012px"
            flexGrow={1}
            width={{ base: 'auto', lg: '100%' }}
            className={`markdown-body ${useColorModeValue('light', 'dark')}`}
          >
            {event?.description}
            {/* Join us for an exciting opportunity to bring your HTML, CSS, and JavaScript skills to the next level! Our special speaker Brent Solomon, a seasoned teacher at 4Geeks Academy USA and Software Engineer at Amazon Web Services, will guide you through the process of building a sleek and functional TodoList using Vanilla JavaScript.
            <br />
            <br />
            This hands-on experience will not only enhance your understanding of these technologies but also equip you with a valuable project to add to your portfolio. Don&apos;t miss out on this chance to learn from an expert and take your skills to new heights! */}
          </Box>
          <Box display="flex" flexDirection="column" gridGap="12px" mb="31px">
            <Text size="26px" fontWeight={700}>
              {t('host-label-text')}
            </Text>
            {!eventNotExists && (event?.host_user || event?.host) && (
              <PublicProfile
                profile={(typeof event?.host_user === 'object' && event?.host_user !== null) ? event.host_user : event?.host}
              />
            )}

          </Box>
          {/* <Text size="26px" fontWeight={700}>
            We will be coding the following project
          </Text> */}
        </Box>

        <Box
          display="flex"
          gridColumn={{ base: '8 / span 4', lg: '10 / span 4' }}
          margin={{ base: '20px 0 0 auto', lg: '-12.95rem 0 0 auto' }}
          flexDirection="column"
          transition="background 0.2s ease-in-out"
          width="100%"
          textAlign="center"
          height="fit-content"
          borderWidth="0px"
          gridGap="10px"
          overflow="hidden"
        >
          <Box
            display="flex"
            flexDirection="column"
            gridGap="10px"
            borderRadius="17px"
            border={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            backgroundColor={backgroundColor}
          >
            <Image src="/static/images/person-smile1.png" width={342} title="Form image" height={177} objectFit="cover" style={{ borderTopLeftRadius: '17px', borderTopRightRadius: '17px' }} />

            <Box display="flex" flexDirection="column" gridGap="10px" padding="0 18px 18px">
              {isAuthenticated && user?.id ? (
                <>
                  <Text size="21px" fontWeight={700} lineHeight="25px">
                    {`Hello ${user.first_name}`}
                  </Text>
                  <Text size="14px" fontWeight={700} lineHeight="18px">
                    {t('suggest-join-event')}
                  </Text>
                  <Button
                    mt="10px"
                    type="submit"
                    variant="default"
                    // title="RSVP for this Workshop"
                    disabled={eventNotExists && !isAuthenticated}
                    onClick={() => {
                      if (isAuthenticated) {
                        bc.events().applyEvent(event.id)
                          .then(() => {});
                      }
                    }}
                  >
                    {t('reserv-button-text')}
                  </Button>
                  <Text size="13px" padding="4px 8px" borderRadius="4px" background={featuredColor}>
                    {`You are not ${user.first_name}?`}
                    {' '}
                    <Button
                      variant="link"
                      fontSize="13px"
                      height="auto"
                      onClick={() => {
                        setStorageItem('redirect', router?.asPath);
                        setTimeout(() => {
                          logout(() => {
                            router.push('/login');
                          });
                          // router.push('/login');
                        }, 150);
                      }}
                    >
                      {`${t('common:logout-and-switch-user')}.`}
                    </Button>
                  </Text>
                </>
              ) : (
                <>
                  <Text size="21px" fontWeight={700} lineHeight="25px">
                    {t('form.title')}
                  </Text>
                  <Text size="14px" fontWeight={700} lineHeight="18px">
                    {t('form.description')}
                  </Text>
                  <Box>
                    <Formik
                      initialValues={{
                        first_name: '',
                        last_name: '',
                        email: '',
                      }}
                      onSubmit={(values, actions) => {
                        handleSubmit(actions, values);
                      }}
                      validationSchema={subscriptionValidation}
                    >
                      {({ isSubmitting }) => (
                        <Form
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gridGap: '10px',
                            padding: '18px',
                          }}
                        >
                          <FieldForm
                            type="text"
                            name="first_name"
                            label={t('common:first-name')}
                            required
                            formProps={formProps}
                            setFormProps={setFormProps}
                            readOnly={eventNotExists}
                          />
                          <FieldForm
                            type="text"
                            name="last_name"
                            label={t('common:last-name')}
                            required
                            formProps={formProps}
                            setFormProps={setFormProps}
                            readOnly={eventNotExists}
                          />
                          <FieldForm
                            type="text"
                            name="email"
                            label={t('common:email')}
                            required
                            formProps={formProps}
                            setFormProps={setFormProps}
                            readOnly={eventNotExists}
                          />

                          <Button
                            mt="10px"
                            type="submit"
                            variant="default"
                            isLoading={isSubmitting}
                            title="Join Workshop"
                            disabled={eventNotExists}
                          >
                            {t('join-workshops')}
                          </Button>
                          <Text size="13px" padding="4px 8px" borderRadius="4px" background={featuredColor}>
                            {t('signup:already-have-account')}
                            {' '}
                            <Link redirectAfterLogin variant="default" href="/login" fontSize="13px">
                              {t('signup:login-here')}
                            </Link>
                          </Text>
                        </Form>
                      )}
                    </Formik>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {users?.length > 0 && (
            <Box background={featuredColor} padding="20px 25px" borderRadius="17px">
              <Text>
                {`${users.length} people are already registered in this event. 27 more spots available`}
              </Text>
              <Grid
                gridAutoRows="3.4rem"
                templateColumns="repeat(auto-fill, minmax(3.5rem, 1fr))"
                gap={0}
                maxH={showAll ? '270px' : 'auto'}
                height={showAll ? '100%' : 'auto'}
                overflowY="auto"
              >
                {users?.map((c) => {
                  const fullName = `${c?.attendee?.first_name} ${c?.attendee?.last_name}`;
                  return c?.attendee?.id && (
                    <AvatarUser
                      key={`${c?.attendee?.id} - ${c?.attendee?.first_name}`}
                      fullName={fullName}
                      avatarUrl={c?.attendee?.profile?.avatar_url}
                      data={c?.attendee}
                      // isOnline={isOnline}
                      badge
                      withoutPopover
                    />
                  );
                })}
              </Grid>
              {users.length > 12 && !showAll && (
                <Button variant="link" height="auto" onClick={() => setShowAll(true)}>
                  Load more
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
