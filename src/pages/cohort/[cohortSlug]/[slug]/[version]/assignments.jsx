import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useCookies } from 'react-cookie';
import {
  Box, Select, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from '../../../../../common/components/NextChakraLink';
import Heading from '../../../../../common/components/Heading';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import bc from '../../../../../common/services/breathecode';
import axios from '../../../../../axios';
import Text from '../../../../../common/components/Text';

const Assignments = () => {
  const { t } = useTranslation('assignments');
  const [cookies] = useCookies(['accessToken']);
  const router = useRouter();
  const { accessToken } = cookies;
  const toast = useToast();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [allCohorts, setAllCohorts] = useState([]);
  // const [defaultSelected, setDefaultSelected] = useState([]);
  const [studentTasks, setStudentTasks] = useState([]);

  const [selectedCohort, setSelectedCohort] = useState({});
  const [selectedCohortValue, setSelectedCohortValue] = useState(null);

  const { cohortSlug } = router.query;
  const linkColor = useColorModeValue('blue.default', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.900');

  axios.defaults.headers.common.Authorization = `Token ${accessToken}`;

  useEffect(() => {
    bc.admissions({ token: accessToken || null }).cohorts()
      .then(({ data }) => {
        const dataStruct = data.map((l) => ({
          label: l.name,
          slug: l.slug,
          value: l.id,
          academy: l.academy.id,
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
  }, []);

  useEffect(() => {
    const findSelectedCohort = allCohorts.find((l) => l.value === selectedCohortValue);
    const defaultCohort = allCohorts.find((l) => l.slug === cohortSlug);

    if (defaultCohort) {
      setSelectedCohort(findSelectedCohort || defaultCohort);
      // setDefaultSelected(defaultCohort);
    }
  }, [allCohorts, cohortSlug, selectedCohortValue]);

  useEffect(() => {
    if (selectedCohort) {
      Promise.all([
        // bc.todo({ user: studentId }).get(), // for filtering purposes
        bc.todo({ stu_cohort: selectedCohort.slug }).get(),
        bc.todo({ teacher: cohortSession.bc_id }).get(),
      ])
        .then(([tasks, myTodos]) => {
          console.log('teacher_todos:', myTodos.data);
          setStudentTasks(tasks.data !== undefined ? tasks.data.filter((l) => l.task_type === 'PROJECT') : []);
        })
        .catch((error) => {
          toast({
            title: t('alert-message:error-fetching-tasks'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          console.error('There was an error fetching the tasks', error);
        });
    }
  }, [cohortSlug, selectedCohort]);

  console.log('studentTasks:', studentTasks);

  console.log('selectedCohort:', selectedCohort);
  // console.log('defaultSelected:', defaultSelected);

  return (
    <>
      <Box display="flex" justifyContent="space-between" margin={{ base: '2% 4% 0 4%', lg: '2% 12% 0 12%' }}>
        <Link
          href="/"
          color={linkColor}
          display="inline-block"
          letterSpacing="0.05em"
          fontWeight="700"
        >
          {`← ${t('back-to')}`}
        </Link>
      </Box>
      <Box display="flex" borderBottom="1px solid" borderColor={borderColor} flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '0', md: '10px' }} p={{ base: '50px 4% 30px 4%', md: '50px 10% 30px 10%', lg: '50px 12% 30px 12%' }} alignItems={{ base: 'start', md: 'center' }}>
        <Heading size="m" style={{ margin: '0' }} padding={{ base: '0', md: '0 0 5px 0 !important' }}>
          {`${t('title')}:`}
        </Heading>
        {allCohorts.length > 0 && (
          <Select
            id="cohort-select"
            placeholder="Select cohort"
            style={{
              padding: '0 2rem 0 0',
            }}
            fontSize="20px"
            value={selectedCohort.value}
            onChange={(e) => setSelectedCohortValue(parseInt(e.target.value, 10))}
            width="auto"
            color="blue.default"
            border="0"
            cursor="pointer"
          >
            {allCohorts.map((cohort) => (
              <option key={cohort.value} id="cohort-option" value={cohort.value}>
                {`${cohort.academy} - ${cohort.label}`}
              </option>
            ))}
          </Select>
        )}
      </Box>
      <Box
        gridGap="20px"
        maxWidth="1012px"
        margin={{ base: '3% 4%', md: '3% 10% 4% 10%', lg: '3% 12% 4% 12%' }}
        p="0 0 30px 0"
        // borderBottom="1px solid"
        // borderColor={borderColor}
      >
        <Box
          borderRadius="3px"
          margin="0 auto"
          maxWidth="1012px"
          flexGrow={1}
        >
          <Box display="flex">
            <Text size="15px" display="flex" width="15vw" maxWidth="15vw" fontWeight="700">
              Status
            </Text>
            <Text size="15px" display="flex" width="60vw" maxWidth="60vw" fontWeight="700">
              Student and Assignments
            </Text>
            <Text size="15px" display="flex" width="10vw" maxWidth="10vw" fontWeight="700">
              Link
            </Text>
            <Text size="15px" display="flex" width="15vw" maxWidth="15vw" fontWeight="700">
              Actions
            </Text>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Assignments;
