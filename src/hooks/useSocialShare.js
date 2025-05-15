import useTranslation from 'next-translate/useTranslation';

const useSocialShare = ({ link, title, type = 'default', shareMessage }) => {
  const { t } = useTranslation('profile');

  const getSocials = () => {
    const baseSocials = [
      {
        name: 'x',
        label: 'X',
        href: `https://x.com/share?url=&text=${encodeURIComponent(shareMessage || t('common:default-share-message'))} %23100DaysOfCode%0A%0A${link}`,
        color: '#000',
      },
      {
        name: 'linkedin',
        label: 'LinkedIn',
        href: `https://linkedin.com/sharing/share-offsite/?url=${link}`,
        color: '#0077B5',
        target: 'popup',
      },
      {
        name: 'facebook',
        label: 'Facebook',
        href: `https://facebook.com/sharer?u=${link}`,
        color: '#4267B2',
      },
    ];

    // Si es un certificado, usamos la configuración específica de certificados
    if (type === 'certificate') {
      return t('share-certificate.socials', { certfLink: link, profession: title }, { returnObjects: true });
    }

    return baseSocials;
  };

  return {
    socials: getSocials(),
  };
};

export default useSocialShare;
