/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, Container, Divider,
} from '@chakra-ui/react';
import { PrismicRichText } from '@prismicio/react';
import Heading from './Heading';
import Text from './Text';
import Link from './NextChakraLink';
import useStyle from '../hooks/useStyle';

const MktOneColumn = ({
  id,
  title,
  subTitle,
  description,
  buttonUrl,
  buttonLabel,
  linkButton,
  kpiList,
  slice,
  ...rest
}) => {
  const { fontColor, fontColor2, hexColor, backgroundColor } = useStyle();

  // eslint-disable-next-line react/prop-types
  const MktKPI = ({ kpiTitle, kpiDescription, color }) => (
    <Box
      width="200px"
      background={backgroundColor}
      borderRadius="12px"
      padding="15px"
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

  return (
    <Box id={id} padding="50px" textAlign="center" background={slice?.primary?.background} {...rest}>
      <Container maxW="container.xl" px="10px">
        <Heading marginBottom="15px" as="h4" fontSize="14px" color={hexColor.blueDefault}>
          {subTitle}
        </Heading>
        {kpiList.length > 0 && (
          <Box gridGap="20px" flexWrap="wrap" marginBottom="15px" display="flex" justifyContent="center">
            {kpiList.map((kpi) => (
              <MktKPI kpiTitle={kpi.title} kpiDescription={kpi.description} color={kpi.color} />
            ))}
          </Box>
        )}
        <Heading as="h2" size="m">
          {title}
        </Heading>
        {slice.primary.description ? (
          <PrismicRichText
            field={slice?.primary?.description}
            components={{
              paragraph: ({ children }) => (
                <Text
                  fontSize="sm"
                  lineHeight="14px"
                  margin="15px 0"
                  color={fontColor2}
                >
                  {children}
                </Text>
              ),
            }}
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
          >
            {buttonLabel}
          </Link>
        )}
      </Container>
    </Box>
  );
};

MktOneColumn.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
  description: PropTypes.string,
  buttonUrl: PropTypes.string,
  buttonLabel: PropTypes.string,
  linkButton: PropTypes.bool,
  kpiList: PropTypes.arrayOf(PropTypes.any),
  slice: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  id: PropTypes.string,
};

MktOneColumn.defaultProps = {
  title: null,
  subTitle: null,
  description: null,
  buttonUrl: null,
  buttonLabel: null,
  linkButton: false,
  kpiList: [],
  slice: null,
  id: '',
};

export default MktOneColumn;
