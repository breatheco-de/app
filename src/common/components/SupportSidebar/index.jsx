import { useEffect, memo } from 'react';
import {
  toast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useFlags } from 'launchdarkly-react-client-sdk';
import PropTypes from 'prop-types';
import bc from '../../services/breathecode';
import { usePersistent } from '../../hooks/usePersistent';
import Mentoring from './Mentoring';

const SupportSidebar = ({ subscriptionData }) => {
  const { t } = useTranslation();
  const [programServices, setProgramServices] = usePersistent('programServices', []);
  const flags = useFlags();

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
      subscriptionData={subscriptionData}
      flags={flags}
    />
  );
};

SupportSidebar.propTypes = {
  subscriptionData: PropTypes.shape({}),
};

SupportSidebar.defaultProps = {
  subscriptionData: {},
};

export default memo(SupportSidebar);
