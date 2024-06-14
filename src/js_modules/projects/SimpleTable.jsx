import { useColorModeValue, Flex, Box } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { getDifficultyColors } from './ProjectList';
import useAuth from '../../common/hooks/useAuth';
import TagCapsule from '../../common/components/TagCapsule';
import Text from '../../common/components/Text';
import Link from '../../common/components/NextChakraLink';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';

function LinkedContent({ href, title, disableUntilAuth, icon }) {
  const { isAuthenticated } = useAuth();
  const { hexColor } = useStyle();
  const commonBorderColor = useColorModeValue('gray.250', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  return (
    <Flex
      width="100%"
      py="14px"
      borderBottom={1}
      borderStyle="solid"
      borderColor={commonBorderColor}
      justifyContent="space-between"
      alignItems="center"
      position="relative"
    >
      <Text size="l" color={commonTextColor} display="flex" alignItems="center" gap="8px">
        {icon}
        {title}
      </Text>
      {disableUntilAuth && !isAuthenticated ? (
        <Icon icon="verified2" color={hexColor.greenLight} width="15px" height="15px" />
      ) : (
        <Link
          href={href}
          color={commonTextColor}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '15px' }}
          _after={{
            content: '""',
            position: 'absolute',
            inset: 0,
          }}
          _hover={{
            color: 'blue.default',
          }}
        >
          <Icon icon="external-link" color="currentColor" width="15px" height="15px" />
        </Link>
      )}
    </Flex>
  );
}

function SimpleTable({
  difficulty,
  // repository,
  duration,
  videoAvailable,
  solution,
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
      <Flex
        // flexDirection="column"
        width="100%"
        display={{ base: 'flex', md: 'none' }}
        flexWrap="wrap"
        justifyContent="space-between"
        rowGap="5px"
      >
        {verifyIfNotNull(difficulty) && (
          <Box
            display="flex"
            alignItems="center"
            gap="10px"
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            minWidth="50%"
            maxWidth="100%"
            flexGrow="1"
          >
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
                marginY="0"
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
        {duration && (
          <Box
            display="flex"
            alignItems="center"
            gap="10px"
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
            minWidth="50%"
            maxWidth="100%"
            flexGrow="1"
            py="10px"
          >
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
        )}
        {videoAvailable !== null && (
          <LinkedContent
            title={t('common:video-solution')}
            href={videoAvailable}
            disableUntilAuth
            icon={(<Icon icon="video" color="#A9A9A9" width="32px" height="32px" />)}
          />
        )}
        {solution !== null && (
          <LinkedContent
            title={t('common:solution-code')}
            href={solution}
            disableUntilAuth
            icon={(<Icon icon="coding" color="#A9A9A9" width="32px" height="32px" />)}
          />
        )}
        {/* {repository && isAuthenticated && (
          <LinkedContent
            title={t('common:repository')}
            href={repository || ''}
            icon={(<Icon icon="github" color="#A9A9A9" width="32px" height="32px" />)}
          />
        )} */}
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
              marginY="0"
              style={{
                padding: '2px 10px',
                margin: '0',
              }}
              gap="10px"
              paddingX="0"
            />
          </Flex>
        )}
        {duration && (
          <Flex
            width="100%"
            py="14px"
            borderBottom={1}
            // borderTop={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
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
        {videoAvailable !== null && (
          <LinkedContent
            title={t('common:video-solution')}
            href={videoAvailable}
            disableUntilAuth
            icon={(<Icon icon="video" color="#A9A9A9" width="28px" height="28px" />)}
          />
        )}
        {solution !== null && (
          <LinkedContent
            title={t('common:solution-code')}
            href={solution}
            disableUntilAuth
            icon={(<Icon icon="coding" color="#A9A9A9" width="28px" height="28px" />)}
          />
        )}
        {/* {repository && isAuthenticated && (
          <LinkedContent
            title={t('common:repository')}
            href={repository || ''}
            icon={(<Icon icon="github" color="#A9A9A9" width="26px" height="26px" />)}
          />
        )} */}
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

LinkedContent.propTypes = {
  href: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  disableUntilAuth: PropTypes.bool,
};
LinkedContent.defaultProps = {
  disableUntilAuth: false,
};
SimpleTable.propTypes = {
  difficulty: PropTypes.string,
  // repository: PropTypes.string,
  duration: PropTypes.number,
  videoAvailable: PropTypes.string,
  solution: PropTypes.string,
  technologies: PropTypes.arrayOf(PropTypes.string),
  href: PropTypes.string.isRequired,
};
SimpleTable.defaultProps = {
  difficulty: 'Intermediate',
  // repository: 'Not available',
  videoAvailable: 'Not available',
  solution: null,
  duration: 0,
  technologies: [],
};

export default SimpleTable;
