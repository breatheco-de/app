import { Box } from '@chakra-ui/react';
import Heading from '../../common/components/Heading';
import useAuth from '../../common/hooks/useAuth';
// import useTranslation from 'next-translate/useTranslation';
export default function Example() {
  const { user } = useAuth();

  // const getImage = () => {
  //   if (user && user.github) {
  //     return user.github.avatar_url;
  //   }
  //   return '';
  // };
  console.log('user:::', user !== null && user);
  return (
    <Box margin="3% 10% 0px">
      <Heading size="m">My profile</Heading>
    </Box>
  );
}
