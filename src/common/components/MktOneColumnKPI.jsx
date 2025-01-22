/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, Divider,
} from '@chakra-ui/react';
import Heading from './Heading';
import Text from './Text';
import Link from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import GridContainer from './GridContainer';
import PrismicTextComponent from './PrismicTextComponent';

function MktKPI({ kpiTitle, kpiDescription, color }) {
  const { fontColor, hexColor, backgroundColor } = useStyle();
  return (
    <Box
      width="200px"
      background={backgroundColor}
      borderRadius="12px"
      px={{ base: '10px', md: '2rem' }}
      textAlign="center"
    >
      <Heading size="m" color={color || hexColor.blueDefault}>
        {kpiTitle}
      </Heading>
      <Divider
        opacity="1"
        margin="15px auto"
        width="32px"
        border="3px solid"
        borderColor={color || hexColor.blueDefault}
      />
      <Text
        fontSize="sm"
        lineHeight="14px"
        color={fontColor}
      >
        {kpiDescription}
      </Text>
    </Box>
  );
}

function MktOneColumnKPI({
  id,
  fontFamily,
  borderRadius,
  title,
  subTitle,
  description,
  paddingMd,
  buttonUrl,
  buttonLabel,
  buttonBackgroundColor,
  buttonFontColor,
  buttonFontSize,
  linkButton,
  justifyItems,
  kpiList,
  slice,
  titleFontSize,
  descriptionFontSize,
  descriptionTextAlign,
  descriptionLineHeight,
  marginBottom,
  marginTop,
  maxWidth,
  ...rest
}) {
  const { fontColor2, hexColor } = useStyle();
  return (
    <Box borderRadius={borderRadius} {...rest}>
      {/* maxWidth={maxWidth} margin={`${marginTop} auto ${marginBottom} auto`} */}
      <GridContainer
        id={id}
        gridTemplateColumns="repeat(10, 1fr)"
        gridColumn="2 / span 8"
        background={slice?.primary?.background}
        borderRadius={borderRadius}
        maxWidth={maxWidth}
      >
        <Box display="grid" padding="50px" fontFamily={fontFamily} textAlign="center" justifyItems={justifyItems} gridGap="14px" style={{ direction: 'initial' }} gridColumn="2 / span 8" px="10px">
          {subTitle && (
            <Heading marginBottom="15px" as="h4" fontSize="14px" color={hexColor.blueDefault}>
              {subTitle}
            </Heading>
          )}
          {kpiList.length > 0 && (
            <Box gridGap="20px" flexWrap="wrap" marginBottom="15px" display="flex" justifyContent="center">
              {kpiList.map((kpi) => (
                <MktKPI kpiTitle={kpi.title} kpiDescription={kpi.description} color={kpi.color} />
              ))}
            </Box>
          )}
          <Heading as="h2" size="m" style={{ fontSize: titleFontSize }} color={slice?.primary?.font_color || null} margin="0 0 2rem 0">
            {title}
          </Heading>
          {slice?.primary?.description ? (
            <PrismicTextComponent
              color={slice?.primary?.font_color}
              field={slice?.primary?.description}
              fontSize={descriptionFontSize}
              textAlign={descriptionTextAlign}
              // margin={{ base: '0 20px', md: '0 6% 0 6%', lg: '0 20% 0 20%' }}
            />
          ) : (
            <Text
              fontSize="sm"
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
              color={linkButton ? '#02A9EA' : buttonFontColor}
              textDecoration={linkButton && 'underline'}
              href={buttonUrl}
              // justifyItems="left"
              // display="inline-block"
              margin="2rem 0 0 0"
              backgroundColor={buttonBackgroundColor}
              fontSize={buttonFontSize}
              _hover={{
                backgroundColor: 'white',
                textDecoration: 'none',
                color: '#0084FF',
              }}
            >
              {buttonLabel}
            </Link>
          )}
        </Box>
      </GridContainer>
    </Box>
  );
}

MktOneColumnKPI.propTypes = {
  fontFamily: PropTypes.string,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  description: PropTypes.string,
  descriptionLineHeight: PropTypes.string,
  paddingMd: PropTypes.string,
  buttonUrl: PropTypes.string,
  buttonLabel: PropTypes.string,
  buttonBackgroundColor: PropTypes.string,
  buttonFontColor: PropTypes.string,
  buttonFontSize: PropTypes.string,
  linkButton: PropTypes.bool,
  justifyItems: PropTypes.string,
  kpiList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  slice: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  id: PropTypes.string,
  titleFontSize: PropTypes.string,
  descriptionFontSize: PropTypes.string,
  marginBottom: PropTypes.string,
  marginTop: PropTypes.string,
  maxWidth: PropTypes.string,
};

MktOneColumnKPI.defaultProps = {
  fontFamily: 'Lato',
  title: null,
  subTitle: null,
  description: null,
  descriptionLineHeight: null,
  paddingMd: null,
  buttonUrl: null,
  buttonLabel: null,
  buttonBackgroundColor: null,
  buttonFontColor: null,
  buttonFontSize: null,
  linkButton: false,
  justifyItems: null,
  kpiList: [],
  slice: null,
  id: '',
  titleFontSize: null,
  descriptionFontSize: null,
  marginBottom: '',
  marginTop: '',
  maxWidth: '',
};

export default MktOneColumnKPI;
