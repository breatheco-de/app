import { Avatar, Box, Divider, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import HeadInfo from './HeadInfo';
import FeatureIndicator from './FeatureIndicator';
import { types } from './card-types';
import useFormatDate from './useFormatDate';
import { adjustNumberBeetwenMinMax, isValidDate, syncInterval, toCapitalize } from '../../../utils';
import { BREATHECODE_HOST } from '../../../utils/variables';
import Icon from '../Icon';
import Link from '../NextChakraLink';
import { reportDatalayer } from '../../../utils/requests';
import Heading from '../Heading';

const getAssetPath = (asset) => {
  if (asset?.category?.slug === 'how-to' || asset?.category?.slug === 'como') return 'how-to';
  if (asset?.asset_type?.toUpperCase() === 'LESSON') return 'lesson';
  if (asset?.asset_type?.toUpperCase() === 'EXERCISE') return 'interactive-exercise';
  if (asset?.asset_type?.toUpperCase() === 'PROJECT') return 'interactive-coding-tutorial';
  return 'lesson';
};

export const getDifficultyColors = (currDifficulty) => {
  const background = {
    beginner: 'featuredLight',
    easy: 'green.light',
    intermediate: 'yellow.100',
    hard: 'red.light',
  };
  const color = {
    beginner: '#005b7b',
    easy: '#115932',
    intermediate: '#6f4f0a',
    hard: '#7e0000',
  };
  return {
    bg: background[currDifficulty],
    color: color[currDifficulty],
  };
};

function DynamicContentCard({ data, type, technologies, usersWorkedHere, ...rest }) {
  const { t, lang } = useTranslation('live-event');
  const { featuredColor, borderColor } = useStyle();
  const [date, setDate] = useState({});
  const language = data?.lang;
  const { formattedTime } = useFormatDate();
  const maxUsers = 5;
  const usersWithPicture = usersWorkedHere?.length > maxUsers ? usersWorkedHere.slice(0, maxUsers) : usersWorkedHere;
  const remainingUsers = usersWorkedHere?.length > maxUsers ? usersWorkedHere.length - maxUsers : '';
  const languageConnector = (language === 'us' || language === 'en' || language === null) ? '' : `/${language}`;
  const startedButNotEnded = date?.started && date?.ended === false;
  const isWorkshop = type === types.workshop;
  const isWorkshopStarted = isWorkshop && startedButNotEnded;
  const description = data?.excerpt || data?.description;
  const langConnector = data?.lang === 'us' ? '' : `/${data?.lang}`;
  const isLesson = getAssetPath(data) === 'lesson';
  const isExercise = getAssetPath(data) === 'interactive-exercise';
  const isProject = getAssetPath(data) === 'interactive-coding-tutorial';
  const isHowTo = getAssetPath(data) === 'how-to';

  const getFormatedDate = () => {
    const endDate = data?.ended_at || data?.ending_at;
    const startingAtDate = isValidDate(data?.starting_at) && new Date(data?.starting_at);
    const endingAtDate = isValidDate(endDate) && new Date(endDate);
    const formattedDate = formattedTime(startingAtDate, endingAtDate);
    return formattedDate;
  };

  const getLink = () => {
    if (isLesson) {
      return `${langConnector}/lesson/${data.slug}`;
    }
    if (isExercise) {
      return `${langConnector}/interactive-exercise/${data.slug}`;
    }
    if (isProject) {
      return `${langConnector}/interactive-coding-tutorial/${data.slug}`;
    }
    if (isHowTo) {
      return `${langConnector}/how-to/${data.slug}`;
    }
    return `/${data.slug}`;
  };

  useEffect(() => {
    if (isWorkshop) {
      const formattedDate = getFormatedDate();
      setDate(formattedDate);

      syncInterval(() => {
        setDate(formattedDate);
      });
    }
  }, []);
  useEffect(() => {
    if (isWorkshop) {
      const formattedDate = getFormatedDate();
      setDate(formattedDate);
    }
  }, [lang]);

  return (
    <Flex flexDirection="column" border={isWorkshopStarted ? 'solid 2px' : 'solid 1px'} borderColor={isWorkshopStarted ? 'blue.default' : borderColor} padding={isWorkshop ? '10px 16px 0px' : '16px'} gridGap="14px" width={isWorkshop ? { base: '310px', md: '360px' } : 'auto'} background={isWorkshopStarted ? featuredColor : 'inherit'} borderRadius="10px" position="relative" {...rest}>
      {/* <--------------- Head content (average duration and technology icon/tag) ---------------> */}
      <HeadInfo
        technologies={data?.technologies || technologies}
        date={date}
        duration={data?.duration}
        type={type}
      />
      <Flex flexDirection="column" gridGap="10px">
        <Heading as="h3" size="18px" lineHeight="normal">
          {isWorkshop ? (
            <Box
              display="-webkit-box"
              style={{
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
              }}
              overflow="hidden"
              textOverflow="ellipsis"
              maxHeight="2.4em"
              lineHeight="1.2em"
              aria-label={data?.title}
            >
              {data?.title}
            </Box>
          ) : (
            <Link
              href={getLink()}
              onClick={() => {
                reportDatalayer({
                  dataLayer: {
                    event: 'select_content',
                    asset_slug: data?.slug,
                    asset_title: data?.title,
                    asset_lang: data?.lang,
                    asset_category: data?.category?.slug,
                  },
                });
              }}
              _after={{
                content: '""',
                position: 'absolute',
                inset: 0,
              }}
            >
              {data?.title}
            </Link>
          )}
        </Heading>
        {description?.length > 0 && (
          <>
            {isWorkshop ? (
              <Text
                size="14px"
                height={isWorkshop ? '3.6em' : 'auto'}
                display="-webkit-box"
                style={{
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                }}
                overflow="hidden"
                textOverflow="ellipsis"
                maxHeight="3.6em"
                lineHeight="1.2em"
                aria-label={description}
              >
                {description}
              </Text>
            ) : (
              <Text size="14px" lineHeight="normal">
                {description}
              </Text>
            )}
          </>
        )}
      </Flex>
      <Flex
        _empty={{ display: 'none' }}
        alignItems="center"
        justifyContent="space-between"
        gridGap="10px"
        id="event_info"
        marginTop={isWorkshop ? 'auto' : 'inherit'}
      >
        <Flex id="left_info" _empty={{ display: 'none' }}>
          {/* <--------------- Host info ---------------> */}
          {isWorkshop && data?.host_user && (
            <Flex alignItems="center" gridGap="12px">
              <Avatar
                width="35px"
                height="35px"
                src={data?.host_user?.profile?.avatar_url || ''}
              />
              <Flex flexDirection="column" gridGap="8px">
                <Text size="14px" lineHeight="normal">
                  {`By ${data?.host_user?.first_name} ${data?.host_user?.last_name}`}
                </Text>
                {data?.host_user?.profesion && (
                <Text fontSize="12px" lineHeight="normal">
                  {data.host_user.profesion}
                </Text>
                )}
              </Flex>
            </Flex>
          )}

          {type === types.project && data?.difficulty && (
            <Text
              background={getDifficultyColors(data?.difficulty).bg}
              color={getDifficultyColors(data?.difficulty).color}
              size="13px"
              fontWeight={700}
              padding="5px 7px"
              borderRadius="18px"
            >
              {toCapitalize(data.difficulty)}
            </Text>
          )}
        </Flex>

        <FeatureIndicator
          data={data}
          type={type}
        />
      </Flex>

      <Box display={[types.workshop, types.project].includes(type) ? 'block' : 'none'}>
        <Divider mb={isWorkshop ? '0px' : '16px'} />
        {/* <--------------- Event link ---------------> */}
        {isWorkshop ? (
          <>
            {date?.ended ? (
              <Text size="17px" padding="10px 0" lineHeight="normal" textAlign="center" fontWeight={700}>
                {date?.text}
              </Text>
            ) : (
              <Link
                href={`${languageConnector}/workshops/${data?.slug}`}
                color="blue.default"
                fontSize="17px"
                fontWeight={700}
                letterSpacing="0.05em"
                height="40px"
                display="flex"
                alignItems="center"
                width="fit-content"
                margin="0 auto"
                gridGap="10px"
              >
                {date?.started
                  ? t('join-workshop')
                  : t('register-workshop')}
                {date?.started && (
                  <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
                )}
              </Link>
            )}
          </>
        ) : (
          <>
            {type === types.project && usersWorkedHere?.length > 0 && (
              <Flex gridGap="8px" alignItems="center">
                {usersWithPicture?.map((user, index) => {
                  const avatarNumber = adjustNumberBeetwenMinMax({
                    number: user?.id,
                    min: 1,
                    max: 20,
                  });
                  const avatar = user?.profile?.avatar_url || `${BREATHECODE_HOST}/static/img/avatar-${avatarNumber}.png`;
                  return (
                    <Avatar
                      key={user?.id}
                      width="32px"
                      height="32px"
                      style={{ userSelect: 'none' }}
                      src={avatar}
                      marginLeft={index !== 0 && usersWorkedHere.length > index ? '-24px' : '0px'}
                      zIndex={index}
                    />
                  );
                })}
                {remainingUsers && (
                  <Text size="12px">
                    {t('students-worked-here', { count: remainingUsers })}
                  </Text>
                )}
              </Flex>
            )}
          </>
        )}
      </Box>
      <style>
        {`
          #left_info:empty {
            display: none;
          }
          #event_info:has(#left_info:empty + #feature_indicator:empty) {
            display: none;
          }
        `}
      </style>
    </Flex>
  );
}

DynamicContentCard.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  type: PropTypes.string.isRequired,
  technologies: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    icon: PropTypes.string,
  })).isRequired,
  usersWorkedHere: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
};

DynamicContentCard.defaultProps = {
  data: {},
  usersWorkedHere: [],
};

export default DynamicContentCard;
