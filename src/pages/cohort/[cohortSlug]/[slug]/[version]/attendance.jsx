/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Avatar, Box, Flex, useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import bc from '../../../../../common/services/breathecode';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import ReactSelect from '../../../../../common/components/ReactSelect';
import Link from '../../../../../common/components/NextChakraLink';
import Heading from '../../../../../common/components/Heading';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import Text from '../../../../../common/components/Text';
import useAssignments from '../../../../../common/store/actions/assignmentsAction';
// import Image from '../../../../../common/components/Image';
import useStyle from '../../../../../common/hooks/useStyle';
import Icon from '../../../../../common/components/Icon';
import DottedTimeline from '../../../../../common/components/DottedTimeline';
import GridContainer from '../../../../../common/components/GridContainer';
import mockData from '../../../../../common/utils/mockData/DashboardView';

const Attendance = () => {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const toast = useToast();
  const { contextState, setContextState } = useAssignments();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [allCohorts, setAllCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState({});
  const [selectedCohortSlug, setSelectedCohortSlug] = useState(null);
  const [currentStudentList, setCurrentStudentList] = useState([]);
  const { borderColor, hexColor } = useStyle();

  const { cohortSlug } = router?.query;

  const getStudents = (slug, academyId) => {
    bc.cohort().getStudents(slug, academyId)
      .then(({ data }) => {
        const activeStudents = data.filter((l) => l.educational_status === 'ACTIVE' && l.role === 'STUDENT');
        const sortedStudents = activeStudents.sort(
          (a, b) => a.user.first_name.localeCompare(b.user.first_name),
        );
        setCurrentStudentList(sortedStudents);
      }).catch(() => {
        toast({
          title: t('alert-message:error-fetching-students-and-teachers'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    if (cohortSession?.cohort_role && cohortSession?.cohort_role === 'STUDENT') {
      router.push('/choose-program');
    } else {
      bc.admissions().me()
        .then(({ data }) => {
          const cohortFiltered = data.cohorts.filter((cohort) => cohort.role !== 'STUDENT');
          const dataStruct = cohortFiltered.map((l) => ({
            label: l.cohort.name,
            slug: l.cohort.slug,
            value: l.cohort.id,
            academy: l.cohort.academy.id,
          }));
          setAllCohorts(dataStruct.sort(
            (a, b) => a.label.localeCompare(b.label),
          ));
        })
        .catch((error) => {
          toast({
            title: t('alert-message:error-fetching-cohorts'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          console.error('There was an error fetching the cohorts', error);
        });
    }
  }, []);

  useEffect(() => {
    const findSelectedCohort = allCohorts.find((l) => l.slug === selectedCohortSlug);
    const defaultCohort = allCohorts.find((l) => l.slug === cohortSlug);

    const academyId = findSelectedCohort?.academy || defaultCohort?.academy;
    const slug = findSelectedCohort?.slug || defaultCohort?.slug;
    const cohortId = findSelectedCohort?.value || defaultCohort?.value;

    if (defaultCohort && cohortId) {
      setSelectedCohort(findSelectedCohort || defaultCohort);
      getStudents(slug, academyId);
      // getFilterAssignments(cohortId, academyId, router.query.student);
    }
  }, [allCohorts, selectedCohortSlug, router.query.student]);

  return (
    <>
      <GridContainer maxW="1080px" mt="18px">
        {cohortSession?.selectedProgramSlug && (
          <Link
            href={cohortSession?.selectedProgramSlug}
            color="blue.default"
            display="inline-block"
            letterSpacing="0.05em"
            fontWeight="700"
          >
            {`← ${t('back-to')}`}
          </Link>
        )}
      </GridContainer>
      <Box display="flex" maxW="1080px" m="0 auto" padding="45px 0 28px 0" borderBottom="1px solid" borderColor={borderColor} flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '0', md: '10px' }} alignItems={{ base: 'start', md: 'center' }}>
        <Heading size="m" style={{ margin: '0' }} padding={{ base: '0', md: '0 0 5px 0 !important' }}>
          {`${t('title')}:`}
        </Heading>
        {selectedCohort.value && allCohorts.length > 0 && (
          <ReactSelect
            unstyled
            color="#0097CD"
            fontWeight="700"
            id="cohort-select"
            fontSize="25px"
            noOptionsMessage={() => t('common:no-options-message')}
            defaultInputValue={selectedCohort.label}
            onChange={({ slug }) => {
              if (slug !== selectedCohort.slug) {
                setCurrentStudentList([]);
                setContextState({
                  allTasks: [],
                });
              }
              setSelectedCohortSlug(slug);
            }}
            options={allCohorts.map((cohort) => ({
              value: cohort.value,
              slug: cohort.slug,
              label: cohort.label,
            }))}
          />
        )}
      </Box>
      <GridContainer
        flexDirection="column"
        maxW="1080px"
        // gridGap="20px"
        // margin={{ base: '3% 4%', md: '3% auto 4% auto', lg: '3% auto 4% auto' }}
        // padding={{ base: '0', md: '0 10px', lg: '0' }}
        // p="0 0 30px 0"
      >
        <Flex gridGap="45px" justifyContent="flex-end" padding="34px 0">
          <Box>
            <Icon icon="search" width="18px" heigh="18px" color={hexColor.blueDefault} />
          </Box>
          <Flex gridGap="6px" color={hexColor.blueDefault}>
            <Icon icon="sort" width="18px" heigh="11px" color="currentColor" />
            <Text textTransform="uppercase" size="14px" fontWeight={700}>
              Sort by
            </Text>
          </Flex>
        </Flex>
        <Box
          width="100%"
          minHeight="34vh"
          borderRadius="3px"
          margin="0 auto"
          // maxWidth="1012px"
          flexGrow={1}
          overflow="auto"
        >
          <Flex flexDirection="column" gridGap="18px">

            {mockData.attendanceDots.map((student) => {
              const calcDaysAverage = (days) => {
                const totalDays = days.length;
                const totalDaysCompleted = days.filter((day) => day.color === '#25BF6C').length;
                const average = parseInt((totalDaysCompleted / totalDays) * 100, 10);
                return average;
              };

              return (
                <DottedTimeline
                  key={student.id}
                  label={(
                    <Flex gridGap="10px" alignItems="center">
                      <Avatar
                        src={student.avatar}
                        width="25px"
                        height="25px"
                        style={{ userSelect: 'none' }}
                      />
                      <p>{student.name}</p>
                    </Flex>
                  )}
                  dots={student.days}
                  helpText={`${calcDaysAverage(student.days)}% attendance`}
                />
              );
            })}
          </Flex>
        </Box>
      </GridContainer>
    </>
  );
};

export default asPrivate(Attendance);
