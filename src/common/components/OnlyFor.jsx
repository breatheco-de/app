import { memo } from 'react';
import PropTypes from 'prop-types';

const OnlyFor = ({
  cohortSession, academy, capabilities, children,
}) => {
  const academyNumber = Math.floor(academy);
  const userCapabilities = cohortSession.user_capabilities || [];

  const isCapableAcademy = cohortSession && cohortSession.academy?.id === academyNumber;
  const isCapableRole = capabilities.map(
    (capability) => userCapabilities.includes(capability),
  ).includes(true);

  const haveRequiredCapabilities = () => {
    if (!cohortSession) return false;
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
};

OnlyFor.defaultProps = {
  academy: '',
  capabilities: [],
};

export default memo(OnlyFor);
