import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export const withGuard = (PassedComponent) => (props) => {
  if (typeof window !== 'undefined') {
    const Router = useRouter();
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
      Router.replace('/login');
      return null;
    }
    return <PassedComponent {...props} />;
  }
  return null;
};

export default withGuard;
