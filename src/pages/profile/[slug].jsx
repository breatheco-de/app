import {
  Tab, TabList, TabPanel, TabPanels, Tabs,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import {
  memo, useEffect, useMemo, useState,
} from 'react';
import { useRouter } from 'next/router';
import Heading from '../../components/Heading';
import useAuth from '../../hooks/useAuth';
import useWhiteLabel from '../../hooks/useWhiteLabel';
import useSubscriptions from '../../hooks/useSubscriptions';
import asPrivate from '../../context/PrivateRouteWrapper';
import bc from '../../services/breathecode';
import GridContainer from '../../components/GridContainer';
import Subscriptions from '../../components/Profile/Subscriptions';
import Certificates from '../../components/Profile/Certificates';
import Information from '../../components/Profile/Information';
import ReferralProgram from '../../components/Profile/ReferralProgram';
import TeamSeats from '../../components/Profile/TeamSeats';
import Resources from '../../components/Profile/Resources/index';
import useCustomToast from '../../hooks/useCustomToast';

function renderTabPanel(tabValue, { certificates, cohorts }) {
  switch (tabValue) {
    case 'info':
      return <Information />;
    case 'certificates':
      return <Certificates certificates={certificates} />;
    case 'subscriptions':
      return <Subscriptions cohorts={cohorts} />;
    case 'team-seats':
      return <TeamSeats />;
    case 'referral-program':
      return <ReferralProgram />;
    case 'resources':
      return <Resources />;
    default:
      return null;
  }
}

function Profile() {
  const { t } = useTranslation('profile');
  const { user, cohorts } = useAuth();
  const { isWhiteLabelFeatureEnabled } = useWhiteLabel();
  const { state: subscriptionsState, initializeSubscriptionsData } = useSubscriptions();
  const router = useRouter();
  const { query } = router;
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [certificates, setCertificates] = useState([]);
  const tabListMenu = t('tabList', {}, { returnObjects: true });
  const { createToast, closeToast } = useCustomToast({ toastId: 'user-available-github' });

  const canShowReferralProgram = isWhiteLabelFeatureEnabled('allow_referral_program');

  const hasManageableSeats = useMemo(() => {
    const data = subscriptionsState.subscriptions;
    if (!data) return false;
    const subs = data.subscriptions || [];
    const financings = data.plan_financings || [];
    return [...subs, ...financings].some((plan) => plan.has_billing_team);
  }, [subscriptionsState.subscriptions]);

  const tabListFiltered = useMemo(() => tabListMenu.filter((tab) => {
    if (tab.value === 'referral-program' && !canShowReferralProgram) return false;
    if (tab.value === 'team-seats') {
      if (hasManageableSeats) return true;
      if (!subscriptionsState.areSubscriptionsFetched || subscriptionsState.isLoading) return true;
      return false;
    }
    return tab.disabled !== true;
  }), [
    tabListMenu,
    canShowReferralProgram,
    hasManageableSeats,
    subscriptionsState.areSubscriptionsFetched,
    subscriptionsState.isLoading,
  ]);

  const tabListKey = useMemo(
    () => tabListFiltered.map((tab) => tab.value).join(','),
    [tabListFiltered],
  );

  const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug;

  useEffect(() => {
    const idx = tabListFiltered.findIndex((tab) => tab.value === slug);
    if (idx >= 0) {
      if (idx !== currentTabIndex) {
        setCurrentTabIndex(idx);
      }
      return;
    }
    if (slug && !tabListFiltered.some((tab) => tab.value === slug)) {
      router.replace('/profile/info', undefined, { shallow: true });
    }
  }, [slug, tabListKey, tabListFiltered, currentTabIndex, router]);

  useEffect(() => {
    if (!subscriptionsState.areSubscriptionsFetched) {
      initializeSubscriptionsData();
    }
  }, [subscriptionsState.areSubscriptionsFetched]);

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
            {tabListFiltered.map((tab) => (
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
          <TabPanels p="0" isLazy>
            {tabListFiltered.map((tab) => (
              <TabPanel
                key={tab.value}
                p="0"
                display={tab.value === 'info' ? undefined : 'flex'}
                flexDirection={tab.value === 'info' ? undefined : 'column'}
                gridGap={tab.value === 'info' ? undefined : '18px'}
              >
                {renderTabPanel(tab.value, { certificates, cohorts })}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </GridContainer>
    </>
  );
}

export default asPrivate(memo(Profile));
