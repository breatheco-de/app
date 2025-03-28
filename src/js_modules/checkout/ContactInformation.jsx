import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box, Flex,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Heading from '../../common/components/Heading';
import Signup from '../../common/components/Forms/Signup';
import { getStorageItem, setStorageItem, getBrowserInfo } from '../../utils';
import { BREATHECODE_HOST } from '../../utils/variables';
import NextChakraLink from '../../common/components/NextChakraLink';
import useStyle from '../../common/hooks/useStyle';
import ModalInfo from '../../common/components/ModalInfo';
import Text from '../../common/components/Text';
import { reportDatalayer } from '../../utils/requests';

function ContactInformation({
  courseChoosed, setVerifyEmailProps,
}) {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const [showAlreadyMember, setShowAlreadyMember] = useState(false);
  const { featuredColor, hexColor, backgroundColor } = useStyle();
  const redirectStorage = getStorageItem('redirect');
  const redirectStorageAlreadyExists = typeof redirectStorage === 'string' && redirectStorage.length > 0;

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_contact_info',
        agent: getBrowserInfo(),
      },
    });
  }, []);

  return (
    // {{ base: 'inherit', md: '1rem auto 1rem auto', '2xl': '4rem auto 4rem auto' }}
    <Box display="flex" gridGap="10px" height="100%" maxWidth="1336px" background={backgroundColor} justifyContent="center" width="100%" margin="0 auto">
      <Box
        display="flex"
        flexDirection="column"
        gridGap="24px"
        padding="24px 0"
        backgroundColor={hexColor.backgroundColor}
        width="fit-content"
        margin="0 1rem"
      >
        <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} justifyContent="space-between">
          <Heading size="21px">{t('about-you')}</Heading>
          <Flex fontSize="13px" ml={{ base: '0', sm: '1rem' }} mt={{ base: '10px', sm: '0' }} width="fit-content" p="2px 8px" backgroundColor={featuredColor} alignItems="center" borderRadius="4px" gridGap="6px">
            {t('already-have-account')}
            {' '}
            <NextChakraLink href="/login" redirectAfterLogin={!redirectStorageAlreadyExists} fontSize="13px" variant="default">{t('login-here')}</NextChakraLink>
          </Flex>
        </Box>
        <Signup
          showVerifyEmail={false}
          courseChoosed={courseChoosed}
          extraFields={['phone']}
          maxWidth={{ base: 'auto', lg: '490px' }}
          onHandleSubmit={(data) => {
            setVerifyEmailProps({
              data,
              state: true,
            });
          }}
        />
      </Box>
      <ModalInfo
        isOpen={showAlreadyMember}
        headerStyles={{ textAlign: 'center' }}
        onClose={() => setShowAlreadyMember(false)}
        title={t('signup:alert-message.title')}
        childrenDescription={(
          <Box display="flex" flexDirection="column" alignItems="center" gridGap="17px">
            <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-7.png`} border="3px solid #0097CD" width="91px" height="91px" borderRadius="50px" />
            <Text
              size="14px"
              textAlign="center"
              dangerouslySetInnerHTML={{ __html: t('signup:alert-message.description') }}
            />
          </Box>
        )}
        closeButtonVariant="outline"
        closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
        buttonHandlerStyles={{ variant: 'default' }}
        actionHandler={() => {
          setStorageItem('redirect', router?.asPath);
          router.push('/login');
          setShowAlreadyMember(false);
        }}
        handlerText={t('common:login')}
      />
    </Box>
  );
}

ContactInformation.propTypes = {
  courseChoosed: PropTypes.string,
  setVerifyEmailProps: PropTypes.func.isRequired,
};

ContactInformation.defaultProps = {
  courseChoosed: '',
};

export default ContactInformation;
