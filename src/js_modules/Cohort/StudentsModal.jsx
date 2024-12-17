/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, Box,
  FormControl, FormLabel, Flex, Grid, Avatar,
  useColorMode, useToast, Select, ModalCloseButton,
} from '@chakra-ui/react';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import bc from '../../common/services/breathecode';
import useStyle from '../../common/hooks/useStyle';
import useCohortHandler from '../../common/hooks/useCohortHandler';

function StudentsModal({
  isOpen, onClose,
}) {
  const { t } = useTranslation('dashboard');
  const { state } = useCohortHandler();
  const { cohortSession, sortedAssignments } = state;
  const [currentModule, setCurrentModule] = useState(cohortSession.current_module);
  const [students, setStudents] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { colorMode } = useColorMode();
  // const toast = useToast();

  const { lightColor, borderColor } = useStyle();

  const loadStudents = async (append = false) => {
    try {
      setIsLoading(true);
      const { data } = await bc.cohort({ count: studentsCount, limit: 20 }).getStudents(cohortSession.slug);

      const { count, results } = data;
      setStudentsCount(count);
      if (append) setStudents((prev) => [...prev, ...results]);
      else setStudents(results);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cohortSession.cohort_role !== 'STUDENT') loadStudents();
  }, [cohortSession]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxWidth="-webkit-fit-content" borderRadius="17px" padding="10px" style={{ margin: '3rem 0 0 0' }} bg={colorMode === 'light' ? 'white' : 'featuredDark'}>
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
              <FormLabel htmlFor="current_module" color={lightColor} fontSize="12px">{t('attendance-modal.module')}</FormLabel>
              {sortedAssignments.length > 0 && (
                <Select
                  value={currentModule}
                  onChange={(e) => {
                    setCurrentModule(parseInt(e.target.value, 10));
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
            <Grid templateColumns={{ md: 'repeat(4, 4fr)', sm: 'repeat(1, 1fr)' }} gap={6}>
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
          </Box>
          <Button variant="link" fontSize="13px" fontWeight={400} onClick={() => alert('loading more')}>
            {t('common:load-more')}
          </Button>
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
