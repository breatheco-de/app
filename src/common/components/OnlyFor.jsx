import { memo } from 'react';
import PropTypes from 'prop-types';

const OnlyFor = ({
  cohortSession, academy, capabilities, children, onlyMember,
}) => {
  const academyNumber = Math.floor(academy);
  const userCapabilities = cohortSession.user_capabilities || [];
  const commonUser = ['STUDENT', 'REVIEWER'];

  const isCapableAcademy = cohortSession && cohortSession.academy?.id === academyNumber;
  const isCapableRole = capabilities.map(
    (capability) => userCapabilities.includes(capability),
  ).includes(true);

  const haveRequiredCapabilities = () => {
    if (!cohortSession) return false;
    if (onlyMember && commonUser.includes(cohortSession.cohort_role)) return false;
    if (!academy && isCapableRole) return true;
    if (capabilities.length === 0 && isCapableAcademy) return true;
    if (academy && isCapableAcademy && isCapableRole) return true;
    return false;
  };
  return haveRequiredCapabilities() ? children : null;
};

OnlyFor.propTypes = {
  cohortSession: PropTypes.objectOf(PropTypes.any).isRequired,
  academy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  capabilities: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
  onlyMember: PropTypes.bool,
};

OnlyFor.defaultProps = {
  academy: '',
  capabilities: [],
  onlyMember: false,
};

export default memo(OnlyFor);
