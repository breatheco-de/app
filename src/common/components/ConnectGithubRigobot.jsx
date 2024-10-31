/* eslint-disable no-unused-vars */
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, Heading,
  InputGroup, InputLeftAddon, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Stack, Text, Tooltip, useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getStorageItem } from '../../utils';
import { RIGOBOT_HOST, BREATHECODE_HOST } from '../../utils/variables';
import bc from '../services/breathecode';
import useAuth from '../hooks/useAuth';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function ConnectGithubRigobot({ ...rest }) {
  const { t } = useTranslation('profile');
  const { user, isAuthenticatedWithRigobot, conntectToRigobot } = useAuth();

  const toast = useToast();
  const router = useRouter();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const {
    borderColor, backgroundColor, modal,
  } = useStyle();

  const hasGithub = user?.github && user.github.username !== '';

  return (
    <>
      <Stack spacing={4} justifyContent="space-between" {...rest}>
        <InputGroup>
          <InputLeftAddon background={backgroundColor} border="1px solid" borderRadius="3px" borderColor="gray.default" height="3.125rem">
            <Icon icon="github" width="24px" height="24px" />
          </InputLeftAddon>
          <Box
            w="100%"
            h="3.125rem"
            border="1px solid"
            borderRightRadius="3px"
            display="flex"
            borderColor="gray.default"
            alignItems="center"
          >
            {hasGithub ? (
              <>
                <Text
                  margin={{ base: '0 14px 0 14px', sm: '0 0 0 24px' }}
                  textAlign="start"
                  cursor="default"
                >
                  {user.github.username.replace(/(:?https?:\/\/)?(?:www\.)?github.com\//gm, '')}
                </Text>
                <Text
                  margin={{ base: '0 14px 0 auto', sm: '0 24px 0 auto' }}
                  textAlign="start"
                  color="blue.default"
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  gridGap="6px"
                  textTransform="uppercase"
                  fontSize="14px"
                  onClick={() => {
                    setModalIsOpen(true);
                  }}
                >
                  <Icon icon="close" width="10px" height="10px" />
                  {t('remove')}
                </Text>
              </>
            ) : (
              <Text
                margin={{ base: '0 14px 0 14px', sm: '0 0 0 24px' }}
                textAlign="start"
                color="blue.default"
                cursor="pointer"
                onClick={(e) => {
                  e.preventDefault();
                  const accessToken = getStorageItem('accessToken');
                  window.location.href = `${BREATHECODE_HOST}/v1/auth/github/${accessToken}?url=${window.location.href}`;
                }}
              >
                {t('connect-github')}
              </Text>
            )}
          </Box>
        </InputGroup>
        <InputGroup>
          <InputLeftAddon background={backgroundColor} border="1px solid" borderRadius="3px" borderColor="gray.default" height="3.125rem">
            <Icon icon="rigobot-logo" width="24px" height="24px" />
          </InputLeftAddon>
          <Box
            w="100%"
            h="3.125rem"
            border="1px solid"
            borderRightRadius="3px"
            display="flex"
            borderColor="gray.default"
            alignItems="center"
          >
            {isAuthenticatedWithRigobot ? (
              <>
                <Text
                  margin={{ base: '0 14px 0 14px', sm: '0 0 0 24px' }}
                  textAlign="start"
                  cursor="default"
                >
                  {t('connected-with-rigobot')}
                </Text>
              </>
            ) : (
              <Tooltip label={!user?.github?.username ? t('rigobot-requires-github-connection') : ''} placement="top">
                <Button
                  variant="link"
                  fontSize="16px"
                  isDisabled={!user?.github?.username}
                  _hover={{ textDecoration: 'none' }}
                  margin={{ base: '0 14px 0 14px', sm: '0 0 0 24px' }}
                  textAlign="start"
                  color="blue.default"
                  cursor="pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (user?.github?.username) {
                      conntectToRigobot();
                    }
                  }}
                >
                  {t('connect-rigobot')}
                </Button>
              </Tooltip>
            )}
          </Box>
        </InputGroup>
      </Stack>
      <Modal isOpen={modalIsOpen} size="xl" margin="0 10px" onClose={() => setModalIsOpen(false)}>
        <ModalOverlay />
        <ModalContent background={modal.background}>
          <ModalHeader borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={borderColor} textAlign="center">
            {t('remove-github-modal.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody padding={{ base: '26px 18px', md: '42px 36px' }}>
            <Heading as="p" size="xsm" fontWeight="700" letterSpacing="0.05em" padding={{ base: '0 1rem 26px 1rem', md: '0 4rem 52px 4rem' }} textAlign="center">
              {t('remove-github-modal.description')}
            </Heading>
            <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} gridGap="12px" justifyContent="space-around">
              <Button
                variant="outline"
                onClick={() => setModalIsOpen(false)}
                textTransform="uppercase"
                fontSize="13px"
              >
                {t('common:close')}
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  bc.auth().removeGithub()
                    .then(() => {
                      setModalIsOpen(false);
                      setTimeout(() => {
                        router.reload();
                      }, 1000);
                      toast({
                        position: 'top',
                        title: t('alert-message:any-removed', { any: 'GitHub' }),
                        description: t('alert-message:github-account-removed'),
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                      });
                    })
                    .catch(() => {
                      toast({
                        position: 'top',
                        title: t('alert-message:something-went-wrong'),
                        description: t('alert-message:error-removing-github'),
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                      });
                    });
                }}
                textTransform="uppercase"
                fontSize="13px"
              >
                {t('common:confirm')}
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ConnectGithubRigobot;
