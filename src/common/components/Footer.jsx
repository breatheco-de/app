import React, { useState } from 'react';
import {
  Box,
  Text,
  Container,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  Heading,
  Link,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import NextChakraLink from './NextChakraLink';
import Icon from './Icon';
import AlertMessage from './AlertMessage';
import useStyle from '../hooks/useStyle';
import bc from '../services/breathecode';

function Footer({ pageProps }) {
  const { t } = useTranslation('footer');
  const { hexColor } = useStyle();
  const [email, setEmail] = useState('');
  const [formStatus, setFormStatus] = useState('');

  const iconogram = t('iconogram', {}, { returnObjects: true });

  const hideDivider = pageProps?.hideDivider === true;
  if (pageProps?.previewMode) return null;

  return (
    <Container background="none" as="footer" maxW="none" padding="20px" position="absolute" top="100%">
      {!hideDivider && <Divider borderBottomWidth="2px" m="3rem 0 0 0" />}

      {!pageProps?.existsWhiteLabel && (
        <>
          <Flex
            direction={['column', 'column', 'row', 'row']}
            justifyContent="space-between"
            my="1rem"
            alignItems="center"
          >
            <Box
              key="icons"
              display="flex"
              flexDir="column"
              justifyContent="center"
              width={['100%', '50%', '25%', '25%']}
              marginBottom={['20px', '20px', '0', '0']}
            >
              <Flex justifyContent="space-around">
                <Link key="github" href="https://github.com/breatheco-de" target="_blank" rel="noopener noreferrer">
                  <Icon icon="github" width="23px" height="23px" />
                </Link>
                <Link key="youtube" href="https://www.youtube.com/user/alesanchezr" target="_blank" rel="noopener noreferrer">
                  <Icon icon="youtube" width="23px" height="23px" color={hexColor.black} />
                </Link>
              </Flex>
            </Box>
            <Box
              marginBottom={['20px', '20px', '0', '0']}
              order={[-1, -1, 0, 0]}
              key="logo"
              width={['100%', '50%', '25%', '25%']}
            >
              <Icon style={{ margin: 'auto' }} icon="4GeeksIcon" width="150px" height="60px" />
            </Box>
            <Box
              key="searchbar"
              display="flex"
              flexDir="column"
              justifyContent="center"
              width={['100%', '50%', '25%', '25%']}
            >
              {formStatus === '' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    bc.marketing().lead({ email })
                      .then((success) => {
                        console.log(success);
                        if (success === undefined) setFormStatus('error');
                        else setFormStatus('success');
                      }).catch((err) => {
                        setFormStatus('error');
                        console.log(err);
                      });
                  }}
                >
                  <Text>{t('subscribe')}</Text>
                  <InputGroup
                    color={hexColor.black}
                  >
                    <Input
                      width="100%"
                      placeholder="Email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <InputRightElement
                      borderColor={hexColor.black}
                    >
                      <IconButton
                        aria-label="Submit form"
                        style={{
                          right: '1px',
                          height: '38px',
                          borderBottomLeftRadius: '0px',
                          borderTopLeftRadius: '0px',
                        }}
                        type="submit"
                        icon={<CheckIcon />}
                      />
                    </InputRightElement>

                  </InputGroup>

                </form>
              ) : (
                <AlertMessage
                  type={formStatus}
                  message={t(`newsletter.${formStatus}`)}
                />
              )}
            </Box>
          </Flex>
          <Divider borderBottomWidth="2px" />
          <Flex padding={['30px 10px', '30px 20px', '30px 0 30px 20px', '30px 40px']}>
            <Flex
              minWidth="60%"
              width={['100%', '100%', '60%', '60%']}
              marginRight={['0', '0', '3%', '3%']}
              justifyContent={['space-between', 'space-between', 'normal', 'normal']}
              wrap={['wrap', 'wrap', 'nowrap', 'nowrap']}
            >
              <Box
                textAlign={['center', 'center', 'left', 'left']}
                width={['47%', '40%', 'auto', 'auto']}
                marginRight={['0', '0', '5%', '5%']}
              >
                <Heading as="h3" textAlign={{ base: 'left', md: 'center' }} size="sm" marginBottom="15px">
                  {t('company.title')}
                </Heading>
                <Box as="ul" role="presentation" textAlign={{ base: 'left', md: 'center' }}>
                  {t('company.items', {}, { returnObjects: true }).map((item) => (
                    <Box as="li" key={`${item.label}-${item.href}`} pb="6px" role="presentation" display="flex">
                      <NextChakraLink href={item.href} fontSize="0.875rem">
                        {item.label.toUpperCase()}
                      </NextChakraLink>
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* ---- RESPONSIVE BOXES ---- */}
              <Box
                width={['47%', '40%', 'auto', 'auto']}
                marginBottom="30px"
                textAlign="center"
                display={[
                  'block', // 0-30em
                  'block', // 30em-48em
                  'none', // 48em-62em
                  'none', // 62em+
                ]}
              >
                <Heading as="h3" textAlign="left" size="sm" marginBottom="15px">
                  {t('learning.title')}
                </Heading>
                <Box as="ul" role="presentation" textAlign={{ base: 'left', md: 'center' }}>
                  {t('learning.items', {}, { returnObjects: true }).map((item) => (
                    <Box as="li" key={`${item.label}-${item.href}`} pb="6px" role="presentation" display="flex">
                      <NextChakraLink href={item.href} fontSize="0.875rem">
                        {item.label.toUpperCase()}
                      </NextChakraLink>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box
                textAlign="center"
                width={['47%', '40%', 'auto', 'auto']}
                display={[
                  'block', // 0-30em
                  'block', // 30em-48em
                  'none', // 48em-62em
                  'none', // 62em+
                ]}
              >
                <Heading as="h3" textAlign="left" size="sm" marginBottom="15px">
                  {t('community.title')}
                </Heading>
                <Box as="ul" role="presentation" textAlign={{ base: 'left', md: 'center' }}>
                  {t('community.items', {}, { returnObjects: true }).map((item) => (
                    <Box as="li" key={`${item.label}-${item.href}`} pb="6px" role="presentation" display="flex">
                      <NextChakraLink href={item.href} fontSize="0.875rem">
                        {item.label.toUpperCase()}
                      </NextChakraLink>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box
                textAlign="center"
                width={['47%', '40%', 'auto', 'auto']}
                display={[
                  'block', // 0-30em
                  'block', // 30em-48em
                  'none', // 48em-62em
                  'none', // 62em+
                ]}
              >
                <Heading as="h3" textAlign="left" size="sm" marginBottom="15px">
                  {t('social.title')}
                </Heading>
                <Box as="ul" role="presentation" textAlign={{ base: 'left', md: 'center' }}>
                  {Array.isArray(iconogram) && iconogram.map((item) => (
                    <Box key={`${item.title}-${item.href}`} as="li" pb="6px" overflow="auto" role="presentation" display="flex">
                      <NextChakraLink href={item.href} fontSize="0.875rem">
                        {item.title.toUpperCase()}
                      </NextChakraLink>
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* ---- RESPONSIVE BOXES ---- */}
              <Container
                marginRight="5%"
                paddingRight="4%"
                maxW="none"
                paddingLeft="0"
                borderRight="2px"
                borderColor="#e2e8f0"
                flexShrink="0.7"
                display={[
                  'none', // 0-30em
                  'none', // 30em-48em
                  'block', // 48em-62em
                  'block', // 62em+
                ]}
              >
                <Box width="100%" paddingLeft="15%" marginBottom="20px" borderLeft="2px" borderColor="#e2e8f0">
                  <Heading as="h3" size="sm" marginBottom="15px">
                    {t('learning.title')}
                  </Heading>
                  <Box as="ul" role="presentation" textAlign={{ base: 'left', md: 'center' }}>
                    {t('learning.items', {}, { returnObjects: true }).map((item) => (
                      <Box key={`${item.label}-${item.href}`} as="li" pb="6px" role="presentation" display="flex">
                        <NextChakraLink href={item.href} fontSize="0.875rem">
                          {item.label.toUpperCase()}
                        </NextChakraLink>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box width="100%" paddingLeft="15%" borderLeft="2px" borderColor="#e2e8f0">
                  <Heading as="h3" size="sm" marginBottom="15px">
                    {t('community.title')}
                  </Heading>
                  <Box as="ul" role="presentation" textAlign={{ base: 'left', md: 'center' }}>
                    {t('community.items', {}, { returnObjects: true }).map((item) => (
                      <Box key={`${item.label}-${item.href}`} as="li" pb="6px" role="presentation" display="flex">
                        <NextChakraLink href={item.href} fontSize="0.875rem">
                          {item.label.toUpperCase()}
                        </NextChakraLink>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Container>
              <Box
                display={[
                  'none', // 0-30em
                  'none', // 30em-48em
                  'block', // 48em-62em
                  'block', // 62em+
                ]}
              >
                <Heading as="h3" size="sm" marginBottom="15px">
                  {t('social.title')}
                </Heading>
                <Text fontSize="sm">{t('social.text')}</Text>
              </Box>
            </Flex>
            <Flex
              key="iconogram"
              width="40%"
              gridRowGap="20px"
              wrap="wrap"
              justifyContent="space-between"
              display={[
                'none', // 0-30em
                'none', // 30em-48em
                'flex', // 48em-62em
                'flex', // 62em+
              ]}
            >

              {Array.isArray(iconogram) && iconogram.map((item) => (
                <Box key={`${item.title}-${item.href}`} width="48%" marginRight="2px" marginBottom="5px">
                  <NextChakraLink href={item.href} display="flex" alignItems="center" marginBottom="15px">
                    <Icon color={hexColor.black} icon={item.icon} style={{ display: 'inline', marginRight: '10px' }} width="40px" height="40px" />
                    <Heading as="h3" fontSize="12px">
                      {item.title.toUpperCase()}
                    </Heading>
                  </NextChakraLink>
                  <Text fontSize="sm" lineHeight="22px">{item.text}</Text>
                </Box>
              ))}
            </Flex>
          </Flex>
          <Divider borderBottomWidth="2px" />
        </>
      )}
      <Flex
        key="copyright"
        padding="20px 20px 0 20px"
        justifyContent={['center', 'center', 'space-between', 'space-between']}
        wrap={['wrap', 'wrap', 'nowrap', 'nowrap']}
        // alignItems="center"
        textAlign="center"
      >
        <Text marginBottom={['20px', '20px', '0', '0']} fontSize="sm">{t('copyright')}</Text>
        <Flex
          wrap={['wrap', 'wrap', 'nowrap', 'nowrap']}
          justifyContent="center"
          width={['100%', '100%', '35%', '40%']}
        // alignItems="center"
        >
          <NextChakraLink href={t('terms.href')}>
            <Text fontSize="sm">{t('terms.label')}</Text>
          </NextChakraLink>
        </Flex>
      </Flex>
    </Container>
  );
}

Footer.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};
Footer.defaultProps = {
  pageProps: {},
};

export default Footer;
