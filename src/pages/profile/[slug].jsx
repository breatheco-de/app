import {
  Tab, TabList, TabPanel, TabPanels, Tabs,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import {
  memo, useEffect, useState,
} from 'react';
import { useRouter } from 'next/router';
import Heading from '../../common/components/Heading';
import useAuth from '../../hooks/useAuth';
import asPrivate from '../../context/PrivateRouteWrapper';
import bc from '../../services/breathecode';
import { cleanQueryStrings } from '../../utils';
import GridContainer from '../../common/components/GridContainer';
import Subscriptions from '../../common/components/Profile/Subscriptions';
import Certificates from '../../common/components/Profile/Certificates';
import Information from '../../common/components/Profile/Information';
import useCustomToast from '../../hooks/useCustomToast';

function Profile() {
  const { t } = useTranslation('profile');
  const { user, cohorts } = useAuth();
  const router = useRouter();
  const { asPath } = router;
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [certificates, setCertificates] = useState([]);
  const tabListMenu = t('tabList', {}, { returnObjects: true });
  const { createToast, closeToast } = useCustomToast({ toastId: 'user-available-github' });

  const tabPosition = {
    '/profile/info': 0,
    '/profile/info#': 0,
    '/profile/certificates': 1,
    '/profile/certificates#': 1,
    '/profile/subscriptions': 2,
    '/profile/subscriptions#': 2,
  };
  const currentPathCleaned = cleanQueryStrings(asPath);

  useEffect(() => {
    setCurrentTabIndex(tabPosition[currentPathCleaned]);
  }, [currentPathCleaned]);

  useEffect(() => {
    bc.certificate().get()
      .then(({ data }) => {
        setCertificates(data);
      });
  }, []);

  useEffect(() => {
    const isToShowGithubMessage = cohorts?.some(
      (l) => l?.cohort_user?.educational_status === 'ACTIVE' && l?.available_as_saas === false,
    );
    closeToast();
    if (user && !user.github) {
      createToast({
        position: 'top',
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t(isToShowGithubMessage ? 'common:github-warning' : 'common:github-not-connected'),
            }}
          />
        ),
        status: 'info',
        duration: 5000,
      });
    }
  }, [cohorts]);

  return (
    <>
      <GridContainer withContainer gridColumn="1 / span 10" maxWidth="1280px" minH="480px" childrenStyle={{ display: 'block' }} padding="0 24px">
        <Heading as="h1" size="m" margin="45px 0">{t('navbar:my-profile')}</Heading>
        <Tabs index={currentTabIndex} display="flex" flexDirection={{ base: 'column', md: 'row' }} variant="unstyled" gridGap="40px">
          <TabList display="flex" flexDirection="column" width={{ base: '100%', md: '300px' }}>
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
              <Information />
            </TabPanel>
            <TabPanel p="0" display="flex" flexDirection="column" gridGap="18px">
              <Certificates certificates={certificates} />
            </TabPanel>
            <TabPanel p="0" display="flex" flexDirection="column" gridGap="18px">
              <Subscriptions cohorts={cohorts} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </GridContainer>
    </>
  );
}

export default asPrivate(memo(Profile));
