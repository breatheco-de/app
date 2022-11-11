/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Flex, useToast,
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
      <Box display="flex" justifyContent="space-between" margin={{ base: '2% 4% 0 4%', lg: '2% 12% 0 12%' }}>
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
      </Box>
      <Box display="flex" borderBottom="1px solid" borderColor={borderColor} flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '0', md: '10px' }} p={{ base: '50px 4% 30px 4%', md: '50px 10% 30px 10%', lg: '50px 12% 30px 12%' }} alignItems={{ base: 'start', md: 'center' }}>
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
      <Flex
        flexDirection="column"
        gridGap="20px"
        maxWidth="1012px"
        margin={{ base: '3% 4%', md: '3% auto 4% auto', lg: '3% auto 4% auto' }}
        padding={{ base: '0', md: '0 10px', lg: '0' }}
        // p="0 0 30px 0"
      >
        <Flex gridGap="45px" justifyContent="flex-end">
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
          maxWidth="1012px"
          flexGrow={1}
          overflow="auto"
        >
          <Flex flexDirection="column" gridGap="18px">

            {[
              {
                id: 1,
                name: 'Juan Perez',
                status: 'pending',
                days: [
                  {
                    label: 'Day 1 - 4 Mar',
                    color: '#25BF6C',
                  },
                  {
                    label: 'Day 2 - 5 Mar',
                    color: '#25BF6C',
                  },
                  {
                    label: 'Day 3 - 6 Mar',
                    color: '#FFB718',
                  },
                  {
                    label: 'Day 4 - 7 Mar',
                    color: '#CD0000',
                  },
                ],
              },
              {
                id: 2,
                name: 'Fernando Fuentes',
                status: 'pending',
                days: [
                  {
                    label: 'Day 1 - 4 Mar',
                    color: '#FFB718',
                  },
                  {
                    label: 'Day 2 - 5 Mar',
                    color: '#25BF6C',
                  },
                  {
                    label: 'Day 3 - 6 Mar',
                    color: '#25BF6C',
                  },
                  {
                    label: 'Day 4 - 7 Mar',
                    color: '#CD0000',
                  },
                  {
                    label: 'Day 5 - 8 Mar',
                    color: '#25BF6C',
                  },
                  {
                    label: 'Day 6 - 9 Mar',
                    color: '#25BF6C',
                  },
                ],
              },
            ].map((student) => {
              const calcDaysAverage = (days) => {
                const totalDays = days.length;
                const totalDaysCompleted = days.filter((day) => day.color === '#25BF6C').length;
                const average = parseInt((totalDaysCompleted / totalDays) * 100, 10);
                return average;
              };

              return (
                <DottedTimeline
                  key={student.id}
                  label={(<p>{student.name}</p>)}
                  dots={student.days}
                  helpText={`${calcDaysAverage(student.days)}% attendance`}
                />
              );
            })}
          </Flex>
        </Box>
      </Flex>
    </>
  );
};

export default asPrivate(Attendance);
