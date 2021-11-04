/* eslint-disable react/jsx-props-no-spreading */
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
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';

const FilterModal = ({
  attendance, title, message, isOpen, onClose, maxDays, minDays, onSubmit, handleChangeDay,
}) => {
  const [checked, setChecked] = useState([]);
  const { getCheckboxProps } = useCheckboxGroup({
    onChange: setChecked,
  });
  const { colorMode } = useColorMode();
  return (
    <>
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
                    defaultValue={0}
                    max={maxDays}
                    min={minDays}
                    keepWithinRange={false}
                    clampValueOnBlur={false}
                    onChange={handleChangeDay}
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
                {attendance.map((item) => {
                  const checkbox = getCheckboxProps({ value: JSON.stringify(item) });
                  return (
                    <CheckboxCard key={item.id} {...checkbox}>
                      <Flex justifyContent="space-between">
                        <Flex marginRight="12px">
                          <Avatar
                            name="Dan Abrahmov"
                            width="30px"
                            marginY="auto"
                            marginRight="5px"
                            height="30px"
                            src={item.image}
                          />
                          <Text size="md">{item.name}</Text>
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
              onClick={(e) => onSubmit(e, { checked })}
              rightIcon={<Icon icon="longArrowRight" width="15px" color="white" />}
            >
              START CLASS DAY
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
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

FilterModal.propTypes = {
  title: PropTypes.string,
  attendance: PropTypes.arrayOf(PropTypes.array),
  message: PropTypes.string,
  days: PropTypes.arrayOf(PropTypes.array),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  maxDays: PropTypes.number,
  minDays: PropTypes.number,
  onSubmit: PropTypes.func,
  handleChangeDay: PropTypes.func,
};
FilterModal.defaultProps = {
  title: '',
  attendance: [],
  days: [],
  message: '',
  isOpen: true,
  onClose: () => { },
  onSubmit: () => { },
  maxDays: 10,
  minDays: 0,
  handleChangeDay: () => {

  },
};

export default FilterModal;
