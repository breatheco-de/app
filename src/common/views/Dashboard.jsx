import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Container,
} from '@chakra-ui/react';
import Navbar from '../components/Navbar';
import mockData from '../utils/mockData/DashboardView';
import NextChakraLink from '../components/NextChakraLink';
import TagCapsule from '../components/TagCapsule';
import ModuleMap from '../components/ModuleMap';
import useModuleMap from '../store/actions/moduleMapAction';
import CohortSideBar from '../components/CohortSideBar';
import Icon from '../components/Icon';
import SupportSidebar from '../components/SupportSidebar';
import CallToAction from '../components/CallToAction';
import ProgressBar from '../components/ProgressBar';

const Dashboard = () => {
  const { updateModuleStatus } = useModuleMap();
  const handleModuleStatus = (event, module) => {
    event.stopPropagation();
    if (module.status === 'inactive') updateModuleStatus({ ...module, status: 'active' });
    else if (module.status === 'active') updateModuleStatus({ ...module, status: 'finished' });
    else if (module.status === 'finished') updateModuleStatus({ ...module, status: 'active' });
  };
  const {
    navbar, tapCapsule, callToAction, moduleMap, cohortSideBar, supportSideBar, progressBar,
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
            <Heading as="h1" size="2xl">
              Full Stack Developer
            </Heading>
            <TagCapsule {...tapCapsule} />
            <Text fontSize="14px">
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
            <Box height="1px" bg="#3A444C" marginY="32px" />
            <Box>
              <Heading as="h6" fontSize="15px">MODULE MAP</Heading>
            </Box>
            <Box marginTop="30px">
              <ModuleMap {...moduleMap} handleModuleStatus={handleModuleStatus} width="100%" />
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
};

export default Dashboard;
