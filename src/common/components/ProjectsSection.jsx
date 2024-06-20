/* eslint-disable no-unsafe-optional-chaining */
import PropTypes from 'prop-types';
import {
  Box,
  useColorModeValue,
  Flex,
  AvatarGroup,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { Fragment } from 'react';
import CustomTheme from '../../../styles/theme';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';
import Text from './Text';
import Icon from './Icon';
import { isNumber } from '../../utils';
import useStyle from '../hooks/useStyle';

function ProjectsSection({
  startsIn, syllabusContent, courseProgress,
  usersConnected, assistants, teacher, isAvailableAsSaas,
  subscriptionStatus,
}) {
  const { t } = useTranslation('program-card');
  const textColor = useColorModeValue('black', 'white');
  const bgColor = useColorModeValue('featuredLight', 'featuredDark');
  const now = new Date();
  const { hexColor } = useStyle();
  const isFreeTrial = subscriptionStatus === 'FREE_TRIAL';
  const statusActive = subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'FULLY_PAID';
  // const statusActive = subscriptionStatus === 'ACTIVE' || isFreeTrial || subscriptionStatus === 'FULLY_PAID';

  const statusTimeString = (start) => {
    if (start < now) return 'started';
    return 'idle';
  };
  const hasStarted = statusTimeString(new Date(startsIn)) === 'started';

  const syllabusArray = () => {
    const contentArray = [];
    if (syllabusContent?.totalLessons) {
      contentArray.push({
        name: 'lessons',
        icon: 'book',
        total: syllabusContent.totalLessons,
        completed: syllabusContent.completedLessons,
      });
    }
    if (syllabusContent?.totalProjects) {
      contentArray.push({
        name: 'projects',
        icon: 'laptop',
        total: syllabusContent.totalProjects,
        completed: syllabusContent.completedProjects,
      });
    }
    if (syllabusContent?.totalExercises) {
      contentArray.push({
        name: 'exercises',
        icon: 'strength',
        total: syllabusContent.totalExercises,
        completed: syllabusContent.completedExercises,
      });
    }
    if (syllabusContent?.totalQuizzes) {
      contentArray.push({
        name: 'quizzes',
        icon: 'answer',
        total: syllabusContent.totalQuizzes,
        completed: syllabusContent.completedQuizzes,
      });
    }
    return contentArray;
  };

  const existsMentors = assistants?.length > 0 || isNumber(teacher?.id);
  const countOfMentors = assistants?.length + (teacher?.id ? 1 : 0);

  return (syllabusArray()?.length > 0 || assistants?.length > 0) && (
    <Flex justifyContent="space-between" alignItems="center" marginTop="10px" padding="10px" borderRadius="5px" background={bgColor}>
      {syllabusArray()?.length > 0 && (
        <Box display="flex" flexDirection="column" gridGap="8px">
          {syllabusArray().map((elem) => (
            <Text
              fontSize="xs"
              lineHeight="14px"
              fontWeight="700"
              color={textColor}
              key={elem?.name}
              display="flex"
            >
              <Icon
                width={elem?.icon === 'laptop' ? '14px' : '14px'}
                height={elem?.icon === 'laptop' ? '14px' : '14px'}
                mr="7px"
                color={hexColor.blueDefault}
                icon={elem?.icon || 'book'}
              />
              <Box>
                {((isAvailableAsSaas === false || statusActive || isFreeTrial) && (hasStarted || courseProgress > 0)) && (
                  <>
                    <span style={{ color: CustomTheme.colors.blue.default2 }}>{elem.completed || 0}</span>
                    /
                  </>
                )}
                {`${elem.total} ${t(elem.name)}`}
              </Box>
            </Text>
          ))}
        </Box>
      )}
      {existsMentors && (
        <Box>
          <Text
            fontSize="xs"
            lineHeight="14px"
            fontWeight="700"
            color={textColor}
            marginBottom="5px"
            textAlign="center"
          >
            {`${countOfMentors} ${t('mentors-available')}`}
          </Text>

          <Box display="flex" justifyContent="space-between" mt="10px" gridGap="22px">
            {teacher?.id && (
              <AvatarUser
                width="42px"
                height="42px"
                key={`${teacher.id} - ${teacher.user.first_name}`}
                fullName={`${teacher?.user?.first_name} ${teacher?.user?.last_name}`}
                data={teacher}
                isOnline={usersConnected?.includes(teacher.user.id)}
                badge
                customBadge={(
                  <Box position="absolute" bottom="-6px" right="-8px" background="blue.default" borderRadius="50px" p="5px" border="2px solid white">
                    <Icon icon="teacher1" width="12px" height="12px" color="#FFFFFF" />
                  </Box>
                )}
              />
            )}
            {assistants?.length > 0 && (
              <AvatarGroup max={assistants?.length <= 2 ? 2 : 1} size="md">
                {assistants?.map((c, i) => {
                  const fullName = `${c.user.first_name} ${c.user.last_name}`;
                  const isOnline = usersConnected?.includes(c.user.id);
                  return (
                    <Fragment key={`${c.id} - ${fullName}`}>
                      <AvatarUser
                        width="42px"
                        height="42px"
                        index={i}
                        // key={`${c.id} - ${c.user.first_name}`}
                        isWrapped
                        fullName={fullName}
                        data={c}
                        isOnline={isOnline}
                        badge
                      />
                    </Fragment>
                  );
                })}
              </AvatarGroup>
            )}
          </Box>
        </Box>
      )}
    </Flex>
  );
}

ProjectsSection.propTypes = {
  startsIn: PropTypes.instanceOf(Date),
  syllabusContent: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  courseProgress: PropTypes.number,
  usersConnected: PropTypes.arrayOf(PropTypes.number),
  assistants: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  teacher: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  isAvailableAsSaas: PropTypes.bool,
  subscriptionStatus: PropTypes.string,
};

ProjectsSection.defaultProps = {
  startsIn: null,
  syllabusContent: null,
  courseProgress: null,
  usersConnected: [],
  assistants: [],
  teacher: null,
  isAvailableAsSaas: true,
  subscriptionStatus: '',
};

export default ProjectsSection;
