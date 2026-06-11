import bc from '../services/breathecode';
import { isWhiteLabelAcademy, WHITE_LABEL_ACADEMY } from '../utils/variables';

/**
 * White label pre-check: custom domain and WHITE_LABEL_ACADEMY env var.
 */
export const isWhiteLabelConfigured = () => (
  isWhiteLabelAcademy && Boolean(WHITE_LABEL_ACADEMY)
);

/**
 * Loads academy data when white label is fully configured and academy_features exist.
 * Used by WhiteLabelContext at runtime.
 */
export const fetchWhiteLabelAcademy = async () => {
  if (!isWhiteLabelConfigured()) return null;

  try {
    const { data } = await bc.admissions().getAcademy(WHITE_LABEL_ACADEMY);
    if (!data?.academy_features) return null;
    return data;
  } catch (err) {
    console.error('Failed to fetch white label academy:', err);
    return null;
  }
};
