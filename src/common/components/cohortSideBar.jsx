import {
  Box, Heading, Text, Image, Divider, Grid, Link, useColorMode,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';

const CohortSideBar = ({
  title, cohortCity, professor, assistant, classmates, background,
}) => {
  const { colorMode } = useColorMode();
  return (
    <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden" bg={colorMode === 'light' ? background || 'lightBlue' : 'featuredDark'}>
      <Box padding={26}>
        <Heading as="h4" size="md" fontWeight="900" margin={0} marginBottom={18}>ABOUT YOUR COHORT</Heading>
        <Box d="flex" alignItems="center" marginBottom={18}>
          <Icon icon="group" width="39px" height="39px" />
          <Box marginLeft={13}>
            <Heading as="h4" size="md" lineHeight="tight" margin={0}>{title}</Heading>
            <Text fontSize="md" lineHeight="tight" margin={0}>{cohortCity}</Text>
          </Box>
        </Box>
        <Box d="flex" alignItems="center">
          <Box>
            <Box width="9px" height="9px" borderRadius="full" bg={professor.active ? 'success' : 'danger'} position="relative" left="30px" top="11px" border="1px solid white" />
            <Image margin="auto" borderRadius="full" width="39px" height="39px" src="https://storage.googleapis.com/media-breathecode/639857ed0ceb0a5e5e0429e16f7e3a84365270a0977fb94727cc3b6450d1ea9a" />
          </Box>
          <Box marginLeft={13}>
            <Heading as="h4" size="md" lineHeight="tight" margin={0}>Main Teacher</Heading>
            <Text fontSize="md" lineHeight="tight" margin={0}>{professor.name}</Text>
          </Box>
        </Box>
      </Box>
      <Divider margin={0} style={{ borderColor: '#DADADA' }} />
      <Box padding={26}>
        {assistant ? (
          <>
            <Box>
              <Heading as="h4" size="md" lineHeight="tight" margin={0}>Assistant Professors</Heading>
            </Box>
            <Grid templateColumns="repeat(5, 1fr)" gap={0}>
              {assistant.map((a, i) => (
                <Box margin="6px">
                  <Box width="9px" height="9px" borderRadius="full" bg={a.active ? 'success' : 'danger'} position="relative" left="30px" top="11px" border="1px solid white" />
                  <Image key={i} margin="auto" borderRadius="full" width="39px" height="39px" src="https://storage.googleapis.com/media-breathecode/639857ed0ceb0a5e5e0429e16f7e3a84365270a0977fb94727cc3b6450d1ea9a" />
                </Box>
              ))}
            </Grid>
          </>
        ) : null}
        <Box>
          <Heading as="h4" size="md" lineHeight="tight" margin={0}>Your Classmates</Heading>
        </Box>
        <Grid templateColumns="repeat(5, 1fr)" gap={0}>
          {classmates.map((c, i) => (
            <Box margin="6px">
              <Box width="9px" height="9px" borderRadius="full" bg={c.active ? 'success' : 'danger'} position="relative" left="30px" top="11px" border="1px solid white" />
              <Image key={i} margin="auto" borderRadius="full" width="39px" height="39px" src="https://storage.googleapis.com/media-breathecode/639857ed0ceb0a5e5e0429e16f7e3a84365270a0977fb94727cc3b6450d1ea9a" />
            </Box>
          ))}
        </Grid>
      </Box>
      <Box textAlign="center" padding={26}>
        <Link color="blue" href="/" fontWeight="bold">
          Create a study session
        </Link>
      </Box>
    </Box>
  );
};

CohortSideBar.propTypes = {
  title: PropTypes.string,
  cohortCity: PropTypes.string,
  professor: PropTypes.object,
  assistant: PropTypes.array,
  classmates: PropTypes.array,
  background: PropTypes.string,
};
CohortSideBar.defaultProps = {
  title: 'Test Cohort Side Bar',
  cohortCity: 'Miami Downtown',
  professor: {
    name: 'Paolo Lucano',
    image: '',
    active: true,
  },
  assistant: [
    {
      active: false,
      image: 'image.com/...',
    },
    {
      active: true,
      image: '',
    },
  ],
  classmates: [
    {
      active: true,
      image: '',
    },
    {
      active: true,
      image: '',
    },
    {
      active: true,
      image: '',
    },
    {
      active: true,
      image: '',
    },
    {
      active: true,
      image: '',
    },
  ],
  background: '',
};

export default CohortSideBar;
