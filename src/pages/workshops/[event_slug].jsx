import { useRouter } from 'next/router';
import {
  Avatar,
  Box, Button, Skeleton, useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
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
import { capitalizeFirstLetter, isValidDate } from '../../utils';
import useStyle from '../../common/hooks/useStyle';
import Icon from '../../common/components/Icon';
import FieldForm from '../../common/components/Forms/FieldForm';
import Link from '../../common/components/NextChakraLink';

const Page = () => {
  const [event, setEvent] = useState({});
  const router = useRouter();
  const { t } = useTranslation('workshops');
  const { locale } = router;
  const { event_slug: eventSlug } = router.query;
  const { backgroundColor, featuredColor, hexColor } = useStyle();
  const [formProps, setFormProps] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const commonBorderColor = useColorModeValue('gray.250', 'gray.700');

  useEffect(() => {
    bc.public().events()
      .then((res) => {
        const findEvent = res.data.find((l) => l?.slug === eventSlug);
        setEvent(findEvent);
      })
      .catch(() => {});
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
        >
          <Box display="flex" flexDirection="column" justifyContent="center" gridGap="15px" gridColumn="2 / span 8">
            {event?.title ? (
              <Heading
                as="h1"
                size="50px"
                fontWeight="700"
                textTransform="capitalize"
                paddingTop="10px"
                transition="color 0.2s ease-in-out"
                color={useColorModeValue('black', 'white')}
              >
                {event.title}
              </Heading>
            ) : (
              <Skeleton height="45px" width="100%" m="22px 0 35px 0" borderRadius="10px" />
            )}
            <Box display="flex" flexDirection="column" gridGap="8px" id="event-info">
              <Box display="flex" gridGap="10px">
                <Icon icon="calendar" width="20px" height="20px" color={hexColor.fontColor3} />
                <Text withTooltip size="14px" label={capitalizeFirstLetter(countryOfDate)} fontWeight={700} width="fit-content">
                  {capitalizeFirstLetter(formatedDate[locale])}
                </Text>
              </Box>
              <Box display="flex" gridGap="10px">
                <Icon icon="chronometer-full" width="20px" height="20px" color={hexColor.fontColor3} />
                <Text size="sm">
                  {`${duration.hours} hr duraiton`}
                </Text>
              </Box>
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
        <Box display={{ base: 'block', lg: 'flex' }} flexDirection="column" gridColumn={{ base: '1 / span 6', lg: '2 / span 8' }}>

          {/* MARKDOWN SIDE */}
          <Box
            borderRadius="3px"
            marginBottom="17px"
            maxWidth="1012px"
            flexGrow={1}
            width={{ base: 'auto', lg: '100%' }}
            className={`markdown-body ${useColorModeValue('light', 'dark')}`}
          >
            Join us for an exciting opportunity to bring your HTML, CSS, and JavaScript skills to the next level! Our special speaker Brent Solomon, a seasoned teacher at 4Geeks Academy USA and Software Engineer at Amazon Web Services, will guide you through the process of building a sleek and functional TodoList using Vanilla JavaScript.
            <br />
            <br />
            This hands-on experience will not only enhance your understanding of these technologies but also equip you with a valuable project to add to your portfolio. Don&apos;t miss out on this chance to learn from an expert and take your skills to new heights!
          </Box>
          <Box display="flex" flexDirection="column" gridGap="12px" mb="31px">
            <Text size="26px" fontWeight={700}>
              Your host for this event
            </Text>
            <Box display="flex" gridGap="24px" background={featuredColor} borderRadius="12px" padding="16px 24px">
              <Avatar
                width="102px"
                height="102px"
                name="Brent Solomon"
                src="https://assets.breatheco.de/apis/img/images.php?blob&random&cat=icon&tags=brent,solomon"
              />
              <Box display="flex" flexDirection="column" gridGap="6.5px">
                <Text size="26px" fontWeight={700} lineHeight="31.2px">
                  Brent Solomon
                </Text>
                <Text size="16px" fontWeight={400} color="blue.default" lineHeight="19.36px">
                  Buenos aires, Argentina
                </Text>
                <Text size="12px" fontWeight={400}>
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa...
                </Text>
                <Box display="flex" gridGap="16px" margin="20px 0 0 0">
                  <Icon icon="github" width="20px" height="20px" />
                  <Icon icon="twitter" width="20px" height="20px" />
                  <Icon icon="linkedin" width="20px" height="20px" />
                  <Icon icon="git" width="20px" height="20px" />
                </Box>
              </Box>
            </Box>

          </Box>
          <Text size="26px" fontWeight={700}>
            We will be coding the following project
          </Text>
        </Box>

        <Box
          display={{ base: 'none', md: 'flex' }}
          gridColumn={{ base: '7 / span 4', lg: '10 / span 4' }}
          margin={{ base: '20px 0 0 auto', lg: '-12.95rem 0 0 auto' }}
          flexDirection="column"
          backgroundColor={backgroundColor}
          transition="background 0.2s ease-in-out"
          // width={{ base: '300px', lg: '350px', xl: '350px' }}
          width="100%"
          textAlign="center"
          // minWidth="250px"
          height="fit-content"
          borderWidth="0px"
          gridGap="10px"
          borderRadius="17px"
          overflow="hidden"
          border={1}
          borderStyle="solid"
          borderColor={commonBorderColor}
        >
          <Image src="/static/images/person-smile1.png" width={342} height={177} objectFit="cover" />
          <Text size="21px" fontWeight={700} lineHeight="25px">
            Join The Workshop
          </Text>
          <Text size="14px" fontWeight={700} lineHeight="18px">
            Sign in to join other coders live solving technical or career challenges.
          </Text>
          <Box>
            <Formik
              initialValues={{
                first_name: '',
                last_name: '',
                email: '',
              }}
              onSubmit={(values, actions) => {
                // const userIds = values?.members?.map((member) => {
                //   const tagId = getTag(member);
                //   const replaceTag = typeof tagId === 'string' ? tagId?.replace(/\(([^)]+)\)/, '')?.trim() : tagId;
                //   const userData = students?.find((student) => student?.user?.id === Number(tagId));
                //   return userData?.user?.id || replaceTag;
                // });
                // const allValues = {
                //   ...values,
                //   cohort: cohortSession?.id,
                //   members: userIds,
                //   id: projectId,
                // };

                // if (repoUrl) {
                //   handleUpdate(actions, [allValues]);
                // }
                actions.setSubmitting(false);
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
                  />
                  <FieldForm
                    type="text"
                    name="last_name"
                    label={t('common:last-name')}
                    required
                    formProps={formProps}
                    setFormProps={setFormProps}
                  />
                  <FieldForm
                    type="text"
                    name="email"
                    label={t('common:email')}
                    required
                    formProps={formProps}
                    setFormProps={setFormProps}
                  />

                  <Button
                    mt="10px"
                    type="submit"
                    variant="default"
                    isLoading={isSubmitting}
                  >
                    Join Workshop
                  </Button>
                  <Text size="13px" padding="4px 8px" borderRadius="4px" background={featuredColor}>
                    You already have an account?
                    {' '}
                    <Link redirectAfterLogin variant="default" href="/login" fontSize="13px">Login here.</Link>
                  </Text>
                </Form>
              )}
            </Formik>
          </Box>
          {/* {exercise?.slug ? (
            <TabletWithForm
              toast={toast}
              exercise={exercise}
              commonTextColor={commonTextColor}
              commonBorderColor={commonBorderColor}
            />
          ) : (
            <Skeleton height="646px" width="100%" borderRadius="17px" />
          )} */}
        </Box>
      </GridContainer>
    </>
  );
};

export default Page;
