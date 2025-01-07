import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, FormControl, FormErrorMessage, FormLabel, Input,
  Stack, useToast,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import { memo, useEffect, useState } from 'react';
import validationSchemas from './Forms/validationSchemas';
import { objectAreNotEqual } from '../../utils';
import bc from '../services/breathecode';
import useAuth from '../hooks/useAuth';
import ConnectGithubRigobot from './ConnectGithubRigobot';
import useStyle from '../hooks/useStyle';

function ProfileForm() {
  const { t } = useTranslation('profile');
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [userInfo, setUserInfo] = useState(null);
  const [defaultUserInfo, setDefaultUserInfo] = useState(null);

  const {
    lightColor, disabledColor, disabledBackgroundColor,
  } = useStyle();

  useEffect(() => {
    const userSchema = {
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      phone: user?.phone,
    };
    setUserInfo(userSchema);
    setDefaultUserInfo(userSchema);
    // }
  }, [user]);

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
            updateProfile({
              ...user,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone: data.phone,
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
                      defaultValue={user?.first_name || ''}
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
                      defaultValue={user?.last_name || ''}
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
                      defaultValue={user?.email || ''}
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
            <ConnectGithubRigobot />
            <Button variant="default" disabled={!isModified} fontSize="13px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" width="fit-content" padding="0 24px" alignSelf="end" isLoading={isSubmitting} type="submit">
              {t('save-changes')}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default memo(ProfileForm);
