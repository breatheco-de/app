import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useCookies } from 'react-cookie';
import {
  Box, Select, toast, useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from '../../../../../common/components/NextChakraLink';
import Heading from '../../../../../common/components/Heading';
import bc from '../../../../../common/services/breathecode';

const Assignments = () => {
  const [cookies] = useCookies(['accessToken']);
  const router = useRouter();
  const [allCohorts, setAllCohorts] = useState([]);
  const [defaultSelected, setDefaultSelected] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState([]);
  const [selectedCohortValue, setSelectedCohortValue] = useState(null);
  const { t } = useTranslation('assignments');

  const { cohortSlug } = router.query;
  const linkColor = useColorModeValue('blue.default', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.900');

  useEffect(() => {
    bc.admissions({ token: cookies.accessToken || null }).cohorts()
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
      setDefaultSelected(defaultCohort);
    }
  }, [allCohorts, cohortSlug, selectedCohortValue]);

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
            value={selectedCohort.value || defaultSelected.value}
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
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Box
          borderRadius="3px"
          margin="0 auto"
          maxWidth="1012px"
          flexGrow={1}
        >
          contenedor
        </Box>
      </Box>
    </>
  );
};

export default Assignments;
