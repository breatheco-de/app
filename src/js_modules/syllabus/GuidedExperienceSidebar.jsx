/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Img,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../../common/components/Heading';
import { Config, getSlideProps } from './config';
import Timeline from '../../common/components/Timeline';
import Icon from '../../common/components/Icon';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useStyle from '../../common/hooks/useStyle';

function GuidedExperienceSidebar({ filteredEmptyModules, onClickAssignment, isOpen, onToggle, currentModuleIndex, handleStartDay }) {
  const { t } = useTranslation('syllabus');
  const sidebarRef = useRef(null);
  const [moduleLoading, setModuleLoading] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(currentModuleIndex);
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const Open = !isOpen;
  const slide = getSlideProps(Open);
  const {
    themeColor, commonBorderColor, currentThemeValue,
  } = Config();
  const { hexColor } = useStyle();

  useEffect(() => {
    setExpandedIndex(currentModuleIndex);
  }, [currentModuleIndex]);

  const onExpand = (index) => {
    setExpandedIndex(index);
    if (index > -1) {
      const section = filteredEmptyModules[index];
      const id = `${section.label}-${section.id}`;
      const element = document.getElementById(id);

      setTimeout(() => {
        const elementRect = element.getBoundingClientRect();
        const sidebarRect = sidebarRef.current.getBoundingClientRect();

        const scrollTopPosition = elementRect.top - sidebarRect.top + sidebarRef.current.scrollTop;
        sidebarRef.current.scrollTo({
          top: scrollTopPosition,
          behavior: 'smooth',
        });
      }, 500);
    }
  };

  return (
    <>
      <IconButton
        style={{ zIndex: 20 }}
        aria-label="Open Timeline"
        variant="default"
        display={Open ? 'none' : 'initial'}
        onClick={onToggle}
        width="17px"
        height="36px"
        minW={0}
        position="fixed"
        top="50%"
        left="0"
        padding={0}
        icon={(
          <ChevronRightIcon
            width="17px"
            height="36px"
          />
        )}
      />
      <Box position={{ base: 'fixed', lg: Open ? 'initial' : 'fixed' }} display={Open ? 'initial' : 'none'} flex="0 0 auto" minWidth="290px" width={{ base: '74.6vw', md: '46.6vw', lg: '26.6vw' }} zIndex={{ base: 100, lg: Open ? 10 : 0 }}>
        <Box style={slide}>
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
            <IconButton
              aria-label="Close Timeline"
              style={{ zIndex: 20 }}
              variant="default"
              onClick={onToggle}
              width="17px"
              height="36px"
              minW={0}
              position="absolute"
              transition={Open ? 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'}
              transitionProperty="margin"
              transitionDuration={Open ? '225ms' : '195ms'}
              transitionTimingFunction={Open ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.6, 1)'}
              top="50%"
              right="-20px"
              padding={0}
              icon={(
                <ChevronLeftIcon
                  width="17px"
                  height="36px"
                />
              )}
              marginBottom="1rem"
            />
            {/* <Button
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
            </Button> */}
          </Box>

          <Box
            className={`horizontal-sroll ${currentThemeValue}`}
            ref={sidebarRef}
            height="100%"
            style={{
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            {filteredEmptyModules.length > 0 ? (
              <Accordion index={expandedIndex} onChange={onExpand} defaultIndex={[currentModuleIndex]} allowToggle allowMultiple>
                {filteredEmptyModules.map((section) => {
                  const currentAssignments = section.filteredModules;
                  return (
                    <AccordionItem isDisabled={moduleLoading} key={`${section.label}-${section.id}`} border="none">
                      <Box
                        padding={{ base: '1rem', md: '1.5rem' }}
                        borderBottom={1}
                        borderStyle="solid"
                        borderColor={commonBorderColor}
                        id={`${section.label}-${section.id}`}
                      >

                        <AccordionButton
                          justifyContent="space-between"
                          onClick={async () => {
                            try {
                              if (currentAssignments.length === 0) {
                                setModuleLoading(section.id);
                                await handleStartDay(section, true);
                                setModuleLoading(null);
                              }
                            } catch (e) {
                              console.log(e);
                              setModuleLoading(null);
                            }
                          }}
                        >
                          {section.label}
                          {moduleLoading === section.id ? (
                            <Spinner height="20px" width="20px" color={hexColor.blueDefault} />
                          ) : (
                            <AccordionIcon color={hexColor.blueDefault} />
                          )}
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
            ) : (
              <Box width="20px" height="20px" margin="10px auto">
                <Spinner color={hexColor.blueDefault} />
              </Box>
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
  handleStartDay: PropTypes.func.isRequired,
};
GuidedExperienceSidebar.defaultProps = {
  filteredEmptyModules: [],
  onClickAssignment: () => {},
  isOpen: false,
  onToggle: () => {},
  currentModuleIndex: null,
};

export default GuidedExperienceSidebar;
