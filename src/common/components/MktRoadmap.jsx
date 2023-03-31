/* eslint-disable no-unused-vars */
import {
  Box, TabList, Tabs,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import { CustomTab } from './Animated';
import Heading from './Heading';
import Text from './Text';

const arrayData = [
  {
    name: 'HTML/CSS',
    slug: '',
    short_name: '',
    icon_url: 'html',
    description:
      'During the pre-work you learn some basic <strong>CSS</strong> and <strong>HTML</strong>, and hopefully how to use the <strong>flex-box</strong> to create simple layouts. The first day we will review the pre-work completion and introduce a more evolved CSS that enables amazing layouts and the amazing Bootstrap framework that will make you life so much easier with the "component oriented" approach.',
  },
  {
    name: 'Bootstrap',
    slug: '',
    short_name: '',
    icon_url: 'html',
    description:
      'During the pre-work you learn some basic <strong>CSS</strong> and <strong>HTML</strong>, and hopefully how to use the <strong>flex-box</strong> to create simple layouts. The first day we will review the pre-work completion and introduce a more evolved CSS that enables amazing layouts and the amazing Bootstrap framework that will make you life so much easier with the "component oriented" approach.',
  },
];

const MktRoadmap = ({ course }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setData(arrayData);
  }, []);

  const items = [
    { id: 1, size: 'large' },
    { id: 2, size: 'medium' },
    { id: 3, size: 'medium' },
    { id: 4, size: 'medium' },
    { id: 5, size: 'large' },
    { id: 6, size: 'medium' },
  ];

  // Fórmula para la curva grande
  const largeCurve = (left) => {
    const amp = 100; // Amplitud de la curva grande
    const frec = 0.05; // Frecuencia de la curva grande
    const fase = Math.PI / 2; // Fase de la curva grande
    const py = 200; // Posición vertical inicial de la curva grande
    return amp * Math.sin(frec * left + fase) + py;
  };

  // Fórmula para la curva mediana
  const mediumCurve = (left) => {
    const amp = 50; // Amplitud de la curva mediana
    const frec = 0.1; // Frecuencia de la curva mediana
    const fase = Math.PI; // Fase de la curva mediana
    const py = 350; // Posición vertical inicial de la curva mediana
    return amp * Math.sin(frec * left + fase) + py;
  };

  // const renderItems = () => {
  //   let left = 0;
  //   const itemsToRender = [];

  //   items.forEach((item) => {
  //     const sizeFactor = item.size === 'large' ? 1 : 0.5;
  //     const top = sizeFactor * (150 * (2 ** (left / 100))) + 50;
  //     const topMed = sizeFactor * (75 * Math.log(((2 * left) / 100) + 1)) + 175;
  //     const style = { position: 'absolute', top: `${item.size === 'large' ? top : topMed}px`, left: `${left}px` };
  //     // const style = { top: `${top}px`, left: `${left}px` };
  //     itemsToRender.push(<div key={item.id} className={`item ${item.size}`} style={style}>{`Numero ${item.id}`}</div>);
  //     left += 100; // Incrementa la posición horizontal para cada elemento
  //   });

  //   return itemsToRender;
  // };

  // const renderItems = () => {
  //   let left = 0;
  //   const itemsToRender = [];

  //   items.forEach((item) => {
  //     const top = item.size === 'large' ? largeCurve(left) : mediumCurve(left);
  //     const style = { position: 'absolute', top: `${top}px`, left: `${left}px`, width: '100%', height: 'auto' };
  //     itemsToRender.push(<div key={item.id} className={`item ${item.size}`} style={style}>{`Numero ${item.id}`}</div>);
  //     left += 100; // Incrementa la posición horizontal para cada elemento
  //   });

  //   return itemsToRender;
  // };

  return (
    <Box
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
        left="410px"
      >
        <Icon icon="curvedLine" width="80px" height="654px" />
      </Box>
      <Box display="flex" width="100%">
        <Tabs
          index={currentTabIndex}
          variant="unstyled"
          display="flex"
          flex={1}
          flexDirection={{ base: 'column', md: 'row' }}
          height={{ base: '100%', md: '528px' }}
          mt={{ base: '40px', md: 0 }}
          alignItems="center"
        >
          <TabList
            position="relative"
            display={{ base: 'none', md: 'inherit' }}
            width="48rem"
            height="100%"
            zIndex={99}
          >
            renderItems here
            <CustomTab
              onClick={() => router.push('#more-content')}
              style={{ border: '3px solid #0097CD' }}
              bottom="57px"
              left="355px"
            >
              {data?.previewModules?.moreContent}
            </CustomTab>
          </TabList>
        </Tabs>
        <Box
          flex={0.7}
          display="flex"
          flexDirection="column"
          width="472px"
          alignSelf="center"
          gridGap="10px"
        >
          <Heading
            as="h2"
            size="xsm"
            letterSpacing="0.05em"
            // color="blue.default"
          >
            What you will learn
          </Heading>
          <Text size="26px" fontWeight="700" lineHeight="30px">
            HTML/CSS
          </Text>
          <Box
            display="flex"
            flexDirection="column"
            gridGap="4rem"
            height="12rem"
            overflowX="auto"
          >
            {items.map((item) => (
              <Box key={item.id}>
                {item.id}
              </Box>
            ))}
          </Box>
          {/* <Button
            onClick={() => router.push(data?.previewModules.button.link)}
            alignSelf={{ base: 'center', md: 'start' }}
          >
            {data?.previewModules.button.title}
          </Button> */}
        </Box>
      </Box>
    </Box>
  );
};
MktRoadmap.propTypes = {
  course: PropTypes.string,
};
MktRoadmap.defaultProps = {
  course: '',
};

export default MktRoadmap;
