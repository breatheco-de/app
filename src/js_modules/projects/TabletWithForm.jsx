/* eslint-disable no-unsafe-optional-chaining */
import {
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { getStorageItem } from '../../utils';
import noLearnpackAssets from '../../../public/no-learnpack-in-cloud.json';
import useAuth from '../../common/hooks/useAuth';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import SimpleTable from './SimpleTable';
import ModalToCloneProject from '../syllabus/ModalToCloneProject';
import ShowOnSignUp from '../../common/components/ShowOnSignup';
import useStyle from '../../common/hooks/useStyle';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import ProjectInstructions from '../syllabus/ProjectInstructions';

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
  const [showCloneModal, setShowCloneModal] = useState(false);
  const currentThemeValue = useColorModeValue('light', 'dark');
  const userToken = getStorageItem('accessToken');
  const textColor = commonTextColor || lightColor;
  const conversionTechnologies = technologies?.map((item) => item?.slug).join(',');
  const noLearnpackIncluded = noLearnpackAssets['no-learnpack'];

  const buildLearnpackUrl = () => {
    if (!asset?.learnpack_deploy_url || noLearnpackIncluded.includes(asset?.slug)) return null;

    const currentLang = lang === 'en' ? 'us' : lang;
    const theme = currentThemeValue;
    const token = userToken;

    return `${asset?.learnpack_deploy_url}#language=${currentLang}&lang=${currentLang}&theme=${theme}&token=${token}`;
  };

  const publicLearnpackUrl = buildLearnpackUrl();

  const getTitleMessage = () => {
    if (user) return '';
    if (asset.interactive) return t('direct-access-interactive');
    if (asset.solution_url) return t('direct-access-solution');
    return t('direct-access-similar');
  };

  const getLoggedTitleMessage = () => {
    if (asset.interactive && asset.learnpack_deploy_url) return t('start-immediately');
    if (asset.interactive) return t('download');
    if (asset.solution_url) return t('access-solution');
    return t('similar-projects');
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
            <ProjectInstructions currentAsset={asset} variant="extra-small" publicViewLearnpack={publicLearnpackUrl} publicView />
          </>
        </ShowOnSignUp>
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
