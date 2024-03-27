import { useState, useEffect } from 'react';
import {
  Text,
  Image,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  useToast,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import NextChakraLink from '../common/components/NextChakraLink';
import bc from '../common/services/breathecode';

function AcceptInvite() {
  const { t } = useTranslation('login');
  const [isChecked, setIsChecked] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { query } = router;
  const { token } = query;

  const getInvite = async () => {
    try {
      const resp = await bc.auth().invites().getInvite(token);
      const invitesData = resp?.data;

      console.log(invitesData);

      // const inviteMTW = invitesData.find(
      //   (invite) => invite.academy.slug === 'miami-tech-works',
      // );

      // const result = await bc.auth().invites().accept(inviteMTW.academy.id, values);
      // console.log(result);

      // console.log(resp);
      // toast({
      //   title: 'Successfully accepted!',
      //   status: 'success',
      //   duration: 9000,
      //   isClosable: true,
      // });
      // router.push('/login');
    } catch (e) {
      console.log(e);
      toast({
        title: e,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    getInvite();
  }, []);

  const putInvite = (values) => {
    try {
      console.log(values);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Flex
      alignItems="center"
      flexDirection="column"
      width={['90%', '90%', '50%']}
      m={['40px 20px', '40px 20px', '40px auto']}
      maxWidth="1366px"
    >
      <Image
        width={180}
        objectFit="cover"
        src="/static/images/miamitech-logo.png"
        alt="Miami Tech"
      />
      <Text margin="30px" textAlign="center">
        {t(
          // `You have been invited to ${invite.academy.name}506Tek Academy, please fill out the following form to accept the invite`
          'You have been invited to 506Tek Academy, please fill out the following form to accept the invite',
        )}
      </Text>

      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          password: '',
          passwordConfirmation: '',
        }}
        onSubmit={putInvite}
      >
        {({ isSubmitting }) => (
          <Form>
            <Flex mt="20px">
              <Field name="first_name">
                {({ field, form }) => (
                  <FormControl
                    m="0 20px 0 0"
                    //isRequired
                    isInvalid={
                      form.errors.first_name && form.touched.first_name
                    }
                  >
                    <FormLabel color="gray.500" fontSize="14px">
                      {t('common:first-name')}
                    </FormLabel>
                    <Input
                      borderRadius="2px"
                      type="text"
                      {...field}
                      placeholder={t('common:first-name')}
                    />
                  </FormControl>
                )}
              </Field>
              <Field name="last_name">
                {({ field, form }) => (
                  <FormControl
                    //isRequired
                    isInvalid={form.errors.last_name && form.touched.last_name}
                  >
                    <FormLabel color="gray.500" fontSize="14px">
                      {t('common:last-name')}
                    </FormLabel>
                    <Input
                      borderRadius="2px"
                      type="text"
                      {...field}
                      placeholder={t('common:last-name')}
                    />
                  </FormControl>
                )}
              </Field>
            </Flex>
            <Flex mt="20px">
              <Field name="phone">
                {({ field, form }) => (
                  <FormControl
                    //isRequired
                    isInvalid={form.errors.phone && form.touched.phone}
                  >
                    <FormLabel color="gray.500" fontSize="14px">
                      {t('common:phone')}
                    </FormLabel>
                    <Input
                      borderRadius="2px"
                      type="tel"
                      {...field}
                      placeholder="+123 4567 8900"
                    />
                    <Text fontSize="12px" color="blue.default">
                      {t('signup:phone-info')}
                    </Text>
                  </FormControl>
                )}
              </Field>
            </Flex>
            <Flex mt="20px">
              <Field name="email">
                {({ field, form }) => (
                  <FormControl
                    //isRequired
                    isInvalid={form.errors.email && form.touched.email}
                  >
                    <FormLabel color="gray.500" fontSize="14px" htmlFor="email">
                      {t('common:email')}
                    </FormLabel>
                    <Input
                      borderRadius="2px"
                      type="email"
                      {...field}
                      placeholder="jhon.doe@gmail.com"
                    />
                  </FormControl>
                )}
              </Field>
            </Flex>
            <Flex mt="20px">
              <Field name="password">
                {({ field, form }) => (
                  <FormControl
                    //isRequired
                    isInvalid={form.errors.password && form.touched.password}
                  >
                    <FormLabel
                      color="gray.500"
                      fontSize="14px"
                      htmlFor="password"
                    >
                      {t('Choose your password')}
                    </FormLabel>
                    <Input
                      borderRadius="2px"
                      type="password"
                      {...field}
                      placeholder="***********"
                    />
                  </FormControl>
                )}
              </Field>
            </Flex>
            <Flex>
              <Field name="passwordConfirmation">
                {({ field, form }) => (
                  <FormControl
                    //isRequired
                    isInvalid={
                      form.errors.passwordConfirmation
                      && form.touched.passwordConfirmation
                    }
                  >
                    <FormLabel
                      color="gray.500"
                      fontSize="14px"
                      htmlFor="password"
                    >
                      {t('Repeat your password')}
                    </FormLabel>
                    <Input
                      borderRadius="2px"
                      type="password"
                      {...field}
                      placeholder="***********"
                    />
                  </FormControl>
                )}
              </Field>
            </Flex>

            <Flex mt="20px">
              <Checkbox
                me="5px"
                size="md"
                spacing="8px"
                //{...field}
                // colorScheme="green"
                isChecked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              <Text fontSize="10px">
                {t('signup:validators.termns-and-conditions-required')}
                {' '}
                <NextChakraLink
                  variant="default"
                  fontSize="10px"
                  href="/privacy-policy"
                  target="_blank"
                >
                  {t('common:privacy-policy')}
                </NextChakraLink>
              </Text>
            </Flex>

            <Button
              mt="20px"
              width="100%"
              isLoading={isSubmitting}
              type="submit"
              // isDisabled={isChecked === false}
            >
              {t('Accept & Start Learning')}
            </Button>
          </Form>
        )}
      </Formik>
    </Flex>
  );
}

export default AcceptInvite;
