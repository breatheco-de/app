import { memo, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { usePersistent } from '../hooks/usePersistent';
import bc from '../services/breathecode';
import { devLog } from '../../utils';

const OnlyFor = ({ academy, capabilities, children }) => {
  const [cohortSession] = usePersistent('cohortSession', {});
  const [userCapabilities, setUserCapabilities] = useState([]);
  const academyNumber = Math.floor(academy);
  const cohortRole = typeof cohortSession.cohort_role === 'string' && cohortSession.cohort_role.toLowerCase();

  useLayoutEffect(() => {
    if (cohortRole) {
      bc.auth().getRoles(cohortRole).then(({ data }) => {
        setUserCapabilities(data.capabilities);
      });
    }
  }, [cohortSession, cohortRole]);

  devLog('(component OnlyFor) userCapabilities:', userCapabilities);

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
  academy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  capabilities: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
};

OnlyFor.defaultProps = {
  academy: '',
  capabilities: [],
};

export default memo(OnlyFor);
