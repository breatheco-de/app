import { Flex, Image } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from './Heading';
import Icon from './Icon';
import Button from './Button';

function OneColumnWithIcon({ icon, color, background, title, children, buttonText, handleButton, buttonProps, titleStyles, ...rest }) {
  return (
    <Flex alignItems="center" color={color} position="relative" mt="4.5rem" flexDirection="column" gridGap="16px" background={background} padding="33px 24px 16px 24px" borderRadius="12px" {...rest}>
      <Flex mt="-6.5rem" alignSelf="center" alignItems="center" justifyContent="center" width="114px" height="114px" background="blue.default" borderRadius="50%">
        {icon ? (
          <Image src={icon} width="54px" height="54px" objectFit="cover" />
        ) : (
          <Icon icon="avatar-glasses" width="86px" height="60px" />
        )}
      </Flex>
      <Flex flexDirection="column" textAlign="center" gridGap="16px">
        <Heading as="h1" size="24px" fontWeight={700} {...titleStyles}>
          {title}
        </Heading>
        {children}
      </Flex>
      <Button variant="primary" onClick={handleButton} mt="24px" {...buttonProps}>
        {buttonText}
      </Button>
    </Flex>
  );
}

OneColumnWithIcon.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
  handleButton: PropTypes.func,
  buttonText: PropTypes.string,
  color: PropTypes.string,
  background: PropTypes.string,
  buttonProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  titleStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
OneColumnWithIcon.defaultProps = {
  icon: '',
  title: '',
  children: null,
  handleButton: () => {},
  buttonText: '→',
  color: 'white',
  background: '#00041A',
  buttonProps: {},
  titleStyles: {},
};

export default OneColumnWithIcon;
