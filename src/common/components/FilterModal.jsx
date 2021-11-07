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
  useColorModeValue,
  Collapse,
  ModalCloseButton,
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';
import useFilter from '../store/actions/filterAction';

const FilterModal = ({
  title, isModalOpen, onClose, technologyTags, dificulties,
}) => {
  const [checked, setChecked] = useState([]);
  const [show, setShow] = useState(false);
  const { setFilter } = useFilter();
  const [dificultyPosition, setDificulty] = useState(null);
  const { getCheckboxProps } = useCheckboxGroup({
    onChange: setChecked,
  });
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const commonBorderColor = useColorModeValue('gray.200', 'gray.900');

  // console.log('FILTER', filteredBy);
  // console.log('DIFUCULTY_SELECTED', dificultyPosition);
  // console.log('CHECKED_BOX:::', checked);

  const handleToggle = () => setShow(!show);

  const handleSubmit = () => {
    setFilter({ technologies: checked, difficulty: dificulties[dificultyPosition] });
  };
  return (
    <Modal isOpen={isModalOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        maxWidth="100%"
        borderRadius="17px"
        padding="10px"
        bg={useColorModeValue('white', 'featuredDark')}
        margin={{ base: '4% 4% 0 4%', md: '4% 22% 0 22%' }}
      >
        <ModalHeader
          fontSize="xl"
          padding="18px 0"
          textAlign="center"
          color={commonTextColor}
          paddingBottom={0}
          borderBottom={1}
          borderStyle="solid"
          borderColor={commonBorderColor}
        >
          {title}
        </ModalHeader>
        <ModalCloseButton
          style={{
            top: '27px',
            right: '30px',
          }}
        />
        <ModalBody>
          <Box>
            <Flex
              flexDirection="column"
              borderBottom={1}
              borderStyle="solid"
              borderColor={commonBorderColor}
            >
              <Text fontSize="xl" color={commonTextColor} padding="0 0 25px 0">
                TECHNOLOGIES
              </Text>
              <Collapse in={show} startingHeight={200} animateOpacity>
                <Grid
                  gridTemplateColumns="repeat(auto-fill, minmax(10rem, 1fr))"
                  padding="5px"
                  // gridTemplateColumns={{
                  //   base: 'repeat(auto-fill, minmax(15rem, 1fr))',
                  //   md: 'repeat(auto-fill, minmax(20rem, 1fr))',
                  // }}
                  gap={6}
                >
                  {technologyTags.map((technology) => {
                    const checkbox = getCheckboxProps({ value: technology });
                    return (
                      <CheckboxCard style={{ border: '0' }} key={technology} {...checkbox}>
                        <Flex gridGap="10px">
                          <Checkbox borderColor="gray.default" isChecked={checkbox.isChecked} />
                          <Text size="l">{technology}</Text>
                        </Flex>
                      </CheckboxCard>
                    );
                  })}
                </Grid>
              </Collapse>
              {technologyTags.length >= 17 && (
                <Flex width="100%" justifyContent="right">
                  <Box
                    as="button"
                    margin="20px 0"
                    color="blue.default"
                    cursor="pointer"
                    fontSize="14px"
                    onClick={handleToggle}
                  >
                    {`Show ${show ? 'Less' : 'More'}`}
                  </Box>
                </Flex>
              )}
            </Flex>

            <Flex
              flexDirection="column"
              borderBottom={1}
              borderStyle="solid"
              borderColor={commonBorderColor}
              padding="0 0 30px 0"
            >
              <Text fontSize="xl" color={commonTextColor} padding="25px 0">
                DIFFICULTIES
              </Text>
              <Grid gridTemplateColumns="repeat(auto-fill, minmax(10rem, 1fr))" gap={6}>
                {dificulties.map((dificulty, index) => {
                  // const checkbox = getCheckboxProps({ value: dificulty });
                  console.log('checkbox');
                  return (
                    // <CheckboxCard key={dificulty} {...checkbox}>
                    <Flex
                      gridGap="10px"
                      key={dificulty}
                      cursor="pointer"
                      onClick={() => setDificulty(index)}
                    >
                      <Checkbox
                        borderColor="gray.default"
                        isChecked={index === dificultyPosition}
                      />
                      <Text size="md">{dificulty}</Text>
                    </Flex>
                    // </CheckboxCard>
                  );
                })}
              </Grid>
            </Flex>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            fontSize="13px"
            // disabled={checked.length < 1}
            variant="default"
            onClick={() => handleSubmit()}
            rightIcon={<Icon icon="longArrowRight" width="15px" color="white" />}
          >
            APPLY CHANGES
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
  // const { colorMode } = useColorMode();
  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        // borderWidth="1px"
        // borderRadius="md"
        // border="1px solid"
        // borderColor="#A9A9A9"
        _checked={{
          bg: useColorModeValue('blue.light', 'featuredDark'),
          color: useColorModeValue('dark', 'white'),
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
  message: PropTypes.string,
  technologyTags: PropTypes.arrayOf(PropTypes.string),
  dificulties: PropTypes.arrayOf(PropTypes.string),
  days: PropTypes.arrayOf(PropTypes.array),
  isModalOpen: PropTypes.bool,
  onClose: PropTypes.func,
  maxDays: PropTypes.number,
  minDays: PropTypes.number,
  handleChangeDay: PropTypes.func,
};
FilterModal.defaultProps = {
  title: 'FILTER',
  days: [],
  technologyTags: [],
  dificulties: [],
  message: '',
  isModalOpen: true,
  onClose: () => {},
  maxDays: 10,
  minDays: 0,
  handleChangeDay: () => {},
};

export default FilterModal;
