import PropTypes from 'prop-types';
import { Box, Flex, Image } from '@chakra-ui/react';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import SimpleModal from './SimpleModal';
import Signup from './Forms/Signup';
import LogIn from './Forms/LogIn';
import Heading from './Heading';
import NextChakraLink from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import AlertMessage from './AlertMessage';

const stage = {
  login: 'login',
  signup: 'signup',
  purchasedPlan: 'purchased-plan',
  waitingList: 'waiting-list',
  outOfConsumables: 'out-of-consumables',
};

function ModalToGetAccess({ isOpen, onClose, onConfirm }) {
  const { t } = useTranslation('signup');
  const { featuredColor } = useStyle();
  // [view, setView]
  const [view] = useState('login');
  const withoutSpacing = true;

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
        <Image src="static/images/happy-meeting.webp" alt="Get Access" style={{ objectFit: 'cover' }} margin={withoutSpacing && '2rem 0 0 0'} />
      </Box>

      <Box flex={0.5} paddingBottom={withoutSpacing && '1rem'}>
        <AlertMessage type="soft" full withoutIcon message="In order to compile the code you need to register for free." borderRadius="4px" padding="6px" textStyle={{ fontSize: '14px' }} mb="16px" />

        {view === stage.login && (
          <Box display="flex" flexDirection="column">
            <Flex flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '6px', md: '10px' }} alignItems={{ base: 'start', md: 'center' }} mt="0" mb="24px" justifyContent="space-between">
              <Heading size="21px">{t('about-you')}</Heading>
              <Flex fontSize="13px" width="fit-content" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
                {t('no-have-account')}
                {' '}
                <NextChakraLink href="/login" redirectAfterLogin fontSize="13px" variant="default">{t('register-here')}</NextChakraLink>
              </Flex>
            </Flex>
            <LogIn hideLabel callBack={onClose} actionfontSize="14px" />
          </Box>
        )}
        {view === stage.signup && <Signup onClose={onClose} />}
      </Box>

    </SimpleModal>
  );
}

ModalToGetAccess.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
};
ModalToGetAccess.defaultProps = {
  isOpen: false,
  onClose: () => {},
  onConfirm: () => {},
};

export default ModalToGetAccess;
