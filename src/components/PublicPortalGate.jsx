import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';
import useWhiteLabel from '../hooks/useWhiteLabel';
import { setStorageItem } from '../utils';

function PublicPortalGate({
  children,
  feature,
  mode,
  alwaysHide,
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    features,
    isLoading: isWhiteLabelLoading,
    isWhiteLabel,
    isWhiteLabelFeatureEnabled,
  } = useWhiteLabel();
  const publicPortalConfig = features?.public_portal;
  const publicPortalEnabled = publicPortalConfig ? isWhiteLabelFeatureEnabled('public_portal.enabled') : false;
  const featureConfig = feature ? publicPortalConfig?.[feature] : null;
  const featureEnabled = feature && featureConfig
    ? isWhiteLabelFeatureEnabled(`public_portal.${feature}.enabled`)
    : publicPortalEnabled;
  const isBlocked = isWhiteLabel && (alwaysHide || !publicPortalEnabled || !featureEnabled);
  const shouldRedirectToLogin = isBlocked && mode === 'login' && !isAuthenticated;
  const shouldShowPrivateContent = isBlocked && mode === 'login' && isAuthenticated;

  useEffect(() => {
    if (isWhiteLabelLoading || isAuthLoading || !isBlocked) return;

    if (shouldRedirectToLogin) {
      setStorageItem('redirect', router.asPath);
      router.replace({ pathname: '/login', query: router.query }, undefined, { locale: router.locale });
      return;
    }

    if (!shouldShowPrivateContent) {
      router.replace('/404', undefined, { locale: router.locale });
    }
  }, [
    isWhiteLabelLoading,
    isAuthLoading,
    isBlocked,
    shouldRedirectToLogin,
    shouldShowPrivateContent,
    router,
  ]);

  if (isWhiteLabelLoading || (isBlocked && mode === 'login' && isAuthLoading)) {
    return null;
  }

  if (!isBlocked || shouldShowPrivateContent) {
    return children;
  }

  return null;
}

PublicPortalGate.propTypes = {
  children: PropTypes.node.isRequired,
  feature: PropTypes.string,
  mode: PropTypes.oneOf(['notFound', 'login']),
  alwaysHide: PropTypes.bool,
};

PublicPortalGate.defaultProps = {
  feature: '',
  mode: 'notFound',
  alwaysHide: false,
};

export default PublicPortalGate;
