import { Box, Button, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../Heading';
import Text from '../Text';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';

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
        && planData?.featured_info.map((info) => (info?.title || info?.description) && (
          <Flex key={`${info.title}-${info.description}`} gridGap="8px">
            <Icon icon="checked2" color={hexColor.blueDefault} width="16px" height="16px" margin="5px 0 0 0" />
            <Box>
              {info?.title && (
                <Text size="16px" fontWeight={700} textAlign="left">
                  {info.title}
                </Text>
              )}
              {info?.description && (
                <Text size="14px" textAlign="left">
                  {info.description}
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
      title: PropTypes.string,
      description: PropTypes.string,
    })),
  }).isRequired,
  handleOnClose: PropTypes.func,
};
WaitingListView.defaultProps = {
  handleOnClose: () => {},
};

export default WaitingListView;
