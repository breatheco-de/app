import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  useDisclosure,
  Box,
  Select,
  FormControl,
  FormLabel,
  Flex,
  Grid,
  useCheckbox,
  useCheckboxGroup,
  Avatar,
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';

const AttendanceModal = ({
  attendance, days, title,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [checked, setChecked] = useState([]);
  const { getCheckboxProps } = useCheckboxGroup({
    onChange: setChecked,
  });
  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxWidth="-webkit-fit-content" borderRadius="17px" padding="10px">
          <ModalHeader fontSize="30px" paddingBottom={0}>{title}</ModalHeader>
          <ModalBody>
            <Box>
              <Box>
                <Text size="l" color="gray.dark">
                  Hello Paolo, today is 27th of July and the cohort started taking
                  classes on Monday Jun 10th. Please, select your today module.
                </Text>
              </Box>
              <Box>
                <FormControl id="days">
                  <FormLabel color="gray.default">Day</FormLabel>
                  <Select placeholder="Select Day" borderRadius="3px" _placeholder={{ color: 'gray.dark', paddingY: '10px' }}>
                    {days.map((day) => <option key={day.id} value={day.id}>{day.subtitle}</option>)}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box height="1px" bg="gray.light" marginTop="32px" marginBottom="15px" />
            <Box>
              <Flex justifyContent="space-between">
                <Text size="l" color="gray.dark">Select the student in the class</Text>
                <Text size="l" color="gray.dark">11 Student selected</Text>
              </Flex>
              <Grid templateColumns={{ md: 'repeat(4, 4fr)', sm: 'repeat(1, 1fr)' }} gap={6}>
                {attendance.map((item) => {
                  const checkbox = getCheckboxProps({ value: item.name });
                  return (
                    <CheckboxCard key={item.id} {...checkbox}>
                      <Flex justifyContent="space-between">
                        <Flex marginRight="12px">
                          <Avatar name="Dan Abrahmov" width="30px" marginY="auto" marginRight="5px" height="30px" src={item.image} />
                          <Text size="m">{item.name}</Text>
                        </Flex>
                        <Icon icon={checkbox.isChecked ? 'checked' : 'unverified'} width="15px" height="15px" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
                      </Flex>
                    </CheckboxCard>
                  );
                })}
              </Grid>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button fontSize="13px" disabled={checked.length < 1} variant="default" onClick={onClose} rightIcon={<Icon icon="longArrowRight" width="15px" color="white" />}>
              START CLASS DAY
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export const CheckboxCard = (props) => {
  const { getInputProps, getCheckboxProps } = useCheckbox(props);
  const input = getInputProps();
  const checkbox = getCheckboxProps();

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
          bg: 'blue.light',
          color: 'black',
          borderColor: 'blue.default',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  );
};

AttendanceModal.propTypes = {
  title: PropTypes.string,
  attendance: PropTypes.arrayOf(PropTypes.array),
  days: PropTypes.arrayOf(PropTypes.array),
};
AttendanceModal.defaultProps = {
  title: '',
  attendance: [],
  days: [],
};

export default AttendanceModal;
