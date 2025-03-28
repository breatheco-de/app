import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Flex, Img, useColorModeValue, Image,
} from '@chakra-ui/react';
import Heading from './Heading';
import Text from './Text';
import Link from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import PrismicTextComponent from './PrismicTextComponent';
import ReactPlayerV2 from './ReactPlayerV2';
// import Head from 'next/head';

const SIZES = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
};

const BUTTON_COLOR = {
  BLUE: 'Blue',
  WHITE: 'White',
  DARK_BLUE: 'Dark Blue',
};

function MktTwoColumnSideImage({
  id,
  informationSize,
  titleColor,
  subtitleColor,
  buttonColor,
  textBackgroundColor,
  miniTitle,
  title,
  subTitle,
  description,
  imageUrl,
  videoUrl,
  linkButton,
  buttonUrl,
  buttonLabel,
  buttonLabelSize,
  background,
  border,
  imagePosition,
  slice,
  descriptionTitle,
  descriptionFontSize,
  imageAlt,
  gridGap,
  fontFamily,
  fontFamilySubtitle,
  textSideProps,
  imageSideProps,
  containerProps,
  customTitleSize,
  customSubTitleSize,
  studentsAvatars,
  studentsAvatarsDescriptions,
  multiDescription,
  transparent,
  marginTop,
  marginBottom,
  maxWidth,
  borderRadius,
  margin,
  ...rest
}) {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { fontColor2, hexColor, backgroundColor } = useStyle();
  const flexDirection = {
    right: 'ltr',
    left: 'rtl',
  };
  const fontColor = useColorModeValue(slice?.primary?.font_color, slice?.primary?.font_color_in_darkmode);
  const sideBackgroundColor = useColorModeValue(textBackgroundColor, slice?.primary?.background_in_dark_mode);

  const imageProps = slice && slice?.primary?.image?.dimensions;

  const getButtonColors = () => {
    if (buttonColor === BUTTON_COLOR.BLUE) {
      return {
        color: '#FFF',
        background: 'blue.default2',
      };
    }
    if (buttonColor === BUTTON_COLOR.WHITE) {
      return {
        color: '#0097CD',
        background: 'white',
      };
    }
    if (buttonColor === BUTTON_COLOR.DARK_BLUE) {
      return {
        color: '#FFF',
        background: '#0084FF',
      };
    }
    return {
      color: '#FFF',
      background: 'blue.default2',
    };
  };
  const buttonColors = getButtonColors();

  const prisimicStyles = () => {
    if (informationSize === SIZES.SMALL) {
      return {
        titleSize: '26px',
        titleLineHeight: '1.2',
        subtitleSize: '14px',
        descriptionLineHeight: 'normal',
        descriptionSize: '12px',
      };
    }
    if (informationSize === SIZES.MEDIUM) {
      return {
        titleSize: '26px',
        titleLineHeight: '1.2',
        subtitleSize: '21px',
        descriptionSize: '18px',
        descriptionLineHeight: 'normal',
        padding: '24px 14px',
      };
    }
    if (informationSize === SIZES.LARGE) {
      return {
        titleSize: '44px',
        titleLineHeight: '54px',
        subtitleSize: '21px',
        descriptionSize: '14px',
        descriptionLineHeight: 'normal',
        padding: '34px',
      };
    }
    return {
      titleSize: '26px',
      titleLineHeight: '1.2',
      subtitleSize: '14px',
      descriptionSize: '12px',
      padding: '24px 14px',
    };
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      } else {
        setIsVisible(false);
      }
    }, { threshold: 0.2 });

    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  const prismicStyles = prisimicStyles();
  return (
    <Box
      id={id}
      margin={margin || '0 auto'}
      maxWidth={maxWidth || '1280px'}
      borderRadius={borderRadius}
      {...rest}
    >
      <Flex
        background={transparent ? 'transparent' : background || backgroundColor}
        flexDirection={{ base: 'column', md: 'row' }}
        width="100%"
        margin="0"
        id={id}
        border={border}
        alignItems="center"
        borderRadius="12px"
        padding={{ base: '20px 10px', md: '24px 20px' }}
        // px={{ base: '10px', md: '2rem' }}
        gridGap={gridGap}
        marginTop={marginTop}
        marginBottom={marginBottom}
        style={{
          direction: flexDirection[imagePosition],
        }}
        {...containerProps}
      >
        <Box flex={0.5} height="100%" style={{ direction: 'initial' }} background={sideBackgroundColor} padding={prismicStyles.padding} borderRadius={{ base: '0px', md: '11px' }} {...textSideProps}>
          <Flex color={fontColor} flexDirection="column" gridGap="16px" alignSelf="center">
            {miniTitle && (
              <Heading
                fontSize={prismicStyles.descriptionSize}
                lineHeight={prismicStyles.descriptionLineHeight || '14px'}
                margin="15px 0"
                alignItems="center"
                color={fontColor || fontColor2}
                fontFamily={fontFamily}
              >
                {miniTitle}
              </Heading>
            )}
            <Heading fontFamily={fontFamily} as="h2" size={customTitleSize || prismicStyles.titleSize} lineHeight={prismicStyles.titleLineHeight} color={titleColor || 'currentColor'} style={{ textWrap: 'balance' }}>
              {title}
            </Heading>
            {subTitle && (
              <Heading fontFamily={fontFamilySubtitle} as="h4" fontSize={customSubTitleSize || prismicStyles.subtitleSize} color={subtitleColor || 'currentColor'}>
                {subTitle}
              </Heading>
            )}
            {multiDescription.length > 0 && (
              <Box
                display="grid"
                gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}
                gap={4}
              >
                {multiDescription.map((content) => (
                  <Box key={content.multi_description_title} p={2}>
                    <Text fontWeight="bold" size="15px" as="h4">{content.multi_description_title}</Text>
                    <Text fontFamily={fontFamily} size="15px" as="h5">{content.multi_description_content}</Text>
                  </Box>
                ))}
              </Box>
            )}
            <Heading fontSize="20px" as="h4">
              {descriptionTitle}
            </Heading>
            {slice?.primary?.description ? (
              <PrismicTextComponent
                field={slice?.primary?.description}
                color={slice?.primary?.description_color || 'currentColor'}
                fontSize={descriptionFontSize}
              />
            ) : (
              <Text
                fontSize={prismicStyles.descriptionSize}
                lineHeight={prismicStyles.descriptionLineHeight || '14px'}
                alignItems="center"
                color={fontColor || fontColor2}
                fontFamily={fontFamily}
              >
                {description}
              </Text>
            )}
            {studentsAvatars.length > 0 && (
              <Flex alignItems="center" gridGap="16px">
                <Flex>
                  {
                    studentsAvatars.map((avatar, index) => {
                      const limitViewStudents = 5;
                      return (
                        <Image
                          key={avatar.text}
                          margin={index < (limitViewStudents - 1) ? '0 -21px 0 0' : '0'}
                          src={avatar.text}
                          width="40px"
                          height="40px"
                          borderRadius="50%"
                          objectFit="cover"
                          alt={`Picture number ${index + 1}`}
                        />
                      );
                    })
                  }
                </Flex>
                <Text size="16px" color="currentColor" fontWeight={400}>
                  {studentsAvatarsDescriptions}
                </Text>
              </Flex>

            )}
            {buttonUrl && (
              <Link
                variant={!linkButton && 'buttonDefault'}
                color={linkButton ? hexColor?.blueDefault : buttonColors?.color}
                // color='green'
                background={linkButton ? 'transparent' : hexColor?.blue3}
                border="1px solid"
                borderColor="transparent"
                _hover={{
                  background: linkButton ? 'transparent' : hexColor?.blue5,
                  borderColor: linkButton ? 'transparent' : buttonColors?.color,
                  textDecoration: linkButton ? 'underline' : 'none',
                }}
                _active={{
                  background: linkButton ? 'transparent' : hexColor?.blue4,
                  borderColor: linkButton ? 'transparent' : buttonColors?.color,
                }}
                _disabled={{
                  background: linkButton ? 'transparent' : hexColor?.blue6,
                  borderColor: linkButton ? 'transparent' : buttonColors?.color,
                  cursor: 'not-allowed',
                }}
                fontSize={buttonLabelSize}
                margin="8px 0 0 0"
                href={buttonUrl || '#recommended-courses'}
                textAlign="center"
                display="inline-block"
                width="fit-content"
                fontFamily="Lato"
              // fontSize={buttonLabelSize}
              >
                {/* <Link color={hexColor.blueDefault} href={aricle_url || '#'} target="__blank" visibility={aricle_url ? 'visible' : 'hidden'}></Link> */}
                {buttonLabel}
                {'  '}
                {linkButton && '→'}
              </Link>
            )}
          </Flex>
        </Box>
        <Box flex={0.5} minHeight="200px" style={{ direction: 'initial' }} ref={videoRef}>
          {videoUrl ? (
            <ReactPlayerV2
              url={videoUrl}
              borderRadius="20px"
              controls={false}
              loop
              autoFullScreen={false}
              muted
              volume={0}
              width="100%"
              height="auto"
              pictureInPicture={false}
              autoPlay={isVisible}
              iframeStyle={{
                background: 'transparent',
              }}
              playerConfig={{
                file: {
                  attributes: {
                    playsInline: true,
                    disablePictureInPicture: true,
                    controlsList: 'nodownload',
                  },
                },
              }}
            />
          ) : (
            <Img
              boxSize="100%"
              margin="0 auto"
              objectFit="contain"
              src={imageUrl}
              alt={imageAlt}
              title={imageAlt}
              px={{ base: '10px', md: 'none' }}
              borderRadius="3px"
              width={imageProps?.width}
              {...imageSideProps}
            />
          )}
        </Box>
      </Flex>
    </Box>
  );
}

