import PropTypes from 'prop-types';
import {
  Box, TabList, TabPanel, TabPanels, Tabs, useColorModeValue, Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import Plx from 'react-plx';
import { useRouter } from 'next/router';
import { AnimatedButton, CustomTab } from '../../common/components/Animated';
import Icon from '../../common/components/Icon';
import { parallax4 } from '../../lib/landing-props';
import Heading from '../../common/components/Heading';

const PreviewModules = ({ data }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const router = useRouter();
  const color = useColorModeValue('gray.700', 'gray.300');

  return (
    <Box maxW="container.xl" m="3rem auto 3rem auto" display="flex" flexDirection={{ base: 'column', md: 'row' }} height="auto" position="relative" alignItems="center" gridGap={51}>
      <Box display={{ base: 'none', md: 'inherit' }} position="absolute" top="-90px" left="340px">
        <Icon icon="curvedLine" width="80px" height="654px" />
      </Box>
      <Plx parallaxData={parallax4}>
        <Tabs index={currentTabIndex} variant="unstyled" display="flex" flexDirection={{ base: 'column', md: 'row' }} height={{ base: '100%', md: '528px' }} mt={{ base: '40px', md: 0 }} alignItems="center">
          <TabList position="relative" w="400px" flex={0.6} display={{ base: 'none', md: 'inherit' }} width="592px" height="100%">
            {data?.previewModules?.list[0]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(0)} top="20px" left="250px">
                {data?.previewModules?.list[0]?.title}
              </CustomTab>
            )}

            {data?.previewModules?.list[1]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(1)} top="107px" left="290px">
                {data?.previewModules?.list[1]?.title}
              </CustomTab>
            )}
            {data?.previewModules?.list[2]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(2)} top="204px" left="330px">
                {data?.previewModules?.list[2]?.title}
              </CustomTab>
            )}
            {data?.previewModules?.list[3]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(3)} bottom="164px" left="310px">
                {data?.previewModules?.list[3]?.title}
              </CustomTab>
            )}

            <CustomTab onClick={() => router.push('#more-content')} style={{ border: '3px solid #0097CD' }} bottom="57px" left="280px">
              {data?.previewModules?.moreContent}
            </CustomTab>

          </TabList>
          <TabPanels flex={{ base: 0.6, md: 0.45 }}>
            {/* flex={{ base: 0.6, md: 0.45 }} */}
            {data?.previewModules?.list?.map((module) => (
              <TabPanel key={module.title} display="flex" flexDirection="column" alignItems={{ base: 'center', md: 'inherit' }} gridGap="20px" style={{ flex: 0.5 }} textAlign={{ base: 'center', md: 'left' }}>
                <Heading as="h2" size="14px" letterSpacing="0.05em" color="blue.default">
                  {data?.previewModules.title}
                </Heading>
                <Text fontSize="26px" fontWeight="700" lineHeight="30px">
                  {module.title}
                </Text>
                <Text
                  fontSize="14px"
                  fontWeight="400"
                  lineHeight="24px"
                  letterSpacing="0.05em"
                  color={color}
                  dangerouslySetInnerHTML={{ __html: module.description }}
                />
                <AnimatedButton onClick={() => router.push('#apply')} alignSelf={{ base: 'center', md: 'start' }}>
                  {data?.previewModules.button.title}
                </AnimatedButton>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Plx>
    </Box>
  );
};

PreviewModules.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default PreviewModules;
