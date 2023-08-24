import { Box, Flex, IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../hooks/useStyle';
import NextLink from './NextChakraLink';
import logoData from '../../../public/logo.json';
import Icon from './Icon';
import DesktopNav from '../../js_modules/navbar/DesktopNav';

function WhiteLabelHeader() {
  const { t } = useTranslation('navbar');
  const { navbarBackground, lightColor, borderColor } = useStyle();
  const { toggleColorMode } = useColorMode();

  const items = t('white-label-version-items', {
    selectedProgramSlug: '/choose-program',
  }, { returnObjects: true });

  const toggleThemeIcon = useColorModeValue(
    <Icon icon="light" id="light-button-desktop" width="25px" height="23px" color="black" />,
    <Icon icon="dark" id="dark-button-desktop" width="20px" height="20px" />,
  );
  const imageFilter = useColorModeValue('none', 'brightness(0) invert(1)');

  return (
    <Box position="relative" zIndex={100}>
      <Flex
        transition="all .2s ease"
        bg={navbarBackground}
        color={lightColor}
        height="7vh"
        py={{ base: '8px' }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={borderColor}
        justifyContent="space-between"
        align="center"
      >
        <Flex
          display={{ base: 'none', lg: 'flex' }}
          justify={{ base: 'center', xl: 'start' }}
        >
          <NextLink href="/" style={{ minWidth: '105px', alignSelf: 'center', display: 'flex' }} p="6px" borderRadius="4px">
            <Image
              src={logoData.logo_url}
              width={105}
              height={35}
              style={{
                maxHeight: '35px',
                minHeight: '35px',
                objectFit: 'cover',
                filter: imageFilter,
              }}
              alt={logoData?.name ? `${logoData.name} logo` : '4Geeks logo'}
            />
          </NextLink>

          <Flex display="flex" ml={10}>
            <DesktopNav NAV_ITEMS={items || []} />
          </Flex>
        </Flex>

        <IconButton
          style={{
            margin: 0,
          }}
          height="auto"
          _hover={{
            background: navbarBackground,
          }}
          _active={{
            background: navbarBackground,
          }}
          aria-label="Dark mode switch"
          background={navbarBackground}
          onClick={() => {
            toggleColorMode();
          }}
          icon={toggleThemeIcon}
        />
      </Flex>
    </Box>
  );
}

export default WhiteLabelHeader;
