import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useAuth from '../../../common/hooks/useAuth';
import bc from '../../../common/services/breathecode';
import GridContainer from '../../../common/components/GridContainer';
import Text from '../../../common/components/Text';
import asPrivate from '../../../common/context/PrivateRouteWrapper';
import LoaderScreen from '../../../common/components/LoaderScreen';

export const getServerSideProps = async ({ query }) => {
  const { id } = query;
  return {
    props: {
      id: parseInt(id, 10) || null,
    },
  };
};

function Page({ id }) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();

  const joinCohort = () => {
    setIsFetching(true);
    bc.cohort().join(id)
      .then(async (resp) => {
        const dataRequested = await resp.json();

        if (dataRequested.status_code < 400) {
          router.push('/choose-program');
        }
        setData(dataRequested);
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => {
          setIsFetching(false);
        }, 600);
      });
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      joinCohort();
    }
  }, [isAuthenticated]);

  return (
    <GridContainer
      withContainer
      display={{ base: 'flex', md: 'grid' }}
      flexDirection={{ base: 'column', md: '' }}
      height="85vh"
      childrenStyle={{
        display: 'flex',
        flexDirection: 'column',
        gridGap: '20px',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      {isFetching && (
        <Box>
          <LoaderScreen width="100px" height="100px" position="initial" />
          <Text size="22px">
            Creating access to the cohort...
          </Text>
        </Box>
      )}
      {!isFetching && data?.status_code >= 400 && (
        <>
          <Text size="22px">
            {data?.status_code >= 400 && data?.detail}
          </Text>

          <Button variant="link" fontSize="18px" onClick={joinCohort}>
            Try again
          </Button>
        </>
      )}
    </GridContainer>
  );
}

Page.propTypes = {
  id: PropTypes.number,
};
Page.defaultProps = {
  id: null,
};

export default asPrivate(Page);
