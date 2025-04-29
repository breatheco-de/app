/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, useColorModeValue, Text, Flex,
} from '@chakra-ui/react';
import { PrismicRichText } from '@prismicio/react';
import Image from 'next/image';
import { MotionBox } from './Animated';
import Heading from './Heading';
import Icon from './Icon';
import Button from './Button';
import PrismicTextComponent from './PrismicTextComponent';
import useStyle from '../hooks/useStyle';

// --- Helper function to render the correct media ---
const renderMediaContent = (slice) => {
  const videoSourceUrl = slice?.primary?.video_source?.url;
  const imageUrl = slice?.primary?.image?.url;

  if (videoSourceUrl) {
    // --- Render Prismic Video ---
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '400px', // Consider making width/height dynamic if needed
          height: '100%',
          objectFit: 'cover',
          borderRadius: '7px', // Add border radius for consistency
        }}
        key={videoSourceUrl} // Use the variable
      >
        {/* Attempt to infer type, add more types or a Prismic field if needed */}
        <source
          src={videoSourceUrl}
          type={videoSourceUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
        />
        Your browser does not support the video tag.
      </video>
    );
  }

  // If no videoSourceUrl, check for imageUrl
  if (imageUrl) {
    // --- Render Prismic Image ---
    return (
      <Box display="flex" height="fit-content" justifyContent="end">
        <Image
          src={imageUrl}
          alt={slice.primary.image.alt || 'Introduction avatars'}
          width={slice.primary.image.dimensions?.width}
          height={slice.primary.image.dimensions?.height}
          style={{ borderRadius: '7px' }}
        />
      </Box>
    );
  }

  // --- Render Fallback Video ---
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: '400px',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '7px', // Added border radius
      }}
    >
      <source src="/static/videos/landing-avatars.webm" type="video/webm" />
    </video>
  );
};

function IntroductionSection({
  data, slice, fitContent, fontFamily, ...rest
}) {
  const colors = useColorModeValue('#000', '#fff');
  const { fontColor } = useStyle();

  const isLeftBigger = slice?.primary?.two_column_size === 'Left is bigger';
  const isRightBigger = slice?.primary?.two_column_size === 'Right is bigger';
  const bothAreEqual = slice?.primary?.two_column_size === 'Both are equal';

  console.log(slice);

  const getStyling = (type) => {
    const StyleMapping = {
      colored: {
        color: 'blue.default',
        borderBottom: '0px',
      },
      underlined: {
        transition: { duration: 3 },
        animate: {
          color: [colors, '#0097CD', colors, '#0097CD', colors, colors],
        },
      },
      normal: {
        color: fontColor,
      },
    };
    return StyleMapping[type] || StyleMapping.colored;
  };

  const getLeftColumnSize = () => {
    if (isLeftBigger) return 0.7;
    if (isRightBigger) return 0.3;
    if (bothAreEqual) return 0.5;
    return 0.7;
  };

  const getRightColumnSize = () => {
    if (isLeftBigger) return 0.3;
    if (isRightBigger) return 0.7;
    if (bothAreEqual) return 0.5;
    return 0.3;
  };

  return (
    <Flex
      flexDirection={{ base: 'column', md: 'row' }}
      px={{ base: '10px', md: '2rem' }}
      id={slice?.primary?.id_key || ''}
      {...rest}
    >
      <Box display={{ base: 'block', md: 'grid' }} flex={getLeftColumnSize()}>
        <Heading fontFamily={fontFamily} as="span" size="xl">
          {slice?.primary?.title ? (
            <>
              <PrismicTextComponent
                field={slice?.primary?.title}
                display="initial"
                size="48px"
                {...getStyling(slice?.primary?.title_style)}
                fontWeight={slice?.primary?.title_weight}
                lineHeight="inherit"
                fontFamily={fontFamily}
              />
              {slice?.primary?.highlight && (
                <PrismicTextComponent
                  field={slice?.primary?.highlight}
                  fontWeight={slice?.primary?.hightlight_weight}
                />
              )}
            </>
          ) : (
            <>
              {data?.title}
              {data?.highlight && (
                <MotionBox
                  as="strong"
                  className="highlighted box"
                  transition={{ duration: 3 }}
                  animate={{
                    color: [colors, '#0097CD', colors, '#0097CD', colors, colors],
                  }}
                  margin="0 0 0 10px"
                  display={{ base: 'none', sm: 'initial' }}
                >
                  {data?.highlight}
                </MotionBox>
              )}
            </>
          )}
        </Heading>

        {slice?.primary?.description.length > 0 ? (
          <Text as="div" fontSize="21px" fontWeight={700} pt="16px">
            <PrismicTextComponent field={slice?.primary?.description} fontSize="21px" lineHeight="inherit" />
          </Text>
        ) : data?.description && (
          <Text fontSize="21px" fontWeight={700} pt="16px">
            {data?.description}
          </Text>
        )}

        {/* ----------------------- Bullets ----------------------- */}
        {(slice?.primary?.bullets?.[0]?.spans?.length > 0 || slice?.primary?.bullets?.length > 0) && (
          <Box as="ul" display="flex" flexDirection="column" gridGap="4px" width="fit-content" mt="9px">
            {slice?.primary?.bullets?.length > 0
              ? (
                <PrismicTextComponent
                  field={slice?.primary?.bullets}
                  components={{
                    listItem: ({ children }, index) => (
                      <MotionBox whileHover={{ scale: 1.05 }} as="li" key={index} display="flex" fontSize="18px" gridGap="10px" alignItems="center">
                        <Icon icon="checked2" color="#25BF6C" width="14px" height="14px" />
                        {children}
                      </MotionBox>
                    ),
                  }}
                />
              )
              : data?.bullets?.length > 0 && data?.bullets.map((l) => (
                <MotionBox whileHover={{ scale: 1.05 }} as="li" key={l.text} display="flex" fontSize="14px" gridGap="10px" alignItems="center">
                  <Icon icon={l.icon} width="14px" height="14px" />
                  {l.text}
                </MotionBox>
              ))}
          </Box>
        )}

        {/* ----------------------- Button ----------------------- */}
        {slice?.primary?.buttontext?.length > 0 && slice?.primary?.buttontext ? (
          <Button
            id={slice.primary.button_id}
            variant="default"
            width="fit-content"
            textAlign="center"
            to={slice?.primary?.button_link?.url || slice?.primary?.button_link || '#recommended-courses'}
            fontSize="17px"
            m="9px 0"
            letterSpacing="0.05em"
          >
            <PrismicRichText field={slice?.primary?.buttontext} />
          </Button>
        ) : (
          <>
            {data?.callToAction?.title && (
              <Button variant="default" width="fit-content" fontSize="17px" m="9px 0" letterSpacing="0.05em" textTransform="uppercase" to={data?.callToAction.href || '#recommended-courses'}>
                {data?.callToAction.title}
              </Button>
            )}
          </>
        )}
      </Box>

      {/* ----------------------- Image/Video ----------------------- */}
      <Box display={{ base: 'block', md: 'grid' }} flex={getRightColumnSize()}>
        {/* Call the helper function */}
        {renderMediaContent(slice)}
      </Box>
    </Flex>
  );
}

IntroductionSection.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  fontFamily: PropTypes.string,
};

IntroductionSection.defaultProps = {
  slice: {},
  data: {},
  fontFamily: 'Lato',
};

export default IntroductionSection;
