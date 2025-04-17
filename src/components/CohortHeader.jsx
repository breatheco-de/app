/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Flex, Box, Container, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, PopoverFooter, Link, Button, useDisclosure,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import bc from '../services/breathecode';
import useAuth from '../hooks/useAuth';
import useCohortHandler from '../hooks/useCohortHandler';
import useStyle from '../hooks/useStyle';
import useRigo from '../hooks/useRigo';
import { SimpleSkeleton } from './Skeleton';
import Heading from './Heading';
import Text from './Text';
import Icon from './Icon';
import StudentsModal from './StudentsModal';
import { ProfilesSection } from './SupportSidebar/MentoringConsumables';
import { BREATHECODE_HOST } from '../utils/variables';
import { getStorageItem } from '../utils';
import LiveEventWidgetV2 from './LiveEvent/LiveEventWidgetV2';
import StepsModal from './StepsModal';

// eslint-disable-next-line react/prop-types
function CustomButton({ children, infoTooltip, ...props }) {
  const { t } = useTranslation('');
  const { backgroundColor, backgroundColor4, hexColor } = useStyle();

  return (
    <Box
      position="relative"
      width={{ base: '100%', sm: '145px' }}
      height="102px"
      borderRadius="8px"
      padding="8px"
      background={backgroundColor}
      display="flex"
      flexDirection="column"
      justifyContent="space-evenly"
      alignItems="center"
      cursor="pointer"
      _hover={{ background: backgroundColor4, transition: 'background 0.3s' }}
      {...props}
    >
      {infoTooltip && (
        <Popover
          placement="top-start"
          trigger="hover"
        >
          <PopoverTrigger>
            <Box
              position="absolute"
              top="4px"
              right="4px"
              zIndex={2}
              _hover={{
                svg: {
                  fill: hexColor.blueDefault,
                },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Icon
                icon="info"
                color={hexColor.grayLight}
                width="12px"
                height="12px"
              />
            </Box>
          </PopoverTrigger>
          <PopoverContent
            background={hexColor.blueLight}
            border="none"
            onClick={(e) => e.stopPropagation()}
            textAlign="center"
            p={2}
            borderRadius="8px"
          >
            <PopoverArrow bg={hexColor.blueLight} />
            <PopoverHeader
              display="flex"
              gap="8px"
              alignItems="center"
              justifyContent="center"
              border="none"
              fontSize="16px"
              padding="0"
              mb="8px"
            >
              {infoTooltip.icon && (
                <Icon icon={infoTooltip.icon} width="18px" height="18px" style={{ marginRight: '8px' }} color={hexColor.blueDefault} />
              )}
              {infoTooltip.title}
            </PopoverHeader>
            <PopoverBody
              padding="0"
              fontSize="14px"
              color="#4C648F"
              border="none"
              py={1}
              mb="8px"
            >
              {infoTooltip.description}
            </PopoverBody>
            {infoTooltip.learnMoreLink && (
              <PopoverFooter border="none" padding="0" fontWeight="bold">
                <Link
                  href={infoTooltip.learnMoreLink}
                  textAlign="center"
                  isExternal
                  color={hexColor.blueDefault}
                >
                  {t('common:learn-more')}
                </Link>
              </PopoverFooter>
            )}
          </PopoverContent>
        </Popover>
      )}
      {children}
    </Box>
  );
}

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  infoTooltip: PropTypes.shape({
    icon: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    learnMoreLink: PropTypes.string,
  }),
};

CustomButton.defaultProps = {
  infoTooltip: null,
};

function Header({ onOpenGithubModal, upcomingEvents, liveClasses }) {
  const { t } = useTranslation('choose-program');
  const router = useRouter();
  const { user, isAuthenticatedWithRigobot, conntectToRigobot, cohorts } = useAuth();
  const { rigo, isRigoInitialized } = useRigo();
  const { featuredLight, hexColor } = useStyle();
  const { cohortSession } = useCohortHandler();
  const [mentors, setMentors] = useState([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isRigobotModalOpen, onOpen: onRigobotModalOpen, onClose: onRigobotModalClose } = useDisclosure();
  const rigobotModalInfo = t('common:rigobot', {}, { returnObjects: true });

  const fetchServices = async () => {
    try {
      const { data } = await bc.mentorship({
        status: 'ACTIVE',
        academy: cohortSession?.academy?.id,
      }).getMentor();
      setMentors(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (cohortSession && cohortSession.cohort_user.role === 'STUDENT') {
      fetchServices();
    }
  }, [cohortSession]);

  const hasGithub = user?.github && user.github.username !== '';

  const getRigobotButtonText = () => {
    if (!isAuthenticatedWithRigobot) return t('common:connect-with-rigobot');

    return t('common:get-help-rigobot');
  };

  const rigobotMessage = () => {
    if (!isAuthenticatedWithRigobot) {
      conntectToRigobot();
    } else {
      rigo.updateOptions({
        showBubble: true,
        welcomeMessage: t('rigo-chat.welcome-message', { firstName: user?.first_name, cohortName: cohortSession?.name }),
        collapsed: false,
        purposeSlug: '4geekscom-public-agent',
      });
    }
    onRigobotModalClose();
  };

  return (
    <Container padding="16px" maxWidth="none" background={featuredLight}>
      {cohortSession ? (
        <Flex maxWidth="1200px" margin="auto" gap="24px" wrap={{ base: 'wrap', md: 'nowrap' }}>
          <Box>
            <Heading fontWeight="400" size="xsm" as="h4" textAlign="left" mb="8px">
              {t('hello-user', { name: user?.first_name })}
            </Heading>
            <Heading fontWeight="400" size="sm" as="h3" textAlign="left">
              {t('read-to-start-learning')}
            </Heading>
          </Box>
          <Flex gap="16px" flexDirection={{ base: 'column', sm: 'row' }} width={{ base: '100%', sm: 'auto' }}>
            {cohortSession.cohort_user.role === 'STUDENT' ? (
              <>
                <Popover placement="bottom" isOpen={isOpen} onClose={onClose}>
                  <PopoverTrigger>
                    <Box onClick={onOpen}>
                      <CustomButton
                        infoTooltip={{
                          icon: 'live-event-opaque',
                          title: t('common:see-upcoming-events'),
                          description: t('common:see-upcoming-events-description'),
                          learnMoreLink: '/lesson/interacting-in-workshops',
                        }}
                      >
                        <Icon icon="live-event-opaque" width="42px" height="42px" />
                        <Text textAlign="center" color={hexColor.blueDefault}>
                          {t('common:see-workshops')}
                        </Text>
                      </CustomButton>
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverBody display="flex" flexDirection="column" alignItems="center">
                      <LiveEventWidgetV2
                        mainClasses={liveClasses || []}
                        otherEvents={upcomingEvents || []}
                        cohorts={cohorts || []}
                      />
                    </PopoverBody>
                  </PopoverContent>
                </Popover>

                <CustomButton
                  onClick={() => router.push('/mentorship/schedule')}
                  infoTooltip={{
                    icon: 'group2',
                    title: t('common:mentorships'),
                    description: t('common:mentorship-description'),
                    learnMoreLink: '/lesson/mentoring-sessons',
                  }}
                >
                  <ProfilesSection size="40px" profiles={mentors} />
                  <Text textAlign="center" color={hexColor.blueDefault}>
                    {t('common:schedule-mentoring')}
                  </Text>
                </CustomButton>

                {isRigoInitialized && (
                  <CustomButton onClick={onRigobotModalOpen}>
                    <Icon icon="rigobot-avatar-tiny" width="42px" height="42px" />
                    <Text textAlign="center" color={hexColor.blueDefault}>
                      {getRigobotButtonText()}
                    </Text>
                  </CustomButton>
                )}

                {!hasGithub && (
                  <CustomButton onClick={onOpenGithubModal}>
                    <Icon icon="github" width="42px" height="42px" />
                    <Text textAlign="center" color={hexColor.blueDefault}>
                      {t('common:connect-with-github')}
                    </Text>
                  </CustomButton>
                )}

              </>
            ) : (
              <>
                <CustomButton onClick={() => setShowStudentsModal(true)}>
                  <Icon icon="support" color={hexColor.blueDefault} width="42px" height="42px" />
                  <Text textAlign="center" color={hexColor.blueDefault}>
                    {t('dashboard:teacher-sidebar.student-progress')}
                  </Text>
                </CustomButton>
                <CustomButton onClick={() => window.open(`/cohort/${cohortSession?.slug}/assignments?academy=${cohortSession?.academy?.id}`, '_blank')}>
                  <Icon icon="list" width="42px" height="42px" />
                  <Text textAlign="center" color={hexColor.blueDefault}>
                    {t('dashboard:teacher-sidebar.assignments')}
                  </Text>
                </CustomButton>
                <CustomButton onClick={() => window.open('https://www.notion.so/4geeksacademy/Mentor-training-433451eb9dac4dc680b7c5dae1796519', '_blank')}>
                  <Icon icon="courses" width="42px" height="42px" />
                  <Text textAlign="center" color={hexColor.blueDefault}>
                    {t('dashboard:teacher-sidebar.teacher-tutorial')}
                  </Text>
                </CustomButton>
              </>
            )}
          </Flex>
        </Flex>
      ) : (
        <SimpleSkeleton
          height="50px"
          width="290px"
          padding="6px 18px 6px 18px"
          margin="18px 0"
          borderRadius="30px"
        />
      )}
      {cohortSession && cohortSession.cohort_user.role !== 'STUDENT' && (
        <StudentsModal isOpen={showStudentsModal} onClose={() => setShowStudentsModal(false)} />
      )}
      <StepsModal
        isOpen={isRigobotModalOpen}
        onClose={onRigobotModalClose}
        title={rigobotModalInfo.title}
        titleIcon="rigobot-avatar-tiny"
        description={rigobotModalInfo.description}
        steps={rigobotModalInfo.steps}
        finalAction={rigobotMessage}
        finalActionLabel={t('common:chat-with-rigobot')}
      />
    </Container>
  );
}

Header.propTypes = {
  onOpenGithubModal: PropTypes.func.isRequired,
  upcomingEvents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  liveClasses: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};

Header.defaultProps = {
  upcomingEvents: [],
  liveClasses: [],
};

export default Header;
