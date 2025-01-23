import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { Box, Button } from '@chakra-ui/react';
import StatusPill from './StatusPill';
import SubtasksPill from './SubtasksPill';
import useStyle from '../../common/hooks/useStyle';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import ModalToCloneProject from './ModalToCloneProject';
import noLearnpackAssets from '../../../public/no-learnpack-in-cloud.json';
import { ButtonsHandler } from './ProjectInstructions';
import useCohortHandler from '../../common/hooks/useCohortHandler';

function TopBar({ currentAsset, handleStartLearnpack, buttonsHandlerVariant, ...rest }) {
  const { t } = useTranslation('syllabus');
  const { backgroundColor4, hexColor } = useStyle();
  const [isVisible, setIsVisible] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const { state } = useCohortHandler();
  const { cohortSession } = state;

  const title = currentAsset?.title;
  const assetType = currentAsset?.asset_type;
  const noLearnpackIncluded = noLearnpackAssets['no-learnpack'];

  const templateUrl = currentAsset?.template_url;
  const isInteractive = currentAsset?.interactive;
  const isForOpenLocaly = isInteractive || templateUrl;
  const learnpackDeployUrl = currentAsset?.learnpack_deploy_url;
  const startWithLearnpack = learnpackDeployUrl && cohortSession.available_as_saas && !noLearnpackIncluded.includes(currentAsset.slug);

  const assetTypeIcons = {
    LESSON: 'book',
    EXERCISE: 'strength',
    PROJECT: 'code',
    QUIZ: 'answer',
  };

  const scrollTop = () => {
    const markdownBody = document.getElementById('main-container');
    markdownBody.scroll({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const container = document.getElementById('main-container');
    const handleScroll = () => {
      const winScroll = container.scrollTop;
      if (winScroll < 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Box
        id="guided-experience-topbar"
        zIndex="20"
        background={backgroundColor4}
        position="sticky"
        top="-1px"
        borderBottom="1px solid #BBE5FE"
        padding="15px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        {...rest}
      >
        <Box display="flex" alignItems="center">
          <Icon icon={assetTypeIcons[assetType] || 'book'} width="20px" height="20px" color={hexColor.blueDefault} style={{ margin: 'auto', marginRight: '0.4rem' }} />
          <Heading style={{ fontWeight: '400' }} size="xsm" display="inline-flex" gridGap="10px" margin="0 0 0 0 !important">
            {title}
          </Heading>
        </Box>
        <Box display="flex" alignItems="center" gap="5px">
          {currentAsset?.asset_type === 'PROJECT' && (
            <>
              <ButtonsHandler
                currentAsset={currentAsset}
                handleStartLearnpack={handleStartLearnpack}
                setShowCloneModal={setShowCloneModal}
                isForOpenLocaly={isForOpenLocaly}
                startWithLearnpack={startWithLearnpack}
                variant={buttonsHandlerVariant}
                background="blue.1000"
                color="white"
                _hover="none"
                _active="none"
              />
              <StatusPill />
              <SubtasksPill />
            </>
          )}
          <Button visibility={!isVisible && 'hidden'} display="flex" alignItems="center" gap="5px" variant="ghost" color={hexColor.blueDefault} onClick={scrollTop}>
            <Icon icon="arrowLeft2" style={{ transform: 'rotate(90deg)' }} color={hexColor.blueDefault} />
            {t('back-to-top')}
          </Button>
        </Box>
      </Box>
      <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
    </>
  );
}

TopBar.propTypes = {
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  handleStartLearnpack: PropTypes.func.isRequired,
  buttonsHandlerVariant: PropTypes.string,
};
TopBar.defaultProps = {
  currentAsset: null,
  buttonsHandlerVariant: 'extra-small',
};

export default TopBar;
