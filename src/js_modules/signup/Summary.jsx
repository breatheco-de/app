import { Box, Button, useColorModeValue } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useStyle from '../../common/hooks/useStyle';

const Summary = ({
  dateProps, formProps, courseTitle, planProps,
}) => {
  const { t } = useTranslation('signup');
  const { borderColor } = useStyle();
  const router = useRouter();

  const fontColor = useColorModeValue('gray.800', 'gray.300');
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');
  const borderColor2 = useColorModeValue('black', 'white');

  return (
    <Box
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      gridGap="30px"
      mb="1rem"
    >
      <Box
        display="flex"
        flexDirection="column"
        flex={0.5}
        gridGap="3rem"
      >
        <Box display="flex" flexDirection="column" gridGap="10px">
          <Heading size="18px" textTransform="uppercase">
            {t('cohort-details')}
          </Heading>
          <Box
            as="hr"
            width="30%"
            margin="0 0 10px 0"
            h="1px"
            borderColor={borderColor2}
          />
          <Box display="flex" flexDirection="column" gridGap="10px">
            <Text size="md" fontWeight="700">
              {t('cohort-name')}
            </Text>
            <Text size="md" fontWeight="400" color={fontColor} textTransform="capitalize">
              {dateProps?.name}
              <Text size="sm" fontWeight="700" textTransform="capitalize" color={fontColor}>
                {dateProps?.syllabus_version?.name}
              </Text>
            </Text>
          </Box>

          <Box
            as="hr"
            width="100%"
            margin="0 0"
            h="1px"
            borderColor={borderColor}
          />

          <Box display="flex" flexDirection="column" gridGap="10px">
            <Text size="md" fontWeight="700">
              {t('start-date')}
            </Text>
            <Text size="md" fontWeight="400" color={fontColor}>
              {dateProps?.kickoffDate[router.locale]}
            </Text>
          </Box>

          <Box
            as="hr"
            width="100%"
            margin="0 0"
            h="1px"
            borderColor={borderColor}
          />

          <Box display="flex" flexDirection="column" gridGap="10px">
            {dateProps?.weekDays[router.locale].length > 0 && (
              <>
                <Text size="md" fontWeight="700">
                  {t('days-and-hours')}
                </Text>
                <Text size="md" fontWeight="400" color={fontColor}>
                  {dateProps?.weekDays[router.locale].map(
                    // eslint-disable-next-line no-nested-ternary
                    (day, i) => `${i !== 0 ? i < dateProps?.weekDays[router.locale].length - 1 ? ',' : ` ${t('common:and')}` : ''} ${day}`,
                  )}
                </Text>
              </>
            )}
            <Text size="md" fontWeight="400" color={fontColor}>
              {dateProps?.availableTime}
            </Text>
            <Text size="md" fontWeight="400" color={fontColor}>
              {/* {dateProps?.formatTime} */}
              {dateProps?.timezone}
            </Text>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gridGap="10px">
          <Heading size="18px" textTransform="uppercase">
            {t('profile-details')}
          </Heading>
          <Box
            as="hr"
            width="30%"
            margin="0 0 10px 0"
            h="1px"
            borderColor={borderColor2}
          />
          <Box display="flex" flexDirection="column" gridGap="10px">
            <Text size="md" fontWeight="700">
              {t('your-name')}
            </Text>
            <Text size="md" fontWeight="400" color={fontColor}>
              {`${formProps?.first_name} ${formProps?.last_name}`}
            </Text>
          </Box>
          <Box
            as="hr"
            width="100%"
            margin="0 0"
            h="1px"
            borderColor={borderColor}
          />
          <Box display="flex" flexDirection="row" gridGap="10px">
            {formProps?.phone && (
              <Box display="flex" flexDirection="column" gridGap="10px">
                <Text size="md" fontWeight="700">
                  {t('phone-number')}
                </Text>
                <Text size="md" fontWeight="400" color={fontColor}>
                  {formProps?.phone}
                </Text>
              </Box>
            )}
            <Box display="flex" flexDirection="column" gridGap="10px">
              <Text size="md" fontWeight="700">
                {t('email')}
              </Text>
              <Text size="md" fontWeight="400" color={fontColor}>
                {formProps?.email}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" flex={0.6}>
        <Box
          display="flex"
          flexDirection="column"
          background={featuredBackground}
          w="100%"
          height="fit-content"
          p="11px 14px"
          gridGap="12px"
          borderRadius="14px"
        >
          <Heading
            size="15px"
            color="blue.default"
            textTransform="uppercase"
          >
            {t('signing-for')}
          </Heading>
          <Box display="flex" gridGap="12px">
            <Box display="flex" flexDirection="column">
              <Box
                p="16px"
                background="blue.default"
                borderRadius="7px"
                width="fit-content"
              >
                <Icon
                  icon="coding"
                  width="48px"
                  height="48px"
                  color="#fff"
                />
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" gridGap="7px">
              <Heading size="18px">{courseTitle}</Heading>
              {planProps?.payment && (
                <Heading
                  size="15px"
                  textTransform="uppercase"
                  color={useColorModeValue('gray.500', 'gray.400')}
                >
                  {planProps?.payment}
                </Heading>
              )}
            </Box>
            {planProps?.price && (
              <Heading
                size="sm"
                color="blue.default"
                textTransform="uppercase"
                textAlign="end"
              >
                {planProps?.price}
              </Heading>
            )}
          </Box>
          <Box
            as="hr"
            width="100%"
            margin="0"
            h="1px"
            borderColor={borderColor}
          />
          {planProps?.bullets?.title && (
            <Box fontSize="14px" fontWeight="700" color="blue.default">
              {planProps?.bullets?.title}
            </Box>
          )}
          <Box
            as="ul"
            style={{ listStyle: 'none' }}
            display="flex"
            flexDirection="column"
            gridGap="12px"
          >
            {planProps?.bullets?.list?.map((bullet) => (
              <Box
                as="li"
                key={bullet?.title}
                display="flex"
                flexDirection="row"
                lineHeight="24px"
                gridGap="8px"
              >
                <Icon
                  icon="checked2"
                  color="#38A56A"
                  width="13px"
                  height="10px"
                  style={{ margin: '8px 0 0 0' }}
                />
                <Box
                  fontSize="14px"
                  fontWeight="600"
                  letterSpacing="0.05em"
                  dangerouslySetInnerHTML={{ __html: bullet?.title }}
                />
              </Box>
            ))}
          </Box>
        </Box>
        {!planProps.type?.includes('trial') && (
          <Button variant="default" height="45px" mt="12px">
            Proceed to payment
          </Button>
        )}
        {planProps.type?.includes('trial') && (
          <Button
            variant="outline"
            borderColor="blue.200"
            background={featuredBackground}
            _hover={{ background: featuredBackground, opacity: 0.8 }}
            _active={{ background: featuredBackground, opacity: 1 }}
            color="blue.default"
            height="45px"
            mt="12px"
          >
            Start free trial
          </Button>
        )}
      </Box>
    </Box>
  );
};

Summary.propTypes = {
  dateProps: PropTypes.objectOf(PropTypes.any).isRequired,
  formProps: PropTypes.objectOf(PropTypes.any).isRequired,
  planProps: PropTypes.objectOf(PropTypes.any).isRequired,
  courseTitle: PropTypes.string.isRequired,
};

export default Summary;
