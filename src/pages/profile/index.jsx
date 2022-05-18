import {
  Avatar,
  Box, Tab, TabList, TabPanel, TabPanels, Tabs, useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { memo, useEffect } from 'react';
// import { useState } from 'react';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import useAuth from '../../common/hooks/useAuth';
import { usePersistent } from '../../common/hooks/usePersistent';
import ProfileForm from './profileForm';
// import useTranslation from 'next-translate/useTranslation';
const Profile = () => {
  const { t } = useTranslation('profile');
  const { user } = useAuth();
  const [profile, setProfile] = usePersistent('profile', {});
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const tabListMenu = t('tabList', {}, { returnObjects: true });

  useEffect(() => {
    if (user) {
      setProfile({
        ...profile,
        ...user,
      });
    }
  }, [user]);
  // const [tabIndex, setTabIndex] = useState(0);
  // const colors = useColorModeValue(
  //   ['red.50', 'teal.50', 'blue.50'],
  //   ['red.900', 'teal.900', 'blue.900'],
  // );
  // const bg = colors[tabIndex];
  const hasAvatar = profile.github && profile.github.avatar_url && profile.github.avatar_url !== '';

  return (
    <Box margin={{ base: '3% 4% 0px', md: '3% 10% 0px' }}>
      <Heading as="h1" size="m" margin="45px 0">{t('navbar:my-profile')}</Heading>
      <Tabs display="flex" flexDirection={{ base: 'column', md: 'row' }} variant="unstyled" gridGap="40px">
        <TabList display="flex" flexDirection={{ base: 'row', md: 'column' }} width={{ base: '100%', md: '300px' }}>
          {tabListMenu.filter((l) => l.disabled !== true).map((tab) => (
            <Tab
              key={tab.title}
              p="14px"
              display="block"
              textAlign={{ base: 'center', md: 'start' }}
              isDisabled={tab.disabled}
              textTransform="uppercase"
              fontWeight="900"
              fontSize="13px"
              letterSpacing="0.05em"
              width={{ base: '100%', md: 'auto' }}
              // height="100%"
              _selected={{
                color: 'blue.default',
                borderLeft: { base: 'none', md: '4px solid' },
                borderBottom: { base: '4px solid', md: 'none' },
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
            <Box display="flex" flexDirection={{ base: 'column', lg: 'row' }} alignItems={{ base: 'center', lg: 'start' }} gridGap="38px" width="100%" height="auto" borderRadius="17px" border="1px solid" borderColor={commonBorderColor} p="30px">
              {/* <Box height="140px" width="140px"
              minWidth="140px" borderRadius="50%" border="1px solid">
                Avatar
              </Box> */}
              <Avatar
                // name={user?.first_name}
                width="140px"
                margin="0"
                height="140px"
                src={hasAvatar ? profile?.github?.avatar_url : ''}
              />
              <ProfileForm profile={profile} />
            </Box>
          </TabPanel>
          <TabPanel p="0">certificates here!</TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default memo(Profile);
