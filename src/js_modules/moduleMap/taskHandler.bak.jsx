import {
  FormControl, FormLabel, Input, Button,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';

import Icon from '../../common/components/Icon';

export const getIconByTaskStatus = ({ currentTask }) => {
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
      // NOTE: Icon for Revision pending...
      return <Icon icon="checked" color="#FFB718" width="27px" height="27px" />;
    }
    if (currentTask.revision_status === 'DONE') {
      return <Icon icon="verified" color="#25BF6C" width="27px" />;
    }
    return <Icon icon="unchecked" color="#C4C4C4" width="27px" />;
  }
  if (currentTask && currentTask.task_type !== 'PROJECT' && currentTask.task_status === 'DONE') {
    return <Icon icon="verified" color="#25BF6C" width="27px" />;
  }
  return <Icon icon="unchecked" color="#C4C4C4" width="27px" />;
};

export const getOptionsByTaskStatus = ({ currentTask, sendProject, changeStatusAssignment }) => {
  const taskStatusName = () => {
    if (currentTask?.task_status === 'QUIZ' || currentTask?.task_status === 'EXERCISE') {
      return true;
    }
    return false;
  };
  // NOTE: PRROJECT CASE
  if (currentTask && currentTask.task_type === 'PROJECT' && currentTask.task_status) {
    if (currentTask.task_status === 'DONE' && currentTask.revision_status === 'PENDING') {
      // NOTE: Option case Revision pending...
      return (
        <Button
          onClick={() => changeStatusAssignment(currentTask)}
          colorScheme="red"
        >
          Remove current assignment delivery
        </Button>
      );
    }
    if (currentTask.revision_status === 'DONE') {
      return 'Ok';
    }
    return (
      <Formik
        initialValues={{ githubUrl: '' }}
        onSubmit={(values) => {
          sendProject(currentTask, values.githubUrl);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Field name="githubUrl">
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.githubUrl && form.touched.githubUrl}>
                  <FormLabel htmlFor="githubUrl">Github repository url</FormLabel>
                  <Input
                    {...field}
                    type="url"
                    id="githubUrl"
                    placeholder="https://github.com/..."
                  />
                </FormControl>
              )}
            </Field>
            <Button
              mt={4}
              colorScheme="blue"
              isLoading={isSubmitting}
              type="submit"
            >
              Deliver assignment
            </Button>
          </Form>
        )}
      </Formik>
    );
  }
  // NOTE: Dinamic 'Mark as <task_type>'
  // NOTE: ASSIGNMENTS CASE
  if (currentTask && currentTask.task_type !== 'PROJECT' && currentTask.task_status === 'DONE') {
    return (
      <Button onClick={() => changeStatusAssignment(currentTask)} colorScheme="red">Remove check</Button>
    );
  }
  return (
    <Button
      onClick={() => changeStatusAssignment(currentTask)}
      colorScheme="blue"
    >
      {`Mark as ${taskStatusName() ? 'done' : 'read'}`}
    </Button>
  );
};
