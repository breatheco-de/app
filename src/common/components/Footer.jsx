import React from 'react';
import {
  Box, Text, Container, Flex,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';

const Footer = () => {
  const { t } = useTranslation('footer');
  return (
    <Container maxW="none" padding="20px">
      <Flex justifyContent="space-between">
        <Box key="icons">
          <Flex justifyContent="space-around">
            <Icon icon="twitter" width="23px" height="23px" />
            <Icon icon="facebook" width="23px" height="23px" />
            <Icon icon="instagram" width="23px" height="23px" />
            <Icon icon="youtube" width="23px" height="23px" />
            <Icon icon="github" width="23px" height="23px" />
          </Flex>
        </Box>
        <Box key="logo">
          <Icon icon="4GeeksIcon" width="90px" height="20px" />
        </Box>
        <Box key="searchbar">
          <Icon icon="logoModern" width="90px" height="20px" />
        </Box>
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
