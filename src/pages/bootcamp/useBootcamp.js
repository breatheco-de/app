import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useAuth from '../../hooks/useAuth';
import useSignup from '../../hooks/useSignup';
import useStyle from '../../hooks/useStyle';
import useRigo from '../../hooks/useRigo';
import useCohortHandler from '../../hooks/useCohortHandler';
import useCustomToast from '../../hooks/useCustomToast';
import { usePersistentBySession } from '../../hooks/usePersistent';
import { usePlanPrice } from '../../utils/getPriceWithDiscount';
import useSession from '../../hooks/useSession';
import bc from '../../services/breathecode';
import { generateCohortSyllabusModules } from '../../lib/admissions';
import { adjustNumberBeetwenMinMax, cleanObject, setStorageItem, isWindow, getBrowserInfo, getQueryString } from '../../utils';
import { parseQuerys } from '../../utils/url';
import { BREATHECODE_HOST, ORIGIN_HOST, BASE_COURSE } from '../../utils/variables';
import { SUBS_STATUS, fetchSuggestedPlan, getAllMySubscriptions, getTranslations } from '../../handlers/subscriptions';
import { error } from '../../utils/logging';
import { reportDatalayer } from '../../utils/requests';
import axiosInstance from '../../axios';
import completions from './completion-jobs.json';

