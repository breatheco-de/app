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
      <Box align="center" alignContent="center" width="50%" marginTop="47px">
        <Image src={logo} height="67px" width="67px" />
        <Tabs marginTop="67px">
          <TabList justifyContent="center" width="365px">
            <Tab _selected={{ color: 'gray.dark', bg: 'white', borderBottomColor: 'blue.default' }} color="gray.default" boxShadow="none !important" fontWeight="600" width="182px" backgroundColor="white" padding="17px" borderBottomColor="gray.200" borderTop="none" borderRight="none" borderLeft="none">Log In</Tab>
            <Tab _selected={{ color: 'gray.dark', bg: 'white', borderBottomColor: 'blue.default' }} color="gray.default" boxShadow="none !important" fontWeight="600" width="182px" backgroundColor="white" padding="17px" borderBottomColor="gray.200" borderTop="none" borderRight="none" borderLeft="none">Registration</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Button cursor="pointer" width="365px" variant="outline" weight="700" marginTop="57px">
                <Icon icon="github" width="18px" height="18px" />
                <Text fontSize="13px" marginLeft="10px">LOG IN WITH GITHUB</Text>
              </Button>
              <Box display="flex" justifyContent="center" width="100%">
                <Box borderBottom="solid 1px #DADADA" width="165px" marginBottom="38px" marginRight="13px" />
                <Box marginBottom="30px" marginTop="30px" color="gray.default">or</Box>
                <Box borderBottom="solid 1px #DADADA" width="165px" marginBottom="38px" marginLeft="14px" />
              </Box>
              <FormControl id="email" marginBottom="35px" borderRadius="3px">
                <Input type="email" placeholder="Email" height="50px" width="365px" autoComplete="off" borderColor="gray.default" borderRadius="3px" />
              </FormControl>
              <FormControl id="password" borderRadius="3px">
                <Input type="password" placeholder="Password" height="50px" width="365px" borderColor="gray.default" borderRadius="3px" />
              </FormControl>
              <Box color="blue.default" fontWeight="700" align="center" marginLeft="245px">Reset Password</Box>
              <Button disabled="True" variant="default" marginTop="70px" width="365px" fontSize="l" color="gray.dark">LOGIN</Button>
            </TabPanel>
            <TabPanel width="365px" padding="0px">
              <FormControl marginTop="22px">
                <Text color="gray.default" fontSize="sm" float="left" marginBottom="px">Full Name </Text>
                <Input type="fullName" placeholder="Andrea Castillo" height="50px" width="365px" borderColor="gray.default" borderRadius="3px" />
              </FormControl>
              <FormControl>
                <Text color="gray.default" fontSize="sm" float="left" marginBottom="px">Email </Text>
                <Input type="email" placeholder="Andrea@4geeks.co" height="50px" width="365px" borderColor="gray.default" borderRadius="3px" />
              </FormControl>
              <FormControl>
                <Text color="gray.default" fontSize="sm" float="left" marginBottom="px">Date of Birth </Text>
                <Input type="" placeholder="29 / 10 / 1990" height="50px" width="365px" borderColor="gray.default" borderRadius="3px" />
              </FormControl>
              <FormControl>
                <Text color="gray.default" fontSize="sm" float="left" marginBottom="px">Password </Text>
                <Input type="password" placeholder="***********" height="50px" width="365px" borderColor="gray.default" borderRadius="3px" />
              </FormControl>
              <FormControl>
                <Text color="gray.default" fontSize="sm" float="left" marginBottom="px">Repeat Password </Text>
                <Input type="password" placeholder="***********" height="50px" width="365px" borderColor="gray.default" borderRadius="3px" />
              </FormControl>
              <Button variant="default" marginTop="33px" width="365px" fontSize="l">REGISTER</Button>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <Image src={bg} quality="100" placeholder="blur" height="100vh" width="900px" />
    </Box>
  );
}

export default login;
