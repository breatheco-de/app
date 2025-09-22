import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

const useSocialShare = ({ info, type = 'task', shareMessage }) => {
  const { t } = useTranslation('profile');
  const router = useRouter();

  const pathConnector = {
    lesson: router.locale === 'en' ? '4geeks.com/lesson' : `4geeks.com/${router.locale}/lesson`,
    practice: router.locale === 'en' ? '4geeks.com/interactive-exercise' : `4geeks.com/${router.locale}/interactive-exercise`,
    project: router.locale === 'en' ? '4geeks.com/interactive-coding-tutorial' : `4geeks.com/${router.locale}/interactive-coding-tutorial`,
    answer: 'https://assessment.4geeks.com/quiz',
  };
  const createLink = (creationType) => {
    if (info?.associated_slug && creationType === 'task') {
      return `${pathConnector[info?.task_type?.toLowerCase()]}/${info.associated_slug}`;
    }
    if (creationType === 'certificate') {
      return `https://certificate.4geeks.com/${info}`;
    }
    if (creationType === 'referral') {
      return info;
    }
    return '';
  };

  const link = createLink(type);

  const getSocials = () => {
    const baseSocials = [
      {
        name: 'x',
        label: 'X',
        href: `https://x.com/share?url=${link}&text=${encodeURIComponent(shareMessage || t('common:default-share-message'))} %23100DaysOfCode%0A%0A`,
        color: '#000',
      },
      {
        name: 'linkedin',
        label: 'LinkedIn',
        href: `https://linkedin.com/sharing/share-offsite/?url=${link}&text=${encodeURIComponent(shareMessage || t('common:default-share-message'))}`,
        color: '#0077B5',
        target: 'popup',
      },
      {
        name: 'facebook',
        label: 'Facebook',
        href: `https://facebook.com/sharer?u=${link}&title=${encodeURIComponent(shareMessage || t('common:default-share-message'))}`,
        color: '#4267B2',
      },
    ];

    return baseSocials;
  };

  return {
    socials: getSocials(),
    shareLink: link,
  };
};

export default useSocialShare;
