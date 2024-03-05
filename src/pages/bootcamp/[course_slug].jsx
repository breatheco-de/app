import axios from 'axios';
import PropTypes from 'prop-types';
import { Container, Flex } from '@chakra-ui/react';
import { parseQuerys } from '../../utils/url';
import { BREATHECODE_HOST, WHITE_LABEL_ACADEMY } from '../../utils/variables';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';

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
  console.log('data:::', data);

  return (
    <Container maxWidth="1280px" padding="8px 1rem" mt="17px">
      <Flex color="danger" width="fit-content" borderRadius="18px" alignItems="center" padding="4px 10px" gridGap="8px" background="red.light">
        <Icon icon="dot" width="8px" height="8px" color="currentColor" margin="2px 0 0 0" />
        <Text size="12px" fontWeight={700} color="currentColor">
          Live bootcamp
        </Text>
      </Flex>
    </Container>
  );
}

Page.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array])),
};

Page.defaultProps = {
  data: {},
};

export default Page;

// const idInt = parseInt(id, 10) || null;
// if (idInt === undefined || idInt === null) {
//   return {
//     notFound: true,
//   };
// }
// const data = await generateCohortSyllabusModules(idInt);

// const members = await bc.cohort().getStudents2(data.cohort.slug, true)
//   .then((resp) => resp.data)
//   .catch((err) => error('Error fetching cohort users:', err));
