import { useEffect, memo } from 'react';
import {
  Box, Heading, Button, useColorMode, Accordion, AccordionItem, AccordionPanel,
  AccordionButton, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Text from './Text';
import bc from '../services/breathecode';
import usePersistent from '../hooks/usePersistent';

const isWindow = typeof window !== 'undefined';
const cohortSession = isWindow ? JSON.parse(localStorage.getItem('cohortSession') || '{}') : {};
const accessToken = isWindow ? localStorage.getItem('accessToken') : '';

const academySlug = cohortSession && cohortSession.academy?.slug;

const SupportSidebar = ({
  title, subtitle, actionButtons, width,
}) => {
  const { colorMode } = useColorMode();
  const [programServices, setProgramServices] = usePersistent('programServices', []);
  const [programMentors, setProgramMentors] = usePersistent('programMentors', []);
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');

  useEffect(() => {
    bc.mentorship().getService().then((res) => {
      const { data } = res;
      if (data !== undefined && data.length > 0) {
        setProgramServices(data);

        Promise.all(programServices.map((service) => bc.mentorship().getMentor({
          serviceSlug: service.slug,
        })
          .then((resp) => {
            setProgramMentors(resp.data);
          }).catch((err) => {
            console.error('err_mentorship:getMentor:', err);
          })));
      }
    }).catch((err) => {
      console.error('err_mentorship:', err);
    });
  }, []);

  return (
    <Box
      backgroundColor={colorMode === 'light' ? 'yellow.light' : 'featuredDark'}
      width={width}
      height="auto"
      borderWidth="0px"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box d="flex" justifyContent="center">
        <Icon icon="sideSupport" width="300px" height="70px" />
      </Box>
      <Box p="4" pb="30px" pt="20px">
        <Box d="flex" alignItems="baseline" justifyContent="center">
          <Heading fontSize="22px" textAlign="center" justify="center" mt="0px" mb="0px">
            {title}
          </Heading>
        </Box>

        <Box d="flex" alignItems="baseline" justifyContent="center">
          <Text size="md" textAlign="center" mt="10px" px="0px">
            {subtitle}
          </Text>
        </Box>

        <Box pt="3" display="flex" flexDirection="column" alignItems="center">
          {actionButtons.filter((el) => el.name !== 'mentoring').map((button, i) => {
            const index = i;
            return (
              <a
                key={`${button.title}-${index}`}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '100%' }}
              >
                <Button
                  size="lg"
                  gridGap="10px"
                  width="100%"
                  key={button.title}
                  bg={commonBackground}
                  _hover={{
                    background: `${colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.2)'}`,
                  }}
                  _active={{
                    background: `${colorMode === 'light' ? 'gray.light' : 'rgba(255, 255, 255, 0.22)'}`,
                  }}
                  borderWidth="0px"
                  padding="14px 20px"
                  my="8px"
                  borderRadius="8px"
                  justifyContent="space-between"
                >
                  <Box>
                    <Icon icon={button.icon} width="25px" height="25px" />
                  </Box>
                  <Text
                    display="flex"
                    whiteSpace="pre-wrap"
                    textAlign="left"
                    textTransform="uppercase"
                    size="12px"
                    color={colorMode === 'light' ? 'black' : 'white'}
                  >
                    {button.title}
                  </Text>
                  <Box>
                    <Icon icon="arrowRight" width="22px" height="22px" />
                  </Box>
                </Button>
              </a>
            );
          })}

          {actionButtons.filter((el) => el.name === 'mentoring').map((button) => (
            <Accordion
              key={button.title}
              allowMultiple
              width="100%"
            >
              <AccordionItem border="0">
                <AccordionButton
                  size="lg"
                  gridGap="10px"
                  display="flex"
                  width="100%"
                  key={button.title}
                  bg={commonBackground}
                  _hover={{
                    background: `${colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.2)'}`,
                  }}
                  _active={{
                    background: `${colorMode === 'light' ? 'gray.light' : 'rgba(255, 255, 255, 0.22)'}`,
                  }}
                  borderWidth="0px"
                  padding="14px 20px"
                  my="8px"
                  borderRadius="8px"
                  justifyContent="space-between"
                >
                  <Box>
                    <Icon icon={button.icon} width="25px" height="25px" />
                  </Box>
                  <Text
                    display="flex"
                    whiteSpace="pre-wrap"
                    textAlign="left"
                    textTransform="uppercase"
                    size="12px"
                    color={colorMode === 'light' ? 'black' : 'white'}
                  >
                    {button.title}
                  </Text>
                  <Box>
                    <Icon icon="arrowRight" width="22px" height="22px" />
                  </Box>
                </AccordionButton>
                <AccordionPanel padding="0" width="100%">
                  {programServices && programServices.map((service) => (
                    <Accordion
                      key={service.slug}
                      allowMultiple
                      background={commonBackground}
                      borderRadius="3px"
                      width="100%"
                    >
                      <AccordionItem
                        border="0"
                      >
                        <AccordionButton width="100%" padding="16px">
                          {service.name}
                        </AccordionButton>
                        <AccordionPanel
                          padding="0"
                          width="100%"
                          border="0"
                          // borderTop="1px solid"
                          // borderLeft="5px solid"
                          maxWidth="100%"
                          // borderColor={commonBorderColor}
                        >
                          {programMentors.filter(
                            (mentor) => mentor.service.slug === service.slug
                              && mentor.status !== 'INNACTIVE',
                          ).length !== 0 ? programMentors.map((l) => (
                            <Box
                              padding="16px"
                              borderTop="1px solid"
                              borderLeft="5px solid"
                              borderColor={commonBorderColor}
                              width="100%"
                            >
                              <Box
                                as="a"
                                color="blue.default"
                                key={`${l.slug}-${l.id}`}
                                href={`https://mentor.breatheco.de/academy/${academySlug}/service/${service.slug}/mentor/${l.slug}?token=${accessToken}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {`${l.user.first_name} ${l.user.last_name}`}
                              </Box>
                            </Box>
                            )) : (
                              <Box
                                padding="16px"
                                borderTop="1px solid"
                                borderLeft="5px solid"
                                color="gray.600"
                                borderColor={commonBorderColor}
                                width="100%"
                              >
                                No mentors available
                              </Box>
                            )}
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

SupportSidebar.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actionButtons: PropTypes.arrayOf(PropTypes.any),
  width: PropTypes.string,
};

SupportSidebar.defaultProps = {
  actionButtons: [],
  title: '',
  subtitle: '',
  width: '100%',
};

export default memo(SupportSidebar);
