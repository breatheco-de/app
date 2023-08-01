import PropTypes from 'prop-types';
import { Tooltip } from '@chakra-ui/react';
import Icon from './Icon';

function HelpComponent({
  width, height, style, color, text,
}) {
  return (
    <Tooltip label={text} placement="top">
      <Icon width={width} height={height} style={{ display: 'inline-block', ...style }} color={color} icon="help" />
    </Tooltip>
  );
}

HelpComponent.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  text: PropTypes.string,
};

HelpComponent.defaultProps = {
  width: '19',
  height: '19',
  style: null,
  color: null,
  text: '',
};

export default HelpComponent;
