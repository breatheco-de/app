import React from 'react';
import {
  Text,
  Box,
  FormControl,
  Input,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import Image from 'next/image';
import logo from '../../public/static/images/bc_logo.png';
import bg from '../../public/static/images/main-bg1.png';
import Icon from '../common/components/Icon/index';

function login() {
  return (
    <Box display="flex" justifyContent="space-between" marginBottom="47px" margin="0px" height="100vh">
      <Box align="center" alignContent="center" width="365px" width="50%" marginTop="47px">
        <Image src={logo} height="67px" width="67px" />
        <Tabs marginTop="67px">
          <TabList justifyContent="center" width="365px">
            <Tab boxShadow="none !important" fontWeight="600" width="182px" backgroundColor="white" padding="17px" borderBottomColor="gray.200" borderTop="none" borderRight="none" borderLeft="none" color="gray.dark">Log In</Tab>
            <Tab boxShadow="none !important" fontWeight="600" width="182px" backgroundColor="white" padding="17px" borderBottomColor="gray.200" borderTop="none" borderRight="none" borderLeft="none" color="gray.dark">Registration</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Button cursor="pointer" width="365px" variant="outline" weight="700" marginTop="57px">
                <Icon icon="github" width="18px" height="18px" />
                <Text fontSize="13px" marginLeft="10px">LOG IN WITH GITHUB</Text>
              </Button>
              <Box display="flex" justifyContent="center" width="100%">
                <Box borderBottom="solid 1px #DADADA" width="165px" marginBottom="38px" marginRight="13px" />
                <Box marginBottom="30px" marginTop="30px" color="gray.default" fontSize="m">or</Box>
                <Box borderBottom="solid 1px #DADADA" width="165px" marginBottom="38px" marginLeft="14px" />
              </Box>
              <FormControl id="email" marginBottom="35px" borderRadius="3px">
                <Input type="email" placeholder="Email" height="50px" width="365px" autoComplete="off" borderColor="gray.default" />
              </FormControl>
              <FormControl id="password" borderRadius="3px">
                <Input type="password" placeholder="Password" height="50px" width="365px" borderColor="gray.default" />
              </FormControl>
              <Box color="blue.default" fontWeight="700" align="center" marginLeft="245px">Reset Password</Box>
              <Button disabled="True" variant="default" marginTop="70px" width="365px" fontSize="l" color="gray.dark">Login</Button>
            </TabPanel>
            <TabPanel>
              <p>More coming soon...</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
        {/* <Box display="flex" marginTop="67px" justifyContent="space-evenly" fontFamily="Lato" fontWeight="900" size="15px" borderBottom="1px solid #E5E5E5" width="365px" height="38px" marginBottom="74px">
          <Box align="center" color="#3A3A3A" borderBottom="3px solid #0097CF" height="38px" width="182px">LOG IN</Box>
          <Box color="#A4A4A4" width="182px">REGISTRATION</Box>
        </Box> */}
        {/* <Button cursor="pointer" width="365px" variant="outline" weight="700">
          <Icon icon="github" width="18px" height="18px" />
          <Text fontSize="13px" marginLeft="10px">LOG IN WITH GITHUB</Text>
        </Button>
        <Box display="flex" justifyContent="center" width="100%">
          <Box borderBottom="solid 1px #DADADA" width="165px" marginBottom="38px" marginRight="13px" />
          <Box marginBottom="30px" marginTop="30px" color="gray.default" fontSize="m">or</Box>
          <Box borderBottom="solid 1px #DADADA" width="165px" marginBottom="38px" marginLeft="14px" />
        </Box>
        <FormControl id="email" marginBottom="35px" borderRadius="3px">
          <Input type="email" placeholder="Email" height="50px" width="365px" autoComplete="off" borderColor="gray.default" />
        </FormControl>
        <FormControl id="password" borderRadius="3px">
          <Input type="password" placeholder="Password" height="50px" width="365px" borderColor="gray.default" />
        </FormControl>
        <Box color="blue.default" fontWeight="700" align="center" marginLeft="245px">Reset Password</Box>
        <Button disabled="True" variant="default" marginTop="70px" width="365px" fontSize="l" color="gray.dark">Login</Button> */}
      </Box>
      <Image src={bg} quality="100" placeholder="blur" height="100vh" width="900px" />
    </Box>
  );
}

export default login;
