/* eslint-disable max-len */
import { useState, useEffect, forwardRef } from 'react';
import {
  Container,
  Flex,
  Divider,
  useColorMode,
  useColorModeValue,
  Button,
  Tooltip,
  Box,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
} from '@chakra-ui/react';
import { ArrowUpIcon, ChevronDownIcon, CloseIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import bc from '../../common/services/breathecode';
import Link from '../../common/components/NextChakraLink';
import Icon from '../../common/components/Icon';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import asPrivate from '../../context/PrivateRouteWrapper';
import CustomTheme from '../../../styles/theme';
import GridContainer from '../../common/components/GridContainer';
import { error } from '../../utils/logging';

// eslint-disable-next-line react/prop-types
const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => {
  const { t } = useTranslation('mentorship');

  return (
    // eslint-disable-next-line react/button-has-type
    <Button
      size={['md', 'md', 'lg', 'lg']}
      display="inline-block"
      colorScheme="blue"
      variant="ghost"
      onClick={onClick}
      ref={ref}
      marginLeft={['5px', '5px', '10px', '10px']}
    >
      {value || t('common:select')}
      {' '}
      <ChevronDownIcon />
    </Button>
  );
});

function Mentorship() {
  const { t } = useTranslation('mentorship');
  const { colorMode } = useColorMode();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);

  const setInitialDate = () => {
    const { month } = router.query;
    if (month) {
      if (month === 'all') {
        return null;
      }
      return new Date(month);
    }
    return startOfMonth(new Date());
  };

  const [startDate, setStartDate] = useState(setInitialDate());
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState({ show: false, session: null });
  const commonBorderColor = useColorModeValue('gray.250', 'gray.900');
  const commonFontColor = useColorModeValue('gray.dark', 'gray.light');

  const getMentorshipSessions = async () => {
    setIsLoading(true);
    let filter = {};
    if (startDate) {
      filter = {
        started_after: format(startDate, 'yyyy-MM-dd'),
        ended_before: format(endOfMonth(startDate), 'yyyy-MM-dd'),
      };
    }
    try {
      const { data } = await bc.mentorship(filter).getMySessions();
      setIsLoading(false);
      setSessions(data);
    } catch (e) {
      error(e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMentorshipSessions();
  }, [startDate]);

  const getExtraTime = (str) => str.substr(0, str.indexOf(', the expected duration')).replace('Extra time of ', '');
  const getExpectedTime = (str) => str.substr(str.indexOf(', the expected duration')).replace(', the expected duration was ', '');

  const getLateTime = (str) => str.substr(0, str.indexOf(' after.')).replace('The mentor joined ', '');

  const tooltipsGenerator = (session) => {
    const tooltips = [];
    if (!session.mente_joined) {
      tooltips.push({
        icon: 'ghost',
        label: t('ghostLabel'),
      });
    }
    if (session.mentor_late) {
      tooltips.push({
        icon: 'running',
        label: t('mentorLate', { time: getLateTime(session.mentor_late) }),
      });
    }
    if (session.extra_time) {
      let label;
      if (session.extra_time.includes('Many days of extra time')) label = t('manyDays');
      else if (session.extra_time.includes('Extra time of')) label = t('extraTime', { extra: getExtraTime(session.extra_time), expected: getExpectedTime(session.extra_time) });
      else if (session.extra_time.includes('Please setup')) label = t('setUpService');
      else label = session.extra_time;
      tooltips.push({
        icon: 'chronometer',
        label,
      });
    }
    if (session.rating?.score) {
      let ratingIcon;
      if (session.rating.score >= 8) ratingIcon = 'smile';
      else if (session.rating.score > 7) ratingIcon = 'regularFace';
      else ratingIcon = 'sad';

      tooltips.push({
        icon: ratingIcon,
        label: `${t('rate')} ${session.rating.score}`,
      });
    }
    return tooltips;
  };

  return (
    <Container maxW="none" padding="0">
      <GridContainer
        withContainer
        my="3rem"
        className="kpi-container"
        maxW="none"
        paddingTop="20px"
        paddingBottom="20px"
      >
        <Link
          href="/"
          display="inline-block"
          padding={{ base: '0px 10px 15px 10px', md: '0' }}
          w="auto"
          borderRadius="15px"
          color="blue.default"
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
        >
          {`← ${t('common:goBack')}`}
        </Link>
        <Container maxW="none" padding="0">
          <Heading as="h2" size="m" maxW="90%">
            {`${t('log')}:`}
            <Box display="inline-block" maxW="100px">
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  router.push(`?month=${date}`);
                  setStartDate(date);
                }}
                customInput={<ExampleCustomInput />}
                dateFormat="MM/yyyy"
                showMonthYearPicker
              />
            </Box>
            {startDate && (
              <IconButton
                marginLeft={['5px', '5px', '90px', '90px']}
                colorScheme="blue"
                aria-label="Clear"
                size="xs"
                icon={<CloseIcon />}
                onClick={() => {
                  router.push('?month=all');
                  setStartDate(null);
                }}
              />
            )}
          </Heading>
        </Container>
      </GridContainer>
      <Divider borderBottomWidth="2px" />

      <Box
        display="grid"
        gridTemplateColumns={{
          base: '.5fr repeat(12, 1fr) .5fr',
          md: '1.8fr repeat(12, 1fr) 1.8fr',
        }}
      >
        <Box gridColumn="2 / span 12" width="100%">
          {/* Header */}
          <Flex
            p="20px"
            fontWeight="700"
            color={commonFontColor}
          >
            <Box width="35%" pl="20px">
              {t('mentorshipSession')}
            </Box>
            <Box width="40%" pl="20px">
              {t('events')}
            </Box>
            <Box width="25%" pl="20px">
              {t('billed')}
            </Box>
          </Flex>

          {/* Sessions List */}
          <Box display="flex" flexDirection="column" gap="15px">
            {sessions?.length > 0 && sessions.map((session) => (
              <Flex
                key={session.id}
                alignItems="center"
                p="20px"
                border="1px solid"
                borderColor="#DADADA"
                borderRadius="17px"
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              >
                {/* Session Date and Mentee */}
                <Box width="35%" pl="20px">
                  <Text fontSize="md">
                    {session.started_at ? `${format(new Date(session.started_at.slice(0, -1)), 'MMMM dd, y, h:mm aaa')}` : t('invalidDate')}
                  </Text>
                  {session.mentee ? (
                    <Text fontSize="md">
                      {t('with')}
                      {' '}
                      <Box as="span" fontWeight="bold">
                        {`${session.mentee.first_name ? session.mentee.first_name : ''} ${session.mentee.last_name ? session.mentee.last_name : ''}`}
                      </Box>
                    </Text>
                  ) : (
                    <Text fontSize="md" fontWeight="bold">
                      {t('ghostLabel')}
                    </Text>
                  )}
                </Box>

                {/* Icons and Events */}
                <Box width="40%" pl="20px">
                  <Flex alignItems="center" display={{ base: 'none', md: 'flex' }}>
                    {tooltipsGenerator(session).map((tooltip) => (
                      <Tooltip key={tooltip.label} label={tooltip.label} fontSize="md" placement="top">
                        <Box>
                          <Icon
                            style={{ marginRight: '15px' }}
                            icon={tooltip.icon}
                            width="25px"
                            height="25px"
                            color={colorMode === 'light' ? CustomTheme.colors.gray.dark : CustomTheme.colors.white}
                          />
                        </Box>
                      </Tooltip>
                    ))}
                    <Button
                      colorScheme="blue.default"
                      variant="link"
                      onClick={() => setShowModal({ show: true, session })}
                    >
                      {t('details')}
                    </Button>
                  </Flex>
                </Box>

                {/* Billed Time */}
                <Box width="25%" pl="20px">
                  <Text
                    marginBottom={['10px', '0', '0', '0']}
                    fontSize="md"
                    color={session.extra_time ? CustomTheme.colors.danger : undefined}
                  >
                    {session.extra_time && <ArrowUpIcon />}
                    {session.billed_str}
                  </Text>
                  {/* Mobile View Icons */}
                  <Flex
                    wrap="wrap"
                    maxWidth="250px"
                    alignItems="center"
                    display={{ base: 'flex', md: 'none' }}
                  >
                    {tooltipsGenerator(session).map((tooltip) => (
                      <Tooltip key={tooltip.label} label={tooltip.label} fontSize="md" placement="top">
                        <Box>
                          <Icon
                            style={{ marginRight: '15px', marginTop: '5px' }}
                            icon={tooltip.icon}
                            width="20px"
                            height="20px"
                            color={colorMode === 'light' ? CustomTheme.colors.gray.dark : CustomTheme.colors.white}
                          />
                        </Box>
                      </Tooltip>
                    ))}
                    <Button
                      colorScheme="blue.default"
                      variant="link"
                      onClick={() => setShowModal({ show: true, session })}
                    >
                      {t('details')}
                    </Button>
                  </Flex>
                </Box>
              </Flex>
            ))}
          </Box>

          {/* No Sessions Message */}
          {!isLoading && sessions.length === 0 && (
            <Container
              maxW="none"
              border="1px solid"
              borderRadius="10px"
              textAlign="center"
              padding="10px"
              borderColor="#DADADA"
            >
              <Text fontSize="md">{t('common:no-elements')}</Text>
            </Container>
          )}
        </Box>
      </Box>
      <Modal
        isOpen={showModal.show}
        size="md"
        margin="0 10px"
        onClose={() => {
          setShowModal({ show: false, session: null });
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={commonFontColor} borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={commonBorderColor} textAlign="center">
            {t('modal.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody padding={{ base: '30px' }}>
            <Text color={commonFontColor} size="l" fontWeight="700" marginBottom="15px">
              {t('events')}
            </Text>
            {showModal.session && tooltipsGenerator(showModal.session).length > 0 ? tooltipsGenerator(showModal.session).map((elem, index, arr) => (
              <>
                <Text alignItems="center" my="5px" display="flex" color={commonFontColor} size="l" fontWeight="400">
                  <Icon style={{ marginRight: '15px' }} icon={elem.icon} width="25px" height="25px" color={colorMode === 'light' ? CustomTheme.colors.gray.dark : CustomTheme.colors.white} />
                  {elem.label}
                </Text>
                {index !== (arr.length - 1) && (
                  <Divider
                    orientation="vertical"
                    marginLeft="12px"
                    borderColor={CustomTheme.colors.blue.default}
                    height="26px"
                    maxH="26px"
                  />
                )}
              </>
            ))
              : (
                <Text color={commonFontColor} size="l" marginBottom="15px">
                  {t('noEvents')}
                </Text>
              )}
          </ModalBody>
          <ModalFooter>
            <Button variant="default" textTransform="uppercase" background={CustomTheme.colors.blue.default} mr={3} onClick={() => setShowModal({ show: false, session: null })}>
              {t('common:close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default asPrivate(Mentorship);
