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
  const [view] = useState('signup');

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      closeOnOverlayClick={false}
      // title="Get Access"
      // confirmText="Get Access"
      // cancelText="Cancel"
      padding="2.5rem 0px 16px 0px"
      // maxWidth="72rem"
      bodyStyles={{
        display: 'flex',
        gridGap: '16px',
      }}
    >
      <Box flex={0.5}>
        <Image src="static/images/happy-meeting.webp" alt="Get Access" />
      </Box>

      <Box flex={0.5}>
        <AlertMessage type="soft" full withoutIcon message="In order to compile the code you need to register for free." borderRadius="4px" padding="6px" textStyle={{ fontSize: '14px' }} mb="16px" />

        {view === stage.login && (
          <Box display="flex" flexDirection="column">
            <Heading size="18px">{t('about-you')}</Heading>
            <Flex fontSize="13px" mt="0.6rem" mb="0.8rem" width="fit-content" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
              {t('no-have-account')}
              {' '}
              <NextChakraLink href="/login" redirectAfterLogin fontSize="12px" variant="default">{t('register-here')}</NextChakraLink>
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
