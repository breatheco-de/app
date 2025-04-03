import { Box, Link, Tooltip } from '@chakra-ui/react';
import { formatRelative } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import Head from 'next/head';
import Icon from '../Icon';
import Text from '../Text';
import ShareButton from '../ShareButton';
import useStyle from '../../hooks/useStyle';
import { location } from '../../../utils';

function Certificates({ certificates }) {
  const { t, lang } = useTranslation('profile');
  const { borderColor2 } = useStyle();

  return (
    <>
      {location?.pathname?.includes('certificates') && (
        <Head>
          <title>{t('my-certificates')}</title>
        </Head>
      )}
      <Text fontSize="15px" fontWeight="700" pb="6px">
        {t('my-certificates')}
      </Text>
      {certificates && certificates?.map((l, i) => {
        const index = `${i} - ${l.created_at} - ${l.specialty.name}`;
        const createdAt = l.created_at;
        const dateCreated = {
          es: formatRelative(new Date(createdAt), new Date(), { locale: es }),
          en: formatRelative(new Date(createdAt), new Date()),
        };
        const certfToken = l?.preview_url && l.preview_url?.split('/')?.pop();
        const certfLink = certfToken ? `https://certificate.4geeks.com/${certfToken}` : '#';
        const profession = l.specialty.name;
        const socials = t('share-certificate.socials', { certfLink, profession }, { returnObjects: true });

        return (
          <Box key={index} display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" gridGap="26px" border="1px solid" borderColor={borderColor2} p="23px 28px" borderRadius="18px">
            <Box display="flex" gridGap="26px">
              <Box padding="13.5px 10.5px" height="fit-content" backgroundColor="blue.light" borderRadius="35px">
                <Icon icon="certificate" width="24px" height="24px" style={{ marginBottom: '-8px' }} />
              </Box>
              <Box display="flex" flexDirection="column">
                <Text size="l" fontWeight="400">
                  {dateCreated[lang]}
                </Text>
                <Text size="l" fontWeight="700">
                  {l.specialty.name}
                </Text>
              </Box>
            </Box>
            <Box display="flex" flexDirection="row" gridGap="18px">
              <Tooltip placement="top" isDisabled={certfToken !== null} label={t('certificate-preview-not-available')}>
                <Link href={certfLink} variant="buttonDefault" outline colorScheme="blue.default" disabled={!certfToken} textTransform="uppercase" target={certfToken ? '_blank' : '_self'} rel="noopener noreferrer" fontSize="13px">
                  {t('view-certificate')}
                </Link>
              </Tooltip>
              <ShareButton withParty title={t('share-certificate.title')} shareText={t('share-certificate.shareText')} link={certfLink} socials={socials} />
            </Box>
          </Box>
        );
      })}
      {certificates.length === 0 && (
      <Text fontSize="15px" fontWeight="400" pb="6px">
        {t('no-certificates')}
      </Text>
      )}
    </>
  );
}

Certificates.propTypes = {
  certificates: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

Certificates.defaultProps = {
  certificates: [],
};

export default Certificates;
