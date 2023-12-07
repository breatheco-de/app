import { useEffect, memo } from 'react';
import {
  useToast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import bc from '../../services/breathecode';
import { usePersistent } from '../../hooks/usePersistent';
import Mentoring from './Mentoring';

function SupportSidebar({ subscriptions, subscriptionData }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [programServices, setProgramServices] = usePersistent('programServices', []);

  useEffect(() => {
    bc.mentorship().getService().then(({ data }) => {
      if (data !== undefined && data.length > 0) {
        setProgramServices(data);
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
  }, []);

  return programServices.length > 0 && (
    <Mentoring
      programServices={programServices}
      subscriptions={subscriptions}
      subscriptionData={subscriptionData}
    />
  );
}

SupportSidebar.propTypes = {
  subscriptionData: PropTypes.shape({}),
  subscriptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};

SupportSidebar.defaultProps = {
  subscriptionData: {},
  subscriptions: [],
};

export default memo(SupportSidebar);
