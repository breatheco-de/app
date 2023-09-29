import {
  Text,
  Image,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
// import { useRouter } from 'next/router';
import NextChakraLink from '../../common/components/NextChakraLink';
import bc from '../../common/services/breathecode';

function AcceptInvite() {
  const { t } = useTranslation('login');
  const [isChecked, setIsChecked] = useState(false);
  //const router = useRouter();
  //const [invite, setInvite] = useState()

  const acceptInvite = (values) => {
    console.log(values);

    // bc.auth().invites().get().then((resp)=>{
    //   const data = resp.data;
    //   setInvite(data)
    // }).catch((err)=>{
    //   console.log(err)
    // });

    bc.admissions().me().then((resp) => {
      console.log(resp.data);
    });

    //console.log(invite)

    // bc.auth().invites().accept(invite.academy.id)
    // .then((resp) => {
    //   const data = resp?.data;
    //   console.log(data)
    // }).catch((err)=>{
    //   console.log(err)
    // })

    //router.push('/login');

    //ACOMODAR LOS FETCHS -> HACERLOS ANIDADOS CON VERIFICACIONES
  };

  return (
    <Flex
      alignItems="center"
      flexDirection="column"
      width="50%"
      margin="auto"
      mt="40px"
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
        onSubmit={acceptInvite}
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
              <Field name="email">
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
              color="white"
              bg="blue.default"
              width="100%"
              // variant="default"
              // fontSize="l"
              isLoading={isSubmitting}
              type="submit"
              isDisabled={isChecked === false}
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
