import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, FormControl, FormErrorMessage, FormLabel, Input,
  InputGroup, InputLeftAddon, Stack, Text, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
// import Icon from '../../common/components/Icon';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import validationSchemas from '../../common/components/Forms/validationSchemas';
import { objectAreNotEqual } from '../../utils';
import bc from '../../common/services/breathecode';
import { usePersistent } from '../../common/hooks/usePersistent';
import Icon from '../../common/components/Icon';

const ProfileForm = ({ profile }) => {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const [, setProfile] = usePersistent('profile', {});
  const [cookies] = useCookies(['accessToken']);
  const inputColor = useColorModeValue('gray.600', 'gray.200');
  const bgColor = useColorModeValue('white', 'darkTheme');
  const inputDisabledColor = useColorModeValue('gray.600', 'gray.350');
  const backgroundDisabledColor = useColorModeValue('gray.250', 'gray.600');
  const [userInfo, setUserInfo] = useState(null);
  const [defaultUserInfo, setDefaultUserInfo] = useState(null);

  const hasGithub = profile.github && profile.github.username !== '';
  useEffect(() => {
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
                      color={inputColor}
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
                      color={inputColor}
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
                      disabled
                      _disabled={{
                        backgroundColor: backgroundDisabledColor,
                        cursor: 'not-allowed',
                        color: inputDisabledColor,
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
              {/* <Field name="phone">
                {({ form }) => (
                  <FormControl isInvalid={form.errors.phone && form.touched.phone}>
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="phone"
                    >
                      {t('common:phone')}
                    </FormLabel>
                    <Input
                      name="phone"
                      color={inputColor}
                      onChange={(e) => {
                        setUserInfo({
                          ...userInfo, phone: e.target.value,
                        });
                        form.handleChange(e);
                      }}
                      defaultValue={profile.profile?.phone || ''}
                      disabled
                      _disabled={{
                        backgroundColor: backgroundDisabledColor,
                        cursor: 'not-allowed',
                        color: inputDisabledColor,
                        border: '0',
                        // opacity: '0.5',
                      }}
                      type="tel"
                      placeholder=""
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
                  </FormControl>
                )}
              </Field> */}
            </Box>
            <InputGroup>
              <InputLeftAddon background={bgColor} border="1px solid" borderRadius="3px" borderColor="gray.default" height="3.125rem">
                <Icon icon="github" width="24px" height="24px" />
              </InputLeftAddon>
              {hasGithub ? (
                <Input
                  type="text"
                  h="3.125rem"
                  borderColor="gray.default"
                  _focus={{
                    borderColor: 'gray.default',
                  }}
                  _hover={{
                    borderColor: 'gray.default',
                  }}
                  className="form-control github"
                  placeholder="Your Github"
                  readOnly
                  value={profile.github.username.replace(/(:?https?:\/\/)?(?:www\.)?github.com\//gm, '')}
                />
              ) : (
                <Box
                  w="100%"
                  h="3.125rem"
                  border="1px solid"
                  borderRightRadius="3px"
                  display="flex"
                  borderColor="gray.default"
                  alignItems="center"
                >
                  <Text
                    margin={{ base: '0 14px 0 14px', sm: '0 0 0 24px' }}
                    textAlign="start"
                    color="blue.default"
                    cursor="pointer"
                    // href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `${process.env.BREATHECODE_HOST}/v1/auth/github/${cookies.accessToken}?url=${window.location.href}`;
                    }}
                  >
                    {t('connect-github')}
                  </Text>
                </Box>
              )}
            </InputGroup>
            <Button variant="default" disabled={!isModified} fontSize="13px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" width="fit-content" padding="0 24px" alignSelf="end" isLoading={isSubmitting} type="submit">
              {t('save-changes')}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

ProfileForm.propTypes = {
  profile: PropTypes.objectOf(PropTypes.any),
};

ProfileForm.defaultProps = {
  profile: {},
};

export default memo(ProfileForm);
