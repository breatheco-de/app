import PropTypes from 'prop-types';
import { Box, Button, Flex, Image } from '@chakra-ui/react';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import SimpleModal from './SimpleModal';
import Signup from './Forms/Signup';
import LogIn from './Forms/LogIn';
import Heading from './Heading';
import UpgradeForConsumableView from './UpgradeForConsumableView';
// import NextChakraLink from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import AlertMessage from './AlertMessage';
import Text from './Text';
import Icon from './Icon';
import { slugToTitle } from '../../utils';

export const stageType = {
  login: 'login',
  signup: 'signup',
  waitingList: 'waiting-list',
  purchasedPlan: 'purchased-plan',
  outOfConsumables: 'out-of-consumables',
};

function ModalToGetAccess({ stage, message, planSlug, externalData, isOpen, onClose, onConfirm }) {
  const { t } = useTranslation('signup');
  const { hexColor, featuredColor } = useStyle();
  const [stageView, setStageView] = useState('');
  const [planData, setPlanData] = useState({});

  const view = stageView || stage;
  const withoutSpacing = true;

  const getImage = () => {
    if (view === stageType.waitingList) {
      return 'static/images/happy-meeting-2.webp';
    }
    if (view === stageType.outOfConsumables) {
      return 'static/images/frustrated-person.webp';
    }
    return 'static/images/happy-meeting.webp';
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

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={handleOnClose}
      onConfirm={onConfirm}
      closeOnOverlayClick={false}
      // title="Get Access"
      // confirmText="Get Access"
      // cancelText="Cancel"
      padding={withoutSpacing ? '2.5rem 0px 0px 0px' : '2.5rem 0px 16px 0px'}
      // maxWidth="72rem"
      maxWidth="52rem"
      bodyStyles={{
        display: 'flex',
        gridGap: withoutSpacing ? '20px' : '16px',
        padding: withoutSpacing && { base: '16px', md: '0.5rem 16px 0 0' },
      }}
    >
      <Box display={{ base: 'none', md: 'flex' }} flex={0.5} alignItems={!withoutSpacing && 'center'} maxWidth="392px">
        <Image src={image} alt="Get Access" style={{ objectFit: 'cover' }} margin={withoutSpacing && '2rem 0 0 0'} />
      </Box>

      <Flex flexDirection="column" marginTop={!message && '2rem'} flex={{ base: 1, md: 0.5 }} paddingBottom={withoutSpacing && '1rem'} width={{ base: 'auto', md: '394px' }}>
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
                  <Box display="flex" gridGap="8px">
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
                  </Box>
                ))}
            </Flex>

            <Button display="flex" gridGap="10px" width="fit-content" margin="0 auto" onClick={handleOnClose} variant="Link" fontSize="17px" borderColor="blue.default" color="blue.default" _hover={{ textDecoration: 'underline' }}>
              {t('continue-learning')}
              <Icon icon="longArrowRight" color="currentColor" width="24px" height="10px" />
            </Button>
          </Flex>
        )}

        {view === stageType.purchasedPlan && (
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
                && planData?.featured_info.map((info) => info?.service?.slug && (
                  <Box display="flex" gridGap="8px">
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
                  </Box>
                ))}
            </Flex>

            <Button display="flex" gridGap="10px" width="fit-content" margin="0 auto" onClick={handleOnClose} variant="Link" fontSize="17px" borderColor="blue.default" color="blue.default" _hover={{ textDecoration: 'underline' }}>
              {t('continue-learning')}
              <Icon icon="longArrowRight" color="currentColor" width="24px" height="10px" />
            </Button>
          </Flex>
        )}

        {view === stageType.outOfConsumables && (
          <UpgradeForConsumableView externalData={externalData} />
        )}
      </Flex>

    </SimpleModal>
  );
}

ModalToGetAccess.propTypes = {
  stage: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  planSlug: PropTypes.string,
  message: PropTypes.string,
  externalData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
};
ModalToGetAccess.defaultProps = {
  stage: stageType.login,
  isOpen: false,
  onClose: () => {},
  onConfirm: () => {},
  planSlug: '',
  message: '',
  externalData: {},
};

export default ModalToGetAccess;
