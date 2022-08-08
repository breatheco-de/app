import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import Icon from './Icon';

const AlertMessage = ({
  message, type, style, textStyle, full,
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
      padding="16px"
      borderRadius="16px"
      gridGap="16px"
    >
      <Icon icon={type} color={full ? '#000' : ''} props={{ full: true }} width="23px" height="23px" />
      <Text fontSize="15px" color={full ? 'black' : 'white'} fontWeight="700" style={{ ...textStyle, margin: '0' }}>
        {message}
      </Text>
    </Box>
  );
};

AlertMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
  full: PropTypes.bool,
  textStyle: PropTypes.objectOf(PropTypes.any),
};

AlertMessage.defaultProps = {
  type: 'warning',
  style: {},
  full: false,
  textStyle: {},
};

export default AlertMessage;
