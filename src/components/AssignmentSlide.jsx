import React from 'react';
import PropTypes from 'prop-types';
import {
  Flex,
  Box,
  Image,
  Badge,
  Text,
  Heading,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function AssignmentSlide({ assignment }) {
  const { t } = useTranslation('common');
  const { lightColor, borderColorStrong, backgroundColor } = useStyle();

  const difficultyLevel = {
    EASY: 'green',
    BEGINNER: 'green',
    INTERMEDIATE: 'yellow',
    HARD: 'red',
  };

  if (!assignment) return null;

  return (
    <Box
      width="100%"
      borderColor={borderColorStrong}
      borderRadius="10px"
      overflow="hidden"
      bg={backgroundColor}
      p="16px"
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      gridGap="16px"
      alignItems="stretch"
      minHeight="250px"
    >
      <Box
        flex={{ base: 'none', md: '1' }}
        minWidth={{ base: '100%', md: '250px' }}
        maxWidth={{ base: '100%', md: '400px' }}
        height={{ base: '200px', md: '250px' }}
        bg={/\.gif(\?|$)/i.test(assignment?.preview) ? 'transparent' : 'black'}
        display="flex"
        justifyContent="center"
        alignItems="center"
        alignSelf={{ base: 'center', md: 'stretch' }}
        borderRadius="10px"
        overflow="hidden"
        mb={{ base: 4, md: 0 }}
      >
        <Image
          src={assignment?.preview}
          alt={assignment?.title}
          objectFit={/\.gif(\?|$)/i.test(assignment?.preview) ? 'contain' : 'cover'}
          width="100%"
          height="100%"
        />
      </Box>

      <Flex
        flex="1"
        flexDirection="column"
        gridGap="10px"
        justifyContent="space-between"
        pl={{ base: 0, md: '16px' }}
      >
        <Flex gridGap="8px" justifyContent="space-between" alignItems="flex-start">
          <Flex gap="5px" flexWrap="wrap" flexGrow="1" alignItems="center">
            {assignment?.technologies?.map((tech) => (
              <Box key={tech?.title}>
                {tech?.icon_url ? (
                  <Image src={tech.icon_url} width="18px" height="18px" alt={tech.title} />
                ) : (
                  <Badge borderRadius="10px" px="8px" colorScheme="blue">{tech?.title}</Badge>
                )}
              </Box>
            ))}
          </Flex>

          <Flex alignItems={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="5px">
            {assignment?.duration && (
              <Badge
                borderRadius="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon icon="clock" width="14px" height="14px" color="black" />
                <Text fontSize="12px" ml="4px">
                  {`${assignment.duration} hours`}
                </Text>
              </Badge>
            )}
            {assignment?.published_at && (
              <Text fontSize="12px" color="gray.500" mt={{ base: 1, md: 0 }}>
                {new Date(assignment?.published_at)?.toLocaleDateString()}
              </Text>
            )}
          </Flex>
        </Flex>

        <Flex direction="column" mt="16px" gap="16px">
          <Heading fontSize="20px" fontWeight="bold">{assignment?.title}</Heading>
          <Text fontSize="14px" color={lightColor}>{assignment?.description}</Text>
        </Flex>

        <Flex alignItems="flex-end" justifyContent="space-between" mt="auto">
          <Badge
            colorScheme={assignment?.difficulty ? difficultyLevel[assignment?.difficulty.toUpperCase()] : 'transparent'}
            alignSelf="flex-start"
            borderRadius="10px"
            padding="3px 5px"
          >
            {assignment?.difficulty && (
              t(`${assignment?.difficulty?.toLowerCase()}`)
            )}
          </Badge>
          <Flex gap="10px">
            <Icon icon="rigobot-avatar-tiny" width="18px" height="18px" />
            {assignment?.learnpack_deploy_url && <Icon icon="learnpack" width="18px" height="18px" />}
            {assignment?.template_url && <Icon icon="download" width="18px" height="18px" />}
            {assignment?.with_video && <Icon icon="video" width="18px" height="18px" />}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

AssignmentSlide.propTypes = {
  assignment: PropTypes.shape({
    preview: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    technologies: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      icon_url: PropTypes.string,
    })),
    duration: PropTypes.number,
    published_at: PropTypes.string,
    difficulty: PropTypes.string,
    learnpack_deploy_url: PropTypes.string,
    template_url: PropTypes.string,
    with_video: PropTypes.bool,
  }),
};

AssignmentSlide.defaultProps = {
  assignment: null,
};

export default AssignmentSlide;
