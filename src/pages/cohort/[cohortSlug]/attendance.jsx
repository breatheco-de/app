/* eslint-disable no-unsafe-optional-chaining */
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
import bc from '../../../common/services/breathecode';
import asPrivate from '../../../common/context/PrivateRouteWrapper';
import ReactSelect from '../../../common/components/ReactSelect';
import Link from '../../../common/components/NextChakraLink';
import Heading from '../../../common/components/Heading';
import Text from '../../../common/components/Text';
import useStyle from '../../../common/hooks/useStyle';
import Icon from '../../../common/components/Icon';
import DottedTimeline from '../../../common/components/DottedTimeline';
import GridContainer from '../../../common/components/GridContainer';
import handlers from '../../../common/handlers';
import { DottedTimelineSkeleton, SimpleSkeleton } from '../../../common/components/Skeleton';
import Sparkline from '../../../common/components/Sparkline';
import KPI from '../../../common/components/KPI';

function Attendance() {
  const { t } = useTranslation('attendance');
  const router = useRouter();
  const toast = useToast();
  const [allCohorts, setAllCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [currentStudentList, setCurrentStudentList] = useState([]);
  const [searchedStudents, setSearchedStudents] = useState([]);
  const [allStudentsWithDays, setAllStudentsWithDays] = useState({});
  const [currentDaysLog, setCurrentDaysLog] = useState({});
  const [loadStatus, setLoadStatus] = useState({
    loading: true,
    status: 'loading',
  });
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [sortSettings, setSortSettings] = useState({
    name: null,
    percentage: true,
  });

  const status = {
    attended: '#25BF6C',
    absent: '#FF5B5B',
    not_taken: '#FFB718',
    remain: '#C4C4C4',
  };

  const { borderColor, hexColor } = useStyle();

  const { cohortSlug, academy } = router?.query;

  const calcDaysAverage = (days) => {
    const currentTotalDays = days.filter((day) => day.status === 'attended' || day.status === 'absent').length;

    const totalDaysCompleted = days.filter((day) => day.status === 'attended').length;
    const average = parseInt((totalDaysCompleted / currentTotalDays) * 100, 10);
    return average;
  };

  const calcPercentage = (number, total) => {
    const percentage = (number / total) * 100;
    return Number(percentage.toFixed(2));
  };

  const calcStudentDaysAverage = () => {
    let finalPercentage = 0;

    allStudentsWithDays.studentList.forEach((student) => {
      if (student?.percentage >= 0) {
        finalPercentage += student.percentage;
      }
    });
    const percentage = calcPercentage((finalPercentage / 100), allStudentsWithDays.studentList.length);
    const percentageLimited = percentage > 100 ? 100 : percentage;
    return percentageLimited;
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
    bc.admissions().me()
      .then(({ data }) => {
        const cohortFiltered = data.cohorts.filter((cohort) => cohort.role !== 'STUDENT');
        const dataStruct = cohortFiltered.map((l) => ({
          label: l.cohort.name,
          slug: l.cohort.slug,
          value: l.cohort.id,
          academy: l.cohort.academy.id,
          syllabus: l.cohort.syllabus_version,
          durationInDays: l.cohort?.syllabus_version?.duration_in_days,
        }));
        setAllCohorts(dataStruct.sort(
          (a, b) => a.label.localeCompare(b.label),
        ));
        setSelectedCohort(dataStruct.find((c) => c.slug === cohortSlug));
      })
      .catch(() => {
        toast({
          position: 'top',
          title: t('alert-message:error-fetching-cohorts'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  }, []);

  useEffect(() => {
    setLoadingStudents(true);
    const findSelectedCohort = allCohorts.find((l) => l.slug === cohortSlug);

    const academyId = findSelectedCohort?.academy || academy;
    const slug = findSelectedCohort?.slug || cohortSlug;

    // setSelectedCohort(findSelectedCohort);
    if (academyId) {
      handlers.getActivities(slug, academyId)
        .then((daysLog) => {
          if (Object.keys(daysLog).length <= 0) {
            setCurrentDaysLog({});
            toast({
              position: 'top',
              title: t('alert-message:no-attendance-list-found'),
              status: 'warning',
              duration: 7000,
              isClosable: true,
            });
          } else {
            setCurrentDaysLog(daysLog);
          }
        })
        .catch(() => {
          toast({
            position: 'top',
            title: t('alert-message:error-fetching-activities'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        });
      handlers.getStudents(slug, academyId)
        .then((students) => {
          setCurrentStudentList(students);
        })
        .catch(() => {
          toast({
            position: 'top',
            title: t('alert-message:error-fetching-students'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        })
        .finally(() => setLoadingStudents(false));
    } else {
      setLoadingStudents(false);
    }
  }, [cohortSlug, router.query.student, allCohorts]);

  useEffect(() => {
    const durationInDays = selectedCohort?.durationInDays || 48;
    setLoadStatus({
      loading: true,
      status: 'loading',
    });
    if (loadingStudents) return () => {};

    const currentDaysLogExists = Object.keys(currentDaysLog).length > 0;
    if (currentStudentList?.length > 0) {
      const studentsWithDays = currentStudentList.map((student) => {
        const days = Array.from(Array(durationInDays).keys()).map((i) => {
          const day = i + 1;
          const dayData = currentDaysLog[day];
          const dayLabel = `${t('common:day')} ${day}`;
          const dayProps = dayData?.attendance_ids?.includes(student.user.id)
            ? {
              status: 'attended',
              color: status.attended,
            }
            : dayData?.unattendance_ids?.includes(student.user.id)
              ? {
                status: 'absent',
                color: status.absent,
              }
              : {
                status: 'not_taken',
                color: status.not_taken,
              };

          const color = currentDaysLogExists ? dayProps.color : status.remain;
          const label = currentDaysLogExists ? dayProps.status : 'not_taken';
          return {
            label: dayData ? `${dayLabel} - ${format(new Date(dayData.updated_at), 'd MMM')}` : dayLabel,
            day,
            color,
            status: label,
            updated_at: dayData ? dayData?.updated_at : null,
          };
        });
        return {
          user: student.user,
          days,
          percentage: calcDaysAverage(days),
        };
      });

      const averageEachDay = Array.from(Array(durationInDays).keys()).map((i) => {
        const day = i + 1;
        const total = studentsWithDays.length;
        const attended = studentsWithDays.filter((l) => l.days[day - 1].color === status.attended).length;
        const percentage = Math.round((attended / total) * 100);
        return {
          day,
          value: percentage,
          date: studentsWithDays[0]?.days[day - 1]?.updated_at,
        };
      }).filter((l) => l.date !== null);
      const sortedByAscDate = averageEachDay.sort((a, b) => new Date(a.date) - new Date(b.date));

      setAllStudentsWithDays({
        studentList: studentsWithDays,
        averageEachDay: sortedByAscDate,
      });
      setSearchedStudents(studentsWithDays);
      setLoadStatus({
        loading: false,
        status: 'success',
      });
      setTimeout(() => {
        setShowSearch(true);
      }, 300);
    }
    if (currentStudentList.length <= 0) {
      setLoadStatus({
        loading: false,
        status: 'no-data',
      });
    }
    if (currentDaysLogExists <= 0) {
      setLoadStatus({
        loading: false,
        status: 'no-attendance-list-found',
      });
    }

    return () => {};
  }, [currentStudentList, currentDaysLog, selectedCohort?.durationInDays, loadingStudents]);

  const handleSearch = (e) => {
    const { value } = e.target;

    const filteredStudents = allStudentsWithDays?.studentList?.filter((l) => {
      const fullName = `${l.user.first_name} ${l.user.last_name}`;

      return fullName.toLowerCase().includes(value.toLowerCase());
    });

    setSearchedStudents(filteredStudents);
  };

  const sortedByNameAndAttendance = searchedStudents?.sort((a, b) => {
    const fullNameA = `${a.user.first_name} ${a.user.last_name}`;
    const fullNameB = `${b.user.first_name} ${b.user.last_name}`;
    const aAverage = calcDaysAverage(a.days);
    const bAverage = calcDaysAverage(b.days);

    if (sortSettings.percentage === undefined) {
      if (sortSettings.name === true) {
        return fullNameA.localeCompare(fullNameB);
      }
      return fullNameB.localeCompare(fullNameA);
    }
    if (sortSettings.name === undefined) {
      if (sortSettings.percentage === true) {
        return bAverage - aAverage;
      }
      return aAverage - bAverage;
    }

    return bAverage - aAverage;
  });

  return (
    <>
      <GridContainer margin="18px auto 0 auto" withContainer>
        <Link
          href={selectedCohort ? `/cohort/${selectedCohort.slug}/${selectedCohort.syllabus?.slug}/v${selectedCohort.syllabus?.version}` : '/choose-program'}
          color="blue.default"
          display="inline-block"
          letterSpacing="0.05em"
          fontWeight="700"
        >
          {`← ${t('back-to')}`}
        </Link>
      </GridContainer>
      <Box display="flex" maxW="1148px" m="0 auto" justifyContent="space-between" padding="45px 0 28px 0" borderBottom="1px solid" borderColor={borderColor} flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '0', md: '10px' }} alignItems={{ base: 'start', md: 'center' }}>
        <Box display="flex" alignItems="center" gridGap="8px">
          <Heading size="m" style={{ margin: '0' }} padding={{ base: '0', md: '0 0 5px 0 !important' }}>
            {`${t('title')}:`}
          </Heading>
          {allCohorts.length > 0 && (
            <ReactSelect
              unstyled
              color="#0097CD"
              fontWeight="700"
              id="cohort-select"
              fontSize="28px"
              placeholder={t('common:select-cohort')}
              noOptionsMessage={() => t('common:no-options-message')}
              // defaultInputValue={selectedCohort?.label}
              value={selectedCohort || ''}
              onChange={(cohort) => {
                if (cohort.slug !== cohortSlug) {
                  setLoadStatus({
                    loading: true,
                    status: 'loading',
                  });
                  setLoadingStudents(true);
                  setCurrentStudentList([]);
                  setSelectedCohort(cohort);
                  router.push({
                    query: {
                      ...router.query,
                      cohortSlug: cohort.slug,
                    },
                  });
                }
              }}
              options={allCohorts}
            />
          )}
        </Box>
        {(loadStatus.loading === false && loadStatus.status === 'success') && (
          <KPI
            label={t('title')}
            value={calcStudentDaysAverage()}
            valueUnit="%"
            delta={null}
            deltaLabel={null}
            chart={(
              <Sparkline
                width="200"
                chartStyle={{
                  top: '-35px',
                  left: '5px',
                }}
                containerWidth="200px"
                height="60"
                values={allStudentsWithDays.averageEachDay}
                tooltipContent="{value}% - {date}"
              />
            )}
            unstyled
          />
        )}

        {loadStatus.status === 'loading' && (
          <SimpleSkeleton height="67.5px" width="280px" />
        )}
      </Box>
      <GridContainer
        flexDirection="column"
        // maxW="1080px"
        withContainer
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
              isDisabled={!showSearch}
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
                  {t('filter.sort-by')}
                </Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody display="flex" flexDirection="column" alignItems="flex-start" pl={4}>
                <Button variant="unstyled" onClick={() => setSortSettings({ name: !sortSettings.name })}>
                  {`${t('filter.sort-by-name')} ${typeof sortSettings.name === 'boolean' ? sortSettings.name ? '▼' : '▲' : ''}`}
                </Button>
                <Button variant="unstyled" onClick={() => setSortSettings({ percentage: !sortSettings.percentage })}>
                  {`${t('filter.sort-by-percentage')} ${typeof sortSettings.percentage === 'boolean' ? sortSettings.percentage ? '▼' : '▲' : ''}`}
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

            {loadStatus.loading === false && loadStatus.status === 'success' && sortedByNameAndAttendance.map((student) => {
              const fullName = `${student.user.first_name} ${student.user.last_name}`;
              const percentAttendance = `${student.percentage}% ${t('attendance')}`;

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
            })}

            {loadStatus.status === 'loading' && <DottedTimelineSkeleton />}

            {loadStatus.loading === false && loadStatus.status === 'no-attendance-list-found' && (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Text
                  color={hexColor.grayDefault}
                  size="18px"
                  fontWeight={700}
                  textAlign="center"
                  dangerouslySetInnerHTML={{ __html: t('no-attendance-list-found') }}
                />
              </Box>
            )}

            {loadStatus.loading === false && loadStatus.status === 'no-data' && (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Text color={hexColor.grayDefault} size="18px" fontWeight={700}>
                  {t('no-content-to-show')}
                </Text>
              </Box>
            )}
          </Flex>
        </Box>
      </GridContainer>
    </>
  );
}

export default asPrivate(Attendance);
