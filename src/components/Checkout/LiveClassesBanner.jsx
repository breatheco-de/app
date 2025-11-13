import {
  Box,
  Flex,
  Stack,
  Switch,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Text from '../Text';
import Heading from '../Heading';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';

const applyTemplate = (template, replacements) => {
  if (typeof template !== 'string') return template;
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => (replacements[key] !== undefined ? replacements[key] : ''));
};

function LiveClassesBanner({
  cohorts,
  serviceItem,
  isSelected,
  onToggle,
  locale,
  copy,
}) {
  const { t } = useTranslation('signup');
  const { hexColor } = useStyle();
  const cardBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cohortBorder = useColorModeValue(hexColor.blueDefault, hexColor.blueDefault);
  const cohortsList = Array.isArray(cohorts) ? cohorts : [];

  const label = isSelected
    ? (copy?.toggleOn || t('live-classes.toggle-on'))
    : (copy?.toggleOff || t('live-classes.toggle-off'));
  const toggleAria = copy?.toggleAria || t('live-classes.toggle-aria');

  const formatDateTime = useMemo(() => {
    try {
      const formatter = new Intl.DateTimeFormat(locale || 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      return (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return isoString;
        return formatter.format(date);
      };
    } catch (error) {
      return (value) => value || '';
    }
  }, [locale]);

  if (cohortsList.length === 0) {
    return null;
  }

  return (
    <Box
      width="100%"
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      background={cardBg}
      padding="18px"
      marginTop="18px"
    >
      <Flex
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', md: 'center' }}
        gap="12px"
        flexWrap="wrap"
      >
        <Box flex="1" minWidth="220px">
          <Heading as="h3" fontSize="lg" marginBottom="6px">
            {copy?.title || t('live-classes.title')}
          </Heading>
          {copy?.description && (
            <Text fontSize="sm" color="gray.600">
              {copy.description}
            </Text>
          )}
        </Box>
        {serviceItem && (
          <Flex alignItems="center" gap="12px" minWidth="fit-content">
            <Flex alignItems="center" gap="8px">
              <Switch
                colorScheme="teal"
                isChecked={isSelected}
                onChange={onToggle}
                aria-label={toggleAria}
              />
              <Text fontSize="sm" color="gray.500">
                {copy?.shortDescription || label}
              </Text>
            </Flex>
            <Flex direction="column" alignItems="flex-end">
              {copy?.price && (
                <Text fontSize="sm" fontWeight="600" color={hexColor.green}>
                  {copy.price}
                </Text>
              )}
              {copy?.planLabel && (
                <Text fontSize="xs" color="gray.500">
                  {copy.planLabel}
                </Text>
              )}
            </Flex>
          </Flex>
        )}
      </Flex>

      <Box marginTop="18px">
        <Text fontSize="sm" fontWeight="600" color="gray.700">
          {copy?.programsLabel || t('live-classes.programs-label')}
        </Text>
        <Stack spacing="12px" marginTop="10px">
          {cohortsList.map((syllabusGroup, syllabusIndex) => {
            const syllabusKey = syllabusGroup?.syllabus?.slug
              || (syllabusGroup?.syllabus?.id ? `syllabus-${syllabusGroup.syllabus.id}` : `syllabus-${syllabusIndex}`);
            const programName = syllabusGroup?.syllabus?.name || syllabusGroup?.syllabus?.slug || '';
            const cohortList = Array.isArray(syllabusGroup?.cohorts) ? syllabusGroup.cohorts : [];

            return (
              <Box key={syllabusKey}>
                <Flex alignItems="center" gap="6px">
                  <Icon icon="checked2" width="14px" height="14px" color={hexColor.blueDefault} />
                  <Text fontSize="sm" fontWeight="500">
                    {programName}
                  </Text>
                </Flex>
                <Stack spacing="4px" marginTop="6px">
                  {cohortList.map((cohort, cohortIndex) => {
                    const cohortKey = cohort?.slug
                      || (cohort?.id ? `cohort-${cohort.id}` : `cohort-${syllabusKey}-${cohortIndex}`);
                    const liveClasses = Array.isArray(cohort?.live_classes) ? cohort.live_classes : [];
                    const timezoneLabel = copy?.timezoneTemplate
                      ? applyTemplate(copy.timezoneTemplate, { timezone: cohort?.timezone || 'UTC' })
                      : t('live-classes.timezone', { timezone: cohort?.timezone || 'UTC' });

                    return (
                      <Box
                        key={cohortKey}
                        borderLeft="2px solid"
                        borderColor={cohortBorder}
                        paddingLeft="12px"
                      >
                        <Text fontSize="sm" fontWeight="500">
                          {t('live-classes.cohort-label', { name: cohort?.name || cohort?.slug || '' })}
                        </Text>
                        {timezoneLabel && (
                          <Text fontSize="xs" color="gray.500">
                            {timezoneLabel}
                          </Text>
                        )}
                        <Stack spacing="4px" marginTop="6px">
                          {liveClasses.length > 0 ? liveClasses.map((session) => {
                            const sessionKey = session?.id || session?.hash || session?.starting_at;
                            const start = formatDateTime(session?.starting_at);
                            const end = formatDateTime(session?.ending_at);
                            const rangeLabel = copy?.classRangeTemplate
                              ? applyTemplate(copy.classRangeTemplate, { start, end })
                              : t('live-classes.class-range', { start, end });

                            return (
                              <Text key={sessionKey} fontSize="xs" color="gray.600">
                                {rangeLabel}
                              </Text>
                            );
                          }) : (
                            <Text fontSize="xs" color="gray.500">
                              {copy?.noSchedule || t('live-classes.no-schedule')}
                            </Text>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

LiveClassesBanner.propTypes = {
  cohorts: PropTypes.arrayOf(PropTypes.shape({
    syllabus: PropTypes.shape({
      id: PropTypes.number,
      slug: PropTypes.string,
      name: PropTypes.string,
    }),
    cohorts: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      slug: PropTypes.string,
      name: PropTypes.string,
      timezone: PropTypes.string,
      live_classes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        hash: PropTypes.string,
        starting_at: PropTypes.string,
        ending_at: PropTypes.string,
      })),
    })),
  })),
  serviceItem: PropTypes.shape({
    id: PropTypes.number,
    price: PropTypes.number,
    price_per_unit: PropTypes.number,
    price_text: PropTypes.string,
    periodicity: PropTypes.string,
    period: PropTypes.string,
  }),
  isSelected: PropTypes.bool,
  onToggle: PropTypes.func,
  locale: PropTypes.string,
  copy: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    shortDescription: PropTypes.string,
    price: PropTypes.string,
    planLabel: PropTypes.string,
    toggleOn: PropTypes.string,
    toggleOff: PropTypes.string,
    toggleAria: PropTypes.string,
    program: PropTypes.string,
    programsLabel: PropTypes.string,
    timezoneTemplate: PropTypes.string,
    classRangeTemplate: PropTypes.string,
    noSchedule: PropTypes.string,
  }),
};

LiveClassesBanner.defaultProps = {
  cohorts: [],
  serviceItem: null,
  isSelected: false,
  onToggle: () => {},
  locale: 'en-US',
  copy: {},
};

export default LiveClassesBanner;
