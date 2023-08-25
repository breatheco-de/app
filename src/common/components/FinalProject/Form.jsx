import { Button, Flex, useToast, Box, Image } from '@chakra-ui/react';
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
import { usePersistent } from '../../hooks/usePersistent';
import useStyle from '../../hooks/useStyle';
import { isNumber } from '../../../utils';
import useFinalProjectProps from '../../store/actions/finalProjectAction';
import Icon from '../Icon';

function FinalProjectForm({ storyConfig, cohortData, studentsData, handleClose, defaultValues, refreshFinalProject }) {
  const { t } = useTranslation('final-project');
  const [students, setStudents] = useState(studentsData);
  const [fileProps, setFileProps] = useState([]);
  const [cohortSession] = usePersistent('cohortSession', {});
  const cohortSlug = cohortData?.slug || '';
  const toast = useToast();
  const cohortAcademy = cohortData?.academy?.id || 4;
  const { finalProjectData, setFinalProjectData } = useFinalProjectProps();
  const { fontColor, backgroundColor } = useStyle();
  const [prefillImage, setPrefillImage] = useState(finalProjectData?.screenshot || defaultValues?.screenshot || null);
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
      t(commonTranslation?.validators?.['invalid-url']?.replace('{{url}}', 'https://github.com/') || 'common:validators.invalid-url', { url: 'https://github.com/' }),
    )
      .required(commonTranslation?.validators['repo-url-required'] || t('common:validators.repo-url-required')),
    // slides_url: Yup.string().matches(
    //   url,
    //   t(commonTranslation?.validators['invalid-url'] || 'common:validators.invalid-url'),
    // ),
    screenshot: Yup.mixed().nullable()
      .test('fileFormat', t(commonTranslation?.validators['unsupported-image-file'] || 'common:validators.unsupported-image-file'), (value) => {
        if (prefillImage) return true;
        if (value) {
          return ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'].includes(value.type);
        }
        return true;
      })
      .test('fileSize', commonTranslation?.validators['long-file'] || t('common:validators.long-file'), (value) => {
        if (prefillImage) return true;
        if (value) {
          return value.size <= maxFileSize;
        }
        return true;
      }),
    // is not required
    members: Yup.array()
      .of(Yup.string())
      .max(8, t(commonTranslation?.validators['geeks-members-max']?.replace('{{value}}', 8) || 'common:validators.geeks-members-max', { value: 8 }))
      // .min(1, t(commonTranslation?.validators['geeks-members-min']?.replace('{{value}}', 1) || 'common:validators.geeks-members-min', { value: 1 }))
      .required(commonTranslation?.validators['geeks-members-required'] || t('common:validators.geeks-members-required')),
  });

  const handleUpdate = async (actions, allValues) => {
    let result;
    if (allValues[0].screenshot) {
      const formdata = new FormData();
      formdata.append('file', allValues[0].screenshot);

      result = await bc.todo().sendScreenshot(formdata);
    }
    const screenshot = result?.data?.url || prefillImage || null;
    const val = [{ ...allValues[0], screenshot }];
    bc.todo().updateFinalProject(val)
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFinalProjectData(data[0]);
          refreshFinalProject();
          toast({
            position: 'top',
            title: 'Success',
            description: 'Your final project has been updated',
            status: 'success',
            duration: 5000,
          });
        } else {
          toast({
            position: 'top',
            title: 'Error',
            description: data.detail || 'Something went wrong updating your final project',
            status: 'error',
            duration: 5000,
          });
        }
        handleClose();
      })
      .catch(() => {
        toast({
          position: 'top',
          title: 'Error',
          description: 'Something went wrong submiting your final project',
          status: 'error',
          duration: 5000,
        });
      });

    actions.setSubmitting(false);
  };

  const handleSubmit = async (actions, allValues) => {
    let result;
    if (allValues.screenshot) {
      const formdata = new FormData();
      formdata.append('file', allValues.screenshot);

      result = await bc.todo().sendScreenshot(formdata);
    }
    const screenshot = result?.data?.url || null;

    bc.todo().createFinalProject({ ...allValues, screenshot })
      .then((res) => {
        if (res) {
          setFinalProjectData(res.data[0]);
          toast({
            position: 'top',
            title: 'Success',
            description: 'Your final project has been sended',
            status: 'success',
            duration: 5000,
          });
          handleClose();
        } else {
          toast({
            position: 'top',
            title: 'Error',
            description: 'Something went wrong submiting your final project',
            status: 'error',
            duration: 5000,
          });
        }
      })
      .catch(() => {
        toast({
          position: 'top',
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

  const getMembers = () => {
    if (finalProjectData?.members?.length > 0) {
      return finalProjectData?.members.map((member) => member?.id || member);
    }
    if (defaultValues?.members?.length > 0) {
      return defaultValues?.members.map((member) => member.id);
    }
    return [];
  };
  const repoUrl = finalProjectData?.repo_url || defaultValues?.repo_url;
  const projectId = finalProjectData?.id || defaultValues?.id;

  const handleCloseFile = () => {
    setPrefillImage(null);
  };
  return (
    <Formik
      initialValues={{
        name: finalProjectData?.name || defaultValues?.name || '',
        one_line_desc: finalProjectData?.one_line_desc || defaultValues?.one_line_desc || '',
        description: finalProjectData?.description || defaultValues?.description || '',
        repo_url: repoUrl || '',
        slides_url: '',
        screenshot: null,
        members: getMembers(),
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
          cohort: cohortSession?.id,
          members: userIds,
          id: projectId,
        };

        if (repoUrl) {
          handleUpdate(actions, [allValues]);
        } else {
          handleSubmit(actions, allValues);
        }
        actions.setSubmitting(false);
      }}
      validationSchema={finalProjectValidation}
    >
      {({ errors, isSubmitting, setFieldValue }) => {
        const errorFields = errors;

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

              {!prefillImage ? (
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
              ) : (
                <Box width="100 %" height="100%" position="relative">
                  <Button display="flex" background={backgroundColor} color={fontColor} variant="unstyled" opacity={0.7} _hover={{ opacity: 0.9 }} onClick={handleCloseFile} position="absolute" right={3} top={2}>
                    <Icon icon="close" width="14px" height="14px" color="currentColor" />
                  </Button>
                  <Image src={prefillImage} width="100%" height="auto" borderRadius="3px" />
                </Box>
              )}
              <AddMember
                translation={{ finalProjectTranslation, commonTranslation }}
                students={students}
                errors={errorFields}
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
}

FinalProjectForm.propTypes = {
  cohortData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  studentsData: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  storyConfig: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  handleClose: PropTypes.func,
  defaultValues: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  refreshFinalProject: PropTypes.func.isRequired,
};
FinalProjectForm.defaultProps = {
  cohortData: {},
  studentsData: [],
  storyConfig: {},
  handleClose: () => {},
  defaultValues: {},
};

export default FinalProjectForm;
