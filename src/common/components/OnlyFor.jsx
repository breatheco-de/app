import { memo } from 'react';
import PropTypes from 'prop-types';
import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';
import useAuth from '../hooks/useAuth';
import useCohortHandler from '../hooks/useCohortHandler';

function Component({ withBanner, children }) {
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
            {t('upgrade-plan.title')}
          </Box>
          <Button variant="default" onClick={() => router.push('/login')} w="fit-content" textTransform="uppercase" fontSize="14px" letterSpacing="0.05em">
            {t('upgrade-plan.button')}
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
  academy, capabilities, children, onlyMember, onlyTeachers, withBanner, cohort, saas,
}) {
  const { user } = useAuth();
  const academyNumber = Math.floor(academy);
  const teachers = ['TEACHER', 'ASSISTANT', 'REVIEWER'];
  const commonUser = ['TEACHER', 'ASSISTANT', 'STUDENT', 'REVIEWER'];

  const { state } = useCohortHandler();
  const { userCapabilities: cohortCapabilities, cohortSession } = state;

  const currentCohort = cohort || cohortSession;
  const role = currentCohort?.cohort_user?.role || currentCohort?.cohort_role;

  const profileCapabilities = user?.permissions?.map((l) => l.codename) || [];
  const userCapabilities = [...new Set([...cohortCapabilities, ...profileCapabilities])];
  const profileRole = user?.roles?.length > 0 && user.roles[0].role.toUpperCase();
  const cohortRole = role?.toUpperCase() || profileRole || 'NONE';
  const isCapableAcademy = currentCohort && currentCohort.academy?.id === academyNumber;
  const isMember = commonUser.includes(cohortRole);
  const isTeacher = teachers.includes(cohortRole);
  const capabilitiesNotExists = capabilities.length <= 0 || capabilities.includes('');
  const isCapableRole = capabilities.map(
    (capability) => userCapabilities.includes(capability),
  ).includes(true);

  const isSaasAllowed = saas !== undefined;
  const isCohortSaas = currentCohort?.available_as_saas === true;

  const haveRequiredCapabilities = () => {
    if (!currentCohort) return false;
    if (isSaasAllowed) {
      if (['true', 'True', '1'].includes(String(saas)) && !isCohortSaas) return false;
      if (['false', 'False', '0'].includes(String(saas)) && isCohortSaas) return false;
    }
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
      <Component withBanner={withBanner}>
        {children}
      </Component>
    );
}

OnlyFor.propTypes = {
  academy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  capabilities: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
  onlyMember: PropTypes.bool,
  onlyTeachers: PropTypes.bool,
  cohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  withBanner: PropTypes.bool,
  saas: PropTypes.string,
};

OnlyFor.defaultProps = {
  academy: '',
  capabilities: [],
  onlyMember: false,
  onlyTeachers: false,
  cohort: null,
  withBanner: false,
  saas: undefined,
};

Component.propTypes = {
  withBanner: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
Component.defaultProps = {
  withBanner: false,
};

export default memo(OnlyFor);
