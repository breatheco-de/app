import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import Icon from './Icon';

const AlertMessage = ({ message, type, style }) => {
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
      border="2px solid"
      borderColor={alertColors[type]}
      padding="16px"
      borderRadius="16px"
      gridGap="16px"
    >
      <Icon icon={type} width="23px" height="23px" />
      <Text fontSize="15px" fontWeight="700" style={{ margin: '0' }}>
        {message}
      </Text>
    </Box>
  );
};

AlertMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
};

AlertMessage.defaultProps = {
  type: 'warning',
  style: {},
};

export default AlertMessage;
