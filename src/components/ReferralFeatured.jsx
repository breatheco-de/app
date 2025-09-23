import { Box, Text, Button, useDisclosure, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';
import ShareReferralModal from './ShareReferralModal';

function ReferralFeatured({ couponData }) {
  const { textColor } = useStyle();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation('choose-program');
  return (
    <>
      <Box
        background="yellow.light"
        padding="6px 8px"
        color="black"
        textAlign="center"
        borderRadius="17px"
        mb="10px"
        fontWeight={700}
      >
        {t('sidebar.referral-featured-title')}
      </Box>
      <Box p="10px">
        <Text
          fontSize="sm"
          lineHeight="19px"
          fontWeight="700"
          color={textColor}
          textAlign="center"
          marginBottom="15px"
          marginTop="0"
        >
          {t('sidebar.referral-featured-label')}
        </Text>
        <Flex justify="center">
          <Button
            width="80%"
            backgroundColor="blue.default"
            fontSize="16px"
            paddingX="8px"
            paddingY="22px"
            color="white"
            gap="10px"
            aria-label={t('sidebar.referral-featured-button')}
            onClick={onOpen}
            _hover={{
              backgroundColor: 'blue.default',
            }}
            _active={{
              backgroundColor: 'blue.default',
            }}
          >
            <Icon icon="share" size="27px" />
            {t('sidebar.referral-featured-button')}
          </Button>
        </Flex>
      </Box>
      <ShareReferralModal isOpen={isOpen} onClose={onClose} couponData={couponData} />
    </>
  );
}

ReferralFeatured.propTypes = {
  couponData: PropTypes.shape({
    slug: PropTypes.string,
    plans: PropTypes.arrayOf(PropTypes.shape({
      slug: PropTypes.string,
    })),
  }),
};

ReferralFeatured.defaultProps = {
  couponData: null,
};

export default ReferralFeatured;
