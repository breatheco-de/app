import { useColorModeValue, Flex, Box } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { getDifficultyColors } from './ProjectList';
import TagCapsule from '../../common/components/TagCapsule';
import Text from '../../common/components/Text';
import Link from '../../common/components/NextChakraLink';
import Icon from '../../common/components/Icon';

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
    <>
      {/* RESPONSIVE VERSION */}
      <Flex flexDirection="column" width="100%" display={{ base: 'flex', md: 'none' }}>
        {(repository || verifyIfNotNull(difficulty)) && (
          <Flex
            width="100%"
            py="14px"
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            justifyContent="space-between"
          >
            {verifyIfNotNull(difficulty) && (
              <Box display="flex" alignItems="center" gap="10px">
                <Icon icon="measurer" width="32px" height="32px" />
                <Box>
                  <Text size="l" color={commonTextColor}>
                    {t('common:difficulty')}
                  </Text>
                  <TagCapsule
                    variant="rounded"
                    tags={[difficulty]}
                    background={getDifficultyColors(difficulty).bg}
                    color={getDifficultyColors(difficulty).color}
                    fontWeight={700}
                    marginY="8px"
                    style={{
                      padding: '2px 10px',
                      margin: '0',
                    }}
                    gap="10px"
                    paddingX="0"
                  />
                </Box>
              </Box>
            )}
            {repository && (
              <Box display="flex" alignItems="center" gap="10px">
                <Icon icon="github" color="#A9A9A9" width="32px" height="32px" />
                <Box>
                  <Text size="l" color={commonTextColor} display="flex" gap="8px" alignItems="center">
                    {t('common:repository')}
                  </Text>
                  <Link
                    href={repository || ''}
                    color="blue.default"
                    fontSize="15px"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('common:click-to-open')}
                  </Link>
                </Box>
              </Box>
            )}
          </Flex>
        )}
        {(liveDemoAvailable || videoAvailable !== null) && (
          <Flex
            width="100%"
            py="14px"
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            justifyContent="space-between"
          >
            {videoAvailable !== null && (
              <Box display="flex" alignItems="center" gap="10px">
                <Icon icon="video" color="#A9A9A9" width="32px" height="32px" />
                <Box>
                  <Text size="l" color={commonTextColor} display="flex" alignItems="center" gap="8px">
                    Video
                  </Text>
                  <Link
                    href={videoAvailable}
                    color="blue.default"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '15px' }}
                  >
                    {t('common:click-to-open')}
                  </Link>
                </Box>
              </Box>
            )}
            {liveDemoAvailable && (
              <Box display="flex" alignItems="center" gap="10px">
                <Icon icon="lightBulb" width="32px" height="32px" />
                <Box>
                  <Text size="l" color={commonTextColor} display="flex" alignItems="center" gap="8px">
                    {t('common:live-demo')}
                    {/* Live Demo Available */}
                  </Text>
                  <Link
                    href={liveDemoAvailable}
                    color="blue.default"
                    fontSize="15px"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('common:click-to-open')}
                  </Link>
                </Box>
              </Box>
            )}
          </Flex>
        )}
        {duration && (
          <Flex
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            width="100%"
            py="14px"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap="10px">
              <Icon icon="clock" width="32px" height="32px" />
              <Box>
                <Text size="l" color={commonTextColor} display="flex" alignItems="center" gap="8px">
                  {t('common:average-duration')}
                </Text>
                <Text size="l" color={commonTextColor}>
                  {`${duration} hrs`}
                </Text>
              </Box>
            </Box>
          </Flex>
        )}
        {technologies?.length > 0 && (
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
        )}
      </Flex>
      {/* DESKTOP VERSION */}
      <Flex flexDirection="column" width="100%" display={{ base: 'none', md: 'flex' }}>
        {verifyIfNotNull(difficulty) && (
          <Flex
            width="100%"
            py="14px"
            borderBottom={1}
            borderTop={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            justifyContent="space-between"
            alignItems="center"
          >
            <Text size="l" color={commonTextColor} display="flex" alignItems="center" gap="8px">
              <Icon icon="measurer" width="32px" height="32px" />
              {t('common:difficulty')}
            </Text>
            <TagCapsule
              variant="rounded"
              tags={[difficulty]}
              background={getDifficultyColors(difficulty).bg}
              color={getDifficultyColors(difficulty).color}
              fontWeight={700}
              marginY="8px"
              style={{
                padding: '2px 10px',
                margin: '0',
              }}
              gap="10px"
              paddingX="0"
            />
          </Flex>
        )}
        {repository && (
          <Flex
            width="100%"
            py="14px"
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            justifyContent="space-between"
            alignItems="center"
          >
            <Text size="l" color={commonTextColor} display="flex" gap="8px" alignItems="center">
              <Icon icon="github" color="#A9A9A9" width="32px" height="32px" />
              {t('common:repository')}
            </Text>
            <Link
              href={repository || ''}
              color="blue.default"
              fontSize="15px"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('common:click-to-open')}
            </Link>
          </Flex>
        )}
        {videoAvailable !== null && (
          <Flex
            width="100%"
            py="14px"
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            justifyContent="space-between"
            alignItems="center"
          >
            <Text size="l" color={commonTextColor} display="flex" alignItems="center" gap="8px">
              <Icon icon="video" color="#A9A9A9" width="32px" height="32px" />
              Video
            </Text>
            <Link
              href={videoAvailable}
              color="blue.default"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '15px' }}
            >
              {t('common:click-to-open')}
            </Link>
          </Flex>
        )}
        {liveDemoAvailable && (
          <Flex
            width="100%"
            py="14px"
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            justifyContent="space-between"
            alignItems="center"
          >
            <Text size="l" color={commonTextColor} display="flex" alignItems="center" gap="8px">
              <Icon icon="lightBulb" width="32px" height="32px" />
              {t('common:live-demo')}
              {/* Live Demo Available */}
            </Text>
            <Link
              href={liveDemoAvailable}
              color="blue.default"
              fontSize="15px"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('common:click-to-open')}
            </Link>
          </Flex>
        )}
        {duration && (
          <Flex
            width="100%"
            py="14px"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text size="l" color={commonTextColor} display="flex" alignItems="center" gap="8px">
              <Icon icon="clock" width="32px" height="32px" />
              {t('common:average-duration')}
            </Text>
            <Text size="l" color={commonTextColor}>
              {`${duration} hrs`}
            </Text>
          </Flex>
        )}
        {technologies?.length > 0 && (
          <Flex
            flexDirection="column"
            pt="14px"
            width="100%"
            justifyContent="space-between"
            borderTop={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
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
        )}
      </Flex>
    </>
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
