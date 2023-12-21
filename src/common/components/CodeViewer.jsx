import { useState } from 'react';
import {
  Button,
  Avatar,
  Box, Tabs, TabList, TabPanels, Tab, TabPanel, TabIndicator,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { setStorageItem } from '../../utils';
import modifyEnv from '../../../modifyEnv';
import ModalInfo from '../../js_modules/moduleMap/modalInfo';
import useAuth from '../hooks/useAuth';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Icon from './Icon';

function CodeViewer({ languages }) {
  const router = useRouter();
  const { hexColor } = useStyle();
  const { t } = useTranslation('code-viewer');
  const { isAuthenticated } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const run = () => {
    if (isAuthenticated) {
      console.log('I am running the code!');
    } else {
      setShowModal(true);
    }
  };

  return (
    <Box width="100%">
      <Tabs onChange={(index) => setTabIndex(index)} variant="unstyled">
        <Box borderRadius="4px 4px 0 0" alignItems="center" padding="0 6px" background="#00041A" display="flex" justifyContent="space-between">
          <TabList width="fit-content">
            {languages.map(({ label }, i) => (
              <Tab key={label} color={i === tabIndex ? 'blue.500' : 'white'}>{label}</Tab>
            ))}
          </TabList>
          <Button onClick={run} variant="ghost" size="sm" color="white">
            <Icon icon="play" width="14px" height="14px" style={{ marginRight: '5px' }} color="white" />
            {t('run')}
          </Button>
        </Box>
        <TabIndicator
          mt="-1.5px"
          height="2px"
          bg="blue.500"
          borderRadius="1px"
        />

        <TabPanels>
          {languages.map(({ code }) => (
            <TabPanel>{code}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <ModalInfo
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        headerStyles={{ textAlign: 'center' }}
        title={t('log-in-modal.title')}
        childrenDescription={(
          <Box display="flex" flexDirection="column" alignItems="center" gridGap="17px">
            <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-1.png`} border="3px solid #0097CD" width="91px" height="91px" borderRadius="50px" />
            <Text
              size="14px"
              textAlign="center"
            >
              {t('log-in-modal.text')}
            </Text>
          </Box>
        )}
        closeText={t('log-in-modal.login')}
        closeButtonVariant="outline"
        closeButtonStyles={{ borderRadius: '3px', color: hexColor.blueDefault, borderColor: hexColor.blueDefault }}
        buttonHandlerStyles={{ variant: 'default' }}
        closeActionHandler={() => {
          setStorageItem('redirect', router?.asPath);
          router.push('login');
        }}
        actionHandler={() => {
          setStorageItem('redirect', router?.asPath);
          router.push('checkout');
        }}
        handlerText={t('log-in-modal.signup')}
      />
    </Box>
  );
}

CodeViewer.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default CodeViewer;
