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
  Flex,
  Grid,
  useCheckbox,
  useCheckboxGroup,
  Checkbox,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';

const FilterModal = ({
  attendance, title, isOpen, onClose, onSubmit, technologyTags,
}) => {
  const [checked, setChecked] = useState([]);
  const { getCheckboxProps } = useCheckboxGroup({
    onChange: setChecked,
  });
  // const { colorMode } = useColorMode();
  console.log('technologyTags', technologyTags);
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          maxWidth="-webkit-fit-content"
          borderRadius="17px"
          padding="10px"
          bg={useColorModeValue('white', 'featuredDark')}
          margin={{ base: '4% 4% 0 4%', md: '4% 22% 0 22%' }}
        >
          <ModalHeader fontSize="30px" paddingBottom={0}>
            {title}
          </ModalHeader>
          <ModalBody>
            <Box>
              <Grid templateColumns={{ md: 'repeat(4, 4fr)', sm: 'repeat(1, 1fr)' }} gap={6}>
                {technologyTags.map((technology) => {
                  const checkbox = getCheckboxProps({ value: JSON.stringify(technology) });
                  return (
                    <CheckboxCard key={technology} {...checkbox}>
                      <Flex gridGap="10px">
                        <Checkbox isChecked={checkbox.isChecked} />
                        <Text size="md">{technology}</Text>
                        {/* <Icon
                          icon={checkbox.isChecked ? 'checked' : 'unverified'}
                          width="15px"
                          height="15px"
                          style={{ marginTop: 'auto', marginBottom: 'auto' }}
                        /> */}
                      </Flex>
                    </CheckboxCard>
                  );
                })}
              </Grid>
              <Grid templateColumns={{ md: 'repeat(4, 4fr)', sm: 'repeat(1, 1fr)' }} gap={6}>
                {attendance.map((item) => {
                  const checkbox = getCheckboxProps({ value: JSON.stringify(item) });
                  return (
                    <CheckboxCard key={item.id} {...checkbox}>
                      <Flex gridGap="10px">
                        <Checkbox isChecked={checkbox.isChecked} />
                        <Text size="md">{item.name}</Text>
                        {/* <Icon
                          icon={checkbox.isChecked ? 'checked' : 'unverified'}
                          width="15px"
                          height="15px"
                          style={{ marginTop: 'auto', marginBottom: 'auto' }}
                        /> */}
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
              onClick={(e) => onSubmit(e, console.log({ checked }))}
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
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

FilterModal.propTypes = {
  title: PropTypes.string,
  attendance: PropTypes.arrayOf(PropTypes.object),
  message: PropTypes.string,
  technologyTags: PropTypes.arrayOf(PropTypes.string),
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
  attendance: [
    {
      id: 1,
      active: true,
      image: 'https://bit.ly/kent-c-dodds',
      name: 'Jhon benavides',
    },
    {
      id: 2,
      active: false,
      image: 'https://bit.ly/ryan-florence',
      name: 'Alex door',
    },
    {
      id: 3,
      active: false,
      image: 'https://bit.ly/sage-adebayo',
      name: 'Jeff toreto',
    },
    {
      id: 4,
      active: true,
      image: 'https://bit.ly/code-beast',
      name: 'Doe philips',
    },
    {
      id: 5,
      active: false,
      image: 'https://bit.ly/prosper-baba',
      name: 'Harry smith',
    },
  ],
  days: [],
  technologyTags: [],
  message: '',
  isOpen: true,
  onClose: () => {},
  onSubmit: () => {},
  maxDays: 10,
  minDays: 0,
  handleChangeDay: () => {},
};

export default FilterModal;
