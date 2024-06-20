import PropTypes from 'prop-types';
import {
  Box,
} from '@chakra-ui/react';
import Image from 'next/image';
import PrismicTextComponent from './PrismicTextComponent';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';
import Text from './Text';
import Icon from './Icon';
import { isAbsoluteUrl } from '../../utils/url';

function Card({ title, description, icon, color }) {
  const { hexColor } = useStyle();
  return (
    <Box width={{ base: '100%', md: '330px' }} borderRadius="8px" minHeight="178px" padding="8px" border="1px solid" borderColor={color}>
      {isAbsoluteUrl(icon) ? (
        <Image src={icon} width={40} height={40} alt="Card image" />
      ) : (
        <Icon icon={icon} color={color} width="40px" height="40px" />
      )}
      <Text my="10px" fontSize="16px" fontWeight="700" color={hexColor.fontColor2}>
        {title}
      </Text>
      <Text size="md" fontWeight="400" color={hexColor.fontColor2} dangerouslySetInnerHTML={{ __html: description }} />
    </Box>
  );
}

function MktInfoCards({
  title,
  subTitle,
  description,
  slice,
  cardOneIcon,
  cardOneColor,
  cardOneTitle,
  cardOneDescription,
  cardTwoIcon,
  cardTwoColor,
  cardTwoTitle,
  cardTwoDescription,
  cardThreeIcon,
  cardThreeColor,
  cardThreeTitle,
  cardThreeDescription,
  cardFourIcon,
  cardFourColor,
  cardFourTitle,
  cardFourDescription,
  margin,
  padding,
  paddingMobile,
  fontFamily,
  ...rest
}) {
  const { hexColor } = useStyle();

  const cards = [{
    title: cardOneTitle,
    description: cardOneDescription,
    icon: cardOneIcon,
    color: cardOneColor,
  }, {
    title: cardTwoTitle,
    description: cardTwoDescription,
    icon: cardTwoIcon,
    color: cardTwoColor,
  }, {
    title: cardThreeTitle,
    description: cardThreeDescription,
    icon: cardThreeIcon,
    color: cardThreeColor,
  }, {
    title: cardFourTitle,
    description: cardFourDescription,
    icon: cardFourIcon,
    color: cardFourColor,
  }];

  return (
    <Box
      className="info-cards"
      maxWidth="1280px"
      mx="auto"
      my="20px"
      width="100%"
      display="flex"
      gap="24px"
      padding={{
        base: paddingMobile,
        md: padding,
      }}
      px={{ base: '10px', md: '2rem' }}
      margin={margin}
      flexWrap={{ base: 'wrap', lg: 'nowrap' }}
      fontFamily={fontFamily}
      {...rest}
    >
      <Box maxWidth="fit-content">
        {subTitle && (
          <Text size="md" color={hexColor.blueDefault} fontWeight="700" marginBottom="16px">
            {subTitle}
          </Text>
        )}
        {title && (
          <Heading size="sm" textAlign="left" marginBottom="16px">
            {title}
          </Heading>
        )}
        {slice?.primary?.description ? (
          <PrismicTextComponent
            field={slice?.primary?.description}
            color={slice?.primary?.description_color}
          />
        ) : (
          <Text
            size="md"
            lineHeight="16px"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        <Icon icon="longArrowRight" color={hexColor.blueDefault} width="160px" height="60px" style={{ marginTop: '15px' }} />
      </Box>
      <Box
        display="flex"
        gap="24px"
        width={{ base: 'autp', md: '100%', lg: 'autp' }}
        flexWrap={{ base: 'wrap', lg: 'nowrap' }}
        justifyContent={{ base: 'flex-start', md: 'center', lg: 'flex-start' }}
      >
        <Box display="flex" gap="24px" flexDirection="column">
          {cards.slice(0, 2).map((card) => (card.title || card.description) && (
            <Card {...card} />
          ))}
        </Box>
        <Box display="flex" gap="24px" flexDirection="column" marginTop={{ base: '0', lg: '24px' }}>
          {cards.slice(2).map((card) => (card.title || card.description) && (
            <Card {...card} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

MktInfoCards.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
  description: PropTypes.string,
  slice: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  cardOneIcon: PropTypes.string,
  cardOneColor: PropTypes.string,
  cardOneTitle: PropTypes.string,
  cardOneDescription: PropTypes.string,
  cardTwoIcon: PropTypes.string,
  cardTwoColor: PropTypes.string,
  cardTwoTitle: PropTypes.string,
  cardTwoDescription: PropTypes.string,
  cardThreeIcon: PropTypes.string,
  cardThreeColor: PropTypes.string,
  cardThreeTitle: PropTypes.string,
  cardThreeDescription: PropTypes.string,
  cardFourIcon: PropTypes.string,
  cardFourColor: PropTypes.string,
  cardFourTitle: PropTypes.string,
  cardFourDescription: PropTypes.string,
  margin: PropTypes.string,
  padding: PropTypes.string,
  paddingMobile: PropTypes.string,
  fontFamily: PropTypes.string,
};

MktInfoCards.defaultProps = {
  title: null,
  subTitle: null,
  description: '',
  slice: null,
  cardOneIcon: null,
  cardOneColor: null,
  cardOneTitle: null,
  cardOneDescription: null,
  cardTwoIcon: null,
  cardTwoColor: null,
  cardTwoTitle: null,
  cardTwoDescription: null,
  cardThreeIcon: null,
  cardThreeColor: null,
  cardThreeTitle: null,
  cardThreeDescription: null,
  cardFourIcon: null,
  cardFourColor: null,
  cardFourTitle: null,
  cardFourDescription: null,
  margin: '',
  padding: '0',
  paddingMobile: '0',
  fontFamily: 'Lato',
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default MktInfoCards;
