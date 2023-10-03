import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Button, Flex, Link, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import useAuth from '../../../common/hooks/useAuth';
import bc from '../../../common/services/breathecode';
import GridContainer from '../../../common/components/GridContainer';
import asPrivate from '../../../common/context/PrivateRouteWrapper';
import { generateCohortSyllabusModules } from '../../../common/handlers/cohorts';
import Heading from '../../../common/components/Heading';
import TagCapsule from '../../../common/components/TagCapsule';
import useStyle from '../../../common/hooks/useStyle';
import Text from '../../../common/components/Text';
import Module from '../../../js_modules/moduleMap/module';
import CohortSideBar from '../../../common/components/CohortSideBar';
import Icon from '../../../common/components/Icon';
import axiosInstance from '../../../axios';
import { usePersistent } from '../../../common/hooks/usePersistent';

export const getServerSideProps = async ({ locale, query }) => {
  const t = await getT(locale, 'dashboard');
  const { id } = query;
  const idInt = parseInt(id, 10) || null;
  if (idInt === undefined || idInt === null) {
    return {
      notFound: true,
    };
  }
  const data = await generateCohortSyllabusModules(idInt);

  return {
    props: {
      seo: {
        title: t('join-cohort', { cohortTitle: data.cohort?.name }),
      },
      id: idInt,
      syllabus: data.syllabus || null,
      cohort: data.cohort || null,
    },
  };
};

function Page({ id, syllabus, cohort }) {
  const { disabledColor2, hexColor } = useStyle();
  const { t, lang } = useTranslation('dashboard');
  const { isAuthenticated, choose } = useAuth();
  const [isFetching, setIsFetching] = useState(false);
  const [, setCohortSession] = usePersistent('cohortSession', {});
  const toast = useToast();
  const router = useRouter();

  const redirectTocohort = () => {
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

  const joinCohort = () => {
    if (isAuthenticated) {
      setIsFetching(true);
      bc.cohort().join(id)
        .then(async (resp) => {
          const dataRequested = await resp.json();
          if (dataRequested?.status === 'ACTIVE') {
            redirectTocohort();
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
              redirectTocohort();
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
          }
        })
        .catch(() => {})
        .finally(() => {
          setTimeout(() => {
            setIsFetching(false);
          }, 600);
        });
    }
  };

  const techs = syllabus?.main_technologies?.split(',') || [];

  return (
    <GridContainer
      withContainer
      display={{ base: 'flex', md: 'grid' }}
      flexDirection={{ base: 'column', md: '' }}
      mt="17px"
      maxWidth="1280px"
      padding="0 1rem"
      gridColumn="1 / span 10"
    >
      <Link display="flex" gridGap="4px" variant="default" href="/choose-program">
        <Icon
          icon="arrowLeft"
          width="20px"
          height="20px"
          style={{ marginRight: '7px' }}
          color="currentColor"
        />
        {t('backToChooseProgram')}
      </Link>

      <Flex mt="3rem" gridGap={{ base: '1rem', md: '3rem', lg: '4rem' }}>
        <Box flex={{ base: 1, md: 0.75 }}>
          <Heading as="h1" size="xl">
            {syllabus?.name}
          </Heading>
          <TagCapsule
            height="30px"
            tags={techs}
          />
          <Box display={{ base: 'block', md: 'none' }} flex={1}>
            {cohort?.kickoff_date && (
              <CohortSideBar
                cohort={cohort}
                teacherVersionActive={false}
                studentAndTeachers={[]}
                cohortCity={cohort?.name}
                width="100%"
                isDisabled
              />
            )}
          </Box>
          <Button
            variant="default"
            isLoading={isFetching}
            isDisabled={!isAuthenticated}
            onClick={joinCohort}
            textTransform="uppercase"
            fontSize="13px"
            mt="1rem"
          >
            {t('join-next-cohort')}
          </Button>

          <Flex flexDirection="column" id="module-wrapper" mt="3rem" gridGap="2rem">
            {syllabus?.modules?.length > 0 && syllabus.modules.map((module) => (
              <Box key={module.slug} id={module.slug}>
                <Box margin="14px 0" display="flex" alignItems="center" justifyContent="space-between" gridGap="15px">
                  <Heading as="h2" fontSize="22px">
                    {module?.title}
                  </Heading>
                  <Heading
                    as="span"
                    fontSize="15px"
                    color={disabledColor2}
                    fontWeight="normal"
                    textTransform="uppercase"
                    textAlign="right"
                  >
                    {t('modules.activitiesLength', { count: module?.content?.length || 0 })}
                  </Heading>
                </Box>
                <Text margin="0 0 22px 0px" color={hexColor.fontColor3} size="md">
                  {module?.description}
                </Text>

                {module?.content?.length > 0 && module.content.map((contentData, index) => {
                  const cheatedIndex = index;

                  return (
                    <Module
                      key={`${module.title}-${cheatedIndex}`}
                      currIndex={index}
                      data={contentData}
                      taskTodo={[]}
                      isDisabled
                    />
                  );
                })}
              </Box>
            ))}
          </Flex>
        </Box>
        <Box display={{ base: 'none', md: 'block' }} flex={0.35}>
          {cohort?.kickoff_date && (
            <CohortSideBar
              cohort={cohort}
              teacherVersionActive={false}
              studentAndTeachers={[]}
              cohortCity={cohort?.name}
              width="100%"
              isDisabled
            />
          )}
        </Box>
      </Flex>
    </GridContainer>
  );
}

Page.propTypes = {
  id: PropTypes.number,
  syllabus: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  cohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};
Page.defaultProps = {
  id: null,
};

export default asPrivate(Page);
