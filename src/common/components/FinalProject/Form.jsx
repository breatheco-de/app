import { Button, Flex, useToast } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import bc from '../../services/breathecode';
import FieldForm from '../Forms/FieldForm';
import { url } from '../../../utils/regex';
import Heading from '../Heading';
import AddMember from './AddMember';
import { isNumber } from '../../../utils';

const FinalProjectForm = ({ storyConfig, cohortData, studentsData, handleClose, defaultValues }) => {
  const { t } = useTranslation('final-project');
  const [students, setStudents] = useState(studentsData);
  const [fileProps, setFileProps] = useState([]);
  const cohortSlug = cohortData?.slug || 'miami-xxix';
  const toast = useToast();
  const cohortAcademy = cohortData?.academy?.id || 4;
  const [formProps, setFormProps] = useState({
    name: '',
    one_line_desc: '',
    description: '',
    repo_url: '',
    slides_url: '',
    screenshot: null,
    members: [],
  });

  const commonTranslation = storyConfig?.translation?.[storyConfig?.locale]?.common;
  const finalProjectTranslation = storyConfig?.translation?.[storyConfig?.locale]['final-project'];

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
    repo_url: Yup.string().matches(
      url,
      t(commonTranslation?.validators?.['invalid-url']?.replace('{{url}}', 'https://github.com/') || 'common:validators.invalid-url', { url: 'https://...' }),
    )
      .required(commonTranslation?.validators['repo-url-required'] || t('common:validators.repo-url-required')),
    // slides_url: Yup.string().matches(
    //   url,
    //   t(commonTranslation?.validators['invalid-url'] || 'common:validators.invalid-url'),
    // ),
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

  const handleUpdate = (actions, allValues) => {
    bc.todo().updateFinalProject(allValues)
      .then((res) => {
        if (res) {
          toast({
            title: 'Success',
            description: 'Your final project has been updated',
            status: 'success',
            duration: 5000,
          });
        } else {
          toast({
            title: 'Error',
            description: 'Something went wrong updating your final project',
            status: 'error',
            duration: 5000,
          });
        }
        handleClose();
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

  const handleSubmit = async (actions, allValues) => {
    bc.todo().createFinalProject(allValues)
      .then((res) => {
        if (res) {
          toast({
            title: 'Success',
            description: 'Your final project has been sended',
            status: 'success',
            duration: 5000,
          });
          handleClose();
        } else {
          toast({
            title: 'Error',
            description: 'Something went wrong submiting your final project',
            status: 'error',
            duration: 5000,
          });
        }
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
    if (studentsData?.length > 0) return;
    bc.cohort().getStudents(cohortSlug, cohortAcademy)
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

  const getTag = (tag) => {
    if (isNumber(tag)) {
      return `${tag}`;
    }
    if (tag?.match(/\(([^)]+)\)/) !== null) {
      return tag?.match(/\(([^)]+)\)/)[1];
    }
    return `${tag}`;
  };

  return (
    <Formik
      initialValues={{
        name: defaultValues?.name || '',
        one_line_desc: defaultValues?.one_line_desc || '',
        description: defaultValues?.description || '',
        repo_url: defaultValues?.repo_url || '',
        slides_url: '',
        screenshot: null,
        members: defaultValues?.members?.length > 0
          ? defaultValues?.members.map((l) => l.id)
          : [],
        // name: '', // required
        // one_line_desc: '', // max 50 characters, required
        // description: '', // max 600 characters, required
        // repo_url: '',
        // slides_url: '', // info: Online slides like Google Sliders, Prezi, etc
        // screenshot: null,
        // members: [],
      }}
      onSubmit={(values, actions) => {
        const userIds = values?.members?.map((member) => {
          const tagId = getTag(member);
          const replaceTag = typeof tagId === 'string' ? tagId?.replace(/\(([^)]+)\)/, '')?.trim() : tagId;
          const userData = students?.find((student) => student?.user?.id === Number(tagId));
          return userData?.user?.id || replaceTag;
        });
        const allValues = {
          ...values,
          cohort: 157,
          members: userIds,
          id: defaultValues?.id,
        };

        if (defaultValues?.repo_url) {
          handleUpdate(actions, [allValues]);
        } else {
          handleSubmit(actions, allValues);
        }
        actions.setSubmitting(false);
      }}
      validationSchema={finalProjectValidation}
    >
      {({ errors, isSubmitting, setFieldValue }) => {
        const errorFileds = errors;

        return (
          <Flex flexDirection="column" padding="20px" gridGap="30px">
            <Heading size="xsm">
              {finalProjectTranslation?.['modal-form']?.title || t('modal-form.title')}
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
                label={finalProjectTranslation?.['modal-form']?.['project-name'] || t('modal-form.project-name')}
                required
                formProps={formProps}
                setFormProps={setFormProps}
              />

              <FieldForm
                type="text"
                name="one_line_desc"
                label={finalProjectTranslation?.['modal-form']?.['one-line-description'] || t('modal-form.one-line-description')}
                required
                formProps={formProps}
                setFormProps={setFormProps}
              />

              <FieldForm
                type="textarea"
                maxLength={600}
                name="description"
                label={finalProjectTranslation?.['modal-form']?.description || t('modal-form.description')}
                required
                formProps={formProps}
                setFormProps={setFormProps}
              />

              <FieldForm
                type="text"
                name="repo_url"
                label={finalProjectTranslation?.['modal-form']?.['repository-url'] || t('modal-form.repository-url')}
                formProps={formProps}
                setFormProps={setFormProps}
                hint={finalProjectTranslation?.['modal-form']?.['repository-hint'] || t('modal-form.repository-hint')}
                required
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
                acceptedFiles="image/jpg, image/jpeg, image/gif, image/png, image/gif"
                hint={finalProjectTranslation?.['modal-form']?.['screenshot-hint'] || t('modal-form.screenshot-hint')}
              />
              <AddMember
                translation={{ finalProjectTranslation, commonTranslation }}
                students={students}
                errors={errorFileds}
                required
                hint={finalProjectTranslation?.['modal-form']?.['participants-hint'] || t('modal-form.participants-hint')}
              />
              <Button
                type="submit"
                variant="default"
                isLoading={isSubmitting}
              >
                {commonTranslation?.['submit-project'] || t('common:submit-project')}
              </Button>
            </Form>
          </Flex>
        );
      }}
    </Formik>
  );
};

FinalProjectForm.propTypes = {
  cohortData: PropTypes.objectOf(PropTypes.any),
  studentsData: PropTypes.arrayOf(PropTypes.object),
  storyConfig: PropTypes.objectOf(PropTypes.any),
  handleClose: PropTypes.func,
  defaultValues: PropTypes.objectOf(PropTypes.any),
};
FinalProjectForm.defaultProps = {
  cohortData: {},
  studentsData: [],
  storyConfig: {},
  handleClose: () => {},
  defaultValues: {},
};

export default FinalProjectForm;
