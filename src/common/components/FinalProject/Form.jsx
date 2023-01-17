import { Button, Flex, toast } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import bc from '../../services/breathecode';
import FieldForm from '../Forms/FieldForm';
import { isGithubUrl, url } from '../../../utils/regex';
import Heading from '../Heading';
import AddMember from './AddMember';

const FinalProjectForm = ({ storyConfig, cohortData, studentsData }) => {
  const { t } = useTranslation('final-project');
  const [students, setStudents] = useState(studentsData);
  const [fileProps, setFileProps] = useState([]);
  const cohortSlug = cohortData?.slug;
  const [formProps, setFormProps] = useState({
    name: '',
    one_line_desc: '',
    description: '',
    url: '',
    slides_url: '',
    screenshot: null,
    members: [],
  });
  const commonTranslation = storyConfig?.translation[storyConfig?.locale]?.common;
  const finalProjectTranslation = storyConfig?.translation[storyConfig?.locale]['final-project'];
  console.log('students2', students);

  const megaByte = 1000000;
  const maxFileSize = 2 * megaByte;

  const finalProjectValidation = Yup.object().shape({
    name: Yup.string()
      .required(commonTranslation?.validators['project-name-error'] || t('common:validators.project-name-error')),
    one_line_desc: Yup.string()
      .max(50, t(commonTranslation?.validators['long-input'] || 'common:validators.long-input'))
      .required(t(commonTranslation?.validators['one-line-description-required'] || 'common:validators.one-line-description-required')),
    description: Yup.string()
      .max(600, t(commonTranslation?.validators['long-input'] || 'common:validators.long-input'))
      .required(t(commonTranslation?.validators['description-required'] || 'common:validators.description-required')),
    url: Yup.string().matches(
      isGithubUrl,
      t(commonTranslation?.validators?.['invalid-url']?.replace('{{url}}', 'https://github.com/') || 'common:validators.invalid-url', { url: 'https://github.com/' }),
    )
      .required(commonTranslation?.validators['github-url-required'] || t('common:validators.github-url-required')),
    slides_url: Yup.string().matches(
      url,
      t(commonTranslation?.validators['invalid-url'] || 'common:validators.invalid-url'),
    ),
    screenshot: Yup.mixed()
      .test('fileFormat', t(commonTranslation?.validators['unsupported-image-file'] || 'common:validators.unsupported-image-file'), (value) => {
        if (value) {
          return ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'].includes(value.type);
        }
        return true;
      })
      .test('fileSize', commonTranslation?.validators['long-file'] || t('common:validators.long-file'), (value) => {
        if (value) {
          return value.size <= maxFileSize;
        }
        return true;
      }),
    // is not required
    members: Yup.array()
      .of(Yup.string())
      .max(8, t(commonTranslation?.validators['geeks-members-max']?.replace('{{value}}', 8) || 'common:validators.geeks-members-max', { value: 8 }))
      .min(1, t(commonTranslation?.validators['geeks-members-min']?.replace('{{value}}', 1) || 'common:validators.geeks-members-min', { value: 1 }))
      .required(commonTranslation?.validators['geeks-members-required'] || t('common:validators.geeks-members-required')),
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

  useEffect(() => {
    bc.cohort().getStudents(cohortSlug, 4)
      .then((res) => {
        const studentsFiltered = res?.data.filter((student) => student?.role === 'STUDENT')
          .map((student) => ({
            ...student,
            user: {
              ...student?.user,
              full_name: `${student?.user?.first_name} ${student?.user?.last_name}`,
            },
          }));
        setStudents(studentsFiltered);
      });
  }, []);

  return (
    <Formik
      initialValues={{
        name: '', // required
        one_line_desc: '', // max 50 characters, required
        description: '', // max 600 characters, required
        url: '',
        slides_url: '', // info: Online slides like Google Sliders, Prezi, etc
        screenshot: null,
        members: [],
      }}
      onSubmit={(values, actions) => {
        const userIds = values?.members?.map((member) => {
          const tagId = member?.match(/\(([^)]+)\)/) !== null ? member?.match(/\(([^)]+)\)/)[1] : member;
          const replaceTag = tagId?.replace(/\(([^)]+)\)/, '')?.trim();
          const userData = students?.find((student) => student?.user?.id === Number(tagId));
          return userData?.user?.id || replaceTag;
        });

        const allValues = {
          ...values,
          cohort: 157,
          members: userIds,
        };
        actions.setSubmitting(false);
        handleSubmit(actions, allValues);
      }}
      validationSchema={finalProjectValidation}
    >
      {({ errors, isSubmitting, setFieldValue }) => (
        <Flex flexDirection="column" padding="20px" gridGap="30px">
          <Heading size="xsm">
            {finalProjectTranslation['modal-form']?.title || t('modal-form.title')}
          </Heading>
          <Form
            style={{
              display: 'flex',
              flexDirection: 'column',
              gridGap: '22px',
            }}
          >
            <FieldForm
              type="text"
              name="name"
              label={finalProjectTranslation['modal-form']['project-name'] || t('modal-form.project-name')}
              formProps={formProps}
              setFormProps={setFormProps}
            />

            <FieldForm
              type="text"
              name="one_line_desc"
              label={finalProjectTranslation['modal-form']['one-line-description'] || t('modal-form.one-line-description')}
              formProps={formProps}
              setFormProps={setFormProps}
            />

            <FieldForm
              type="textarea"
              name="description"
              label={finalProjectTranslation['modal-form']?.description || t('modal-form.description')}
              formProps={formProps}
              setFormProps={setFormProps}
            />

            <FieldForm
              type="text"
              name="url"
              label={finalProjectTranslation['modal-form']['github-url'] || t('modal-form.github-url')}
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
              translation={{
                finalProjectTranslation,
                commonTranslation,
              }}
              formProps={formProps}
              fileProps={fileProps}
              setFileProps={setFileProps}
              setFormProps={setFormProps}
              setFieldValue={setFieldValue}
              maxFileSize={maxFileSize}
              acceptedFiles="image/jpg, image/jpeg, image/gif, image/png"
            />
            <AddMember translation={{ finalProjectTranslation, commonTranslation }} students={students} errors={errors} />
            <Button type="submit" variant="default" isLoading={isSubmitting}>
              {commonTranslation['submit-project'] || t('common:submit-project')}
            </Button>
          </Form>
        </Flex>
      )}
    </Formik>
  );
};

FinalProjectForm.propTypes = {
  cohortData: PropTypes.objectOf(PropTypes.any),
  studentsData: PropTypes.objectOf(PropTypes.any),
  storyConfig: PropTypes.objectOf(PropTypes.any),
};
FinalProjectForm.defaultProps = {
  cohortData: {},
  studentsData: {},
  storyConfig: {},
};

export default FinalProjectForm;
