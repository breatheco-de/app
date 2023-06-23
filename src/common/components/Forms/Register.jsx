import useTranslation from 'next-translate/useTranslation';
import {
  Button,
  FormControl,
  Stack,
  FormLabel,
  Input,
  FormErrorMessage,
  Box,
  // InputRightElement,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import { useRouter } from 'next/router';
// import Icon from '../Icon';
import { useState } from 'react';
import validationSchema from './validationSchemas';
import { setStorageItem } from '../../../utils';
import modifyEnv from '../../../../modifyEnv';
import Link from '../NextChakraLink';
import ModalInfo from '../../../js_modules/moduleMap/modalInfo';

function Register() {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { t } = useTranslation('login');
  const [showAlreadyMember, setShowAlreadyMember] = useState(false);
  // const [showPSW, setShowPSW] = useState(false);
  // const [showRepeatPSW, setShowRepeatPSW] = useState(false);

  const router = useRouter();

  // const toggleShowRepeatPSW = () => setShowRepeatPSW(!showRepeatPSW);
  // const toggleShowPSW = () => setShowPSW(!showPSW);

  return (
    <>
      <ModalInfo
        isOpen={showAlreadyMember}
        headerStyles={{ textAlign: 'center' }}
        onClose={() => setShowAlreadyMember(false)}
        title={t('signup:alert-message.title')}
        childrenDescription={(
          <Box textAlign="center">
            {t('signup:alert-message.message1')}
            {' '}
            <Link variant="default" href="/">4Geeks.com</Link>
            .
            <br />
            {t('signup:alert-message.message2')}
            .
          </Box>
        )}
        disableCloseButton
        actionHandler={() => {
          setStorageItem('redirect', router?.asPath);
          router.push('/login');
          setShowAlreadyMember(false);
        }}
        handlerText={t('common:login')}
      />
      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          // dateOfBirth: '',
          // password: '',
          // passwordConfirmation: '',
        }}
        onSubmit={async (values, actions) => {
          const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/subscribe/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept-Language': router?.locale || 'en',
            },
            body: JSON.stringify({
              ...values,
              plan: '4geeks-standard',
            }),
          });
          const data = await resp.json();

          // if (data?.access_token && data?.is_email_validated === false) {
          //   toast({
          //     position: 'top',
          //     status: 'warning',
          //     title: t('signup:alert-message-validate-email.title'),
          //     description: (
          //       <Box>
          //         {t('signup:alert-message-validate-email.description')}
          //         {' '}
          //         <Link variant="default" color="blue.200" href="/">4Geeks.com</Link>
          //         .
          //         <br />
          //         {t('signup:alert-message-validate-email.description2')}
          //       </Box>
          //     ),
          //     duration: 9000,
          //     isClosable: true,
          //   });
          // }
          if (data?.access_token) {
            router.push({
              pathname: '/checkout',
              query: {
                plan: '4geeks-standard',
                token: data.access_token,
              },
            });
          }
          if (typeof resp?.status === 'number' && data?.access_token === null) {
            actions.setSubmitting(false);
            if (resp.status < 400 && typeof data?.id === 'number') {
              setStorageItem('subscriptionId', data.id);
              router.push('/thank-you');
            }
            if (resp.status === 400) {
              setShowAlreadyMember(true);
            }
          }
        }}
        validationSchema={validationSchema.register}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={6}>
              <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="25px">
                <Field name="first_name">
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.first_name && form.touched.first_name}>
                      <FormLabel
                        margin="0px"
                        color="gray.default"
                        fontSize="sm"
                        float="left"
                        htmlFor="first_name"
                      >
                        {t('common:first-name')}
                      </FormLabel>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('common:first-name')}
                        height="50px"
                        borderColor="gray.default"
                        borderRadius="3px"
                      />
                      <FormErrorMessage>{form.errors.first_name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="last_name">
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.last_name && form.touched.last_name}>
                      <FormLabel
                        margin="0px"
                        color="gray.default"
                        fontSize="sm"
                        float="left"
                        htmlFor="lest_name"
                      >
                        {t('common:last-name')}
                      </FormLabel>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('common:last-name')}
                        height="50px"
                        borderColor="gray.default"
                        borderRadius="3px"
                      />
                      <FormErrorMessage>{form.errors.last_name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </Box>

              <Field name="phone">
                {({ field, form }) => (
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
                      {...field}
                      type="tel"
                      placeholder="+123 4567 8900"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="email">
                {({ field, form }) => (
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
                      {...field}
                      type="email"
                      placeholder="jhon.doe@gmail.com"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              {/* <FormControl>
                <FormLabel margin="0px" color="gray.default" fontSize="sm" float="left">
                  Date of Birth
                </FormLabel>
                <Input
                  type="date"
                  placeholder="29 / 10 / 1990"
                  height="50px"
                  borderColor="gray.default"
                  borderRadius="3px"
                />
              </FormControl> */}

              {/* <Field name="password">
                {({ field, form }) => (
                  <FormControl isInvalid={form.errors.password && form.touched.password}>
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="password"
                    >
                      Password
                    </FormLabel>
                    <Input
                      {...field}
                      type={showPSW ? 'text' : 'password'}
                      placeholder="***********"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <InputRightElement width="2.5rem" top="33.5px" right="10px">
                      <Button
                        background="transparent"
                        width="100%"
                        height="100%"
                        padding="0"
                        onClick={toggleShowPSW}
                        _hover={{
                          background: 'transparent',
                        }}
                        _active={{
                          background: 'transparent',
                        }}
                      >
                        {showPSW ? (
                          <Icon icon="eyeOpen" color="#A4A4A4" width="24px" height="24px" />
                        ) : (
                          <Icon icon="eyeClosed" color="#A4A4A4" width="24px" height="24px" />
                        )}
                      </Button>
                    </InputRightElement>
                    <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="passwordConfirmation">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.passwordConfirmation && form.touched.passwordConfirmation}
                  >
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      htmlFor="repeatPassword"
                    >
                      Repeat Password
                    </FormLabel>
                    <Input
                      {...field}
                      type={showRepeatPSW ? 'text' : 'password'}
                      placeholder="***********"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <InputRightElement width="2.5rem" top="33.5px" right="10px">
                      <Button
                        background="transparent"
                        width="100%"
                        height="100%"
                        padding="0"
                        onClick={toggleShowRepeatPSW}
                        _hover={{
                          background: 'transparent',
                        }}
                        _active={{
                          background: 'transparent',
                        }}
                      >
                        {showRepeatPSW ? (
                          <Icon icon="eyeOpen" color="#A4A4A4" width="24px" height="24px" />
                        ) : (
                          <Icon icon="eyeClosed" color="#A4A4A4" width="24px" height="24px" />
                        )}
                      </Button>
                    </InputRightElement>
                    <FormErrorMessage>{form.errors.passwordConfirmation}</FormErrorMessage>
                  </FormControl>
                )}
              </Field> */}

              <Button
                variant="default"
                fontSize="l"
                isLoading={isSubmitting}
                type="submit"
              >
                {t('register')}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  );
}

export default Register;
