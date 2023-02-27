import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import useStyle from '../../../common/hooks/useStyle';

const profileHandlers = () => {
  const { t } = useTranslation('profile');
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const { reverseFontColor, fontColor, lightColor } = useStyle();

  const statusLabel = {
    free_trial: t('subscription.status.free_trial'),
    fully_paid: t('subscription.status.fully_paid'),
    active: t('subscription.status.active'),
    expired: t('subscription.status.expired'),
    canceled: t('subscription.status.canceled'),
    completed: t('subscription.status.completed'),
  };
  const statusStyles = {
    free_trial: {
      color: fontColor,
      border: '1px solid',
      borderColor: lightColor,
    },
    fully_paid: {
      color: 'green.400',
      background: 'green.light',
    },
    active: {
      color: 'green.400',
      background: 'green.light',
    },
    expired: {
      color: fontColor,
      background: 'transparent',
      border: '1px solid',
    },
    canceled: {
      color: reverseFontColor,
      background: 'gray.default',
    },
    completed: {
      color: 'blue.default',
      border: '1px solid',
      borderColor: 'blue.default',
    },
  };

  const onOpenCancelSubscription = () => setCancelModalIsOpen(true);
  const onCloseCancelSubscription = () => setCancelModalIsOpen(false);

  const onOpenUpgrade = () => setUpgradeModalIsOpen(true);
  const onCloseUpgrade = () => setUpgradeModalIsOpen(false);

  return {
    statusStyles,
    statusLabel,
    cancelModalIsOpen,
    upgradeModalIsOpen,
    getLocaleDate: (date) => {
      const newDate = new Date(date);
      return newDate.toLocaleDateString();
    },
    durationFormated: (format) => {
      const duration = format?.duration;
      const days = duration?.days;
      const hours = duration?.hours;

      if (duration?.month > 0) return `${duration?.month} ${t('months')}`;
      if (days === 0 && hours > 0) return `${hours}h ${t('and')} ${duration?.minutes}min`;
      if (days > 7) return `${days} ${t('days')}`;
      if (days <= 7) return `${days} ${days > 1 ? t('days') : t('day')} ${duration?.hours > 0 ? `${t('and')} ${duration?.hours} ${t('hours')}` : ''}`;
      return format?.formated;
    },
    subscriptionHandler: (isRenewable) => {
      if (isRenewable) {
        return {
          text: t('subscription.cancel'),
          style: {
            variant: 'link',
          },
          open: onOpenCancelSubscription,
          close: onCloseCancelSubscription,
        };
      }
      return {
        text: t('subscription.upgrade'),
        style: {
          variant: 'outline',
          color: 'blue.default',
          borderColor: 'currentColor',
          fontWeight: 700,
        },
        open: onOpenUpgrade,
        close: onCloseUpgrade,
      };
    },
    payUnitString: (payUnit) => {
      if (payUnit === 'MONTH') return t('monthly');
      if (payUnit === 'HALF') return t('half-year');
      if (payUnit === 'QUARTER') return t('quarterly');
      if (payUnit === 'YEAR') return t('yearly');
      return payUnit;
    },
  };
};

export default profileHandlers;