export const useBootcamp = () => {
  const { t, lang } = useTranslation('course');
  const { state, getPriceWithDiscount, getSelfAppliedCoupon, applyDiscountCouponsToPlans } = useSignup();
  const [coupon] = usePersistentBySession('coupon', '');
  const [data, setData] = useState({});
  const { selfAppliedCoupon } = state;
  const showBottomCTA = useRef(null);
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const { isAuthenticated, user, logout, cohorts, reSetUserAndCohorts } = useAuth();
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
  const { location, isLoadingLocation } = useSession();
  const router = useRouter();
  const translationsObj = getTranslations(t);
  const limitViewStudents = 3;
  const planPriceFormatter = usePlanPrice();

  const cohortId = data?.cohort?.id;
  const isVisibilityPublic = data.visibility === 'PUBLIC';
  const courseColor = data?.color;
  const { course_slug: courseSlug } = router.query;

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

  const featurePrice = planPriceFormatter(featuredPlanToEnroll, planList, allDiscounts);

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
  const countryCode = location?.countryShort;

  const studentsImages = t(`students-course-images.${data?.slug}`, {}, { returnObjects: true });

  const getElementTopOffset = (elem) => {
    if (elem && isWindow) {
      const rect = elem.getBoundingClientRect();
      const { scrollY } = window;
      return rect.top + scrollY;
    }
    return 0;
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

  const redirectToCohortIfItsReady = async ({ withAlert = true, callback = () => {} } = {}) => {
    await reSetUserAndCohorts();
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
      bc.admissions().joinCohort(cohortId)
        .then(async (resp) => {
          const dataRequested = await resp.data;
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
        .catch((err) => {
          console.log(err);
          setTimeout(() => {
            setIsFetching(false);
          }, 600);
        });
    } else {
      router.push('#pricing');
    }
  };

  const assetCount = cohortData?.modulesInfo?.count;
  const assignmentList = cohortData?.modulesInfo?.assignmentList;
  const benefitsBullets = t('course-default-bullets', {}, { returnObjects: true });

  const getInitialData = async () => {
    setInitialDataIsFetching(true);
    const { data: courseData } = await bc.marketing({ lang, countryCode }).getCourse(courseSlug);
    setData(courseData);

    const cohortSyllabus = await generateCohortSyllabusModules(courseData?.cohort?.id);

    const getModulesInfo = async () => {
      try {
        const assetTypeCount = { lesson: 0, project: 0, quiz: 0, exercise: 0 };
        const projects = [];
        const exercises = [];
        const featuredAssetSlugs = courseData?.course_translation?.featured_assets?.split(',') || [];
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
          ...filterAssets(exercises, true),
          ...filterAssets(projects, true),
        ];

        if (combinedFeaturedAssets.length < 3) {
          const remainingNeeded = 3 - combinedFeaturedAssets.length;
          const additionalItems = [
            ...filterAssets(exercises, false),
            ...filterAssets(projects, false),
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

    const formatedPlanData = await fetchSuggestedPlan(courseData?.plan_slug, translationsObj, 'mkt_plans', countryCode).then((finalData) => finalData);

    const modulesInfo = await getModulesInfo();

    const studentList = await bc.admissions({ roles: 'STUDENT' }).getPublicMembers()
      .then((respMembers) => respMembers.data)
      .catch((err) => {
        error('Error fetching cohort users:', err);
        return [];
      });
    const uniqueStudents = studentList?.length > 0 ? studentList?.filter((student, index, self) => self.findIndex((l) => (
      l.user.id === student.user.id
    )) === index) : [];

    const instructorsList = await bc.admissions({
      roles: 'TEACHER,ASSISTANT',
      cohort_id: courseData?.cohort?.id,
    }).getPublicMembers()
      .then((respMembers) => respMembers.data);
    const uniqueInstructors = instructorsList?.length > 0 ? instructorsList?.filter((instructor, index, self) => self.findIndex((l) => (
      l.user.id === instructor.user.id
    )) === index) : [];

    await getSelfAppliedCoupon(formatedPlanData.plans?.suggested_plan?.slug || formatedPlanData.plans?.original_plan?.slug);
    const couponOnQuery = await getQueryString('coupon');
    const { data: allCouponsApplied } = await bc.payment({ coupons: [couponOnQuery || coupon], plan: formatedPlanData.plans?.suggested_plan?.slug || formatedPlanData.plans?.original_plan?.slug, countryCode }).verifyCoupon();
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

  useEffect(() => {
    if (isRigoInitialized && data?.course_translation && !initialDataIsFetching && planData?.slug) {
      const plans = applyDiscountCouponsToPlans(planData.planList, selfAppliedCoupon);
      const { discount } = getPriceWithDiscount(0, selfAppliedCoupon);

      const plansContext = plans.map((plan) => `
        - ${plan.title}
        price: ${plan.priceText}
        period: ${plan.period_label}
        ${plan.lastPrice ? `original price: ${plan.lastPrice}\n discount: ${discount}\n` : ''}
      `);
      const syllabusContext = cohortData?.cohortSyllabus?.syllabus?.json
        ? cohortData.cohortSyllabus.syllabus.json.days
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

  useEffect(() => {
    if (!isLoadingLocation) getInitialData();
  }, [lang, pathname, isLoadingLocation]);

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
  }, [isAuthenticated, cohortId]);

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

  useEffect(() => {
    if (assignmentList && assignmentList.length > 0) {
      assignmentList.forEach((assignment) => {
        if (assignment?.preview) {
          const img = new window.Image();
          img.src = assignment.preview;
        }
      });
    }
  }, [assignmentList]);

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

  return {
    // State
    data,
    cohortData,
    planData,
    showModal,
    isCtaVisible,
    isFetching,
    initialDataIsFetching,
    financeSelected,
    allDiscounts,
    imageSource,
    assignmentList,
    assetCountByType,
    courseContentList,
    faqList,
    features,
    featuredBullets,
    reviewsForCurrentCourse,
    cleanedStructuredData,
    showBottomCTA,
    studentsImages,

    // Computed values
    isAuthenticated,
    existsRelatedSubscription,
    isVisibilityPublic,
    courseColor,
    featurePrice,
    featuredPlanToEnroll,
    enrollQuerys,
    benefitsBullets,
    students,
    instructors,
    cohortId,
    selfAppliedCoupon,
    user,
    hexColor,
    backgroundColor,
    fontColor,
    borderColor,
    complementaryBlue,
    featuredColor,
    backgroundColor7,
    backgroundColor8,
    assetCount,
    BASE_COURSE,

    // Functions
    setShowModal,
    joinCohort,
    goToFinancingOptions,
    getAlternativeTranslation,
    adjustFontSizeForMobile,
    tryRigobot,
    logout,
    router,
    t,
    lang,
    setStorageItem,
  };
};

export default useBootcamp;
