import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Container,
} from '@chakra-ui/react';
import mockData from '../common/utils/mockData/DashboardView';
import NextChakraLink from '../common/components/NextChakraLink';
import TagCapsule from '../common/components/TagCapsule';
import ModuleMap from '../common/components/ModuleMap';
import useModuleMap from '../common/store/actions/moduleMapAction';
import CohortSideBar from '../common/components/CohortSideBar';
import Icon from '../common/components/Icon';
import SupportSidebar from '../common/components/SupportSidebar';
import CallToAction from '../common/components/CallToAction';
import ProgressBar from '../common/components/ProgressBar';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';

const Dashboard = () => {
  const { updateModuleStatus } = useModuleMap();
  const handleModuleStatus = (event, module) => {
    event.stopPropagation();
    if (module.status === 'inactive') updateModuleStatus({ ...module, status: 'active' });
    else if (module.status === 'active') updateModuleStatus({ ...module, status: 'finished' });
    else if (module.status === 'finished') updateModuleStatus({ ...module, status: 'active' });
  };
  const {
    tapCapsule, callToAction, moduleMap, cohortSideBar, supportSideBar, progressBar,
  } = mockData;

  return (
    <div>
      <Container maxW="container.xl">
        <Box marginTop="17px" marginBottom="17px">
          <NextChakraLink
            href="/"
            color="#0097CF"
            _focus={{ boxShadow: 'none', color: '#0097CF' }}
          >
            <Icon
              icon="arrowLeft"
              width="20px"
              height="20px"
              style={{ marginBottom: '-4px', marginRight: '4px' }}
              color="#0097CF"
            />
            Back to Dashboard
          </NextChakraLink>
        </Box>
        <Grid
          h="200px"
          templateRows="repeat(1, 1fr)"
          templateColumns="repeat(12, 1fr)"
          gap={16}
        >
          <GridItem colSpan={8}>
            <Heading as="h1" size="xl">
              Full Stack Developer
            </Heading>
            <TagCapsule tags={tapCapsule.tags} separator={tapCapsule.separator} />
            <Text size="md">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis
              nostrud exercitation ullamco laboris.
            </Text>
            <Box>
              <CallToAction
                background={callToAction.background}
                title={callToAction.title}
                text={callToAction.text}
                width="100%"
              />
            </Box>
            <Box marginTop="36px">
              <ProgressBar
                programs={progressBar.programs}
                progressText={progressBar.progressText}
                width="100%"
              />
            </Box>
            <Box height="1px" bg="gray.dark" marginY="32px" />
            <Box>
              <Heading size="m">MODULE MAP</Heading>
            </Box>
            <Box marginTop="30px">
              <ModuleMap
                title={moduleMap.title}
                description={moduleMap.description}
                modules={moduleMap.modules}
                handleModuleStatus={handleModuleStatus}
                width="100%"
              />
            </Box>
          </GridItem>
          <GridItem colSpan={4}>
            <CohortSideBar
              title={cohortSideBar.title}
              cohortCity={cohortSideBar.cohortCity}
              professor={cohortSideBar.professor}
              assistant={cohortSideBar.assistant}
              classmates={cohortSideBar.classmates}
              width="100%"
            />
            <Box marginTop="30px">
              <SupportSidebar
                title={supportSideBar.title}
                subtitle={supportSideBar.subtitle}
                actionButtons={supportSideBar.actionButtons}
                width="100%"
              />
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
