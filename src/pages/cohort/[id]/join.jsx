import { useEffect } from 'react';
import useAuth from '../../../common/hooks/useAuth';
import bc from '../../../common/services/breathecode';

function Page() {
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      // /v1/admissions/cohort/<cohort_id>/join
      bc.cohort().join()
        .then((resp) => {
          console.log('resp:::', resp);
        })
        .catch((err) => {
          console.log('err:::', err);
        });
    }
  }, []);
}

export default Page;
