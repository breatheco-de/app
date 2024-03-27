import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import WidgetBox from './WidgetBox';
import Text from './Text';
import { categoriesFor } from '../../utils/variables';

const dictionaryIcons = {
  LESSON: 'book',
  ARTICLE: 'book',
  EXERCISE: 'strength',
  PROJECT: 'laptop-code',
};

const dictionaryAssets = {
  LESSON: 'lesson',
  ARTICLE: 'lesson',
  HOWTO: 'how-to',
  EXERCISE: 'interactive-exercise',
  PROJECT: 'interactive-coding-tutorial',
};

function SupplementaryMaterial({ assets, ...rest }) {
  const { t } = useTranslation('common');

  if (assets.length === 0) return null;

  return (
    <WidgetBox
      mt="20px"
      title={t('supplementary-material')}
      items={assets.map((asset) => {
        const isHowTo = categoriesFor.howTo.includes(asset.category.slug);
        const typeUrl = isHowTo ? dictionaryAssets.HOWTO : dictionaryAssets[asset.asset_type];
        return {
          title: t(isHowTo ? 'how-to' : asset.asset_type.toLowerCase()),
          description: asset.title,
          icon: dictionaryIcons[asset.asset_type],
          href: `/${typeUrl}/${asset.slug}`,
        };
      })}
      {...rest}
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
