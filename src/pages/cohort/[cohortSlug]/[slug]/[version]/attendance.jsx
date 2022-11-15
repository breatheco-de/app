/* eslint-disable no-nested-ternary */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { format } from 'date-fns';
import {
  Avatar, Box, Flex, IconButton, Input, InputGroup, InputRightElement, usePrefersReducedMotion, useToast,
  keyframes,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
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
import useStyle from '../../../../../common/hooks/useStyle';
import Icon from '../../../../../common/components/Icon';
import DottedTimeline from '../../../../../common/components/DottedTimeline';
import GridContainer from '../../../../../common/components/GridContainer';
import handlers from '../../../../../common/handlers';
import { DottedTimelineSkeleton } from '../../../../../common/components/Skeleton';
import Sparkline from '../../../../../common/components/Sparkline';

const Attendance = () => {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const toast = useToast();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [allCohorts, setAllCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState({});
  const [selectedCohortSlug, setSelectedCohortSlug] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [currentStudentList, setCurrentStudentList] = useState([]);
  const [searchedStudents, setSearchedStudents] = useState([]);
  const [allStudentsWithDays, setAllStudentsWithDays] = useState([]);
  const [currentDaysLog, setCurrentDaysLog] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortSettings, setSortSettings] = useState({
    name: null,
    percentage: true,
  });

  const { borderColor, hexColor } = useStyle();

  const { cohortSlug } = router?.query;

  const calcDaysAverage = (days) => {
    const totalDays = days.length;
    const totalDaysCompleted = days.filter((day) => day.color === '#25BF6C').length;
    const average = parseInt((totalDaysCompleted / totalDays) * 100, 10);
    return average;
  };

  const calcPercentage = (number, total) => {
    const percentage = (number / total) * 100;
    return Number(percentage.toFixed(2));
  };

  const calcStudentDaysAverage = () => {
    let finalPercentage = 0;

    allStudentsWithDays.forEach((student) => {
      finalPercentage += student.percentage;
    });
    return calcPercentage((finalPercentage / 100), allStudentsWithDays.length);
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
            durationInDays: l.cohort.syllabus_version.duration_in_days,
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

      handlers.getActivities(slug)
        .then((daysLog) => {
          setCurrentDaysLog(daysLog);
        })
        .catch((error) => {
          console.error('activities_error:', error);
        });

      handlers.getStudents(slug, academyId)
        .then((students) => {
          setCurrentStudentList(students);
        })
        .catch(() => {
          toast({
            title: t('alert-message:error-fetching-students-and-teachers'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        });
    }
  }, [allCohorts, selectedCohortSlug, router.query.student]);

  useEffect(() => {
    setIsLoaded(false);
    if (currentStudentList.length > 0 && selectedCohort?.durationInDays) {
      const studentsWithDays = currentStudentList.map((student) => {
        const days = Array.from(Array(selectedCohort.durationInDays).keys()).map((i) => {
          const day = i + 1;
          const dayData = currentDaysLog[day];
          const dayLabel = `Day ${day}`;
          const dayColor = dayData?.attendance_ids?.includes(student.user.id)
            ? '#25BF6C'
            : dayData?.unattendance_ids?.includes(student.user.id)
              ? '#FF5B5B'
              : '#FFB718';
          return {
            label: currentDaysLog[day] ? `${dayLabel} - ${format(new Date(currentDaysLog[day].updated_at), 'd MMM')}` : dayLabel,
            color: currentDaysLog[day] ? dayColor : '#C4C4C4',
            updated_at: currentDaysLog[day] ? dayData?.updated_at : null, // 86400000 = 24 hours in milliseconds
          };
        });
        return {
          user: student.user,
          days,
          percentage: calcDaysAverage(days),
        };
      });
      setAllStudentsWithDays(studentsWithDays);
      setSearchedStudents(studentsWithDays);
      setIsLoaded(true);
      setTimeout(() => {
        setShowSearch(true);
      }, 300);
    }
  }, [currentStudentList, currentDaysLog, selectedCohort.durationInDays]);

  const handleSearch = (e) => {
    const { value } = e.target;

    const filteredStudents = allStudentsWithDays.filter((l) => {
      const fullName = `${l.user.first_name} ${l.user.last_name}`;

      return fullName.toLowerCase().includes(value.toLowerCase());
    });

    setSearchedStudents(filteredStudents);
  };

  const sortedByNameAndAttendance = searchedStudents.sort((a, b) => {
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
      <Box display="flex" maxW="1080px" m="0 auto" justifyContent="space-between" padding="45px 0 28px 0" borderBottom="1px solid" borderColor={borderColor} flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '0', md: '10px' }} alignItems={{ base: 'start', md: 'center' }}>
        <Box>
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
                  // setStudentAttendance({
                  //   allTasks: [],
                  // });
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
        {isLoaded && (
          <Sparkline
            width="200"
            percentage={calcStudentDaysAverage()}
            // values={allStudentsWithDays}
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
          flexGrow={1}
          overflow="auto"
        >
          <Flex flexDirection="column" gridGap="18px">

            {isLoaded ? sortedByNameAndAttendance.map((student) => {
              const fullName = `${student.user.first_name} ${student.user.last_name}`;
              const percentAttendance = `${student.percentage}% attendance`;

              return (
                <DottedTimeline
                  key={student.id}
                  label={(
                    <Flex gridGap="10px" alignItems="center">
                      <Avatar
                        src={student.user.profile?.avatar_url}
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
            }) : (<DottedTimelineSkeleton />)}
          </Flex>
        </Box>
      </GridContainer>
    </>
  );
};

export default asPrivate(Attendance);
