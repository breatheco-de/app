/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, useColorModeValue, Text, Button,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { PrismicRichText } from '@prismicio/react';
import Image from 'next/image';
import { MotionBox } from '../../common/components/Animated';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import GridContainer from '../../common/components/GridContainer';

const IntroductionSection = ({
  data, slice, ...rest
}) => {
  const router = useRouter();
  const colors = useColorModeValue('#000', '#fff');

  return (
    <GridContainer
      gridTemplateColumns="repeat(10, 1fr)"
      gridColumn="2 / span 8"
      px="10px"
      id={slice?.primary?.id_key || ''}
      {...rest}
    >
      <Box display={{ base: 'block', md: 'grid' }} gridColumn="2 / span 5">
        <Heading as="span" size="xl" fontWeight="700">
          {slice?.primary?.title ? (
            <>
              <PrismicRichText
                field={slice?.primary?.title}
                components={{
                  heading1: ({ children }) => (
                    <Box as="h1" fontSize="48px" fontWeight="700" display="initial">
                      {children}
                    </Box>
                  ),
                }}
              />
              {slice?.primary?.highlight && (
                <PrismicRichText
                  field={slice?.primary?.highlight}
                  components={{
                    paragraph: ({ children }) => (
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
          <Text fontSize="18px" fontWeight={700} pt="16px">
            <PrismicRichText field={slice?.primary?.description} />
          </Text>
        ) : data?.description && (
          <Text fontSize="18px" fontWeight={700} pt="16px">
            {data?.description}
          </Text>
        )}

        {slice?.primary?.buttontext ? (
          <Button variant="default" width="fit-content" fontSize="13px" m="25px 0" letterSpacing="0.05em" textTransform="uppercase" onClick={() => router?.push('#pricing')}>
            <PrismicRichText field={slice?.primary?.buttontext} />
          </Button>
        ) : (
          <>
            {data?.callToAction?.title && (
              <Button variant="default" fontSize="13px" m="25px 0" letterSpacing="0.05em" textTransform="uppercase" onClick={() => router.push(data?.callToAction.href)}>
                {data?.callToAction.title}
              </Button>
            )}
          </>
        )}
        <Box as="ul" display="flex" flexDirection="column" gridGap="4px" width="fit-content">
          {slice?.primary?.bullets?.length > 0
            ? (
              <PrismicRichText
                field={slice?.primary?.bullets}
                components={{
                  listItem: ({ children }, index) => (
                    <MotionBox whileHover={{ scale: 1.05 }} as="li" key={index} display="flex" fontSize="14px" gridGap="10px" alignItems="center">
                      <Icon icon="book" width="14px" height="14px" />
                      {children}
                    </MotionBox>
                  ),
                }}
              />
            )
            : data?.bullets.map((l) => (
              <MotionBox whileHover={{ scale: 1.05 }} as="li" key={l.text} display="flex" fontSize="14px" gridGap="10px" alignItems="center">
                <Icon icon={l.icon} width="14px" height="14px" />
                {l.text}
              </MotionBox>
            ))}
        </Box>
      </Box>

      <Box display={{ base: 'block', md: 'grid' }} gridColumn="7 / span 3" alignContent="center">
        {slice?.primary?.image?.url ? (
          <Box display="flex" height="fit-content" justifyContent="center">
            <Image
              src={slice.primary.image.url}
              alt={slice.primary.image.alt}
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
};

IntroductionSection.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  slice: PropTypes.objectOf(PropTypes.any),
};

IntroductionSection.defaultProps = {
  slice: {},
  data: {},
};

export default IntroductionSection;
