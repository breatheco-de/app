/* eslint-disable no-unused-vars */
import axios from 'axios';
import PropTypes from 'prop-types';
import { Box, Button, Flex, Image, Link, SkeletonText, useToast } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { parseQuerys } from '../../utils/url';
import { BREATHECODE_HOST, ORIGIN_HOST, WHITE_LABEL_ACADEMY } from '../../utils/variables';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import GridContainer from '../../common/components/GridContainer';
import Heading from '../../common/components/Heading';
import { error } from '../../utils/logging';
import bc from '../../common/services/breathecode';
import { generateCohortSyllabusModules } from '../../common/handlers/cohorts';
import { adjustNumberBeetwenMinMax, capitalizeFirstLetter, cleanObject, setStorageItem, isWindow } from '../../utils';
import useStyle from '../../common/hooks/useStyle';
import useRigo from '../../common/hooks/useRigo';
import Timer from '../../common/components/Timer';
import OneColumnWithIcon from '../../common/components/OneColumnWithIcon';
import CourseContent from '../../common/components/CourseContent';
import ShowOnSignUp from '../../common/components/ShowOnSignup';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import Instructors from '../../common/components/Instructors';
import Faq from '../../common/components/Faq';
import FixedBottomCta from '../../js_modules/projects/FixedBottomCta';
import TagCapsule from '../../common/components/TagCapsule';
import MktTrustCards from '../../common/components/MktTrustCards';
import MktShowPrices from '../../common/components/MktShowPrices';
import NextChakraLink from '../../common/components/NextChakraLink';
import useAuth from '../../common/hooks/useAuth';
import useSignup from '../../common/store/actions/signupAction';
import { SUBS_STATUS, fetchSuggestedPlan, getAllMySubscriptions, getTranslations } from '../../common/handlers/subscriptions';
import axiosInstance from '../../axios';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import { reportDatalayer } from '../../utils/requests';
import MktTwoColumnSideImage from '../../common/components/MktTwoColumnSideImage';
import { AvatarSkeletonWrapped } from '../../common/components/Skeleton';
import CouponTopBar from '../../common/components/CouponTopBar';
import completions from './completion-jobs.json';

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
export async function getStaticProps({ locale, locales, params }) {
  const { course_slug: courseSlug } = params;

  const endpoint = `/v1/marketing/course/${courseSlug}?lang=${locale}`;
  const resp = await axios.get(`${BREATHECODE_HOST}${endpoint}`);
  const data = resp?.data;

  if (resp?.status >= 400) {
    console.error(`ERROR with /bootcamp/course/${courseSlug}: something went wrong fetching "${endpoint}"`);
    return {
      notFound: true,
    };
  }

  const syllabusSlug = data.syllabus[0]?.slug;

  const respSyll = await axios.get(`${BREATHECODE_HOST}/v1/admissions/syllabus/version?slug=${syllabusSlug}`);
  const syllabus = respSyll?.data[0];

  return {
    props: {
      seo: {
        title: data.course_translation.title,
        description: data.course_translation.description,
        image: `${ORIGIN_HOST}/static/images/4geeks.png`,
        locales,
        locale,
        disableStaticCanonical: true,
        disableHreflangs: true,
        url: `/bootcamp/${data.slug}`,
        pathConnector: '/bootcamp',
        card: 'default',
      },
      data,
      syllabus,
    },
  };
}

