/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Img, Fade, IconButton,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import useTranslation from 'next-translate/useTranslation';
import Heading from './Heading';
import Text from './Text';
import Link from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import PrismicTextComponent from './PrismicTextComponent';

function Card({ card }) {
  const { t } = useTranslation('common');
  const { images, title, description, aricle_url } = card;
  const { fontColor, hexColor } = useStyle();
  const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setCurrentIndex((curr) => (curr + 1 < images.length ? curr + 1 : 0));
  //   }, 2000);

  //   return () => clearInterval(intervalId);
  // }, []);

  const formatedDescription = description.length > 39 ? `${description.substring(0, 40)}...` : description;

  const handlePrev = () => {
    setCurrentIndex((curr) => (curr - 1 < 0 ? images.length - 1 : curr - 1));
  };
  const handleNext = () => {
    setCurrentIndex((curr) => (curr + 1 < images.length ? curr + 1 : 0));
  };
  return (
    <Box
      width={{ sm: '230px', base: '100%' }}
      height={{ md: '270px', base: '320px' }}
      background={hexColor.backgroundColor}
      borderRadius="11px"
      border="1px solid"
      borderColor={hexColor.borderColor}
      // padding="16px"
      textAlign="center"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      overflow="hidden"
    >
      <Box width="100%" height="95px" marginBottom="16px" position="relative">
        <IconButton
          isRound
          position="absolute"
          top="50%"
          left="1"
          zIndex="10"
          variant="ghost"
          _hover={{ bg: '#DADADA' }}
          onClick={handlePrev}
          size="xs"
          background="#DADADA"
          icon={<ChevronLeftIcon w={4} h={4} color="black" />}
        />
        <IconButton
          isRound
          position="absolute"
          top="50%"
          right="1"
          zIndex="10"
          variant="ghost"
          _hover={{ bg: '#DADADA' }}
          onClick={handleNext}
          size="xs"
          background="#DADADA"
          icon={<ChevronRightIcon w={4} h={4} color="black" />}
        />
        {images.map((image, i) => (
          <Fade in={currentIndex === i}>
            <Img
              // display={currentIndex === i ? 'block' : 'none'}
              key={image}
              src={image}
              width="100%"
              height={{ md: '120px', base: '140px' }}
              position="absolute"
            />
          </Fade>
        ))}
      </Box>
      <Box padding="0 16px">
        <Text size="md" fontWeight="700" lineHeight="16px" marginBottom="10px">
          {title}
        </Text>
        <Text
          fontSize="sm"
          lineHeight="16px"
          color={fontColor}
          marginBottom="16px"
        >
          {formatedDescription}
        </Text>
      </Box>
      <Box paddingBottom="16px">
        <Link color={hexColor.blueDefault} href={aricle_url || '#'} target="__blank" visibility={aricle_url ? 'visible' : 'hidden'}>
          {t('asset-button.article')}
          {'  '}
          →
        </Link>
      </Box>
    </Box>
  );
}

function MktTrustCards({
  id,
  title,
  description,
  slice,
  ...rest
}) {
  const { lang } = useTranslation('common');
  const { fontColor2 } = useStyle();
  const [cards, setCards] = useState([]);

  const fetchCards = async () => {
    try {
      const url = `https://github.com/breatheco-de/content/blob/master/src/content/prismic/trust-cards${lang === 'en' ? '' : `-${lang}`}.json`;
      const rawUrl = url.replace('https://github.com', 'https://raw.githubusercontent.com').replace('/blob', '');

      const resp = await fetch(rawUrl);
      const data = await resp.json();
      setCards(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <Box id={id} padding={{ base: '30px', md: '0' }} width="100%" maxWidth="1280px" margin="0 auto" background={slice?.primary?.background} {...rest}>
      <Box paddingBottom="50px" textAlign="center" px="10px" borderRadius="3px">
        <Heading as="h2" fontSize="40px" color={slice?.primary?.font_color} marginBottom="21px">
          {title}
        </Heading>
        {slice?.primary?.description ? (
          <PrismicTextComponent
            color={slice?.primary?.font_color}
            field={slice?.primary?.description}
          />
        ) : (
          <Text
            fontSize="18px"
            lineHeight="21px"
            color={fontColor2}
          >
            {description}
          </Text>
        )}
      </Box>
      <Box width="100%" display="flex" gap="24px" justifyContent="space-between" flexWrap="wrap">
        {cards.map((card) => (
          <Card card={card} key={`${card.title}`} />
        ))}
      </Box>
    </Box>
  );
}

MktTrustCards.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  slice: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  id: PropTypes.string,
};

MktTrustCards.defaultProps = {
  title: null,
  description: null,
  slice: null,
  id: null,
};

export default MktTrustCards;
