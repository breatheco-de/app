/* eslint-disable no-unused-vars */
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import useStyle from '../hooks/useStyle';
import CallToActionCard from './CallToActionCard';
import { parseQuerys } from '../../utils/url';

function DynamicCallToAction({ assetType, assetId, assetTechnologies, stTranslation }) {
  const { hexColor } = useStyle();
  const { t, lang } = useTranslation('call-to-action');
  const callToActions = stTranslation ? stTranslation[lang]['call-to-action']['call-to-actions'] : t('call-to-actions', {}, { returnObjects: true });

  // Function to count coincidences between a call to action and the target asset
  const countCoincidences = (cta) => {
    let coincidences = 0;
    if (cta.asset_id.includes(assetId)) {
      coincidences += 1;
    }
    if (cta.asset_technologies.some((tech) => assetTechnologies.includes(tech))) {
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

  const formatedForwardUrl = selectedCta && `${selectedCta.content.forward_url}${parseQuerys({ internal_cta_placement: selectedCta.content.internal_cta_placement }, selectedCta.content.forward_url.includes('?'))}`;

  if (selectedCta?.component === 'WeeklyCodingChallenge') {
    return (
      <CallToActionCard
        background="yellow.light"
        borderColor={hexColor.yellowDefault}
        color="black"
        iconUrl={selectedCta.content.icon_url}
        title={selectedCta.content.title}
        description={selectedCta.content.description}
        buttonLabel={selectedCta.content.button_label}
        forwardUrl={formatedForwardUrl}
        // pillLabel="6 days left"
      />
    );
  }

  if (selectedCta?.component === 'LargeWeeklyCodingChallenge') {
    return (
      <CallToActionCard
        background="#FFE9B8"
        borderColor={hexColor.yellowDefault}
        color="black"
        maxWidth="none"
        width="100%"
        iconUrl={selectedCta.content.icon_url}
        title={selectedCta.content.title}
        description={selectedCta.content.description}
        buttonLabel={selectedCta.content.button_label}
        forwardUrl={formatedForwardUrl}
        iconStyles={{
          border: '1px solid',
          borderColor: hexColor.yellowDefault,
        }}
        buttonStyles={{
          display: 'inline-block',
          variant: 'buttonDefault',
          background: 'black',
          color: 'white',
          _hover: { bg: 'black' },
        }}
        descriptionStyles={{
          size: '18px',
          lineHeight: '21px',
        }}
        // pillLabel="6 days left"
      />
    );
  }

  return null;
}

DynamicCallToAction.propTypes = {
  assetType: PropTypes.string,
  assetId: PropTypes.number,
  assetTechnologies: PropTypes.arrayOf(PropTypes.string),
  stTranslation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

DynamicCallToAction.defaultProps = {
  assetType: null,
  assetId: null,
  assetTechnologies: [],
  stTranslation: null,
};

export default DynamicCallToAction;
