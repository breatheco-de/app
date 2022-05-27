import {
  Avatar,
  Box, Link, Tab, TabList, TabPanel, TabPanels, Tabs, useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { memo, useEffect, useState } from 'react';
import { formatRelative } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/router';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import useAuth from '../../common/hooks/useAuth';
import asPrivate from '../../common/context/PrivateRouteWrapper';
import { usePersistent } from '../../common/hooks/usePersistent';
import ProfileForm from './profileForm';
import bc from '../../common/services/breathecode';
import Icon from '../../common/components/Icon';
// import useTranslation from 'next-translate/useTranslation';
const Profile = () => {
  const { t } = useTranslation('profile');
  const { user } = useAuth();
  const router = useRouter();
  const { locale } = router;
  const [profile, setProfile] = usePersistent('profile', {});
  const [certificates, setCertificates] = useState([]);
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const tabListMenu = t('tabList', {}, { returnObjects: true });

  // axios.defaults.headers.common.Authorization = cookies?.accessToken;

  useEffect(() => {
    bc.certificate().get()
      .then(({ data }) => {
        setCertificates(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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
    <Box margin={{ base: '3% 4% 0px', md: '3% 10% 0px' }} minH="65vh">
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
          <TabPanel p="0" display="flex" flexDirection="column" gridGap="18px">
            <Text fontSize="15px" fontWeight="700" pb="6px">
              {t('my-certificates')}
            </Text>
            {certificates && certificates?.map((l, i) => {
              const index = `${i} - ${l.created_at} - ${l.specialty.name}`;
              const createdAt = l.specialty.created_at;
              const dateCreated = {
                es: formatRelative(new Date(createdAt), new Date(), { locale: es }),
                en: formatRelative(new Date(createdAt), new Date()),
              };

              const certfToken = l.preview_url.split('/').pop();

              return (
                <Box key={index} display="flex" flexDirection={{ base: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gridGap="26px" border="1px solid" borderColor={commonBorderColor} p="23px 28px" borderRadius="18px">
                  <Box display="flex" gridGap="26px">
                    <Box padding="13.5px 10.5px" height="fit-content" backgroundColor="blue.light" borderRadius="35px">
                      <Icon icon="certificate" width="24px" height="24px" style={{ marginBottom: '-8px' }} />
                    </Box>
                    <Box display="flex" flexDirection="column">
                      <Text size="l" fontWeight="400">
                        {dateCreated[locale]}
                      </Text>
                      <Text size="l" fontWeight="700">
                        {l.specialty.name}
                      </Text>
                    </Box>
                  </Box>
                  <Link variant="buttonDefault" textTransform="uppercase" href={`https://certificate.4geeks.com/${certfToken}`} target="_blank" rel="noopener noreferrer" fontSize="13px">
                    {t('view-certificate')}
                  </Link>
                </Box>
              );
            })}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default asPrivate(memo(Profile));
