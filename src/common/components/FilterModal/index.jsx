import React, { useState, useEffect } from 'react';
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
  ModalCloseButton,
  Switch,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Icon from '../Icon';
import Text from '../Text';
import { isWindow } from '../../../utils';
import TechnologiesSection from './technologies';
import DifficultySection from './difficulty';
import useStyle from '../../hooks/useStyle';

function FilterModal({
  title, isModalOpen, onClose, setFilter, contextFilter, technologyTags, difficulties,
}) {
  const { t } = useTranslation('common');
  const [checkedTechnologies, setCheckedTechnologies] = useState([]);
  const [withVideo, setWithVideo] = useState(false);
  const [show, setShow] = useState(false);
  const [difficultyPosition, setDifficultyPosition] = useState(null);
  const router = useRouter();
  const { lightColor, modal, borderColor } = useStyle();

  const { getCheckboxProps } = useCheckboxGroup({
    onChange: setCheckedTechnologies,
  });
  const technologiesQuery = router.query.techs;
  const withVideoQuery = router.query.withVideo;

  useEffect(() => {
    if (technologiesQuery) {
      setCheckedTechnologies(technologiesQuery.split(','));
    }
  }, [router.query.techs]);

  useEffect(() => {
    if (withVideoQuery) {
      setWithVideo(withVideoQuery === 'true');
    }
  }, [router.query.withVideo]);

  // const getDifficultyPosition = (difficulty) => {
  //   if (difficulty === 'beginner' || difficulty === 'easy') {
  //     return 0;
  //   }
  //   if (difficulty === 'intermediate') {
  //     return 1;
  //   }
  //   if (difficulty === 'hard') {
  //     return 2;
  //   }
  //   return 0;
  // };

  const handleToggle = () => setShow(!show);

  const newDifficulties = ['junior', 'mid-level', 'senior'];
  const currentDifficultyPosition = router.query.difficulty || difficultyPosition;

  const handleSubmit = () => {
    const difficulty = newDifficulties[difficultyPosition] || '';
    const techs = checkedTechnologies.join(',') || '';
    onClose();
    router.push({
      query: {
        ...router.query,
        difficulty,
        techs,
        withVideo,
      },
    });
    setFilter({
      technologies: checkedTechnologies,
      // difficulty: router.query.difficulty,
      videoTutorials: withVideo,
    });
  };

  const clearFilters = () => {
    router.push({
      query: null,
    });
    setCheckedTechnologies([]);
    setDifficultyPosition(null);
    setWithVideo(null);
    setFilter({
      technologies: [],
      difficulty: [],
      videoTutorials: false,
    });
  };

  const fLength = checkedTechnologies.length
    + (currentDifficultyPosition === null ? 0 : 1)
    + withVideo;

  return (
    <Modal isOpen={isModalOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
        maxWidth="700px"
        borderRadius="17px"
        padding="10px"
        bg={modal.background}
        margin={{ base: '3% 4% 0 4%', md: '3% 22% 0 22%' }}
      >
        <ModalHeader
          fontSize="1rem"
          padding="18px 0"
          textTransform="uppercase"
          textAlign="center"
          p="6px 0 10px 0"
          color={lightColor}
          paddingBottom={0}
          borderBottom={1}
          borderStyle="solid"
          borderColor={borderColor}
        >
          {title || t('filter')}
        </ModalHeader>
        <ModalCloseButton
          style={{
            top: '14px',
            right: '30px',
          }}
        />
        <ModalBody padding="0 24px">
          <Box>
            {/* <------------------- Technologies section -------------------> */}
            <TechnologiesSection
              show={show}
              title={t('technologies')}
              t={t}
              handleToggle={handleToggle}
              technologyTags={technologyTags}
              commonTextColor={lightColor}
              getCheckboxProps={getCheckboxProps}
              commonBorderColor={borderColor}
              checkedTechnologies={checkedTechnologies}
            />

            {/* <------------------- Difficulty section -------------------> */}
            {isWindow
            && !window.location.pathname.includes('/lessons')
            && !window.location.pathname.includes('/how-to')
            && (
              <DifficultySection
                t={t}
                title={t('difficulties')}
                setFilter={setFilter}
                contextFilter={contextFilter}
                setDifficultyPosition={setDifficultyPosition}
                difficulties={difficulties}
                commonTextColor={lightColor}
                difficultyPosition={difficultyPosition}
                commonBorderColor={borderColor}
              />
            )}

            <Flex flexDirection="row" justifyContent="space-between">
              <Text fontSize="1rem" fontWeight="bold" textTransform="uppercase" color={lightColor} padding="20px 0">
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
          borderColor={borderColor}
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
            isDisabled={fLength <= 0}
            onClick={() => handleSubmit()}
            rightIcon={<Icon icon="longArrowRight" width="15px" color={fLength <= 0 ? '#3A3A3A' : '#FFFFFF'} />}
          >
            {t('apply-filters')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

FilterModal.propTypes = {
  title: PropTypes.string,
  setFilter: PropTypes.func.isRequired,
  contextFilter: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  technologyTags: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
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
