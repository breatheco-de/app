/* eslint-disable no-unused-vars */
import {
  Box, Image, TabList, Tabs,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
// import axios from 'axios';
import useTranslation from 'next-translate/useTranslation';
import axios from '../../axios';
import Icon from './Icon';
import { CustomTab } from './Animated';
import Heading from './Heading';
import Text from './Text';
import useStyle from '../hooks/useStyle';

const arrayData = [
  {
    name: 'HTML/CSS',
    slug: 'html-css',
    short_name: 'HTML/CSS',
    icon_url: '',
    description: 'During the pre-work you learn some basic <strong>CSS</strong> and <strong>HTML</strong>, and hopefully how to use the <strong>flex-box</strong> to create simple layouts. The first day we will review the pre-work completion and introduce a more evolved CSS that enables amazing layouts and the amazing Bootstrap framework that will make you life so much easier with the "component oriented" approach.',
  },
  {
    name: 'Bootstrap',
    slug: 'bootstrap',
    short_name: 'Bootstrap',
    icon_url: '',
    description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing",
  },
  {
    name: 'Github',
    slug: 'github',
    short_name: 'Github',
    icon_url: '',
    description: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution',
  },
  {
    name: 'Git & Gitflow',
    slug: 'git',
    short_name: 'Git & Gitflow',
    icon_url: '',
    description:
      'classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular',
  },
  {
    name: 'Git & Gitflow 2',
    slug: 'git2eeee',
    short_name: 'Git & Gitflow 2',
    icon_url: '',
    description:
      'written in 45 BC. This book is a treatise on the theory of ethics, very popular',
  },
];

const MktRoadmap = ({ id, course, moreContent, buttonTitle, buttonLink }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const { t } = useTranslation('common');
  const [data, setData] = useState(arrayData);
  const { fontColor3 } = useStyle();
  const router = useRouter();

  axios.defaults.headers.common['Accept-Language'] = router.locale;
  useEffect(() => {
    if (typeof course === 'string') {
      axios.get(`${process.env.BREATHECODE_HOST}/v1/marketing/course/${course}`)
        .then((response) => {
          setData(response?.data?.course_translation?.course_modules);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  return (
    <Box
      id={id}
      maxW="container.xl"
      m="3rem auto 3rem auto"
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      height="auto"
      position="relative"
      alignItems="center"
      gridGap={51}
    >
      <Box
        display={{ base: 'none', md: 'inherit' }}
        position="absolute"
        top="-90px"
        left="300px"
      >
        <Icon icon="curvedLine" width="80px" height="654px" />
      </Box>
      <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} width="100%">
        <Tabs
          index={currentTabIndex}
          variant="unstyled"
          display="flex"
          flex={0.5}
          flexDirection={{ base: 'column', md: 'row' }}
          height={{ base: '100%', md: '528px' }}
          mt={{ base: '40px', md: 0 }}
          alignItems="center"
        >
          <TabList
            position="relative"
            display={{ base: 'none', md: 'inherit' }}
            height="100%"
            zIndex={99}
          >
            {data?.[0]?.slug && (
              <CustomTab onClick={() => setCurrentTabIndex(0)} top="20px" left="210px" p="1rem 12px">
                {data?.[0]?.icon_url && (
                  <Image src={data?.[0]?.icon_url} height="35px" style={{ marginRight: '10px' }} />
                )}
                {data?.[0]?.short_name || data?.[0]?.name}
              </CustomTab>
            )}

            {data?.[1]?.slug && (
              <CustomTab onClick={() => setCurrentTabIndex(1)} top="107px" left="240px" p="1rem 12px">
                {data?.[1]?.icon_url && (
                  <Image src={data?.[1]?.icon_url} height="35px" style={{ marginRight: '10px' }} />
                )}
                {data?.[1]?.short_name || data?.[1]?.name}
              </CustomTab>
            )}
            {data?.[2]?.slug && (
              <CustomTab onClick={() => setCurrentTabIndex(2)} top="194px" left="280px" p="1rem 12px">
                {data?.[2]?.icon_url && (
                  <Image src={data?.[2]?.icon_url} height="35px" style={{ marginRight: '10px' }} />
                )}
                {data?.[2]?.short_name || data?.[2]?.name}
              </CustomTab>
            )}
            {data?.[3]?.slug && (
              <CustomTab onClick={() => setCurrentTabIndex(3)} bottom="164px" left="270px" p="1rem 12px">
                {data?.[3]?.icon_url && (
                  <Image src={data?.[3]?.icon_url} height="35px" style={{ marginRight: '10px' }} />
                )}
                {data?.[3]?.short_name || data?.[3]?.name}
              </CustomTab>
            )}
            {(data?.length === 4 || moreContent) ? (
              <CustomTab onClick={() => router.push(buttonLink)} style={{ border: '3px solid #0097CD' }} bottom="57px" left="255px">
                {buttonTitle}
              </CustomTab>
            ) : data?.[4]?.slug && (
              <CustomTab onClick={() => setCurrentTabIndex(4)} bottom="57px" left="255px" p="1rem 12px">
                {data?.[4]?.icon_url && (
                  <Image src={data?.[4]?.icon_url} height="35px" style={{ marginRight: '10px' }} />
                )}
                {data?.[4]?.short_name || data?.[4]?.name}
              </CustomTab>
            )}

          </TabList>
        </Tabs>
        <Box
          flex={0.5}
          display="flex"
          flexDirection="column"
          alignSelf="center"
          gridGap="10px"
        >
          <Heading
            as="h2"
            size="xsm"
            letterSpacing="0.05em"
            mb="1rem"
            // color="blue.default"
          >
            {t('what-you-will-learn')}
          </Heading>
          <Text size="26px" fontWeight="700" lineHeight="30px">
            {data[currentTabIndex]?.name}
          </Text>
          <Box
            display="flex"
            flexDirection="column"
            gridGap="4rem"
            height="12rem"
            overflowX="auto"
          >
            {data?.[currentTabIndex]?.description && (
              <Text
                key={data[currentTabIndex]?.slug}
                className="scroll-area"
                id={`${data[currentTabIndex]?.slug}`}
                minHeight="12rem"
                fontSize="14px"
                // mb="4rem"
                fontWeight="400"
                lineHeight="24px"
                letterSpacing="0.05em"
                color={fontColor3}
                dangerouslySetInnerHTML={{ __html: data?.[currentTabIndex]?.description }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
MktRoadmap.propTypes = {
  course: PropTypes.string,
  buttonTitle: PropTypes.string,
  buttonLink: PropTypes.string,
  moreContent: PropTypes.bool,
  id: PropTypes.string,
};
MktRoadmap.defaultProps = {
  course: '',
  buttonTitle: 'More content',
  buttonLink: '#',
  moreContent: false,
  id: '',
};

export default MktRoadmap;
