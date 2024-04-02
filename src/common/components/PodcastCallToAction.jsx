/* eslint-disable no-unused-vars */
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import useStyle from '../hooks/useStyle';
import CallToActionCard from './CallToActionCard';
import { parseQuerys } from '../../utils/url';

function PodcastCallToAction({ placement, stTranslation, ...rest }) {
  const { hexColor } = useStyle();
  const { t, lang } = useTranslation('call-to-action');
  const selectedCta = stTranslation ? stTranslation[lang]['call-to-action']['podcast-call-to-action'] : t('podcast-call-to-action', {}, { returnObjects: true });

  const variants = {
    side: {
      background: 'blue.light',
      borderColor: hexColor.blueDefault,
      color: 'black',
      maxWidth: 'none',
    },
  };

  const formatedForwardUrl = selectedCta && `${selectedCta.content.forward_url}${parseQuerys({ internal_cta_placement: placement }, selectedCta.content.forward_url.includes('?'))}`;

  if (!selectedCta) return null;

  return (
    <CallToActionCard
      iconUrl={selectedCta.content.icon_url}
      title={selectedCta.content.title}
      description={selectedCta.content.description}
      buttonLabel={selectedCta.content.button_label}
      adType={selectedCta.content.ad_type}
      forwardUrl={formatedForwardUrl}
      {...rest}
      {...variants[placement]}
      // pillLabel="6 days left"
    />
  );
}

PodcastCallToAction.propTypes = {
  assetType: PropTypes.string,
  assetId: PropTypes.number,
  assetTechnologies: PropTypes.arrayOf(PropTypes.string),
  placement: PropTypes.string,
  stTranslation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

PodcastCallToAction.defaultProps = {
  assetType: null,
  assetId: null,
  assetTechnologies: [],
  stTranslation: null,
  placement: 'side',
};

export default PodcastCallToAction;
