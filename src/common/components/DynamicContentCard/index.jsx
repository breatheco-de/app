import { Avatar, Box, Divider, Flex, Heading, Link } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import HeadInfo from './HeadInfo';
import FeatureIndicator from './FeatureIndicator';
import { types } from './card-types';
import useFormatDate from './useFormatDate';
import { isValidDate, syncInterval } from '../../../utils';

function DynamicContentCard({ data, type, technologies }) {
  const { t } = useTranslation('live-event');
  const { featuredColor } = useStyle();
  const [date, setDate] = useState({});
  const language = data?.lang;
  const { formattedTime } = useFormatDate();
  const languageConnector = (language === 'us' || language === 'en' || language === null) ? '' : `/${language}`;
  const startedButNotEnded = date?.started && date?.ended === false;
  console.log('data:::', data);

  useEffect(() => {
    if (type === types.workshop) {
      const endDate = data?.ended_at || data?.ending_at;
      const startingAtDate = isValidDate(data?.starting_at) && new Date(data?.starting_at);
      const endingAtDate = isValidDate(endDate) && new Date(endDate);
      const formattedDate = formattedTime(startingAtDate, endingAtDate);
      setDate(formattedDate);

      syncInterval(() => {
        setDate(formattedDate);
      });
    }
  }, []);

  console.log('data:::', data);

  return (
    <Flex flexDirection="column" border={startedButNotEnded ? 'solid 2px' : ''} borderColor="blue.default" padding="16px" gridGap="16px" minWidth="310px" maxWidth="410px" background={featuredColor} borderRadius="10px">
      {/* Head conctent */}
      <HeadInfo
        technologies={technologies}
        date={date}
        duration={data?.duration}
        type={type}
      />
      <Flex flexDirection="column" gridGap="16px">
        <Heading as="h2" size="18px">
          {data?.title}
        </Heading>
        {data?.excerpt && (
          <Text size="14px">
            {data?.excerpt}
            {/* {data.description} */}
          </Text>
        )}
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" gridGap="10px">
        <Flex>
          {type === types.workshop && (
          <Flex alignItems="center" gridGap="12px">
            {/* host info */}
            <Avatar
              width="35px"
              height="35px"
              src={data?.host_user?.avatar_url || ''}
            />
            <Flex flexDirection="column" gridGap="8px">
              <Text size="14px" lineHeight="normal">
                {`By ${data?.host_user?.first_name} ${data?.host_user?.last_name}`}
              </Text>
              {/* <Text fontSize="12px" lineHeight="normal">
                Software Developer @4GeeksAcademy
              </Text> */}
            </Flex>
          </Flex>
          )}
          {type === types.project && data?.difficulty && (
            <Text size="13px" color="red" padding="5px 7px" borderRadius="18px" background="red.light">
              {data.difficulty}
            </Text>
          )}
        </Flex>

        <FeatureIndicator
          data={data}
          type={type}
        />
      </Flex>

      <Box display={type === types.workshop ? 'block' : 'none'}>
        <Divider mb="8px" />
        {type === types.workshop ? (
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
            {startedButNotEnded
              ? <>Register to this workshop</>
              : <>{t('book-place')}</>}
          </Link>
        ) : (
          <>
            {/* NOTE: uncomment until exists data to fill this */}
            {/* <Flex gridGap="8px">
              <Text size="12px">
                +12 students worked in this file
              </Text>
            </Flex> */}
          </>
        )}
      </Box>
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
};

DynamicContentCard.defaultProps = {
  data: {},
};

export default DynamicContentCard;
