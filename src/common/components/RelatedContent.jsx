import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { es, enUS } from 'date-fns/locale';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { getAsset } from '../../utils/requests';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';
import Text from './Text';
import NextChakraLink from './NextChakraLink';
import { isValidDate } from '../../utils';

function RelatedContent({ slug, type, extraQuerys, technologies, pathWithDifficulty, projectPath, ...rest }) {
  const { t, lang } = useTranslation('common');
  const [contentList, setContentList] = useState([]);
  const { fontColor2 } = useStyle();
  const router = useRouter();
  const getAssetPath = (asset) => {
    if (asset?.category?.slug === 'how-to' || asset?.category?.slug === 'como') return 'how-to';
    if (asset?.asset_type?.toUpperCase() === 'LESSON') return 'lesson';
    if (asset?.asset_type?.toUpperCase() === 'EXERCISE') return 'interactive-exercise';
    if (asset?.asset_type?.toUpperCase() === 'PROJECT') return 'interactive-coding-tutorial';
    return 'lesson';
  };
  const checkIsPathDifficulty = (thisDifficulty) => (pathWithDifficulty ? `/${thisDifficulty}` : '');
  const getRelatedContent = async () => {
    if (type) {
      const data = await getAsset(type, {
        ...extraQuerys,
        technologies: technologies.map((tech) => tech?.slug || tech),
        limit: 6,
      }, '', true);

      const dataFilteredByLang = data.filter((l) => {
        const isOriginContent = l.slug === slug;
        const isCurrentLang = l.lang === lang;
        const isEnglishLang = lang === 'en' && l.lang === 'us';

        if (isOriginContent) return false;
        if ((isEnglishLang || isCurrentLang)) return true;
        if (isCurrentLang) return true;
        return false;
      });
      setContentList(dataFilteredByLang);
    }
  };
  useEffect(() => {
    getRelatedContent();
  }, [router.asPath]);

  return type && contentList.length > 0 && (
    <Flex flexDirection="column" gridGap="20px" {...rest}>
      <Heading as="h2" size="24px" fontWeight={700}>
        {t('read-next')}
      </Heading>
      <Flex as="ul" flexDirection="column" gridGap="20px" width="100%">
        {contentList.map((item) => {
          const isLesson = getAssetPath(item) === 'lesson';
          const isExercise = getAssetPath(item) === 'interactive-exercise';
          const isProject = getAssetPath(item) === 'interactive-coding-tutorial';
          const isHowTo = getAssetPath(item) === 'how-to';
          const prefixLang = item?.lang === 'us' ? '' : `/${item?.lang}`;
          const date = new Date(item?.published_at);
          const dateCreated = isValidDate(item?.published_at) ? {
            es: format(date, "d 'de' MMM yyyy", { locale: es }),
            en: format(date, 'MMM d yyyy', { locale: enUS }),
          } : {};

          const getLink = () => {
            if (isLesson) {
              return `${prefixLang}/lesson/${item.slug}`;
            }
            if (isExercise) {
              return `${prefixLang}/interactive-exercise/${item.slug}`;
            }
            if (isProject) {
              return `${prefixLang}/interactive-coding-tutorial/${item.slug}`;
            }
            if (isHowTo) {
              return `${prefixLang}/how-to/${item.slug}`;
            }
            return `/${projectPath}${checkIsPathDifficulty(item.difficulty)}/${item.slug}`;
          };
          return (
            <Flex
              as="li"
              gridGap="4px"
              flexDirection="column"
              borderRadius="10px"
            >
              <NextChakraLink href={getLink()} fontSize="22px" fontWeight={700} opacity={0.7} _hover={{ textDecoration: 'underline' }}>
                {item.title}
              </NextChakraLink>
              {item?.category?.title && (
                <Text
                  color={fontColor2}
                  textAlign="left"
                  width="100%"
                  size="l"
                  opacity={0.7}
                >
                  {`${item?.category?.title} - ${dateCreated[lang]}`}
                </Text>
              )}
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}

RelatedContent.propTypes = {
  type: PropTypes.string.isRequired,
  extraQuerys: PropTypes.objectOf(PropTypes.oneOfType[PropTypes.any]),
  technologies: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  projectPath: PropTypes.string,
  pathWithDifficulty: PropTypes.bool,
  slug: PropTypes.string.isRequired,
};
RelatedContent.defaultProps = {
  extraQuerys: {},
  projectPath: '',
  pathWithDifficulty: false,
};

export default RelatedContent;
