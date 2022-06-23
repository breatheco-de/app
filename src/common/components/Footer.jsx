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
      <Flex padding="30px 40px 0 40px">
        <Flex minWidth="60%" width="60%" marginRight="3%">
          <Box marginRight="5%">
            <Heading as="h5" size="sm" marginBottom="15px">
              {t('company.title')}
            </Heading>
            <Text fontSize="sm">{t('company.about').toUpperCase()}</Text>
            <Text fontSize="sm">{t('company.contact').toUpperCase()}</Text>
            <Text fontSize="sm">{t('company.media').toUpperCase()}</Text>
          </Box>
          <Container maxW="none" padding="0">
            <Box paddingLeft="15%" marginBottom="20px" borderLeft="2px" borderColor="#e2e8f0">
              <Heading as="h5" size="sm" marginBottom="15px">
                {t('learning.title')}
              </Heading>
              <Text fontSize="sm">{t('learning.read').toUpperCase()}</Text>
              <Text fontSize="sm">{t('learning.practice').toUpperCase()}</Text>
              <Text fontSize="sm">{t('learning.build').toUpperCase()}</Text>
              <Text fontSize="sm">{t('learning.how').toUpperCase()}</Text>
            </Box>
            <Box paddingLeft="15%" marginBottom="20px" borderLeft="2px" borderColor="#e2e8f0">
              <Heading as="h5" size="sm" marginBottom="15px">
                {t('community.title')}
              </Heading>
              <Text fontSize="sm">{t('community.work').toUpperCase()}</Text>
              <Text fontSize="sm">{t('community.live').toUpperCase()}</Text>
              <Text fontSize="sm">{t('community.build').toUpperCase()}</Text>
              <Text fontSize="sm">{t('community.conduct').toUpperCase()}</Text>
            </Box>
          </Container>
          <Divider orientation="vertical" borderRightWidth="2px" marginLeft="5%" marginRight="5%" />
          <Box>
            <Heading as="h5" size="sm" marginBottom="15px">
              {t('social.title')}
            </Heading>
            <Text fontSize="sm">{t('social.text')}</Text>
          </Box>
        </Flex>
        <Flex width="40%" wrap="wrap">
          <Box width="50%">
            <Heading as="h5" fontSize="12px" marginBottom="15px">
              <Icon style={{ display: 'inline', marginRight: '10px' }} icon="coding" width="40px" height="40px" />
              {t('iconogram.intro.title').toUpperCase()}
            </Heading>
            <Text fontSize="sm" lineHeight="22px">{t('iconogram.intro.text')}</Text>
          </Box>
          <Box width="50%">
            <Heading as="h5" fontSize="12px" marginBottom="15px">
              <Icon style={{ display: 'inline', marginRight: '10px' }} icon="data-sience" width="40px" height="40px" />
              {t('iconogram.data.title').toUpperCase()}
            </Heading>
            <Text fontSize="sm" lineHeight="22px">{t('iconogram.data.text')}</Text>
          </Box>
          <Box width="50%">
            <Heading as="h5" fontSize="12px" marginBottom="15px">
              <Icon style={{ display: 'inline', marginRight: '10px' }} icon="geekcoding" width="40px" height="40px" />
              {t('iconogram.geekcoding.title').toUpperCase()}
            </Heading>
            <Text fontSize="sm" lineHeight="22px">{t('iconogram.geekcoding.text')}</Text>
          </Box>
          <Box width="50%">
            <Heading as="h5" fontSize="12px" marginBottom="15px">
              <Icon style={{ display: 'inline', marginRight: '10px' }} icon="machine-learning" width="40px" height="40px" />
              {t('iconogram.machine.title').toUpperCase()}
            </Heading>
            <Text fontSize="sm" lineHeight="22px">{t('iconogram.machine.text')}</Text>
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
