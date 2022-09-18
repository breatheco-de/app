import PropTypes from 'prop-types';
import {
  Box, TabList, TabPanel, TabPanels, Tabs, useColorModeValue, Text, Button,
} from '@chakra-ui/react';
import { useState, createRef } from 'react';
import { useRouter } from 'next/router';
import { AnimatedButton, CustomTab } from '../../common/components/Animated';
import Icon from '../../common/components/Icon';
import Heading from '../../common/components/Heading';
import ScrollSpy from '../../common/components/ScrollSpy';
import { slugify } from '../../utils';

const PreviewModules = ({ data }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const router = useRouter();
  const color = useColorModeValue('gray.700', 'gray.300');

  return (
    <Box maxW="container.xl" m="3rem auto 3rem auto" display="flex" flexDirection={{ base: 'column', md: 'row' }} height="auto" position="relative" alignItems="center" gridGap={51}>
      <Box display={{ base: 'none', md: 'inherit' }} position="absolute" top="-90px" left="410px">
        <Icon icon="curvedLine" width="80px" height="654px" />
      </Box>
      <Box display="flex">
        <Tabs index={currentTabIndex} variant="unstyled" display="flex" flex={1} flexDirection={{ base: 'column', md: 'row' }} height={{ base: '100%', md: '528px' }} mt={{ base: '40px', md: 0 }} alignItems="center">
          <TabList position="relative" display={{ base: 'none', md: 'inherit' }} width="48rem" height="100%" zIndex={99}>
            {data?.previewModules?.list[0]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(0)} top="20px" left="320px">
                {data?.previewModules?.list[0]?.title}
              </CustomTab>
            )}

            {data?.previewModules?.list[1]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(1)} top="107px" left="350px">
                {data?.previewModules?.list[1]?.title}
              </CustomTab>
            )}
            {data?.previewModules?.list[2]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(2)} top="204px" left="400px">
                {data?.previewModules?.list[2]?.title}
              </CustomTab>
            )}
            {data?.previewModules?.list[3]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(3)} bottom="164px" left="380px">
                {data?.previewModules?.list[3]?.title}
              </CustomTab>
            )}

            <CustomTab onClick={() => router.push('#more-content')} style={{ border: '3px solid #0097CD' }} bottom="57px" left="355px">
              {data?.previewModules?.moreContent}
            </CustomTab>

          </TabList>
          <TabPanels position="absolute" style={{ width: 'inherit', zIndex: 99, top: '60px' }}>
            {data?.previewModules?.list?.map((module) => (
              <TabPanel className="scroll-spy-container" key={module.title} display="flex" flexDirection="column" alignItems={{ base: 'center', md: 'inherit' }} gridGap="10px" textAlign={{ base: 'center', md: 'left' }}>
                <ScrollSpy offsetTop={220} autoScrollOffsetTop={-150} isCustomElement>
                  {module?.steps.map((step) => (
                    <Button
                      variant="unstyled"
                      className="sidebarButton"
                      width="fit-content"
                      fontSize="14px"
                      fontWeight="600"
                      lineHeight="24px"
                      borderRadius="0px"
                      key={slugify(step.title)}
                      href={`#${slugify(step.title)}`}
                      ref={createRef()}
                    >
                      {step.title}
                    </Button>
                  ))}
                </ScrollSpy>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
        <Box flex={0.7} display="flex" flexDirection="column" width="472px" alignSelf="center" gridGap="10px">
          <Heading as="h2" size="14px" letterSpacing="0.05em" color="blue.default">
            {data?.previewModules.title}
          </Heading>
          <Text fontSize="26px" fontWeight="700" lineHeight="30px">
            {data?.previewModules?.list[currentTabIndex]?.title}
          </Text>
          <Box className="scroll-container" display="flex" flexDirection="column" height="12rem" overflowX="auto">
            {data?.previewModules?.list[currentTabIndex]?.steps.map((step) => (
              <Text
                key={slugify(step.title)}
                className="scroll-area"
                id={`${slugify(step.title)}`}
                minHeight="12rem"
                fontSize="14px"
                mb="4rem"
                fontWeight="400"
                lineHeight="24px"
                letterSpacing="0.05em"
                color={color}
                dangerouslySetInnerHTML={{ __html: step.text }}
              />
            ))}
          </Box>
          <AnimatedButton onClick={() => router.push('#apply')} alignSelf={{ base: 'center', md: 'start' }}>
            {data?.previewModules.button.title}
          </AnimatedButton>
        </Box>
      </Box>
    </Box>
  );
};

PreviewModules.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default PreviewModules;
