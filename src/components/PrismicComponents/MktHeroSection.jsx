import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Text, Image,
} from '@chakra-ui/react';
import { PrismicRichText } from '@prismicio/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../Heading';
import Button from '../Button';
import PrismicTextComponent from '../PrismicTextComponent';
import Rating from '../Rating';
import PricingModal from '../PricingModal';
import Icon from '../Icon';

function MktHeroSection({
  slice, fontFamily, buttonHandler, imagesArray,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation('pricing');

  const userImages = slice?.items?.slice(0, 4) || imagesArray || [];
  const ratingUserImages = slice?.items?.map((item) => item.learner_image?.url).filter(Boolean) || [];
  const ratingSlice = {
    variation: 'inline',
    primary: {
      rating: slice?.primary?.rating || 4.5,
      trust_text: slice?.primary?.trust_text || '2.5K',
    },
  };

  const handleButtonClick = () => {
    setIsButtonLoading(true);
    if (buttonHandler) {
      buttonHandler();
    } else {
      setIsModalOpen(true);
    }
    setTimeout(() => setIsButtonLoading(false), 100);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsButtonLoading(false);
  };

  return (
    <Box
      maxW="1280px"
      margin={{ base: '0 auto 20px auto', md: '0 auto 80px auto', xl: '0 auto 120px auto' }}
    >

      <Box
        textAlign="center"
        borderRadius="16px"
        p={{ base: '24px', md: '40px' }}
        zIndex="2"
        margin="0 auto"
      >
        {slice?.primary?.title && (
          <Heading mb="24px">
            <PrismicTextComponent
              field={slice?.primary?.title}
              fontWeight="400"
              display="initial"
              lineHeight="inherit"
              fontFamily={fontFamily}
            />
          </Heading>
        )}

        {slice?.primary?.description?.length > 0 && (
          <Text mb="24px">
            <PrismicTextComponent
              field={slice?.primary?.description}
              lineHeight="inherit"
            />
          </Text>
        )}

        <Box mb="24px" display="flex" justifyContent="center" position="relative">
          <Rating
            variant="inline"
            rating={ratingSlice.primary.rating}
            trustText={ratingSlice.primary.trust_text}
            ratingUsers={ratingUserImages}
          />
          {userImages[0] && (
            <Box
              position="absolute"
              top={{ sm: '0px', md: '-15px', lg: '-10px', xl: '-50px' }}
              left={{ sm: '-30px', md: '-20px', lg: '0px', xl: '36px' }}
              zIndex="0"
              transform="rotate(13deg)"
              display={{ base: 'none', sm: 'block', xl: 'block' }}
            >
              <Image
                src={userImages[0].user_image?.url}
                alt={userImages[0].user_image?.alt || 'Student learning'}
                width={{ base: 100, md: 180, lg: 200, xl: 230 }}
                height={{ base: 70, md: 130, lg: 150, xl: 178 }}
                style={{
                  borderRadius: '12px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </Box>
          )}

          {userImages[3] && (
            <Box
              position="absolute"
              top={{ sm: '5px', md: '-15px', lg: '-15px', xl: '-50px' }}
              right={{ sm: '-28px', md: '-20px', lg: '-10px', xl: '30px' }}
              zIndex="1"
              transform="rotate(10deg)"
              display={{ base: 'none', sm: 'block', xl: 'block' }}
            >
              <Image
                src={userImages[3].user_image?.url}
                alt={userImages[3].user_image?.alt || 'Student learning'}
                width={{ base: 100, md: 180, lg: 200, xl: 230 }}
                height={{ base: 70, md: 130, lg: 150, xl: 178 }}
                style={{
                  borderRadius: '12px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </Box>
          )}
        </Box>

        {slice?.primary?.button_text?.length > 0 && (
          <Box display="flex" justifyContent="center" position="relative">

            {userImages[1] && (
              <Box
                position="absolute"
                bottom={{ sm: '-20px', md: '-100px', lg: '-100px', xl: '-110px' }}
                left={{ sm: '10px', md: '40px', lg: '130px', xl: '220px' }}
                zIndex="0"
                transform="rotate(-6deg)"
                display={{ base: 'none', sm: 'block', xl: 'block' }}
              >
                <Image
                  src={userImages[1].user_image?.url}
                  alt={userImages[1].user_image?.alt || 'Student learning'}
                  width={{ base: 100, md: 180, lg: 200, xl: 230 }}
                  height={{ base: 70, md: 130, lg: 150, xl: 178 }}
                  style={{
                    borderRadius: '12px',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </Box>
            )}

            {userImages[2] && (
              <Box
                position="absolute"
                bottom={{ sm: '-20px', md: '-100px', lg: '-100px', xl: '-110px' }}
                right={{ sm: '15px', md: '40px', lg: '130px', xl: '220px' }}
                zIndex="0"
                transform="rotate(13deg)"
                display={{ base: 'none', sm: 'block', xl: 'block' }}
              >
                <Image
                  src={userImages[2].user_image?.url}
                  alt={userImages[2].user_image?.alt || 'Student learning'}
                  width={{ base: 100, md: 180, lg: 200, xl: 230 }}
                  height={{ base: 70, md: 130, lg: 150, xl: 178 }}
                  style={{
                    borderRadius: '12px',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </Box>
            )}
            <Button
              variant="default"
              width="fit-content"
              textAlign="center"
              onClick={handleButtonClick}
              fontSize="17px"
              letterSpacing="0.05em"
              isLoading={isButtonLoading}
              loadingText="Loading..."
            >
              <PrismicRichText field={slice?.primary?.button_text} />
            </Button>
          </Box>
        )}
      </Box>

      <PricingModal
        maxWidth="1000px"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mainImage="/static/images/women-laptop-bubbles.png"
        callToActions={[
          {
            title: t('immersive-bootcamp'),
            titleStyles: {
              color: 'blue.default',
            },
            description: t('immersive-bootcamp-description'),
            buttonText: t('see-plan-details'),
            titleLeftComponent: <Box p="8px" borderRadius="8px" bg="blue.50"><Icon icon="rocketDiagonal" color="#0084FF" /></Box>,
            action: () => router.replace({ pathname: '/pricing', query: { view: 'immersive-bootcamps' } }),
          },
          {
            title: t('self-paced-courses'),
            titleStyles: {
              color: 'green.500',
            },
            description: t('self-paced-description'),
            buttonText: t('see-plan-details'),
            titleLeftComponent: <Box p="8px" borderRadius="8px" bg="green.100"><Icon icon="pathToStar" color="#06AB52" /></Box>,
            action: () => router.replace({ pathname: '/pricing', query: { view: 'self-paced' } }),
          },
        ]}
      />
    </Box>
  );
}

MktHeroSection.propTypes = {
  slice: PropTypes.shape({
    primary: PropTypes.shape({
      title: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
      title_weight: PropTypes.string,
      description: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
      button_text: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
      button_link: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ url: PropTypes.string }),
      ]),
      rating: PropTypes.number,
      trust_text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        user_image: PropTypes.shape({
          url: PropTypes.string,
          alt: PropTypes.string,
        }),
        learner_image: PropTypes.shape({
          url: PropTypes.string,
          alt: PropTypes.string,
        }),
      }),
    ),
  }),
  fontFamily: PropTypes.string,
  buttonHandler: PropTypes.func,
  imagesArray: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
};

MktHeroSection.defaultProps = {
  slice: {},
  fontFamily: 'Lato',
  buttonHandler: null,
  imagesArray: [],
};

export default MktHeroSection;
