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
  Switch,
} from '@chakra-ui/react';
import Icon from './Icon';
import Text from './Text';
import useFilter from '../store/actions/filterAction';

const FilterModal = ({
  title, isModalOpen, onClose, technologyTags, dificulties,
}) => {
  const [checked, setChecked] = useState([]);
  const [withVideo, setWithVideo] = useState(false);
  const [show, setShow] = useState(false);
  const { setFilter } = useFilter();
  const [dificultyPosition, setDificulty] = useState(null);
  const { getCheckboxProps } = useCheckboxGroup({
    onChange: setChecked,
  });
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const commonBorderColor = useColorModeValue('gray.200', 'gray.900');

  const handleToggle = () => setShow(!show);

  const handleSubmit = () => {
    setFilter({
      technologies: checked,
      difficulty: dificulties[dificultyPosition],
      videoTutorials: withVideo,
    });
  };

  const clearFilters = () => {
    setChecked([]);
    setDificulty(null);
    setWithVideo(false);
  };

  return (
    <Modal isOpen={isModalOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        maxWidth="100%"
        borderRadius="17px"
        padding="10px"
        bg={useColorModeValue('white', 'featuredDark')}
        margin={{ base: '3% 4% 0 4%', md: '3% 22% 0 22%' }}
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
            {/* <------------------- Technologies section -------------------> */}
            <Flex
              flexDirection="column"
              borderBottom={1}
              borderStyle="solid"
              borderColor={commonBorderColor}
            >
              <Text size="l" color={commonTextColor} padding="0 0 25px 0">
                TECHNOLOGIES
              </Text>
              <Collapse in={show} startingHeight={200} animateOpacity>
                <Grid
                  gridTemplateColumns="repeat(auto-fill, minmax(10rem, 1fr))"
                  padding="5px"
                  gap={6}
                >
                  {technologyTags.map((technology) => {
                    const checkbox = getCheckboxProps({
                      value: technology,
                      checked: checked.length === 0 ? false : checked.includes(technology),
                      isChecked: false,
                    });
                    return (
                      <CheckboxCard style={{ border: '0' }} key={technology} {...checkbox}>
                        <Flex gridGap="10px">
                          <Checkbox
                            {...checkbox}
                            borderColor="gray.default"
                            isChecked={checkbox.checked}
                          />
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

            {/* <------------------- Difficulty section -------------------> */}
            <Flex
              flexDirection="column"
              borderBottom={1}
              borderStyle="solid"
              borderColor={commonBorderColor}
              padding="0 0 30px 0"
            >
              <Text size="l" color={commonTextColor} padding="25px 0">
                DIFFICULTIES
              </Text>
              <Grid gridTemplateColumns="repeat(auto-fill, minmax(10rem, 1fr))" gap={6}>
                {dificulties.map((dificulty, index) => (
                  <Flex
                    gridGap="10px"
                    key={dificulty}
                    cursor="pointer"
                    onClick={() => setDificulty(index)}
                  >
                    <Checkbox borderColor="gray.default" isChecked={index === dificultyPosition} />
                    <Text size="md">{dificulty}</Text>
                  </Flex>
                ))}
              </Grid>
              {typeof dificultyPosition === 'number' && dificultyPosition !== null && (
                <Flex width="100%" justifyContent="right">
                  <Box
                    as="button"
                    margin="20px 0"
                    color="blue.default"
                    cursor="pointer"
                    fontSize="14px"
                    onClick={() => setDificulty(null)}
                  >
                    Remove difficulty
                  </Box>
                </Flex>
              )}
            </Flex>

            <Flex flexDirection="row" padding="0 0 30px 0" justifyContent="space-between">
              <Text size="l" textTransform="uppercase" color={commonTextColor} padding="25px 0">
                Only with video tutorials
              </Text>

              <Box
                as="button"
                margin="20px 0"
                color="blue.default"
                cursor="pointer"
                fontSize="14px"
              >
                <Box
                  as="span"
                  onClick={() => setWithVideo(!withVideo)}
                  width="40px"
                  position="absolute"
                  height="26px"
                />
                <Switch size="md" isChecked={withVideo} isReadOnly />
              </Box>
            </Flex>
          </Box>
        </ModalBody>
        <ModalFooter
          borderTop={1}
          borderStyle="solid"
          justifyContent="space-between"
          padding="0 1rem"
          borderColor={commonBorderColor}
        >
          <Box
            as="button"
            margin="20px 0"
            color="blue.default"
            cursor="pointer"
            fontSize="15px"
            onClick={() => clearFilters()}
          >
            Clear All
          </Box>
          <Button
            fontSize="13px"
            // disabled={
            //   checked.length + (dificulties[dificultyPosition] === undefined ? 0 : 1) + withVideo
            //   <= 0
            // }
            textTransform="uppercase"
            variant="default"
            onClick={() => handleSubmit()}
            rightIcon={<Icon icon="longArrowRight" width="15px" color="white" />}
          >
            Filter projects
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const CheckboxCard = (props) => {
  const { children } = props;
  const { getInputProps } = useCheckbox(props);
  const input = getInputProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        cursor="pointer"
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
