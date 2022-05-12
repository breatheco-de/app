import {
  Avatar,
  Box, Tab, TabList, TabPanel, TabPanels, Tabs, useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { memo } from 'react';
// import { useState } from 'react';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import useAuth from '../../common/hooks/useAuth';
import ProfileForm from './profileForm';
// import useTranslation from 'next-translate/useTranslation';
const Profile = () => {
  const { t } = useTranslation('profile');
  const { user } = useAuth();
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const tabListMenu = t('tabList', {}, { returnObjects: true });
  // const [tabIndex, setTabIndex] = useState(0);
  // const colors = useColorModeValue(
  //   ['red.50', 'teal.50', 'blue.50'],
  //   ['red.900', 'teal.900', 'blue.900'],
  // );
  // const bg = colors[tabIndex];

  const getImage = () => {
    if (user && user.github) {
      return user.github.avatar_url;
    }
    return '';
  };

  return (
    <Box margin={{ base: '3% 4% 0px', md: '3% 10% 0px' }}>
      <Heading as="h1" size="m" margin="45px 0">{t('navbar:my-profile')}</Heading>
      <Tabs display="flex" flexDirection={{ base: 'column', md: 'row' }} variant="unstyled" gridGap="40px">
        <TabList display="flex" flexDirection="column" width="300px">
          {tabListMenu.map((tab) => (
            <Tab
              key={tab.title}
              p="14px"
              display="block"
              textAlign="start"
              isDisabled={tab.disabled}
              textTransform="uppercase"
              fontWeight="900"
              fontSize="13px"
              letterSpacing="0.05em"
              // height="100%"
              _selected={{
                color: 'blue.default',
                borderLeft: '4px solid',
                borderColor: 'blue.default',
              }}
              _disabled={{
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
            >
              {tab.title}
            </Tab>
          ))}
        </TabList>
        <TabPanels p="0">
          <TabPanel p="0">
            <Text fontSize="15px" fontWeight="700" pb="18px">
              {t('basic-profile-info')}
            </Text>
            <Box display="flex" gridGap="38px" width="100%" height="auto" borderRadius="17px" border="1px solid" borderColor={commonBorderColor} p="30px">
              {/* <Box height="140px" width="140px"
              minWidth="140px" borderRadius="50%" border="1px solid">
                Avatar
              </Box> */}
              <Avatar
                // name={user?.first_name}
                width="140px"
                margin="0"
                height="140px"
                src={getImage()}
              />
              <ProfileForm user={user} />
            </Box>
          </TabPanel>
          <TabPanel p="0">certificates here!</TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default memo(Profile);
