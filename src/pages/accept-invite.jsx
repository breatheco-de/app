import { useState, useEffect } from 'react';
import { Box, Image, Flex, Button, FormControl, FormLabel, Input, Checkbox, useToast, FormErrorMessage } from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useAuth from '../common/hooks/useAuth';
import LoaderScreen from '../common/components/LoaderScreen';
import validationSchema from '../common/components/Forms/validationSchemas';
import NextChakraLink from '../common/components/NextChakraLink';
import Text from '../common/components/Text';
import Heading from '../common/components/Heading';
import modifyEnv from '../../modifyEnv';

function FormField({ name, label, type = 'text', isReadOnly = false, placeholder }) {
  return (
    <Field name={name}>
      {({ field, form }) => (
        <FormControl isInvalid={form.errors[name] && form.touched[name]}>
          <FormLabel color="gray.500" fontSize="14px" htmlFor={name}>
            {label}
          </FormLabel>
          <Input
            borderRadius="2px"
            type={type}
            {...field}
            placeholder={placeholder}
            readOnly={isReadOnly}
          />
          <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
        </FormControl>
      )}
    </Field>
  );
}

function AcceptInvite() {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const toast = useToast();
  const router = useRouter();
  const { t, lang } = useTranslation('accept-invite');
  const { isAuthenticated, user } = useAuth();
  const { query } = router;
  const { inviteToken } = query;
  const [incorrectUser, setIncorrectUser] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [invite, setInvite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);

  const getInvite = async () => {
    if (!inviteToken) return;
    try {
      const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/member/invite/${inviteToken}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await resp.json();

      if (data.status_code > 300) throw new Error(data.detail);
      setInvite(data);

      setIsLoading(false);
    } catch (e) {
      setIsAccepted(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getInvite();
  }, []);

  useEffect(() => {
    if (!user || !invite) return;
    if (user?.email !== invite?.email) setIncorrectUser(true);
  }, [invite, user]);

  const putInvite = async (values, actions) => {
    try {
      const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/member/invite/${inviteToken}`, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          repeat_password: values.passwordConfirmation,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang,
        },
      });

      const result = await resp.json();

      if (resp.status >= 400) {
        toast({
          title: result.detail,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      } else if (resp.status >= 200 && resp.status <= 299) {
        toast({
          title: 'Successfully accepted!',
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
        router.push('/login');
      }
      actions.setSubmitting(false);
    } catch (e) {
      console.log(e);
      toast({
        title: e?.message || t('error'),
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      actions.setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        mt="2rem"
        mb="5rem"
        position="relative"
      >
        <LoaderScreen width="80px" height="80px" />
      </Box>
    );
  }

  //__________________LOGS________________________
  // console.log("soy el user",user)
  // console.log("HOLA", incorrectUser)

  return (
    <>
      {!inviteToken
        && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt="2rem" mb="5rem" position="relative" gap="1rem" height="75vh">
            <Heading fontWeight="500">
              {t('no-token')}
            </Heading>
            <NextChakraLink href={isAuthenticated ? '/choose-program' : '/'} variant="buttonDefault">
              {t('signup:consumables.back-to-dashboard')}
            </NextChakraLink>
          </Box>
        )}
      {isAccepted
        && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt="2rem" mb="5rem" position="relative" gap="1rem" height="75vh">
            <Heading fontWeight="500">
              {t('already-accepted')}
            </Heading>
            <NextChakraLink href={isAuthenticated ? '/choose-program' : '/'} variant="buttonDefault">
              {t('signup:consumables.back-to-dashboard')}
            </NextChakraLink>
          </Box>
        )}
      {invite && inviteToken && user && !isAccepted
        && (
          <Flex alignItems="center" flexDirection="column" width={['90%', '90%', '50%']} m={['40px 20px', '40px 20px', '40px auto']} maxWidth="1366px">
            <Image width={180} objectFit="cover" src={invite?.academy.logo_url} alt={invite?.academy.name} />
            <Text size="lg" margin="30px" textAlign="center">
              {
                incorrectUser
                  ? (
                    <Box as="span">
                      {t('belongs-to-other-user')}
                      {' '}
                      <NextChakraLink href="/choose-program" variant="default">{t('signup:consumables.back-to-dashboard')}</NextChakraLink>
                    </Box>
                  )
                  : (
                    <Box as="span">{t('heading', { name: invite?.academy.name })}</Box>
                  )
              }
            </Text>
            <Formik
              initialValues={{
                first_name: invite?.first_name,
                last_name: invite?.last_name,
                email: invite?.email,
                phone: '',
                password: '',
                passwordConfirmation: '',
              }}
              onSubmit={putInvite}
              validationSchema={validationSchema.invite}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Flex mt="20px">
                    <FormField name="first_name" label={t('common:first-name')} placeholder={t('common:first-name')} />
                    <Box ml="20px">
                      <FormField name="last_name" label={t('common:last-name')} placeholder={t('common:last-name')} />
                    </Box>
                  </Flex>

                  <Flex mt="20px">
                    <FormField name="phone" label={t('common:phone')} type="tel" placeholder="+123 4567 8900" />
                    <Text fontSize="12px" color="blue.default" mt="2">
                      {t('signup:phone-info')}
                    </Text>
                  </Flex>

                  <Flex mt="20px">
                    <FormField name="email" label={t('common:email')} type="email" isReadOnly placeholder="jhon.doe@gmail.com" />
                  </Flex>

                  <Flex mt="20px">
                    <FormField name="password" label={t('Choose your password')} type="password" placeholder="***********" />
                  </Flex>

                  <Flex mt="20px">
                    <FormField
                      name="passwordConfirmation"
                      label={t('Repeat your password')}
                      type="password"
                      placeholder="***********"
                    />
                  </Flex>

                  <Flex mt="20px" align="center">
                    <Checkbox me="5px" size="md" spacing="8px" isChecked={isChecked} onChange={() => setIsChecked(!isChecked)} />
                    <Flex fontSize="10px" gap="10px">
                      <Text>
                        {' '}
                        {t('signup:validators.receive-information')}
                        {' '}
                      </Text>
                      <NextChakraLink variant="default" fontSize="10px" href="/privacy-policy" target="_blank">{t('common:privacy-policy')}</NextChakraLink>
                    </Flex>
                  </Flex>
                  {!incorrectUser && (
                    <Button mt="20px" variant="default" width="100%" isLoading={isSubmitting} type="submit" isDisabled={!isChecked}>
                      {t('accept-and-learn')}
                    </Button>
                  )}
                </Form>
              )}
            </Formik>
          </Flex>
        )}
    </>
  );
}

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  isReadOnly: PropTypes.bool,
  placeholder: PropTypes.string,
};

FormField.defaultProps = {
  type: 'text',
  isReadOnly: false,
  placeholder: '',
};

export default AcceptInvite;
