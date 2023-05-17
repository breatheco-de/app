import { useEffect, memo } from 'react';
import {
  toast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useFlags } from 'launchdarkly-react-client-sdk';
import bc from '../../services/breathecode';
import { usePersistent } from '../../hooks/usePersistent';
import Mentoring from './Mentoring';

const SupportSidebar = () => {
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
        title: 'Error',
        description: t('alert-message:error-mentorship-service'),
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    });
  }, []);

  return (
    <Mentoring
      programServices={programServices}
      flags={flags}
    />
  );
};

SupportSidebar.propTypes = {};

SupportSidebar.defaultProps = {};

export default memo(SupportSidebar);
