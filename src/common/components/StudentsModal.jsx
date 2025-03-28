import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, Box,
  FormControl, FormLabel, Input, Flex, Grid, Avatar, Spinner,
  ModalCloseButton,
} from '@chakra-ui/react';
import Text from './Text';
import bc from '../services/breathecode';
import useStyle from '../hooks/useStyle';
import useCohortHandler from '../hooks/useCohortHandler';

function StudentsModal({
  isOpen, onClose,
}) {
  const { t } = useTranslation('dashboard');
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [students, setStudents] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [filterStudent, setFilterStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { hexColor, lightColor, borderColor, modal } = useStyle();

  const loadStudents = async (offset, append = false, like) => {
    try {
      setIsLoading(true);
      const { data } = await bc.cohort({ offset, limit: 10, like }).getStudents(cohortSession.slug);

      const { count, results } = data;
      setStudentsCount(parseInt(count, 10));
      if (append) setStudents((prev) => [...prev, ...results]);
      else setStudents(results);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cohortSession?.cohort_user?.role !== 'STUDENT' && students.length === 0) loadStudents();
  }, [cohortSession]);

  const handleFilterChange = (e) => {
    setFilterStudent(e.target.value);
  };

  useEffect(() => {
    let timeoutId;
    if (!filterStudent) loadStudents(0, false);
    else timeoutId = setTimeout(() => loadStudents(0, false, filterStudent), 1000);
    return () => clearTimeout(timeoutId);
  }, [filterStudent]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxWidth="-webkit-fit-content" borderRadius="17px" padding="10px" style={{ margin: '3rem 0 0 0' }} bg={modal.background}>
        <ModalHeader fontSize="30px" paddingBottom={0}>
          {t('dashboard:students-modal.students-course')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text size="l">
            {t('dashboard:students-modal.select-student')}
          </Text>
          <Box display="flex" gridGap="25px" padding="20px 0 0 0">
            <FormControl>
              <FormLabel htmlFor="student-name" color={lightColor} fontSize="12px">{t('dashboard:students-modal.student')}</FormLabel>
              <Input name="student-name" value={filterStudent} onChange={handleFilterChange} placeholder={t('dashboard:students-modal.filter-by-name')} />
            </FormControl>
          </Box>
          <Box height="1px" bg={borderColor} margin="15px 0" />
          <Box>
            <Grid maxHeight="250px" overflowY="scroll" templateColumns={{ md: 'repeat(4, 4fr)', sm: 'repeat(1, 1fr)' }} gap={6}>
              {students.map(({ user }) => (
                <Box
                  key={`${user.id}-${user.first_name}`}
                  cursor="pointer"
                  borderRadius="md"
                  border="2px solid"
                  borderColor={borderColor}
                  px={2}
                  py={1}
                  onClick={() => {
                    window.open(`/cohort/${cohortSession?.slug}/student/${user.id}?academy=${cohortSession?.academy?.id}`, '_blank');
                  }}
                >
                  <Flex justifyContent="space-between">
                    <Flex marginRight="12px" alignItems="center">
                      <Avatar
                        width="30px"
                        marginY="auto"
                        marginRight="5px"
                        height="30px"
                        src={user?.profile?.avatar_url || ''}
                      />
                      <Text size="md">{`${user.first_name} ${user.last_name}`}</Text>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Grid>
            {!isLoading && students.length === 0 && (
              <Box>
                <Text fontSize="l" fontWeight="700">
                  {t('dashboard:students-modal.no-students')}
                </Text>
              </Box>
            )}
            {isLoading && (
              <Box width="100%" py="10px">
                <Spinner color={hexColor.blueDefault} display="block" margin="auto" />
              </Box>
            )}
          </Box>
          {!isLoading && studentsCount !== students.length && (
            <Button
              variant="link"
              fontSize="13px"
              fontWeight={400}
              onClick={() => loadStudents(students.length, true)}
            >
              {t('common:load-more')}
            </Button>
          )}
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Text
            color={lightColor}
            size="sm"
          >
            {t('attendance-modal.showing-students-with-active-educational-status')}
          </Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

StudentsModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
StudentsModal.defaultProps = {
  isOpen: true,
  onClose: () => { },
};

export default StudentsModal;
