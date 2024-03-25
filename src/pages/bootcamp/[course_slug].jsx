import axios from 'axios';
import PropTypes from 'prop-types';
import { Box, Button, Flex, Image, Link, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import getT from 'next-translate/getT';
import { parseQuerys } from '../../utils/url';
import { BREATHECODE_HOST, WHITE_LABEL_ACADEMY } from '../../utils/variables';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import GridContainer from '../../common/components/GridContainer';
import Heading from '../../common/components/Heading';
import { error } from '../../utils/logging';
import bc from '../../common/services/breathecode';
import { generateCohortSyllabusModules } from '../../common/handlers/cohorts';
import { adjustNumberBeetwenMinMax, setStorageItem } from '../../utils';
import useStyle from '../../common/hooks/useStyle';
import OneColumnWithIcon from '../../common/components/OneColumnWithIcon';
import CourseContent from '../../common/components/CourseContent';
import ShowOnSignUp from '../../common/components/ShowOnSignup';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import Instructors from '../../common/components/Instructors';
import Faq from '../../common/components/Faq';
import TagCapsule from '../../common/components/TagCapsule';
import MktTrustCards from '../../common/components/MktTrustCards';
import MktShowPrices from '../../common/components/MktShowPrices';
import NextChakraLink from '../../common/components/NextChakraLink';
import useAuth from '../../common/hooks/useAuth';
import { SUBS_STATUS, generatePlan, getAllMySubscriptions, getTranslations } from '../../common/handlers/subscriptions';
import axiosInstance from '../../axios';
import { usePersistent } from '../../common/hooks/usePersistent';
import { reportDatalayer } from '../../utils/requests';
import MktTwoColumnSideImage from '../../common/components/MktTwoColumnSideImage';

export async function getStaticPaths({ locales }) {
  const mktQueryString = parseQuerys({
    featured: true,
    academy: WHITE_LABEL_ACADEMY,
  });

  const getAllCourses = await Promise.all(locales.map(async (locale) => {
    const resp = await axios.get(`${BREATHECODE_HOST}/v1/marketing/course${mktQueryString}&lang=${locale}`);
    return resp?.data;
  }));

  const filterByTranslations = getAllCourses.flat().filter((item) => item?.course_translation !== null);
  const paths = filterByTranslations.flatMap((course) => {
    const locale = course?.course_translation?.lang?.split('-')[0];
    return course?.slug && ({
      params: {
        course_slug: course?.slug,
      },
      locale,
    });
  });

  return {
    fallback: false,
    paths,
  };
}
export async function getStaticProps({ locale, params }) {
  const { course_slug: courseSlug } = params;
  const t = await getT(locale, 'course');

  const endpoint = `/v1/marketing/course/${courseSlug}?lang=${locale}`;
  const resp = await axios.get(`${BREATHECODE_HOST}${endpoint}`);
  const data = resp?.data;
  const cohortId = data?.cohort?.id;
  const cohortSyllabus = await generateCohortSyllabusModules(cohortId);
  const translationsObj = getTranslations(t);

  const members = await bc.cohort({ roles: 'STUDENT,TEACHER,ASSISTANT', cohort_id: cohortId }).getPublicMembers()
    .then((respMembers) => respMembers.data)
    .catch((err) => {
      error('Error fetching cohort users:', err);
      return [];
    });
  const getModulesInfo = async () => {
    try {
      const assetTypeCount = {
        lesson: 0,
        project: 0,
        quiz: 0,
        exercise: 0,
      };
      const projects = [];
      const exercises = [];
      if (cohortSyllabus?.syllabus?.modules?.length > 0) {
        cohortSyllabus.syllabus?.modules?.forEach((module) => {
          module?.content.forEach((task) => {
            if (task?.task_type) {
              const taskType = task?.task_type?.toLowerCase();
              assetTypeCount[taskType] += 1;
            }
            if (task?.task_type === 'PROJECT') {
              projects.push(task);
            }
            if (task?.task_type === 'EXERCISE') {
              exercises.push(task);
            }
          });
        });
      }
      const lastProjects = projects?.length > 0 ? projects.slice(-3) : [];
      const lastExercises = exercises?.length > 0 ? exercises.slice(-3) : [];
      const relatedAssetsToShow = [...lastProjects, ...lastExercises].slice(0, 3);
      const lang = locale === 'en' ? 'us' : locale;
      const assignmentsFetch = relatedAssetsToShow?.length > 0 ? await Promise.all(relatedAssetsToShow.map((item) => bc.get(`${BREATHECODE_HOST}/v1/registry/asset/${item?.translations?.[lang]?.slug || item?.slug}`)
        .then((assignmentResp) => assignmentResp.json())
        .then((respData) => respData)
        .catch(() => []))) : [];

      return {
        count: assetTypeCount || {},
        assignmentList: assignmentsFetch || [],
      };
    } catch (errorMsg) {
      error('Error fetching module info:', errorMsg);
      return {
        count: {},
        assignmentList: [],
      };
    }
  };
  const modulesInfo = await getModulesInfo();
  const planData = await generatePlan(data.plan_slug, translationsObj).then((finalData) => finalData);

  const cohortData = {
    cohortSyllabus,
    members,
    modulesInfo,
  };
  if (resp?.status >= 400) {
    console.error(`ERROR with /bootcamp/course/${courseSlug}: something went wrong fetching "${endpoint}"`);
    return {
      notFound: true,
    };
  }
  return {
    props: {
      data: {
        ...data,
        planData,
      },
      cohortData,
    },
  };
}

function Page({ data, cohortData }) {
  const { isAuthenticated, user, logout, choose } = useAuth();
  const { hexColor, fontColor, borderColor, complementaryBlue, featuredColor } = useStyle();
  const [, setCohortSession] = usePersistent('cohortSession', {});
  const toast = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const [readyToRefetch, setReadyToRefetch] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [relatedSubscription, setRelatedSubscription] = useState(null);
  const { t, lang } = useTranslation('course');
  const router = useRouter();
  const faqList = t('faq', {}, { returnObjects: true }) || [];
  const features = t('features', {}, { returnObjects: true }) || {};
  const limitViewStudents = 3;

  const students = cohortData?.members?.length > 0 ? cohortData?.members?.filter((member) => member.role === 'STUDENT') : [];
  const instructors = cohortData?.members?.length > 0 ? cohortData?.members?.filter((member) => member.role === 'TEACHER' || member.role === 'ASSISTANT') : [];
  const technologies = cohortData?.cohortSyllabus?.syllabus?.main_technologies?.split(',') || [];
  const technologiesString = cohortData.isLoading === false && technologies.join(', ');
  const existsRelatedSubscription = relatedSubscription?.status === SUBS_STATUS.ACTIVE;
  const cohortId = data?.cohort?.id;
  const plans = data?.planData?.plans || [];
  const payableList = plans.filter((plan) => plan?.type === 'PAYMENT');
  const firstPaymentPlan = payableList?.[0];
  const enrollQuerys = payableList?.length > 0 ? parseQuerys({
    plan: firstPaymentPlan?.plan_slug,
    plan_id: firstPaymentPlan?.plan_id,
    has_available_cohorts: data?.planData?.has_available_cohorts,
    price: firstPaymentPlan?.price,
    period: firstPaymentPlan?.period,
    cohort: cohortId,
  }) : `?plan=${data?.plan_slug}&cohort=${cohortId}`;

  const getPlanPrice = () => {
    if (payableList?.length > 0) {
      if (firstPaymentPlan.period === 'MONTH') {
        return `${firstPaymentPlan.priceText} ${t('signup:info.monthly')}`;
      }
      if (firstPaymentPlan.period === 'YEAR') {
        return `${firstPaymentPlan.priceText} ${t('signup:info.monthly')}`;
      }
      if (firstPaymentPlan.period === 'ONE_TIME') {
        return `${firstPaymentPlan.priceText}, ${t('signup:info.one-time')}`;
      }
      if (firstPaymentPlan.period === 'FINANCING') {
        return `${firstPaymentPlan.priceText} ${t('signup:info.installments')}`;
      }
    }
    return t('common:enroll');
  };
  const featurePrice = getPlanPrice().toLocaleLowerCase();

  const joinCohort = () => {
    if (isAuthenticated && existsRelatedSubscription) {
      reportDatalayer({
        dataLayer: {
          event: 'join_cohort',
          cohort_id: cohortId,
        },
      });
      setIsFetching(true);
      bc.cohort().join(cohortId)
        .then(async (resp) => {
          const dataRequested = await resp.json();
          if (dataRequested?.status === 'ACTIVE') {
            setReadyToRefetch(true);
          }
          if (dataRequested?.status_code === 400) {
            toast({
              position: 'top',
              title: dataRequested?.detail,
              status: 'info',
              duration: 5000,
              isClosable: true,
            });
            setTimeout(() => {
              router.push('/choose-program');
            }, 600);
          }
          if (dataRequested?.status_code > 400) {
            toast({
              position: 'top',
              title: dataRequested?.detail,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            router.push('#pricing');
          }
        })
        .catch(() => {
          setTimeout(() => {
            setIsFetching(false);
          }, 600);
        });
    } else {
      router.push('#pricing');
    }
  };

  const redirectTocohort = () => {
    const cohort = cohortData?.cohortSyllabus?.cohort;
    const langLink = lang !== 'en' ? `/${lang}` : '';
    const syllabusVersion = cohort?.syllabus_version;
    choose({
      version: syllabusVersion?.version,
      slug: syllabusVersion?.slug,
      cohort_name: cohort.name,
      cohort_slug: cohort?.slug,
      syllabus_name: syllabusVersion,
      academy_id: cohort.academy.id,
    });
    axiosInstance.defaults.headers.common.Academy = cohort.academy.id;
    const cohortDashboardLink = `${langLink}/cohort/${cohort?.slug}/${syllabusVersion?.slug}/v${syllabusVersion?.version}`;
    setCohortSession({
      ...cohort,
      selectedProgramSlug: cohortDashboardLink,
    });
    router.push(cohortDashboardLink);
  };
  const redirectToCohortIfItsReady = ({ withAlert = true, callback = () => {} } = {}) => {
    bc.admissions().me().then((resp) => {
      const joinedCohortsData = resp?.data;
      const alreadyHaveThisCohort = joinedCohortsData?.cohorts?.some((elmnt) => elmnt?.cohort?.id === cohortId);

      if (alreadyHaveThisCohort) {
        callback();

        setIsFetching(false);
        if (withAlert) {
          toast({
            position: 'top',
            title: t('dashboard:already-have-this-cohort'),
            status: 'info',
            duration: 5000,
          });
        }
        redirectTocohort();
      }
    });
  };
  const assetCount = cohortData?.modulesInfo?.count;
  const assignmentList = cohortData?.modulesInfo?.assignmentList;

  useEffect(() => {
    if (isAuthenticated) {
      getAllMySubscriptions().then((subscriptions) => {
        const subscriptionRelatedToThisCohort = subscriptions?.length > 0 ? subscriptions?.find((sbs) => {
          const isRelated = sbs?.selected_cohort_set?.cohorts.some((elmnt) => elmnt?.id === cohortId);
          return isRelated;
        }) : null;

        setRelatedSubscription(subscriptionRelatedToThisCohort);
      });

      redirectToCohortIfItsReady();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let interval;
    if (readyToRefetch && timeElapsed < 10) {
      interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
        redirectToCohortIfItsReady({
          withAlert: false,
          callback: () => clearInterval(interval),
        });
      }, 1500);
    }
    if (readyToRefetch === false) {
      setTimeElapsed(0);
      clearInterval(interval);
    }
  }, [readyToRefetch]);

  const icon = {
    readings: 'book',
    exercises: 'strength',
    projects: 'laptop-code',
  };
  const assetCountByType = {
    readings: 41, // assetCount?.lesson,
    exercises: 584, // assetCount?.exercise,
    projects: 26, // assetCount?.project,
  };

  const courseContentList = data?.course_translation?.course_modules?.length > 0
    ? data?.course_translation?.course_modules.map((module) => ({
      title: module.name,
      description: module.description,
    })) : [];

  return (
    <Flex flexDirection="column" mt="2rem">
      <GridContainer maxWidth="1280px" gridTemplateColumns="repeat(12, 1fr)" gridGap="36px" padding="8px 10px 50px 10px" mt="17px">
        <Flex flexDirection="column" gridColumn="1 / span 8" gridGap="24px">
          {/* Title */}
          <Flex flexDirection="column" gridGap="16px">
            <Flex color="danger" width="fit-content" borderRadius="18px" alignItems="center" padding="4px 10px" gridGap="8px" background="red.light">
              <Icon icon="dot" width="8px" height="8px" color="currentColor" margin="2px 0 0 0" />
              <Text size="12px" fontWeight={700} color="currentColor">
                {t('live-bootcamp')}
              </Text>
            </Flex>
            <Flex gridGap="16px" flexDirection={{ base: 'column', md: 'row' }} alignItems="center">
              {/* <Image src={data?.icon_url} width="54px" height="54px" objectFit="cover" /> */}
              <Heading as="h1" width="100%" size={{ base: '42px', md: '64px' }} fontFamily="Space Grotesk Variable" fontWeight={700}>
                {data?.course_translation?.title}
                {' '}
                solo
              </Heading>
            </Flex>
          </Flex>

          {/* Students count */}
          <Flex alignItems="center" gridGap="16px">
            <Flex>
              {students.slice(0, limitViewStudents).map((student, index) => {
                const existsAvatar = student.profile?.avatar_url;
                const avatarNumber = adjustNumberBeetwenMinMax({
                  number: student?.id,
                  min: 1,
                  max: 20,
                });
                return (
                  <Image
                    key={student?.profile?.full_name}
                    margin={index < (limitViewStudents - 1) ? '0 -21px 0 0' : '0'}
                    src={existsAvatar || `${BREATHECODE_HOST}/static/img/avatar-${avatarNumber}.png`}
                    width="40px"
                    height="40px"
                    borderRadius="50%"
                    objectFit="cover"
                    alt={`Picture of ${student?.user?.first_name}`}
                  />
                );
              })}
            </Flex>
            <Text size="16px" color="currentColor" fontWeight={400}>
              {students.length > limitViewStudents ? t('students-enrolled-count', { count: students.length - limitViewStudents }) : ''}
            </Text>
          </Flex>

          <Flex flexDirection="column" gridGap="24px">
            <Text size="24px" fontWeight={700}>
              {t('technology-connector.get-the-skills')}
              {' '}
              <Text as="span" size="24px" color="blue.default" fontWeight={700}>
                {technologiesString || data?.course_translation?.title}
              </Text>
              {' '}
              {t('technology-connector.by-your-own-pace')}
            </Text>
            <Flex flexDirection="column" gridGap="16px">
              <Flex gridGap="9px" alignItems="center">
                <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
                <Text size="16px" fontWeight={400} color="currentColor" lineHeight="normal">
                  {t('live-workshops-connector.join-one-or-more-workshops')}
                </Text>
              </Flex>
              <Flex gridGap="9px" alignItems="center">
                <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
                <Text size="16px" fontWeight={400} color="currentColor" lineHeight="normal">
                  {t('career-connector.receive-guidance')}
                </Text>
              </Flex>
              <Flex gridGap="9px" alignItems="center">
                <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
                <Text size="16px" fontWeight={400} color="currentColor" lineHeight="normal">
                  {t('mentoring-connector.get-help-with')}
                  {' '}
                  <strong>{t('mentoring-connector.one-one-mentoring')}</strong>
                  {' '}
                  {t('mentoring-connector.every-month')}
                </Text>
              </Flex>
            </Flex>

            {/* Instructors component here */}
            <Instructors list={instructors} />

            {/* Course description */}
            <Flex flexDirection="column" gridGap="16px">
              {data?.course_translation?.short_description && (
                <Text size="18px" fontWeight={700} color="currentColor" lineHeight="normal">
                  {data?.course_translation?.short_description}
                </Text>
              )}
              <Text size="16px" fontWeight={400} color={hexColor.fontColor3} lineHeight="normal">
                {data?.course_translation?.description}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex flexDirection="column" gridColumn="9 / span 4" mt={{ base: '2rem', md: '0' }}>
          <ShowOnSignUp
            title={t('join-cohort')}
            maxWidth="396px"
            description={isAuthenticated ? t('join-cohort-description') : t('create-account-text')}
            borderColor="green.400"
            textAlign="center"
            gridGap="11px"
            padding={data?.course_translation?.video_url ? '0 10px' : '24px 10px 0 10px'}
            formContainerStyle={{
              gridGap: '0px',
              margin: '0 0 7px 0',
            }}
            buttonStyles={{
              margin: '24px auto 10px auto',
              fontSize: '14px',
              width: 'fit-content',
            }}
            hideForm
            hideSwitchUser
            invertHandlerPosition
            headContent={data?.course_translation?.video_url && (
              <Flex flexDirection="column" position="relative">
                <Image src={data?.icon_url} top="-1.5rem" left="-1.5rem" width="64px" height="64px" objectFit="cover" position="absolute" />
                <ReactPlayerV2
                  url={data?.course_translation?.video_url}
                  withThumbnail
                  withModal
                  thumbnailStyle={{
                    borderRadius: '17px 17px 0 0',
                  }}
                  margin="0 0 12px 0"
                />
              </Flex>
            )}
            footerContent={(
              <Flex flexDirection="column">
                <Flex flexDirection="column" gridGap="10px" padding="18px">
                  {(isAuthenticated && existsRelatedSubscription) ? (
                    <Button
                      variant="default"
                      isLoading={isFetching}
                      textTransform="uppercase"
                      onClick={() => joinCohort()}
                    >
                      {t('join-cohort')}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        background="green.400"
                        color="white"
                        onClick={() => {
                          router.push(`/checkout${enrollQuerys}`);
                        }}
                      >
                        {payableList?.length > 0
                          ? `${t('common:enroll-for-connector')} ${featurePrice}`
                          : t('common:enroll')}
                      </Button>
                      <Button
                        variant="outline"
                        color="green.400"
                        borderColor="currentColor"
                        onClick={() => {
                          router.push('#pricing');
                        }}
                      >
                        {t('common:see-financing-options')}
                      </Button>
                      {isAuthenticated ? (
                        <Text size="13px" padding="4px 8px" borderRadius="4px" background={featuredColor}>
                          {t('signup:switch-user-connector', { name: user?.first_name })}
                          {' '}
                          <Button
                            variant="link"
                            fontSize="13px"
                            height="auto"
                            onClick={() => {
                              logout();
                              setStorageItem('redirect', router?.asPath);
                              window.location.href = '/login';
                            }}
                          >
                            {`${t('common:logout-and-switch-user')}.`}
                          </Button>
                        </Text>
                      ) : (
                        <Flex fontSize="13px" backgroundColor={featuredColor} justifyContent="center" alignItems="center" borderRadius="4px" padding="4px 8px" width="fit-content" margin="0 auto" gridGap="6px">
                          {t('signup:already-have-account')}
                          {' '}
                          <NextChakraLink href="/login" redirectAfterLogin fontSize="13px" variant="default">{t('signup:login-here')}</NextChakraLink>
                        </Flex>
                      )}
                    </>
                  )}
                </Flex>
                <Flex flexDirection="column" mt="1rem" gridGap="14px" padding="0 18px 18px">
                  {['readings', 'exercises', 'projects'].map((item, index) => (
                    <Flex color={fontColor} justifyContent="space-between" borderBottom={index < 2 ? '1px solid' : ''} padding={index < 2 ? '0 0 8px' : '0'} borderColor={borderColor}>
                      <Flex gridGap="10px">
                        <Icon icon={icon[item]} width="23px" height="23px" color={hexColor.disabledColor} />
                        <Text size="14px" color={hexColor.fontColor3} fontWeight={700} lineHeight="normal">
                          {t(item)}
                        </Text>
                      </Flex>
                      <Text size="14px">
                        {assetCountByType[item]}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            )}
          />
        </Flex>
      </GridContainer>
      <GridContainer maxWidth="1280px" padding="0 10px" gridTemplateColumns="repeat(12, 1fr)" childrenStyle={{ display: 'flex', flexDirection: 'column', gridGap: '100px' }} withContainer gridColumn="1 / span 12">
        <Flex flexDirection="column">
          <OneColumnWithIcon
            title={t('rigobot.title')}
            icon=""
            handleButton={() => {
              window.open(`https://github.com/codespaces/new/?repo=${t('rigobot.link').replace('https://github.com/', '')}`, '_blank').focus();
            }}
            buttonText={t('rigobot.button')}
          >
            <Text size="14px" color="currentColor">
              {t('rigobot.description')}
            </Text>
          </OneColumnWithIcon>
        </Flex>
        {courseContentList?.length > 0 && (
          <Flex flexDirection="column" gridColumn="2 / span 12">
            {/* CourseContent comopnent */}
            {cohortData?.cohortSyllabus?.syllabus && (
              <CourseContent data={courseContentList} assetCount={assetCount} />
            )}
          </Flex>
        )}
        <Flex flexDirection="column" gridGap="16px">
          <Heading size="24px" lineHeight="normal" textAlign="center">
            {t('build-connector.what-you-will')}
            {' '}
            <Box as="span" color="blue.default">
              {t('build-connector.build')}
            </Box>
          </Heading>
          <Text size="18px" textAlign="center">
            {t('build-connector.description')}
          </Text>
          <Flex flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '10px', md: '32px' }} mt="16px">
            {assignmentList?.length > 0 && assignmentList.slice(0, 3).map((item) => {
              const taskTranslations = lang === 'en' ? item?.translations?.us : (item?.translations?.[lang] || {});
              const pathConnector = {
                project: `${lang === 'en' ? '/interactive-coding-tutorial' : `/${lang}/interactive-coding-tutorial`}`,
                exercise: `${lang === 'en' ? '/interactive-exercise' : `/${lang}/interactive-exercise`}`,
              };
              const link = `${pathConnector[item?.asset_type?.toLowerCase()]}/${taskTranslations}`;

              return (
                <Flex flexDirection="column" gridGap="17px" padding="16px" minHeight="128px" flex={{ base: 1, md: 0.33 }} borderRadius="10px" border="1px solid" borderColor={borderColor}>
                  <Flex alignItems="center" justifyContent="space-between">
                    {item?.technologies?.length > 0 && (
                      <TagCapsule tags={item?.technologies.slice(0, 3)} marginY={0} />
                    )}
                  </Flex>
                  <Link href={link} display="flex" fontSize="18px" fontWeight={700} lineHeight="normal" color="currentColor" alignItems="center" gridGap="20px" justifyContent="space-between">
                    {(lang === 'en' && item?.translations?.us?.title)
                    || item?.translations?.[lang]?.title
                    || item?.title}
                    <Icon icon="arrowRight" width="10px" height="16px" color="currentColor" />
                  </Link>
                </Flex>
              );
            })}
          </Flex>
        </Flex>
      </GridContainer>
      {/* Features section */}
      <Box background={hexColor.featuredColor2} mt="6.25rem">
        <GridContainer
          maxWidth="1280px"
          width="100%"
          gridTemplateColumns="repeat(12, 1fr)"
        >
          <Flex padding="40px 10px" gridColumn="1 / span 12" flexDirection="column" gridGap="64px">
            <Flex flexDirection="column" gridGap="4rem">
              <Flex flexDirection="column" gridGap="1rem">
                <Heading size="24px" textAlign="center">
                  {t('why-learn-4geeks-connector.why-learn-with')}
                  {' '}
                  <Box as="span" color="blue.default">4Geeks</Box>
                  ?
                </Heading>
                <Text size="18px" textAlign="center" style={{ textWrap: 'balance' }}>
                  {t('why-learn-4geeks-connector.benefits-connector')}
                </Text>
              </Flex>
              <Flex gridGap="2rem" flexDirection={{ base: 'column', md: 'row' }}>
                {features?.list?.length > 0 && features?.list?.map((item) => (
                  <Flex flex={{ base: 1, md: 0.33 }} flexDirection="column" gridGap="16px" padding="16px" borderRadius="8px" color={fontColor} background={hexColor.featuredColor}>
                    <Flex gridGap="8px" alignItems="center">
                      <Icon icon={item.icon} width="40px" height="35px" color={hexColor.green} />
                      <Heading size="16px" fontWeight={700} color="currentColor" lineHeight="normal">
                        {item?.title}
                      </Heading>
                    </Flex>
                    <Text
                      size="14px"
                      lineHeight="normal"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </Flex>
                ))}
              </Flex>
            </Flex>
            <MktTwoColumnSideImage
              background="transparent"
              imagePosition="right"
              imageUrl="/static/images/github-repo-preview.png"
              title={features?.['what-is-learnpack']?.title}
              description={features?.['what-is-learnpack']?.description}
              informationSize="Medium"
              buttonUrl={features?.['what-is-learnpack']?.link}
              buttonLabel={features?.['what-is-learnpack']?.button}
              textSideProps={{
                padding: '24px 0px',
              }}
              imageSideProps={{
                borderRadius: '11px',
              }}
              containerProps={{
                padding: '0px',
                marginTop: '0px',
                gridGap: '32px',
                alignItems: 'start',
              }}
            />
          </Flex>
        </GridContainer>
      </Box>

      <MktTwoColumnSideImage
        mt="6.25rem"
        imageUrl={t('certificate.image')}
        title={t('certificate.title')}
        description={t('certificate.description')}
        informationSize="Medium"
        buttonUrl={t('certificate.button-link')}
        buttonLabel={t('certificate.button')}
        containerProps={{
          padding: '0px',
          marginTop: '0px',
          gridGap: '32px',
          alignItems: 'start',
        }}
      />

      <MktTwoColumnSideImage
        mt="6.25rem"
        imageUrl={t('job-section.image')}
        title={t('job-section.title')}
        subTitle={t('job-section.subtitle')}
        description={t('job-section.description')}
        informationSize="Medium"
        buttonUrl={t('job-section.button-link')}
        buttonLabel={t('job-section.button')}
        imagePosition='right'
        textBackgroundColor='#EEF9FE'
        titleColor='#0097CF'
        subtitleColor='#01455E'
        containerProps={{
          padding: '0px',
          marginTop: '0px',
          gridGap: '32px',
          alignItems: 'start',
        }}
      />
      {/* Pricing */}
      {data?.plan_slug && (
        <MktShowPrices
          id="pricing"
          mt="6.25rem"
          gridTemplateColumns="repeat(12, 1fr)"
          gridColumn1="1 / span 7"
          gridColumn2="8 / span 5"
          gridGap="3rem"
          title={t('show-prices.title')}
          description={t('show-prices.description')}
          plan={data?.plan_slug}
          cohortId={cohortId}
        />
      )}

      <GridContainer padding="0 10px" maxWidth="1280px" width="100%" mt="6.25rem" withContainer childrenStyle={{ display: 'flex', flexDirection: 'column', gridGap: '100px' }} gridTemplateColumns="repeat(12, 1fr)" gridColumn="1 / 12 span">
        <MktTrustCards
          title={t('why-learn-with-4geeks.title')}
          description={t('why-learn-with-4geeks.description')}
        />
      </GridContainer>
      {/* FAQ section */}
      <Box mt="6.25rem" background={hexColor.lightColor}>
        <GridContainer padding="0 10px" maxWidth="1280px" width="100%" gridTemplateColumns="repeat(12, 1fr)">
          {Array.isArray(faqList) && faqList?.length > 0 && (
            <Faq
              gridColumn="1 / span 12"
              background="transparent"
              headingStyle={{
                margin: '0px',
                fontSize: '38px',
                padding: '0 0 24px',
              }}
              padding="1.5rem 0"
              highlightColor={complementaryBlue}
              acordionContainerStyle={{
                background: hexColor.white2,
                borderRadius: '15px',
              }}
              hideLastBorder
              items={faqList.map((l) => ({
                label: l?.title,
                answer: l?.description,
              }))}
            />
          )}
        </GridContainer>
      </Box>
    </Flex>
  );
}

Page.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array])),
  cohortData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array])),
};

Page.defaultProps = {
  data: {},
  cohortData: {},
};

export default Page;
