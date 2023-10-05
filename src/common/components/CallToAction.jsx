import React from 'react';
import {
  Box, Heading, Button, Image,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';

function CallToAction({
  background, imageSrc, href, styleContainer, isExternalLink, title, text,
  buttonText, width, onClick, margin, buttonsData, buttonStyle, fontSizeOfTitle,
  isLoading,
}) {
  return (
    <Box
      style={styleContainer}
      justifyContent="space-between"
      width={width}
      display="flex"
      bg={background}
      margin={margin}
      borderRadius="17px"
      paddingY="21px"
      paddingX="25px"
      flexDirection={{ base: 'column', lg: 'row' }}
      gridGap="18px"
    >
      {imageSrc && (
      <Box
        borderRadius="50px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minWidth="62px"
        width="62px"
        height="62px"
        background="white"
      >
        <Image src={imageSrc} alt="call to action img" width="40px" height="40px" />
      </Box>
      )}
      <Box
        display="flex"
        gridGap={{ base: '14px', md: buttonsData.length > 1 ? '14px' : '4vh' }}
        flexDirection={{ base: 'column', md: buttonsData.length > 1 ? 'column' : 'row' }}
      >
        <Box maxWidth="530px">
          {title && (
          <Heading as="h5" fontSize={fontSizeOfTitle} color="white" margin={0} marginBottom="11px">
            {title}
          </Heading>
          )}
          {text && (
          <Text
            style={{
              padding: buttonsData.length > 1 ? '0 4vh 0 0' : '0',
              margin: 0,
            }}
            color="white"
            size="l"
          >
            {text}
          </Text>
          )}
        </Box>
        <Box
          padding={{ base: '0 0 0 0', lg: '0' }}
          width={buttonsData.length > 1 ? '100%' : 'auto'}
          alignSelf="center"
          gridGap="14px"
          display={{ base: 'grid', md: 'flex' }}
          gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(10rem, 1fr))', md: '' }}
        >
          {buttonText && (
          <Button isLoading={isLoading} whiteSpace="wrap" as="a" style={buttonStyle} href={href} target={isExternalLink ? '_blank' : '_self'} padding="0.5rem 1rem" height="auto" marginY="auto" textTransform="uppercase" borderColor="white" color="white" variant="outline" onClick={onClick}>
            {buttonText}
          </Button>
          )}

          {buttonsData && buttonsData.map((element) => (
            <Button
              style={buttonStyle}
              key={element.text}
              as="a"
              href={element.href}
              isLoading={isLoading}
              target={element.isExternalLink ? '_blank' : '_self'}
              onClick={onClick}
              marginY="auto"
              textTransform="uppercase"
              borderColor="white"
              color="white"
              withoutBg
              variant="outline"
            >
              {element.text}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

CallToAction.propTypes = {
  styleContainer: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  buttonStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  title: PropTypes.string,
  text: PropTypes.string,
  imageSrc: PropTypes.string,
  buttonText: PropTypes.string,
  background: PropTypes.string,
  href: PropTypes.string,
  isExternalLink: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  margin: PropTypes.string,
  onClick: PropTypes.func,
  buttonsData: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  fontSizeOfTitle: PropTypes.string,
  isLoading: PropTypes.bool,
};

CallToAction.defaultProps = {
  styleContainer: {},
  buttonStyle: {},
  title: '',
  text: '',
  imageSrc: '',
  buttonText: '',
  href: '#tasks_remain',
  isExternalLink: false,
  background: 'blue',
  width: '100%',
  margin: '0 auto',
  onClick: () => {},
  buttonsData: [],
  fontSizeOfTitle: 'var(--heading-xsm)',
  isLoading: false,
};

export default CallToAction;
