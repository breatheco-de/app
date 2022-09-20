import PropTypes from 'prop-types';
import {
  Box, Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, useColorModeValue,
} from '@chakra-ui/react';
// import { useRouter } from 'next/router';
import { useState, useEffect, Fragment } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';

const Pricing = ({ data }) => {
  // const router = useRouter();
  const { t } = useTranslation('common');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFinanceIndex, setSelectedFinanceIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProps, setSelectedProps] = useState(data?.pricing?.list[0] || {});
  const [formProps, setFormProps] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [dateProps, setDateProps] = useState();
  const featuredBg = useColorModeValue('featuredLight', 'featuredDark');
  const inputBorderColor = useColorModeValue('gray.default', 'gray.250');

  const financeSelected = {
    0: 'list',
    1: 'finance',
  };
  const financeValue = `${financeSelected[selectedFinanceIndex]}`;
  const selectedItem = data?.pricing[financeValue][selectedIndex];

  console.log('selectedProps:', selectedProps);
  console.log('formProps:', formProps);

  const handleSelect = (dataProps, index) => {
    setSelectedProps(dataProps);
    setSelectedIndex(index);
  };
  const handleSelectFinance = (index) => {
    setSelectedFinanceIndex(index);
    setSelectedIndex(0);
  };

  useEffect(() => {
    if (selectedFinanceIndex === 0) {
      setSelectedProps(data?.pricing?.list[0]);
    } else {
      setSelectedProps(data?.pricing?.finance[0]);
    }
  }, [selectedFinanceIndex]);

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormProps({ ...formProps, [name]: value });
  };
  const handleChooseDate = (date) => {
    setDateProps(date);
    setStepIndex(2);
  };

  const dates = [
    {
      title: 'Coding introduction',
      date: 'Sept 19th',
      availableDate: 'Mon/Tue/Fri',
      time: '20:00 - 22:00',
      formatTime: '(UTC-05:00) Eastern Time (US & Canada)',
    },
    {
      title: 'Coding introduction',
      date: 'Sept 19th',
      availableDate: 'Mon/Tue/Fri',
      time: '20:00 - 22:00',
      formatTime: '(UTC-05:00) Eastern Time (US & Canada)',
    },
    {
      title: 'Coding introduction',
      date: 'Sept 19th',
      availableDate: 'Mon/Tue/Fri',
      time: '20:00 - 22:00',
      formatTime: '(UTC-05:00) Eastern Time (US & Canada)',
    },
  ];

  return (
    <Box maxW="container.xl" display="flex" width="100%" flexDirection="row" alignItems={{ base: 'center', md: 'start' }} gridGap="21px" m="36px auto 20px auto" justifyContent="center" height="100%">

      <Box display="flex" flex={0.5} flexDirection="column" w="100%" gridGap="10px">
        <Heading size="l" mb="32px">
          {data?.pricing?.title}
        </Heading>
        {data?.pricing?.description && (
          <Text
            size="md"
            width="80%"
            fontWeight="500"
            dangerouslySetInnerHTML={{ __html: data?.pricing?.description }}
          />
        )}
        <Box fontSize="13px" textTransform="uppercase" fontWeight="700" color="blue.default" mb="5px">
          {selectedItem?.bullets?.title}
        </Box>
        <Box as="ul" style={{ listStyle: 'none' }} display="flex" flexDirection="column" gridGap="12px">
          {selectedItem?.bullets?.list?.map((bullet) => (
            <Box as="li" key={bullet?.title} display="flex" flexDirection="row" lineHeight="24px" gridGap="8px">
              <Icon icon="checked2" color="#38A56A" width="13px" height="10px" style={{ margin: '8px 0 0 0' }} />
              <Box
                fontSize="14px"
                fontWeight="600"
                letterSpacing="0.05em"
                dangerouslySetInnerHTML={{ __html: bullet?.title }}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Box display="flex" flex={0.5} flexDirection="column" gridGap="20px">
        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" mb="6px">
          <Heading as="h2" size="sm">
            Choose yout plan
          </Heading>
          <Box display="flex" gridGap="12px">
            <Box p="15px 33px" onClick={() => handleSelectFinance(0)} borderRadius="32px" background={selectedFinanceIndex === 0 ? 'blue.default' : 'transparent'} color={selectedFinanceIndex === 0 ? 'white' : 'blue.default'} cursor="pointer">
              One payment
            </Box>
            <Box p="15px 33px" onClick={() => handleSelectFinance(1)} borderRadius="32px" background={selectedFinanceIndex === 1 ? 'blue.default' : 'transparent'} color={selectedFinanceIndex === 1 ? 'white' : 'blue.default'} cursor="pointer">
              Finance
            </Box>
          </Box>
        </Box>
        {data?.pricing[financeValue].filter((l) => l.show === true).map((item, i) => (
          <Fragment key={`${item.title} ${item?.price}`}>
            {data?.pricing[financeValue]?.length - 1 === i && (
              <Box display="flex" alignItems="center">
                <Box as="hr" color="gray.500" width="100%" />
                <Text size="md" textAlign="center" width="100%" margin="0">
                  Not ready to commit?
                </Text>
                <Box as="hr" color="gray.500" width="100%" />
              </Box>
            )}
            <Box key={item.title} display="flex" onClick={() => handleSelect(item, i)} flexDirection={{ base: 'column', md: 'row' }} width="100%" justifyContent="space-between" p={selectedIndex === i ? '22px 18px' : '26px 22px'} gridGap="24px" cursor="pointer" background={selectedIndex !== i && featuredBg} border={selectedIndex === i && '4px solid #0097CD'} borderRadius="8px">
              <Box display="flex" flex={1} flexDirection="column" gridGap="12px" minWidth={{ base: '100%', md: '288px' }} height="fit-content" fontWeight="400">
                <Box fontSize="18px" fontWeight="700">
                  {item?.title}
                </Box>
                <Text
                  size="md"
                  fontWeight="500"
                  mb="6px"
                  dangerouslySetInnerHTML={{ __html: item?.description }}
                />
              </Box>
              <Box display="flex" alignItems="center" gridGap="10px">
                <Heading as="span" size="m" lineHeight="1" textTransform="uppercase" color="blue.default">
                  {item?.price}
                </Heading>
              </Box>
            </Box>
          </Fragment>
        ))}
        <Box mt="38px">
          <Button variant="default" onClick={() => setIsOpen(true)}>
            {selectedItem?.button?.title}
          </Button>
        </Box>
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="full">
        <ModalOverlay style={{ width: '100%', margin: 0 }} />
        <ModalContent style={{ width: '80%', margin: '2rem 0' }}>
          <ModalCloseButton />
          <ModalBody p="2.5rem 2rem">
            {/* Stepper */}
            <Box display="flex" gridGap="38px" justifyContent="center">
              <Box display="flex" gridGap="8px" alignItems="center" color={stepIndex !== 0 && 'gray.350'}>
                <Heading as="span" size="sm" p={stepIndex === 0 ? '3px 8px' : '2px 5px'} mr={stepIndex === 0 && '4px'} background={stepIndex === 0 && 'blue.default'} color={stepIndex === 0 && 'white'} borderRadius="3px" fontWeight="700">
                  1.
                </Heading>
                <Heading size="sm" fontWeight={stepIndex === 0 ? '700' : '500'}>
                  Contact information
                </Heading>
              </Box>
              <Box display="flex" gridGap="8px" alignItems="center" color={stepIndex !== 1 && 'gray.350'}>
                <Heading as="span" size="sm" p={stepIndex === 1 ? '3px 8px' : '2px 5px'} mr={stepIndex === 1 && '4px'} background={stepIndex === 1 && 'blue.default'} color={stepIndex === 1 && 'white'} borderRadius="3px" fontWeight="500">
                  2.
                </Heading>
                <Heading size="sm" fontWeight={stepIndex === 1 ? '700' : '500'}>
                  Choose your class
                </Heading>
              </Box>
              <Box display="flex" gridGap="8px" alignItems="center" color={stepIndex !== 2 && 'gray.350'}>
                <Heading as="span" size="sm" p={stepIndex === 2 ? '3px 8px' : '2px 5px'} mr={stepIndex === 2 && '4px'} background={stepIndex === 2 && 'blue.default'} color={stepIndex === 2 && 'white'} borderRadius="3px" fontWeight="500">
                  3.
                </Heading>
                <Heading size="sm" fontWeight={stepIndex === 2 ? '700' : '500'}>
                  Summary
                </Heading>
              </Box>
            </Box>
            {/* Form */}
            <Box display="flex" flexDirection="column" gridGap="20px" minHeight="320px" maxWidth={{ base: '100%', md: '700px' }} margin="3.5rem auto 0 auto">
              {stepIndex === 0 && (
                <>
                  <Heading size="18px">
                    About you
                  </Heading>
                  <Box as="form" display="flex" flexDirection="column" gridGap="22px">
                    <Box display="flex" gridGap="18px">
                      <Box display="flex" gridGap="18px" flex={0.5}>
                        <Input type="text" name="firstName" onChange={(e) => handleChangeForm(e)} placeholder={t('first-name')} isRequired borderColor={inputBorderColor} borderRadius="3px" height="50px" />
                        <Input type="text" name="lastName" onChange={(e) => handleChangeForm(e)} placeholder={t('last-name')} borderColor={inputBorderColor} borderRadius="3px" height="50px" />
                      </Box>
                      <Box display="flex" flex={0.5} flexDirection="column" fontSize="12px" color="blue.default2" lineHeight="24px">
                        <Input type="tel" name="phone" onChange={(e) => handleChangeForm(e)} color="black" placeholder={t('phone')} borderColor={inputBorderColor} borderRadius="3px" height="50px" />
                        We will contact you via phone call only if necessary.
                      </Box>
                    </Box>
                    <Box display="flex" gridGap="18px">
                      <Box display="flex" flex={0.5} flexDirection="column" fontSize="12px" color="blue.default2" lineHeight="24px">
                        <Input type="email" name="email" onChange={(e) => handleChangeForm(e)} color="black" placeholder={t('email')} borderColor={inputBorderColor} borderRadius="3px" height="50px" />
                        We will use it to give you access to your account.
                      </Box>
                      <Input type="text" name="confirmEmail" onChange={(e) => handleChangeForm(e)} flex={0.5} placeholder={t('confirm-email')} borderColor={inputBorderColor} borderRadius="3px" height="50px" />
                    </Box>
                  </Box>
                </>
              )}
              {stepIndex === 1 && (
                <>
                  <Heading size="18px">
                    Give us your address to find your new class
                  </Heading>
                  <Box display="flex" gridGap="18px" alignItems="center" mt="10px">
                    <Input type="text" placeholder="Where do you live?" height="50px" />
                    <Button variant="default">
                      Search dates
                    </Button>
                  </Box>
                  <Box display="flex" flex={1} flexDirection="column" fontSize="12px" color="blue.default2" lineHeight="24px" mt="-15px" w="80%">
                    We are not storing your address, but we will use this information to offer the best possible dates and schedules to study.
                  </Box>
                  <Heading size="18px" m="1rem 0 1rem 0">
                    Available Dates
                  </Heading>
                  <Box display="flex" flexDirection="column" mb="2rem" gridGap="40px" p="0 1rem">
                    {dates.map((date, i) => {
                      const dateIndex = i;

                      return (
                        <Box display="flex" gridGap="30px" key={dateIndex}>
                          <Text size="18px" flex={0.35}>
                            {date.title}
                          </Text>
                          <Box display="flex" flexDirection="column" gridGap="5px" flex={0.2}>
                            <Text size="18px">
                              {date.date}
                            </Text>
                            <Text size="14px" color="gray.default">
                              {date.availableDate}
                            </Text>
                          </Box>
                          <Box display="flex" flexDirection="column" gridGap="5px" flex={0.3}>
                            <Text size="18px">
                              {date.time}
                            </Text>
                            <Text size="14px" color="gray.default">
                              {date.formatTime}
                            </Text>
                          </Box>
                          <Button variant="outline" onClick={() => handleChooseDate(date)} borderColor="currentColor" color="blue.default" flex={0.15}>
                            Choose date
                          </Button>
                        </Box>
                      );
                    })}
                  </Box>
                  <Box as="hr" width="100%" margin="10px 0" />
                </>
              )}
              {/* dateProps */}
              {stepIndex === 2 && (
                <Box display="flex" gridGap="30px" mb="1rem">
                  <Box display="flex" flexDirection="column" flex={0.3} gridGap="3rem">
                    <Box display="flex" flexDirection="column" gridGap="10px">
                      <Heading size="18px" textTransform="uppercase">
                        Cohort Details
                      </Heading>
                      <Box as="hr" width="30%" margin="0 0 10px 0" h="1px" background="black" />
                      <Box display="flex" flexDirection="column" gridGap="10px">
                        <Text size="md" fontWeight="700">
                          Cohort Name
                        </Text>
                        <Text size="md" fontWeight="400" color="gray.600">
                          {dateProps?.title}
                        </Text>
                      </Box>

                      <Box as="hr" width="100%" margin="0 0" h="1px" borderColor="gray.default" />

                      <Box display="flex" flexDirection="column" gridGap="10px">
                        <Text size="md" fontWeight="700">
                          Start Date
                        </Text>
                        <Text size="md" fontWeight="400" color="gray.600">
                          {`${dateProps?.date} 2022`}
                        </Text>
                      </Box>

                      <Box as="hr" width="100%" margin="0 0" h="1px" borderColor="gray.default" />

                      <Box display="flex" flexDirection="column" gridGap="10px">
                        <Text size="md" fontWeight="700">
                          Days and hours
                        </Text>
                        <Text size="md" fontWeight="400" color="gray.600">
                          {dateProps?.availableDate}
                        </Text>
                        <Text size="md" fontWeight="400" color="gray.600">
                          {dateProps?.time}
                        </Text>
                        <Text size="md" fontWeight="400" color="gray.600">
                          {dateProps?.formatTime}
                        </Text>
                      </Box>
                    </Box>

                    <Box display="flex" flexDirection="column" gridGap="10px">
                      <Heading size="18px" textTransform="uppercase">
                        Profile Details
                      </Heading>
                      <Box as="hr" width="30%" margin="0 0 10px 0" h="1px" background="black" />
                      <Box display="flex" flexDirection="column" gridGap="10px">
                        <Text size="md" fontWeight="700">
                          Your name
                        </Text>
                        <Text size="md" fontWeight="400" color="gray.600">
                          {`${formProps?.firstName} ${formProps?.lastName}`}
                        </Text>
                      </Box>
                      <Box as="hr" width="100%" margin="0 0" h="1px" borderColor="gray.default" />
                      <Box display="flex" flexDirection="row" gridGap="10px">
                        <Box display="flex" flexDirection="column" gridGap="10px">
                          <Text size="md" fontWeight="700">
                            Phone number
                          </Text>
                          <Text size="md" fontWeight="400" color="gray.600">
                            {formProps?.phone}
                          </Text>
                        </Box>
                        <Box display="flex" flexDirection="column" gridGap="10px">
                          <Text size="md" fontWeight="700">
                            Mail
                          </Text>
                          <Text size="md" fontWeight="400" color="gray.600">
                            {formProps?.email}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box display="flex" flexDirection="column" flex={0.7} background="blue.light" w="100%" p="11px 14px" gridGap="12px" borderRadius="12px">
                    <Heading size="15px" color="blue.default">
                      You are signing up for
                    </Heading>
                    <Box display="flex" gridGap="12px">
                      <Box display="flex" flexDirection="column">
                        <Box p="14px 12px" background="blue.default" borderRadius="7px" width="fit-content">
                          <Icon icon="code" width="38px" height="38px" color="#fff" />
                        </Box>
                      </Box>
                      <Box display="flex" flexDirection="column" gridGap="7px">
                        <Heading size="18px">
                          {data.title}
                        </Heading>
                        <Heading size="15px" textTransform="uppercase" color="gray.600">
                          {selectedProps.title}
                        </Heading>
                      </Box>
                      <Heading size="sm" color="blue.default" textTransform="uppercase">
                        {selectedProps.price}
                      </Heading>

                    </Box>
                  </Box>

                </Box>
              )}

              <Box display="flex" justifyContent="space-between" mt="auto">
                <Button
                  variant="outline"
                  borderColor="currentColor"
                  color="blue.default"
                  onClick={() => {
                    if (stepIndex > 0) {
                      setStepIndex(stepIndex - 1);
                    }
                  }}
                >
                  Go Back
                </Button>
                {stepIndex !== 2 && (
                  <Button
                    variant="default"
                    onClick={() => {
                      if (stepIndex !== 2) {
                        setStepIndex(stepIndex + 1);
                      }
                    }}
                  >
                    Next Step
                  </Button>
                )}
              </Box>
            </Box>
          </ModalBody>

        </ModalContent>
      </Modal>

    </Box>
  );
};

Pricing.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Pricing;
