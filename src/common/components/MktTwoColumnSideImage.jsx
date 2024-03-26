import PropTypes from 'prop-types';
import {
  Box, Flex, Img, useColorModeValue,
} from '@chakra-ui/react';
import Heading from './Heading';
import Text from './Text';
import Link from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import PrismicTextComponent from './PrismicTextComponent';

const SIZES = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
};

const BUTTON_COLOR = {
  BLUE: 'Blue',
  WHITE: 'White',
};

function MktTwoColumnSideImage({
  id,
  informationSize,
  titleColor,
  subtitleColor,
  buttonColor,
  textBackgroundColor,
  title,
  subTitle,
  description,
  imageUrl,
  linkButton,
  buttonUrl,
  buttonLabel,
  background,
  border,
  imagePosition,
  slice,
  imageAlt,
  gridGap,
  fontFamily,
  textSideProps,
  imageSideProps,
  containerProps,
  ...rest
}) {
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
        background: 'blue.default',
      };
    }
    if (buttonColor === BUTTON_COLOR.WHITE) {
      return {
        color: '#0097CD',
        background: 'white',
      };
    }
    return {
      color: '#FFF',
      background: 'blue.default',
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
  const prismicStyles = prisimicStyles();

  return (
    <Box
      id={id}
      background={background || backgroundColor}
      {...rest}
    >
      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        maxWidth="1280px"
        margin="0 auto"
        id={id}
        px="10px"
        border={border}
        alignItems="center"
        borderRadius="12px"
        padding={{ base: '20px 10px', md: '24px 0px' }}
        gridGap={gridGap}
        marginTop="20px"
        style={{
          direction: flexDirection[imagePosition],
        }}
        {...containerProps}
      >
        <Box flex={0.5} height="100%" style={{ direction: 'initial' }} background={sideBackgroundColor} padding={prismicStyles.padding} borderRadius={{ base: '0px', md: '11px' }} {...textSideProps}>
          <Flex color={fontColor} flexDirection="column" gridGap="16px" alignSelf="center">
            <Heading fontFamily={fontFamily} as="h2" size={prismicStyles.titleSize} lineHeight={prismicStyles.titleLineHeight} color={titleColor || 'currentColor'} style={{ textWrap: 'balance' }}>
              {title}
            </Heading>
            {subTitle && (
              <Heading as="h4" fontSize={prismicStyles.subtitleSize} color={subtitleColor || 'currentColor'}>
                {subTitle}
              </Heading>
            )}
            {slice?.primary?.description ? (
              <PrismicTextComponent
                field={slice?.primary?.description}
                color={slice?.primary?.description_color || 'currentColor'}
              />
            ) : (
              <Text
                fontSize={prismicStyles.descriptionSize}
                lineHeight={prismicStyles.descriptionLineHeight || '14px'}
                margin="15px 0"
                alignItems="center"
                color={fontColor2}
              >
                {description}
              </Text>
            )}
            {buttonUrl && (
              <Link
                variant={!linkButton && 'buttonDefault'}
                color={linkButton ? hexColor?.blueDefault : buttonColors?.color}
                background={linkButton ? 'transparent' : buttonColors?.background}
                border="1px solid"
                borderColor="transparent"
                _hover={{
                  background: linkButton ? 'transparent' : buttonColors?.background,
                  borderColor: linkButton ? 'transparent' : buttonColors?.color,
                }}
                _active={{
                  background: linkButton ? 'transparent' : buttonColors?.background,
                  borderColor: linkButton ? 'transparent' : buttonColors?.color,
                }}
                textDecoration={linkButton && 'underline'}
                fontSize="14px"
                margin="8px 0 0 0"
                href={buttonUrl}
                textAlign="center"
                display="inline-block"
                width="fit-content"
                fontFamily="Lato"
              >
                {buttonLabel}
              </Link>
            )}
          </Flex>
        </Box>
        <Box flex={0.5} style={{ direction: 'initial' }}>
          <Img
            boxSize="100%"
            margin="0 auto"
            objectFit="contain"
            src={imageUrl}
            alt={imageAlt}
            title={imageAlt}
            borderRadius="3px"
            width={imageProps?.width}
            {...imageSideProps}
          />
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
  imagePosition: PropTypes.string,
  imageUrl: PropTypes.string,
  linkButton: PropTypes.bool,
  buttonUrl: PropTypes.string,
  buttonLabel: PropTypes.string,
  background: PropTypes.string,
  border: PropTypes.string,
  slice: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  imageAlt: PropTypes.string,
  id: PropTypes.string,
  gridGap: PropTypes.string,
  fontFamily: PropTypes.string,
  textSideProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  imageSideProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  containerProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
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
  imagePosition: 'left',
  imageUrl: null,
  linkButton: false,
  buttonUrl: null,
  buttonLabel: null,
  background: null,
  border: null,
  slice: null,
  imageAlt: '',
  id: '',
  gridGap: '24px',
  fontFamily: 'Lato',
  textSideProps: {},
  imageSideProps: {},
  containerProps: {},
};

export default MktTwoColumnSideImage;
