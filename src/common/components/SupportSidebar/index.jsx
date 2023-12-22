import { useEffect, memo, useState } from 'react';
import {
  useToast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import bc from '../../services/breathecode';
// import { usePersistent } from '../../hooks/usePersistent';
import Mentoring from './Mentoring';

function SupportSidebar({ allCohorts, services, subscriptions, subscriptionData }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [programServices, setProgramServices] = useState({
    list: [],
    isFetching: true,
  });

  useEffect(() => {
    if (services?.length === 0) {
      bc.mentorship().getService().then(({ data }) => {
        if (data !== undefined && data.length > 0) {
          setProgramServices({
            list: data,
            isFetching: false,
          });
        }
      }).catch(() => {
        toast({
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
};

SupportSidebar.defaultProps = {
  subscriptionData: {},
  subscriptions: [],
  services: [],
  allCohorts: [],
};

export default memo(SupportSidebar);
