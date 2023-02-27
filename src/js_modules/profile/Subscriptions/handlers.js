import { useState } from 'react';

const profileHandlers = () => {
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);

  const statusLabel = {
    active: 'Active',
    expired: 'Expired',
    canceled: 'Canceled',
    completed: 'Completed',
  };
  const statusStyles = {
    active: {
      color: 'green.400',
      background: 'green.light',
    },
    expired: {
      color: 'black',
      background: 'transparent',
      border: '1px solid',
    },
    canceled: {
      color: 'white',
      background: 'gray.default',
    },
    completed: {
      color: 'blue.default',
      border: '1px solid #0097CD',
    },
  };

  const onOpenCancel = () => setCancelModalIsOpen(true);
  const onCloseCancel = () => setCancelModalIsOpen(false);

  return {
    statusStyles,
    statusLabel,
    cancelModalIsOpen,
    getLocaleDate: (date) => {
      const newDate = new Date(date);
      return newDate.toLocaleDateString();
    },
    onOpenCancel,
    onCloseCancel,
    durationFormated: (format) => {
      const duration = format?.duration;
      if (duration?.month > 0) return `${duration?.month} months`;
      if (duration?.days > 7) return `${duration?.days} days`;
      if (duration?.days <= 7) return `${duration?.days > 1 ? 'days' : 'day'} ${duration?.hours > 0 ? `and ${duration?.hours} hours` : ''}`;
      return format?.formated;
    },
    subscriptionHandler: (isRenewable) => {
      if (isRenewable) {
        return {
          text: 'Cancel subscription',
          style: {
            variant: 'link',
          },
          open: onOpenCancel,
        };
      }
      return {
        text: 'Upgrade subscription',
        style: {
          variant: 'outline',
          color: 'blue.default',
          borderColor: 'currentColor',
          fontWeight: 700,
        },
        open: () => {},
      };
    },
    payUnitString: (payUnit) => {
      if (payUnit === 'MONTH') return 'Monthly';
      if (payUnit === 'HALF') return 'Half Year';
      if (payUnit === 'QUARTER') return 'Quarterly';
      if (payUnit === 'YEAR') return 'Yearly';
      return payUnit;
    },
  };
};

export default profileHandlers;
