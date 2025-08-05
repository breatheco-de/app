import React from 'react';
import PropTypes from 'prop-types';
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
  Icon,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../hooks/useStyle';

function PricingModal({
  isOpen,
  onClose,
  mainImage,
  title,
  subtitle,
  callToActions,
  ...rest
}) {
  const { t } = useTranslation('pricing');
  const { hexColor } = useStyle();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        bg={hexColor.lightGreyBackground}
        borderRadius="16px"
        overflow="hidden"
        boxShadow="0 20px 40px rgba(0, 0, 0, 0.15)"
        {...rest}
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
                src={mainImage}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </Box>

            <Box flex={{ base: '1', md: '1' }} p="20px" w={{ base: '100%', md: 'auto' }}>
              <VStack align="start" spacing={{ base: '12px', md: '16px' }} mb={{ base: '20px', md: '32px' }}>
                <Text
                  fontSize={{ base: '16px', md: '18px' }}
                  fontWeight="bold"
                  color="blue.default"
                >
                  {title || t('common:start-your-tech-career')}
                </Text>
                <Text
                  fontSize={{ base: '14px', md: '18px' }}
                  color="gray.600"
                  marginTop="0 !important"
                >
                  {subtitle || t('common:go-all-in-or-learn-flexibly')}
                </Text>
              </VStack>

              <VStack spacing={{ base: '16px', md: '24px' }} align="stretch">
                {callToActions && callToActions.map((cta) => (
                  <Box
                    p={{ base: '16px', md: '24px' }}
                    borderRadius="12px"
                    bg="white"
                    transition="all 0.2s"
                    _hover={{
                      borderColor: 'blue.default',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <HStack spacing="16px" mb="12px">
                      {cta.icon && (
                        <Box
                          p="8px"
                          borderRadius="8px"
                          bg={cta.iconBgColor || 'green.100'}
                          color={cta.iconColor || 'green.600'}
                        >
                          <Icon as={cta.icon} boxSize="20px" />
                        </Box>
                      )}
                      <Text
                        fontSize="18px"
                        fontWeight="600"
                        color="gray.800"
                      >
                        {cta.title}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="14px"
                      color="gray.600"
                      lineHeight="1.5"
                      mb="16px"
                    >
                      {cta.description}
                    </Text>
                    <Button
                      bg="blue.default"
                      color="white"
                      fontWeight="400"
                      size="sm"
                      onClick={() => cta.action && cta.action()}
                      _hover="none"
                      width="fit-content"
                    >
                      {cta.buttonText || t('see-plan-details')}
                    </Button>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

PricingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mainImage: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  callToActions: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      buttonText: PropTypes.string,
      icon: PropTypes.elementType,
      iconBgColor: PropTypes.string,
      iconColor: PropTypes.string,
      action: PropTypes.func,
    }),
  ).isRequired,
};

PricingModal.defaultProps = {
  mainImage: null,
  title: '',
  subtitle: '',
};

export default PricingModal;
