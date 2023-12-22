import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  Avatar,
  Tooltip,
  Box, Flex, Image, Skeleton,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Heading from '../../common/components/Heading';
import Signup from '../../common/components/Forms/Signup';
import { getStorageItem, setStorageItem, slugToTitle } from '../../utils';
import NextChakraLink from '../../common/components/NextChakraLink';
import useStyle from '../../common/hooks/useStyle';
import modifyEnv from '../../../modifyEnv';
// import useSignup from '../../common/store/actions/signupAction';
import ModalInfo from '../moduleMap/modalInfo';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import { reportDatalayer } from '../../utils/requests';

function ContactInformation({
  courseChoosed, defaultPlanData, formProps, setFormProps, setVerifyEmailProps,
}) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { t } = useTranslation('signup');
  const router = useRouter();
  const [showAlreadyMember, setShowAlreadyMember] = useState(false);
  const { backgroundColor, featuredColor, hexColor } = useStyle();
  const redirectStorage = getStorageItem('redirect');
  const redirectStorageAlreadyExists = typeof redirectStorage === 'string' && redirectStorage.length > 0;

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_contact_info',
      },
    });
  }, []);

  return (
    <Box display="flex" height="100%" maxWidth="1336px" width="100%" margin={{ base: 'inherit', md: '1rem auto 1rem auto', '2xl': '4rem auto 4rem auto' }}>
      <Box display="flex" gridGap="10px" height="100%" width="100%">
        <Box background={featuredColor} p={{ base: '0', md: '26px 23px' }} flex={{ base: 1, md: 0.5 }} borderRadius="15px">
          <Box
            display="flex"
            flexDirection="column"
            gridGap="24px"
            padding="24px"
            backgroundColor={hexColor.backgroundColor}
            width="fit-content"
            margin="3rem auto"
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
              formProps={formProps}
              setFormProps={setFormProps}
              onHandleSubmit={(data) => {
                setVerifyEmailProps({
                  data,
                  state: true,
                });
              }}
            />
          </Box>
        </Box>

        <Flex display={{ base: 'none', md: 'flex' }} flexDirection="column" alignItems="center" flex={0.5} position="relative">
          <Flex flexDirection="column" width="400px" justifyContent="center" height="100%" zIndex={10}>
            {defaultPlanData?.title ? (
              <Flex alignItems="start" flexDirection="column" gridGap="10px" padding="25px" borderRadius="11px" background={backgroundColor}>
                <Heading size="26px">
                  {t('checkout.title')}
                </Heading>
                <Text size="16px">
                  {t('checkout.description')}
                  {' '}
                  <NextChakraLink textDecoration="underline" href={t('checkout.read-more-link')} target="_blank">
                    {t('checkout.read-more')}
                  </NextChakraLink>
                </Text>
                {/* <Text size="16px" color="blue.default">
                  {t('what-includes')}
                </Text> */}
                <Flex flexDirection="column" gridGap="12px" mt="1rem">
                  {defaultPlanData?.featured_info?.length > 0
                    && defaultPlanData?.featured_info.map((info) => info?.service?.slug && (
                      <Box display="flex" gridGap="8px" alignItems="center">
                        {info?.service?.icon_url
                          ? <Image src={info.service.icon_url} width={16} height={16} style={{ objectFit: 'cover' }} alt="Icon for service item" margin="5px 0 0 0" />
                          : (
                            <Icon icon="checked2" color={hexColor.blueDefault} width="16px" height="16px" margin="5px 0 0 0" />
                          )}
                        <Box>
                          <Text size="16px" fontWeight={700} textAlign="left">
                            {info?.features[0]?.title || slugToTitle(info?.service?.slug)}
                          </Text>
                        </Box>
                        {info.features[0]?.description && (
                          <Tooltip label={info.features[0]?.description} placement="top">
                            <Box>
                              <Icon icon="help" width="15px" height="15px" style={{ alignItems: 'center' }} />
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    ))}
                </Flex>
              </Flex>
            ) : (
              <Skeleton height="270px" width="400px" borderRadius="11px" zIndex={10} opacity={1} />
            )}
          </Flex>
          <Image
            position="absolute"
            top={0}
            left={0}
            src="/static/images/happy-meeting-3.webp"
            alt="Get Access"
            height="631px"
            style={{ objectFit: 'cover' }}
            // margin={withoutSpacing && '2rem 0 0 0'}
            borderBottomLeftRadius="6px"
          />
        </Flex>
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
  formProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setFormProps: PropTypes.func,
  setVerifyEmailProps: PropTypes.func.isRequired,
  defaultPlanData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ContactInformation.defaultProps = {
  courseChoosed: '',
  setFormProps: () => {},
  defaultPlanData: {},
};

export default ContactInformation;
