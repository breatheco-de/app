/* eslint-disable no-unused-vars */
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';

function DynamicCallToAction({ assetType, assetId, assetTechnologies }) {
  const { t } = useTranslation('call-to-action');
  const callToActions = t('call-to-actions', {}, { returnObjects: true });
  console.log('callToActions');
  console.log(callToActions);

  const filterCTA = () => {
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
    // Filter call to actions with at least one coincidence and sort by descending coincidences
    return callToActions.filter((cta) => countCoincidences(cta) > 0).sort((a, b) => countCoincidences(b) - countCoincidences(a));
  };

  const foundCta = filterCTA()[0];

  return (
    <h1>si amigo</h1>
  );
}

DynamicCallToAction.propTypes = {
  assetType: PropTypes.string,
  assetId: PropTypes.number,
  assetTechnologies: PropTypes.arrayOf(PropTypes.string),
};

DynamicCallToAction.defaultProps = {
  assetType: null,
  assetId: null,
  assetTechnologies: [],
};

export default DynamicCallToAction;
