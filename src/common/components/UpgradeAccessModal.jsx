import {
  Box, Modal, ModalOverlay, ModalContent, ModalCloseButton,
  ModalBody, Flex, Button, Image, useMediaQuery,
} from '@chakra-ui/react';
import { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';
import Icon from './Icon';
import financeEN from '../../../public/locales/en/finance.json';
import financeES from '../../../public/locales/es/finance.json';
import { toCapitalize } from '../../utils';

function UpgradeAccessModal({
  storySettings, isOpen, onClose,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedProps, setSelectedProps] = useState({});
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const courseQuery = router?.query?.course;
  const currLocale = storySettings?.locale || router?.locale;
  const jsonData = currLocale === 'en' ? financeEN : financeES;
  const finance = jsonData;
  const currentCourse = courseQuery || 'coding-introduction';
  const { featuredColor, backgroundColor2, hexColor } = useStyle();
  const selectedItem = storySettings?.plans?.[selectedIndex] || finance.plans[selectedIndex];

  const handleSelect = (dataProps, index) => {
    setSelectedProps(dataProps);
    setSelectedIndex(index);
  };

  const financePlans = storySettings?.plans?.length > 0 ? storySettings?.plans.filter((l) => l.type !== 'trial' && l.type !== 'schoolarship-trial') : finance.plans.filter((l) => l.type !== 'trial' && l.type !== 'schoolarship-trial');

  return (
    <Modal
      isOpen={storySettings?.isOpen || isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent style={{ maxWidth: '72rem' }}>
        <ModalBody>
          <ModalCloseButton top={isBelowTablet ? 1 : 4} right={isBelowTablet ? 1 : 5} />
          <Flex flexDirection={{ base: 'column', lg: 'row' }} gridGap="35px" padding={{ base: '0', md: '55px' }}>
            <Box display="flex" flexDirection="column" flex={1} gridGap="10px">
              <Box w="100%" position="relative">
                <Image src={storySettings?.image || '/static/images/meeting.png'} style={{ aspectRatio: '12/8' }} margin="0 auto" w="auto" h="auto" layout="fill" zIndex={10} top="0" left="0" />
                <Box w="10px" h="10px" borderRadius="40px" background="#EB5757" position="absolute" top="4.3rem" left="0.6rem" />
                <Box w="31px" h="31px" borderRadius="40px" background="blue.default" position="absolute" bottom="5rem" left="0" />
                <Box w="76.4px" h="76.4px" borderRadius="40px" background="blue.light" position="absolute" top="4.4rem" left="0" zIndex={-1} />
                <Box w="54px" h="54px" borderRadius="40px" background="blue.default" position="absolute" top="0" right="3.8rem" zIndex={-1} />
                <Box w="116px" h="116px" borderRadius="50%" background="yellow.light" position="absolute" bottom="0" right="2.8rem" zIndex={-1} />
                <Icon icon="cursorTooltip" width={isBelowTablet ? '28px' : '36px'} height="auto" text="April" color={hexColor.yellowDefault} style={{ position: 'absolute', top: '5.2rem', right: '3.1rem', zIndex: 1 }} />
                <Icon icon="cursorTooltip" width={isBelowTablet ? '28px' : '36px'} height="auto" text="April" color="#F2994A" style={{ position: 'absolute', top: '4.3rem', left: '7rem', zIndex: 1 }} />
                <Icon icon="cursorTooltip" width={isBelowTablet ? '28px' : '36px'} height="auto" text="Tori" color={hexColor.blueDefault} style={{ position: 'absolute', bottom: '2.5rem', left: '3.2rem', zIndex: 1 }} />
                <Icon icon="cursorTooltip" width={isBelowTablet ? '28px' : '36px'} height="auto" text="Tori" color={hexColor.green} style={{ position: 'absolute', bottom: '4rem', right: '3rem', zIndex: 1 }} />
                <Icon icon="cursorTooltip" width={isBelowTablet ? '28px' : '36px'} height="auto" color="#9B51E0" style={{ position: 'absolute', bottom: '2rem', right: '9rem', zIndex: 1 }} />
              </Box>
              <Text size="18px" color="blue.default" textAlign="center" fontWeight={700}>
                {finance?.description}
              </Text>
              <Box as="ul" style={{ listStyle: 'none' }} display="flex" flexDirection="column" gridGap="12px" margin="18px 0 0 2.6rem">
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
                  <Box key={item.title} display="flex" onClick={() => handleSelect(item, i)} flexDirection={{ base: 'column', md: 'row' }} width="100%" justifyContent="space-between" p={{ base: '16px 20px', md: selectedIndex === i ? '22px 18px' : '26px 22px' }} gridGap={{ base: '5px', lg: '24px' }} cursor="pointer" background={backgroundColor2} border={selectedIndex === i && '4px solid #0097CD'} borderRadius="8px" minH="118px">
                    <Box display="flex" flex={1} flexDirection="column" gridGap={{ base: '0', lg: '12px' }} minWidth={{ base: '100%', md: '288px' }} height="fit-content" fontWeight="400">
                      <Box fontSize="18px" fontWeight="700">
                        {toCapitalize(item?.title)}
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
                onClick={() => {
                  router.push({
                    pathname: '/checkout',
                    query: {
                      course: currentCourse,
                      plan: selectedProps?.type,
                    },
                  });
                }}
              >
                {finance?.button?.title}
              </Button>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

UpgradeAccessModal.propTypes = {
  storySettings: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

UpgradeAccessModal.defaultProps = {
  storySettings: {
    isOpen: false,
  },
  isOpen: false,
  onClose: () => {},
};

export default UpgradeAccessModal;
