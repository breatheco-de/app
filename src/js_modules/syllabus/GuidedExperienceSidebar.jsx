/* eslint-disable no-unused-vars */
import {
  Box,
  Button,
  Img,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../../common/components/Heading';
import { Config, getSlideProps } from './config';
import NextChakraLink from '../../common/components/NextChakraLink';
import Timeline from '../../common/components/Timeline';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useStyle from '../../common/hooks/useStyle';

function GuidedExperienceSidebar({ filteredEmptyModules, onClickAssignment, isOpen, onToggle, currentModuleIndex }) {
  console.log('currentModuleIndex');
  console.log(currentModuleIndex);
  const { t } = useTranslation('syllabus');
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const Open = !isOpen;
  const slide = getSlideProps(Open);
  const {
    themeColor, commonBorderColor, currentThemeValue,
  } = Config();
  const { hexColor } = useStyle();

  return (
    <>
      <Box position={{ base: 'fixed', lg: Open ? 'initial' : 'fixed' }} display={Open ? 'initial' : 'none'} flex="0 0 auto" minWidth="290px" width={{ base: '74.6vw', md: '46.6vw', lg: '26.6vw' }} zIndex={{ base: 100, lg: Open ? 10 : 0 }}>
        <Box style={slide}>
          <Box padding="24px 16px" background={hexColor.blueDefault}>
            <NextChakraLink href="/choose-program" fontSize="17px" color="white" display="flex" gap="10px" alignItems="center">
              <Icon style={{ transform: 'rotate(180deg)' }} icon="logout" color="white" />
              {t('dashboard:back-to-dashboard')}
            </NextChakraLink>
          </Box>
          <Box
            padding="1.5rem"
            // position="sticky"
            display="flex"
            flexDirection="column"
            gridGap="6px"
            top={0}
            zIndex={200}
            bg={themeColor}
          >
            {cohortSession?.syllabus_version && (
              <Box display="flex" alignItems="center" gap="10px">
                {cohortSession?.syllabus_version?.logo && (
                  <Img src={cohortSession.syllabus_version?.logo} width="44px" height="44px" />
                )}
                <Heading size="xsm">{cohortSession.syllabus_version?.name}</Heading>
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
              <Icon width="14px" height="14px" icon={Open ? 'close' : 'list'} />
              {t(Open ? 'hide-menu' : 'show-menu')}
            </Button>
          </Box>

          <Box
            className={`horizontal-sroll ${currentThemeValue}`}
            height="100%"
            style={{
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            {filteredEmptyModules.length > 0 && (
              <Accordion defaultIndex={[currentModuleIndex]} allowToggle allowMultiple>
                {filteredEmptyModules.map((section) => {
                  const currentAssignments = section.filteredModules;
                  return (
                    <AccordionItem key={`${section.title}-${section.id}`} border="none">
                      <Box
                        padding={{ base: '1rem', md: '1.5rem' }}
                        borderBottom={1}
                        borderStyle="solid"
                        borderColor={commonBorderColor}
                      >

                        <AccordionButton justifyContent="space-between">
                          {section.label}
                          <AccordionIcon color={hexColor.blueDefault} />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Timeline
                            key={section.id}
                            assignments={currentAssignments}
                            technologies={section.technologies || []}
                            onClickAssignment={onClickAssignment}
                          />
                        </AccordionPanel>
                      </Box>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

GuidedExperienceSidebar.propTypes = {
  filteredEmptyModules: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  onClickAssignment: PropTypes.func,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  currentModuleIndex: PropTypes.number,
};
GuidedExperienceSidebar.defaultProps = {
  filteredEmptyModules: [],
  onClickAssignment: () => {},
  isOpen: false,
  onToggle: () => {},
  currentModuleIndex: null,
};

export default GuidedExperienceSidebar;
