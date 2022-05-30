import useTranslation from 'next-translate/useTranslation';
import {
  Image,
  Box,
  Grid,
  FormControl,
  Input,
  Button,
  Link,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';
import validationSchema from '../common/components/Forms/validationSchemas';
import bc from '../common/services/breathecode';

export default function Home() {
  const toast = useToast();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [, setCookie] = useCookies(['subscriptionId']);
  const { t } = useTranslation('home');

  const { colorMode } = useColorMode();
  const commonColor = useColorModeValue('gray.600', 'gray.300');
  const socials = t('social:content', {}, { returnObjects: true });
  const socialsFiltered = socials.filter((social) => social.available.includes('home'));

  const BubblesSvg = () => (
    <svg
      width="785"
      height="586"
      viewBox="0 0 785 586"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="700" y="148" width="65" height="65" rx="17" fill="#FFB718" />
      <rect x="750" y="189" width="35" height="35" rx="17" fill="#0097CD" />
      <rect x="332" width="19" height="19" rx="9.5" fill="#CD0000" />
      <rect x="649" y="450" width="36" height="36" rx="17" fill="#FFB718" />
      <rect y="244" width="36" height="36" rx="17" fill="#E6E6E6" style={{ opacity: 0.7 }} />
    </svg>
  );

  return (
    <Box
      margin="4vw 0 12vw 0"
      height={{ base: '100%', md: '100%' }}
      // minHeight="90vh"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Grid gridTemplateColumns={{ base: 'repeat(1,1fr)', md: 'repeat(2,1fr)' }} height="100%">
        <Box position="absolute" top="25" right="0" zIndex="-1" opacity={{ base: '0.6', md: '1' }}>
          <BubblesSvg />
        </Box>
        <Box flex="1" margin={{ base: '14% 8% 0 8%', md: '14% 14% 0 14%' }}>
          <Heading
            as="h1"
            size="14px"
            fontWeight="700"
            color={commonColor}
            textTransform="uppercase"
          >
            {t('title')}
          </Heading>
          <Heading as="h2" size="xxl" style={{ wordWrap: 'normal' }}>
            {t('welcome')}
            <Icon icon="logoModern" width="15rem" height="auto" />
          </Heading>
          <Box
            pt="2.25rem"
            size="36px"
            display="flex"
            gridGap="10px"
            color={commonColor}
          >
            <Text
              size="36px"
              fontWeight="bold"
              color={commonColor}
            >
              Join
            </Text>
            <Text
              size="36px"
              fontWeight="bold"
              color={useColorModeValue('black', 'white')}
            >
              2454
            </Text>
          </Box>
          <Text size="sm" color={commonColor}>
            {t('description')}
          </Text>

          {/* --------- Email Form (📧) --------- */}
          <Box
            mt="1.375rem"
            mb="3.125rem"
            p="12px"
            borderRadius="3px"
            backgroundColor={useColorModeValue('blue.50', 'gray.800')}
            transition="all .2s ease"
          >
            <Formik
              initialValues={{
                email: '',
              }}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={(values, actions) => {
                bc.auth().subscribe(values).then(({ data }) => {
                  setCookie('subscriptionId', data.id, { path: '/' });
                  toast({
                    title: t('alert-message:added-to-waiting-list'),
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                  });
                  router.push('/thank-you');
                }).catch(() => {
                  toast({
                    title: t('alert-message:email-already-subscribed'),
                    status: 'warning',
                    duration: 6000,
                    isClosable: true,
                  });
                  actions.setSubmitting(false);
                });
              }}
              validationSchema={validationSchema.subscribe}
            >
              {(props) => {
                const { isSubmitting } = props;
                return (
                  <Form>
                    <Box
                      py="0"
                      flexDirection={{ base: 'column', md: 'row' }}
                      display="flex"
                      alignItems="center"
                    >
                      <Field id="field923" name="email">
                        {({ field, form }) => {
                          if (form.errors.email) {
                            setErrorMessage(form.errors.email);
                          }
                          return (
                            <FormControl isInvalid={form.errors.email}>
                              <Input
                                {...field}
                                id="email"
                                placeholder="Email"
                                style={{
                                  borderRadius: '3px',
                                  borderTopRightRadius: '0',
                                  borderBottomRightRadius: '0',
                                  backgroundColor: colorMode === 'light' ? '#FFFFFF' : '#17202A',
                                }}
                              />
                            </FormControl>
                          );
                        }}
                      </Field>
                      <Button
                        margin="0"
                        borderRadius="3px"
                        borderTopLeftRadius={{ base: '0', md: '0' }}
                        borderTopRightRadius={{ base: '0', md: '3px' }}
                        borderBottomLeftRadius={{ base: '3px', md: '0' }}
                        width="100%"
                        padding="0"
                        whiteSpace="normal"
                        colorScheme="teal"
                        isLoading={isSubmitting}
                        type="submit"
                        variant="default"
                      >
                        {t('sendButton')}
                      </Button>
                    </Box>
                    {errorMessage && (<Text pt="5px" color="red.500" fontSize="sm" marginTop={0}>{errorMessage}</Text>)}
                  </Form>
                );
              }}
            </Formik>
          </Box>
          <Box display="flex" alignItems="center" gridGap="14px">
            <Text size="md">{t('followUs')}</Text>
            {socialsFiltered.map((social) => (
              <Link key={social.name} href={social.link} target="_blank" rel="noopener noreferrer">
                <Icon icon={social.icon} width="15px" height="15px" color="black" />
              </Link>
            ))}
          </Box>
        </Box>

        {/* --------- Image of people smiling --------- */}
        <Box
          flex="1"
          display={{ base: 'none', md: 'flex' }}
          flexDirection="row"
          justifyContent="center"
          gridGap="10px"
          pt="6%"
        >
          <Box display="flex" width="auto" flexDirection="column" gridGap="10px">
            <Image src="/static/images/person-smile1.png" />
            <Image src="/static/images/person-smile3.png" borderRadius="15px" />
          </Box>
          <Box display="flex" width="auto" flexDirection="column" gridGap="10px">
            <Image src="/static/images/person-smile2.png" />
            <Image src="/static/images/person-smile4.png" />
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}

Home.propTypes = {
  isSubmitting: PropTypes.bool,
};

Home.defaultProps = {
  isSubmitting: false,
};
