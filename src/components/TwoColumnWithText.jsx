import { Box, Flex, Image } from '@chakra-ui/react';
import PropTypes from 'prop-types';
// import Heading from './Heading'; // Replaced by PrismicTextComponent for titles
import PrismicTextComponent from './PrismicTextComponent';

const MAX_VISIBLE_AVATARS = 6;

function TwoColumnWithText({ slice }) {
  const {
    title,
    left_column_icon: leftColumnIcon,
    left_column_title: leftColumnTitle,
    left_column_description: leftColumnDescription,
    right_column_title: rightColumnTitle,
    right_column_description: rightColumnDescription,
  } = slice.primary;

  // Avatars are in slice.items
  const avatars = slice.items || [];

  console.log(slice);

  return (
    <Box
      as="section"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      margin="40px auto"
      maxWidth="1280px"
    >
      <Box mx="auto">
        {title && title.length > 0 && (
          <Box textAlign="center" mb={{ base: 8, md: 12 }}>
            <PrismicTextComponent field={title} fontWeight={400} />
          </Box>
        )}

        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 8, md: 12 }}
          alignItems="flex-start"
        >
          {/* Left Column */}
          <Box flex={1}>
            {leftColumnIcon && leftColumnIcon.url && (
              <Image
                src={leftColumnIcon.url}
                alt={leftColumnIcon.alt || ''}
                mb={4}
                maxH="57px"
                objectFit="contain"
              />
            )}
            {leftColumnTitle && leftColumnTitle.length > 0 && (
              <Box mb={3}>
                <PrismicTextComponent field={leftColumnTitle} fontWeight={400} fontSize={{ base: '18px !important', md: '24px !important' }} />
              </Box>
            )}
            {leftColumnDescription && leftColumnDescription.length > 0 && (
              <PrismicTextComponent field={leftColumnDescription} fontWeight={400} />
            )}
          </Box>

          {/* Right Column */}
          <Box flex={1}>
            {avatars && avatars.length > 0 && (
              <Flex mb={4} justifyContent="flex-start">
                {avatars.slice(0, MAX_VISIBLE_AVATARS).map((avatarItem, index) => (
                  avatarItem.avatar_image && avatarItem.avatar_image.url && (
                    <Image
                      key={avatarItem.avatar_image.url || index}
                      margin={index < (MAX_VISIBLE_AVATARS - 1) && index < (avatars.length - 1) ? '0 -21px 0 0' : '0'}
                      src={avatarItem.avatar_image.url}
                      width="61px"
                      height="61px"
                      borderRadius="50%"
                      objectFit="cover"
                      alt={avatarItem.avatar_image.alt || `Avatar ${index + 1}`}
                      title={avatarItem.avatar_image.alt || `Avatar ${index + 1}`}
                    />
                  )
                ))}
              </Flex>
            )}
            {rightColumnTitle && rightColumnTitle.length > 0 && (
              <Box mb={3}>
                <PrismicTextComponent field={rightColumnTitle} fontWeight={400} fontSize={{ base: '18px !important', md: '24px !important' }} />
              </Box>
            )}
            {rightColumnDescription && rightColumnDescription.length > 0 && (
              <PrismicTextComponent field={rightColumnDescription} />
            )}
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

TwoColumnWithText.propTypes = {
  slice: PropTypes.shape({
    slice_type: PropTypes.string.isRequired,
    variation: PropTypes.string.isRequired,
    primary: PropTypes.shape({
      title: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
      left_column_icon: PropTypes.shape({
        url: PropTypes.string,
        alt: PropTypes.string,
      }),
      left_column_title: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
      left_column_description: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
      right_column_title: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
      right_column_description: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
    }).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        avatar_image: PropTypes.shape({
          url: PropTypes.string,
          alt: PropTypes.string,
        }),
      }),
    ).isRequired,
  }).isRequired,
};

export default TwoColumnWithText;
