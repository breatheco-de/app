import axiosInstance from '../../axios';
import { isWindow, getCookie, removeURLParameter } from '../../utils';
import useAuth from '../hooks/useAuth';

export const withGuard = (PassedComponent) => {
  const Auth = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    const isNotAuthenticated = !isLoading && isWindow && !isAuthenticated;
    const tokenExists = isWindow && (document.cookie.includes('accessToken') || localStorage.getItem('accessToken'));

    const query = isWindow && new URLSearchParams(window.location.search || '');
    const queryToken = isWindow && query.get('token')?.split('?')[0];
    const queryTokenExists = isWindow && queryToken !== undefined && queryToken.length > 0;
    const accessToken = getCookie('accessToken');
    const pathname = isWindow ? window.location.pathname : '';
    const cleanUrl = isWindow && removeURLParameter(window.location.href, 'token');
    const requiresDefaultRedirect = pathname.includes('/cohort/') || pathname.includes('/syllabus/');

    const redirectToLogin = () => {
      setTimeout(() => {
        window.location.href = '/login';
      }, 150);
    };

    axiosInstance.defaults.headers.common.Authorization = `Token ${queryToken || accessToken}`;

    if (!isLoading || queryTokenExists) {
      if (isNotAuthenticated) {
        if (requiresDefaultRedirect) {
          localStorage.setItem('redirect', '/choose-program');
        } else {
          localStorage.setItem('redirect', pathname);
        }
        window.location.href = '/login';
      }
      if (queryTokenExists && isWindow) {
        localStorage.setItem('accessToken', queryToken);
        document.cookie = `accessToken=${queryToken}; path=/`;
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
          console.log('redirect choose-program setted');
          localStorage.setItem('redirect', '/choose-program');
          redirectToLogin();
        } else {
          console.log('redirect setted');
          localStorage.setItem('redirect', pathname);
          redirectToLogin();
        }
      }
    }
    return null;
  };

  if (PassedComponent.getInitialProps) {
    Auth.getInitialProps = PassedComponent.getInitialProps;
  }

  return Auth;
};

export default withGuard;
