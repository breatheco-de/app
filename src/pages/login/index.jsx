import useTranslation from 'next-translate/useTranslation';
import {
  Flex, Stack, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Image, useColorModeValue,
} from '@chakra-ui/react';
// import I from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
// import logo from '../../../public/static/images/bc_logo.png';
import getT from 'next-translate/getT';
import Login from '../../common/components/Forms/LogIn';
import Register from '../../common/components/Forms/Register';
import useAuth from '../../common/hooks/useAuth';
import Icon from '../../common/components/Icon';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'login');
  const keywords = t('seo.keywords', {}, { returnObjects: true });

  const ogUrl = {
    en: '/login',
    us: '/login',
  };

  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        keywords,
        locales,
        locale,
        url: ogUrl.en || `/${locale}/login`,
        pathConnector: '/login',
      },
      fallback: false,
    },
  };
};

function login() {
  const { t } = useTranslation('login');
  const { user } = useAuth();
  const router = useRouter();
  const fontColor = useColorModeValue('gray.default', 'gray.400');
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');

  useEffect(() => {
    if (user !== null && user !== undefined) {
      router.push('/choose-program');
    }
  }, [user]);

  return (
    <Stack minH={{ base: 'auto', md: '100vh' }} direction={{ md: 'row' }}>
      <Flex p={{ base: '20px 0', sm: 8 }} flex={1} align="center" justify="center">
        <Stack spacing={4} w="full" maxW="md">
          <Box display={{ base: 'none', md: 'block' }} align="center" justify="center">
            <Icon icon="logoModern" width="200px" height="100px" />
          </Box>
          <Stack spacing={6}>
            <Tabs isFitted variant="enclosed">
              <Stack spacing={8}>
                <TabList align="center" justify="center">
                  <Tab
                    _selected={{
                      color: 'blue.default',
                      borderBottomColor: 'blue.default',
                      borderBottomWidth: '3px',
                    }}
                    color={fontColor}
                    boxShadow="none !important"
                    fontWeight="600"
                    padding="17px"
                    borderBottomColor={commonBorderColor}
                    borderTop="none"
                    borderRight="none"
                    borderLeft="none"
                  >
                    {t('login')}
                  </Tab>
                  <Tab
                    _selected={{
                      color: 'blue.default',
                      borderBottomColor: 'blue.default',
                      borderBottomWidth: '3px',
                    }}
                    color={fontColor}
                    boxShadow="none !important"
                    fontWeight="600"
                    padding="17px"
                    borderBottomColor={commonBorderColor}
                    borderTop="none"
                    borderRight="none"
                    borderLeft="none"
                  >
                    {t('register')}
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
