import React from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { Box, Button } from '@chakra-ui/react';
import StatusPill from './StatusPill';
import SubtasksPill from './SubtasksPill';
import useStyle from '../../common/hooks/useStyle';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';

function TopBar({ currentAsset, ...rest }) {
  const { t } = useTranslation('syllabus');
  const { backgroundColor4, hexColor } = useStyle();

  const title = currentAsset?.title;
  const assetType = currentAsset?.asset_type;

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
              <StatusPill />
              <SubtasksPill />
            </>
          )}
          <Button display="flex" alignItems="center" gap="5px" variant="ghost" color={hexColor.blueDefault} onClick={scrollTop}>
            <Icon icon="arrowLeft2" style={{ transform: 'rotate(90deg)' }} color={hexColor.blueDefault} />
            {t('back-to-top')}
          </Button>
        </Box>
      </Box>
    </>
  );
}

TopBar.propTypes = {
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
TopBar.defaultProps = {
  currentAsset: null,
};

export default TopBar;
