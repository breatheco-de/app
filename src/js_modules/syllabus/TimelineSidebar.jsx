import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box, Button, Checkbox, IconButton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../../common/components/Heading';
import { Config, getSlideProps } from './config';
import Timeline from '../../common/components/Timeline';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useStyle from '../../common/hooks/useStyle';

function TimelineSidebar({
  onClickAssignment, showPendingTasks, setShowPendingTasks,
  isOpen, onToggle, isStudent, teacherInstructions,
}) {
  const { t } = useTranslation('syllabus');
  const { cohortSession, sortedAssignments } = useCohortHandler();
  const Open = !isOpen;
  const slide = getSlideProps(Open);
  const {
    themeColor, commonBorderColor, currentThemeValue, colorLight,
  } = Config();
  const { fontColor3, featuredCard } = useStyle();
  const { existContentToShow = false } = teacherInstructions;

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
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
          >
            {cohortSession?.syllabus_version && (
              <Heading size="xsm">{cohortSession?.syllabus_version?.name}</Heading>
            )}
            <Checkbox mb="-14px" onChange={(e) => setShowPendingTasks(e.target.checked)} color={colorLight}>
              {t('dashboard:modules.show-pending-tasks')}
            </Checkbox>
          </Box>

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

          <Box
            className={`horizontal-sroll ${currentThemeValue}`}
            height="100%"
            style={{
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            {!isStudent && (
              <Box padding={{ base: '1rem 1rem 0 1rem', md: '1.5rem 1.5rem 0 1.5rem' }}>
                {existContentToShow ? (
                  <Button
                    onClick={() => {
                      teacherInstructions.actionHandler();
                    }}
                    height="auto"
                    width="100%"
                    variant="unstyled"
                    background={featuredCard.yellow.featured}
                    padding="8px"
                    gap="8px"
                    borderRadius="8px"
                    display="flex"
                    alignItems="center"
                    aria-label="Open Teacher Instructions"
                  >
                    <Box background="yellow.default" padding="10px" borderRadius="full">
                      <Icon icon="teacher" color="white" />
                    </Box>
                    <Text size="l" fontWeight="700" color={fontColor3}>
                      {t('teacherSidebar.open-instructions')}
                    </Text>
                  </Button>
                ) : (
                  <Box padding="15px" background="yellow.light" borderRadius="4px">
                    <Text size="md" fontWeight="700">
                      {t('teacherSidebar.no-teacher-instructions-found')}
                    </Text>
                  </Box>
                )}
              </Box>
            )}
            {sortedAssignments.length > 0 && sortedAssignments.map((section) => {
              const currentAssignments = showPendingTasks
                ? section.filteredContentByPending
                : section.filteredContent;
              return (
                <Box
                  key={`${section.title}-${section.id}`}
                  padding={{ base: '1rem', md: '1.5rem' }}
                  borderBottom={1}
                  borderStyle="solid"
                  borderColor={commonBorderColor}
                >
                  <Timeline
                    key={section.id}
                    showPendingTasks={showPendingTasks}
                    assignments={currentAssignments}
                    technologies={section.technologies || []}
                    title={section.label}
                    onClickAssignment={onClickAssignment}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </>
  );
}

TimelineSidebar.propTypes = {
  onClickAssignment: PropTypes.func,
  showPendingTasks: PropTypes.bool,
  isOpen: PropTypes.bool,
  setShowPendingTasks: PropTypes.func,
  onToggle: PropTypes.func,
  isStudent: PropTypes.bool,
  teacherInstructions: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
TimelineSidebar.defaultProps = {
  onClickAssignment: () => {},
  showPendingTasks: false,
  isOpen: false,
  setShowPendingTasks: () => {},
  onToggle: () => {},
  isStudent: true,
  teacherInstructions: {},
};

export default TimelineSidebar;
