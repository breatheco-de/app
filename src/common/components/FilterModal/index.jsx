import React, { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
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
  useCheckboxGroup,
  useColorModeValue,
  ModalCloseButton,
  Switch,
} from '@chakra-ui/react';
import Icon from '../Icon';
import Text from '../Text';
import TechnologiesSection from './technologies';
import DifficultySection from './difficulty';

const FilterModal = ({
  title, isModalOpen, onClose, setFilter, contextFilter, technologyTags, difficulties,
}) => {
  const { t } = useTranslation('common');
  const [checkedTechnologies, setCheckedTechnologies] = useState([]);
  const [withVideo, setWithVideo] = useState(false);
  const [show, setShow] = useState(false);
  const [difficultyPosition, setDifficulty] = useState(null);
  const { getCheckboxProps } = useCheckboxGroup({
    onChange: setCheckedTechnologies,
  });

  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const commonBorderColor = useColorModeValue('gray.200', 'gray.900');

  const handleToggle = () => setShow(!show);

  const handleSubmit = () => {
    setFilter({
      technologies: checkedTechnologies,
      difficulty: difficulties[difficultyPosition] || [],
      videoTutorials: withVideo,
    });
  };

  const clearFilters = () => {
    setCheckedTechnologies([]);
    setDifficulty(null);
    setWithVideo(false);
    setFilter({
      technologies: [],
      difficulty: [],
      videoTutorials: false,
    });
  };

  const fLength = checkedTechnologies.length + (difficultyPosition === null ? 0 : 1) + withVideo;

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
          textTransform="uppercase"
          textAlign="center"
          color={commonTextColor}
          paddingBottom={0}
          borderBottom={1}
          borderStyle="solid"
          borderColor={commonBorderColor}
        >
          {title || t('filter')}
        </ModalHeader>
        <ModalCloseButton
          style={{
            top: '27px',
            right: '30px',
          }}
        />
        <ModalBody padding="0 24px">
          <Box>
            {/* <------------------- Technologies section -------------------> */}
            <TechnologiesSection
              show={show}
              title={t('technologies')}
              handleToggle={handleToggle}
              technologyTags={technologyTags}
              commonTextColor={commonTextColor}
              getCheckboxProps={getCheckboxProps}
              commonBorderColor={commonBorderColor}
              checkedTechnologies={checkedTechnologies}
            />

            {/* <------------------- Difficulty section -------------------> */}
            <DifficultySection
              title={t('difficulties')}
              setFilter={setFilter}
              contextFilter={contextFilter}
              setDifficulty={setDifficulty}
              difficulties={difficulties}
              commonTextColor={commonTextColor}
              difficultyPosition={difficultyPosition}
              commonBorderColor={commonBorderColor}
            />

            <Flex flexDirection="row" justifyContent="space-between">
              <Text fontSize="1rem" fontWeight="bold" textTransform="uppercase" color={commonTextColor} padding="20px 0">
                {t('only-video-tutorials')}
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
                  zIndex="10"
                />
                <Switch size="md" zIndex="0" isChecked={withVideo} />
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
            {t('clear-all')}
          </Box>
          <Button
            fontSize="13px"
            textTransform="uppercase"
            variant="default"
            disabled={fLength <= 0}
            onClick={() => handleSubmit()}
            rightIcon={<Icon icon="longArrowRight" width="15px" color={fLength <= 0 ? '#3A3A3A' : '#FFFFFF'} />}
          >
            {t('apply-filters')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

FilterModal.propTypes = {
  title: PropTypes.string,
  setFilter: PropTypes.func.isRequired,
  contextFilter: PropTypes.objectOf(PropTypes.any).isRequired,
  technologyTags: PropTypes.arrayOf(PropTypes.string),
  difficulties: PropTypes.arrayOf(PropTypes.string),
  isModalOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
FilterModal.defaultProps = {
  title: '',
  technologyTags: [],
  difficulties: [],
  isModalOpen: true,
  onClose: () => {},
};

export default FilterModal;
