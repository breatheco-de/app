import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';

function Parent({ children, ...props }) {
  const { id, ...rest } = props;

  return (
    <Box {...rest} color="blue.default" fontSize="15px" fontWeight="700" as="a" href={`#${id}`}>{children}</Box>
  );
}

Parent.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
Parent.defaultProps = {
  children: '',
  id: '',
};

function Child({ children, ...props }) {
  const { id, ...rest } = props;

  return (
    <Box
      marginLeft="10px"
    >
      <Box fontWeight="bold" fontSize="15px" {...rest} color="blue.default" as="a" href={`#${id}`}>{children}</Box>
    </Box>
  );
}

Child.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
Child.defaultProps = {
  children: '',
  id: '',
};

export default { Parent, Child };
