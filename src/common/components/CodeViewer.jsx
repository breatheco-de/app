/* eslint-disable no-unused-vars */
import { useState } from 'react';
import {
  Button,
  Avatar,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabIndicator,
  Collapse,
  Tooltip,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import { setStorageItem, getStorageItem } from '../../utils';
import modifyEnv from '../../../modifyEnv';
import ModalInfo from '../../js_modules/moduleMap/modalInfo';
import bc from '../services/breathecode';
import useAuth from '../hooks/useAuth';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Icon from './Icon';

const notExecutables = ['html', 'css'];

function CodeViewer({ languagesData, allowNotLogged, stTranslation, ...rest }) {
  const router = useRouter();
  const { hexColor } = useStyle();
  const { t, lang } = useTranslation('code-viewer');
  const { isAuthenticated } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [languages, setLanguages] = useState(languagesData);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const run = async () => {
    if (isAuthenticated || allowNotLogged) {
      try {
        const currLanguage = { ...languages[tabIndex], running: true };
        setLanguages([
          ...languages.slice(0, tabIndex),
          currLanguage,
          ...languages.slice(tabIndex + 1),
        ]);
        const { code, language } = languages[tabIndex];
        const token = getStorageItem('accessToken');

        const completionJob = {
          inputs: {
            code,
            language_and_version: language,
          },
          execute_async: false,
          include_organization_brief: false,
          include_purpose_objective: true,
        };
        const resp = await fetch(`https://rigobot.herokuapp.com/v1/auth/me/token?breathecode_token=${token}&dev=true`);
        const data = await resp.json();
        const rigobotToken = data.key;

        const completionRequest = await fetch('https://rigobot.herokuapp.com/v1/prompting/completion/code-compiler/', {
          method: 'POST',
          body: JSON.stringify(completionJob),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${rigobotToken}`,
          },
        });
        const completion = await completionRequest.json();

        currLanguage.output = completion.answer.replace('---terminal output---', '').replace('\n', '');
        setLanguages([
          ...languages.slice(0, tabIndex),
          currLanguage,
          ...languages.slice(tabIndex + 1),
        ]);
      } catch (e) {
        console.log(e);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    monaco.editor.defineTheme('my-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00041A',
      },
    });
    monaco.editor.setTheme('my-theme');
  };

  return (
    <Box width="100%" {...rest}>
      <Tabs onChange={(index) => setTabIndex(index)} variant="unstyled">
        <Box borderRadius="4px 4px 0 0" alignItems="center" padding="0 6px" background="#00041A" display="flex" justifyContent="space-between">
          <TabList width="fit-content">
            {languages.map(({ label }, i) => (
              <Tab key={label} color={i === tabIndex ? 'blue.500' : 'white'}>{label}</Tab>
            ))}
          </TabList>
          {!notExecutables.includes(languages[tabIndex].language) && (
            <Button _hover={{ bg: '#ffffff29' }} onClick={run} variant="ghost" size="sm" color="white">
              <Icon icon="play" width="14px" height="14px" style={{ marginRight: '5px' }} color="white" />
              {stTranslation ? stTranslation[lang]['code-viewer'].run : t('run')}
            </Button>
          )}
        </Box>
        <TabIndicator
          mt="-1.5px"
          height="2px"
          bg="blue.500"
          borderRadius="1px"
        />
        <TabPanels>
          {languages.map(({ code, language, output, running }, i) => (
            <TabPanel padding="0">
              <Box height="290px" borderRadius={!output && '0 0 4px 4px'} overflow="hidden">
                <Editor
                  theme="my-theme"
                  value={code}
                  onChange={(value) => {
                    const currLanguage = { ...languages[i], code: value };
                    setLanguages([
                      ...languages.slice(0, i),
                      currLanguage,
                      ...languages.slice(i + 1),
                    ]);
                  }}
                  defaultLanguage={language}
                  height="300px"
                  options={{
                    borderRadius: '4px',
                    minimap: {
                      enabled: false,
                    },
                    cursorStyle: 'line',
                  }}
                  onMount={handleEditorDidMount}
                />
              </Box>
              <Collapse in={running} offsetY="20px">
                <Box borderTop="1px solid #4A5568" color="white" padding="20px" background="#00041A" borderRadius="0 0 4px 4px">
                  <Text display="flex" alignItems="center" gap="5px" fontWeight="700" fontSize="14px" marginBottom="16px" width="fit-content" borderBottom="2px solid white">
                    {stTranslation ? stTranslation[lang]['code-viewer'].terminal : t('terminal')}
                    <Tooltip
                      label={stTranslation ? stTranslation[lang]['code-viewer']['loading-output'] : t('loading-output')}
                      placement="right"
                      hasArrow
                    >
                      <Box>
                        <Icon icon="info" width="14px" height="14px" color={hexColor.blueDefault} />
                      </Box>
                    </Tooltip>
                  </Text>
                  <Text whiteSpace="pre-line" fontFamily="monospace" padding="8px">
                    {output}
                  </Text>
                </Box>
              </Collapse>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <ModalInfo
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        headerStyles={{ textAlign: 'center' }}
        title={stTranslation ? stTranslation[lang]['code-viewer']['log-in-modal'].title : t('log-in-modal.title')}
        childrenDescription={(
          <Box display="flex" flexDirection="column" alignItems="center" gridGap="17px">
            <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-1.png`} border="3px solid #0097CD" width="91px" height="91px" borderRadius="50px" />
            <Text
              size="14px"
              textAlign="center"
            >
              {stTranslation ? stTranslation[lang]['code-viewer']['log-in-modal'].text : t('log-in-modal.text')}
            </Text>
          </Box>
        )}
        closeText={stTranslation ? stTranslation[lang]['code-viewer']['log-in-modal'].login : t('log-in-modal.login')}
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
        handlerText={stTranslation ? stTranslation[lang]['code-viewer']['log-in-modal'].signup : t('log-in-modal.signup')}
      />
    </Box>
  );
}

CodeViewer.propTypes = {
  languagesData: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  stTranslation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  allowNotLogged: PropTypes.bool,
};

CodeViewer.defaultProps = {
  allowNotLogged: false,
  stTranslation: null,
};

export default CodeViewer;
