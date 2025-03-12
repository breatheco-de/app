import useTranslation from 'next-translate/useTranslation';

const usePlanMktInfo = () => {
  const { t } = useTranslation('signup');

  const getPlanFeatures = async (plans) => {
    if (!plans?.length) return [];

    return plans.map((plan) => {
      try {
        const customFeatures = t(`plans/${plan?.plan_slug}:info`, {}, { returnObjects: true });
        const defaultFreeMktInfo = t('pricing.basic-plan', {}, { returnObjects: true });
        const defaultPaymentMktInfo = t('pricing.premium-plan', {}, { returnObjects: true });

        const isValidCustomFeatures = typeof customFeatures !== 'string';
        const defaultUsedMktInfo = plan?.price > 0 ? defaultPaymentMktInfo : defaultFreeMktInfo;
        const showedMktInfo = isValidCustomFeatures ? customFeatures : defaultUsedMktInfo;

        return {
          ...plan,
          ...showedMktInfo,
        };
      } catch (error) {
        console.error(`Failed to load plan info for ${plan?.plan_slug}:`, error);
        const defaultUsedMktInfo = plan?.price > 0
          ? t('pricing.premium-plan', {}, { returnObjects: true })
          : t('pricing.basic-plan', {}, { returnObjects: true });

        return {
          ...plan,
          ...defaultUsedMktInfo,
        };
      }
    });
  };

  return { getPlanFeatures };
};

export default usePlanMktInfo;
