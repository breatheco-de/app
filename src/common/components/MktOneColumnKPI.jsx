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
  title,
  subTitle,
  description,
  paddingMd,
  buttonUrl,
  buttonLabel,
  linkButton,
  kpiList,
  slice,
  ...rest
}) {
  const { fontColor2, hexColor } = useStyle();

  return (
    <Box background={slice?.primary?.background} {...rest}>
      <GridContainer
        id={id}
        gridTemplateColumns="repeat(10, 1fr)"
        gridColumn="2 / span 8"
        background={slice?.primary?.background}
      >
        <Box display="grid" padding="50px" textAlign="center" justifyItems="center" gridGap="14px" style={{ direction: 'initial' }} gridColumn="2 / span 8" px="10px" borderRadius="3px">
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
          <Heading as="h2" size="m" fontSize="26px" color={slice?.primary?.font_color}>
            {title}
          </Heading>
          {slice?.primary?.description ? (
            <PrismicTextComponent
              color={slice?.primary?.font_color}
              field={slice?.primary?.description}
              margin={{ base: '0 20px', md: '0 6% 0 6%', lg: '0 20% 0 20%' }}
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
              color={linkButton ? hexColor.blueDefault : '#FFF'}
              textDecoration={linkButton && 'underline'}
              href={buttonUrl}
              textAlign="center"
              display="inline-block"
              margin="1rem 0 0 0"
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
  title: PropTypes.string,
  subTitle: PropTypes.string,
  description: PropTypes.string,
  paddingMd: PropTypes.string,
  buttonUrl: PropTypes.string,
  buttonLabel: PropTypes.string,
  linkButton: PropTypes.bool,
  kpiList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  slice: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  id: PropTypes.string,
};

MktOneColumnKPI.defaultProps = {
  title: null,
  subTitle: null,
  description: null,
  paddingMd: null,
  buttonUrl: null,
  buttonLabel: null,
  linkButton: false,
  kpiList: [],
  slice: null,
  id: '',
};

export default MktOneColumnKPI;
