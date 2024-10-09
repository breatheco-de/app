/* eslint-disable no-unused-vars */
import { useState } from 'react';
import {
  Box,
  Button,
  Img,
  Spinner,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../../common/components/Heading';
import { Config, getSlideProps } from './config';
import Timeline from '../../common/components/Timeline';
import NextChakraLink from '../../common/components/NextChakraLink';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useStyle from '../../common/hooks/useStyle';

function GuidedExperienceSidebar({ onClickAssignment, isOpen, onToggle, currentModuleIndex, handleStartDay, grantSyllabusAccess }) {
  const { t } = useTranslation('syllabus');
  const [moduleLoading, setModuleLoading] = useState(false);
  const { state } = useCohortHandler();
  const { cohortSession, sortedAssignments } = state;
  const background = useColorModeValue('#E4E8EE', '#283340');

  const Open = !isOpen;
  const { height, display, position, zIndex, ...slideStyles } = getSlideProps(Open);
  const {
    currentThemeValue,
  } = Config();
  const { hexColor } = useStyle();

  const currentModule = sortedAssignments[currentModuleIndex];
  const nextModule = sortedAssignments[currentModuleIndex + 1];

  const openNextModule = async () => {
    try {
      const nextAssignments = nextModule.filteredModules;
      if (nextAssignments.length === 0) {
        setModuleLoading(true);
        await handleStartDay(nextModule, true);
        setModuleLoading(false);
      }
      const assignment = nextModule.modules[0];
      onClickAssignment(null, assignment);
    } catch (e) {
      console.log(e);
      setModuleLoading(false);
    }
  };

  return (
    <>
      <Box
        position={{ base: 'fixed', lg: Open ? 'initial' : 'fixed' }}
        display={{ base: Open ? 'initial' : 'none', lg: Open ? 'flex' : 'none' }}
        flex="0 0 auto"
        minWidth="290px"
        width={{ base: '74.6vw', md: '46.6vw', lg: '26.6vw' }}
        zIndex={{ base: 100, lg: Open ? 10 : 0 }}
        maxWidth="240px"
        maxHeight={{ base: 'none', lg: '93vh' }}
        height={{ base: '100vh', lg: 'auto' }}
        style={{ ...slideStyles, background }}
      >
        <Box
          padding="16px"
          display="flex"
          flexDirection="column"
          gridGap="6px"
          top={0}
          zIndex={200}
        >
          {cohortSession?.syllabus_version && (
            <Box display="flex" alignItems="center" gap="10px">
              {cohortSession?.syllabus_version?.logo && (
              <Img borderRadius="full" src={cohortSession.syllabus_version?.logo} width="29px" height="29px" />
              )}
              <Heading size="18px">{cohortSession.syllabus_version?.name}</Heading>
            </Box>
          )}
          <Button
            aria-label="Close Timeline"
            gap="10px"
            variant="ghost"
            onClick={onToggle}
            color={hexColor.blueDefault}
            display={{ base: 'flex', lg: 'none' }}
            width="fit-content"
          >
            <Icon style={Open && { transform: 'rotate(180deg)' }} width="14px" height="14px" icon={Open ? 'arrowRight' : 'list'} />
            {t(Open ? 'hide-menu' : 'show-menu')}
          </Button>
        </Box>

        <Box
          className={`horizontal-sroll ${currentThemeValue}`}
          style={{
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
          maxHeight={{ base: '80%', lg: 'none' }}
          padding="15px"
        >
          {currentModule && grantSyllabusAccess ? (
            <>
              <Box mb="8px" display="flex" gap="10px" alignItems="center">
                <NextChakraLink variant="ghost" href={cohortSession.selectedProgramSlug}>
                  <Icon style={{ display: 'inline' }} icon="arrowLeft" width="19px" height="10px" />
                  {'  '}
                  {currentModule.label && (
                    <Heading display="inline" size="18px" fontWeight="400">
                      {currentModule.label.toUpperCase()}
                    </Heading>
                  )}
                </NextChakraLink>
              </Box>
              <Timeline
                variant="guided-experience"
                assignments={currentModule.filteredModules}
                technologies={currentModule.technologies || []}
                onClickAssignment={onClickAssignment}
              />
              <Divider borderColor="#D3DBE9" />
              {nextModule && (
              <Button
                variant="ghost"
                cursor="pointer"
                display="flex"
                mt="8px"
                alignItems="center"
                width="100%"
                justifyContent="space-between"
                onClick={openNextModule}
                textAlign="left"
                paddingY="5px"
                height="fit-content"
                lineHeight="1.7"
                isLoading={moduleLoading}
              >
                <span>
                  <Text as="span">
                    {t('start-next')}
                  </Text>
                  <br />
                  <Text as="span" color={hexColor.blueDefault} mt="8px">
                    {nextModule.label}
                  </Text>
                </span>
                <Icon icon="arrowLeft" style={{ transform: 'rotate(180deg)' }} color={hexColor.blueDefault} />
              </Button>
              )}
            </>
          ) : (
            <Box width="20px" height="20px" margin="10px auto">
              <Spinner color={hexColor.blueDefault} />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

GuidedExperienceSidebar.propTypes = {
  onClickAssignment: PropTypes.func,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  currentModuleIndex: PropTypes.number,
  handleStartDay: PropTypes.func.isRequired,
  grantSyllabusAccess: PropTypes.bool.isRequired,
};
GuidedExperienceSidebar.defaultProps = {
  onClickAssignment: () => {},
  isOpen: false,
  onToggle: () => {},
  currentModuleIndex: null,
};

export default GuidedExperienceSidebar;
