/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Img, Fade,
} from '@chakra-ui/react';
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((curr) => (curr + 1 < images.length ? curr + 1 : 0));
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const formatedDescription = description.length > 39 ? `${description.substring(0, 40)}...` : description;
  return (
    <Box
      width="180px"
      height="270px"
      background={hexColor.backgroundColor}
      borderRadius="11px"
      border="1px solid"
      borderColor={hexColor.borderColor}
      padding="16px"
      textAlign="center"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Box width="100%" height="95px" marginBottom="16px" position="relative">
        {images.map((image, i) => (
          <Fade in={currentIndex === i}>
            <Img
              // display={currentIndex === i ? 'block' : 'none'}
              key={image}
              src={image}
              width="100%"
              height="95px"
              position="absolute"
            />
          </Fade>
        ))}
      </Box>
      <Box>
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
      <Link color={hexColor.blueDefault} href={aricle_url} target="__blank">
        {t('asset-button.article')}
        {'  '}
        →
      </Link>
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
  const { fontColor2 } = useStyle();
  const cards = [{
    images: [
      'https://c0.klipartz.com/pngpicture/288/367/gratis-png-logotipo-de-forbes.png',
      'https://1000logos.net/wp-content/uploads/2017/04/Symbol-New-York-Times.png',
      'https://nypost.com/wp-content/themes/nypost-2016/static/images/default/nypost.png',
    ],
    title: 'Everyone is talking about us',
    description: 'Especially NY Times, Forbes, Daily mail and Daily bugle',
    aricle_url: 'https://www.google.com',
  }, {
    images: [
      'https://www.vhv.rs/dpng/d/227-2276289_best-bootcamp-badge-course-report-green-hd-png.png',
      'https://professional.du.edu/sites/default/files/Full_Stack_Badge_noLevel_lightgoldring.png',
    ],
    title: 'We have a lot of badges',
    description: 'Especially NY Times, Forbes, Daily mail and Daily bugle',
    aricle_url: 'https://www.google.com',
  }, {
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/3/3c/Clark_University_logo.png',
      'https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/University_of_Texas_at_Austin_seal.svg/1200px-University_of_Texas_at_Austin_seal.svg.png',
    ],
    title: 'These universities certify us',
    description: 'Especially NY Times, Forbes, Daily mail and Daily bugle',
    aricle_url: 'https://www.google.com',
  }, {
    images: [
      'https://media.istockphoto.com/id/1334437504/vector/group-of-people-students-with-bags-in-school-back-view-meeting-of-young-men-and-women-before.jpg?s=612x612&w=0&k=20&c=-fZCUJrwsmFIdyVMbN8I0uJVS4zlaiwJn43JEjcgnmI=',
      'https://upload.wikimedia.org/wikipedia/commons/3/3c/Clark_University_logo.png',
    ],
    title: 'Opinion does matter...',
    description: 'Especially NY Times, Forbes, Daily mail and Daily bugle',
    aricle_url: 'https://www.google.com',
  }];

  return (
    <Box padding="30px" maxWidth="1280px" background={slice?.primary?.background} {...rest}>
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
      <Box display="flex" gap="24px" justifyContent="center" flexWrap="wrap">
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
  id: '',
};

export default MktTrustCards;
