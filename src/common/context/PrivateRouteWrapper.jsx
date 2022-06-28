import { isWindow } from '../../utils';
import useAuth from '../hooks/useAuth';

export const withGuard = (PassedComponent) => {
  const Auth = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    const isNotAuthenticated = !isLoading && isWindow && !isAuthenticated;
    const tokenExists = isWindow && document.cookie.includes('accessToken');

    if (!isLoading) {
      if (isNotAuthenticated) {
        localStorage.setItem('redirect', window.location.pathname);
        window.location.href = '/login';
      } else {
        localStorage.removeItem('redirect');
        return (
          <PassedComponent {...props} />
        );
      }
    }
    if (!tokenExists && isWindow) {
      if (
        window.location.pathname.includes('/cohort/')
        || window.location.pathname.includes('/syllabus/')
      ) {
        localStorage.setItem('redirect', '/choose-program');
        window.location.href = '/login';
      } else {
        localStorage.setItem('redirect', window.location.pathname);
        window.location.href = '/login';
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
