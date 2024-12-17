/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Flex, Box, Container,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import bc from '../../common/services/breathecode';
import useAuth from '../../common/hooks/useAuth';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useStyle from '../../common/hooks/useStyle';
import useRigo from '../../common/hooks/useRigo';
import { SimpleSkeleton } from '../../common/components/Skeleton';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import StudentsModal from './StudentsModal';
import { ProfilesSection } from '../../common/components/SupportSidebar/MentoringConsumables';
import { BREATHECODE_HOST } from '../../utils/variables';
import { getStorageItem } from '../../utils';

function Header() {
  const { t } = useTranslation('choose-program');
  const router = useRouter();
  const { user, isAuthenticatedWithRigobot, conntectToRigobot } = useAuth();
  const { rigo, isRigoInitialized } = useRigo();
  const { featuredLight, backgroundColor, hexColor } = useStyle();
  const { cohortSession } = useCohortHandler();
  const [mentors, setMentors] = useState([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

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
    if (cohortSession && cohortSession.cohort_role === 'STUDENT') fetchServices();
  }, [cohortSession]);

  const hasGithub = user?.github && user.github.username !== '';

  const getRigobotButtonText = () => {
    if (!hasGithub) return t('common:connect-with-github');
    if (!isAuthenticatedWithRigobot) return t('common:connect-with-tigobot');

    return t('common:get-help-rigobot');
  };

  const rigobotMessage = () => {
    if (!hasGithub) {
      const accessToken = getStorageItem('accessToken');
      window.location.href = `${BREATHECODE_HOST}/v1/auth/github/${accessToken}?url=${window.location.href}`;
    } else if (!isAuthenticatedWithRigobot) {
      conntectToRigobot();
    } else {
      rigo.updateOptions({
        showBubble: true,
        highlight: true,
        welcomeMessage: t('rigo-chat.welcome-message', { firstName: user?.first_name, cohortName: cohortSession?.name }),
        collapsed: false,
        purposeSlug: '4geekscom-public-agent',
      });
    }
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
            {cohortSession.cohort_role === 'STUDENT' ? (
              <>
                <Box
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
                  _hover={{ textDecoration: 'underline', textDecorationColor: 'blue.default' }}
                  onClick={() => router.push('/workshops')}
                >
                  <Icon icon="live-event-opaque" width="42px" height="42px" />
                  <Text textAlign="center" color={hexColor.blueDefault}>
                    {t('common:see-workshops')}
                  </Text>
                </Box>

                <Box
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
                  _hover={{ textDecoration: 'underline', textDecorationColor: 'blue.default' }}
                  onClick={() => router.push('/mentorship/schedule')}
                >
                  <ProfilesSection size="40px" profiles={mentors} />
                  <Text textAlign="center" color={hexColor.blueDefault}>
                    {t('common:schedule-mentoring')}
                  </Text>
                </Box>

                {isRigoInitialized && (
                  <Box
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
                    _hover={{ textDecoration: 'underline', textDecorationColor: 'blue.default' }}
                    onClick={rigobotMessage}
                  >
                    <Icon icon="rigobot-avatar-tiny" width="42px" height="42px" />
                    <Text textAlign="center" color={hexColor.blueDefault}>
                      {getRigobotButtonText()}
                    </Text>
                  </Box>
                )}
              </>
            ) : (
              <>
                <Box
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
                  _hover={{ textDecoration: 'underline', textDecorationColor: 'blue.default' }}
                  onClick={() => setShowStudentsModal(true)}
                >
                  <Icon icon="support" color={hexColor.blueDefault} width="42px" height="42px" />
                  <Text textAlign="center" color={hexColor.blueDefault}>
                    {t('dashboard:teacher-sidebar.student-progress')}
                  </Text>
                </Box>
                <Box
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
                  _hover={{ textDecoration: 'underline', textDecorationColor: 'blue.default' }}
                  onClick={() => window.open(`/cohort/${cohortSession?.slug}/assignments?academy=${cohortSession?.academy?.id}`, '_blank')}
                >
                  <Icon icon="list" width="42px" height="42px" />
                  <Text textAlign="center" color={hexColor.blueDefault}>
                    {t('dashboard:teacher-sidebar.assignments')}
                  </Text>
                </Box>
                <Box
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
                  _hover={{ textDecoration: 'underline', textDecorationColor: 'blue.default' }}
                  onClick={() => window.open('https://www.notion.so/4geeksacademy/Mentor-training-433451eb9dac4dc680b7c5dae1796519', '_blank')}
                >
                  <Icon icon="courses" width="42px" height="42px" />
                  <Text textAlign="center" color={hexColor.blueDefault}>
                    {t('dashboard:teacher-sidebar.teacher-tutorial')}
                  </Text>
                </Box>
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
      <StudentsModal isOpen={showStudentsModal} onClose={() => setShowStudentsModal(false)} />
    </Container>
  );
}

export default Header;
