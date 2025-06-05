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
import { location } from '../../utils';
import useSocialShare from '../../hooks/useSocialShare';

// Componente para un certificado individual
function CertificateItem({ certificate }) {
  const { t, lang } = useTranslation('profile');
  const { borderColor2 } = useStyle();

  const createdAt = certificate.created_at;
  const dateCreated = {
    es: formatRelative(new Date(createdAt), new Date(), { locale: es }),
    en: formatRelative(new Date(createdAt), new Date()),
  };

  const certfToken = certificate?.preview_url && certificate.preview_url?.split('/')?.pop();
  const { socials, shareLink: certfLink } = useSocialShare({
    info: certfToken,
    type: 'certificate',
    shareMessage: t('share-certificate.shareMessage', { profession: certificate.specialty.name }),
  });

  return (
    <Box
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems="center"
      gridGap="26px"
      border="1px solid"
      borderColor={borderColor2}
      p="23px 28px"
      borderRadius="18px"
    >
      <Box display="flex" gridGap="26px">
        <Box padding="13.5px 10.5px" height="fit-content" backgroundColor="blue.light" borderRadius="35px">
          <Icon icon="certificate" width="24px" height="24px" style={{ marginBottom: '-8px' }} />
        </Box>
        <Box display="flex" flexDirection="column">
          <Text size="l" fontWeight="400">
            {dateCreated[lang]}
          </Text>
          <Text size="l" fontWeight="700">
            {certificate.specialty.name}
          </Text>
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" gridGap="18px">
        <Tooltip placement="top" isDisabled={certfToken !== null} label={t('certificate-preview-not-available')}>
          <Link
            href={certfLink}
            variant="buttonDefault"
            outline
            colorScheme="blue.default"
            disabled={!certfToken}
            textTransform="uppercase"
            target={certfToken ? '_blank' : '_self'}
            rel="noopener noreferrer"
            fontSize="13px"
          >
            {t('view-certificate')}
          </Link>
        </Tooltip>
        <ShareButton
          withParty
          title={t('share-certificate.title')}
          shareText={t('share-certificate.shareText')}
          link={certfLink}
          socials={socials}
        />
      </Box>
    </Box>
  );
}

CertificateItem.propTypes = {
  certificate: PropTypes.shape({
    created_at: PropTypes.string.isRequired,
    preview_url: PropTypes.string,
    specialty: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

// Componente principal Certificates
function Certificates({ certificates }) {
  const { t } = useTranslation('profile');

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
      {Array.isArray(certificates) && certificates.map((certificate) => (
        <CertificateItem
          key={`${certificate.created_at} - ${certificate.specialty.name}`}
          certificate={certificate}
        />
      ))}
      {Array.isArray(certificates) && certificates.length === 0 && (
        <Text fontSize="15px" fontWeight="400" pb="6px">
          {t('no-certificates')}
        </Text>
      )}
    </>
  );
}

Certificates.propTypes = {
  certificates: PropTypes.arrayOf(PropTypes.shape({
    created_at: PropTypes.string.isRequired,
    preview_url: PropTypes.string,
    specialty: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  })),
};

Certificates.defaultProps = {
  certificates: [],
};

export default Certificates;
