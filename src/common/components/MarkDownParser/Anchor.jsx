import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';

const Anchor = ({ children, ...props }) => {
  const { id, ...rest } = props;
  return (
    <Box><Box fontWeight="bold" fontSize="18px" {...rest} color="blue.default" as="a" href={`#${id}`}>{children}</Box></Box>
  );
};

Anchor.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
Anchor.defaultProps = {
  children: '',
  id: '',
};

export default Anchor;
