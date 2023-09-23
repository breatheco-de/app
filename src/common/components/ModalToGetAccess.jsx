import PropTypes from 'prop-types';
import { Box, Button, Flex, Image } from '@chakra-ui/react';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import SimpleModal from './SimpleModal';
import Signup from './Forms/Signup';
import LogIn from './Forms/LogIn';
import Heading from './Heading';
import NextChakraLink from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import AlertMessage from './AlertMessage';
import Text from './Text';
import Icon from './Icon';
import { slugToTitle } from '../../utils';

export const stageValue = {
  login: 'login',
  signup: 'signup',
  waitingList: 'waiting-list',
  // purchasedPlan: 'purchased-plan',
  // outOfConsumables: 'out-of-consumables',
};

function ModalToGetAccess({ stage, message, planSlug, isOpen, onClose, onConfirm }) {
  const { t } = useTranslation('signup');
  const { hexColor, featuredColor } = useStyle();
  const [stageView, setStageView] = useState('');
  const [planData, setPlanData] = useState({});

  const view = stageView || stage;
  const withoutSpacing = true;
  const image = view === stageValue.waitingList
    ? 'static/images/happy-meeting-2.webp'
    : 'static/images/happy-meeting.webp';

  const onWaitingList = (externalData) => {
    setStageView(stageValue.waitingList);
    setPlanData(externalData);
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
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
        padding: withoutSpacing && '0.5rem 1.5rem 0 0',
      }}
    >
      <Box display="flex" flex={0.5} alignItems={!withoutSpacing && 'center'}>
        <Image src={image} alt="Get Access" style={{ objectFit: 'cover' }} margin={withoutSpacing && '2rem 0 0 0'} />
      </Box>

      <Box flex={0.5} paddingBottom={withoutSpacing && '1rem'}>
        {message && message?.length > 0 && (
          <AlertMessage type="soft" full withoutIcon message={message} borderRadius="4px" padding="6px" textStyle={{ fontSize: '14px' }} mb="16px" />
        )}

        {view === stageValue.login && (
          <Box display="flex" flexDirection="column">
            <Flex flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '6px', md: '10px' }} alignItems={{ base: 'start', md: 'center' }} mt="0" mb="24px" justifyContent="space-between">
              <Heading size="21px">{t('about-you')}</Heading>
              <Flex fontSize="13px" width="fit-content" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
                {t('no-have-account')}
                {' '}
                <NextChakraLink href="/login" redirectAfterLogin fontSize="13px" variant="default">{t('register-here')}</NextChakraLink>
              </Flex>
            </Flex>
            <LogIn hideLabel disableRedirect callBack={onClose} actionfontSize="14px" />
          </Box>
        )}
        {view === stageValue.signup && (
          <Signup
            planSlug={planSlug}
            onClose={onClose}
            onWaitingList={onWaitingList}
          />
        )}
        {view === stageValue.waitingList && (
          <Flex flexDirection="column" gridGap="16px">
            <Heading size="21px">
              {t('in-waiting-list-title')}
            </Heading>
            <Text size="14px" fontWeight={700}>
              {t('signup-thanks-text')}
            </Text>
            <Flex flexDirection="column" gridGap="16px">
              {planData.featured_info.map((info) => info.service.slug && (
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

            <Button display="flex" gridGap="10px" width="fit-content" margin="0 auto" onClick={onClose} variant="Link" fontSize="17px" borderColor="blue.default" color="blue.default" _hover={{ textDecoration: 'underline' }}>
              {t('continue-learning')}
              <Icon icon="longArrowRight" color="currentColor" width="24px" height="10px" />
            </Button>
          </Flex>
        )}
      </Box>

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
};
ModalToGetAccess.defaultProps = {
  stage: stageValue.login,
  isOpen: false,
  onClose: () => {},
  onConfirm: () => {},
  planSlug: '',
  message: '',
};

export default ModalToGetAccess;
