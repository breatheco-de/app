import { loadStripe } from '@stripe/stripe-js';
import bc from '../services/breathecode';

const stripePromiseMap = {};

export const getStripe = (academyId) => {
  if (!stripePromiseMap[academyId]) {
    stripePromiseMap[academyId] = bc
      .payment({ academy: academyId })
      .getStripePublishableKey()
      .then((response) => {
        const publishableKey = response?.data?.stripe_publishable_key;

        if (!publishableKey) {
          return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        }

        return loadStripe(publishableKey);
      });
  }

  return stripePromiseMap[academyId];
};
