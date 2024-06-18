/* eslint-disable no-unused-vars */
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import useStyle from '../hooks/useStyle';
import CallToActionCard from './CallToActionCard';
import { parseQuerys } from '../../utils/url';

function DynamicCallToAction({ assetType, assetId, assetTechnologies, placement, ...rest }) {
  const { hexColor } = useStyle();
  const { t, lang } = useTranslation('call-to-action');
  const callToActions = t('call-to-actions', {}, { returnObjects: true });

  const variants = {
    side: {
      background: 'yellow.light',
      borderColor: hexColor.yellowDefault,
      color: 'black',
    },
    bottom: {
      background: '#FFE9B8',
      borderColor: hexColor.yellowDefault,
      color: 'black',
      maxWidth: 'none',
      width: '100%',
      iconStyles: {
        border: '1px solid',
        borderColor: hexColor.yellowDefault,
      },
      buttonStyles: {
        display: 'inline-block',
        variant: 'buttonDefault',
        background: 'black',
        color: 'white !important',
        _hover: { bg: 'black' },
      },
      descriptionStyles: {
        size: '18px',
        lineHeight: '21px',
      },
    },
  };

  // Function to count coincidences between a call to action and the target asset
  const countCoincidences = (cta) => {
    let coincidences = 0;
    if (cta.asset_id.includes(assetId)) {
      coincidences += 1;
    }
    if (cta.asset_technologies.some((tech) => assetTechnologies.includes(tech.toLowerCase()))) {
      coincidences += 1;
    }
    if (cta.asset_type.includes(assetType)) {
      coincidences += 1;
    }
    return coincidences;
  };

  const processedCtas = callToActions.map((cta) => ({ ...cta, coincidence: countCoincidences(cta) }));

  // Filter call to actions with at least one coincidence and sort by descending coincidences
  const filterCTA = () => processedCtas
    .filter((cta) => cta.coincidence > 0)
    .sort((a, b) => {
      if (b.coincidence === a.coincidence) {
        if (b.asset_id === assetId) return 1;
        if (a.asset_id === assetId) return -1;
        return 0;
      }
      return b.coincidence - a.coincidence;
    });
  const selectedCta = filterCTA()[0];

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

DynamicCallToAction.propTypes = {
  assetType: PropTypes.string,
  assetId: PropTypes.number,
  assetTechnologies: PropTypes.arrayOf(PropTypes.string),
  placement: PropTypes.string,
};

DynamicCallToAction.defaultProps = {
  assetType: null,
  assetId: null,
  assetTechnologies: [],
  placement: 'side',
};

export default DynamicCallToAction;
