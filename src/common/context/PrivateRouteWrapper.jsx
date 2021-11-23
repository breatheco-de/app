import Login from '../views/Login';
import useAuth from '../hooks/useAuth';

export const withGuard = (PassedComponent) => {
  const Auth = (props) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Login />;

    return (
      <PassedComponent {...props} />
    );
  };

  if (PassedComponent.getInitialProps) {
    Auth.getInitialProps = PassedComponent.getInitialProps;
  }

  return Auth;
};

export default withGuard;
