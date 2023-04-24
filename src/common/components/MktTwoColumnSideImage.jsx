import PropTypes from 'prop-types';
import {
  Box, Img,
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

const MktTwoColumnSideImage = ({
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
}) => {
  const { fontColor2, hexColor, backgroundColor } = useStyle();
  const flexDirection = {
    right: 'rtl',
    left: 'ltr',
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
        color: 'blue.default',
        background: 'white',
      };
    }
    return {
      color: '#FFF',
      background: 'blue.default',
    };
  };
  const buttonColors = getButtonColors();

  const getFontStyles = () => {
    if (informationSize === SIZES.SMALL) {
      return {
        titleSize: '26px',
        subtitleSize: '14px',
        descriptionSize: '12px',
      };
    }
    if (informationSize === SIZES.MEDIUM) {
      return {
        titleSize: '26px',
        subtitleSize: '21px',
        descriptionSize: '18px',
      };
    }
    if (informationSize === SIZES.LARGE) {
      return {
        titleSize: '44px',
        subtitleSize: '21px',
        descriptionSize: '14px',
      };
    }
    return {
      titleSize: '26px',
      subtitleSize: '14px',
      descriptionSize: '12px',
    };
  };
  const fontStyle = getFontStyles();

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
        padding={{ base: '20px 10px', md: '0' }}
        gridGap={gridGap}
        marginTop="20px"
        style={{
          direction: flexDirection[imagePosition],
        }}
      >
        <Box display={{ base: 'block', md: 'grid' }} style={{ direction: 'initial' }} gridColumn="2 / span 4">
          <Img
            boxSize="100%"
            margin="0 auto"
            objectFit="contain"
            src={imageUrl}
            alt={imageAlt}
            title={imageAlt}
            borderRadius="3px"
            // height={imageProps?.height}
            width={imageProps?.width}
          />
        </Box>
        <Box display={{ base: 'block', md: 'grid' }} style={{ direction: 'initial' }} gridColumn="6 / span 4" background={textBackgroundColor}>
          {subTitle && (
            <Heading marginBottom="15px" as="h4" fontSize={fontStyle.subtitleSize} color={subtitleColor || hexColor.blueDefault}>
              {subTitle}
            </Heading>
          )}
          <Heading as="h2" size={fontStyle.titleSize} color={titleColor}>
            {title}
          </Heading>
          {slice.primary.description ? (
            <PrismicTextComponent
              field={slice?.primary?.description}
            />
          ) : (
            <Text
              fontSize={fontStyle.descriptionSize}
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
              color={linkButton ? hexColor.blueDefault : buttonColors.color}
              background={buttonColors.background}
              textDecoration={linkButton && 'underline'}
              href={buttonUrl}
              textAlign="center"
              display="inline-block"
              width="fit-content"
            >
              {buttonLabel}
            </Link>
          )}
        </Box>
      </GridContainer>
    </Box>
  );
};

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
