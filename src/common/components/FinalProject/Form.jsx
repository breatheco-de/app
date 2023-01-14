import { Button, toast } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import * as Yup from 'yup';
import bc from '../../services/breathecode';
import FieldForm from '../Forms/FieldForm';
import AddMember from './AddMember';

const FinalProjectForm = () => {
  const { t } = useTranslation('final-project');
  const [formProps, setFormProps] = useState({
    title: '',
    one_line_description: '',
    description: '',
    github_url: '',
    slides_url: '',
    screenshot: null,
    geeks_members: [],
  });

  const megaByte = 1000000;
  // const ensureNumber = (val) => (Number.isFinite(Number(val)) ? Number(val) : undefined);

  const finalProjectValidation = Yup.object().shape({
    title: Yup.string()
      .required(t('modal-form.project-name-error')),
    one_line_description: Yup.string()
      .max(50, t('common:validators.long-input')),
    description: Yup.string()
      .max(50, t('common:validators.long-input')),
    github_url: Yup.string()
      .url(t('common:validators.invalid-url')),
    slides_url: Yup.string()
      .url(t('common:validators.invalid-url')),
    screenshot: Yup.mixed()
      .test('fileSize', 'The file is too large', (value) => {
        if (value) {
          return value.size <= (megaByte * 2); // 2MB
        }
        return true;
      })
      .test('fileFormat', 'Unsupported Format', (value) => {
        if (value) {
          return ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'].includes(value.type);
        }
        return true;
      }),
    // is not required
    geeks_members: Yup.array()
      .of(Yup.string())
      .min(2, t('common:validators.geeks-members-min', { min: 1 }))
      .max(8, t('common:validators.geeks-members-max', { max: 8 })),
  });

  const handleSubmit = async (actions, allValues) => {
    bc.todo().createFinalProject(allValues)
      .then(() => {
        toast({
          title: 'Success',
          description: 'Your final project has been sended',
          status: 'success',
          duration: 5000,
        });
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Something went wrong submiting your final project',
          status: 'error',
          duration: 5000,
        });
      });

    actions.setSubmitting(false);
  };
  return (
    <Formik
      initialValues={{
        title: '', // required
        one_line_description: '', // max 50 characters, required
        description: '', // max 600 characters, required
        github_url: '',
        slides_url: '', // info: Online slides like Google Sliders, Prezi, etc
        screenshot: null,
        geeks_members: [],
      }}
      onSubmit={(values, actions) => {
        console.log('values:::', values);
        const allValues = {
          ...values,
          // course: courseChoosed,
          // country: location?.country,
          // cohort: dateProps?.id,
          // syllabus,
          // city: location?.city,
          // language: router.locale,
        };

        handleSubmit(actions, allValues);
      }}
      validationSchema={finalProjectValidation}
    >
      {({ isSubmitting }) => (
        <>
          <Form
            style={{
              display: 'flex',
              flexDirection: 'column',
              gridGap: '22px',
            }}
          >
            <FieldForm
              type="text"
              name="title"
              label={t('modal-form.project-name')}
              formProps={formProps}
              setFormProps={setFormProps}
            />

            <FieldForm
              type="text"
              name="one_line_description"
              label={t('modal-form.one-line-description')}
              formProps={formProps}
              setFormProps={setFormProps}
            />

            <FieldForm
              type="textarea"
              name="description"
              label={t('modal-form.description')}
              formProps={formProps}
              setFormProps={setFormProps}
            />

            <FieldForm
              type="url"
              name="github_url"
              label={t('modal-form.github-url')}
              formProps={formProps}
              setFormProps={setFormProps}
            />

            {/* <FieldForm
              type="url"
              name="slides_url"
              label={t('modal-form.slides-url')}
              formProps={formProps}
              setFormProps={setFormProps}
            /> */}

            <FieldForm
              type="file"
              name="screenshot"
              // label={t('modal-form.slides-url')}
              formProps={formProps}
              setFormProps={setFormProps}
            />

            {/* <FieldForm
              type="text"
              name="geeks_members"
              // label={t('modal-form.slides-url')}
              formProps={formProps}
              setFormProps={setFormProps}
            /> */}
            <AddMember />
          </Form>
          <Button variant="default" isLoading={isSubmitting}>
            Submit project
          </Button>
        </>
      )}
    </Formik>
  );
};

export default FinalProjectForm;
