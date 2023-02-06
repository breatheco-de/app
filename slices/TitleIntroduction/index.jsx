/* eslint-disable react/prop-types */
import { Box, Container } from '@chakra-ui/react';
import React from 'react';
// import { PrismicRichText } from '@prismicio/react';
import IntroductionSection from '../../src/js_modules/landing/introductionSection';

/**
 * @typedef {import("@prismicio/client").Content.TitleIntroductionSlice} TitleIntroductionSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TitleIntroductionSlice>} TitleIntroductionProps
 * @param { TitleIntroductionProps }
 */
const TitleIntroduction = ({ slice }) => (
  <Box pt="3rem">
    <Container maxW="container.xl" px="4rem">
      <IntroductionSection
        slice={slice}
      />
    </Container>
  </Box>
  // <section>
  //   <span className="title">
  //     {slice.primary.title ? (
  //       <PrismicRichText field={slice.primary.title} />
  //     ) : (
  //       <h2>{slice.primary.title}</h2>
  //     )}
  //   </span>
  //   {slice.primary.body ? (
  //     <PrismicRichText field={slice.primary.body} />
  //   ) : (
  //     <p>start by editing this slice from inside Slice Machine!</p>
  //   )}
  //   {slice.primary.backgroundimage.url && (
  //     // eslint-disable-next-line @next/next/no-img-element
  //     <img src={slice.primary.backgroundimage.url} alt={slice.primary.backgroundimage.alt} />
  //   )}
  //   <style jsx>
  //     {`
  //     section {
  //       max-width: 600px;
  //       margin: 4em auto;
  //       text-align: center;
  //     }
  //     .title {
  //       color: #8592e0;
  //     }
  //   `}
  //   </style>
  // </section>
);

export default TitleIntroduction;
