/* eslint-disable react/no-array-index-key */
import {
  Box,
  Heading,
  Divider,
  Grid,
  Link,
  useColorMode,
  WrapItem,
  Avatar,
  AvatarBadge,
  Tooltip,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Text from './Text';

const CohortSideBar = ({
  title,
  cohortCity,
  professor,
  assistant,
  classmates,
  background,
  width,
  handleStudySession,
  handleTeacher,
  handleStudent,
  handleAssistant,
}) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      width={width}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={colorMode === 'light' ? background || 'blue.light' : 'featuredDark'}
    >
      <Box padding={26}>
        <Heading
          as="h4"
          fontSize={15}
          fontWeight="900"
          margin={0}
          lineHeight="18px"
          letterSpacing="0.05em"
          marginBottom={18}
        >
          ABOUT YOUR COHORT
        </Heading>
        <Box d="flex" alignItems="center" marginBottom={18}>
          <Icon icon="group" width="39px" height="39px" />
          <Box marginLeft={13}>
            <Heading as="h4" fontSize={15} fontWeight="700" lineHeight="18px" margin={0}>
              {title}
            </Heading>
            <Text size="l" fontWeight="400" lineHeight="18px" margin={0}>
              {cohortCity}
            </Text>
          </Box>
        </Box>
        <Box d="flex" alignItems="center">
          <Tooltip label={professor.name} placement="top">
            <WrapItem justifyContent="center" alignItems="center" onClick={handleTeacher}>
              <Avatar
                width="39px"
                height="39px"
                name={professor.name}
                src={professor.image}
              >
                <AvatarBadge
                  boxSize="9px"
                  bg={professor.active ? 'success' : 'danger'}
                  top="0"
                  border="1px solid"
                />
              </Avatar>
            </WrapItem>
          </Tooltip>
          <Box marginLeft={13}>
            <Heading as="h4" fontSize={15} fontWeight="700" lineHeight="tight" margin={0}>
              Main Teacher
            </Heading>
            <Text size="l" fontWeight="400" lineHeight="18px" margin={0}>
              {professor.name}
            </Text>
          </Box>
        </Box>
      </Box>
      <Divider margin={0} style={{ borderColor: '#DADADA' }} />
      <Box padding="0 26px">
        <Heading as="h4" padding="25px 0 8px 0" fontSize={15} lineHeight="18px" margin={0}>
          Assistant Professors
        </Heading>
        {assistant && (
          <>
            <Grid
              gridAutoRows="3.4rem"
              templateColumns="repeat(auto-fill, minmax(3.5rem, 1fr))"
              gap={0}
            >
              {assistant.map((a, i) => (
                <Tooltip key={`${a.name}-${a.active}`} label={a.name} placement="top">
                  <WrapItem justifyContent="center" alignItems="center" onClick={(e) => handleAssistant(e, a.name)}>
                    <Avatar
                      key={i}
                      width="39px"
                      height="39px"
                      name={a.name}
                      src={a.image}
                    >
                      <AvatarBadge
                        boxSize="9px"
                        bg={a.active ? 'success' : 'danger'}
                        top="0"
                        border="1px solid"
                      />
                    </Avatar>
                  </WrapItem>
                </Tooltip>
              ))}
            </Grid>
          </>
        )}
        <Heading as="h4" padding="25px 0 8px 0" fontSize={15} lineHeight="18px" margin={0}>
          Your Classmates
        </Heading>
        <Grid
          gridAutoRows="3.4rem"
          templateColumns="repeat(auto-fill, minmax(3.5rem, 1fr))"
          gap={0}
        >
          {classmates.map((c, i) => (
            <Tooltip label={c.name} placement="top">
              <WrapItem justifyContent="center" alignItems="center" onClick={(e) => handleStudent(e, c.name)}>
                <Avatar
                  key={i}
                  width="39px"
                  height="39px"
                  name={c.name}
                  src={c.image}
                >
                  <AvatarBadge
                    boxSize="9px"
                    bg={c.active ? 'success' : 'danger'}
                    top="0"
                    border="1px solid"
                  />
                </Avatar>
              </WrapItem>
            </Tooltip>
          ))}
        </Grid>
      </Box>
      <Box textAlign="center" padding="30px 0">
        <Link
          href="/"
          color="blue.default"
          fontWeight="700"
          fontSize={15}
          lineHeight="22px"
          letterSpacing="0.05em"
          onClick={handleStudySession}
        >
          Create a study session
        </Link>
      </Box>
    </Box>
  );
};

CohortSideBar.propTypes = {
  width: PropTypes.string,
  title: PropTypes.string,
  cohortCity: PropTypes.string,
  professor: PropTypes.objectOf(PropTypes.object),
  assistant: PropTypes.arrayOf(PropTypes.array),
  classmates: PropTypes.arrayOf(PropTypes.array),
  background: PropTypes.string,
  handleStudySession: PropTypes.func,
  handleTeacher: PropTypes.func,
  handleStudent: PropTypes.func,
  handleAssistant: PropTypes.func,
};
CohortSideBar.defaultProps = {
  width: '352px',
  title: '',
  cohortCity: '',
  professor: {
    name: 'Jhon doe',
    image: '',
    active: true,
  },
  assistant: [
    {
      active: false,
      image: '',
      name: '',
    },
  ],
  classmates: [
    {
      active: true,
      image: '',
      name: 'jhon',
    },
  ],
  background: '',
  handleTeacher: () => {
  },
  handleStudySession: () => {
  },
  handleStudent: () => {
  },
  handleAssistant: () => {
  },
};

export default CohortSideBar;
