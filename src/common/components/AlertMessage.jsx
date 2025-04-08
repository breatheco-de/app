import { Box, useBreakpointValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Text from './Text';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';

function AlertMessage({
  message, type, iconColor, withoutIcon, style, textStyle, full, textColor, dangerouslySetInnerHTML, title, children, onClose, ...rest
}) {
  const { fontColor } = useStyle();
  const alertTop = useBreakpointValue({ xl: '100px' });
  const alertColors = {
    soft: { background: '#FFF4DC' },
    warning: { background: '#ffefcc', borderColor: '#FFB718' },
    success: { background: '#e0ffe8', borderColor: '#00bb2d' },
    error: { background: '#fee8e8', borderColor: '#EB5757' },
    info: { background: '#37c0ff', borderColor: '#DADADA' },
  };
  console.log('alertMessage');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (message || children) && (
    <Box
      display="flex"
      style={{ ...style, position: 'fixed', top: alertTop, left: '50%', transform: 'translateX(-50%)', zIndex: 999, width: '90%', textTransform: 'uppercase', borderRadius: '10px', maxWidth: '1200px', minHeight: '64px' }}
      flexDirection="row"
      backgroundColor={full ? alertColors[type].background : 'transparent'}
      border="2px solid"
      borderColor={alertColors[type].borderColor}
      alignItems="center"
      padding="16px"
      borderRadius="16px"
      gridGap="16px"
      duration="16000"
      className={`alert-${type}`}
      {...rest}
    >
      {!withoutIcon && (
        <Icon icon={type} secondColor={rest.secondColor} color={iconColor || (full ? alertColors[type]?.background : '')} props={{ full: true }} style={{ minWidth: '18px' }} width="18px" height="18px" />
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
      <button type="button" onClick={handleClose} style={{ position: 'absolute', right: '10px', top: '5px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'black' }}>
        X
      </button>
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
  onClose: PropTypes.func,
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
  onClose: null,
};

export default AlertMessage;
