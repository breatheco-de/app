import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Image,
  Box,
  Grid,
  FormControl,
  Input,
  Button,
  useColorMode,
  useColorModeValue,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { useRouter } from 'next/router';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';
import { email } from '../utils/regex';
import bc from '../common/services/breathecode';

export default function Home() {
  const toast = useToast();
  const router = useRouter();
  const { t } = useTranslation(['home']);
  const { colorMode } = useColorMode();
  const commonColor = useColorModeValue('gray.600', 'gray.300');

  const validator = (value) => {
    let error;
    if (!value) {
      error = 'Email is required';
    } else if (!email.test(value)) {
      error = 'Invalid email address';
    }
    return error;
  };

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
      className="s"
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
          <Heading as="h2" size={{ base: '50px', md: '70px' }} style={{ wordWrap: 'normal' }}>
            {t('welcome')}
          </Heading>
          <Box
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
            mb="50px"
            p="12px"
            borderRadius="3px"
            backgroundColor={useColorModeValue('blue.50', 'gray.800')}
            transition="all .2s ease"
          >
            <Formik
              initialValues={{
                email: '',
              }}
              onSubmit={(values, actions) => {
                bc.auth().subscribe(values).then(() => {
                  toast({
                    title: 'Your email has been added to our list!',
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                  });
                  router.push('/thank-you');
                }).catch(() => {
                  toast({
                    title: 'Your email is already subscribed!',
                    status: 'warning',
                    duration: 6000,
                    isClosable: true,
                  });
                  actions.setSubmitting(false);
                });

                // setTimeout(() => {
                //   alert(JSON.stringify(values, null, 2));
                //   actions.setSubmitting(false);
                // }, 1000);
              }}
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
                      <Field id="field923" name="email" validate={validator}>
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.email && form.touched.email}>
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
                            <FormErrorMessage position="absolute" marginTop={0}>{form.errors.email}</FormErrorMessage>
                          </FormControl>
                        )}
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
                  </Form>
                );
              }}
            </Formik>
          </Box>
          <Box display="flex" alignItems="center" gridGap="14px">
            <Text size="md">{t('followUs')}</Text>
            <Icon icon="youtube" width="15px" height="15px" color="black" />
            <Icon icon="github" width="15px" height="15px" />
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

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['home', 'navbar', 'footer'])),
  },
});
