// import { useState, useEffect } from 'react';
// import {
//   Box,
//   Image,
//   Flex,
//   Button,
//   FormControl,
//   FormLabel,
//   Input,
//   Checkbox,
//   useToast,
//   FormErrorMessage,
//   Link
// } from '@chakra-ui/react';
// import { Skeleton, SkeletonText } from '@chakra-ui/react';
// import { CardSkeleton } from '../common/components/Skeleton';
// import { Form, Formik, Field } from 'formik';
// import { useRouter } from 'next/router';
// import useTranslation from 'next-translate/useTranslation';
// import useAuth from '../common/hooks/useAuth';
// import validationSchema from '../common/components/Forms/validationSchemas';
// import NextChakraLink from '../common/components/NextChakraLink';
// // import LoaderScreen from '../common/components/LoaderScreen';
// import Text from '../common/components/Text';
// import Heading from '../common/components/Heading';
// import modifyEnv from '../../modifyEnv';

function AcceptInvite() {
  // const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  // const toast = useToast();
  // const router = useRouter();
  // const { t, lang } = useTranslation('accept-invite');
  // const { isAuthenticated, user } = useAuth();
  // const { query } = router;
  // const { inviteToken } = query;
  // const [noInviteToken, setNoInviteToken] = useState(false)
  // const [incorrectUser, setIncorrectUser] = useState(false)
  // const [isChecked, setIsChecked] = useState(false);
  // const [invite, setInvite] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [htmlResponse, setHtmlResponse] = useState(false)

  // console.log(user)

  // const getInvite = async () => {
  //   if (!inviteToken) {
  //     setNoInviteToken(true)
  //     setIsLoading(false)
  //     return
  //   }
  //   try {
  //     const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/member/invite/${inviteToken}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     const contentType = resp.headers.get('Content-Type');
  //     if (contentType && contentType.includes('application/json')) {
  //       const data = await resp.json();
  //       setInvite(data);
  //     } else if (contentType && contentType.includes('text/html')) {
  //       const htmlData = await resp.text();
  //       setHtmlResponse(true)
  //       document.getElementById('htmlOutput').innerHTML = htmlData;
  //     }

  //     setIsLoading(false)
  //   } catch (e) {
  //     console.log(e)
  //     setIsLoading(false)
  //   }
  // };

  // useEffect(() => {
  //   getInvite();
  // }, []);

  // useEffect(() => {
  //   if (user?.email !== invite?.email) return
  //   if (user) setIncorrectUser(true)
  // }, [invite])

  // const putInvite = async (values, actions) => {
  //   console.log("loas valores",values)
  //   try {
  //     const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/member/invite/${inviteToken}`, {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         ...values,
  //         repeat_password: values.passwordConfirmation,
  //       }),
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept-Language': lang,
  //       },
  //     });

  //     const result = await resp.json();

  //     if (resp.status >= 400) {
  //       toast({
  //         title: result.detail,
  //         status: 'error',
  //         duration: 9000,
  //         isClosable: true,
  //       });
  //     } else if (resp.status >= 200 && resp.status <= 299) {
  //       toast({
  //         title: 'Successfully accepted!',
  //         status: 'success',
  //         duration: 9000,
  //         isClosable: true,
  //       });
  //       router.push('/login');
  //     }
  //     actions.setSubmitting(false);
  //   } catch (e) {
  //     console.log(e);
  //     toast({
  //       title: e?.message || t('error'),
  //       status: 'error',
  //       duration: 9000,
  //       isClosable: true,
  //     });
  //     actions.setSubmitting(false);
  //   }
  // };

  // if (isLoading) {
  //   return (
  //     <Box
  //       display="flex"
  //       justifyContent="center"
  //       mt="2rem"
  //       mb="5rem"
  //       position="relative"
  //     >
  //       <LoaderScreen width="80px" height="80px" />
  //     </Box>
  //   );
  // }

  return (
    <>
      {/* {htmlResponse &&
        <Box id='htmlOutput'></Box>
      }
      {noInviteToken &&
        <>
          {!isLoading ?
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt="2rem" mb="5rem" position="relative" gap="1rem" height="75vh">
              <Heading fontWeight="500">
                {t('no-token')}
              </Heading>
              <Link href={isAuthenticated ? '/choose-program' : '/'} variant="buttonDefault">
                {t('signup:consumables.back-to-dashboard')}
              </Link>
            </Box>
            :
            <CardSkeleton quantity={2} />
          }
        </>
      }
      {invite && !noInviteToken && !htmlResponse &&
        <Flex
          alignItems="center"
          flexDirection="column"
          width={['90%', '90%', '50%']}
          m={['40px 20px', '40px 20px', '40px auto']}
          maxWidth="1366px"
        >
          {!isLoading ?
            <>
              <Image
                width={180}
                objectFit="cover"
                src={invite?.academy.logo_url}
                alt={invite?.academy.name}
              />
              <Text size="lg" margin="30px" textAlign="center">
                {incorrectUser ?
                  <>
                    {t('belongs-to-other-user')}
                    {' '}
                    <Link href='/choose-program' variant="default">{t('signup:consumables.back-to-dashboard')}</Link>
                  </>
                  :
                  t('heading', { name: invite?.academy.name })}
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
                      <Field name="first_name">
                        {({ field, form }) => (
                          <FormControl
                            m="0 20px 0 0"
                            // isRequired
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
                            <FormErrorMessage>{form.errors.first_name}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="last_name">
                        {({ field, form }) => (
                          <FormControl
                            // isRequired
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
                            <FormErrorMessage>{form.errors.last_name}</FormErrorMessage>
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
                            <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
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
                            // isRequired
                            isInvalid={form.errors.email && form.touched.email}
                          >
                            <FormLabel color="gray.500" fontSize="14px" htmlFor="email">
                              {t('common:email')}
                            </FormLabel>
                            <Input
                              readOnly
                              borderRadius="2px"
                              type="email"
                              {...field}
                              placeholder="jhon.doe@gmail.com"
                            />
                            <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Flex>
                    <Flex mt="20px">
                      <Field name="password">
                        {({ field, form }) => (
                          <FormControl
                            // isRequired
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
                            <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Flex>
                    <Flex>
                      <Field name="passwordConfirmation">
                        {({ field, form }) => (
                          <FormControl
                            // isRequired
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
                            <FormErrorMessage>{form.errors.passwordConfirmation}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Flex>

                    <Flex mt="20px">
                      <Checkbox
                        me="5px"
                        size="md"
                        spacing="8px"
                        isChecked={isChecked}
                        onChange={() => setIsChecked(!isChecked)}
                      />
                      <Text fontSize="10px">
                        {t('signup:validators.receive-information')}
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

                    {!incorrectUser &&
                      <Button
                        mt="20px"
                        variant="default"
                        width="100%"
                        isLoading={isSubmitting}
                        type="submit"
                        isDisabled={!isChecked}
                      >
                        {t('accept-and-learn')}
                      </Button>
                    }
                  </Form>
                )}
              </Formik>
            </>
            :
            <>
              <Skeleton borderRadius="10" width="150px" height="150px" mb="50px" />
              <Skeleton width="700px" height="30px" mb="50px" />
              <Flex gap="30px" mb="25px">
                <Box>
                  <SkeletonText noOfLines={1} width={200} mb={4} />
                  <Skeleton width="400px" height="30px" />
                </Box>
                <Box>
                  <SkeletonText noOfLines={1} width={200} mb={4} />
                  <Skeleton width="400px" height="30px" />
                </Box>
              </Flex>
              <Box mb="40px">
                <SkeletonText noOfLines={1} width={200} mb={4} />
                <CardSkeleton withoutContainer width="830px" quantity={1} height={"30px"} borderRadius={5} />
              </Box>
              <Box mb="40px">
                <SkeletonText noOfLines={1} width={250} mb={4} />
                <CardSkeleton withoutContainer width="830px" quantity={1} height={"30px"} borderRadius={5} />
              </Box>
              <Box mb="40px">
                <SkeletonText noOfLines={1} width={250} mb={4} />
                <CardSkeleton withoutContainer width="830px" quantity={1} height={"30px"} borderRadius={5} />
              </Box>
              <Box mb="40px">
                <SkeletonText noOfLines={1} width={250} mb={4} />
                <CardSkeleton withoutContainer width="830px" quantity={1} height={"30px"} borderRadius={5} />
              </Box>
            </>
          }
        </Flex>
      } */}
    </>
  );
}

export default AcceptInvite;
