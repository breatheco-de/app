/* eslint-disable no-unused-vars */
import axios from 'axios';
import PropTypes from 'prop-types';
import { Box, Button, Flex, Image, SkeletonText } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { parseQuerys } from '../../utils/url';
import { BREATHECODE_HOST, ORIGIN_HOST, WHITE_LABEL_ACADEMY, BASE_COURSE } from '../../utils/variables';
import Icon from '../../components/Icon';
import Text from '../../components/Text';
import GridContainer from '../../components/GridContainer';
import Heading from '../../components/Heading';
import { error } from '../../utils/logging';
import bc from '../../services/breathecode';
import { generateCohortSyllabusModules } from '../../handlers/cohorts';
import { adjustNumberBeetwenMinMax, capitalizeFirstLetter, cleanObject, setStorageItem, isWindow, getBrowserInfo, getQueryString } from '../../utils';
import useStyle from '../../hooks/useStyle';
import useRigo from '../../hooks/useRigo';
import OneColumnWithIcon from '../../components/OneColumnWithIcon';
import CourseContent from '../../components/CourseContent';
import ShowOnSignUp from '../../components/ShowOnSignup';
import ReactPlayerV2 from '../../components/ReactPlayerV2';
import Instructors from '../../components/Instructors';
import Faq from '../../components/Faq';
import FixedBottomCta from '../../components/Assets/FixedBottomCta';
import MktTrustCards from '../../components/MktTrustCards';
import MktShowPrices from '../../components/MktShowPrices';
import NextChakraLink from '../../components/NextChakraLink';
import useAuth from '../../hooks/useAuth';
import useSignup from '../../store/actions/signupAction';
import { SUBS_STATUS, fetchSuggestedPlan, getAllMySubscriptions, getTranslations } from '../../handlers/subscriptions';
import axiosInstance from '../../axios';
import useCohortHandler from '../../hooks/useCohortHandler';
import { reportDatalayer } from '../../utils/requests';
import MktTwoColumnSideImage from '../../components/MktTwoColumnSideImage';
import { AvatarSkeletonWrapped } from '../../components/Skeleton';
import { usePersistentBySession } from '../../hooks/usePersistent';
import CouponTopBar from '../../components/CouponTopBar';
import completions from './completion-jobs.json';
import Rating from '../../components/Rating';
import SimpleModal from '../../components/SimpleModal';
import CustomCarousel from '../../components/CustomCarousel';
import useCustomToast from '../../hooks/useCustomToast';
import { usePlanPrice } from '../../utils/getPriceWithDiscount';

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
  const { state, getPriceWithDiscount, getSelfAppliedCoupon, applyDiscountCouponsToPlans } = useSignup();
  const [coupon] = usePersistentBySession('coupon', '');
  const { selfAppliedCoupon } = state;
  const showBottomCTA = useRef(null);
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const { isAuthenticated, user, logout, cohorts } = useAuth();
  const { hexColor, backgroundColor, fontColor, borderColor, complementaryBlue, featuredColor, backgroundColor7, backgroundColor8 } = useStyle();
  const { isRigoInitialized, rigo } = useRigo();
  const { setCohortSession } = useCohortHandler();
  const { createToast } = useCustomToast({ toastId: 'choose-program-pricing-detail' });
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
  const [showModal, setShowModal] = useState(false);
  const { t, lang } = useTranslation('course');
  const router = useRouter();
  const translationsObj = getTranslations(t);
  const limitViewStudents = 3;
  const cohortId = data?.cohort?.id;
  const isVisibilityPublic = data.visibility === 'PUBLIC';
  const courseColor = data?.color;

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

  const reviewsData = t('course:reviews', {}, { returnObjects: true });
  const reviewsForCurrentCourse = reviewsData[data?.slug] || reviewsData[data?.plan_slug];

  const enrollQuerys = payableList?.length > 0 ? parseQuerys({
    plan: featuredPlanToEnroll?.plan_slug,
    has_available_cohorts: planData?.has_available_cohorts,
    cohort: cohortId,
    coupon: getQueryString('coupon'),
  }) : `?plan=${data?.plan_slug}&cohort=${cohortId}`;

  const planPriceFormatter = usePlanPrice();
  const featurePrice = planPriceFormatter(featuredPlanToEnroll, planList, allDiscounts).toLocaleLowerCase();

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

      const plans = applyDiscountCouponsToPlans(planData.planList, selfAppliedCoupon);
      const { discount } = getPriceWithDiscount(0, selfAppliedCoupon);

      const plansContext = plans.map((plan) => `
        - ${plan.title}
        price: ${plan.priceText}
        period: ${plan.period_label}
        ${plan.lastPrice ? `original price: ${plan.lastPrice}\n discount: ${discount}\n` : ''}
      `);
      const syllabusContext = syllabus?.json
        ? syllabus.json.days
          .map(({ label, description }) => `- Title: ${typeof label === 'object' ? (label[lang] || label.us) : label}, Description: ${typeof description === 'object' ? (description[lang] || description.us) : description}`)
        : '';

      let context = `
        description: ${data.course_translation?.description}
        ${syllabusContext ? `Modules: ${syllabusContext}` : ''}
        plans: ${plansContext}
        payment-methods: ${getAlternativeTranslation('rigobot.payment-methods')},
      `;

      if (selfAppliedCoupon) {
        context += `\n coupon: ${discount} off`;
      }

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
    const checkCtaVisibility = () => {
      if (showBottomCTA.current) {
        const { scrollY } = window;
        const top = getElementTopOffset(showBottomCTA.current);
        setIsCtaVisible(top - scrollY > 700);
      }
    };

    checkCtaVisibility();

    const handleScroll = () => {
      checkCtaVisibility();
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const joinCohort = () => {
    if (isAuthenticated && existsRelatedSubscription) {
      reportDatalayer({
        dataLayer: {
          event: 'join_cohort',
          cohort_id: cohortId,
          agent: getBrowserInfo(),
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
            createToast({
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
            createToast({
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
    axiosInstance.defaults.headers.common.Academy = cohort.academy.id;

    const joinedCohort = cohorts.find(({ slug }) => slug === cohort?.slug);
    setCohortSession({
      ...joinedCohort,
    });
    router.push(joinedCohort.selectedProgramSlug);
  };

  const redirectToCohortIfItsReady = ({ withAlert = true, callback = () => { } } = {}) => {
    const alreadyHaveThisCohort = cohorts?.some((cohort) => cohort?.id === cohortId);

    if (alreadyHaveThisCohort) {
      callback();

      setIsFetching(false);
      if (withAlert) {
        createToast({
          position: 'top',
          title: t('dashboard:already-have-this-cohort'),
          status: 'success',
          duration: 5000,
        });
      }
      redirectTocohort();
    }
  };

  const assetCount = cohortData?.modulesInfo?.count;
  const assignmentList = cohortData?.modulesInfo?.assignmentList;
  const studentsImages = t(`students-course-images.${data?.slug}`, {}, { returnObjects: true });
  const benefitsBullets = t('course-default-bullets', {}, { returnObjects: true });

  const getInitialData = async () => {
    setInitialDataIsFetching(true);
    const cohortSyllabus = await generateCohortSyllabusModules(cohortId);

    const getModulesInfo = async () => {
      try {
        const assetTypeCount = { lesson: 0, project: 0, quiz: 0, exercise: 0 };
        const projects = [];
        const exercises = [];
        const featuredAssetSlugs = data?.course_translation?.featured_assets?.split(',') || [];
        const language = lang === 'en' ? 'us' : lang;

        cohortSyllabus?.syllabus?.modules?.forEach((module) => {
          module?.content.forEach((task) => {
            if (task?.task_type) {
              const taskType = task.task_type.toLowerCase();
              assetTypeCount[taskType] += 1;
              if (taskType === 'project') projects.push(task);
              if (taskType === 'exercise') exercises.push(task);
            }
          });
        });

        const filterAssets = (assets, isFeatured) => assets.filter((asset) => {
          const assetSlug = asset?.translations?.[language]?.slug || asset?.slug;
          return isFeatured ? featuredAssetSlugs.includes(assetSlug) : !featuredAssetSlugs.includes(assetSlug);
        });

        let combinedFeaturedAssets = [
          ...filterAssets(projects, true),
          ...filterAssets(exercises, true),
        ];

        if (combinedFeaturedAssets.length < 3) {
          const remainingNeeded = 3 - combinedFeaturedAssets.length;
          const additionalItems = [
            ...filterAssets(projects, false),
            ...filterAssets(exercises, false),
          ].slice(-remainingNeeded);

          combinedFeaturedAssets = [...combinedFeaturedAssets, ...additionalItems];
        }

        const assignmentsFetch = await Promise.all(
          combinedFeaturedAssets.map((item) => bc.get(`${BREATHECODE_HOST}/v1/registry/asset/${item?.translations?.[language]?.slug || item?.slug}`)
            .then((assignmentResp) => assignmentResp.json())
            .catch(() => [])),
        );

        return {
          count: assetTypeCount,
          assignmentList: assignmentsFetch.filter(Boolean),
        };
      } catch (errorMsg) {
        error('Error fetching module info:', errorMsg);
        return { count: {}, assignmentList: [] };
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

    await getSelfAppliedCoupon(formatedPlanData.plans?.suggested_plan?.slug || formatedPlanData.plans?.original_plan?.slug);
    const couponOnQuery = await getQueryString('coupon');
    const { data: allCouponsApplied } = await bc.payment({ coupons: [couponOnQuery || coupon], plan: formatedPlanData.plans?.suggested_plan?.slug || formatedPlanData.plans?.original_plan?.slug }).verifyCoupon();
    setAllDiscounts(allCouponsApplied);

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
      certificate: module.certificate,
      time: module.time,
      exercises: module.exercises,
      projects: module.projects,
      readings: module.readings,
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

  const adjustFontSizeForMobile = (html) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return html?.replace(/font-size:\s*\d+px;?/gi, 'font-size: 36px;');
    }
    return html;
  };

  const imageSource = Array.isArray(studentsImages) && studentsImages.length > 0
    ? studentsImages.slice(0, limitViewStudents)
    : students.slice(0, limitViewStudents).map((student) => {
      const existsAvatar = student.user.profile?.avatar_url;
      const avatarNumber = adjustNumberBeetwenMinMax({
        number: student.user?.id,
        min: 1,
        max: 20,
      });
      return existsAvatar || `${BREATHECODE_HOST}/static/img/avatar-${avatarNumber}.png`;
    });

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
        isFetching={initialDataIsFetching}
        isCtaVisible={isCtaVisible}
        financingAvailable={planData?.financingOptions?.length > 0}
        videoUrl={data?.course_translation?.video_url}
        onClick={goToFinancingOptions}
        course={data}
        paymentOptions={planData?.paymentOptions}
        couponApplied={selfAppliedCoupon}
        width="calc(100vw - 15px)"
        left="7.5px"
        zIndex={1100}
      />
      <CouponTopBar display={{ base: 'none', md: 'block' }} />
      <Flex flexDirection="column" background={backgroundColor7}>
        <GridContainer maxWidth="1280px" gridTemplateColumns="repeat(12, 1fr)" gridGap="36px" padding="8px 10px 50px 10px" mt="17px">
          <Flex flexDirection="column" gridColumn="1 / span 8" gridGap="24px">
            {/* Title */}
            <Flex flexDirection="column" gridGap="16px">
              <Flex as="h1" gridGap="8px" flexDirection="column" alignItems="start">
                {
                  data?.course_translation?.heading ? (
                    <>
                      <Heading as="span" size={{ base: '33px', md: '45px' }} fontFamily="lato" letterSpacing="0.05em" fontWeight="normal" lineHeight="normal" dangerouslySetInnerHTML={{ __html: adjustFontSizeForMobile(data?.course_translation?.heading) }} />
                    </>
                  ) : (
                    <>
                      <Heading as="span" size={{ base: '38px', md: '40px' }} fontFamily="lato" letterSpacing="0.05em" fontWeight="normal" lineHeight="normal">
                        {!isVisibilityPublic ? getAlternativeTranslation('title-connectors.learning') : getAlternativeTranslation('title-connectors.start')}
                      </Heading>
                      <Heading as="span" color="blue.default2" width="100%" size={{ base: '42px', md: '45px' }} lineHeight="1.1" fontFamily="Space Grotesk Variable" fontWeight={700}>
                        {data?.course_translation?.title}
                      </Heading>
                      <Heading as="span" size={{ base: '38px', md: '40px' }} fontFamily="lato" letterSpacing="0.05em" fontWeight="normal" lineHeight="normal">
                        {!isVisibilityPublic ? getAlternativeTranslation('title-connectors.own-pace') : getAlternativeTranslation('title-connectors.end')}
                      </Heading>
                    </>
                  )
                }
              </Flex>

              {/* Course description */}
              <Flex flexDirection="column" gridGap="16px">
                {data?.course_translation?.short_description && (
                  <Text size="18px" fontWeight={500} color="currentColor" lineHeight="normal">
                    {data?.course_translation?.short_description}
                  </Text>
                )}
              </Flex>
            </Flex>

            {/* Students count */}
            <Flex alignItems="center" gridGap="16px">
              <Flex>
                {initialDataIsFetching ? (
                  <AvatarSkeletonWrapped
                    quantity={3}
                    max={3}
                    margin="0 -21px 0 0 !important"
                    size={{ base: '30px', md: '40px' }}
                  />
                ) : (
                  imageSource.map((imageUrl, index) => (
                    <Image
                      margin={index < limitViewStudents - 1 ? '0 -21px 0 0' : '0'}
                      src={imageUrl}
                      width={{ base: '30px', md: '40px' }}
                      height={{ base: '30px', md: '40px' }}
                      borderRadius="50%"
                      objectFit="cover"
                      alt={`Student image ${index + 1}`}
                    />
                  ))
                )}
              </Flex>
              {initialDataIsFetching
                ? <SkeletonText margin="0 0 0 21px" width="10rem" noOfLines={1} />
                : (
                  <Text size={{ base: '14', md: '16px' }} color="currentColor" fontWeight={400}>
                    {students?.length > limitViewStudents ? t('students-enrolled-count', { count: students.length - limitViewStudents }) : t('students-enrolled')}
                  </Text>
                )}
            </Flex>

            <Flex flexDirection="column" gridGap="24px">
              <Flex flexDirection="column" gridGap="16px">
                {Array.isArray(featuredBullets) && featuredBullets?.length > 0 && featuredBullets.filter((bullet) => isVisibilityPublic || !bullet.hideOnPublic).map((item) => (
                  <Flex key={item.title} gridGap="9px" alignItems="center">
                    <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
                    <Text
                      size={{ base: '14', md: '16px' }}
                      fontWeight={400}
                      color="currentColor"
                      lineHeight="normal"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                  </Flex>
                ))}
              </Flex>

              {reviewsForCurrentCourse && (
                <Rating variant="inline" totalRatings={reviewsForCurrentCourse.total_ratings} rating={reviewsForCurrentCourse.rating} link="#rating-commnets" />
              )}
              <Instructors list={instructors} isLoading={initialDataIsFetching} tryRigobot={() => setShowModal(true)} />

            </Flex>
          </Flex>
          <Flex flexDirection="column" gridColumn="9 / span 4" mt={{ base: '2rem', md: '0' }} ref={showBottomCTA}>
            <ShowOnSignUp
              title={getAlternativeTranslation('sign-up-to-plus')}
              alignSelf="center"
              maxWidth="396px"
              description={isAuthenticated ? getAlternativeTranslation('join-cohort-description') : getAlternativeTranslation('sign-up-to-plus-description')}
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
                  <ReactPlayerV2
                    url={data?.course_translation?.video_url}
                    withThumbnail
                    withModal
                    preview
                    previewDuration={10}
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
                          height="auto"
                          id="bootcamp-enroll-button"
                          variant="default"
                          isLoading={initialDataIsFetching || (planList?.length === 0 && !featuredPlanToEnroll?.price)}
                          background={courseColor || 'green.500'}
                          display="flex"
                          flexDirection="column"
                          color="white"
                          width="100%"
                          whiteSpace="normal"
                          wordWrap="break-word"
                          padding="10px"
                          onClick={() => { router.push(`/checkout${enrollQuerys}`); }}
                        >
                          <Flex flexDirection="column" alignItems="center">
                            <Text fontSize={!featuredPlanToEnroll?.isFreeTier ? '16px' : '14px'}>
                              {allDiscounts.length > 0 && '🔥'}
                              {capitalizeFirstLetter(featurePrice)}
                            </Text>
                            {!featuredPlanToEnroll?.isFreeTier && (
                              <Flex alignItems="center" marginTop="5px" gap="5px" justifyContent="center">
                                <Icon icon="shield" color="#ffffff" secondColor={courseColor || '#00b765'} width="23px" />
                                <Text fontSize="13px" fontWeight="medium" paddingTop="2px">
                                  {t('common:money-back-guarantee-short')}
                                </Text>
                              </Flex>
                            )}
                          </Flex>
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
              handleButton={() => setShowModal(true)}
              buttonText={getAlternativeTranslation('rigobot.button')}
              buttonProps={{ id: 'try-rigobot' }}
              titleStyles={{
                fontSize: '34px',
              }}
            >
              <Text size={{ base: '14px', md: '18px' }} color="currentColor">
                {getAlternativeTranslation('rigobot.description')}
              </Text>
            </OneColumnWithIcon>
          </Flex>
          {courseContentList?.length > 0 && (
            <Flex flexDirection="column" gridColumn="2 / span 12">
              {/* CourseContent comopnent */}
              {cohortData?.cohortSyllabus?.syllabus && (
                <CourseContent
                  data={courseContentList}
                  assetCount={assetCount}
                  backgroundColor={backgroundColor}
                  titleStyle={{ textTransform: 'capitalize', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Space Grotesk Variable' }}
                  featuresStyle={{ background: backgroundColor8, padding: '4px', borderRadius: '4px' }}
                  border="none"
                  expanderText={t('navbar:course-details')}
                  allowToggle
                />
              )}
            </Flex>
          )}
          <Flex flexDirection="column" gridGap="16px">
            <Heading size={{ base: '24px', md: '34px' }} lineHeight="normal" textAlign="center">
              {getAlternativeTranslation('build-connector.what-you-will')}
              {' '}
              <Box as="span" color="blue.default2">
                {getAlternativeTranslation('build-connector.build')}
              </Box>
            </Heading>
            <Text size="18px" textAlign="center">
              {getAlternativeTranslation('build-connector.description')}
            </Text>
            {assignmentList?.length > 0 && (
              <CustomCarousel assignmentList={assignmentList} />
            )}
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
                  <Heading size={{ base: '24px', md: '34px' }} textAlign="center">
                    {getAlternativeTranslation('why-learn-4geeks-connector.why-learn-with')}
                    {' '}
                    <Box as="span" color="blue.default2">4Geeks</Box>
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
                videoUrl="https://storage.googleapis.com/breathecode/videos/landing-pages/learnpack-demo.mp4"
                title={features?.['what-is-learnpack']?.title}
                description={features?.['what-is-learnpack']?.description}
                informationSize="Medium"
                buttonUrl={features?.['what-is-learnpack']?.link}
                buttonLabel={features?.['what-is-learnpack']?.button}
                customTitleSize={{ base: '24px', md: '34px' }}
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
          background="transparent"
          customTitleSize={{ base: '24px', md: '34px' }}
          containerProps={{
            padding: '0px',
            marginTop: '0px',
            gridGap: '32px',
            alignItems: 'start',
          }}
        />

        <GridContainer padding="0 10px" maxWidth="1280px" width="100%" mt="6.25rem" withContainer childrenStyle={{ display: 'flex', flexDirection: 'column', gridGap: '100px' }} gridTemplateColumns="repeat(12, 1fr)" gridColumn="1 / 12 span">
          <MktTrustCards
            title={getAlternativeTranslation('why-learn-with-4geeks.title')}
            description={getAlternativeTranslation('why-learn-with-4geeks.description')}
            cardStyles={{
              border: 'none',
            }}
          />
        </GridContainer>

        <MktTwoColumnSideImage
          mt="6.25rem"
          customTitleSize={{ base: '24px', md: '34px' }}
          imageUrl={getAlternativeTranslation('job-section.image')}
          title={getAlternativeTranslation('job-section.title')}
          subTitle={getAlternativeTranslation('job-section.subtitle')}
          description={getAlternativeTranslation('job-section.description')}
          informationSize="Medium"
          buttonUrl={getAlternativeTranslation('job-section.button-link')}
          buttonLabel={getAlternativeTranslation('job-section.button')}
          imagePosition="right"
          titleColor="#0097CF"
          subtitleColor="#01455E"
          background="transparent"
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
            externalPlanProps={planData}
            externalSelection={financeSelected}
            title={getAlternativeTranslation('show-prices.title')}
            description={getAlternativeTranslation('show-prices.description')}
            plan={data?.plan_slug}
            cohortId={cohortId}
            pricingMktInfo={benefitsBullets}
            padding={{ base: '10px', md: '0px' }}
            margin="0px auto"
            mt="50px"
          />
        )}

        {featuredPlanToEnroll?.type !== 'FREE' && (
          <MktTwoColumnSideImage
            mt="6.25rem"
            imageUrl={getAlternativeTranslation('havent-decided.image')}
            miniTitle={getAlternativeTranslation('havent-decided.mini-title')}
            title={getAlternativeTranslation('havent-decided.title')}
            description={getAlternativeTranslation('havent-decided.description')}
            informationSize="Medium"
            buttonUrl={BASE_COURSE ? `/${lang}/bootcamp/${BASE_COURSE}` : `/${lang}/bootcamp/coding-introduction`}
            buttonLabel={getAlternativeTranslation('havent-decided.button')}
            background="transparent"
            textBackgroundColor="#E1F5FF"
            imagePosition="right"
            titleColor="blue.default2"
            textSideProps={{
              flex: 2,
            }}
            imageSideProps={{
              width: '273px',
              margin: '0',
            }}
            containerProps={{
              padding: '0px',
              marginTop: '0px',
              gridGap: '32px',
              alignItems: 'start',
            }}
          />
        )}
        {reviewsForCurrentCourse && (
          <GridContainer padding="0 10px" maxWidth="1280px" width="100%" gridTemplateColumns="repeat(1, 1fr)">
            <Rating
              totalRatings={reviewsForCurrentCourse.total_ratings}
              totalReviews={reviewsForCurrentCourse.reviews_numbers}
              rating={reviewsForCurrentCourse.rating}
              id="rating-commnets"
              marginTop="40px"
              reviews={reviewsForCurrentCourse.reviews}
              cardStyles={{
                border: 'none',
              }}
            />
          </GridContainer>
        )}
        {/* FAQ section */}
        <Box mt="6.25rem">
          <GridContainer padding="0 10px" maxWidth="1280px" width="100%" gridTemplateColumns="repeat(12, 1fr)">
            {Array.isArray(faqList) && faqList?.length > 0 && (
              <Faq
                width="100%"
                gridColumn="1 / span 12"
                headingStyle={{
                  margin: '0px',
                  fontSize: '38px',
                  padding: '0 0 24px',
                }}
                padding="1.5rem"
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
      <SimpleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        style={{ marginTop: '10vh' }}
        maxWidth="45rem"
        borderRadius="13px"
        headerStyles={{ textAlign: 'center' }}
        title={t('rigobot.title')}
        bodyStyles={{ padding: 0 }}
        closeOnOverlayClick={false}
      >
        <Box padding="0 15px 15px">
          <ReactPlayerV2
            url={getAlternativeTranslation('rigobot.video_url')}
            width="100%"
            height="100%"
            iframeStyle={{ borderRadius: '3px 3px 13px 13px' }}
            autoPlay
          />
        </Box>
      </SimpleModal>
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
