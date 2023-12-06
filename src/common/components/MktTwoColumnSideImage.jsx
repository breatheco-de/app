import PropTypes from 'prop-types';
import {
  Box, Flex, Img,
} from '@chakra-ui/react';
import Heading from './Heading';
import Text from './Text';
import Link from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import GridContainer from './GridContainer';
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
  ...rest
}) {
  const { fontColor2, hexColor, backgroundColor } = useStyle();
  const flexDirection = {
    right: 'ltr',
    left: 'rtl',
  };

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
        descriptionSize: '12px',
      };
    }
    if (informationSize === SIZES.MEDIUM) {
      return {
        titleSize: '26px',
        titleLineHeight: '1.2',
        subtitleSize: '21px',
        descriptionSize: '18px',
        padding: '24px 0px',
      };
    }
    if (informationSize === SIZES.LARGE) {
      return {
        titleSize: '44px',
        titleLineHeight: '54px',
        subtitleSize: '21px',
        descriptionSize: '14px',
        padding: '34px',
      };
    }
    return {
      titleSize: '26px',
      titleLineHeight: '1.2',
      subtitleSize: '14px',
      descriptionSize: '12px',
      padding: '24px 0px',
    };
  };
  const prismicStyles = prisimicStyles();

  return (
    <Box
      id={id}
      background={background || backgroundColor}
      {...rest}
    >
      <GridContainer
        gridTemplateColumns="repeat(10, 1fr)"
        maxWidth="1280px"
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
      >
        {/* 2 / span 4 */}
        <Box display={{ base: 'block', md: 'grid' }} height="100%" style={{ direction: 'initial' }} gridColumn="2 / span 4" background={textBackgroundColor} padding={prismicStyles.padding} borderRadius={{ base: '0px', md: '11px' }}>
          <Flex flexDirection="column" gridGap="16px" alignSelf="center">
            <Heading as="h2" size={prismicStyles.titleSize} lineHeight={prismicStyles.titleLineHeight} color={titleColor}>
              {title}
            </Heading>
            {subTitle && (
              <Heading as="h4" fontSize={prismicStyles.subtitleSize} color={subtitleColor || hexColor.blueDefault}>
                {subTitle}
              </Heading>
            )}
            {slice.primary.description ? (
              <PrismicTextComponent
                field={slice?.primary?.description}
                color={slice?.primary?.description_color}
              />
            ) : (
              <Text
                fontSize={prismicStyles.descriptionSize}
                lineHeight="14px"
                margin="15px 0"
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
              >
                {buttonLabel}
              </Link>
            )}
          </Flex>
        </Box>
        <Box display={{ base: 'block', md: 'grid' }} style={{ direction: 'initial' }} gridColumn="6 / span 4">
          <Img
            boxSize="100%"
            margin="0 auto"
            objectFit="contain"
            src={imageUrl}
            alt={imageAlt}
            title={imageAlt}
            borderRadius="3px"
            width={imageProps?.width}
          />
        </Box>
      </GridContainer>
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
};

export default MktTwoColumnSideImage;
