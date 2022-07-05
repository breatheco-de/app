import {
  Avatar,
  Box, Link, Tab, TabList, TabPanel, TabPanels, Tabs, Tooltip, useColorModeValue, useToast,
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
import ProfileForm from '../../common/components/profileForm';
import bc from '../../common/services/breathecode';
import Icon from '../../common/components/Icon';
import { cleanQueryStrings } from '../../utils';
import ShareButton from '../../common/components/ShareButton';

const Profile = () => {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const { locale, asPath } = router;
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [profile, setProfile] = usePersistent('profile', {});
  const [certificates, setCertificates] = useState([]);
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const tabListMenu = t('tabList', {}, { returnObjects: true });

  const tabPosition = {
    '/profile/info': 0,
    '/profile/info#': 0,
    '/profile/certificates': 1,
    '/profile/certificates#': 1,
  };
  const currentPathCleaned = cleanQueryStrings(asPath);

  useEffect(() => {
    setCurrentTabIndex(tabPosition[currentPathCleaned]);
  }, [currentPathCleaned]);

  useEffect(() => {
    bc.certificate().get()
      .then(({ data }) => {
        setCertificates(data);
      })
      .catch(() => {
        toast({
          title: t('alert-message:something-went-wrong-with', { property: 'Certificates' }),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
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

  const hasAvatar = profile.github && profile.github.avatar_url && profile.github.avatar_url !== '';
  return (
    <Box margin={{ base: '3% 4% 0px', md: '3% 10% 0px' }} minH="65vh">
      <Heading as="h1" size="m" margin="45px 0">{t('navbar:my-profile')}</Heading>
      <Tabs index={currentTabIndex} display="flex" flexDirection={{ base: 'column', md: 'row' }} variant="unstyled" gridGap="40px">
        <TabList display="flex" flexDirection={{ base: 'row', md: 'column' }} width={{ base: '100%', md: '300px' }}>
          {tabListMenu.filter((l) => l.disabled !== true).map((tab) => (
            <Tab
              key={tab.title}
              p="14px"
              display="block"
              onClick={() => router.push(`/profile/${tab.value}`, undefined, { shallow: true })}
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
              _hover={{
                color: 'blue.default',
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
              const certfToken = l?.preview_url && l.preview_url?.split('/')?.pop();
              const certfLink = certfToken ? `https://certificate.4geeks.com/${certfToken}` : '#';
              const profession = l.specialty.name;
              const socials = t('share-certificate.socials', { certfLink, profession }, { returnObjects: true });

              return (
                <Box key={index} display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" gridGap="26px" border="1px solid" borderColor={commonBorderColor} p="23px 28px" borderRadius="18px">
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
                  <Box display="flex" flexDirection="row" gridGap="18px">
                    <Tooltip placement="top" isDisabled={certfToken !== null} label={t('certificate-preview-not-available')}>
                      <Link href={certfLink} variant="buttonDefault" outline colorScheme="blue.default" disabled={!certfToken} textTransform="uppercase" target={certfToken ? '_blank' : '_self'} rel="noopener noreferrer" fontSize="13px">
                        {t('view-certificate')}
                      </Link>
                    </Tooltip>
                    <ShareButton title={t('share-certificate.title')} shareText={t('share-certificate.shareText')} link={certfLink} socials={socials} />
                  </Box>
                </Box>
              );
            })}
            {certificates.length === 0 && (
              <Text fontSize="15px" fontWeight="400" pb="6px">
                {t('no-certificates')}
              </Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default asPrivate(memo(Profile));
