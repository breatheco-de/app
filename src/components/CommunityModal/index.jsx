import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Box,
  Text,
  Button,
  Flex,
  Image,
  VStack,
  HStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Icon from '../Icon';
import { communitiesConfig } from '../../config/communitiesConfig';
import useStyle from '../../hooks/useStyle';

function CommunityModal({ isOpen, onClose, mainImage }) {
  const { t } = useTranslation('communities');
  const { hexColor } = useStyle();

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
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        bg={hexColor.lightGreyBackground}
        borderRadius="16px"
        overflow="hidden"
        boxShadow="0 20px 40px rgba(0, 0, 0, 0.15)"
        maxW={{ base: '90%', md: '900px' }}
      >
        <ModalCloseButton
          position="absolute"
          right="16px"
          top="16px"
          zIndex="10"
          bg="white"
          borderRadius="full"
          size="sm"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
        />
        <ModalBody p="0">
          <Flex direction={{ base: 'column', md: 'row' }} minH={{ base: 'auto', md: '500px' }}>
            <Box
              flex="1"
              position="relative"
              display={{ base: 'none', md: 'flex' }}
              alignItems="center"
              justifyContent="center"
              p="20px 0 20px 20px"
              minH={{ base: '200px', md: 'auto' }}
            >
              <Image
                src={defaultImage}
                width="100%"
                height="100%"
                objectFit="cover"
                alt="Community"
              />
            </Box>

            <Box flex={{ base: '1', md: '1' }} p="20px" w={{ base: '100%', md: 'auto' }}>
              <VStack align="start" spacing={{ base: '12px', md: '16px' }} mb={{ base: '20px', md: '32px' }}>
                <Text
                  fontSize={{ base: '16px', md: '18px' }}
                  fontWeight="bold"
                  color="blue.default"
                >
                  {t(communitiesConfig.title || 'title')}
                </Text>
                {communitiesConfig.description && (
                  <Text
                    fontSize={{ base: '14px', md: '16px' }}
                    color="gray.600"
                    marginTop="0 !important"
                  >
                    {t(communitiesConfig.description)}
                  </Text>
                )}
              </VStack>

              <VStack spacing={{ base: '16px', md: '24px' }} align="stretch">
                {communitiesConfig.communities.map((community) => {
                  const iconName = getCommunityIcon(community.type);

                  return (
                    <Box
                      key={community.id}
                      p={{ base: '16px', md: '24px' }}
                      borderRadius="12px"
                      bg="white"
                      transition="all 0.2s"
                      _hover={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <HStack spacing="16px" mb="12px">
                        {iconName && (
                          <Box flexShrink={0}>
                            <Icon
                              icon={iconName}
                              width="32px"
                              height="32px"
                            />
                          </Box>
                        )}
                        <Text
                          fontSize={{ base: '16px', md: '18px' }}
                          fontWeight="600"
                          color="gray.800"
                        >
                          {t(community.name)}
                        </Text>
                      </HStack>
                      {community.description && (
                        <Text
                          fontSize={{ base: '12px', md: '14px' }}
                          color="gray.600"
                          lineHeight="1.5"
                          mb="16px"
                        >
                          {t(community.description)}
                        </Text>
                      )}
                      <Button
                        bg="blue.default"
                        color="white"
                        fontWeight="400"
                        size="sm"
                        onClick={() => handleCommunityClick(community.url)}
                        _hover="none"
                        width="fit-content"
                      >
                        {t('join') || 'Unirse'}
                      </Button>
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

CommunityModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mainImage: PropTypes.string,
};

CommunityModal.defaultProps = {
  mainImage: null,
};

export default CommunityModal;
