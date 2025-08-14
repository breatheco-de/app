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
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { languageFix } from '../../utils';
import { getSlideProps } from './config';
import Heading from '../Heading';
import Timeline from '../Timeline';
import NextChakraLink from '../NextChakraLink';
import Text from '../Text';
import Icon from '../Icon';
import useCohortHandler from '../../hooks/useCohortHandler';
import useStyle from '../../hooks/useStyle';
import useAuth from '../../hooks/useAuth';

function GuidedExperienceSidebar({ onClickAssignment, isOpen, onToggle, currentModuleIndex, handleStartDay, grantSyllabusAccess }) {
  const router = useRouter();
  const { cohorts } = useAuth();
  const { mainCohortSlug } = router.query;
  const { t, lang } = useTranslation('syllabus');
  const [moduleLoading, setModuleLoading] = useState(false);
  const { cohortSession, sortedAssignments } = useCohortHandler();
  const { hexColor, colorMode, backgroundColor, backgroundColor4, fontColor2 } = useStyle();
  const background = useColorModeValue('#E4E8EE', '#283340');

  const { display, zIndex, ...slideStyles } = getSlideProps(isOpen);

  const currentModule = sortedAssignments[currentModuleIndex];
  const nextModule = sortedAssignments[currentModuleIndex + 1];
  const prevModule = sortedAssignments[currentModuleIndex - 1];

  const openNextModule = async () => {
    try {
      setModuleLoading(true);
      // Verificar si hay nuevas actividades en el siguiente módulo
      const hasNewActivities = nextModule?.content?.length > (nextModule?.filteredContent?.length || 0);
      if (hasNewActivities) {
        await handleStartDay(nextModule, true);
      }
      const assignment = nextModule.content[0];
      onClickAssignment(null, assignment);
    } catch (e) {
      console.log(e);
    } finally {
      setModuleLoading(false);
    }
  };

  const openPrevModule = async () => {
    try {
      setModuleLoading(true);
      // Verificar si hay nuevas actividades en el módulo anterior
      const hasNewActivities = prevModule?.content?.length > (prevModule?.filteredContent?.length || 0);
      if (hasNewActivities) {
        await handleStartDay(prevModule, true);
      }
      const assignment = prevModule.content[0];
      onClickAssignment(null, assignment);
    } catch (e) {
      console.log(e);
    } finally {
      setModuleLoading(false);
    }
  };

  const getCohortDashboardUrl = () => {
    if (!mainCohortSlug) return cohortSession.selectedProgramSlug;

    const mainCohort = cohorts?.find(({ slug }) => slug === mainCohortSlug);

    return mainCohort?.selectedProgramSlug;
  };

  return (
    <>
      <Box
        position={{ base: 'fixed', lg: isOpen ? 'initial' : 'fixed' }}
        display={isOpen ? 'flex' : 'none'}
        flex="0 0 auto"
        minWidth="290px"
        width={{ base: '74.6vw', md: '46.6vw', lg: '26.6vw' }}
        zIndex={{ base: 100, lg: isOpen ? 10 : 0 }}
        maxWidth="240px"
        maxHeight={{ base: 'none', lg: '93vh' }}
        height={{ base: '100vh', lg: 'auto' }}
        style={{ ...slideStyles, background }}
      >
        <Box display="flex" flexDirection="column" gap="8px">
          {cohortSession?.syllabus_version && (
            <Box padding="16px" background={backgroundColor4} display="flex" flexDirection="column" gap="16px">
              <NextChakraLink width="fit-content" variant="ghost" display="flex" gap="10px" href={getCohortDashboardUrl()}>
                <Icon icon="layout" width="19px" height="20px" />
                <Heading display="inline" size="18px" fontWeight="400">
                  {t('back-to-program')}
                </Heading>
              </NextChakraLink>
              <Box display="flex" alignItems="center" gap="10px">
                {cohortSession?.syllabus_version?.logo && (
                  <Img borderRadius="full" src={cohortSession.syllabus_version?.logo} width="29px" height="29px" />
                )}
                <Heading size="18px">{cohortSession.syllabus_version?.name}</Heading>
              </Box>
            </Box>
          )}

          <Button
            size="sm"
            aria-label={t(isOpen ? 'hide-menu' : 'show-menu')}
            gap="10px"
            fontSize="12px"
            fontWeight="500"
            borderRadius="4px"
            background={backgroundColor}
            color={hexColor.blueDefault}
            onClick={onToggle}
            display={{ base: 'flex', lg: 'none' }}
            width="fit-content"
            marginLeft="16px"
          >
            <Icon style={isOpen && { transform: 'rotate(180deg)' }} width="14px" height="14px" icon={isOpen ? 'arrowRight' : 'list'} />
            {t(isOpen ? 'hide-menu' : 'show-menu')}
          </Button>
          {prevModule && (
            <Box paddingX="15px">
              <Button
                variant="ghost"
                cursor="pointer"
                display="flex"
                alignItems="center"
                width="100%"
                justifyContent="flex-start"
                gap="10px"
                onClick={openPrevModule}
                textAlign="left"
                paddingY="5px"
                height="fit-content"
                lineHeight="1.7"
                isDisabled={moduleLoading}
                whiteSpace="normal"
              >
                <Icon icon="arrowLeft" color={hexColor.black} />
                <span>
                  <Text as="span" color={fontColor2}>
                    {t('back-to-previous')}
                  </Text>
                </span>
              </Button>
              <Divider mt="5px" borderColor="#D3DBE9" />
            </Box>
          )}
        </Box>

        <Box
          className={`horizontal-sroll ${colorMode}`}
          style={{
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
          maxHeight={{ base: '80%', lg: 'none' }}
          padding="15px"
          flexGrow="1"
          display="flex"
          flexDir="column"
        >
          {currentModule && grantSyllabusAccess ? (
            <>
              {currentModule.label && (
                <Heading mb="16px" size="18px" fontWeight="400">
                  {languageFix(currentModule.label, lang).toUpperCase()}
                </Heading>
              )}
              <Timeline
                variant="guided-experience"
                assignments={currentModule.filteredContent}
                technologies={currentModule.technologies || []}
                onClickAssignment={onClickAssignment}
                flex="1"
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
                    <Text as="span" color={hexColor.blueDefault} mt="8px" style={{ textWrap: 'wrap' }}>
                      {languageFix(nextModule.label, lang)}
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
  onClickAssignment: () => { },
  isOpen: false,
  onToggle: () => { },
  currentModuleIndex: null,
};

export default GuidedExperienceSidebar;
