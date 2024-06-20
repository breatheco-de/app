import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';

function AlertMessage({
  message, type, iconColor, withoutIcon, style, textStyle, full, textColor, dangerouslySetInnerHTML, title, children, ...rest
}) {
  const { fontColor } = useStyle();
  const alertColors = {
    soft: '#FFF4DC',
    warning: '#FFB718',
    success: '#25BF6C',
    error: '#dc3545',
    info: '#00A0E9',
  };

  return (message || children) && (
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
      {...rest}
    >
      {!withoutIcon && (
        <Icon icon={type} secondColor={rest.secondColor} color={iconColor || (full ? '#000' : '')} props={{ full: true }} style={{ minWidth: '18px' }} width="18px" height="18px" />
      )}
      {children && children}
      {!children && (
        <>
          <Box>
            {title && (
              <Heading size="20px" letterSpacing="0.02em" mb="10px">
                {title}
              </Heading>
            )}
            {dangerouslySetInnerHTML ? (
              <Text
                fontSize={rest.fontSize || '15px'}
                color={full ? (textColor || 'black') : (textColor || fontColor)}
                fontWeight="500"
                style={{ ...textStyle, margin: '0' }}
                dangerouslySetInnerHTML={{ __html: message }}
              />
            ) : (
              <Text fontSize={rest.fontSize || '15px'} color={full ? (textColor || 'black') : (textColor || fontColor)} fontWeight={rest.fontWeight || '700'} style={{ ...textStyle, margin: '0' }}>
                {message}
              </Text>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

AlertMessage.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  type: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  full: PropTypes.bool,
  textStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  textColor: PropTypes.string,
  dangerouslySetInnerHTML: PropTypes.bool,
  title: PropTypes.string,
  children: PropTypes.node,
  withoutIcon: PropTypes.bool,
  iconColor: PropTypes.string,
};

AlertMessage.defaultProps = {
  message: '',
  type: 'warning',
  style: {},
  full: false,
  textStyle: {},
  textColor: '',
  dangerouslySetInnerHTML: false,
  title: '',
  children: null,
  withoutIcon: false,
  iconColor: '',
};

export default AlertMessage;
