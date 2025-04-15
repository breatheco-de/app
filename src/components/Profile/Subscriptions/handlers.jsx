/* eslint-disable no-unsafe-optional-chaining */
import useTranslation from 'next-translate/useTranslation';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import useStyle from '../../../hooks/useStyle';
import { currenciesSymbols } from '../../../utils/variables';

function profileHandlers() {
  const { t, lang } = useTranslation('profile');
  const { reverseFontColor, fontColor, lightColor } = useStyle();

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    return format(parsedDate, 'dd MMM yy', { locale: lang === 'en' || lang === 'us' ? enUS : es });
  };

  const statusLabel = {
    free_trial: t('subscription.status.free_trial'),
    fully_paid: t('subscription.status.fully_paid'),
    active: t('subscription.status.active'),
    expired: t('subscription.status.expired'),
    payment_issue: t('subscription.status.payment_issue'),
    cancelled: t('subscription.status.cancelled'),
    completed: t('subscription.status.completed'),
    error: t('subscription.status.error'),
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
    error: {
      color: fontColor,
      background: 'transparent',
      border: '1px solid',
    },
    payment_issue: {
      color: 'danger',
      background: 'red.light',
    },
    cancelled: {
      color: reverseFontColor,
      background: 'gray.default',
    },
    completed: {
      color: 'blue.default',
      border: '1px solid',
      borderColor: 'blue.default',
    },
  };

  return {
    statusStyles,
    statusLabel,
    getSubscriptionDetails: (sub) => {
      const status = sub?.status?.toLowerCase();
      const isPlanFinancing = sub?.type === 'plan_financing';
      const fullFilledInvoicesAmount = sub?.invoices?.filter((invo) => invo.status === 'FULFILLED').length;
      const isPlanFinancingFullyPaid = fullFilledInvoicesAmount === sub?.how_many_installments;
      const nextPaymentDate = formatDate(sub?.next_payment_at);
      const expirationDate = formatDate(sub?.plan_expires_at || sub?.next_payment_at);
      const activeSince = formatDate(sub?.created_at);
      const subCurrency = currenciesSymbols[sub?.currency?.code] || '$';
      const invoiceAmount = sub?.invoices[0]?.amount;
      const monthlyPrice = sub?.monthly_price;
      const totalPrice = sub?.how_many_installments * monthlyPrice;
      const payEveryUnit = sub?.pay_every_unit;
      const statusMessage = sub?.status_message;
      const paymentText = (amount, date) => t('subscription.next-payment-with-price', { amount, date, currencySymbol: subCurrency });
      const renewalDateText = (date) => t('subscription.renewal-date', { date });
      const expirationDateText = (date) => t('subscription.expiration-date', { date });
      const expiredOnText = (date) => t('subscription.expired-on', { date });
      const activeSinceText = (date) => t('subscription.active-since', { date });
      const totallyPaidText = (amount) => t('subscription.totally-paid', { amount, currencySymbol: subCurrency });
      const totalPaidText = (paidAmount, pendingAmount) => t('subscription.total-paid', { paidAmount, pendingAmount, currencySymbol: subCurrency });
      const paymentInfoText = (amount, unit) => t('subscription.payment', { payment: `${subCurrency}${amount}/${t(`subscription.payment_unit_short.${unit.toLowerCase()}`)}` });
      const errorMessageText = (error) => t('subscription.error-message', { error: error || 'Something went wrong' });
      const noPaymentsLeft = () => t('subscription.no-payment-left');

      // Use the functions in statusConfig
      const statusConfig = {
        active: () => {
          if (isPlanFinancing) {
            return {
              renewalDate: expirationDateText(expirationDate),
              paymentInfo: isPlanFinancingFullyPaid
                ? totallyPaidText(fullFilledInvoicesAmount * monthlyPrice)
                : totalPaidText(fullFilledInvoicesAmount * monthlyPrice, totalPrice),
              nextPayment: isPlanFinancingFullyPaid ? noPaymentsLeft() : paymentText(monthlyPrice, nextPaymentDate),
            };
          }
          return {
            renewalDate: renewalDateText(nextPaymentDate),
            renewability: activeSince ? activeSinceText(activeSince) : false,
            paymentInfo: invoiceAmount === 0 ? t('subscription.payment', { payment: t('common:free') }) : paymentInfoText(invoiceAmount, payEveryUnit),
          };
        },
        expired: () => ({
          renewalDate: expiredOnText(expirationDate),
          paymentInfo: isPlanFinancing ? totallyPaidText(fullFilledInvoicesAmount * monthlyPrice) : paymentInfoText(invoiceAmount, payEveryUnit),
        }),
        error: () => ({
          errorMessage: errorMessageText(statusMessage),
          paymentInfo: invoiceAmount ? paymentInfoText(invoiceAmount, payEveryUnit) : 'Error',
        }),
        payment_issue: () => {
          if (isPlanFinancing) {
            return {
              renewalDate: expirationDateText(expirationDate),
              nextPayment: isPlanFinancingFullyPaid ? noPaymentsLeft() : paymentText(monthlyPrice, nextPaymentDate),
              paymentInfo: isPlanFinancingFullyPaid ? totallyPaidText(monthlyPrice) : totalPaidText(fullFilledInvoicesAmount * monthlyPrice, totalPrice),
            };
          }
          return {
            errorMessage: errorMessageText(statusMessage),
            paymentInfo: paymentInfoText(invoiceAmount, payEveryUnit),
          };
        },
        cancelled: () => {
          if (isPlanFinancing) {
            return {
              renewalDate: expirationDateText(expirationDate),
              nextPayment: isPlanFinancingFullyPaid ? noPaymentsLeft() : paymentText(monthlyPrice, nextPaymentDate),
              paymentInfo: isPlanFinancingFullyPaid ? totallyPaidText(monthlyPrice) : totalPaidText(fullFilledInvoicesAmount * monthlyPrice, totalPrice),
            };
          }
          return {
            paymentInfo: paymentInfoText(invoiceAmount, payEveryUnit),
          };
        },
        free_trial: () => ({
          renewalDate: renewalDateText(nextPaymentDate),
          renewability: activeSince ? activeSinceText(activeSince) : false,
          paymentInfo: t('subscription.payment', { payment: t('common:free') }),
        }),
      };

      return statusConfig[status] ? statusConfig[status]() : {
        renewalDate: '',
        paymentInfo: '',
        nextPayment: '',
        errorMessage: '',
        renewability: '',
      };
    },
  };
}

export default profileHandlers;
