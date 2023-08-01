/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Container,
} from '@chakra-ui/react';
import Navbar from '../components/Navbar/Session';
import mockData from '../utils/mockData/DashboardView';
import NextChakraLink from '../components/NextChakraLink';
import TagCapsule from '../components/TagCapsule';
// import ModuleMap from '../components/ModuleMap';
// import useModuleMap from '../store/actions/moduleMapAction';
import CohortSideBar from '../components/CohortSideBar';
import Icon from '../components/Icon';
import SupportSidebar from '../components/SupportSidebar';
import CallToAction from '../components/CallToAction';
import ProgressBar from '../components/ProgressBar';
import Heading from '../components/Heading';
import Text from '../components/Text';

function Dashboard() {
  // const { updateModuleStatus } = useModuleMap();
  // const handleModuleStatus = (event, module) => {
  //   event.stopPropagation();
  //   if (module.status === 'inactive') updateModuleStatus({ ...module, status: 'active' });
  //   else if (module.status === 'active') updateModuleStatus({ ...module, status: 'finished' });
  //   else if (module.status === 'finished') updateModuleStatus({ ...module, status: 'active' });
  // };
  const {
    navbar, tapCapsule, callToAction, cohortSideBar, supportSideBar, progressBar,
  } = mockData;
  return (
    <div>
      <Navbar {...navbar} />
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
            <TagCapsule {...tapCapsule} />
            <Text size="md">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis
              nostrud exercitation ullamco laboris.
            </Text>
            <Box>
              <CallToAction {...callToAction} />
            </Box>
            <Box marginTop="36px">
              <ProgressBar {...progressBar} />
            </Box>
            <Box height="1px" bg="gray.dark" marginY="32px" />
            <Box>
              <Heading size="m">MODULE MAP</Heading>
            </Box>
            <Box marginTop="30px">
              {/* <ModuleMap {...moduleMap}
              handleModuleStatus={handleModuleStatus} width="100%" /> */}
            </Box>
          </GridItem>
          <GridItem colSpan={4}>
            <CohortSideBar {...cohortSideBar} width="100%" />
            <Box marginTop="30px">
              <SupportSidebar {...supportSideBar} width="100%" />
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </div>
  );
}

export default Dashboard;
