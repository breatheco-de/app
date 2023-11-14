import { Box, Button, Flex, Image } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../Heading';
import Text from '../Text';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import { slugToTitle } from '../../../utils';

function WaitingListView({ planData, handleOnClose }) {
  const { t } = useTranslation('signup');
  const { hexColor } = useStyle();

  return (
    <Flex flexDirection="column" gridGap="16px">
      <Heading size="21px">
        {t('in-waiting-list-title')}
      </Heading>
      <Text size="14px" fontWeight={700}>
        {t('signup-thanks-text')}
      </Text>
      <Flex flexDirection="column" gridGap="16px">
        {planData?.featured_info?.length > 0
        && planData?.featured_info.map((info) => info?.service?.slug && (
          <Flex gridGap="8px">
            {info?.service?.icon_url
              ? <Image src={info.service.icon_url} width={16} height={16} style={{ objectFit: 'cover' }} alt="Icon for service item" margin="5px 0 0 0" />
              : (
                <Icon icon="checked2" color={hexColor.blueDefault} width="16px" height="16px" margin="5px 0 0 0" />
              )}
            <Box>
              <Text size="16px" fontWeight={700} textAlign="left">
                {info?.service?.title || slugToTitle(info?.service?.slug)}
              </Text>
              {info.features.length > 0 && (
                <Text size="14px" textAlign="left">
                  {info.features[0]?.description}
                </Text>
              )}
            </Box>
          </Flex>
        ))}
      </Flex>

      <Button display="flex" gridGap="10px" width="fit-content" margin="0 auto" onClick={handleOnClose} variant="Link" fontSize="17px" borderColor="blue.default" color="blue.default" _hover={{ textDecoration: 'underline' }}>
        {t('continue-learning')}
        <Icon icon="longArrowRight" color="currentColor" width="24px" height="10px" />
      </Button>
    </Flex>
  );
}

WaitingListView.propTypes = {
  planData: PropTypes.shape({
    featured_info: PropTypes.arrayOf(PropTypes.shape({
      service: PropTypes.shape({
        slug: PropTypes.string,
        title: PropTypes.string,
        icon_url: PropTypes.string,
      }),
      features: PropTypes.arrayOf(PropTypes.shape({
        description: PropTypes.string,
      })),
    })),
  }).isRequired,
  handleOnClose: PropTypes.func,
};
WaitingListView.defaultProps = {
  handleOnClose: () => {},
};

export default WaitingListView;
