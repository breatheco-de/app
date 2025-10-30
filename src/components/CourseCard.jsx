import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Flex, Link, Image, Img,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { usePersistentBySession } from '../hooks/usePersistent';
import { parseQuerys } from '../utils/url';
import Heading from './Heading';
import Text from './Text';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function CourseCard({
  course, showDescription, showIncludedBadge, width, linkType, ...rest
}) {
  const { t, lang } = useTranslation('pricing');
  const { hexColor, modal, backgroundColor4 } = useStyle();
  const [couponFromSession] = usePersistentBySession('coupon', '');

  const buildQueryParams = (utm = {}) => {
    const params = {};
    if (utm) {
      Object.entries(utm).forEach(([key, value]) => {
        if (value) params[`utm_${key}`] = value;
      });
    }
    if (couponFromSession) {
      params.ref = couponFromSession;
    }

    return parseQuerys(params);
  };
  return (
    <Flex
      key={course.slug}
      width={width}
      borderRadius="8px"
      background={modal.background3}
      padding="24px 8px 8px"
      justifyContent="space-between"
      justifySelf="center"
      minHeight="200px"
      flexDirection="column"
      gridGap="16px"
      position="relative"
      marginBottom="24px"
      {...rest}
    >
      <Box
        position="absolute"
        borderRadius="full"
        top="-22px"
        left="8px"
        width="44px"
        height="44px"
        background={course.color || hexColor.blueDefault}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {course?.icon ? (
          <Icon icon={course.icon} width="24px" height="24px" color="white" />
        ) : (
          <Img src={course.icon_url} width="44px" height="44px" />
        )}
      </Box>
      <Flex flexDirection="column" gridGap="8px">
        <Heading
          size="21px"
          as="h3"
          lineHeight="normal"
          fontWeight="700"
          color={course.color}
        >
          {course?.course_translation?.title}
        </Heading>
        {showDescription && (
          <Text size="14px" fontWeight="500">
            {course?.course_translation?.description}
          </Text>
        )}
      </Flex>
      {showIncludedBadge && (
        <Box
          background="#25BF6C"
          color="white"
          fontSize="12px"
          fontWeight="600"
          padding="4px 8px"
          borderRadius="full"
          width="fit-content"
        >
          {t('selfpaced-included')}
        </Box>
      )}
      {course?.course_translation?.landing_variables?.card?.length > 0 && (
        <Flex flexDirection="column" gridGap="10px" borderRadius="4px" padding="12px" background={backgroundColor4}>
          {course?.course_translation?.landing_variables?.card?.map((content) => {
            const isUrlImage = content?.icon?.includes('http');
            return (
              <Flex key={content.title} gridGap="10px">
                {isUrlImage ? (
                  <Image src={course?.icon} width="18px" height="18px" borderRadius="8px" background={course?.color || 'green.400'} />
                ) : (
                  <Icon icon={content?.icon} width="18px" height="18px" color={hexColor.blueDefault} />
                )}
                <Text size="14px" fontWeight="500" letterSpacing="normal">
                  {content.title}
                  {' '}
                  <Text as="span" size="14px" fontWeight="700">
                    {content.value}
                  </Text>
                </Text>
              </Flex>
            );
          })}
        </Flex>
      )}
      <Link
        variant="buttonDefault"
        borderRadius="3px"
        href={linkType === 'external'
          ? `https://4geeksacademy.com/${lang === 'en' ? 'us' : lang}/coding-bootcamps/${course?.slug}${buildQueryParams(course?.utm)}`
          : `/${lang}/bootcamp/${course?.slug}${buildQueryParams()}`}
        target={linkType === 'external' ? '_blank' : '_self'}
        textAlign="center"
        width="100%"
        opacity="0.9"
        _hover={{ opacity: 1 }}
        _active={{ opacity: 1 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap="10px"
      >
        <Text fontSize="auto">{t('see-plans-and-prices')}</Text>
        <Icon icon="longArrowRight" width="18px" height="18px" color="white" />
      </Link>
    </Flex>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    slug: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
    icon_url: PropTypes.string,
    utm: PropTypes.shape({
      source: PropTypes.string,
      medium: PropTypes.string,
      campaign: PropTypes.string,
    }),
    course_translation: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      landing_variables: PropTypes.shape({
        card: PropTypes.arrayOf(PropTypes.shape({
          title: PropTypes.string,
          value: PropTypes.string,
          icon: PropTypes.string,
        })),
      }),
    }),
  }).isRequired,
  showDescription: PropTypes.bool,
  showIncludedBadge: PropTypes.bool,
  width: PropTypes.string,
  linkType: PropTypes.oneOf(['internal', 'external']),
};

CourseCard.defaultProps = {
  showDescription: false,
  showIncludedBadge: false,
  width: '320px',
  linkType: 'external',
};

export default CourseCard;
