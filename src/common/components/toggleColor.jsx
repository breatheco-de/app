import { Button, useColorMode, Stack } from '@chakra-ui/react';

const ToggleColor = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Stack py="10px">
      <Button onClick={toggleColorMode} variant="switchOutline">
        Switch
        {' '}
        {colorMode === 'light' ? 'Dark' : 'Light'}
        -Mode
      </Button>
    </Stack>
  );
};

export default ToggleColor;
