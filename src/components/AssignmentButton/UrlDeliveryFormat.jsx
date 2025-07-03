import { useState } from 'react';
import { Box, Text, Button, Checkbox, Input, FormControl, FormErrorMessage, useColorModeValue } from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import MarkDownParser from '../MarkDownParser';

function UrlDeliveryFormat({ currentAssetData, currentTask, sendProject, closePopover, onClickHandler }) {
  const { t } = useTranslation('dashboard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTC, setAcceptTC] = useState(false);
  const [githubUrl, setGithubUrl] = useState(currentTask?.github_url || '');
  const lightColor = useColorModeValue('gray.800', 'gray.350');
  const commonInputActiveColor = useColorModeValue('gray.800', 'gray.350');
  const regexUrlExists = typeof currentAssetData?.delivery_regex_url === 'string';
  const howToSendProjectUrl = 'https://4geeksacademy.notion.site/How-to-deliver-a-project-e1db0a8b1e2e4fbda361fc2f5457c0de';
  const customUrlValidation = Yup.object().shape({
    githubUrl: Yup.string().matches(
      currentAssetData?.delivery_regex_url,
      t('deliverProject.invalid-url', { url: currentAssetData?.delivery_regex_url }),
    ).required(t('deliverProject.url-is-required')),
  });
  const githubUrlValidation = Yup.object().shape({
    githubUrl: Yup.string().matches(
      /https:\/\/github.com\//,
      t('deliverProject.invalid-url', { url: 'https://github.com/' }),
    ).required(t('deliverProject.url-is-required')),
  });
  return (
    <Formik
      initialValues={{ githubUrl: currentTask?.github_url || '' }}
      onSubmit={async () => {
        setIsSubmitting(true);
        if (githubUrl !== '') {
          await sendProject({ task: currentTask, githubUrl, taskStatus: 'DONE' });
          setIsSubmitting(false);
          if (onClickHandler) onClickHandler();
          closePopover();
        }
      }}
      validationSchema={regexUrlExists ? customUrlValidation : githubUrlValidation}
    >
      {() => (
        <Form style={{ display: 'flex', flexDirection: 'column', gridGap: currentAssetData?.delivery_instructions?.length ? '0px' : '14px' }}>
          <Field name="githubUrl">
            {({ field, form }) => {
              setGithubUrl(form.values.githubUrl);
              return (
                <FormControl isInvalid={form.errors.githubUrl && form.touched.githubUrl}>
                  <Input
                    {...field}
                    type="text"
                    id="githubUrl"
                    color={lightColor}
                    _focus={{ color: commonInputActiveColor }}
                    placeholder="https://..."
                  />
                  <FormErrorMessage marginTop="10px">
                    {form.errors.githubUrl}
                  </FormErrorMessage>
                </FormControl>
              );
            }}
          </Field>
          <Box>
            {currentAssetData?.delivery_instructions?.length > 2 ? (
              <Box
                height="100%"
                margin="0 rem auto 0 auto"
                transition="background 0.2s ease-in-out"
                borderRadius="3px"
                maxWidth="1280px"
                background={useColorModeValue('white', 'dark')}
                width={{ base: '100%', md: 'auto' }}
                className={`markdown-body ${useColorModeValue('light', 'dark')}`}
              >
                <MarkDownParser content={currentAssetData?.delivery_instructions} />
              </Box>
            ) : (
              <Box dangerouslySetInnerHTML={{ __html: t('deliverProject.how-to-deliver-text', { link: howToSendProjectUrl }) }} />
            )}
          </Box>
          <Checkbox size="md" isChecked={acceptTC} onChange={() => setAcceptTC((prev) => !prev)}>
            <Text fontSize="sm">{t('deliverProject.deliver-confirm')}</Text>
          </Checkbox>
          <Button
            width="fit-content"
            colorScheme="blue"
            isLoading={isSubmitting}
            type="submit"
            isDisabled={!acceptTC}
          >
            {t('deliverProject.handler-text')}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

UrlDeliveryFormat.propTypes = {
  currentAssetData: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
  currentTask: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
  sendProject: PropTypes.func,
  closePopover: PropTypes.func,
  onClickHandler: PropTypes.func,
};

UrlDeliveryFormat.defaultProps = {
  currentAssetData: {},
  currentTask: {},
  sendProject: () => {},
  closePopover: () => {},
  onClickHandler: () => {},
};

export default UrlDeliveryFormat;
