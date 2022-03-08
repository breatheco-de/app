/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Box,
  NumberInput,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  FormControl,
  FormLabel,
  Flex,
  Grid,
  useCheckbox,
  useCheckboxGroup,
  Avatar,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';
import bc from '../services/breathecode';
import usePersistent from '../hooks/usePersistent';

const AttendanceModal = ({
  title, message, isOpen, onClose,
}) => {
  const [students, setSudents] = useState([]);
  const [cohortSession, setCohortSession] = usePersistent('cohortSession', {});
  const [day, setDay] = useState(0);
  const [defaultDay, setDefaultDay] = useState(0);
  const [checked, setChecked] = useState([]);
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { getCheckboxProps } = useCheckboxGroup({
    onChange: setChecked,
  });

  const durationInDays = cohortSession.syllabus_version.duration_in_days;

  console.log('checked:::', checked);

  useEffect(() => {
    const currentCohortDay = cohortSession.current_day;
    setDefaultDay(currentCohortDay);
    bc.cohort().getStudents(cohortSession.slug).then((res) => {
      const { data } = res;
      if (data.length > 0) {
        const onlyStudents = data.filter((student) => student.role === 'STUDENT');
        setSudents(onlyStudents);
      }
    }).catch((err) => {
      console.error('err_student:', err);
    });
  }, [cohortSession]);

  const updateCohortDay = () => new Promise((resolve, reject) => {
    bc.cohort()
      .update(cohortSession.id, { current_day: day })
      .then(({ data }) => {
        setCohortSession({ ...cohortSession, ...data });
        resolve(data);
        return data;
      })
      .catch((error) => reject(error));
  });

  const saveCohortAttendancy = () => {
    const cohortSlug = cohortSession.slug;
    return new Promise((resolve, reject) => {
      if (checked.length === 0) {
        toast({
          title: 'No attendancy to report',
          status: 'warning',
          duration: 9000,
          isClosable: true,
        });
      } else {
        bc.activity()
          .addBulk(
            cohortSlug,
            students.map(({ user }) => {
              const attended = checked.find((id) => parseInt(id, 10) === user.id);
              return {
                user_id: user.id,
                user_agent: 'bc/teacher',
                cohort: cohortSlug,
                // day: currentCohort.cohort.current_day.toString()
                day: cohortSession.current_day.toString(),
                slug: typeof attended === 'undefined' || !attended ? 'classroom_unattendance' : 'classroom_attendance',
                data: `{ "cohort": "${cohortSlug}", "day": "${cohortSession.current_day}"}`,
              };
            }),
          )
          .then((res) => {
            console.log('res_attendance', res);
            toast({
              title: 'The Attendancy has been reported',
              status: 'success',
              duration: 9000,
              isClosable: true,
            });
            resolve(true);
          })
          .catch(() => {
            toast({
              title: 'There was an error reporting the attendancy',
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
            reject(new Error('There was an error reporting the attendancy'));
          });
      }
    });
  };

  console.log('day:::', day);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxWidth="-webkit-fit-content" borderRadius="17px" padding="10px" bg={colorMode === 'light' ? 'white' : 'featuredDark'}>
        <ModalHeader fontSize="30px" paddingBottom={0}>
          {title}
        </ModalHeader>
        <ModalBody>
          <Box>
            <Box>
              <Text size="l" color={colorMode === 'light' ? 'gray.dark' : 'white'}>
                {message}
              </Text>
            </Box>
            <Box>
              <FormControl id="days">
                <FormLabel color="gray.default">Day</FormLabel>
                <NumberInput
                  defaultValue={defaultDay}
                  max={durationInDays}
                  min={0}
                  onChange={(newDay) => setDay(newDay)}
                >
                  <NumberInputField color={colorMode === 'light' ? 'black' : 'white'} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Box>
          </Box>
          <Box height="1px" bg="gray.light" marginTop="32px" marginBottom="15px" />
          <Box>
            <Flex justifyContent="space-between">
              <Text size="l" color={colorMode === 'light' ? 'gray.dark' : 'white'}>
                Select the student in the class
              </Text>
              <Text size="l" color={colorMode === 'light' ? 'gray.dark' : 'white'}>
                {checked.length}
                {' '}
                Student selected
              </Text>
            </Flex>
            <Grid templateColumns={{ md: 'repeat(4, 4fr)', sm: 'repeat(1, 1fr)' }} gap={6}>
              {students.map((item) => {
                const checkbox = getCheckboxProps({ value: item.user.id.toString() });
                return (
                  <CheckboxCard key={item.user.first_name} {...checkbox}>
                    <Flex justifyContent="space-between">
                      <Flex marginRight="12px">
                        <Avatar
                          width="30px"
                          marginY="auto"
                          marginRight="5px"
                          height="30px"
                          src={item.user?.profile?.avatar_url || ''}
                        />
                        <Text size="md">{`${item.user.first_name} ${item.user.last_name}`}</Text>
                      </Flex>
                      <Icon
                        icon={checkbox.isChecked ? 'checked' : 'unverified'}
                        width="15px"
                        height="15px"
                        style={{ marginTop: 'auto', marginBottom: 'auto' }}
                      />
                    </Flex>
                  </CheckboxCard>
                );
              })}
            </Grid>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            fontSize="13px"
            disabled={checked.length < 1}
            variant="default"
            onClick={() => {
              saveCohortAttendancy();
              updateCohortDay();
            }}
            rightIcon={<Icon icon="longArrowRight" width="15px" color="white" />}
          >
            START CLASS DAY
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const CheckboxCard = (props) => {
  const { children } = props;
  const { getInputProps, getCheckboxProps } = useCheckbox(props);
  const input = getInputProps();
  const checkbox = getCheckboxProps();
  const { colorMode } = useColorMode();
  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        border="1px solid"
        borderColor="#A9A9A9"
        _checked={{
          bg: colorMode === 'light' ? 'blue.light' : 'featuredDark',
          color: colorMode === 'light' ? 'dark' : 'white',
          borderColor: 'blue.default',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={2}
        py={1}
      >
        {children}
      </Box>
    </Box>
  );
};

CheckboxCard.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  value: PropTypes.objectOf(PropTypes.object).isRequired,
};

AttendanceModal.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  days: PropTypes.arrayOf(PropTypes.array),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  maxDays: PropTypes.number,
  minDays: PropTypes.number,
  handleChangeDay: PropTypes.func,
};
AttendanceModal.defaultProps = {
  title: '',
  days: [],
  message: '',
  isOpen: true,
  onClose: () => { },
  maxDays: 10,
  minDays: 0,
  handleChangeDay: () => {

  },
};

export default AttendanceModal;
