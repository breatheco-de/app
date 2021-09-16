import React from 'react';
import Navbar from '../common/components/Navbar';
import mockData from '../common/utils/mockData/DashboardView';
import { Container } from '@chakra-ui/layout';
import NextChakraLink from '../common/components/NextChakraLink';
import TagCapsule from '../common/components/TagCapsule';
import ModuleMap from '../common/components/ModuleMap';
import useModuleMap from '../common/store/actions/moduleMapAction';
import CohortSideBar from '../common/components/CohortSideBar';
import Icon from '../common/components/Icon';
import SupportSidebar from "../common/components/SupportSidebar";
import CallToAction from '../common/components/CallToAction';
import {
    Box,
    Grid,
    GridItem,
    Heading,
    Text
} from '@chakra-ui/react';

export default {
    title: 'Views/Dashboard',
    argTypes: {
    }
}

const Component = (args) => {
    const { updateModuleStatus } = useModuleMap();
    const handleModuleStatus = (event, module) => {
        event.stopPropagation()
        if (module.status === 'inactive') updateModuleStatus({ ...module, status: 'active' })
        else if (module.status === 'active') updateModuleStatus({ ...module, status: 'finished' })
        else if (module.status === 'finished') updateModuleStatus({ ...module, status: 'active' })
    };
    return <div>
        <Navbar {...mockData.navbar} />
        <Container maxW="container.xl">
            <Box marginTop="17px" marginBottom="17px">
                <NextChakraLink
                    href={"/"}
                    color="#0097CF"
                    _focus={{ boxShadow: 'none', color: '#0097CF' }}
                >
                    <Icon
                        icon={"arrowLeft"}
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
                    <TagCapsule {...mockData.tapCapsule} />
                    <Text color="#606060" fontSize="14px">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</Text>
                    <CallToAction {...mockData.callToAction} />
                    <Box>
                        <Heading as="h6" fontSize="15px" color="gray.dark">MODULE MAP</Heading>
                    </Box>
                    <Box marginTop="30px">
                       <ModuleMap {...mockData.moduleMap} handleModuleStatus={handleModuleStatus} width={`100%`} /> 
                    </Box>
                </GridItem>
                <GridItem colSpan={4}>
                    <CohortSideBar  {...mockData.cohortSideBar} width={`100%`} />
                    <Box marginTop="30px">
                        <SupportSidebar {...mockData.supportSideBar} width={`100%`} />
                    </Box>
                </GridItem>
            </Grid>
        </Container>
    </div>
};

export const Default = Component.bind({});
Default.args = {

};