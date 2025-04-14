import { Button, useColorMode, Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';

function ToggleColor({ title }) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Stack py="10px">
      <Button onClick={toggleColorMode} variant="outline">
        {title}
        {colorMode === 'light' ? 'Dark' : 'Light'}
        -Mode
      </Button>
    </Stack>
  );
}

ToggleColor.propTypes = {
  title: PropTypes.string,
};
ToggleColor.defaultProps = {
  title: 'Switch',
};

export default ToggleColor;
