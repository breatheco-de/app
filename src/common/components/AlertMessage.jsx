import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import Icon from './Icon';

const AlertMessage = ({
  message, type, style, textStyle, full, textColor,
}) => {
  const alertColors = {
    warning: '#FFB718',
    success: '#25BF6C',
    error: '#dc3545',
    info: '#00A0E9',
  };

  return message && (
    <Box
      display="flex"
      style={style}
      flexDirection="row"
      backgroundColor={full ? alertColors[type] : 'transparent'}
      border="2px solid"
      borderColor={alertColors[type]}
      alignItems="center"
      padding="16px"
      borderRadius="16px"
      gridGap="16px"
    >
      <Icon icon={type} color={full ? '#000' : ''} props={{ full: true }} style={{ minWidth: '18px' }} width="18px" height="18px" />
      <Text fontSize="15px" color={full ? 'black' : textColor} fontWeight="700" style={{ ...textStyle, margin: '0' }}>
        {message}
      </Text>
    </Box>
  );
};

AlertMessage.propTypes = {
  message: PropTypes.string,
  type: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
  full: PropTypes.bool,
  textStyle: PropTypes.objectOf(PropTypes.any),
  textColor: PropTypes.string,
};

AlertMessage.defaultProps = {
  message: '',
  type: 'warning',
  style: {},
  full: false,
  textStyle: {},
  textColor: 'white',
};

export default AlertMessage;
