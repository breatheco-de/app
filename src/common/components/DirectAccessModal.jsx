import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Text, useToast } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState } from 'react';
import useStyle from '../hooks/useStyle';
import useSession from '../hooks/useSession';
import FieldForm from './Forms/FieldForm';
import Heading from './Heading';
import modifyEnv from '../../../modifyEnv';
import { setStorageItem, toCapitalize } from '../../utils';
import { log } from '../../utils/logging';

function DirectAccessModal({ title, modalIsOpen }) {
  const { t } = useTranslation('profile');
  const { userSession } = useSession();
  const {
    modal,
  } = useStyle();
  const router = useRouter();
  const locale = router?.locale;
  // const technology = router?.query?.technology || 'Python';
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const toast = useToast();

  const [formProps, setFormProps] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const signupValidation = Yup.object().shape({
    first_name: Yup.string()
      .min(2, t('common:validators.short-input'))
      .max(50, t('common:validators.long-input'))
      .required(t('common:validators.first-name-required')),
    last_name: Yup.string()
      .min(2, t('common:validators.short-input'))
      .max(50, t('common:validators.long-input'))
      .required(t('common:validators.last-name-required')),
    email: Yup.string()
      .email(t('common:validators.invalid-email'))
      .required(t('common:validators.email-required')),
  });

  const handleSubmit = async (actions, allValues) => {
    const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...allValues,
        conversion_info: userSession,
      }),
    });

    const data = await resp.json();
    if (resp.status < 400) {
      setStorageItem('subscriptionId', data.id);
      router.push('/thank-you');
    }
    if (resp.status >= 400) {
      toast({
        position: 'top',
        title: t('alert-message:email-already-subscribed'),
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
    }
    actions.setSubmitting(false);
  };

  return (
    <Modal isOpen={modalIsOpen} size="xl" onClose={() => log('clicked to close')}>
      <ModalOverlay />
      <ModalContent background={modal.background} margin="9rem 10px 0 10px">
        <ModalCloseButton />
        <ModalBody padding={{ base: '26px 18px', md: '42px 36px' }}>
          {title && (
            <Heading as="p" size="sm" fontWeight="700" letterSpacing="0.05em" textAlign="center" padding="0 0 14px 0">
              {title}
            </Heading>
          )}
          <Text fontSize="14px" px={{ base: '10px', md: '2rem' }} mt="10px" mb="2rem" textAlign="center">
            {t('common:modal-tech-description', { title: toCapitalize(title) })}
          </Text>
          <Formik
            initialValues={{
              first_name: '',
              last_name: '',
              email: '',
            }}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={(values, actions) => {
              const allValues = {
                ...values,
                // country: location?.country,
                // city: location?.city,
                language: locale,
              };

              handleSubmit(actions, allValues);
            }}
            validationSchema={signupValidation}
          >
            {({ isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gridGap="26px">
                  <FieldForm
                    type="text"
                    name="first_name"
                    label={t('common:first-name')}
                    formProps={formProps}
                    setFormProps={setFormProps}
                  />
                  <FieldForm
                    type="email"
                    name="email"
                    label={t('common:email')}
                    formProps={formProps}
                    setFormProps={setFormProps}
                  />
                  <Button
                    variant="default"
                    isLoading={isSubmitting}
                    onClick={() => {
                      log('test');
                    }}
                    textTransform="uppercase"
                    fontSize="13px"
                  >
                    {t('common:submit')}
                  </Button>
                  {/* <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} gridGap="12px" justifyContent="space-around">
                  </Box> */}
                </Box>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

DirectAccessModal.propTypes = {
  modalIsOpen: PropTypes.bool,
  title: PropTypes.string,
};
DirectAccessModal.defaultProps = {
  modalIsOpen: false,
  title: '',
};

export default DirectAccessModal;
