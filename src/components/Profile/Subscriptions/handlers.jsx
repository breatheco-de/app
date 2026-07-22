/* eslint-disable no-unsafe-optional-chaining */
import useTranslation from 'next-translate/useTranslation';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import useStyle from '../../../hooks/useStyle';
import { currenciesSymbols } from '../../../utils/variables';

const AMOUNT_DIFF_THRESHOLD = 0.01;

function getLatestInvoice(invoices = []) {
  if (!invoices?.length) return null;
  const fulfilled = invoices.filter((invo) => invo.status === 'FULFILLED');
  const pool = fulfilled.length ? fulfilled : invoices;
  return pool.reduce((latest, invoice) => {
    if (!latest) return invoice;
    const latestPaid = latest?.paid_at ? new Date(latest.paid_at).getTime() : 0;
    const invoicePaid = invoice?.paid_at ? new Date(invoice.paid_at).getTime() : 0;
    if (invoicePaid > latestPaid) return invoice;
    if (invoicePaid === latestPaid && (invoice?.id || 0) > (latest?.id || 0)) return invoice;
    return latest;
  }, null);
}

function formatAmount(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return amount;
  return amount.toFixed(2);
}

function profileHandlers() {
  const { t, lang } = useTranslation('profile');
  const { reverseFontColor, fontColor, lightColor } = useStyle();

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    return format(parsedDate, 'dd MMM, yyyy', { locale: lang === 'en' || lang === 'us' ? enUS : es });
  };

  const statusLabel = (subscription) => {
    const status = subscription?.status?.toLowerCase();
    const now = new Date();
    const isCancelledButValid = status === 'cancelled' && subscription && (
      (subscription.valid_until && new Date(subscription.valid_until) > now)
      || (subscription.next_payment_at && new Date(subscription.next_payment_at) > now)
    );

    const labels = {
      free_trial: t('subscription.status.free_trial'),
      fully_paid: t('subscription.status.fully_paid'),
      active: t('subscription.status.active'),
      expired: t('subscription.status.expired'),
      payment_issue: t('subscription.status.payment_issue'),
      cancelled: isCancelledButValid
        ? t('subscription.status.is_cancelled_but_valid', { date: format(new Date(subscription.valid_until || subscription.next_payment_at), 'dd MMM yyyy', { locale: lang === 'es' ? es : enUS }) })
        : t('subscription.status.cancelled'),
      completed: t('subscription.status.completed'),
      error: t('subscription.status.error'),
    };

    return labels[status] || 'unknown';
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
    formatDate,
    getSubscriptionDetails: (sub) => {
      const status = sub?.status?.toLowerCase();
      const isPlanFinancing = sub?.type === 'plan_financing';
      const fullFilledInvoicesAmount = sub?.invoices?.filter((invo) => invo.status === 'FULFILLED').length;
      const isPlanFinancingFullyPaid = fullFilledInvoicesAmount === sub?.how_many_installments;
      const nextPaymentDate = formatDate(sub?.next_payment_at);
      const expirationDate = formatDate(sub?.plan_expires_at || sub?.next_payment_at);
      const activeSince = formatDate(sub?.created_at);
      const latestInvoice = getLatestInvoice(sub?.invoices);
      const currencyCode = sub?.currency?.code || latestInvoice?.currency?.code;
      const subCurrency = currenciesSymbols[currencyCode] || '$';
      const invoiceAmount = latestInvoice?.amount;
      const formattedInvoiceAmount = formatAmount(invoiceAmount);
      const nextRenewalAmount = sub?.next_renewal_amount;
      const formattedNextRenewalAmount = formatAmount(nextRenewalAmount);
      const monthlyPrice = sub?.monthly_price;
      const totalPrice = sub?.how_many_installments * monthlyPrice;
      const payEveryUnit = sub?.pay_every_unit;
      const statusMessage = sub?.status_message;
      const paymentText = (amount, date) => t('subscription.next-payment-with-price', { amount, date, currencySymbol: subCurrency });
      const renewalDateText = (date) => t('subscription.renewal-date', { date });
      const expirationDateText = (date) => t('subscription.expiration-date', { date });
      const expiredOnText = (date) => t('subscription.expired-on', { date });
      const activeSinceText = (date) => t('subscription.active-since', { date });
      const totallyPaidText = (amount) => t('subscription.totally-paid', { amount: amount.toFixed(2), currencySymbol: subCurrency });
      const totalPaidText = (paidAmount, pendingAmount) => t('subscription.total-paid', { paidAmount, pendingAmount, currencySymbol: subCurrency });
      const paymentInfoText = (amount, unit) => (amount ? t('subscription.payment', { payment: `${subCurrency}${amount}/${t(`signup:payment_unit_short.${unit.toLowerCase()}`)}` }) : false);
      const errorMessageText = (error) => t('subscription.error-message', { error: error || 'Something went wrong' });
      const noPaymentsLeft = () => t('subscription.no-payment-left');

      const amountsDiffer = (
        typeof invoiceAmount === 'number'
        && typeof nextRenewalAmount === 'number'
        && Math.abs(invoiceAmount - nextRenewalAmount) > AMOUNT_DIFF_THRESHOLD
      );

      const getSubscriptionRecurringDetails = ({ includeNextPayment = true, includeRenewalDate = true } = {}) => {
        const paymentInfo = invoiceAmount === 0
          ? t('subscription.payment', { payment: t('common:free') })
          : paymentInfoText(formattedInvoiceAmount, payEveryUnit);

        const showNextPayment = includeNextPayment
          && typeof nextRenewalAmount === 'number'
          && nextRenewalAmount > 0
          && Boolean(sub?.next_payment_at);

        return {
          renewalDate: includeRenewalDate ? renewalDateText(nextPaymentDate) : false,
          renewability: activeSince ? activeSinceText(activeSince) : false,
          paymentInfo,
          nextPayment: showNextPayment ? paymentText(formattedNextRenewalAmount, nextPaymentDate) : false,
          paymentDifferenceNote: showNextPayment && amountsDiffer
            ? t('subscription.payment-difference-note')
            : false,
        };
      };

      // Use the functions in statusConfig
      const statusConfig = {
        fully_paid: () => {
          if (isPlanFinancing) {
            return {
              renewalDate: expirationDateText(expirationDate),
              paymentInfo: isPlanFinancingFullyPaid
                ? totallyPaidText(fullFilledInvoicesAmount * monthlyPrice)
                : totalPaidText(fullFilledInvoicesAmount * monthlyPrice, totalPrice),
              nextPayment: isPlanFinancingFullyPaid ? noPaymentsLeft() : paymentText(monthlyPrice, nextPaymentDate),
            };
          }
          return getSubscriptionRecurringDetails();
        },
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
          return getSubscriptionRecurringDetails();
        },
        expired: () => ({
          renewalDate: expiredOnText(expirationDate),
          paymentInfo: isPlanFinancing ? totallyPaidText(fullFilledInvoicesAmount * monthlyPrice) : paymentInfoText(formattedInvoiceAmount, payEveryUnit),
        }),
        error: () => ({
          errorMessage: errorMessageText(statusMessage),
          paymentInfo: invoiceAmount ? paymentInfoText(formattedInvoiceAmount, payEveryUnit) : 'Error',
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
            ...getSubscriptionRecurringDetails({ includeRenewalDate: false }),
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
            paymentInfo: paymentInfoText(formattedInvoiceAmount, payEveryUnit),
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
        paymentDifferenceNote: '',
      };
    },
  };
}

export default profileHandlers;
