/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Box, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';

function SupplementaryMaterial({ title, children, items }) {
  console.log('ayeee');
  return (
    <Box>
      hola amiguito!
    </Box>
  );
}

SupplementaryMaterial.propTypes = {
  // title: PropTypes.string.isRequired,
  // children: PropTypes.node,
  // items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};
SupplementaryMaterial.defaultProps = {
  // children: null,
  // items: [],
};
