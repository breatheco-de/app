/* eslint-disable no-unsafe-optional-chaining */
import {
  Box,
  useColorModeValue,
  Button,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { getStorageItem, getBrowserInfo } from '../../utils';
import { ORIGIN_HOST } from '../../utils/variables';
import { reportDatalayer } from '../../utils/requests';
import noLearnpackAssets from '../../../public/no-learnpack-in-cloud.json';
import useAuth from '../../common/hooks/useAuth';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import SimpleTable from './SimpleTable';
import ModalToCloneProject from '../syllabus/ModalToCloneProject';
import ShowOnSignUp from '../../common/components/ShowOnSignup';
import useStyle from '../../common/hooks/useStyle';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
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
  const { hexColor, lightColor } = useStyle();
  const [formSended, setFormSended] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const currentThemeValue = useColorModeValue('light', 'dark');
  const userToken = getStorageItem('accessToken');
  const textColor = commonTextColor || lightColor;
  const conversionTechnologies = technologies?.map((item) => item?.slug).join(',');
  const assetUrl = asset?.readme_url || asset?.url;
  const noLearnpackIncluded = noLearnpackAssets['no-learnpack'];

  const getTitleMessage = () => {
    if (user) return '';
    if (asset.interactive) return t('direct-access-interactive');
    if (asset.solution_url) return t('direct-access-solution');
    return t('direct-access-similar');
  };

  const getLoggedTitleMessage = () => {
    if (asset.interactive) return t('download');
    if (asset.solution_url) return t('access-solution');
    return t('similar-projects');
  };

  const ReportOpenInProvisioningVendor = (vendor = '') => {
    reportDatalayer({
      dataLayer: {
        event: 'open_interactive_exercise',
        user_id: user.id,
        vendor,
        agent: getBrowserInfo(),
      },
    });
  };

  const buildLearnpackUrl = () => {
    if (!asset?.learnpack_deploy_url) return null;

    const currentLang = lang === 'en' ? 'us' : lang;
    const theme = currentThemeValue;
    const iframe = 'true';
    const token = userToken;

    return `${asset?.learnpack_deploy_url}#language=${currentLang}&lang=${currentLang}&theme=${theme}&iframe=${iframe}&token=${token}`;
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
            videoAvailable={asset.interactive ? asset.solution_video_url : null}
            solution={asset.interactive ? asset.solution_url : null}
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
            {asset.interactive ? (
              <>
                {asset?.learnpack_deploy_url && !noLearnpackIncluded.includes(asset?.slug)
                  ? (
                    <Button
                      as="a"
                      borderRadius="3px"
                      width="100%"
                      padding="0"
                      whiteSpace="normal"
                      variant="default"
                      color="white"
                      alignItems="center"
                      gridGap="8px"
                      background={hexColor.greenLight}
                      href={buildLearnpackUrl()}
                      target="_blank"
                    >
                      {t('common:learnpack.start-interactive-asset', { asset_type: t(`common:learnpack.asset_types.${asset?.asset_type?.toLowerCase() || ''}`) }).toUpperCase()}
                    </Button>
                  )
                  : (
                    <>
                      {asset.gitpod && (
                      <Button
                        borderRadius="3px"
                        width="100%"
                        padding="0"
                        whiteSpace="normal"
                        variant="default"
                        color="white"
                        alignItems="center"
                        gridGap="8px"
                        background={hexColor.greenLight}
                        onClick={() => setShowModal(true)}
                      >
                        <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="learnpack" color="currentColor" />
                        <Text fontSize="14px">{t('open-learnpack')}</Text>
                      </Button>
                      )}
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
                  )}
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
        <ModalToCloneProject currentAsset={asset} isOpen={showCloneModal} onClose={setShowCloneModal} />
        <Box px="22px" pb="0" pt="0" display={{ base: 'none', md: 'block' }}>
          <SimpleTable
            href={href}
            difficulty={asset.difficulty !== null && asset.difficulty.toLowerCase()}
            repository={asset.readme_url}
            duration={asset.duration}
            videoAvailable={asset.interactive ? asset.solution_video_url : null}
            solution={asset.interactive ? asset.solution_url : null}
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
