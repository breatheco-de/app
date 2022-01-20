import PropTypes from 'prop-types';
import { Box, useColorMode } from '@chakra-ui/react';

const Parent = ({ children, ...props }) => {
  const { id, ...rest } = props;
  return (
    <Box><Box {...rest} color="blue.default" fontSize="15px" fontWeight="700" as="a" href={`#${id}`}>{children}</Box></Box>
  );
};

Parent.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
Parent.defaultProps = {
  children: '',
  id: '',
};

const Child = ({ children, ...props }) => {
  const { id, ...rest } = props;
  const { colorMode } = useColorMode();
  return (
    <Box
      marginLeft="10px"
      _before={{
        content: '""',
        position: 'absolute',
        width: '2px',
        height: '35px',
        bg: colorMode === 'light' ? '#DADADA' : '#3E526A',
        marginLeft: '-9px',
        borderRadius: '2px',
      }}
    >
      <Box fontWeight="bold" fontSize="15px" {...rest} color="blue.default" as="a" href={`#${id}`}>{children}</Box>
    </Box>
  );
};

Child.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
Child.defaultProps = {
  children: '',
  id: '',
};

export default { Parent, Child };
