/* eslint-disable no-unsafe-optional-chaining */
import {
  Box,
  useColorModeValue,
  Button,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import React, { useState } from 'react';
import useAuth from '../../common/hooks/useAuth';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import SimpleTable from './SimpleTable';
import ShowOnSignUp from '../../common/components/ShowOnSignup';
import useStyle from '../../common/hooks/useStyle';
import { ORIGIN_HOST } from '../../utils/variables';
import { reportDatalayer } from '../../utils/requests';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import MarkDownParser from '../../common/components/MarkDownParser';
import SimpleModal from '../../common/components/SimpleModal';

const TabletWithForm = React.forwardRef(({
  asset,
  commonTextColor,
  technologies,
  href,
  showSimpleTable,
}, ref) => {
  const { t, lang } = useTranslation('exercises');
  const { user } = useAuth();
  const [formSended, setFormSended] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const { hexColor, lightColor } = useStyle();
  const textColor = commonTextColor || lightColor;
  const conversionTechnologies = technologies?.map((item) => item?.slug).join(',');
  const assetUrl = asset?.readme_url || asset?.url;

  const getTitleMessage = () => {
    if (user) return '';
    if (asset.gitpod) return t('direct-access-interactive');
    if (asset.solution_url) return t('direct-access-solution');
    return t('direct-access-similar');
  };

  const getLoggedTitleMessage = () => {
    if (asset.gitpod) return t('download');
    if (asset.solution_url) return t('access-solution');
    return t('similar-projects');
  };

  const ReportOpenInProvisioningVendor = (vendor = '') => {
    reportDatalayer({
      dataLayer: {
        event: 'open_interactive_exercise',
        user_id: user.id,
        vendor,
      },
    });
  };

  const urlToClone = asset?.url || asset?.readme_url.split('/blob')?.[0];
  const repoName = urlToClone.split('/').pop();
  const cloneInstructions = {
    en: `This exercise can be downloaded and run locally if you have node.js installed on your <a class="link" href="https://4geeks.com/how-to/install-node-nvm-mac-osx">Mac</a> or <a class="link" href="https://4geeks.com/how-to/nvm-install-windows">PC</a>. Start by installing learnpack and clone this project into your computer by typing the following command on your terminal:

\`\`\` bash
$ npm i @learnpack/learnpack -g
$ git clone ${urlToClone}
\`\`\`
Note: This will create a new folder <strong>"${repoName}"</strong> in your computer with the project code inside.

<strong>If you want to use VSCode:</strong> Make sure you have the <a class="link" target="_blank" href="https://marketplace.visualstudio.com/items?itemName=learn-pack.learnpack-vscode">LearnPack extension</a> installed, open the folder in VSCode and type \`learnpack start\` on your vscode terminal.

<strong>To run without VSCode:</strong> Use your computer terminal to get inside your recently created folder and start learnpack:

\`\`\`bash
$ cd ${repoName}
$ learnpack start
\`\`\`
Read the <a class="link" href="${asset?.readme_url}">README.md</a> file and follow the rest of the instructions.`,
    es: `Este ejercicio se puede descargar y ejecutar localmente si tienes node.js instalado en tu <a class="link" href="https://4geeks.com/how-to/install-node-nvm-mac-osx">Mac</a> o <a class="link" href="https://4geeks.com/es/how-to/como-instalar-nvm-en-windows">PC</a>. Comienza instalando learnpack y clona este proyecto en tu computadora escribiendo el siguiente comando en tu terminal:
\`\`\`bash
$ npm i @learnpack/learnpack -g
$ git clone ${urlToClone}
\`\`\`
Nota: Esto creará una nueva carpeta <strong>"${repoName}"</strong> en tu computadora con el código del proyecto dentro.

<strong>Si quieres usar VSCode:<strong> asegurate de tener el <a class="link" target="_blank" href="https://marketplace.visualstudio.com/items?itemName=learn-pack.learnpack-vscode">LearnPack extension instalado</a> y abre la carpeta en VSCode y escribe \`learnpack start\` en tu terminal de vscode.

<strong>Para realizar los ejercios sin VSCode:</strong> abre tu terminal en la carpeta recién creada y comienza el programa learnpack:

\`\`\`bash
$ cd ${repoName}
$ learnpack start
\`\`\`
Lee el archivo <a class="link" href="${asset?.readme_url}">README.md</a> y sigue el resto de las instrucciones.`,
  };

  return (
    <>
      {showSimpleTable && (
        <Box px="10px" pb="20px" display={{ base: 'block', md: 'none' }}>
          <SimpleTable
            href={href}
            difficulty={asset.difficulty !== null && asset.difficulty.toLowerCase()}
            repository={asset.readme_url}
            duration={asset.duration}
            videoAvailable={asset.gitpod ? asset.solution_video_url : null}
            solution={asset.gitpod ? asset.solution_url : null}
            liveDemoAvailable={asset?.intro_video_url}
            technologies={technologies}
          />
        </Box>
      )}
      <Box
        ref={ref}
        backgroundColor={useColorModeValue('white', 'featuredDark')}
        transition="background 0.2s ease-in-out"
        borderRadius="17px"
        border={2}
        borderStyle="solid"
        borderColor={hexColor.greenLight}
        overflow="hidden"
      >
        <ShowOnSignUp
          headContent={asset?.intro_video_url && (
            <ReactPlayerV2
              title="Video tutorial"
              withModal
              url={asset?.intro_video_url}
              withThumbnail
              thumbnailStyle={{
                borderRadius: '0 0 0 0',
              }}
            />
          )}
          hideForm={!user && formSended}
          title={getTitleMessage()}
          submitText={t('get-instant-access')}
          subscribeValues={{ asset_slug: asset.slug }}
          refetchAfterSuccess={() => {
            setFormSended(true);
          }}
          padding={`${asset?.intro_video_url ? '10px' : '20px'} 22px 30px 22px`}
          background="none"
          border="none"
          conversionTechnologies={conversionTechnologies}
          borderRadius="0"
        >
          <>
            {user && !formSended && (
              <Heading
                size="15px"
                textAlign="center"
                textTransform="uppercase"
                width="100%"
                fontWeight="900"
                mb="0px"
              >
                {getLoggedTitleMessage()}
              </Heading>
            )}
            {formSended && (
              <>
                <Icon style={{ margin: 'auto' }} width="104px" height="104px" icon="circle-check" />
                <Heading
                  size="15px"
                  textAlign="center"
                  textTransform="uppercase"
                  width="100%"
                  fontWeight="900"
                  mt="30px"
                  mb="0px"
                >
                  {t('thanks')}
                </Heading>
                <Text size="md" color={textColor} textAlign="center" marginTop="10px" px="0px">
                  {t('download')}
                </Text>
              </>
            )}
            {asset.gitpod ? (
              <>
                <Button
                  borderRadius="3px"
                  width="100%"
                  padding="0"
                  whiteSpace="normal"
                  variant="default"
                  color="white"
                  fontSize="14px"
                  alignItems="center"
                  background={hexColor.greenLight}
                  onClick={() => setShowModal(true)}
                >
                  {'  '}
                  <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="learnpack" color="currentColor" />
                  {t('open-learnpack')}
                </Button>
                <Button
                  borderRadius="3px"
                  width="100%"
                  fontSize="14px"
                  padding="0"
                  whiteSpace="normal"
                  variant="otuline"
                  border="1px solid"
                  textTransform="uppercase"
                  borderColor={hexColor.greenLight}
                  color={hexColor.greenLight}
                  onClick={() => {
                    ReportOpenInProvisioningVendor('local');
                    setShowCloneModal(true);
                  }}
                >
                  {t('clone')}
                </Button>
              </>
            ) : (
              <>
                {asset?.solution_video_url && (
                  <Link
                    borderRadius="3px"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={asset.solution_video_url}
                    background={hexColor.greenLight}
                    color="white !important"
                    letterSpacing="0.05em"
                    textDecoration="none !important"
                    padding="7px 16px !important"
                    textAlign="center"
                    fontWeight="600"
                  >
                    {t('common:watch-video-solution')}
                  </Link>
                )}
                {asset?.solution_url && (
                  <Link
                    borderRadius="3px"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={asset.solution_url}
                    border="1px solid"
                    borderColor={hexColor.greenLight}
                    color={asset.solution_video_url ? hexColor.greenLight : 'white !important'}
                    background={asset.solution_video_url ? 'none' : hexColor.greenLight}
                    letterSpacing="0.05em"
                    textDecoration="none !important"
                    padding="7px 16px !important"
                    textAlign="center"
                    fontWeight="600"
                  >
                    {t('common:review-solution')}
                  </Link>
                )}
              </>
            )}
          </>
        </ShowOnSignUp>
        <SimpleModal
          maxWidth="xl"
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
          }}
          title={t('modal.title')}
          headerStyles={{
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          <Text marginBottom="15px" fontSize="14px" lineHeight="24px" textAlign="center">
            {t('modal.text-part-one')}
          </Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={2} marginBottom="15px">
            <GridItem w="100%">
              <Button
                borderRadius="3px"
                width="100%"
                fontSize="14px"
                padding="0"
                isDisabled={!assetUrl}
                whiteSpace="normal"
                variant="otuline"
                border="1px solid"
                borderColor="blue.default"
                fontWeight="700"
                color="blue.default"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    ReportOpenInProvisioningVendor('gitpod');
                    window.open(`https://gitpod.io#${assetUrl}`, '_blank').focus();
                  }
                }}
              >
                {'  '}
                <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="gitpod" color={hexColor.blueDefault} />
                Gitpod
              </Button>
            </GridItem>
            <GridItem w="100%">
              <Button
                borderRadius="3px"
                width="100%"
                fontSize="14px"
                padding="0"
                isDisabled={!assetUrl}
                whiteSpace="normal"
                variant="otuline"
                border="1px solid"
                borderColor="blue.default"
                fontWeight="700"
                color="blue.default"
                onClick={() => {
                  const url = assetUrl ? assetUrl.replace('https://github.com/', '') : '';
                  if (typeof window !== 'undefined') {
                    ReportOpenInProvisioningVendor('codespaces');
                    window.open(`https://github.com/codespaces/new/?repo=${url}`, '_blank').focus();
                  }
                }}
              >
                {'  '}
                <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="github" color={hexColor.blueDefault} />
                Github Codespaces
              </Button>
            </GridItem>
          </Grid>
          <Text
            // cursor="pointer"
            id="command-container"
            padding="9px"
            background={useColorModeValue('featuredLight', 'featuredDark')}
            fontWeight="400"
            marginBottom="5px"
            style={{ borderRadius: '5px' }}
            textAlign="center"
            fontSize="14px"
            lineHeight="24px"
          >
            {t('modal.text-part-two')}
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={`${ORIGIN_HOST}/lesson/how-to-use-gitpod`}
              display="inline-block"
              letterSpacing="0.05em"
              fontFamily="Lato, Sans-serif"
              color="blue.default"
            >
              Gitpod
            </Link>
            {t('modal.or')}
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={`${ORIGIN_HOST}/lesson/what-is-github-codespaces`}
              color="blue.default"
              display="inline-block"
              letterSpacing="0.05em"
              fontFamily="Lato, Sans-serif"
            >
              Github Codespaces
            </Link>
          </Text>
        </SimpleModal>
        <SimpleModal
          maxWidth="xl"
          title={t('clone-modal.title')}
          isOpen={showCloneModal}
          onClose={() => {
            setShowCloneModal(false);
          }}
          headerStyles={{
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
          bodyStyles={{
            className: 'markdown-body',
            padding: { base: '10px 30px' },
          }}
        >
          <MarkDownParser
            content={cloneInstructions[lang]}
            showLineNumbers={false}
          />
        </SimpleModal>
        <Box px="22px" pb="0" pt="0" display={{ base: 'none', md: 'block' }}>
          <SimpleTable
            href={href}
            difficulty={asset.difficulty !== null && asset.difficulty.toLowerCase()}
            repository={asset.readme_url}
            duration={asset.duration}
            videoAvailable={asset.gitpod ? asset.solution_video_url : null}
            solution={asset.gitpod ? asset.solution_url : null}
            liveDemoAvailable={asset.intro_video_url}
            technologies={technologies}
          />
        </Box>
      </Box>
    </>
  );
});

TabletWithForm.propTypes = {
  commonTextColor: PropTypes.string,
  asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  technologies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  href: PropTypes.string.isRequired,
  showSimpleTable: PropTypes.bool,
};

TabletWithForm.defaultProps = {
  technologies: [],
  commonTextColor: null,
  showSimpleTable: true,
};

export default TabletWithForm;
