/* eslint-disable no-unsafe-optional-chaining */
import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, Box,
  NumberInput, NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper, NumberInputField,
  FormControl, FormLabel, Flex, Grid, useCheckbox, useCheckboxGroup, Avatar,
  useColorMode, useToast, Select, ModalCloseButton,
} from '@chakra-ui/react';
import Icon from '../Icon';
import Text from '../Text';
import bc from '../../services/breathecode';
import ModalInfo from '../ModalInfo';
import useStyle from '../../hooks/useStyle';
import useCohortHandler from '../../hooks/useCohortHandler';
import handlers from '../../handlers';

function AttendanceModal({
  title, message, isOpen, onClose, students,
}) {
  const { t } = useTranslation('dashboard');
  const { setCohortSession, cohortSession, sortedAssignments } = useCohortHandler();
  const [historyLog, setHistoryLog] = useState();
  const [day, setDay] = useState(cohortSession.current_day);
  const [attendanceTaken, setAttendanceTaken] = useState({});
  const [currentModule, setCurrentModule] = useState(cohortSession.current_module);
  const [autoSelect, setAutoSelect] = useState(false);
  // const [defaultDay, setDefaultDay] = useState(0);
  const [checked, setChecked] = useState([]);
  const [defaultProps, setDefaultProps] = useState({
    current_day: 0,
    current_module: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [openWarn, setOpenWarn] = useState(false);
  const [openAttendanceTakenWarn, setOpenAttendanceTakenWarn] = useState(false);
  const [attendanceList, setAttendanceList] = useState({});
  const { colorMode } = useColorMode();
  const toast = useToast();

  const { lightColor, borderColor } = useStyle();

  const { getCheckboxProps } = useCheckboxGroup({
    onChange: setChecked,
    value: checked,
  });
  const cohortDurationInDays = cohortSession?.syllabus_version.duration_in_days;

  const currentCohortDay = cohortSession?.current_day;
  const currentCohortModule = cohortSession?.current_module;

  useEffect(() => {
    setIsLoading(true);
    handlers.getAttendanceList({ cohortSlug: cohortSession?.slug })
      .then((data) => {
        setAttendanceList(data);
      })
      .catch(() => {
        toast({
          position: 'top',
          title: t('alert-message:error-getting-previous-attendance'),
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // Mark checkboxes with attendanceStudents {user.id}
    if (attendanceTaken?.attendanceStudents) {
      const checkedStudents = attendanceTaken?.attendanceStudents.map((student) => String(student.user.id));

      setChecked(checkedStudents);
      if (autoSelect) {
        setCurrentModule(attendanceTaken?.current_module || -1);
      } else {
        setCurrentModule(currentModule);
      }
    }
  }, [attendanceTaken.attendanceStudents]);

  const getDailyModuleData = () => {
    if (sortedAssignments.length > 0) {
      const dailyModule = sortedAssignments.find(
        (assignment) => assignment.id === currentModule,
      );
      const prevDailyModule = sortedAssignments.find(
        (assignment) => assignment.id === (currentModule - 1),
      );
      return {
        dailyModule,
        prevDailyModule,
      };
    }
    return null;
  };

  const currModuleData = getDailyModuleData()?.dailyModule;

  useEffect(() => {
    setDefaultProps({
      current_day: currentCohortDay,
      current_module: currentCohortModule,
    });
  }, [currentCohortDay, currentCohortModule]);

  // function that checks if the attendance has been taken for the current day
  const attendanceWasTaken = () => {
    const attendance = attendanceList[day];
    if (attendance && attendance?.attendance_ids?.length > 0) {
      return true;
    }
    return false;
  };

  const saveCohortAttendancy = () => {
    handlers.saveCohortAttendancy({ cohortSlug: cohortSession.slug, students, checked, currentModule })
      .then((data) => {
        setAttendanceList(data);
        toast({
          position: 'top',
          title: t('alert-message:attendancy-reported'),
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          position: 'top',
          title: t('alert-message:attendancy-report-error'),
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      })
      .finally(() => setIsLoading(false));
  };

  const updateCohortDay = () => {
    setIsLoading(true);
    if (currentModule > 0) {
      bc.cohort()
        .update(cohortSession.id, { current_day: Number(day), current_module: currentModule })
        .then(({ data }) => {
          saveCohortAttendancy();
          setCohortSession({
            ...cohortSession,
            current_module: data.current_module,
            current_day: data.current_day,
            ...data,
          });
        })
        .catch(() => {
          toast({
            position: 'top',
            title: t('alert-message:error-updating-day-and-modules'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          setOpenWarn(false);
          setIsLoading(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      toast({
        position: 'top',
        title: t('alert-message:error-updating-day-and-modules'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const arrayOfDays = Object.keys(attendanceList);
    const modulesRepeated = arrayOfDays.map((l) => {
      if (attendanceList[l].current_module === currentModule) {
        return attendanceList[l];
      }
      return null;
    }).filter((l) => l !== null);
    const expecteFinish = modulesRepeated.filter((_, i) => i === currModuleData?.duration_in_days);

    setHistoryLog({
      repeated: modulesRepeated.length,
      expected: currModuleData?.duration_in_days,
      expecteFinish,
    });
  }, [currentModule]);

  const handleAttendance = () => {
    if (historyLog?.repeated >= historyLog?.expected) {
      setOpenWarn(true);
    } else if (attendanceWasTaken()) {
      setOpenAttendanceTakenWarn(true);
    } else {
      updateCohortDay();
    }
  };
  useEffect(() => {
    if (attendanceList[1] && students.length > 0) {
      handlers.getAttendance({ attendanceList, students, day })
        .then((data) => {
          setAttendanceTaken(data);
        })
        .finally(() => setIsLoading(false));
    }
  }, [attendanceList, students, currModuleData, day]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxWidth="-webkit-fit-content" borderRadius="17px" padding="10px" style={{ margin: '3rem 0 0 0' }} bg={colorMode === 'light' ? 'white' : 'featuredDark'}>
        <ModalHeader fontSize="30px" paddingBottom={0}>
          {title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text size="l" color={colorMode === 'light' ? 'gray.dark' : 'white'}>
            {message}
          </Text>
          <Box display="flex" gridGap="25px" padding="20px 0 0 0">
            <FormControl id="days">
              <FormLabel htmlFor="day" color={lightColor} fontSize="12px">{t('attendance-modal.day')}</FormLabel>
              <NumberInput
                defaultValue={defaultProps.current_day}
                max={cohortDurationInDays}
                min={1}
                onChange={(newDay) => {
                  setDay(parseInt(newDay, 10));
                  setAutoSelect(true);
                }}
              >
                <NumberInputField color={colorMode === 'light' ? 'black' : 'white'} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="current_module" color={lightColor} fontSize="12px">{t('attendance-modal.module')}</FormLabel>
              {sortedAssignments.length > 0 && (
                <Select
                  defaultValue={defaultProps.current_module}
                  value={currentModule}
                  onChange={(e) => {
                    setCurrentModule(parseInt(e.target.value, 10));
                    setAutoSelect(false);
                  }}
                  id="module"
                  placeholder="Select module"
                >
                  {sortedAssignments.map((module) => (
                    <option key={module.id} value={module.id}>
                      {`#${module.id} - ${module.label}`}
                    </option>
                  ))}
                </Select>
              )}
            </FormControl>
          </Box>
          <Box height="1px" bg={borderColor} marginTop="32px" marginBottom="15px" />
          <Box>
            <Flex justifyContent="space-between" padding="6px 0 16px 0">
              <Text size="l" color={colorMode === 'light' ? 'gray.dark' : 'white'}>
                {t('attendance-modal.select-students')}
              </Text>
              <Text size="l" color={colorMode === 'light' ? 'gray.dark' : 'white'}>
                {checked.length > 1 || checked.length === 0
                  ? t('attendance-modal.students-selected', { count: checked.length })
                  : t('attendance-modal.student-selected', { count: checked.length })}
              </Text>
            </Flex>
            <Grid templateColumns={{ md: 'repeat(4, 4fr)', sm: 'repeat(1, 1fr)' }} gap={6}>
              {students.map((item) => {
                const checkbox = getCheckboxProps({ value: item.user.id.toString() });

                return (
                  <CheckboxCard key={`${item.user.id}-${item.user.first_name}`} {...checkbox}>
                    <Flex justifyContent="space-between">
                      <Flex marginRight="12px" alignItems="center">
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
          <Button variant="link" fontSize="13px" fontWeight={400} onClick={() => setChecked(students.map((l) => String(l?.user?.id)))}>
            {t('common:select-all')}
          </Button>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Text
            color={lightColor}
            size="sm"
          >
            {t('attendance-modal.showing-students-with-active-educational-status')}
          </Text>
          <Button
            isLoading={isLoading}
            loadingText="SUBMITTING"
            minWidth="173.4px"
            textTransform="uppercase"
            fontSize="13px"
            isDisabled={checked.length < 1 || isLoading}
            variant="default"
            onClick={handleAttendance}
            rightIcon={<Icon icon="longArrowRight" width="15px" color={checked.length < 1 ? 'black' : 'white'} />}
          >
            {t('attendance-modal.apply-changes')}
          </Button>

          <ModalInfo
            isOpen={openWarn}
            onClose={() => setOpenWarn(false)}
            htmlDescription={t('attendance-modal.warn-slower-teaching.description', {
              module: getDailyModuleData()?.dailyModule?.label,
              repeated: historyLog?.repeated + 1,
              expected: historyLog?.expected,
            })}
            // historyLog?.repeated > historyLog?.expected
            actionHandler={() => {
              if (attendanceWasTaken()) {
                setOpenAttendanceTakenWarn(true);
              } else {
                updateCohortDay();
              }
              setOpenWarn(false);
            }}
            closeButtonVariant="outline"
            title={t('attendance-modal.warn-slower-teaching.title')}
            handlerText={t('common:confirm')}

          />
        </ModalFooter>
        <Modal isOpen={openAttendanceTakenWarn} margin="0 10px" onClose={() => setOpenAttendanceTakenWarn(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={borderColor} textAlign="center">
              {t('attendance-modal.attendance-already-taken.title')}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {t('attendance-modal.attendance-already-taken.description')}
            </ModalBody>
            <ModalFooter display="flex" justifyContent="space-between">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenAttendanceTakenWarn(false);
                }}
              >
                {t('common:cancel')}
              </Button>
              <Button
                minWidth="173.4px"
                textTransform="uppercase"
                fontSize="13px"
                variant="default"
                onClick={() => {
                  setOpenAttendanceTakenWarn(false);
                  updateCohortDay();
                }}
                rightIcon={<Icon icon="longArrowRight" width="15px" color={checked.length < 1 ? 'black' : 'white'} />}
              >
                {t('attendance-modal.apply-changes')}
              </Button>

            </ModalFooter>
          </ModalContent>
        </Modal>
      </ModalContent>
    </Modal>
  );
}

export function CheckboxCard(props) {
  const { children } = props;
  const { getInputProps, getCheckboxProps } = useCheckbox(props);
  const input = getInputProps();
  const checkbox = getCheckboxProps();
  const { fontColor, borderColor, featuredColor } = useStyle();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderRadius="md"
        border="2px solid"
        borderColor={borderColor}
        _checked={{
          bg: featuredColor,
          color: fontColor,
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
}

CheckboxCard.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  value: PropTypes.string.isRequired,
};

AttendanceModal.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  students: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
AttendanceModal.defaultProps = {
  title: '',
  message: '',
  isOpen: true,
  onClose: () => { },
};

export default AttendanceModal;
