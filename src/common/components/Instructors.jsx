import PropTypes from 'prop-types';
import { Avatar, Flex, Skeleton } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { BREATHECODE_HOST } from '../../utils/variables';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import { adjustNumberBeetwenMinMax } from '../../utils';
import Heading from './Heading';
import Icon from './Icon';

function orderArrayByRole(array) {
  return array.sort((a, b) => {
    if (a.role === 'TEACHER') return -1;
    if (b.role === 'TEACHER') return 1;
    return 0;
  });
}

function Instructors({ isLoading, list, limit, tryRigobot, ...rest }) {
  const { t } = useTranslation('common');
  const { featuredColor } = useStyle();
  const intructorsToShow = list.length > limit ? orderArrayByRole(list.slice(0, limit)) : orderArrayByRole(list);
  const restInstructors = list.length - limit;

  return (
    <Flex flexDirection="column" gridGap="16px" margin="8px 0" {...rest}>
      <Heading size="18px" fontWeight={700}>
        {t('your-tutors-in-this-cohort')}
      </Heading>
      <Flex gridGap="21px" overflow="auto" flexWrap="wrap">
        {isLoading
          ? (
            <Skeleton borderRadius="43" width="216px" height="56px" />
          )
          : intructorsToShow.length > 0 && intructorsToShow.map((instructor) => {
            const avatarPicture = instructor?.user?.profile?.avatar_url;
            const avatarNumber = adjustNumberBeetwenMinMax({
              number: instructor?.user?.id,
              min: 1,
              max: 20,
            });
            return (
              <Flex key={instructor?.user?.id} alignItems="center" gridGap="8px" minWidth="200px" padding="4px 8px" background={featuredColor} borderRadius="43">
                <Avatar src={avatarPicture || `${BREATHECODE_HOST}/static/img/avatar-${avatarNumber}.png`} />
                <Flex flexDirection="column" gridGap="6px" mr="1rem">
                  <Text size="14px" fontWeight={700} lineHeight="normal">
                    {`${instructor?.user?.first_name} ${instructor?.user?.last_name}`}
                  </Text>
                  <Text size="14px" lineHeight="normal">
                    {instructor?.role === 'TEACHER' ? t('main-instructor') : t('teacher-assistant')}
                  </Text>

                </Flex>
              </Flex>
            );
          })}
        <Flex
          id="ai-tutor"
          alignItems="center"
          gridGap="8px"
          minWidth="144px"
          padding="4px 8px"
          background={featuredColor}
          borderRadius="43"
          cursor="pointer"
          onClick={tryRigobot}
        >
          <Icon icon="avatar-glasses" width="36px" height="42px" />
          <Flex flexDirection="column" gridGap="6px">
            <Text size="14px" fontWeight={700} lineHeight="normal">
              {t('rigo')}
            </Text>
            <Text size="14px" lineHeight="normal">
              {t('ai-tutor')}
            </Text>
          </Flex>
        </Flex>
        {restInstructors > 0 && (
          <Flex alignItems="center" gridGap="8px">
            <Text size="14px" lineHeight="normal">
              {t('course:instructors-more', { count: restInstructors })}
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

Instructors.propTypes = {
  list: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  limit: PropTypes.number,
  isLoading: PropTypes.bool,
  tryRigobot: PropTypes.func,
};
Instructors.defaultProps = {
  list: [],
  limit: 2,
  isLoading: false,
  tryRigobot: () => {},
};
export default Instructors;
