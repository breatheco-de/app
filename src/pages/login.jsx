import {
  Flex, Stack, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Image,
} from '@chakra-ui/react';
import I from 'next/image';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import logo from '../../public/static/images/bc_logo.png';
import Login from '../common/components/Forms/LogIn';
import Register from '../common/components/Forms/Register';
import useAuth from '../common/hooks/useAuth';

export const getStaticProps = async ({ locale }) => ({
  props: {
    fallback: false,
    ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
  },
});

function login() {
  const { user, logout } = useAuth();
  console.log('USER:::', user);

  return (
    <Stack minH="100vh" direction={{ md: 'row' }}>
      <Flex p={8} flex={1} align="center" justify="center">
        <Stack spacing={4} w="full" maxW="md">
          <Box align="center" justify="center">
            <I src={logo} height="67px" width="67px" />
          </Box>
          {user !== null && user !== undefined && (
            <>
              <Box align="center" textAlign="center" width="100%" fontSize="30px">
                Welcome
                {' '}
                {user.data.first_name}
              </Box>

              <Box
                as="button"
                onClick={logout}
                align="center"
                textAlign="center"
                width="100%"
                fontSize="30px"
              >
                Logout
              </Box>
            </>
          )}
          <Stack spacing={6}>
            <Tabs isFitted variant="enclosed">
              <Stack spacing={8}>
                <TabList align="center" justify="center">
                  <Tab
                    _selected={{
                      color: 'gray.dark',
                      bg: 'white',
                      borderBottomColor: 'blue.default',
                      borderBottomWidth: '3px',
                    }}
                    color="gray.default"
                    boxShadow="none !important"
                    fontWeight="600"
                    backgroundColor="white"
                    padding="17px"
                    borderBottomColor="gray.200"
                    borderTop="none"
                    borderRight="none"
                    borderLeft="none"
                  >
                    Log In
                  </Tab>
                  <Tab
                    _selected={{
                      color: 'gray.dark',
                      bg: 'white',
                      borderBottomColor: 'blue.default',
                      borderBottomWidth: '3px',
                    }}
                    color="gray.default"
                    boxShadow="none !important"
                    fontWeight="600"
                    backgroundColor="white"
                    padding="17px"
                    borderBottomColor="gray.200"
                    borderTop="none"
                    borderRight="none"
                    borderLeft="none"
                  >
                    Registration
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Login />
                  </TabPanel>
                  <TabPanel>
                    <Register />
                  </TabPanel>
                </TabPanels>
              </Stack>
            </Tabs>
          </Stack>
        </Stack>
      </Flex>
      <Flex
        flex={1}
        display={{
          base: 'none',
          sm: 'none',
          md: 'none',
          lg: 'block',
          xl: 'block',
        }}
      >
        {/* <Box width="100%"> */}
        <Image
          height="100%"
          width="100%"
          objectFit="cover"
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80"
        />
        {/* </Box> */}
      </Flex>
    </Stack>
  );
}

export default login;
