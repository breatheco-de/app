import React from 'react';
import {
  Box, Heading, Button as ChakraButton, Image,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import Icon from './Icon';
import Button from './Button';

function CallToAction({
  background, imageSrc, icon, href, styleContainer, isExternalLink, title, text,
  buttonText, onClick, margin, buttonsData, buttonStyle, fontSizeOfTitle,
  isLoading, reverseButtons, buttonsContainerStyles, iconContainerStyles, titleStyles,
}) {
  return (
    <Box
      style={styleContainer}
      width="auto"
      display="flex"
      bg={background}
      margin={margin}
      borderRadius="17px"
      paddingY="21px"
      paddingX="25px"
      flexDirection={{ base: 'column', lg: 'row' }}
      gridGap="18px"
    >
      {(imageSrc || icon) && (
      <Box
        borderRadius="50px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minWidth="62px"
        width="62px"
        height="62px"
        background="white"
        {...iconContainerStyles}
      >
        {icon ? (
          <Icon icon={icon} width="40px" height="40px" />
        ) : (
          <Image src={imageSrc} alt="call to action img" width="40px" height="40px" />
        )}
      </Box>
      )}
      <Box
        display="flex"
        gridGap={{ base: '14px', md: buttonsData.length > 1 ? '14px' : '4vh' }}
        flexDirection={{ base: 'column', md: buttonsData.length > 1 ? 'column' : 'row' }}
        width="100%"
        justifyContent="space-between"
      >
        <Box>
          {title && (
          <Heading as="h5" fontSize={fontSizeOfTitle} color="white" margin={0} marginBottom="11px" {...titleStyles}>
            {title}
          </Heading>
          )}
          {text && (
          <Text
            style={{
              margin: 0,
            }}
            color="white"
            size="l"
            dangerouslySetInnerHTML={{ __html: text }}
          />
          )}
        </Box>
        <Box
          padding={{ base: '0 0 0 0', lg: '0' }}
          alignSelf="center"
          gridGap="14px"
          display={{ base: 'grid', md: 'flex' }}
          // justifyContent="space-between"
          // justifyContent="center"
          gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(10rem, 1fr))', md: '' }}
          flexDirection={reverseButtons ? 'row-reverse' : 'row'}
          justifyContent={reverseButtons ? 'flex-end' : 'flex-start'}
          {...buttonsContainerStyles}
        >
          {buttonText && !buttonsData?.length > 0 && (
            <Button width="max-content" isLoading={isLoading} whiteSpace="wrap" as="a" border="1px solid" href={href} target={isExternalLink ? '_blank' : '_self'} padding="0.5rem 1rem" height="auto" marginY="auto" textTransform="uppercase" borderColor="white" variant="primary" onClick={onClick}>
              {buttonText}
            </Button>
          )}
          {buttonsData && buttonsData.map((element) => {
            const isDropdown = element?.type === 'dropdown';
            const isButton = element?.type === 'button';

            if (isButton) {
              return (
                <ChakraButton
                  style={buttonStyle}
                  isLoading={isLoading}
                  target={element.isExternalLink ? '_blank' : '_self'}
                  onClick={element.onClick}
                  marginY="auto"
                  textTransform="uppercase"
                  borderColor="white"
                  color="white"
                  withoutBg
                  variant="outline"
                  width="max-content"
                >
                  {element.text}
                </ChakraButton>
              );
            }

            if (isDropdown) {
              return (
                <Popover>
                  <PopoverTrigger>
                    <ChakraButton width="max-content" variant="default" textTransform="uppercase" background="blue.400">{element?.text}</ChakraButton>
                  </PopoverTrigger>
                  <PopoverContent width="min-content">
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>{element?.title}</PopoverHeader>
                    <PopoverBody display="flex" gridGap="1rem" color="currentColor" flexDirection="column">
                      <Text
                        size="14px"
                        dangerouslySetInnerHTML={{ __html: element?.description }}
                        style={{ margin: 0 }}
                      />
                      {element?.links?.length > 0 && element.links.map((link) => (
                        <ChakraButton
                          key={link.text}
                          as="a"
                          display="flex"
                          href={link.link}
                          isLoading={isLoading}
                          target={link.isExternalLink ? '_blank' : '_self'}
                          marginY="auto"
                          margin="0"
                          textTransform="uppercase"
                          width="100%"
                          flexDirection="row"
                          gridGap="10px"
                          fontSize="12px"
                          alignItems="center"
                          justifyContent="flex-start"
                          style={{
                            color: 'currentColor',
                          }}
                        >
                          {link.title}
                          <Icon color="currentColor" icon="longArrowRight" />
                        </ChakraButton>
                      ))}
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              );
            }

            return (
              <ChakraButton
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
              </ChakraButton>
            );
          })}
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
  margin: PropTypes.string,
  onClick: PropTypes.func,
  buttonsData: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  fontSizeOfTitle: PropTypes.string,
  isLoading: PropTypes.bool,
  icon: PropTypes.string,
  reverseButtons: PropTypes.bool,
  buttonsContainerStyles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  iconContainerStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  titleStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
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
  margin: '0 auto',
  onClick: () => {},
  buttonsData: [],
  fontSizeOfTitle: 'var(--heading-xsm)',
  isLoading: false,
  icon: '',
  reverseButtons: false,
  buttonsContainerStyles: {},
  iconContainerStyles: {},
  titleStyles: {},
};

export default CallToAction;
