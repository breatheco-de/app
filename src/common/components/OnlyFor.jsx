import { memo } from 'react';
import PropTypes from 'prop-types';
import { usePersistent } from '../hooks/usePersistent';

const OnlyFor = ({ academy, capabilities, children }) => {
  const [cohortSession] = usePersistent('cohortSession', {});
  const capabilitiesToUpperCase = capabilities.map((element) => element.toUpperCase());
  const academyNumber = Math.floor(academy);
  const cohortRole = typeof cohortSession.cohort_role === 'string' && cohortSession.cohort_role.toUpperCase();

  const isCapableAcademy = cohortSession && cohortSession.academy?.id === academyNumber;
  const isCapableRole = capabilitiesToUpperCase.includes(cohortRole);

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
  academy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  capabilities: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
};

OnlyFor.defaultProps = {
  academy: '',
  capabilities: [],
};

export default memo(OnlyFor);
