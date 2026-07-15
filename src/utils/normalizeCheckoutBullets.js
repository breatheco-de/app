import { slugToTitle } from './index';

/**
 * Normalize checkout plan bullets from PlanFeatures (title/description)
 * or legacy service-item / locales shapes into AccordionList items.
 *
 * @param {Array} items
 * @returns {{ title: string, description: string }[]}
 */
export default function normalizeCheckoutBullets(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  return items.map((info) => {
    if (!info || typeof info !== 'object') {
      return { title: '', description: '' };
    }

    const hasLegacyShape = Array.isArray(info.features) || Boolean(info.service);
    if (hasLegacyShape) {
      return {
        title: info.features?.[0]?.title || slugToTitle(info.service?.slug) || '',
        description: info.features?.[0]?.description || '',
      };
    }

    return {
      title: info.title || '',
      description: info.description || '',
    };
  });
}