MktTwoColumnSideImage.propTypes = {
  informationSize: PropTypes.string,
  titleColor: PropTypes.string,
  subtitleColor: PropTypes.string,
  buttonColor: PropTypes.string,
  textBackgroundColor: PropTypes.string,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  description: PropTypes.string,
  descriptionFontSize: PropTypes.string,
  imagePosition: PropTypes.string,
  videoUrl: PropTypes.string,
  imageUrl: PropTypes.string,
  linkButton: PropTypes.bool,
  buttonUrl: PropTypes.string,
  buttonLabel: PropTypes.string,
  buttonLabelSize: PropTypes.string,
  background: PropTypes.string,
  border: PropTypes.string,
  slice: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  descriptionTitle: PropTypes.string,
  imageAlt: PropTypes.string,
  id: PropTypes.string,
  gridGap: PropTypes.string,
  fontFamily: PropTypes.string,
  textSideProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  imageSideProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  containerProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  studentsAvatarsDescriptions: PropTypes.string,
  studentsAvatars: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  fontFamilySubtitle: PropTypes.string,
  customTitleSize: PropTypes.string,
  customSubTitleSize: PropTypes.string,
  multiDescription: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  transparent: PropTypes.bool,
  marginTop: PropTypes.string,
  marginBottom: PropTypes.string,
  maxWidth: PropTypes.string,
  margin: PropTypes.string,
  borderRadius: PropTypes.string,
  miniTitle: PropTypes.string,
};

MktTwoColumnSideImage.defaultProps = {
  informationSize: 'small',
  titleColor: null,
  subtitleColor: null,
  buttonColor: null,
  textBackgroundColor: 'transparent',
  title: null,
  subTitle: null,
  description: null,
  descriptionFontSize: null,
  imagePosition: 'left',
  imageUrl: null,
  videoUrl: null,
  linkButton: false,
  buttonUrl: null,
  buttonLabel: null,
  buttonLabelSize: null,
  background: null,
  border: null,
  slice: null,
  descriptionTitle: null,
  imageAlt: '',
  id: '',
  gridGap: '24px',
  fontFamily: 'Lato',
  textSideProps: {},
  imageSideProps: {},
  containerProps: {},
  studentsAvatarsDescriptions: '',
  studentsAvatars: [],
  fontFamilySubtitle: 'Lato, Space Grotesk Variable',
  customTitleSize: null,
  customSubTitleSize: null,
  multiDescription: [],
  transparent: false,
  marginTop: '',
  marginBottom: '',
  maxWidth: '',
  margin: '',
  borderRadius: '',
  miniTitle: '',
};

export default MktTwoColumnSideImage;
