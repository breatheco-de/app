import {
  Box, Heading, Button, useColorMode,
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';

const supportSidebar = ({
  title, subtitle, actionButtons, width,
}) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={colorMode === 'light' ? 'yellow.light' : 'featuredDark'}
      width={width}
      height="auto"
      borderWidth="0px"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box d="flex" justifyContent="center">
        <Icon icon="sideSupport" width="300px" height="70px" />
      </Box>
      <Box p="4" pb="30px" pt="20px">
        <Box d="flex" alignItems="baseline" justifyContent="center">
          <Heading fontSize="22px" textAlign="center" justify="center" mt="0px" mb="0px">
            {title}
          </Heading>
        </Box>

        <Box d="flex" alignItems="baseline" justifyContent="center">
          <Text size="md" textAlign="center" mt="10px" px="0px">
            {subtitle}
          </Text>
        </Box>

        <Box pt="3" display="flex" flexDirection="column" alignItems="center">
          {actionButtons.map((button, i) => {
            const index = i;
            // NOTE: more info: https://github.com/4GeeksAcademy/About-4Geeks-Academy/issues/2064
            // NOTE: https://mentor.breatheco.de/academy/<academy_slug-downtown-miami>/?token=<token_6486c608a07f4bfc9119f6f31e737731ba5d9b0b>
            return (
              <a
                key={`${button.title}-${index}`}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  onClick={() => console.log('Clicked', button.title)}
                  size="lg"
                  key={button.title}
                  bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.1)'}
                  // gray
                  _hover={{
                    background: `${colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.2)'}`,
                  }}
                  _active={{
                    background: `${colorMode === 'light' ? 'gray.light' : 'rgba(255, 255, 255, 0.22)'}`,
                  }}
                  borderWidth="0px"
                  px="15px"
                  my="8px"
                  justifyContent="left"
                >
                  <Box pr="20px">
                    <Icon icon={button.icon} width="25px" height="25px" />
                  </Box>
                  <Text size="13px" color={colorMode === 'light' ? 'black' : 'white'}>
                    {button.title}
                  </Text>
                  <Box ml="auto">
                    <Icon icon="arrowRight" width="25px" height="25px" />
                  </Box>
                </Button>
              </a>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default supportSidebar;
