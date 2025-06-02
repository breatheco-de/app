import { useEffect, memo, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import bc from '../../services/breathecode';
import Mentoring from './Mentoring';
import useCustomToast from '../../hooks/useCustomToast';

function SupportSidebar({ allCohorts, allSyllabus, services, subscriptions, subscriptionData }) {
  const { t } = useTranslation();
  const { createToast } = useCustomToast({ toastId: 'mentorship-error' });
  const [programServices, setProgramServices] = useState({
    list: [],
    isFetching: true,
  });

  // const filterByFinantialStatus = (list) => list.filter((service) => {
  //   if (allCohorts.length > 0) {
  //     return allCohorts.some((elem) => {
  //       if (elem?.academy?.id === service?.academy?.id && (elem?.cohort_user.finantial_status === 'LATE' || elem?.cohort_user.educational_status === 'SUSPENDED')) {
  //         return false;
  //       }
  //       return true;
  //     });
  //   }
  //   return true;
  // });

  useEffect(() => {
    if (services?.length === 0) {
      bc.mentorship().getService().then(({ data }) => {
        if (data && data.length > 0) {
          setProgramServices({
            list: data,
            isFetching: false,
          });
        }
      }).catch(() => {
        createToast({
          position: 'top',
          title: 'Error',
          description: t('alert-message:error-mentorship-service'),
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      });
    } else {
      setProgramServices({
        list: services,
        isFetching: false,
      });
    }
  }, [services]);

  return programServices.list?.length > 0 && (
    <Mentoring
      allCohorts={allCohorts}
      allSyllabus={allSyllabus}
      programServices={programServices}
      subscriptions={subscriptions}
      subscriptionData={subscriptionData}
    />
  );
}

SupportSidebar.propTypes = {
  subscriptionData: PropTypes.shape({}),
  services: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  subscriptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  allCohorts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  allSyllabus: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};

SupportSidebar.defaultProps = {
  subscriptionData: {},
  subscriptions: [],
  services: [],
  allCohorts: [],
  allSyllabus: [],
};

export default memo(SupportSidebar);
