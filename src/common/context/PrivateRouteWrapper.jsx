import { isWindow, removeURLParameter, setStorageItem } from '../../utils';
import { log } from '../../utils/logging';
import useAuth from '../hooks/useAuth';

export const withGuard = (PassedComponent) => {
  function Auth(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const isNotAuthenticated = !isLoading && isWindow && !isAuthenticated;
    const tokenExists = isWindow && localStorage.getItem('accessToken');
    const pageToRedirect = isWindow ? `/pricing${window.location.search}` : '/pricing';

    const query = isWindow && new URLSearchParams(window.location.search || '');
    const queryToken = isWindow && query.get('token')?.split('?')[0];
    const queryTokenExists = isWindow && queryToken !== undefined && queryToken.length > 0;
    const pathname = isWindow ? window.location.pathname : '';
    const cleanUrl = isWindow && removeURLParameter(window.location.href, 'token');
    const requiresDefaultRedirect = pathname.includes('/cohort/') || pathname.includes('/syllabus/');

    const redirectToLogin = () => {
      setTimeout(() => {
        if (isWindow) {
          setStorageItem('redirect', `${window.location.pathname}${window.location.search}`);
        }
        window.location.href = pageToRedirect;
      }, 150);
    };

    if (!isLoading || queryTokenExists) {
      if (isNotAuthenticated) {
        if (requiresDefaultRedirect) {
          localStorage.setItem('redirect', '/choose-program');
        } else {
          localStorage.setItem('redirect', pathname);
        }
        window.location.href = pageToRedirect;
      }
      if (queryTokenExists && isWindow) {
        localStorage.setItem('accessToken', queryToken);
        setTimeout(() => {
          window.location.href = cleanUrl;
        }, 150);
      } else {
        return (
          <PassedComponent {...props} />
        );
      }
    }
    if (queryTokenExists === false) {
      if (!tokenExists && isWindow) {
        if (requiresDefaultRedirect) {
          log('redirect choose-program setted');
          localStorage.setItem('redirect', '/choose-program');
          redirectToLogin();
        } else {
          log('redirect setted');
          localStorage.setItem('redirect', pathname);
          redirectToLogin();
        }
      }
    }
    return null;
  }

  if (PassedComponent.getInitialProps) {
    Auth.getInitialProps = PassedComponent.getInitialProps;
  }

  return Auth;
};

export default withGuard;
