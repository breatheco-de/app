import React from 'react';
import {
  Box,
  Text as ChakraText,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Image,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Icon from '../Icon';
import Heading from '../Heading';
import { communitiesConfig } from '../../config/communitiesConfig';
import useStyle from '../../hooks/useStyle';

function CommunityPage({ mainImage }) {
  const { t } = useTranslation('communities');
  const { backgroundColor } = useStyle();

  const defaultImage = mainImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';

  const handleCommunityClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getCommunityIcon = (type) => {
    switch (type) {
      case 'whatsapp':
        return 'whatsapp';
      case 'discord':
        return 'discord';
      case 'telegram':
        return 'telegram';
      case 'slack':
        return 'slack';
      default:
        return null;
    }
  };

  return (
    <VStack spacing={{ base: '20px', md: '28px' }} align="center">
      {/* Hero Section */}
      <Box textAlign="center" marginBottom={{ base: '20px', md: '40px' }} width="100%">
        <Heading
          size="l"
          fontWeight="400"
          marginBottom="24px"
        >
          <ChakraText
            fontSize={{ base: '27px', md: '38px', lg: '45px' }}
            fontWeight="400"
            display="initial"
            lineHeight="inherit"
            as="span"
          >
            {t(communitiesConfig.title || 'title')}
          </ChakraText>
        </Heading>
        {communitiesConfig.description && (
          <ChakraText
            fontSize={{ base: '15px', lg: '18px' }}
            color="gray.600"
            maxWidth="800px"
            margin="0 auto"
            marginBottom={{ base: '24px', md: '32px' }}
            lineHeight="inherit"
          >
            {t(communitiesConfig.description)}
          </ChakraText>
        )}
        <Box
          margin="0 auto"
          maxWidth={{ base: '100%', md: '1000px' }}
          borderRadius="16px"
          overflow="hidden"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.1)"
        >
          <Image
            src={defaultImage}
            alt="Community"
            width="100%"
            height={{ base: '250px', md: '400px' }}
            objectFit="cover"
          />
        </Box>
      </Box>

      {/* Communities Grid */}
      <SimpleGrid
        columns={{ base: 1, sm: 2 }}
        spacing={{ base: '16px', sm: '20px' }}
        maxWidth="1000px"
        margin="0 auto"
        width="100%"
      >
        {communitiesConfig.communities.map((community) => {
          const iconName = getCommunityIcon(community.type);

          return (
            <Box
              key={community.id}
              p={{ base: '16px', md: '20px' }}
              borderRadius="12px"
              bg={backgroundColor}
              border="1px solid"
              borderColor="gray.200"
              transition="all 0.3s"
              _hover={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)',
                borderColor: 'blue.default',
              }}
            >
              <VStack align="start" spacing="12px">
                <HStack spacing="12px">
                  {iconName && (
                    <Box flexShrink={0}>
                      <Icon
                        icon={iconName}
                        width="32px"
                        height="32px"
                      />
                    </Box>
                  )}
                  <Heading
                    size="sm"
                    fontWeight="600"
                    color="gray.800"
                  >
                    {t(community.name)}
                  </Heading>
                </HStack>
                {community.description && (
                  <ChakraText
                    fontSize={{ base: '14px', md: '15px' }}
                    color="gray.600"
                    lineHeight="1.5"
                  >
                    {t(community.description)}
                  </ChakraText>
                )}
                <Button
                  bg="blue.default"
                  color="white"
                  fontWeight="400"
                  size="sm"
                  onClick={() => handleCommunityClick(community.url)}
                  _hover={{
                    bg: 'blue.600',
                  }}
                  width="fit-content"
                >
                  {t('join') || 'Unirse'}
                </Button>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
}

CommunityPage.propTypes = {
  mainImage: PropTypes.string,
};

CommunityPage.defaultProps = {
  mainImage: null,
};

export default CommunityPage;
