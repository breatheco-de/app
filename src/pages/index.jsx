import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Image, Box, Grid, FormControl, Input, Button, useColorMode,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';

const regex = {
  email:
    /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@(?!mailinator|leonvero|ichkoch|naymeo|naymio)[a-zA-Z0-9]*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
};

export default function Home() {
  const { t } = useTranslation(['home']);
  const { colorMode } = useColorMode();
  const [errorMessage, setErrorMessage] = useState('');

  const validator = (value) => {
    let error;
    if (!value) {
      error = 'Email is required';
    } else if (!regex.email.test(value)) {
      error = 'Invalid email address';
    }
    setErrorMessage(error);
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
      <rect x="700" y="158" width="65" height="65" rx="17" fill="#FFB718" />
      <rect x="750" y="199" width="35" height="35" rx="17" fill="#0097CD" />
      <rect x="332" width="19" height="19" rx="9.5" fill="#CD0000" />
      <rect x="649" y="550" width="36" height="36" rx="17" fill="#FFB718" />
      <rect y="244" width="36" height="36" rx="17" fill="#E6E6E6" />
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
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content="Learn with Breatheco.de" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Grid gridTemplateColumns={{ base: 'repeat(1,1fr)', md: 'repeat(2,1fr)' }} height="100%">
        <Box position="absolute" top="95" right="0" zIndex="-1">
          <BubblesSvg />
        </Box>
        <Box flex="1" margin="14% 14% 0 14%">
          <Heading as="h1" size="14px" fontWeight="700" color="gray.600" textTransform="uppercase">
            {t('title')}
          </Heading>
          <Heading as="h2" size="70px">
            {t('welcome')}
          </Heading>
          <Text size="12px" color="gray.600">
            {t('description')}
          </Text>
          <Box
            my="50px"
            p="12px"
            borderRadius="3px"
            backgroundColor={colorMode === 'light' ? 'blue.50' : 'gray.800'}
          >
            {/* --------- Email Form (📧) --------- */}
            <Formik
              initialValues={{ email: '' }}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  alert(JSON.stringify(values, null, 2));
                  actions.setSubmitting(false);
                }, 1000);
              }}
            >
              {(props) => {
                const { isSubmitting } = props;
                return (
                  <Form>
                    <Box color="danger">{errorMessage}</Box>
                    <Box py="0" flexDirection="row" display="flex" alignItems="center">
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
                          </FormControl>
                        )}
                      </Field>
                      <Button
                        margin="0"
                        borderRadius="3px"
                        borderTopLeftRadius="0"
                        borderBottomLeftRadius="0"
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
          <Text size="md" display="flex" alignItems="center" gridGap="14px">
            {t('followUs')}
            <Icon icon="youtube" width="15px" height="15px" color="black" />
            <Icon icon="github" width="15px" height="15px" />
          </Text>
        </Box>

        {/* --------- Image of people smiling --------- */}
        <Box
          flex="1"
          display="flex"
          flexDirection="row"
          justifyContent="center"
          gridGap="10px"
          pt="6%"
        >
          <Box display="flex" width="35%" flexDirection="column" gridGap="10px">
            <Image src="/static/images/person-smile1.png" />
            <Image src="/static/images/person-smile3.png" borderRadius="15px" />
          </Box>
          <Box display="flex" width="35%" flexDirection="column" gridGap="10px">
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
