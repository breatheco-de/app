import React from 'react';
import {
  Box,
  Text,
  Container,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
  Divider,
  Heading,
  Stack,
} from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';

const Footer = () => {
  const { t } = useTranslation('footer');
  const { colorMode } = useColorMode();
  return (
    <Container maxW="none" padding="20px">
      <Flex justifyContent="space-between" marginBottom="10px">
        <Box key="icons" display="flex" flexDir="column" justifyContent="center" width="25%">
          <Flex justifyContent="space-around">
            <Icon icon="twitter" width="23px" height="23px" />
            <Icon icon="facebook" width="23px" height="23px" />
            <Icon icon="instagram" width="23px" height="23px" />
            <Icon icon="youtube" width="23px" height="23px" color={colorMode === 'light' ? '#020203' : '#FFFFFF'} />
            <Icon icon="github" width="23px" height="23px" />
          </Flex>
        </Box>
        <Box key="logo" width="25%">
          <Icon style={{ margin: 'auto' }} icon="4GeeksIcon" width="150px" height="60px" />
        </Box>
        <Box key="searchbar" display="flex" flexDir="column" justifyContent="center" width="25%">
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
              // eslint-disable-next-line react/no-children-prop
              children={<Search2Icon color={colorMode === 'light' ? '#020203' : '#FFFFFF'} />}
            />
            <Input
              borderColor={colorMode === 'light' ? '#020203' : '#FFFFFF'}
              color={colorMode === 'light' ? '#020203' : '#FFFFFF'}
              width="100%"
              borderRadius="50px"
              placeholder="Search in 4Geeks"
            />
            {/* <InputRightElement children={<Search2Icon color='green.500' />} /> */}
          </InputGroup>
        </Box>
      </Flex>
      <Divider borderBottomWidth="2px" />
      <Flex paddingTop="30px">
        <Flex width="60%">
          <Box>
            <Heading as="h5" size="sm">
              {t('company.title')}
            </Heading>
            <Text fontSize="sm">{t('company.about')}</Text>
            <Text fontSize="sm">{t('company.contact')}</Text>
            <Text fontSize="sm">{t('company.media')}</Text>
          </Box>
          <Container maxW="none">
            <Stack direction="row" h="105px" marginBottom="20px">
              <Divider orientation="vertical" />
              <Box>
                <Heading as="h5" size="sm">
                  {t('learning.title')}
                </Heading>
                <Text fontSize="sm">{t('learning.read')}</Text>
                <Text fontSize="sm">{t('learning.practice')}</Text>
                <Text fontSize="sm">{t('learning.build')}</Text>
                <Text fontSize="sm">{t('learning.how')}</Text>
              </Box>
            </Stack>
            <Stack direction="row" h="105px">
              <Divider orientation="vertical" />
              <Box>
                <Heading as="h5" size="sm">
                  {t('community.title')}
                </Heading>
                <Text fontSize="sm">{t('community.work')}</Text>
                <Text fontSize="sm">{t('community.live')}</Text>
                <Text fontSize="sm">{t('community.build')}</Text>
                <Text fontSize="sm">{t('community.conduct')}</Text>
              </Box>
            </Stack>
          </Container>
          <Box>
            <Heading as="h5" size="sm">
              {t('social.title')}
            </Heading>
            <Text fontSize="sm">{t('social.text')}</Text>
          </Box>
        </Flex>
      </Flex>
    </Container>
    // <Box
    //   height="70px"
    //   mt="64px"
    //   px="4%"
    //   alignItems="center"
    //   justifyContent="center"
    //   display="flex"
    // >
    //   <Text textAlign="center" py="12px" fontSize="10px">
    //     {t('copyright')}
    //   </Text>
    // </Box>
  );
};

export default Footer;
