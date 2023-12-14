/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, useColorModeValue, Text,
} from '@chakra-ui/react';
import { PrismicRichText } from '@prismicio/react';
import Image from 'next/image';
import { MotionBox } from '../../common/components/Animated';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import GridContainer from '../../common/components/GridContainer';
import Button from '../../common/components/Button';
import PrismicTextComponent from '../../common/components/PrismicTextComponent';

function IntroductionSection({
  data, slice, fitContent, ...rest
}) {
  const colors = useColorModeValue('#000', '#fff');

  const isLeftBigger = slice?.primary?.two_column_size === 'Left is bigger';
  const isRightBigger = slice?.primary?.two_column_size === 'Right is bigger';
  const bothAreEqual = slice?.primary?.two_column_size === 'Both are equal';

  const getHighlightStyle = () => {
    if (slice?.primary?.highlight_style === 'Colored') {
      return ({
        color: 'blue.default',
        borderBottom: '0px',
      });
    }
    if (slice?.primary?.highlight_style === 'Underlined') {
      return ({
        transition: { duration: 3 },
        animate: {
          color: [colors, '#0097CD', colors, '#0097CD', colors, colors],
        },
      });
    }
    return ({
      color: 'blue.default',
      borderBottom: '4px solid #0097CD',
    });
  };

  const getLeftColumnSize = () => {
    if (isLeftBigger) return '2 / span 5';
    if (isRightBigger) return '2 / span 3';
    if (bothAreEqual) return '2 / span 4';
    return '2 / span 5';
  };

  const getRightColumnSize = () => {
    if (isLeftBigger) return '7 / span 3';
    if (isRightBigger) return '5 / span 5';
    if (bothAreEqual) return '6 / span 4';
    return '7 / span 3';
  };

  return (
    <GridContainer
      gridTemplateColumns="repeat(10, 1fr)"
      px="10px"
      id={slice?.primary?.id_key || ''}
      {...rest}
    >
      <Box display={{ base: 'block', md: 'grid' }} gridColumn={fitContent ? '1 / span 5' : getLeftColumnSize()}>
        <Heading as="span" size="xl" fontWeight="700">
          {slice?.primary?.title ? (
            <>
              <PrismicTextComponent
                field={slice?.primary?.title}
                display="initial"
                size="48px"
                fontWeight={700}
                lineHeight="inherit"
              />
              {slice?.primary?.highlight && (
                <PrismicRichText
                  field={slice?.primary?.highlight}
                  components={{
                    paragraph: ({ children }) => (
                      <MotionBox
                        as="strong"
                        className="highlighted box"
                        {...getHighlightStyle()}
                        margin="0 0 0 10px"
                        display={{ base: 'none', sm: 'initial' }}
                      >
                        {children}
                      </MotionBox>
                    ),
                  }}
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
        {slice?.primary?.highlight.length > 0 ? (
          <Box as="strong" className="highlighted" fontSize="35px" display={{ base: 'initial', sm: 'none' }}>
            <PrismicRichText field={slice?.primary?.highlight} />
          </Box>
        ) : data?.highlight && (
          <Box as="strong" className="highlighted" fontSize="35px" display={{ base: 'initial', sm: 'none' }}>
            {data?.highlight}
          </Box>
        )}

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
          <Box as="ul" display="flex" flexDirection="column" gridGap="4px" width="fit-content">
            {slice?.primary?.bullets?.length > 0
              ? (
                <PrismicRichText
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
            variant="default"
            width="fit-content"
            minWidth="200px"
            textAlign="center"
            height="52px"
            to={slice?.primary?.button_link?.url || slice?.primary?.button_link || '#pricing'}
            fontSize="18px"
            m="25px 0"
            letterSpacing="0.05em"
            textTransform="uppercase"
          >
            <PrismicRichText field={slice?.primary?.buttontext} />
          </Button>
        ) : (
          <>
            {data?.callToAction?.title && (
              <Button variant="default" width="fit-content" minWidth="200px" height="52px" fontSize="18px" m="25px 0" letterSpacing="0.05em" textTransform="uppercase" to={data?.callToAction.href}>
                {data?.callToAction.title}
              </Button>
            )}
          </>
        )}
      </Box>

      {/* ----------------------- Image ----------------------- */}
      <Box display={{ base: 'block', md: 'grid' }} gridColumn={fitContent ? '7 / span 4' : getRightColumnSize()} alignContent="center">
        {slice?.primary?.image?.url ? (
          <Box display="flex" height="fit-content" justifyContent="center">
            <Image
              src={slice.primary.image.url}
              alt={slice.primary.image.alt || 'Introduction avatars'}
              width={slice.primary.image.dimensions?.width}
              height={slice.primary.image.dimensions?.height}
              style={{ borderRadius: '7px' }}
            />
          </Box>
        ) : (
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '400px',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src="/static/videos/landing-avatars.webm" type="video/webm" />
          </video>
        )}
      </Box>
    </GridContainer>
  );
}

IntroductionSection.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

IntroductionSection.defaultProps = {
  slice: {},
  data: {},
};

export default IntroductionSection;