function CoursePage({ data, syllabus }) {
  const { state } = useSignup();
  const { selfAppliedCoupon } = state;
  const showBottomCTA = useRef(null);
  const [isCtaVisible, setIsCtaVisible] = useState(true);
  const { isAuthenticated, user, logout } = useAuth();
  const { hexColor, backgroundColor, fontColor, borderColor, complementaryBlue, featuredColor } = useStyle();
  const { isRigoInitialized, rigo } = useRigo();
  const { setCohortSession } = useCohortHandler();
  const { getSelfAppliedCoupon } = useSignup();
  const toast = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const [readyToRefetch, setReadyToRefetch] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [financeSelected, setFinanceSelected] = useState({
    selectedFinanceIndex: 0,
    selectedIndex: 0,
  });
  const [relatedSubscription, setRelatedSubscription] = useState(null);
  const [cohortData, setCohortData] = useState({});
  const [planData, setPlanData] = useState({});
  const [initialDataIsFetching, setInitialDataIsFetching] = useState(true);
  const { t, lang } = useTranslation('course');
  const router = useRouter();
  const translationsObj = getTranslations(t);
  const limitViewStudents = 3;
  const cohortId = data?.cohort?.id;
  const isVisibilityPublic = data.visibility === 'PUBLIC';

  const structuredData = data?.course_translation ? {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: data.course_translation.title,
    description: data.course_translation.description,
    url: `${ORIGIN_HOST}${lang === 'en' ? '' : lang}/bootcamp/${router.query.courseSlug}`,
    image: `${ORIGIN_HOST}/static/images/4geeks.png`,
    provider: {
      '@type': 'Organization',
      name: '4Geeks Academy',
      sameAs: 'https://www.4geeksacademy.com/',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${ORIGIN_HOST}${lang === 'en' ? '' : lang}/bootcamp/${router.query.courseSlug}`,
    },
  } : {};
  const cleanedStructuredData = cleanObject(structuredData);
  const students = cohortData.students || [];
  const instructors = cohortData.instructors || [];
  const existsRelatedSubscription = relatedSubscription?.status === SUBS_STATUS.ACTIVE;
  const planList = planData?.planList || [];
  const payableList = planList.filter((plan) => plan?.type === 'PAYMENT');
  const freePlan = planList?.find((plan) => plan?.type === 'TRIAL' || plan?.type === 'FREE');
  const featuredPlanToEnroll = freePlan?.plan_slug ? freePlan : payableList?.[0];
  const pathname = router.asPath.split('#')[0];

  const enrollQuerys = payableList?.length > 0 ? parseQuerys({
    plan: featuredPlanToEnroll?.plan_slug,
    plan_id: featuredPlanToEnroll?.plan_id,
    has_available_cohorts: planData?.has_available_cohorts,
    cohort: cohortId,
  }) : `?plan=${data?.plan_slug}&cohort=${cohortId}`;

  const getPlanPrice = () => {
    if (featuredPlanToEnroll?.plan_slug) {
      if (featuredPlanToEnroll.period === 'MONTH') {
        return `${t('signup:info.monthly')} ${featuredPlanToEnroll.priceText}`;
      }
      if (featuredPlanToEnroll.period === 'YEAR') {
        return `${featuredPlanToEnroll.priceText} ${t('signup:info.monthly')}`;
      }
      if (featuredPlanToEnroll.period === 'ONE_TIME') {
        return `${featuredPlanToEnroll.priceText}, ${t('signup:info.one-time-payment')}`;
      }
      if (featuredPlanToEnroll.period === 'FINANCING') {
        return `${featuredPlanToEnroll.priceText} ${t('signup:info.installments')}`;
      }
      if (featuredPlanToEnroll?.type === 'TRIAL') {
        return t('common:start-free-trial');
      }
      if (featuredPlanToEnroll?.type === 'FREE') {
        return t('common:enroll-totally-free');
      }
    }
    if (!featuredPlanToEnroll?.plan_slug && planList[0]?.isFreeTier) {
      if (planList[0]?.type === 'FREE') {
        return t('common:enroll-totally-free');
      }
      if (planList[0]?.type === 'TRIAL') {
        return t('common:start-free-trial');
      }
    }
    return t('common:enroll');
  };

  const featurePrice = getPlanPrice().toLocaleLowerCase();

  const getAlternativeTranslation = (slug, params = {}, options = {}) => {
    const keys = slug.split('.');
    const result = keys.reduce((acc, key) => {
      if (acc && acc[key] !== undefined) return acc[key];
      return null;
    }, data?.course_translation?.landing_variables);

    return result !== null ? result : t(slug, params, options);
  };

  const faqList = getAlternativeTranslation('faq', {}, { returnObjects: true }) || [];
  const features = getAlternativeTranslation('features', {}, { returnObjects: true }) || {};
  const featuredBullets = getAlternativeTranslation('featured-bullets', {}, { returnObjects: true }) || [];

  useEffect(() => {
    if (isRigoInitialized && data.course_translation && !initialDataIsFetching && planData?.slug) {
      // const context = document.body.innerText;
      const plansContext = planData.planList.map((plan) => `
        - ${plan.title}
        price: ${plan.priceText}
        period: ${plan.period_label}
      `);
      const syllabusContext = syllabus?.json
        ? syllabus.json.days
          .map(({ label, description }) => `- Title: ${typeof label === 'object' ? (label[lang] || label.us) : label}, Description: ${typeof description === 'object' ? (description[lang] || description.us) : description}`)
        : '';

      const context = `
        description: ${data.course_translation?.description}
        ${syllabusContext ? `Modules: ${syllabusContext}` : ''}
        plans: ${plansContext}
        payment-methods: ${getAlternativeTranslation('rigobot.payment-methods')},
      `;

      rigo.updateOptions({
        showBubble: false,
        completions,
        context,
      });
    }
  }, [isRigoInitialized, lang, initialDataIsFetching, planData]);

  const getElementTopOffset = (elem) => {
    if (elem && isWindow) {
      const rect = elem.getBoundingClientRect();
      const { scrollY } = window;
      return rect.top + scrollY;
    }
    return 0;
  };

  useEffect(() => {
    if (isWindow) {
      const handleScroll = () => {
        if (showBottomCTA.current) {
          const { scrollY } = window;
          const top = getElementTopOffset(showBottomCTA.current);
          setIsCtaVisible(top - scrollY > 700);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }

    return undefined;
  }, [isWindow]);

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

    axiosInstance.defaults.headers.common.Academy = cohort.academy.id;
    const cohortDashboardLink = `${langLink}/cohort/${cohort?.slug}/${syllabusVersion?.slug}/v${syllabusVersion?.version}`;
    setCohortSession({
      ...cohort,
      selectedProgramSlug: cohortDashboardLink,
    });
    router.push(cohortDashboardLink);
  };
  const redirectToCohortIfItsReady = ({ withAlert = true, callback = () => { } } = {}) => {
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

  const getInitialData = async () => {
    setInitialDataIsFetching(true);
    const cohortSyllabus = await generateCohortSyllabusModules(cohortId);
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
        const language = lang === 'en' ? 'us' : lang;
        const assignmentsFetch = relatedAssetsToShow?.length > 0 ? await Promise.all(relatedAssetsToShow.map((item) => bc.get(`${BREATHECODE_HOST}/v1/registry/asset/${item?.translations?.[language]?.slug || item?.slug}`)
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
    const formatedPlanData = await fetchSuggestedPlan(data?.plan_slug, translationsObj, 'mkt_plans').then((finalData) => finalData);

    const modulesInfo = await getModulesInfo();

    const studentList = await bc.public({ roles: 'STUDENT' }, true).syllabusMembers(cohortSyllabus.syllabus?.slug)
      .then((respMembers) => respMembers.data)
      .catch((err) => {
        error('Error fetching cohort users:', err);
        return [];
      });
    const uniqueStudents = studentList?.length > 0 ? studentList?.filter((student, index, self) => self.findIndex((l) => (
      l.user.id === student.user.id
    )) === index) : [];

    const instructorsList = await bc.cohort({
      roles: 'TEACHER,ASSISTANT',
      cohort_id: cohortId,
    }).getPublicMembers()
      .then((respMembers) => respMembers.data);
    const uniqueInstructors = instructorsList?.length > 0 ? instructorsList?.filter((instructor, index, self) => self.findIndex((l) => (
      l.user.id === instructor.user.id
    )) === index) : [];

    await getSelfAppliedCoupon(formatedPlanData.plans?.suggested_plan?.slug);

    setCohortData({
      cohortSyllabus,
      students: uniqueStudents,
      instructors: uniqueInstructors,
      modulesInfo,
    });
    setPlanData(formatedPlanData);
    setInitialDataIsFetching(false);
  };

  useEffect(() => {
    getInitialData();
  }, [lang, pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      getAllMySubscriptions().then((subscriptions) => {
        const subscriptionRelatedToThisCohort = subscriptions?.length > 0 ? subscriptions?.find((sbs) => {
          const isRelated = sbs?.selected_cohort_set?.cohorts.some((elmnt) => elmnt?.id === cohortId);
          return isRelated;
        }) : null;

        setRelatedSubscription(subscriptionRelatedToThisCohort);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && cohortData?.cohortSyllabus?.cohort?.id) redirectToCohortIfItsReady();
  }, [isAuthenticated, cohortData]);

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

  const randomMultiplier = Math.floor(Math.random() * 2) + 20;

  const assetCountByType = {
    lesson: assetCount?.lesson || 0,
    exercise: assetCount?.exercise ? assetCount.exercise * randomMultiplier : 0,
    project: assetCount?.project || 0,
  };

  const courseContentList = data?.course_translation?.course_modules?.length > 0
    ? data?.course_translation?.course_modules.map((module) => ({
      title: module.name,
      description: module.description,
    })) : [];

  const tryRigobot = (targetId) => {
    rigo.updateOptions({
      showBubble: true,
      target: targetId,
      highlight: true,
      welcomeMessage: getAlternativeTranslation('rigobot.message', { title: data?.course_translation?.title }),
      collapsed: false,
      purposeSlug: '4geekscom-public-agent',
    });
  };

  const goToFinancingOptions = () => {
    router.push('#pricing');
    setFinanceSelected({
      selectedFinanceIndex: 1,
      selectedIndex: 0,
    });
  };

  return (
    <>
      {cleanedStructuredData?.name && (
        <Head>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedStructuredData) }}
          />
        </Head>
      )}
      <FixedBottomCta
        isCtaVisible={isCtaVisible}
        financingAvailable={planData?.financingOptions?.length > 0}
        videoUrl={data?.course_translation?.video_url}
        onClick={goToFinancingOptions}
        course={data}
        couponApplied={selfAppliedCoupon}
        width="calc(100vw - 15px)"
        left="7.5px"
      />
      <CouponTopBar />
      <Flex flexDirection="column" mt="2rem">
        <GridContainer maxWidth="1280px" gridTemplateColumns="repeat(12, 1fr)" gridGap="36px" padding="8px 10px 50px 10px" mt="17px">
          <Flex flexDirection="column" gridColumn="1 / span 8" gridGap="24px">
            {/* Title */}
            <Flex flexDirection="column" gridGap="16px">
              <Flex as="h1" gridGap="8px" flexDirection="column" alignItems="start">
                {
                  data?.course_translation?.heading ? (
                    <Heading as="span" size={{ base: '38px', md: '46px' }} fontFamily="lato" letterSpacing="0.05em" fontWeight="normal" lineHeight="normal" dangerouslySetInnerHTML={{ __html: data?.course_translation?.heading }} />
                  ) : (
                    <>
                      <Heading as="span" size={{ base: '38px', md: '46px' }} fontFamily="lato" letterSpacing="0.05em" fontWeight="normal" lineHeight="normal">
                        {!isVisibilityPublic ? getAlternativeTranslation('title-connectors.learning') : getAlternativeTranslation('title-connectors.start')}
                      </Heading>
                      <Heading as="span" color="blue.default" width="100%" size={{ base: '42px', md: '64px' }} lineHeight="1.1" fontFamily="Space Grotesk Variable" fontWeight={700}>
                        {data?.course_translation?.title}
                      </Heading>
                      <Heading as="span" size={{ base: '38px', md: '46px' }} fontFamily="lato" letterSpacing="0.05em" fontWeight="normal" lineHeight="normal">
                        {!isVisibilityPublic ? getAlternativeTranslation('title-connectors.own-pace') : getAlternativeTranslation('title-connectors.end')}
                      </Heading>
                    </>
                  )
                }
              </Flex>
            </Flex>

            {/* Students count */}
            <Flex alignItems="center" gridGap="16px">
              <Flex>
                {initialDataIsFetching
                  ? (
                    <AvatarSkeletonWrapped
                      quantity={3}
                      max={3}
                      margin="0 -21px 0 0 !important"
                      size="40px"
                    />
                  )
                  : students.slice(0, limitViewStudents).map((student, index) => {
                    const existsAvatar = student.user.profile?.avatar_url;
                    const avatarNumber = adjustNumberBeetwenMinMax({
                      number: student.user?.id,
                      min: 1,
                      max: 20,
                    });
                    return (
                      <Image
                        key={student.user?.profile?.full_name}
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
              {initialDataIsFetching
                ? <SkeletonText margin="0 0 0 21px" width="10rem" noOfLines={1} />
                : (

                  <Text size="16px" color="currentColor" fontWeight={400}>
                    {students.length > limitViewStudents ? t('students-enrolled-count', { count: students.length - limitViewStudents }) : ''}
                  </Text>
                )}
            </Flex>

            <Flex flexDirection="column" gridGap="24px">
              <Flex flexDirection="column" gridGap="16px">
                {Array.isArray(featuredBullets) && featuredBullets?.length > 0 && featuredBullets.filter((bullet) => isVisibilityPublic || !bullet.hideOnPublic).map((item) => (
                  <Flex key={item.title} gridGap="9px" alignItems="center">
                    <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
                    <Text
                      size="16px"
                      fontWeight={400}
                      color="currentColor"
                      lineHeight="normal"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                  </Flex>
                ))}
              </Flex>

              <Instructors list={instructors} isLoading={initialDataIsFetching} tryRigobot={() => tryRigobot('#ai-tutor')} />

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
          <Flex flexDirection="column" gridColumn="9 / span 4" mt={{ base: '2rem', md: '0' }} ref={showBottomCTA}>
            <ShowOnSignUp
              title={getAlternativeTranslation('join-cohort')}
              maxWidth="396px"
              description={isAuthenticated ? getAlternativeTranslation('join-cohort-description') : getAlternativeTranslation('create-account-text')}
              borderColor={data.color || 'green.400'}
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
                  {/* <Image src={data?.icon_url} top="-1.5rem" left="-1.5rem" width="64px" height="64px" objectFit="cover" position="absolute" /> */}
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
                        {getAlternativeTranslation('join-cohort')}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          isLoading={initialDataIsFetching || (planList?.length === 0 && !featuredPlanToEnroll?.price)}
                          background="green.400"
                          color="white"
                          onClick={() => {
                            router.push(`/checkout${enrollQuerys}`);
                          }}
                        >
                          {!featuredPlanToEnroll?.isFreeTier
                            ? `${getAlternativeTranslation('common:enroll-for-connector')} ${featurePrice}`
                            : capitalizeFirstLetter(featurePrice)}
                        </Button>
                        {payableList?.length > 0 && (
                          <Button
                            variant="outline"
                            color="green.400"
                            isLoading={initialDataIsFetching}
                            borderColor="currentColor"
                            onClick={goToFinancingOptions}
                          >
                            {t('common:see-financing-options')}
                          </Button>
                        )}
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
                          <Flex fontSize="13px" backgroundColor={featuredColor} justifyContent="center" alignItems="center" borderRadius="4px" padding="4px 8px" width="100%" margin="0 auto" gridGap="6px">
                            {t('signup:already-have-account')}
                            {' '}
                            <NextChakraLink href="/login" redirectAfterLogin fontSize="13px" variant="default">{t('signup:login-here')}</NextChakraLink>
                          </Flex>
                        )}
                      </>
                    )}
                  </Flex>
                  <Flex flexDirection="column" mt="1rem" gridGap="14px" padding="0 18px 18px">
                    {features?.showOnSignup?.length > 0 && features?.showOnSignup?.map((item, index) => {
                      const lastNumberForBorder = features.showOnSignup.length - 1;
                      return (
                        <Flex key={item.title} color={fontColor} justifyContent="space-between" borderBottom={index < lastNumberForBorder ? '1px solid' : ''} padding={index < lastNumberForBorder ? '0 0 8px' : '0'} borderColor={borderColor}>
                          <Flex gridGap="10px">
                            <Icon icon={item.icon} width="23px" height="23px" color={hexColor.disabledColor} />
                            <Text size="14px" color={hexColor.fontColor3} fontWeight={700} lineHeight="20px">
                              {item.title}
                            </Text>
                          </Flex>
                          {(assetCountByType?.[item?.type] || item?.qty) && (
                            <Text size="14px">
                              {assetCountByType[item?.type] || item?.qty}
                            </Text>
                          )}
                        </Flex>
                      );
                    })}
                  </Flex>
                </Flex>
              )}
            />
          </Flex>
        </GridContainer>
        <GridContainer maxWidth="1280px" padding="0 10px" gridTemplateColumns="repeat(12, 1fr)" childrenStyle={{ display: 'flex', flexDirection: 'column', gridGap: '100px' }} withContainer gridColumn="1 / span 12">
          <Flex flexDirection="column">
            <OneColumnWithIcon
              title={getAlternativeTranslation('rigobot.title')}
              icon=""
              handleButton={() => tryRigobot('#try-rigobot')}
              buttonText={getAlternativeTranslation('rigobot.button')}
              buttonProps={{ id: 'try-rigobot' }}
            >
              <Text size="14px" color="currentColor">
                {getAlternativeTranslation('rigobot.description')}
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
              {getAlternativeTranslation('build-connector.what-you-will')}
              {' '}
              <Box as="span" color="blue.default">
                {getAlternativeTranslation('build-connector.build')}
              </Box>
            </Heading>
            <Text size="18px" textAlign="center">
              {getAlternativeTranslation('build-connector.description')}
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
                  <Flex key={item?.title} flexDirection="column" gridGap="17px" padding="16px" minHeight="128px" flex={{ base: 1, md: 0.33 }} borderRadius="10px" border="1px solid" borderColor={borderColor}>
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
                    {getAlternativeTranslation('why-learn-4geeks-connector.why-learn-with')}
                    {' '}
                    <Box as="span" color="blue.default">4Geeks</Box>
                    ?
                  </Heading>
                  <Text size="18px" margin={{ base: 'auto', md: '0 8vw' }} textAlign="center" style={{ textWrap: 'balance' }}>
                    {getAlternativeTranslation('why-learn-4geeks-connector.benefits-connector')}
                  </Text>
                </Flex>
                <Flex gridGap="2rem" flexDirection={{ base: 'column', md: 'row' }}>
                  {features?.list?.length > 0 && features?.list?.map((item) => (
                    <Flex key={item.title} flex={{ base: 1, md: 0.33 }} flexDirection="column" gridGap="16px" padding="16px" borderRadius="8px" color={fontColor} background={backgroundColor}>
                      <Flex gridGap="8px" alignItems="center">
                        <Icon icon={item.icon} color={hexColor.blueDefault} />
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
          imageUrl={getAlternativeTranslation('certificate.image')}
          title={getAlternativeTranslation('certificate.title')}
          description={getAlternativeTranslation('certificate.description')}
          informationSize="Medium"
          buttonUrl={getAlternativeTranslation('certificate.button-link')}
          buttonLabel={getAlternativeTranslation('certificate.button')}
          containerProps={{
            padding: '0px',
            marginTop: '0px',
            gridGap: '32px',
            alignItems: 'start',
          }}
        />

        <MktTwoColumnSideImage
          mt="6.25rem"
          imageUrl={getAlternativeTranslation('job-section.image')}
          title={getAlternativeTranslation('job-section.title')}
          subTitle={getAlternativeTranslation('job-section.subtitle')}
          description={getAlternativeTranslation('job-section.description')}
          informationSize="Medium"
          buttonUrl={getAlternativeTranslation('job-section.button-link')}
          buttonLabel={getAlternativeTranslation('job-section.button')}
          imagePosition="right"
          textBackgroundColor="#EEF9FE"
          titleColor="#0097CF"
          subtitleColor="#01455E"
          containerProps={{
            padding: '0px',
            marginTop: '0px',
            gridGap: '32px',
            alignItems: 'start',
          }}
          slice={{
            primary: {
              background_in_dark_mode: '#eef9fd',
              font_color: 'black',
              font_color_in_darkmode: 'black',
            },
          }}
        />
        {/* Pricing */}
        {data?.plan_slug && (
          <MktShowPrices
            id="pricing"
            mt="6.25rem"
            externalPlanProps={planData}
            externalSelection={financeSelected}
            gridTemplateColumns="repeat(12, 1fr)"
            gridColumn1="1 / span 7"
            gridColumn2="8 / span 5"
            gridGap="3rem"
            title={getAlternativeTranslation('show-prices.title')}
            description={getAlternativeTranslation('show-prices.description')}
            plan={data?.plan_slug}
            cohortId={cohortId}
          />
        )}

        <GridContainer padding="0 10px" maxWidth="1280px" width="100%" mt="6.25rem" withContainer childrenStyle={{ display: 'flex', flexDirection: 'column', gridGap: '100px' }} gridTemplateColumns="repeat(12, 1fr)" gridColumn="1 / 12 span">
          <MktTrustCards
            title={getAlternativeTranslation('why-learn-with-4geeks.title')}
            description={getAlternativeTranslation('why-learn-with-4geeks.description')}
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
    </>
  );
}

CoursePage.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array])),
  syllabus: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

CoursePage.defaultProps = {
  data: {},
  syllabus: null,
};

export default CoursePage;
