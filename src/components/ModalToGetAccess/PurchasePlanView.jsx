import { Box, Button, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';
import Text from '../Text';

function PurchassePlanView({ planData, handleOnClose }) {
  const { hexColor, featuredColor } = useStyle();
  const { t } = useTranslation('signup');

  return (
    <Flex flexDirection="column" height="100%" background={featuredColor} gridGap="16px" padding="16px" borderRadius="11px" borderBottom="16px" justifyContent="center">
      <Heading as="h1" size="xsm" display="flex" flexDirection="column">
        <span>{t('welcome-to')}</span>
        {planData?.title && (
        <span>
          {planData.title}
          {' '}
          plan
        </span>
        )}
      </Heading>
      <Heading size="14px" color="blue.default">
        {t('info.this-plan-includes')}
      </Heading>
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

PurchassePlanView.propTypes = {
  planData: PropTypes.shape({
    title: PropTypes.string,
    featured_info: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
    })),
  }).isRequired,
  handleOnClose: PropTypes.func,
};
PurchassePlanView.defaultProps = {
  handleOnClose: () => {},
};

export default PurchassePlanView;
