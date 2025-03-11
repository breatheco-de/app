import useTranslation from 'next-translate/useTranslation';
import { Box, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import RigobotSearchbar from './RigobotSearchbar';
import useStyle from '../hooks/useStyle';
import HeaderSection from './HeaderSection';

function AssetsHeader({ type, ...rest }) {
  const { t } = useTranslation('common');
  const { hexColor } = useStyle();

  const smallHeading = t(`${type}s`);
  return (
    <HeaderSection
      smallHeading={smallHeading}
      headingTop={t('assets-header.title')}
      subtitle={t('assets-header.description')}
      searchBar={(
        <Box padding="24px" background={hexColor.white2} borderRadius="10px" margin={{ base: '10px', md: 'none' }} color={useColorModeValue('gray.600', 'white')}>
          <RigobotSearchbar />
        </Box>
      )}
      {...rest}
    />
  );
}

AssetsHeader.propTypes = {
  type: PropTypes.string.isRequired,
};

export default AssetsHeader;
