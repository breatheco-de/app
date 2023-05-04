import { Box, Flex, Modal, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Icon from '../../../common/components/Icon';
import ShowPrices from '../../../common/components/ShowPrices';
import Text from '../../../common/components/Text';
import useStyle from '../../../common/hooks/useStyle';
import { parseQuerys } from '../../../utils/url';

const UpgradeModal = ({ upgradeModalIsOpen, setUpgradeModalIsOpen, subscriptionProps, offerProps }) => {
  const { lightColor, modal } = useStyle();
  const { t } = useTranslation('profile');
  const router = useRouter();
  const isTotallyFree = offerProps?.isTotallyFree === true;

  const getDefaultFinanceIndex = () => {
    if (offerProps?.paymentOptions?.length > 0) return 0;
    if (offerProps?.financingOptions?.length > 0) return 1;
    return 0;
  };

  const getUpgradeLabel = (outOfConsumables) => {
    const activeStatus = ['ACTIVE, FULLY_PAID, FREE_TRIAL'];
    const status = subscriptionProps?.status;
    if (activeStatus.includes(status) && outOfConsumables) {
      return {
        title: t('subscription.upgrade-modal.buy_mentorships'),
        description: '',
      };
    }
    if (status === 'FREE_TRIAL') {
      return {
        title: t('subscription.upgrade-modal.upgrade_free_trial'),
        description: t('subscription.upgrade-modal.free_trial_description'),
      };
    }

    return {
      title: t('subscription.upgrade-modal.upgrade_access'),
      description: '',
    };
  };

  const upgradeLabel = getUpgradeLabel(offerProps?.outOfConsumables);

  return (
    <Modal
      isOpen={upgradeModalIsOpen}
      onClose={() => setUpgradeModalIsOpen(false)}
      size={!isTotallyFree ? '5xl' : 'xl'}
    >
      <ModalCloseButton />
      <ModalOverlay />
      <ModalContent background={modal.background3}>
        <Flex padding="32px" gridGap="35px" flexDirection={{ base: 'column', lg: isTotallyFree ? 'column' : 'row' }}>
          {!isTotallyFree && (
            <Flex flex={0.5} margin="5rem 0 0 0" flexDirection="column" gridGap="16px" textAlign="center">
              <Text fontSize="26px" color="blue.default" fontWeight="700" lineHeight="31px">
                {upgradeLabel.title}
              </Text>
              {upgradeLabel.description && (
                <Text fontSize="21px" color={lightColor} fontWeight="700" lineHeight="25.2px">
                  {upgradeLabel.description}
                </Text>
              )}
              {offerProps?.bullets?.length > 0 && (
                <Box
                  as="ul"
                  style={{ listStyle: 'none' }}
                  display="flex"
                  flexDirection="column"
                  gridGap="12px"
                  margin="10px 0 0 5px"
                >
                  {offerProps?.bullets.map((bullet) => (
                    <Box
                      as="li"
                      key={bullet?.features[0]?.description}
                      display="flex"
                      flexDirection="row"
                      lineHeight="24px"
                      gridGap="8px"
                    >
                      <Icon
                        icon="checked2"
                        color="#38A56A"
                        width="13px"
                        height="10px"
                        style={{ margin: '8px 0 0 0' }}
                      />
                      <Box
                        fontSize="14px"
                        fontWeight="600"
                        letterSpacing="0.05em"
                        dangerouslySetInnerHTML={{ __html: bullet?.description }}
                      />
                      {bullet?.features[0]?.description}
                    </Box>
                  ))}
                </Box>
              )}
            </Flex>
          )}
          <Box flex={0.5}>
            <ShowPrices
              title={offerProps?.outOfConsumables
                ? t('subscription.upgrade-modal.choose_how_much')
                : t('subscription.upgrade-modal.choose_your_plan')}
              planSlug={offerProps?.slug}
              notReady={t('subscription.upgrade-modal.not_ready_to_commit')}
              defaultFinanceIndex={getDefaultFinanceIndex()}
              list={offerProps?.paymentOptions?.length > 0 ? offerProps?.paymentOptions : offerProps?.consumableOptions}
              onePaymentLabel={t('subscription.upgrade-modal.one_payment')}
              financeTextLabel={t('subscription.upgrade-modal.finance')}
              handleUpgrade={(item) => {
                const hasAvailableCohorts = item?.suggested_plan?.has_available_cohorts;
                const period = item?.period;

                const querys = parseQuerys({
                  plan: item?.suggested_plan?.slug,
                  plan_id: item?.plan_id,
                  has_available_cohorts: hasAvailableCohorts,
                  price: item?.price,
                  period,
                });
                router.push(`/checkout${querys}`);
              }}
              // onSelect={(item) => {}}
              finance={offerProps?.financingOptions}
              outOfConsumables={offerProps?.outOfConsumables}
              isTotallyFree={isTotallyFree}
            />

          </Box>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

UpgradeModal.propTypes = {
  upgradeModalIsOpen: PropTypes.bool.isRequired,
  setUpgradeModalIsOpen: PropTypes.func.isRequired,
  subscriptionProps: PropTypes.objectOf(PropTypes.any).isRequired,
  offerProps: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default UpgradeModal;
