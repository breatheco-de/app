import axiosInstance from '../../axios';
import { isWindow, getCookie } from '../../utils';
import useAuth from '../hooks/useAuth';

export const withGuard = (PassedComponent) => {
  const Auth = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    const isNotAuthenticated = !isLoading && isWindow && !isAuthenticated;
    const tokenExists = isWindow && document.cookie.includes('accessToken');

    const query = isWindow && new URLSearchParams(window.location.search || '');
    const queryToken = isWindow && query.get('token')?.split('?')[0];
    const queryTokenExists = isWindow && queryToken !== undefined && queryToken.length > 0;
    const accessToken = getCookie('accessToken');
    const pathname = isWindow ? window.location.pathname : '';
    const cleanUrl = isWindow && window.location.href.split('?')[0];

    const redirectToLogin = () => {
      setTimeout(() => {
        window.location.href = '/login';
      }, 150);
    };

    // TODO: No se esta creando localStorage redirected cuando el token expira o se cierra la sesion
    axiosInstance.defaults.headers.common.Authorization = `Token ${queryToken || accessToken}`;

    if (!isLoading || queryTokenExists) {
      if (isNotAuthenticated) {
        localStorage.setItem('redirect', pathname);
        window.location.href = '/login';
      }
      if (queryTokenExists && isWindow) {
        localStorage.removeItem('redirect');
        localStorage.setItem('accessToken', queryToken);
        document.cookie = `accessToken=${queryToken}; path=/`;
        setTimeout(() => {
          window.location.href = cleanUrl;
        }, 150);
      } else {
        localStorage.removeItem('redirect');
        return (
          <PassedComponent {...props} />
        );
      }
    }
    if (queryTokenExists === false) {
      if (!tokenExists && isWindow) {
        if (
          pathname.includes('/cohort/')
          || pathname.includes('/syllabus/')
        ) {
          localStorage.setItem('redirect', '/choose-program');
          redirectToLogin();
        } else {
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
