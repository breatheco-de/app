import { useRouter } from 'next/router';
import { isWindow, removeURLParameter, setStorageItem } from '../../utils';
import { log } from '../../utils/logging';
import useAuth from '../hooks/useAuth';

export const withGuard = (PassedComponent) => {
  function Auth(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const isNotAuthenticated = !isLoading && isWindow && !isAuthenticated;
    const router = useRouter();
    const tokenExists = isWindow && localStorage.getItem('accessToken');
    const pageToRedirect = isWindow ? `/login${window.location.search}` : '/login';

    const query = isWindow && new URLSearchParams(window.location.search || '');
    const queryToken = isWindow && query.get('token')?.split('?')[0];
    const queryTokenExists = isWindow && queryToken !== undefined && queryToken.length > 0;
    const pathname = isWindow ? window.location.pathname : '';
    const cleanUrl = isWindow && removeURLParameter(window.location.href, 'token');
    const defaultRedirect = '/choose-program';
    const requiresDefaultRedirect = pathname.includes('/cohort/') && pathname.includes('/syllabus/');
    const isDinamicPage = pathname.includes('/syllabus/');

    const redirectToLogin = () => {
      setTimeout(() => {
        if (isWindow) {
          setStorageItem('redirect', router.asPath);
        }
        router.push(pageToRedirect);
      }, 150);
    };

    if (!isLoading || isAuthenticated) {
      if (isDinamicPage) {
        return (
          <PassedComponent {...props} />
        );
      }
      if (isNotAuthenticated) {
        if (requiresDefaultRedirect) {
          localStorage.setItem('redirect', defaultRedirect);
        } else {
          localStorage.setItem('redirect', pathname);
        }
        router.push(pageToRedirect);
      }
      if (queryTokenExists && isWindow) {
        localStorage.setItem('accessToken', queryToken);
        setTimeout(() => {
          router.push(cleanUrl);
        }, 150);
      } else {
        return (
          <PassedComponent {...props} />
        );
      }
    }
    if (queryTokenExists === false) {
      if (!tokenExists && isWindow) {
        if (isDinamicPage) {
          return (
            <PassedComponent {...props} />
          );
        }
        if (requiresDefaultRedirect) {
          log(`redirect ${defaultRedirect} setted`);
          localStorage.setItem('redirect', defaultRedirect);
          redirectToLogin();
        } else {
          log(`redirect to ${pathname} setted`);
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
