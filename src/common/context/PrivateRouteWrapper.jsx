import Login from '../views/Login';
import useAuth from '../hooks/useAuth';

export const withGuard = (PassedComponent) => {
  const Auth = (props) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) <Login />;
    else {
      return (
        <PassedComponent {...props} />
      );
    }
    return null;
  };

  if (PassedComponent.getInitialProps) {
    Auth.getInitialProps = PassedComponent.getInitialProps;
  }

  return Auth;
};

export default withGuard;
