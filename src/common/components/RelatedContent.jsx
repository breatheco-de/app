import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { getAsset } from '../../utils/requests';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';
import TagCapsule from './TagCapsule';
import Text from './Text';
import NextChakraLink from './NextChakraLink';
import { toCapitalize } from '../../utils';

function RelatedContent({ slug, type, extraQuerys, technologies, pathWithDifficulty, projectPath, ...rest }) {
  const { t, lang } = useTranslation('common');
  const [contentList, setContentList] = useState([]);
  const { featuredColor, fontColor2 } = useStyle();

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
      });
      const dataFilteredByLang = data.filter((l) => {
        const isOriginContent = l.slug === slug;
        if (!isOriginContent && ((lang === 'en' && l.lang === 'us') || l.lang === lang)) return true;
        if (!isOriginContent && lang === l.lang) return true;
        return false;
      });
      setContentList(dataFilteredByLang);
    }
  };
  useEffect(() => {
    getRelatedContent();
  }, []);

  return type && contentList.length > 0 && (
    <Flex flexDirection="column" gridGap="20px" {...rest}>
      <Heading as="h2">
        {t('related-content')}
      </Heading>
      <Flex as="section" flexWrap="wrap" flexDirection={{ base: 'column', md: 'row' }} gridGap="20px" width="100%">
        {contentList.map((item) => {
          const isLesson = getAssetPath(item) === 'lesson';
          const isExercise = getAssetPath(item) === 'interactive-exercise';
          const isProject = getAssetPath(item) === 'interactive-coding-tutorial';
          const isHowTo = getAssetPath(item) === 'how-to';
          const prefixLang = item?.lang === 'us' ? '' : `/${item?.lang}`;

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
              gridGap="15px"
              flex={contentList.length !== 1 && '1 0 calc(33.33% - 10px)'}
              flexDirection="column"
              role="group"
              width={contentList.length === 1 && '50%'}
              borderRadius="10px"
              background={featuredColor}
              padding="22px"
            >
              {item.technologies.length >= 1 && (
                <TagCapsule
                  tags={item.technologies.slice(0, 3)}
                  variant="rounded"
                  borderRadius="10px"
                  marginY="8px"
                  style={{
                    padding: '4px 10px',
                    margin: '0',
                  }}
                  gap="10px"
                  paddingX="0"
                  key={`${item.slug}-${item.difficulty}`}
                />
              )}
              <Heading as="h3">
                {item.title}
              </Heading>
              {item?.description && (
                <Text
                  color={fontColor2}
                  textAlign="left"
                  width="100%"
                  size="l"
                >
                  {item.description}
                </Text>
              )}
              <NextChakraLink
                variant="buttonDefault"
                mt="13px"
                width="fit-content"
                href={getLink()}
                display="inline-block"
                zIndex={1}
                padding="6px 15px"
                fontSize="15px"
                letterSpacing="0.05em"
              >
                {toCapitalize(t(`asset-button.${item.asset_type.toLowerCase()}`))}
              </NextChakraLink>
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
