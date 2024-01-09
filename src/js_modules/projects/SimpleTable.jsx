import { useColorModeValue, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import TagCapsule from '../../common/components/TagCapsule';
import Text from '../../common/components/Text';
import Link from '../../common/components/NextChakraLink';

function SimpleTable({
  difficulty,
  repository,
  duration,
  videoAvailable,
  liveDemoAvailable,
  technologies,
  href,
}) {
  const { t, lang } = useTranslation('exercises');
  const verifyIfNotNull = (value) => value !== null && value;
  const commonBorderColor = useColorModeValue('gray.250', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const langPrefix = lang === 'en' ? '' : `/${lang}`;

  return (
    <Flex flexDirection="column" width="100%">
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          {t('common:difficulty')}
        </Text>
        {verifyIfNotNull(difficulty) ? (
          <Link
            href={`${href}?difficulty=${difficulty}`}
            color="blue.default"
            fontSize="15px"
            textTransform="capitalize"
          >
            {verifyIfNotNull(difficulty) ? difficulty : t('common:not-available')}
          </Link>
        ) : (
          <Text size="l" color={commonTextColor} textTransform="capitalize">
            {t('common:not-available')}
          </Text>
        )}
      </Flex>
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          {t('common:repository')}
        </Text>
        {repository ? (
          <Link
            href={repository || ''}
            color="blue.default"
            fontSize="15px"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('common:click-to-open')}
          </Link>
        ) : (
          <Text size="l" color={commonTextColor}>
            {t('common:not-available')}
          </Text>
        )}
      </Flex>
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          Video
        </Text>
        {videoAvailable === null ? (
          <Text size="l" color={commonTextColor}>
            {t('common:not-available')}
          </Text>
        ) : (
          <Link
            href={videoAvailable}
            color="blue.default"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '15px' }}
          >
            {t('common:click-to-open')}
          </Link>
        )}
      </Flex>
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          {t('common:live-demo')}
          {/* Live Demo Available */}
        </Text>
        {liveDemoAvailable ? (
          <Link
            href={liveDemoAvailable}
            color="blue.default"
            fontSize="15px"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('common:click-to-open')}
          </Link>
        ) : (
          <Text size="l" color={commonTextColor}>
            {t('common:not-available')}
          </Text>
        )}
      </Flex>
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          {t('common:average-duration')}
        </Text>
        <Text size="l" color={commonTextColor}>
          {duration
            ? `${duration} hrs`
            : t('common:not-available')}
        </Text>
      </Flex>

      <Flex
        flexDirection="column"
        pt="14px"
        width="100%"
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          {t('common:technologies')}
        </Text>
        <TagCapsule
          isLink
          href={`${langPrefix}${href}`}
          variant="rounded"
          tags={technologies}
          marginY="8px"
          style={{
            padding: '2px 10px',
            margin: '0',
          }}
          gap="10px"
          paddingX="0"
        />
      </Flex>
    </Flex>
  );
}

SimpleTable.propTypes = {
  difficulty: PropTypes.string,
  repository: PropTypes.string,
  duration: PropTypes.number,
  videoAvailable: PropTypes.string,
  liveDemoAvailable: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  technologies: PropTypes.arrayOf(PropTypes.string),
  href: PropTypes.string.isRequired,
};

SimpleTable.defaultProps = {
  difficulty: 'Intermediate',
  repository: 'Not available',
  videoAvailable: 'Not available',
  duration: 0,
  liveDemoAvailable: '',
  technologies: [],
};

export default SimpleTable;
