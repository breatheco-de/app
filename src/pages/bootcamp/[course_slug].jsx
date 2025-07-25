/* eslint-disable camelcase */
import { Avatar, Box, Button, Flex, Image, SkeletonText, useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
import Head from 'next/head';
import Icon from '../../components/Icon';
import Text from '../../components/Text';
import GridContainer from '../../components/GridContainer';
import Heading from '../../components/Heading';
import OneColumnWithIcon from '../../components/OneColumnWithIcon';
import CourseContent from '../../components/CourseContent';
import ShowOnSignUp from '../../components/ShowOnSignup';
import ReactPlayerV2 from '../../components/ReactPlayerV2';
import Instructors from '../../components/Instructors';
import Faq from '../../components/Faq';
import FixedBottomCta from '../../components/Assets/FixedBottomCta';
import MktTrustCards from '../../components/PrismicComponents/MktTrustCards';
import MktShowPrices from '../../components/PrismicComponents/MktShowPrices';
import NextChakraLink from '../../components/NextChakraLink';
import MktTwoColumnSideImage from '../../components/PrismicComponents/MktTwoColumnSideImage';
import { AvatarSkeletonWrapped } from '../../components/Skeleton';
import CouponTopBar from '../../components/CouponTopBar';
import Rating from '../../components/Rating';
import SimpleModal from '../../components/SimpleModal';
import CustomCarousel from '../../components/CustomCarousel';
import AssignmentSlide from '../../components/AssignmentSlide';
import { useBootcamp } from './useBootcamp';
import bc from '../../services/breathecode';
import PageBubble from '../../components/PageBubble';

const limitViewStudents = 3;

export async function getStaticPaths({ locales }) {
  const { data: courses } = await bc.marketing().courses();

  const paths = courses?.length > 0
    ? courses.flatMap((course) => locales.map((locale) => ({
      params: { course_slug: course.slug },
      locale,
    })))
    : [];

  return {
    fallback: 'blocking',
    paths,
  };
}

export async function getStaticProps({ params }) {
  const { course_slug } = params;
  let disableLangSwitcher = false;

  try {
    const { data: translations } = await bc.marketing().courseTranslations(course_slug);
    if (Array.isArray(translations) && translations.length <= 1) {
      disableLangSwitcher = true;
    }
  } catch (e) {
    disableLangSwitcher = false;
  }

  return {
    props: {
      disableLangSwitcher,
    },
  };
}

function CoursePage() {
  const {
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
    supportProfileImages,
    showVideoInCta,

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
    logout,
    router,
    t,
    lang,
    setStorageItem,
  } = useBootcamp();

  const supportAvatars = (() => {
    const customContactImage = getAlternativeTranslation('contact_methods.whatsapp.contact_image');
    return (customContactImage && customContactImage !== 'contact_methods.whatsapp.contact_image')
      ? [customContactImage, supportProfileImages[0], supportProfileImages[1]]
      : supportProfileImages;
  })();

  const showFullBubble = useBreakpointValue({ base: false, md: true });

  return (
    <>
      {cleanedStructuredData?.name && (
        <Head>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedStructuredData) }} />
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
        showVideoInCta={showVideoInCta}
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
                      <Heading as="span" color="blue.default" width="100%" size={{ base: '42px', md: '45px' }} lineHeight="1.1" fontFamily="Space Grotesk Variable" fontWeight={700}>
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
                      key={imageUrl}
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
                    {students?.length > 20 ? t('students-enrolled-count', { count: students.length - limitViewStudents }) : t('students-enrolled')}
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

            {data?.course_translation?.description && (
              <Text
                size={{ base: '14', md: '16px' }}
                color="currentColor"
                fontWeight={400}
                lineHeight="normal"
                dangerouslySetInnerHTML={{ __html: data.course_translation.description }}
              />
            )}
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
                          isLoading={initialDataIsFetching || (planData?.planList?.length === 0 && !featuredPlanToEnroll?.price)}
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
                              {featurePrice}
                            </Text>
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
          {courseContentList && courseContentList?.length > 0 && (
            <Flex flexDirection="column" gridColumn="2 / span 12">
              {/* CourseContent comopnent */}
              {cohortData?.cohortSyllabus?.syllabus && (
                <CourseContent
                  courseContentText={getAlternativeTranslation('course-content-text')}
                  courseContentDescription={getAlternativeTranslation('course-content-description')}
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
          {assignmentList?.length > 0 && (
            <Flex flexDirection="column" gridGap="16px">
              <Heading size={{ base: '24px', md: '34px' }} lineHeight="normal" textAlign="center">
                {getAlternativeTranslation('build-connector.what-you-will')}
                {' '}
                <Box as="span" color="blue.default">
                  {getAlternativeTranslation('build-connector.build')}
                </Box>
              </Heading>
              <Text size="18px" textAlign="center">
                {getAlternativeTranslation('build-connector.description')}
              </Text>
              <CustomCarousel
                items={assignmentList}
                renderItem={(item, index) => (
                  <AssignmentSlide key={item?.id || `assignment-slide-${index}`} assignment={item} />
                )}
              />
            </Flex>
          )}
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
                    <Box as="span" color="blue.default">{getAlternativeTranslation('why-learn-4geeks-connector.who')}</Box>
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
                autoPlay
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
            title={`${getAlternativeTranslation('why-learn-with-4geeks.title')} ${getAlternativeTranslation('why-learn-with-4geeks.who')}?`}
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
        {getAlternativeTranslation('show-pricing-section') === 'true' && data?.plan_slug && featuredPlanToEnroll?.type !== 'FREE' && (
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

        {getAlternativeTranslation('show-free-course') === 'true' && featuredPlanToEnroll?.type !== 'FREE' && (
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
            titleColor="blue.default"
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
      {getAlternativeTranslation('contact_methods.whatsapp')
        && getAlternativeTranslation('contact_methods.whatsapp') !== 'contact_methods.whatsapp'
        && (
          <PageBubble
            url={`https://wa.me/${getAlternativeTranslation('contact_methods.whatsapp.number')}`}
            bottom={isCtaVisible ? '72px' : '10px'}
            background={showFullBubble ? useColorModeValue('white', 'gray.700') : useColorModeValue('green.400', 'green.600')}
            borderRadius={showFullBubble ? '30px' : '50%'}
            boxShadow={showFullBubble ? useColorModeValue('lg', 'dark-lg') : '0 2px 8px rgba(0,0,0,0.10)'}
            p={showFullBubble ? 3 : 1.5}
            display="flex"
            alignItems="center"
            justifyContent={showFullBubble ? 'space-between' : 'center'}
            width={showFullBubble ? 'fit-content' : '52px'}
            height={showFullBubble ? '60px' : '52px'}
          >
            {showFullBubble ? (
              <>
                <Flex alignItems="center">
                  <Flex position="relative" left="-10px">
                    {supportAvatars?.length > 0 && supportAvatars.map((avatarUrl, index) => (
                      <Avatar
                        key={avatarUrl}
                        size="sm"
                        src={avatarUrl}
                        ml={index > 0 ? '-10px' : '10px'}
                        zIndex={supportAvatars.length - index}
                      />
                    ))}
                  </Flex>

                  <Box>
                    <Text fontWeight="bold" fontSize="xs" color={useColorModeValue('gray.800', 'whiteAlpha.900')}>
                      {getAlternativeTranslation('contact_methods.whatsapp.title')}
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                      {getAlternativeTranslation('contact_methods.whatsapp.subtitle')}
                    </Text>
                  </Box>
                </Flex>
                <Box
                  bg={useColorModeValue('green.400', 'green.600')}
                  borderRadius="50%"
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow={useColorModeValue('lg', 'dark-lg')}
                  ml={3}
                  mr={-2}
                >
                  <Icon icon="whatsapp-border" color="#ffffff" width="35px" height="35px" />
                </Box>
              </>
            ) : (
              <Icon icon="whatsapp-border" color="#ffffff" width="35px" height="35px" />
            )}
          </PageBubble>
        )}
    </>
  );
}

export default CoursePage;
