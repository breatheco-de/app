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
      <Flex
        direction={['column', 'column', 'row', 'row']}
        justifyContent="space-between"
        marginBottom="10px"
        alignItems="center"
      >
        <Box
          key="icons"
          display="flex"
          flexDir="column"
          justifyContent="center"
          width={['100%', '50%', '25%', '25%']}
          marginBottom={['20px', '20px', '0', '0']}
        >
          <Flex justifyContent="space-around">
            <Icon icon="twitter" width="23px" height="23px" />
            <Icon icon="facebook" width="23px" height="23px" />
            <Icon icon="instagram" width="23px" height="23px" />
            <Icon icon="youtube" width="23px" height="23px" color={colorMode === 'light' ? '#020203' : '#FFFFFF'} />
            <Icon icon="github" width="23px" height="23px" />
          </Flex>
        </Box>
        <Box
          marginBottom={['20px', '20px', '0', '0']}
          order={[-1, -1, 0, 0]}
          key="logo"
          width={['100%', '50%', '25%', '25%']}
        >
          <Icon style={{ margin: 'auto' }} icon="4GeeksIcon" width="150px" height="60px" />
        </Box>
        <Box
          key="searchbar"
          display="flex"
          flexDir="column"
          ustifyContent="center"
          width={['100%', '50%', '25%', '25%']}
        >
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
              placeholder={t('search')}
            />
            {/* <InputRightElement children={<Search2Icon color='green.500' />} /> */}
          </InputGroup>
        </Box>
      </Flex>
      <Divider borderBottomWidth="2px" />
      <Flex padding={['30px 10px', '30px 20px', '30px 0 30px 20px', '30px 40px']}>
        <Flex
          minWidth="60%"
          width={['100%', '100%', '60%', '60%']}
          marginRight={['0', '0', '3%', '3%']}
          justifyContent={['space-between', 'space-between', 'normal', 'normal']}
          wrap={['wrap', 'wrap', 'nowrap', 'nowrap']}
        >
          <Box
            textAlign={['center', 'center', 'left', 'left']}
            width={['47%', '40%', 'auto', 'auto']}
            marginRight={['0', '0', '5%', '5%']}
          >
            <Heading as="h5" size="sm" marginBottom="15px">
              {t('company.title')}
            </Heading>
            <Text fontSize="sm">{t('company.about').toUpperCase()}</Text>
            <Text fontSize="sm">{t('company.contact').toUpperCase()}</Text>
            <Text fontSize="sm">{t('company.media').toUpperCase()}</Text>
          </Box>
          {/* ---- RESPONSIVE BOXES ---- */}
          <Box
            width={['47%', '40%', 'auto', 'auto']}
            marginBottom="30px"
            textAlign="center"
            display={[
              'block', // 0-30em
              'block', // 30em-48em
              'none', // 48em-62em
              'none', // 62em+
            ]}
          >
            <Heading as="h5" size="sm" marginBottom="15px">
              {t('learning.title')}
            </Heading>
            <Text fontSize="sm">{t('learning.read').toUpperCase()}</Text>
            <Text fontSize="sm">{t('learning.practice').toUpperCase()}</Text>
            <Text fontSize="sm">{t('learning.build').toUpperCase()}</Text>
            <Text fontSize="sm">{t('learning.how').toUpperCase()}</Text>
          </Box>
          <Box
            textAlign="center"
            width={['47%', '40%', 'auto', 'auto']}
            display={[
              'block', // 0-30em
              'block', // 30em-48em
              'none', // 48em-62em
              'none', // 62em+
            ]}
          >
            <Heading as="h5" size="sm" marginBottom="15px">
              {t('community.title')}
            </Heading>
            <Text fontSize="sm">{t('community.work').toUpperCase()}</Text>
            <Text fontSize="sm">{t('community.live').toUpperCase()}</Text>
            <Text fontSize="sm">{t('community.build').toUpperCase()}</Text>
            <Text fontSize="sm">{t('community.conduct').toUpperCase()}</Text>
          </Box>
          <Box
            textAlign="center"
            width={['47%', '40%', 'auto', 'auto']}
            display={[
              'block', // 0-30em
              'block', // 30em-48em
              'none', // 48em-62em
              'none', // 62em+
            ]}
          >
            <Heading as="h5" size="sm" marginBottom="15px">
              {t('social.title')}
            </Heading>
            <Text fontSize="sm">{t('iconogram.intro.title')}</Text>
            <Text fontSize="sm">{t('iconogram.data.title')}</Text>
            <Text fontSize="sm">{t('iconogram.geekcoding.title')}</Text>
            <Text fontSize="sm">{t('iconogram.machine.title')}</Text>
          </Box>
          {/* ---- RESPONSIVE BOXES ---- */}
          <Container
            marginRight="5%"
            paddingRight="4%"
            maxW="none"
            paddingLeft="0"
            borderRight="2px"
            borderColor="#e2e8f0"
            flexShrink="0.7"
            display={[
              'none', // 0-30em
              'none', // 30em-48em
              'block', // 48em-62em
              'block', // 62em+
            ]}
          >
            <Box width="100%" paddingLeft="15%" marginBottom="20px" borderLeft="2px" borderColor="#e2e8f0">
              <Heading as="h5" size="sm" marginBottom="15px">
                {t('learning.title')}
              </Heading>
              <Text fontSize="sm">{t('learning.read').toUpperCase()}</Text>
              <Text fontSize="sm">{t('learning.practice').toUpperCase()}</Text>
              <Text fontSize="sm">{t('learning.build').toUpperCase()}</Text>
              <Text fontSize="sm">{t('learning.how').toUpperCase()}</Text>
            </Box>
            <Box width="100%" paddingLeft="15%" borderLeft="2px" borderColor="#e2e8f0">
              <Heading as="h5" size="sm" marginBottom="15px">
                {t('community.title')}
              </Heading>
              <Text fontSize="sm">{t('community.work').toUpperCase()}</Text>
              <Text fontSize="sm">{t('community.live').toUpperCase()}</Text>
              <Text fontSize="sm">{t('community.build').toUpperCase()}</Text>
              <Text fontSize="sm">{t('community.conduct').toUpperCase()}</Text>
            </Box>
          </Container>
          {/* <Divider
            style={{ borderColor: colorMode === 'light' ? '#e2e8f0' : '#FFFFFF' }}
            borderColor={colorMode === 'light' ? '#e2e8f0' : '#FFFFFF'}
            orientation="vertical"
            borderRightWidth="2px"
            marginLeft="5%"
            marginRight="5%"
          /> */}
          <Box
            display={[
              'none', // 0-30em
              'none', // 30em-48em
              'block', // 48em-62em
              'block', // 62em+
            ]}
          >
            <Heading as="h5" size="sm" marginBottom="15px">
              {t('social.title')}
            </Heading>
            <Text fontSize="sm">{t('social.text')}</Text>
          </Box>
        </Flex>
        <Flex
          key="iconogram"
          width="40%"
          wrap="wrap"
          justifyContent="space-between"
          display={[
            'none', // 0-30em
            'none', // 30em-48em
            'flex', // 48em-62em
            'flex', // 62em+
          ]}
        >
          <Box width="48%" marginRight="2px" marginBottom="5px">
            <Heading as="h5" fontSize="12px" marginBottom="15px">
              <Icon style={{ display: 'inline', marginRight: '10px' }} icon="coding" width="40px" height="40px" />
              {t('iconogram.intro.title').toUpperCase()}
            </Heading>
            <Text fontSize="sm" lineHeight="22px">{t('iconogram.intro.text')}</Text>
          </Box>
          <Box width="48%" marginRight="2px" marginBottom="5px">
            <Heading as="h5" fontSize="12px" marginBottom="15px">
              <Icon style={{ display: 'inline', marginRight: '10px' }} icon="data-sience" width="40px" height="40px" />
              {t('iconogram.data.title').toUpperCase()}
            </Heading>
            <Text fontSize="sm" lineHeight="22px">{t('iconogram.data.text')}</Text>
          </Box>
          <Box width="48%" marginRight="2px" marginBottom="5px">
            <Heading as="h5" fontSize="12px" marginBottom="15px">
              <Icon style={{ display: 'inline', marginRight: '10px' }} icon="geekcoding" width="40px" height="40px" />
              {t('iconogram.geekcoding.title').toUpperCase()}
            </Heading>
            <Text fontSize="sm" lineHeight="22px">{t('iconogram.geekcoding.text')}</Text>
          </Box>
          <Box width="48%" marginRight="2px" marginBottom="5px">
            <Heading as="h5" fontSize="12px" marginBottom="15px">
              <Icon style={{ display: 'inline', marginRight: '10px' }} icon="machine-learning" width="40px" height="40px" />
              {t('iconogram.machine.title').toUpperCase()}
            </Heading>
            <Text fontSize="sm" lineHeight="22px">{t('iconogram.machine.text')}</Text>
          </Box>
        </Flex>
      </Flex>
      <Divider borderBottomWidth="2px" />
      <Flex
        key="copyright"
        padding="20px 20px 0 20px"
        justifyContent={['center', 'center', 'space-between', 'space-between']}
        wrap={['wrap', 'wrap', 'nowrap', 'nowrap']}
        // alignItems="center"
        textAlign="center"
      >
        <Text marginBottom={['20px', '20px', '0', '0']} fontSize="sm">{t('copyright')}</Text>
        <Flex
          wrap={['wrap', 'wrap', 'nowrap', 'nowrap']}
          justifyContent="center"
          width={['100%', '100%', '35%', '35%']}
          // alignItems="center"
        >
          <Text fontSize="sm">{t('privacy')}</Text>
          <Divider
            orientation="vertical"
            // borderRightWidth="2px"
            marginLeft="10px"
            marginRight="10px"
            borderColor="#3A3A3A"
            maxH={['20px', '20px', '50', '50']}
          />
          <Text fontSize="sm">{t('cookies')}</Text>
          <Divider
            orientation="vertical"
            // borderRightWidth="2px"
            marginLeft="10px"
            marginRight="10px"
            borderColor="#3A3A3A"
            maxH={['20px', '20px', '50', '50']}
          />
          <Text fontSize="sm">{t('terms')}</Text>
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
