/* eslint-disable object-curly-newline */
import {
  Box, Modal, ModalOverlay, ModalContent, ModalCloseButton,
  ModalBody, Flex, Button,
} from '@chakra-ui/react';
import { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
// import { getDataContentProps } from '../../utils/file';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';
import meeting from '../../../public/static/images/meeting.png';
import Icon from './Icon';

const UpgradeAccessModal = ({
  storySettings, open,
}) => {
  const { t } = useTranslation('dashboard');
  const [isOpen, setIsOpen] = useState(open);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedProps, setSelectedProps] = useState({});

  // const finance1 = {
  //   "coding-introduction": "Coding introduction",
  //   "full-stack": "Full Stack",
  //   "software-engineering": "Software Engineering",
  //   "description": "Upgrade your membership to access all the benefits of the 4Geeks community",
  //   "button": {
  //     "title": "Upgrade plan",
  //     "link": "#upgrade-plan"
  //   },
  //   "plans": [
  //     {
  //       "type": "pro",
  //       "show": true,
  //       "title": "One time payment",
  //       "price": "$199",
  //       "lastPrice": "<s>$399</s>",
  //       "offerTitle": "Limited offer",
  //       "payment": "One time payment",
  //       "description": "Full access to all features for the duration of the course",
  //       "bullets": {
  //         "title": "What you will get",
  //         "list": [
  //           {
  //             "title": "Unlimited access to group masterclasses"
  //           },
  //           {
  //             "title": "Unlimited access to workshops"
  //           },
  //           {
  //             "title": "Unlimited access to course content"
  //           },
  //           {
  //             "title": "Certificate endorsed by industry leaders"
  //           }
  //         ]
  //       }
  //     },
  //     {
  //       "type": "trial",
  //       "show": true,
  //       "title": "Free trial",
  //       "price": "Free trial",
  //       "payment": "Expires in 7 days",
  //       "lastPrice": "",
  //       "description": "No card needed. Full access to all features for 7 days",
  //       "bullets": {
  //         "title": "What you will get",
  //         "list": [
  //           {
  //             "title": "1 mentoring session per month."
  //           },
  //           {
  //             "title": "Limited access to workshops."
  //           },
  //           {
  //             "title": "Access to module 1 of the cohort."
  //           }
  //         ]
  //       }
  //     },

  //     {
  //       "type": "schoolarship-t1",
  //       "show": true,
  //       "title": "scholarship level 1",
  //       "price": "$70",
  //       "payment": "3 months",
  //       "highlightText": "",
  //       "description": "Full access to all features for the duration of the course.",
  //       "bullets": {
  //         "title": "What you will get",
  //         "list": [
  //           {
  //             "title": "scholarship level 1 - featured 1"
  //           },
  //           {
  //             "title": "scholarship level 1 - featured 2"
  //           },
  //           {
  //             "title": "scholarship level 1 - featured 3"
  //           },
  //           {
  //             "title": "scholarship level 1 - featured 4"
  //           }
  //         ]
  //       }
  //     },
  //     {
  //       "type": "schoolarship-t2",
  //       "show": true,
  //       "title": "scholarship level 2",
  //       "price": "$50",
  //       "payment": "5 months",
  //       "highlightText": "",
  //       "description": "Full access to all features for the duration of the course.",
  //       "bullets": {
  //         "title": "What you will get",
  //         "list": [
  //           {
  //             "title": "scholarship level 2 - featured 1"
  //           },
  //           {
  //             "title": "scholarship level 2 - featured 2"
  //           },
  //           {
  //             "title": "scholarship level 2 - featured 3"
  //           },
  //           {
  //             "title": "scholarship level 2 - featured 4"
  //           }
  //         ]
  //       }
  //     },
  //     {
  //       "type": "schoolarship-trial",
  //       "show": true,
  //       "title": "Free trial",
  //       "price": "7 days trial",
  //       "payment": "Expires in 7 days",
  //       "highlightText": "",
  //       "description": "No card needed. Full access to all features for 7 days",
  //       "bullets": {
  //         "title": "What you will get",
  //         "list": [
  //           {
  //             "title": "Free trial - featured 1"
  //           },
  //           {
  //             "title": "Free trial - featured 2"
  //           },
  //           {
  //             "title": "Free trial - featured 3"
  //           },
  //           {
  //             "title": "Free trial - featured 4"
  //           }
  //         ]
  //       }
  //     }
  //   ]
  // };

  const router = useRouter();
  // const { locale } = router;

  const courseQuery = router?.query?.course;
  // const planQuery = router?.query?.plan;
  const financeData = t('finance:.', {}, { returnObjects: true });
  console.log('financeData:::', financeData);

  const finance = storySettings?.finance;
  // const finance = storySettings?.finance || getDataContentProps(`public/locales/${storySettings.locale}`, 'finance');

  // const planChoosed = planQuery || 'trial';
  const currentCourse = courseQuery || 'coding-introduction';
  // const planProps = finance.plans?.find((l) => l.type === planChoosed);
  const { featuredColor, backgroundColor2, hexColor } = useStyle();
  const selectedItem = finance.plans[selectedIndex];

  const onClose = () => {
    setIsOpen(false);
  };

  const handleSelect = (dataProps, index) => {
    setSelectedProps(dataProps);
    setSelectedIndex(index);
  };

  const financePlans = finance.plans.filter((l) => l.type !== 'trial' && l.type !== 'schoolarship-trial');

  return (
    <Modal
      isOpen={storySettings?.isOpen || isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent style={{ maxWidth: '72rem' }}>
        <ModalBody>
          <ModalCloseButton top={4} right={5} />
          <Flex flexDirection={{ base: 'column', md: 'row' }} gridGap="35px" padding="55px">
            <Box display="flex" flexDirection="column" flex={1} gridGap="10px">
              <Box w="100%" position="relative">
                <Image src={meeting} style={{ aspectRatio: '16/9' }} w="auto" h="auto" zIndex={10} top="0" left="0" />
                <Box w="10px" h="10px" borderRadius="40px" background="#EB5757" position="absolute" top="4.3rem" left="0.6rem" />
                <Box w="31px" h="31px" borderRadius="40px" background="blue.default" position="absolute" bottom="5rem" left="0" />
                <Box w="76.4px" h="76.4px" borderRadius="40px" background="blue.light" position="absolute" top="4.4rem" left="0" zIndex={-1} />
                <Box w="54px" h="54px" borderRadius="40px" background="blue.default" position="absolute" top="0" right="3.8rem" zIndex={-1} />
                <Box w="116px" h="116px" borderRadius="50%" background="yellow.light" position="absolute" bottom="0" right="2.8rem" zIndex={-1} />
                <Icon icon="cursorTooltip" width="36px" height="auto" text="April" color={hexColor.yellowDefault} style={{ position: 'absolute', top: '5.2rem', right: '5.1rem', zIndex: 1 }} />
                <Icon icon="cursorTooltip" width="36px" height="auto" text="April" color="#F2994A" style={{ position: 'absolute', top: '4.3rem', left: '5rem', zIndex: 1 }} />
                <Icon icon="cursorTooltip" width="36px" height="auto" text="Tori" color={hexColor.blueDefault} style={{ position: 'absolute', bottom: '2.5rem', left: '1.2rem', zIndex: 1 }} />
                <Icon icon="cursorTooltip" width="36px" height="auto" text="Tori" color={hexColor.green} style={{ position: 'absolute', bottom: '4rem', right: '5rem', zIndex: 1 }} />
                <Icon icon="cursorTooltip" width="36px" height="auto" color="#9B51E0" style={{ position: 'absolute', bottom: '2rem', right: '11rem', zIndex: 1 }} />
              </Box>
              <Text size="18px" color="blue.default" textAlign="center" fontWeight={700}>
                {finance?.description}
              </Text>
              <Box as="ul" style={{ listStyle: 'none' }} display="flex" flexDirection="column" gridGap="12px" mt="18px">
                {selectedItem?.bullets?.list?.map((bullet) => (
                  <Box as="li" key={bullet?.title} display="flex" flexDirection="row" lineHeight="24px" gridGap="14px">
                    <Icon icon="checked2" color="#38A56A" width="16px" height="13px" style={{ margin: '6px 0 0 0' }} />
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
            <Box display="flex" flex={1} background={featuredColor} flexDirection="column" gridGap="24px" borderRadius="17px" minH="490px" padding="33px 28px">
              {financePlans.map((item, i) => (
                <Fragment key={`${item.title} ${item?.price}`}>
                  <Box key={item.title} display="flex" onClick={() => handleSelect(item, i)} flexDirection={{ base: 'column', md: 'row' }} width="100%" justifyContent="space-between" p={selectedIndex === i ? '22px 18px' : '26px 22px'} gridGap="24px" cursor="pointer" background={backgroundColor2} border={selectedIndex === i && '4px solid #0097CD'} borderRadius="8px" minH="118px">
                    <Box display="flex" flex={1} flexDirection="column" gridGap="12px" minWidth={{ base: '100%', md: '288px' }} height="fit-content" fontWeight="400">
                      <Box fontSize="18px" fontWeight="700">
                        {item?.title}
                      </Box>
                      {item.type !== 'pro' && (
                        <Text
                          size="md"
                          fontWeight="500"
                          mb="6px"
                          dangerouslySetInnerHTML={{ __html: item?.payment }}
                        />
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" gridGap="10px">
                      <Heading as="span" size="l" lineHeight="1" textTransform="uppercase" color="blue.default">
                        {item?.price}
                      </Heading>
                    </Box>
                  </Box>
                </Fragment>
              ))}
              <Button
                w="fit-content"
                variant="default"
                textTransform="uppercase"
                onClick={() => router.push({
                  pathname: '/signup',
                  query: {
                    course: currentCourse,
                    plan: selectedProps?.type,
                  },
                })}
              >
                {finance?.button?.title}
              </Button>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

UpgradeAccessModal.propTypes = {
  storySettings: PropTypes.objectOf(PropTypes.any),
  open: PropTypes.bool,
};

UpgradeAccessModal.defaultProps = {
  storySettings: {
    isOpen: false,
  },
  open: false,
};

export default UpgradeAccessModal;
