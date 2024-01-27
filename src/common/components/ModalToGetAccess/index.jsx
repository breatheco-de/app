import PropTypes from 'prop-types';
import { Box, Button, Flex, Image } from '@chakra-ui/react';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import SimpleModal from '../SimpleModal';
import Signup from '../Forms/Signup';
import LogIn from '../Forms/LogIn';
import Heading from '../Heading';
import Text from '../Text';
import Icon from '../Icon';
import UpgradeForConsumableView from '../UpgradeForConsumableView';
// import NextChakraLink from './NextChakraLink';
import useStyle from '../../hooks/useStyle';
import AlertMessage from '../AlertMessage';
import PurchassePlanView from './PurchasePlanView';
import WaitingListView from './WaitingListView';

export const stageType = {
  login: 'login',
  signup: 'signup',
  waitingList: 'waiting-list',
  purchasedPlan: 'purchased-plan',
  outOfConsumables: 'out-of-consumables',
  isWaitingForCohort: 'is-waiting-for-cohort',
};

function ModalToGetAccess({ stage, message, planSlug, externalData, currentItem, isOpen, onClose, customFunction, ...rest }) {
  const { t } = useTranslation('signup');
  const { featuredColor, hexColor } = useStyle();
  const [stageView, setStageView] = useState('');
  const [planData, setPlanData] = useState({});

  const view = stageView || stage;
  const isWaitingCohort = stageType.isWaitingForCohort === view;
  const withoutSpacing = true;

  const getImage = () => {
    if (view === stageType.waitingList) {
      return '/static/images/happy-meeting-2.webp';
    }
    if (view === stageType.outOfConsumables) {
      return '/static/images/frustrated-person.webp';
    }
    if (view === stageType.isWaitingForCohort) {
      return '/static/images/person-pointing-right.webp';
    }
    return '/static/images/happy-meeting.webp';
  };
  const image = getImage();

  const onWaitingList = (data) => {
    setStageView(stageType.waitingList);
    setPlanData(data);
  };
  const onSubscribed = (data) => {
    setStageView(stageType.purchasedPlan);
    setPlanData(data);
  };
  const handleOnClose = () => {
    onClose();
    setStageView('');
  };

  const joinCohortCta = t('join-cohort.cta', {}, { returnObjects: true });

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={handleOnClose}
      closeOnOverlayClick={false}
      padding={withoutSpacing ? '2.5rem 0px 0px 0px' : '2.5rem 0px 16px 0px'}
      maxWidth="52rem"
      bodyStyles={{
        display: 'flex',
        gridGap: withoutSpacing ? '20px' : '16px',
        padding: withoutSpacing && { base: '16px', md: '0.5rem 16px 0 0' },
      }}
      {...rest}
    >
      <Box display={{ base: 'none', md: 'flex' }} flex={0.5} alignItems={!withoutSpacing && 'center'} maxWidth="392px">
        <Image src={image} alt="Get Access" style={{ objectFit: 'cover' }} margin={!isWaitingCohort && withoutSpacing && '2rem 0 0 0'} borderBottomLeftRadius="6px" />
      </Box>

      <Flex background={hexColor.lightColor} borderRadius="11px" flexDirection="column" marginTop={!message && '2rem'} flex={{ base: 1, md: 0.5 }} paddingBottom={withoutSpacing && '1rem'} width={{ base: 'auto', md: '394px' }}>
        {message && message?.length > 0 && (
          <AlertMessage type="soft" full withoutIcon message={message} borderRadius="4px" padding="6px" textStyle={{ fontSize: '14px' }} mb="16px" />
        )}

        {view === stageType.login && (
          <Box display="flex" flexDirection="column">
            <Flex flexDirection={{ base: 'column', md: 'row' }} gridGap="10px" alignItems={{ base: 'start', md: 'center' }} mt="0" mb="24px" justifyContent="space-between">
              <Heading size="21px">{t('about-you')}</Heading>
              <Flex fontSize="13px" width="fit-content" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
                {t('no-have-account')}
                {' '}
                <Button variant="link" onClick={() => setStageView(stageType.signup)} height="auto" fontSize="13px">
                  {t('register-here')}
                </Button>
              </Flex>
            </Flex>
            <LogIn hideLabel disableRedirect callBack={handleOnClose} actionfontSize="14px" />
          </Box>
        )}
        {view === stageType.signup && (
          <Signup
            planSlug={planSlug}
            onClose={handleOnClose}
            onSubscribed={onSubscribed}
            onWaitingList={onWaitingList}
            externalLoginLink={(
              <Button variant="link" onClick={() => setStageView(stageType.login)} height="auto" fontSize="13px">
                {t('login-here')}
              </Button>
            )}
          />
        )}
        {view === stageType.waitingList && (
          <WaitingListView planData={planData} handleOnClose={handleOnClose} />
        )}

        {view === stageType.purchasedPlan && (
          <PurchassePlanView planData={planData} handleOnClose={handleOnClose} />
        )}

        {view === stageType.outOfConsumables && (
          <UpgradeForConsumableView externalData={externalData} />
        )}

        {view === stageType.isWaitingForCohort && (
          <Flex height="100%" justifyContent="center" flexDirection="column" gridGap="3rem" padding="16px" borderRadius="11px" borderBottom="16px">
            <Box>
              <Box gap="5px" display="flex" alignItems="center" marginBottom="10px">
                <Box width="44px" height="44px" borderRadius="4px" background={hexColor.blueDefault} padding="6px">
                  <Icon icon={currentItem?.icon} color="white" width="32px" height="32px" />
                </Box>
                <Text fontSize="18px" color={hexColor.blueDefault}>
                  {joinCohortCta[currentItem?.task_type.toLocaleLowerCase()] || t('join-cohort.cta.generic', { type: currentItem?.task_type.toLocaleLowerCase() })}
                </Text>
              </Box>
              <Heading as="h2" size="sm" display="flex" flexDirection="column">
                {currentItem?.title}
              </Heading>
            </Box>
            <Button variant="default" width={!externalData?.existsRelatedSubscription && 'fit-content'} onClick={customFunction}>
              {externalData?.existsRelatedSubscription ? t('join-cohort.button') : t('common:close')}
            </Button>
          </Flex>
        )}
      </Flex>

    </SimpleModal>
  );
}

ModalToGetAccess.propTypes = {
  stage: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  planSlug: PropTypes.string,
  message: PropTypes.string,
  externalData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  customFunction: PropTypes.func,
  currentItem: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object])),
};
ModalToGetAccess.defaultProps = {
  stage: stageType.login,
  isOpen: false,
  onClose: () => {},
  planSlug: '',
  message: '',
  externalData: {},
  customFunction: () => {},
  currentItem: null,
};

export default ModalToGetAccess;
