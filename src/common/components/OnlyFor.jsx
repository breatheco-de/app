import { memo } from 'react';
import PropTypes from 'prop-types';
import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function Component({ storyTranslation, withBanner, children }) {
  const { t } = useTranslation('common');
  const { featuredColor, backgroundColor } = useStyle();
  const router = useRouter();

  return withBanner ? (
    <>
      <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} background={backgroundColor} minHeight="auto" border="5px solid" borderColor={featuredColor} borderRadius="14px" p="0" gridGap={{ base: '0', sm: '26px' }}>
        <Box display="flex" justifyContent="center" alignItems="center" style={{ aspectRatio: '1' }} width="auto" minHeight="160px" height={{ base: '160px', md: 'auto' }} background={featuredColor} borderRadius="7px" m="4px">
          <Icon icon="padlock" width="60px" height="65px" />
        </Box>
        <Box my="1rem" display="flex" padding={{ base: '0 16px', sm: '0' }} flexDirection="column" gridGap="24px" width="100%">
          <Box p={{ base: '0', sm: '0 26px 0 0' }} fontSize="18px" fontWeight="700">
            {storyTranslation?.['upgrade-plan']?.title || t('upgrade-plan.title')}
          </Box>
          <Button variant="default" onClick={() => router.push('/login')} w="fit-content" textTransform="uppercase" fontSize="14px" letterSpacing="0.05em">
            {storyTranslation?.['upgrade-plan']?.button || t('upgrade-plan.button')}
          </Button>
        </Box>
      </Box>
      <Box display="none">
        {children}
      </Box>
    </>
  ) : (
    <Box display="none">
      {children}
    </Box>
  );
}

function OnlyFor({
  storyTranslation, cohortSession, academy, capabilities, children, onlyMember, onlyTeachers, withBanner, profile,
}) {
  const academyNumber = Math.floor(academy);
  const teachers = ['TEACHER', 'ASSISTANT', 'REVIEWER'];
  const commonUser = ['TEACHER', 'ASSISTANT', 'STUDENT', 'REVIEWER'];

  const cohortCapabilities = cohortSession?.user_capabilities || [];
  const profileCapabilities = profile?.permissionsSlug || [];
  const userCapabilities = [...new Set([...cohortCapabilities, ...profileCapabilities])];
  const profileRole = profile?.roles?.length > 0 && profile?.roles[0]?.role?.toUpperCase();
  const cohortRole = cohortSession?.cohort_role?.toUpperCase() || profileRole || 'NONE';
  const isCapableAcademy = cohortSession && cohortSession.academy?.id === academyNumber;
  const isMember = commonUser.includes(cohortRole);
  const isTeacher = teachers.includes(cohortRole);
  const capabilitiesNotExists = capabilities.length <= 0 || capabilities.includes('');
  const isCapableRole = capabilities.map(
    (capability) => userCapabilities.includes(capability),
  ).includes(true);

  const haveRequiredCapabilities = () => {
    if (!cohortSession) return false;
    if (onlyTeachers && isTeacher) {
      if (isCapableRole) return true;
      if (capabilitiesNotExists) return true;
    }
    if (onlyMember && isMember) {
      if (isCapableRole) return true;
      if (capabilitiesNotExists) return true;
    }
    if (!onlyMember && !onlyTeachers && isCapableRole) return true;
    if (capabilitiesNotExists && isCapableAcademy) return true;
    if (academy && isCapableAcademy && isCapableRole) return true;
    return false;
  };

  return haveRequiredCapabilities()
    ? children
    : (
      <Component storyTranslation={storyTranslation} withBanner={withBanner}>
        {children}
      </Component>
    );
}

OnlyFor.propTypes = {
  cohortSession: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  academy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  capabilities: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
  onlyMember: PropTypes.bool,
  onlyTeachers: PropTypes.bool,
  profile: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  withBanner: PropTypes.bool,
  storyTranslation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

OnlyFor.defaultProps = {
  academy: '',
  capabilities: [],
  onlyMember: false,
  onlyTeachers: false,
  profile: {},
  withBanner: false,
  storyTranslation: {},
};

Component.propTypes = {
  withBanner: PropTypes.bool,
  children: PropTypes.node.isRequired,
  storyTranslation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};
Component.defaultProps = {
  withBanner: false,
};

export default memo(OnlyFor);
