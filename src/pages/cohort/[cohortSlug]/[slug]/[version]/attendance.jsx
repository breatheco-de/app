/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Avatar, Box, Flex, IconButton, Input, InputGroup, InputRightElement, usePrefersReducedMotion, useToast,
  keyframes,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Button,
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
  const [showSearch, setShowSearch] = useState(false);
  const [currentStudentList, setCurrentStudentList] = useState([]);
  const [sortSettings, setSortSettings] = useState({
    name: null,
    percentage: true,
  });

  // const [searchValue, setSearchValue] = useState('');
  const { borderColor, hexColor } = useStyle();

  const { cohortSlug } = router?.query;

  const calcDaysAverage = (days) => {
    const totalDays = days.length;
    const totalDaysCompleted = days.filter((day) => day.color === '#25BF6C').length;
    const average = parseInt((totalDaysCompleted / totalDays) * 100, 10);
    return average;
  };

  const slideLeft = keyframes`
  from {
    -webkit-transform: translateX(30px);
            transform: translateX(30px);
  }
  to {
    -webkit-transform: translateX(0px);
            transform: translateX(0px);
  }
`;
  const prefersReducedMotion = usePrefersReducedMotion();
  const slideLeftAnimation = prefersReducedMotion
    ? undefined
    : `${slideLeft} 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both`;

  // const getStudents = (slug, academyId) => {
  //   bc.cohort().getStudents(slug, academyId)
  //     .then(({ data }) => {
  //       const activeStudents = data.filter((l) => l.educational_status === 'ACTIVE' && l.role === 'STUDENT');
  //       const sortedStudents = activeStudents.sort(
  //         (a, b) => a.user.first_name.localeCompare(b.user.first_name),
  //       );
  //       setCurrentStudentList(sortedStudents);
  //     }).catch(() => {
  //       toast({
  //         title: t('alert-message:error-fetching-students-and-teachers'),
  //         status: 'error',
  //         duration: 7000,
  //         isClosable: true,
  //       });
  //     });
  // };

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
      // getStudents(slug, academyId);
      // getFilterAssignments(cohortId, academyId, router.query.student);
    }
  }, [allCohorts, selectedCohortSlug, router.query.student]);

  const handleSearch = (e) => {
    const { value } = e.target;

    const filteredStudents = mockData.attendanceDots.filter((l) => {
      const fullName = `${l.user.first_name} ${l.user.last_name}`;

      return fullName.toLowerCase().includes(value.toLowerCase());
    });

    setCurrentStudentList(filteredStudents);
  };

  const sortedByNameAndAttendance = mockData?.attendanceDots.sort((a, b) => {
    const fullNameA = `${a.user.first_name} ${a.user.last_name}`;
    const fullNameB = `${b.user.first_name} ${b.user.last_name}`;
    const aAverage = calcDaysAverage(a.days);
    const bAverage = calcDaysAverage(b.days);
    if (sortSettings.name === true) {
      return fullNameA.localeCompare(fullNameB);
    }
    if (sortSettings.percentage === true) {
      return bAverage - aAverage;
    }

    return fullNameB.localeCompare(fullNameA);
  });

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
      >
        <Flex gridGap="25px" justifyContent="flex-end" padding="34px 0">
          <InputGroup width="200px">
            <Input
              onBlur={() => setShowSearch(false)}
              borderRadius="25px"
              type="text"
              style={{
                cursor: 'default',
                opacity: showSearch ? 1 : 0,
              }}
              disabled={!showSearch}
              animation={showSearch ? slideLeftAnimation : ''}
              onChange={handleSearch}
            />
            <InputRightElement>
              <IconButton
                onClick={() => {
                  setShowSearch(!showSearch);
                }}
                pr="8px"
                background="transparent"
                _hover={{ background: 'transparent' }}
                _active={{ background: 'transparent' }}
                aria-label="Search user"
                icon={<Icon icon="search" color={hexColor.blueDefault} width="18px" height="18px" />}
              />
            </InputRightElement>
          </InputGroup>

          <Popover>
            <PopoverTrigger>
              <Button variant="unstyled" display="flex" gridGap="6px" color={hexColor.blueDefault} alignItems="center">
                <Icon icon="sort" width="18px" heigh="11px" color="currentColor" />
                <Text textTransform="uppercase" size="14px" fontWeight={700}>
                  Sort by
                </Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody display="flex" flexDirection="column" alignItems="flex-start" pl={4}>
                <Button variant="unstyled" onClick={() => setSortSettings({ name: !sortSettings.name })}>
                  {`Sort by name ${typeof sortSettings.name === 'boolean' ? sortSettings.name ? '▼' : '▲' : ''}`}
                </Button>
                <Button variant="unstyled" onClick={() => setSortSettings({ percentage: !sortSettings.percentage })}>
                  {`Sort by percentage ${typeof sortSettings.percentage === 'boolean' ? sortSettings.percentage ? '▼' : '▲' : ''}`}
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Popover>
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

            {sortedByNameAndAttendance.map((student) => {
              const fullName = `${student.user.first_name} ${student.user.last_name}`;
              const percentAttendance = `${calcDaysAverage(student.days)}% attendance`;

              return (
                <DottedTimeline
                  key={student.id}
                  label={(
                    <Flex gridGap="10px" alignItems="center">
                      <Avatar
                        src={student.user.profile.avatar_url}
                        width="25px"
                        height="25px"
                        style={{ userSelect: 'none' }}
                      />
                      <p>{fullName}</p>
                    </Flex>
                  )}
                  dots={student.days}
                  helpText={percentAttendance}
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
