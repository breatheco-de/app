/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Box,
  Divider,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../../../../../common/hooks/useStyle';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import bc from '../../../../../common/services/breathecode';
import ReactSelect, { AsyncSelect } from '../../../../../common/components/ReactSelect';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import Heading from '../../../../../common/components/Heading';
import Icon from '../../../../../common/components/Icon';
import Text from '../../../../../common/components/Text';
import DottedTimeline from '../../../../../common/components/DottedTimeline';
import Link from '../../../../../common/components/NextChakraLink';

function StudentReport() {
  const { t } = useTranslation('student');
  const router = useRouter();
  const { query } = router;
  const { cohortSlug, studentId, academy } = query;
  const [selectedCohortUser, setSelectedCohortUser] = useState(null);
  const [cohortUsers, setCohortUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState({
    lessons: [],
    projects: [],
    exercises: [],
  });
  const [cohortSession] = usePersistent('cohortSession', {});
  const user = cohortUsers[0]?.user;

  const { hexColor } = useStyle();
  const linkColor = useColorModeValue('blue.default', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.500');

  useEffect(() => {
    bc.admissions({ users: studentId }).cohortUsers(academy)
      .then((res) => {
        setCohortUsers(res.data);
        setSelectedCohortUser(res.data.find((cohortUser) => cohortUser.cohort.slug === cohortSlug));
      }).catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    if (selectedCohortUser) {
      Promise.all([
        bc
          .cohort({ academy })
          .getAttendance(selectedCohortUser.cohort.slug),
        bc
          .todo({
            academy,
            limit: 1000,
            task_type: 'PROJECT,LESSON,EXERCISE',
            student: studentId,
            distinct: 'true',
          })
          .getAssignments({ id: selectedCohortUser.cohort.id, academy }),
      ])
        .then((res) => {
          setAttendance(res[0].data);
          const nonDuplicated = [...new Map(res[1].data.results.map((item) => [item.id, item])).values()];
          setAssignments({
            lessons: nonDuplicated.filter((elem) => elem.task_type === 'LESSON'),
            projects: nonDuplicated.filter((elem) => elem.task_type === 'EXERCISE'),
            exercises: nonDuplicated.filter((elem) => elem.task_type === 'PROJECT'),
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [selectedCohortUser]);

  return (
    <Box>
      <Box
        paddingBottom="30px"
        maxWidth={{ base: '90%', md: '90%', lg: '1012px' }}
        margin="2% auto 0 auto"
      >
        <Box display="flex" justifyContent="space-between">
          <Link
            href={cohortSession?.selectedProgramSlug || '/choose-program'}
            color={linkColor}
            display="inline-block"
            letterSpacing="0.05em"
            fontWeight="700"
          >
            {`← ${t('back-to')}`}
          </Link>
        </Box>
        {user && (
          <Box
            display="flex"
            flexDirection={{ base: 'column', md: 'row' }}
            gridGap={{ base: '0', md: '10px' }}
            paddingTop="50px"
            alignItems={{ base: 'start', md: 'center' }}
          >
            <Heading
              size="m"
              style={{ margin: '0' }}
              padding={{ base: '0', md: '0 0 5px 0 !important' }}
            >
              {`${user && user.first_name} ${user && user.last_name}`}
            </Heading>
            {selectedCohortUser && (
              <ReactSelect
                unstyled
                color="#0097CD"
                fontWeight="700"
                id="cohort-select"
                fontSize="25px"
                placeholder={t('common:select-cohort')}
                noOptionsMessage={() => t('common:no-options-message')}
                value={
                  selectedCohortUser
                    ? {
                      value: selectedCohortUser.cohort.slug,
                      slug: selectedCohortUser.cohort.slug,
                      label: `${selectedCohortUser.cohort.name} (${selectedCohortUser.educational_status})`,
                    }
                    : ''
                }
                onChange={(selected) => {
                  setSelectedCohortUser(
                    cohortUsers.find((opt) => opt.cohort.slug === selected.slug),
                  );
                }}
                options={cohortUsers.map((cohortUser) => ({
                  value: cohortUser.cohort.slug,
                  slug: cohortUser.cohort.slug,
                  label: `${cohortUser.cohort.name} (${cohortUser.educational_status})`,
                }))}
              />
            )}
          </Box>
        )}
        <Flex marginTop="20px" justify="space-between" gap="20px">
          <Box
            borderRadius="17px"
            width="265px"
            padding="12px 16px"
            border="3px solid"
            borderColor={hexColor.featuredColor}
          >
            <Text color={hexColor.fontColor2} fontWeight="700">
              {t('analitics.total-mentorships')}
            </Text>
            <Box display="flex" gap="10px" alignItems="center">
              <Icon
                icon="book"
                color={hexColor.blueDefault}
                width="24px"
                height="24px"
              />
              <Text color={hexColor.fontColor3} size="30px" fontWeight="700">
                100
              </Text>
            </Box>
          </Box>
          <Box
            borderRadius="17px"
            width="265px"
            padding="12px 16px"
            border="3px solid"
            borderColor={hexColor.featuredColor}
          >
            <Text color={hexColor.fontColor2} fontWeight="700">
              {t('analitics.total-mentorships')}
            </Text>
            <Box display="flex" gap="10px" alignItems="center">
              <Icon
                icon="bookClosed"
                color={hexColor.blueDefault}
                width="24px"
                height="24px"
              />
              <Text color={hexColor.fontColor3} size="30px" fontWeight="700">
                100
              </Text>
            </Box>
          </Box>
          <Box
            borderRadius="17px"
            width="265px"
            padding="12px 16px"
            border="3px solid"
            borderColor={hexColor.featuredColor}
          >
            <Text color={hexColor.fontColor2} fontWeight="700">
              {t('analitics.total-mentorships')}
            </Text>
            <Box display="flex" gap="10px" alignItems="center">
              <Icon
                icon="list"
                color={hexColor.blueDefault}
                width="24px"
                height="24px"
              />
              <Text color={hexColor.fontColor3} size="30px" fontWeight="700">
                100
              </Text>
            </Box>
          </Box>
          <Box
            borderRadius="17px"
            width="265px"
            padding="12px 16px"
            border="3px solid"
            borderColor={hexColor.featuredColor}
          >
            <Text color={hexColor.fontColor2} fontWeight="700">
              {t('analitics.total-mentorships')}
            </Text>
            <Box display="flex" gap="10px" alignItems="center">
              <Icon
                icon="smile"
                color={hexColor.green}
                width="24px"
                height="24px"
              />
              <Text color={hexColor.fontColor3} size="30px" fontWeight="700">
                100
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>
      <Divider borderBottom="1px solid" color={borderColor} />
      <Flex
        maxWidth={{ base: '90%', md: '90%', lg: '1012px' }}
        margin="2% auto 0 auto"
      >
        <Box width="100%" maxWidth="695px">
          <Box marginBottom="20px" width="100%">
            <Heading color={hexColor.fontColor2} size="m">{`${t('relevant-activities')}:`}</Heading>
          </Box>
          <Box width="100%">
            <Heading color={hexColor.fontColor2} size="m">{`${t('deliverables')}:`}</Heading>
            <Box marginTop="20px">
              <DottedTimeline
                onClickDots={() => {}}
                label={(
                  <Flex gridGap="10px" alignItems="center">
                    <Icon
                      icon="book"
                      color={hexColor.blueDefault}
                      width="20px"
                      height="20px"
                    />
                    <p>{t('deliverables-section.lessons')}</p>
                  </Flex>
                )}
                dots={assignments.lessons.map((lesson) => ({ ...lesson, label: lesson.title }))}
                helpText={`${t('educational-status')}: ${selectedCohortUser?.educational_status}`}
              />
            </Box>
            <Box marginTop="20px">
              <DottedTimeline
                onClickDots={() => {}}
                label={(
                  <Flex gridGap="10px" alignItems="center">
                    <Icon
                      icon="laptop-code"
                      color={hexColor.blueDefault}
                      width="20px"
                      height="20px"
                    />
                    <p>{t('deliverables-section.projects')}</p>
                  </Flex>
                )}
                dots={assignments.projects.map((project) => ({ ...project, label: project.title, borderColor: hexColor.fontColor3 }))}
                helpText={`${t('educational-status')}: ${selectedCohortUser?.educational_status}`}
              />
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

export default asPrivate(StudentReport);
