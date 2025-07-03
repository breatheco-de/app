import PropTypes from 'prop-types';
import NoDeliveryFormat from './NoDeliveryFormat';
import UrlDeliveryFormat from './UrlDeliveryFormat';
import FileDeliveryFormat from './FileDeliveryFormat';
import FlagsDeliveryFormat from './FlagsDeliveryFormat';

function DeliveryFormat({ currentAssetData, ...props }) {
  const formats = currentAssetData?.delivery_formats || '';
  const deliveryValidation = currentAssetData?.delivery_validation || {};
  if (formats.includes('no_delivery')) return <NoDeliveryFormat {...props} currentAssetData={currentAssetData} />;
  if (formats.includes('url')) return <UrlDeliveryFormat {...props} currentAssetData={currentAssetData} />;
  if (formats.includes('flags') || deliveryValidation.flags) return <FlagsDeliveryFormat {...props} currentAssetData={currentAssetData} />;
  return <FileDeliveryFormat {...props} currentAssetData={currentAssetData} />;
}

DeliveryFormat.propTypes = {
  currentAssetData: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
};

DeliveryFormat.defaultProps = {
  currentAssetData: {},
};

export default DeliveryFormat;
