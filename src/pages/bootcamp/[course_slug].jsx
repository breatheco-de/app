import axios from 'axios';
import PropTypes from 'prop-types';
import { Flex, Image, Link } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { parseQuerys } from '../../utils/url';
import { BREATHECODE_HOST, WHITE_LABEL_ACADEMY } from '../../utils/variables';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import GridContainer from '../../common/components/GridContainer';
import Heading from '../../common/components/Heading';
import { error } from '../../utils/logging';
import bc from '../../common/services/breathecode';
import { generateCohortSyllabusModules } from '../../common/handlers/cohorts';
import { adjustNumberBeetwenMinMax } from '../../utils';
import useStyle from '../../common/hooks/useStyle';
import OneColumnWithIcon from '../../common/components/OneColumnWithIcon';
import CourseContent from '../../common/components/CourseContent';

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
    return ({
      params: {
        course_slug: course.slug,
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

  const endpoint = `/v1/marketing/course/${courseSlug}?lang=${locale}`;
  const resp = await axios.get(`${BREATHECODE_HOST}${endpoint}`);
  const data = resp?.data;
  if (resp?.status >= 400) {
    console.error(`ERROR with /bootcamp/course/${courseSlug}: something went wrong fetching "${endpoint}"`);
    return {
      notFound: true,
    };
  }
  return {
    props: {
      data,
    },
  };
}

function Page({ data }) {
  const [cohortData, setcohortData] = useState({
    cohortSyllabus: null,
    members: [],
    isLoading: true,
  });
  const { hexColor } = useStyle();
  const limitViewStudents = 3;
  const students = cohortData?.members.length > 0 ? cohortData?.members?.filter((student) => student.role === 'STUDENT') : [];
  const technologiesString = cohortData.isLoading === false && cohortData?.cohortSyllabus?.syllabus?.main_technologies.split(',').join(', ');

  const getInitialData = async (cohortId) => {
    const cohortSyllabus = await generateCohortSyllabusModules(cohortId);

    const members = await bc.cohort({ roles: 'STUDENT' }, true).getStudents2(cohortSyllabus.cohort.slug, true)
      .then((resp) => resp.data)
      .catch((err) => error('Error fetching cohort users:', err));

    setcohortData({
      cohortSyllabus,
      members,
      isLoading: false,
    });
  };
  useEffect(() => {
    getInitialData(541);
  }, []);

  // console.log('cohortData:::', cohortData);
  // console.log('data:::', data);

  return (
    <Flex flexDirection="column">
      <GridContainer gridTemplateColumns="1fr repeat(12, 1fr) 1fr" gridGap="36px" padding="8px 10px" mt="17px">
        <Flex flexDirection="column" gridColumn="2 / span 8" gridGap="24px">
          {/* Title */}
          <Flex flexDirection="column" gridGap="16px">
            <Flex color="danger" width="fit-content" borderRadius="18px" alignItems="center" padding="4px 10px" gridGap="8px" background="red.light">
              <Icon icon="dot" width="8px" height="8px" color="currentColor" margin="2px 0 0 0" />
              <Text size="12px" fontWeight={700} color="currentColor">
                Live bootcamp
              </Text>
            </Flex>
            <Flex gridGap="16px" alignItems="center">
              <Image src={data?.icon_url} width="54px" height="54px" objectFit="cover" />
              <Heading as="h1" width="100%" size="64px" fontFamily="Space Grotesk Variable" fontWeight={700}>
                {data?.course_translation?.title}
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
              {students.length > limitViewStudents ? `+${students.length - limitViewStudents} students enrolled` : ''}
            </Text>
          </Flex>

          <Flex flexDirection="column" gridGap="24px">
            <Text size="24px" fontWeight={700}>
              Become a
              {' '}
              <Text as="span" size="24px" color="blue.default" fontWeight={700}>
                {technologiesString}
              </Text>
              {' '}
              and get to your first job
            </Text>
            <Flex flexDirection="column" gridGap="16px">
              <Flex gridGap="9px" alignItems="center">
                <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
                <Text size="16px" fontWeight={400} color="currentColor" lineHeight="normal">
                  Get the best of the exterience with
                  {' '}
                  <strong>LearnPack, our powerful AI tool</strong>
                  .
                  <br />
                  <Link fontSize="16px" variant="default" href="/">
                    Do you want to know more?
                  </Link>
                </Text>
              </Flex>
              <Flex gridGap="9px" alignItems="center">
                <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
                <Text size="16px" fontWeight={400} color="currentColor" lineHeight="normal">
                  Follow a structured syllabus with
                  {' '}
                  <strong>1000+ exercises and interactive tutorials.</strong>
                </Text>
              </Flex>
              <Flex gridGap="9px" alignItems="center">
                <Icon icon="checked2" width="15px" height="11px" color={hexColor.green} />
                <Text size="16px" fontWeight={400} color="currentColor" lineHeight="normal">
                  Boost your experience with
                  {' '}
                  <strong>live one-on-one mentoring sessions</strong>
                  {' '}
                  with industry experts who have already been down this path.
                </Text>
              </Flex>
            </Flex>

            {/* Instructors component here */}

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
        <Flex flexDirection="column" gridColumn="10 / span 4">
          asdsads
        </Flex>
      </GridContainer>
      <GridContainer gridTemplateColumns="1fr repeat(12, 1fr) 1fr" withContainer gridColumn="2 / span 12">
        <OneColumnWithIcon
          title="Meet Rigobot, your guide of your learning journey"
          icon=""
          buttonText="Try Rigobot for free"
        >
          <Text>
            Rigobot is our AI model that&apos;s being trained the last years to help you on your learning journey. Rigobot is ready to help you while you code whether your are on one of our interactive tutorials or coding a project, it will review your code and give you instant feedback to learn faster and better!
          </Text>
        </OneColumnWithIcon>

        {/* CourseContent comopnent */}
        {cohortData?.cohortSyllabus?.syllabus && (
          <CourseContent data={cohortData.cohortSyllabus.syllabus} />
        )}
      </GridContainer>
    </Flex>
  );
}

Page.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array])),
};

Page.defaultProps = {
  data: {},
};

export default Page;
