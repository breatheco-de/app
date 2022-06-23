import { useState, memo, useEffect } from 'react';
import {
  Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
  ModalOverlay, Stack, useColorModeValue, useDisclosure,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import Text from './Text';
import Link from './NextChakraLink';

const ShareButton = ({ socials }) => {
  const { t } = useTranslation('profile');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const labelColor = useColorModeValue('gray.600', 'gray.200');
  const [copied, setCopied] = useState(false);
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.500');

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }, [copied]);

  const onCopy = () => {
    setCopied(true);
  };

  const defaultSocial = [
    {
      name: 'twitter',
      label: 'Twitter',
      href: 'https://www.twitter.com',
      color: '#1DA1F2',
    },
    {
      name: 'facebook',
      label: 'Facebook',
      href: 'https://www.facebook.com',
      color: '#4267B2',
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com',
      color: '#0077B5',
    },
  ];

  return (
    <Stack flexDirection="row">
      <Button variant="default" onClick={onOpen} height="auto" textTransform="uppercase">
        {t('share:button-text')}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent borderRadius="17px" marginTop="10%">
          <ModalHeader fontSize="15px" color={labelColor} textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={commonBorderColor} fontWeight="900" textTransform="uppercase">
            {t('share:title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4} px={{ base: '10px', md: '35px' }}>
            <Text size="16px" p="20px 0 35px 0" textAlign="center">
              {t('share:share-via')}
            </Text>

            <Stack display="grid" gridTemplateColumns="repeat(auto-fill, minmax(7rem, 1fr))" justifyItems="center">
              {(socials || defaultSocial).map((l) => (
                <Box style={{ margin: '0px' }} textAlign="center" display="flex" flexDirection="column" gridGap="6px">
                  <Link display="flex" key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" minWidth="68px" minHeight="68px" alignItems="center" justifyContent="center" borderRadius="35px" backgroundColor="featuredLight" style={{ margin: '0px' }}>
                    <Icon icon={l.name} color={l.color} width="36px" height="36px" />
                  </Link>
                  <Text size="12px">
                    {l.label}
                  </Text>
                </Box>
              ))}
              <Box style={{ margin: '0px' }} textAlign="center" alignItems="center" display="flex" flexDirection="column" gridGap="6px">
                <Button onClick={() => onCopy()} backgroundColor="featuredLight" width="68px" height="68px" style={{ margin: '0', padding: '0' }} _hover={{ backgroundColor: 'featuredLight' }} _active={{ backgroundColor: 'featuredLight' }} borderRadius="35px" margin="0">
                  <Box padding="10px" backgroundColor="blue.default" borderRadius="35px">
                    <Icon icon="copy" width="22px" height="22px" />
                  </Box>
                </Button>
                <Text color={copied ? 'success' : ''}>
                  {copied ? t('common:copied') : t('share:copy-link')}
                </Text>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter margin="22px 1.5rem" padding="0">
            <Text size="13px" fontWeight="400" lineHeight="24px" textAlign="center" padding="20px 1.4rem" justifyContent="center" borderRadius="5px" letterSpacing="0.05em" backgroundColor="featuredLight">
              {t('share:message')}
              {' '}
              <Link href={t('share:message-link.url')} color="blue.default">
                {t('share:message-link.text')}
              </Link>
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

ShareButton.propTypes = {
  socials: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    color: PropTypes.string,
  })),
};

ShareButton.defaultProps = {
  socials: [],
};

export default memo(ShareButton);
