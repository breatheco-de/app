import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import WidgetBox from './WidgetBox';
import Text from './Text';

const dictionaryIcons = {
  LESSON: 'book',
  EXERCISE: 'strength',
  PROJECT: 'laptop-code',
};

const dictionaryAssets = {
  LESSON: 'lesson',
  EXERCISE: 'interactive-exercise',
  PROJECT: 'interactive-coding-tutorial',
};

function SupplementaryMaterial({ assets }) {
  const { t } = useTranslation('common');

  return (
    <WidgetBox
      mt="20px"
      title={t('supplementary-material')}
      items={assets.map((asset) => ({
        title: t(asset.asset_type.toLowerCase()),
        description: asset.title,
        icon: dictionaryIcons[asset.asset_type],
        href: `/${dictionaryAssets[asset.asset_type]}/${asset.slug}`,
      }))}
    >
      <Text textAlign="center">{t('suggested-material')}</Text>
    </WidgetBox>
  );
}

SupplementaryMaterial.propTypes = {
  assets: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

SupplementaryMaterial.defaultProps = {
  assets: [],
};

export default SupplementaryMaterial;
