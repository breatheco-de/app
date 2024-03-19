import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, FormControl, FormErrorMessage, FormLabel, Heading, Input,
  InputGroup, InputLeftAddon, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Stack, Text, Tooltip, useToast,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
// import Icon from '../../common/components/Icon';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import validationSchemas from './Forms/validationSchemas';
import { getStorageItem, objectAreNotEqual } from '../../utils';
import bc from '../services/breathecode';
import { usePersistent } from '../hooks/usePersistent';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';
import modifyEnv from '../../../modifyEnv';

function ProfileForm({ profile }) {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const router = useRouter();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [, setProfile] = usePersistent('profile', {});
  const [userInfo, setUserInfo] = useState(null);
  const [defaultUserInfo, setDefaultUserInfo] = useState(null);
  const [hasRigobotConnection, setHasRigobotConnection] = useState(false);
  const accessToken = getStorageItem('accessToken');

  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const {
    borderColor, backgroundColor, lightColor, disabledColor, modal, disabledBackgroundColor,
  } = useStyle();

  const hasGithub = profile.github && profile.github.username !== '';
  const verifyRigobotConnection = async () => {
    const resp = await bc.auth().verifyRigobotConnection(accessToken);
    if (resp.status === 200) {
      setHasRigobotConnection(true);
    }
  };
  useEffect(() => {
    verifyRigobotConnection();
    const userSchema = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone,
    };
    setUserInfo(userSchema);
    setDefaultUserInfo(userSchema);
    // }
  }, [profile]);

  const isModified = userInfo !== null
    && defaultUserInfo !== null
    && objectAreNotEqual(userInfo, defaultUserInfo);

  return typeof userInfo === 'object' && (
    <Formik
      enableReinitialize
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={userInfo}
      onSubmit={(values, actions) => {
        actions.setSubmitting(true);
        bc.auth().updateProfile(values)
          .then(({ data }) => {
            toast({
              position: 'top',
              title: t('profile:profile-updated'),
              status: 'success',
              duration: 9000,
              isClosable: true,
            });
            setProfile({
              ...profile,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone: data?.phone,
            });
          })
          .catch(() => {
            toast({
              position: 'top',
              title: t('profile:update-failed'),
              // description: err.message,
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
          })
          .finally(() => {
            actions.setSubmitting(false);
          });
      }}
      validator={() => ({})}
      validationSchema={validationSchemas.handleProfile}
    >
      {({ isSubmitting }) => (
        <Form style={{ width: '100%' }}>
          <Stack spacing={6} justifyContent="space-between">
            <Box display="flex" gridGap="24px" flexDirection={{ base: 'column', sm: 'row' }}>
              <Field name="first_name">
                {({ form }) => (
                  <FormControl isInvalid={form.errors.first_name && form.touched.first_name}>
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="email"
                    >
                      {t('common:first-name')}
                    </FormLabel>
                    <Input
                      name="first_name"
                      color={lightColor}
                      onChange={(e) => {
                        setUserInfo({ ...userInfo, first_name: e.target.value });
                        form.handleChange(e);
                      }}
                      defaultValue={profile?.first_name || ''}
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <FormErrorMessage>{form.errors.first_name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="last_name">
                {({ form }) => (
                  <FormControl isInvalid={form.errors.last_name && form.touched.last_name}>
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="last_name"
                    >
                      {t('common:last-name')}
                    </FormLabel>
                    <Input
                      name="last_name"
                      color={lightColor}
                      onChange={(e) => {
                        setUserInfo({
                          ...userInfo, last_name: e.target.value,
                        });
                        form.handleChange(e);
                      }}
                      defaultValue={profile?.last_name || ''}
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <FormErrorMessage>{form.errors.last_name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </Box>
            <Box display="flex" gridGap="24px" flexDirection={{ base: 'column', sm: 'row' }}>
              <Field name="email">
                {({ form }) => (
                  <FormControl isInvalid={form.errors.email && form.touched.email}>
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="email"
                    >
                      {t('common:email')}
                    </FormLabel>
                    <Input
                      name="email"
                      onChange={(e) => {
                        setUserInfo({
                          ...userInfo, email: e.target.value,
                        });
                        form.handleChange(e);
                      }}
                      defaultValue={profile?.email || ''}
                      isDisabled
                      _disabled={{
                        backgroundColor: disabledBackgroundColor,
                        cursor: 'not-allowed',
                        color: disabledColor,
                        border: '0',
                        // opacity: '0.5',
                      }}
                      type="email"
                      placeholder="email@example.co"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </Box>
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
                      // href="#"
                    >
                      {profile.github.username.replace(/(:?https?:\/\/)?(?:www\.)?github.com\//gm, '')}
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
                    // href="#"
                    onClick={(e) => {
                      e.preventDefault();
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
                {hasRigobotConnection ? (
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
                  <Tooltip label={!profile?.github?.username ? t('rigobot-requires-github-connection') : ''} placement="top">
                    <Button
                      variant="link"
                      fontSize="16px"
                      isDisabled={!profile?.github?.username}
                      _hover={{ textDecoration: 'none' }}
                      margin={{ base: '0 14px 0 14px', sm: '0 0 0 24px' }}
                      textAlign="start"
                      color="blue.default"
                      cursor="pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        if (profile?.github?.username) {
                          window.open(`https://rigobot.herokuapp.com/invite/?referer=4geeks&token=${accessToken}`, '_blank');
                        }
                      }}
                    >
                      {t('connect-rigobot')}
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </InputGroup>
            <Button variant="default" disabled={!isModified} fontSize="13px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" width="fit-content" padding="0 24px" alignSelf="end" isLoading={isSubmitting} type="submit">
              {t('save-changes')}
            </Button>
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
        </Form>
      )}
    </Formik>
  );
}

ProfileForm.propTypes = {
  profile: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ProfileForm.defaultProps = {
  profile: {},
};

export default memo(ProfileForm);
